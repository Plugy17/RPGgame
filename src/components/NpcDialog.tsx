import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { ITEMS } from '../data/items';
import { QUESTS } from '../data/quests';
import { IconQuest, IconSword, IconGold, IconWood, IconOre, IconHerb, IconHelmet, IconArmor, IconBoots, IconSkinFire, IconSkinIce, IconMagic, IconBow } from './GameIcons';
import { playSfx } from '../audio/sfx';

const RESOURCE_ICONS: Record<string, React.FC<{ size?: number }>> = {
  wood: IconWood, ore: IconOre, gold: IconGold, herb: IconHerb,
  health_potion: IconHerb, xp_potion: IconMagic, gather_potion: IconHerb,
};

const WEAPON_ICONS: Record<string, React.FC<{ size?: number }>> = {
  sword: IconSword, axe: IconSword, bow: IconBow, crossbow: IconBow, staff: IconMagic, rune: IconMagic,
};

const DARIUS_PRICES: Record<string, number> = { wood: 3, ore: 6, gold: 12, herb: 4 };

const DARIUS_ITEMS: { itemId: string; priceGold: number }[] = [
  { itemId: 'iron_helmet', priceGold: 80 }, { itemId: 'iron_chestplate', priceGold: 120 },
  { itemId: 'iron_boots', priceGold: 60 }, { itemId: 'iron_sword', priceGold: 100 },
  { itemId: 'skin_ice', priceGold: 500 }, { itemId: 'skin_fire', priceGold: 500 },
];

const ALCHEMIST_ITEMS: { itemId: string; priceGold: number }[] = [
  { itemId: 'health_potion', priceGold: 30 }, { itemId: 'xp_potion', priceGold: 80 },
  { itemId: 'gather_potion', priceGold: 50 },
];

const ARMORER_ITEMS: { itemId: string; priceGold: number }[] = [
  { itemId: 'battle_axe', priceGold: 200 }, { itemId: 'crossbow', priceGold: 150 },
  { itemId: 'apprentice_staff', priceGold: 60 }, { itemId: 'rune_crystal', priceGold: 120 },
  { itemId: 'wooden_bow', priceGold: 40 },
];

const TAVERN_RUMORS = [
  { ru: 'Говорят, в Ледяном Озере скрыт древний артефакт...', en: 'They say an ancient artifact is hidden in the Frozen Lake...' },
  { ru: 'В Руинах Древних видели тени прошлой ночью.', en: 'Shadows were seen in the Ancient Ruins last night.' },
  { ru: 'Кто-то видел дракона над Драконьими Горами!', en: 'Someone spotted a dragon over the Dragon Mountains!' },
  { ru: 'Тавернщик слышал, что Трон Азерии проклят...', en: 'The barkeep heard the Throne of Azeria is cursed...' },
];

const T = {
  ru: {
    galahad: { title:'Верховный Маг Галахад', sub:'Странник, Азерия нуждается в тебе!', accept:'Принять квест', complete:'Завершить квест',
               noQuest:'У меня пока нет заданий для тебя. Продолжай набирать опыт.', questAvailable:'Доступный квест',
               questProgress:'Текущий квест', goGather:'Отправляйся добывать ресурсы!' },
    darius:  { title:'Купец Дариус', sub:'Лучшие товары в Цитадели!', sell:'Продать', each:'за шт.',
               noResources:'Нет ресурсов для продажи.', buy:'Купить', notEnough:'Мало золота', bought:'Куплено!', sold:'Продано!' },
    alchemist:{ title:'Алхимик Элара', sub:'Зелья на любой вкус!', buy:'Купить', notEnough:'Мало золота', bought:'Куплено!' },
    armorer: { title:'Кузнец Торвин', sub:'Лучшее оружие и доспехи!', buy:'Купить', notEnough:'Мало золота', bought:'Куплено!' },
    tavern:  { title:'Тавернщик Хильда', sub:'Слухи и секреты Азерии...' },
    alliance_m:{ title:'Мастер Альянсов Рик', sub:'Сила в единстве!' },
    arena_m: { title:'Глава Арены Кайл', sub:'Дуэли — путь к славе!', duel:'Вызвать на дуэль' },
  },
  en: {
    galahad: { title:'Archmage Galahad', sub:'Traveler, Azeria needs you!', accept:'Accept Quest', complete:'Complete Quest',
               noQuest:'I have no tasks for you yet. Keep gaining experience.', questAvailable:'Available Quest',
               questProgress:'Current Quest', goGather:'Go gather resources!' },
    darius:  { title:'Merchant Darius', sub:'Best goods in the Citadel!', sell:'Sell', each:'ea.',
               noResources:'No resources to sell.', buy:'Buy', notEnough:'Not enough gold', bought:'Bought!', sold:'Sold!' },
    alchemist:{ title:'Alchemist Elara', sub:'Potions for every occasion!', buy:'Buy', notEnough:'Not enough gold', bought:'Bought!' },
    armorer: { title:'Armorer Thorvin', sub:'Best weapons and armor!', buy:'Buy', notEnough:'Not enough gold', bought:'Bought!' },
    tavern:  { title:'Tavernkeep Hilda', sub:'Rumors and secrets of Azeria...' },
    alliance_m:{ title:'Alliance Master Rick', sub:'Strength in unity!' },
    arena_m: { title:'Arena Master Kael', sub:'Duels — the path to glory!', duel:'Challenge to Duel' },
  },
};

const getItemIcon = (itemId: string, def: typeof ITEMS[string]) => {
  if (def.slot === 'skin') return itemId === 'skin_ice' ? <IconSkinIce size={24} /> : <IconSkinFire size={24} />;
  if (def.slot === 'head') return <IconHelmet size={24} />;
  if (def.slot === 'body') return <IconArmor size={24} />;
  if (def.slot === 'legs') return <IconBoots size={24} />;
  if (def.weaponTag && WEAPON_ICONS[def.weaponTag]) return React.createElement(WEAPON_ICONS[def.weaponTag], { size: 24 });
  return <IconSword size={24} />;
};

export const NpcDialog: React.FC<{ npcId: string; onClose: () => void }> = ({ npcId, onClose }) => {
  const { inventory, language, goldBalance, addInventoryItem, removeInventoryItem, addGold, setGoldBalance,
          questProgress, activeQuestId, startQuest, completeHubQuest, claimQuestReward, advanceQuest,
          setScreen, startDuel } = useGameStore();
  const [toast, setToast] = useState<string | null>(null);
  const t = T[language];
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2000); };

  const npcKey = npcId === 'galahad' ? 'galahad' :
                 npcId === 'darius' ? 'darius' :
                 npcId === 'alchemist' ? 'alchemist' :
                 npcId === 'armorer' ? 'armorer' :
                 npcId === 'tavern' ? 'tavern' :
                 npcId === 'alliance_m' ? 'alliance_m' : 'arena_m';

  const npcT = t[npcKey as keyof typeof t] as { title: string; sub: string; [k: string]: string };

  // Galahad logic
  const hubQuests = QUESTS.filter(q => q.type === 'talk' && q.condition.npcId === 'galahad');
  const nextHubQuest = hubQuests.find(q => {
    const qp = questProgress.find(p => p.questId === q.id);
    return qp && !qp.claimed;
  });
  const activeHubQP = activeQuestId ? questProgress.find(q => q.questId === activeQuestId) : null;
  const activeHubQDef = activeQuestId ? QUESTS.find(q => q.id === activeQuestId) : null;

  // Darius logic
  const resources = inventory.filter(i => ITEMS[i.itemId]?.slot === 'resource' && DARIUS_PRICES[i.itemId]);

  const handleSellResource = (instanceId: string, itemId: string, qty: number) => {
    const price = (DARIUS_PRICES[itemId] ?? 2) * qty;
    removeInventoryItem(instanceId, qty);
    addGold(price);
    playSfx('coin');
    if (activeQuestId) {
      const q = QUESTS.find(q2 => q2.id === activeQuestId);
      if (q?.type === 'gather' && q.condition.resource === itemId) advanceQuest(activeQuestId);
    }
    showToast(`+${price} gold`);
  };

  const handleBuyGear = (itemId: string, priceGold: number) => {
    if (goldBalance < priceGold) { showToast(`❌ ${npcT.notEnough}`); return; }
    setGoldBalance(goldBalance - priceGold);
    addInventoryItem(itemId, 1);
    playSfx('coin');
    showToast(`✅ ${npcT.bought}`);
  };

  const handleAcceptQuest = (questId: string) => {
    startQuest(questId);
    completeHubQuest(questId);
    playSfx('quest_complete');
    showToast(language === 'ru' ? 'Квест принят!' : 'Quest accepted!');
  };

  const handleCompleteQuest = (questId: string) => {
    completeHubQuest(questId);
    claimQuestReward(questId);
    playSfx('levelup');
    showToast(language === 'ru' ? 'Квест завершён!' : 'Quest completed!');
  };

  const renderGalhad = () => (
    <>
      {activeHubQDef && activeHubQP && !activeHubQP.claimed && activeHubQDef.type !== 'talk' && (
        <div className="bg-dark-800 rounded-xl p-3 border border-primary-500/30 mb-3">
          <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">{t.galahad.questProgress}</p>
          <p className="text-white/90 text-sm font-medium font-almendra">{language === 'ru' ? activeHubQDef.name : activeHubQDef.nameEn}</p>
          <div className="w-full h-1.5 bg-dark-700 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-primary-400 rounded-full" style={{ width: `${(activeHubQP.progress / activeHubQDef.required) * 100}%` }} />
          </div>
          <p className="text-white/30 text-[10px] mt-1">{activeHubQP.progress}/{activeHubQDef.required}</p>
          {activeHubQP.completed && !activeHubQP.claimed && (
            <button onClick={() => handleCompleteQuest(activeQuestId!)}
              className="mt-2 w-full bg-accent-500 text-dark-800 font-cinzel font-bold py-2 rounded-lg text-sm active:scale-95">
              {t.galahad.complete}
            </button>
          )}
          {!activeHubQP.completed && (
            <p className="text-primary-300 text-xs mt-2">{t.galahad.goGather}</p>
          )}
        </div>
      )}
      {nextHubQuest && (() => {
        const qp = questProgress.find(p => p.questId === nextHubQuest.id);
        if (!qp || qp.claimed) return null;
        const isGatherFollowUp = nextHubQuest.type === 'gather';
        if (isGatherFollowUp && !qp.completed) return null;
        if (nextHubQuest.type === 'talk' && !qp.claimed) {
          return (
            <div className="bg-dark-800 rounded-xl p-3 border border-accent-500/30">
              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">{t.galahad.questAvailable}</p>
              <div className="flex items-center gap-2">
                <IconQuest size={20} glow />
                <div className="flex-1">
                  <p className="text-white/90 text-sm font-almendra font-medium">{language === 'ru' ? nextHubQuest.name : nextHubQuest.nameEn}</p>
                  <p className="text-white/40 text-xs">{language === 'ru' ? nextHubQuest.description : nextHubQuest.descriptionEn}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-1 text-xs">
                <span className="text-primary-400">+{nextHubQuest.reward.xp} XP</span>
                <span className="text-accent-400">+{nextHubQuest.reward.gold ?? 0} gold</span>
                {nextHubQuest.unlocksLocationId && (
                  <span className="text-secondary-400">
                    {language === 'ru' ? 'Открывает:' : 'Unlocks:'} {nextHubQuest.unlocksLocationId}
                  </span>
                )}
              </div>
              <button onClick={() => handleAcceptQuest(nextHubQuest.id)}
                className="mt-2 w-full bg-primary-500 text-dark-800 font-cinzel font-bold py-2 rounded-lg text-sm active:scale-95">
                {t.galahad.accept}
              </button>
            </div>
          );
        }
        return null;
      })()}
      {!nextHubQuest && !(activeHubQDef && !activeHubQP?.claimed && activeHubQDef.type !== 'talk') && (
        <p className="text-white/30 text-sm text-center py-6 font-almendra">{t.galahad.noQuest}</p>
      )}
    </>
  );

  const renderDarius = () => (
    <>
      <p className="text-white/40 text-xs uppercase tracking-wider mb-2 font-cinzel">
        {language === 'ru' ? 'Продать ресурсы' : 'Sell Resources'}
      </p>
      {resources.length === 0 ? (
        <p className="text-white/20 text-sm py-4 font-almendra">{t.darius.noResources}</p>
      ) : (
        resources.map(item => {
          const def = ITEMS[item.itemId];
          const price = DARIUS_PRICES[item.itemId] ?? 2;
          const ResIcon = RESOURCE_ICONS[item.itemId];
          if (!def) return null;
          return (
            <div key={item.instanceId} className="flex items-center gap-3 bg-dark-800 rounded-xl p-3 border border-white/5 mb-2">
              {ResIcon && <ResIcon size={24} />}
              <div className="flex-1">
                <p className="text-white/90 text-sm font-almendra">{language === 'ru' ? def.name : def.nameEn}</p>
                <p className="text-white/40 text-xs">x{item.quantity} · {price} {t.darius.each}</p>
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => handleSellResource(item.instanceId, item.itemId, 1)}
                  className="bg-primary-500 text-dark-800 font-cinzel font-bold px-3 py-1.5 rounded-lg text-xs active:scale-95">
                  x1 (+{price})
                </button>
                {item.quantity > 1 && (
                  <button onClick={() => handleSellResource(item.instanceId, item.itemId, item.quantity)}
                    className="bg-primary-700 text-white font-cinzel font-bold px-3 py-1 rounded-lg text-[10px] active:scale-95">
                    x{item.quantity} (+{price * item.quantity})
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}
      <p className="text-white/40 text-xs uppercase tracking-wider mt-3 mb-2 font-cinzel">
        {language === 'ru' ? 'Купить снаряжение' : 'Buy Gear'}
      </p>
      {DARIUS_ITEMS.map(({ itemId, priceGold }) => {
        const def = ITEMS[itemId];
        if (!def) return null;
        const canAfford = goldBalance >= priceGold;
        return (
          <div key={itemId} className="flex items-center gap-3 bg-dark-800 rounded-xl p-3 border border-white/5 mb-2">
            {getItemIcon(itemId, def)}
            <div className="flex-1">
              <p className="text-white/90 text-sm font-almendra">{language === 'ru' ? def.name : def.nameEn}</p>
              <div className="flex gap-2 mt-0.5">
                {def.stats.defense && <span className="text-blue-400 text-xs">+{def.stats.defense} DEF</span>}
                {def.stats.damage && <span className="text-red-400 text-xs">+{def.stats.damage} ATK</span>}
              </div>
            </div>
            <button onClick={() => handleBuyGear(itemId, priceGold)} disabled={!canAfford}
              className={`font-cinzel font-bold px-3 py-2 rounded-lg text-sm active:scale-95 ${canAfford ? 'bg-primary-500 text-dark-800' : 'bg-dark-600 text-white/30 cursor-not-allowed'}`}>
              <span className="flex items-center gap-1"><IconGold size={12} /> {priceGold}</span>
            </button>
          </div>
        );
      })}
    </>
  );

  const renderShop = (items: { itemId: string; priceGold: number }[]) => (
    <>
      {items.map(({ itemId, priceGold }) => {
        const def = ITEMS[itemId];
        if (!def) return null;
        const canAfford = goldBalance >= priceGold;
        return (
          <div key={itemId} className="flex items-center gap-3 bg-dark-800 rounded-xl p-3 border border-white/5 mb-2">
            {getItemIcon(itemId, def)}
            <div className="flex-1">
              <p className="text-white/90 text-sm font-almendra">{language === 'ru' ? def.name : def.nameEn}</p>
              <div className="flex gap-2 mt-0.5">
                {def.stats.defense && <span className="text-blue-400 text-xs">+{def.stats.defense} DEF</span>}
                {def.stats.damage && <span className="text-red-400 text-xs">+{def.stats.damage} ATK</span>}
                {def.stats.xpBonus && <span className="text-secondary-400 text-xs">+{(def.stats.xpBonus * 100).toFixed(0)}% XP</span>}
                {def.stats.gatherSpeed && <span className="text-green-400 text-xs">+{(def.stats.gatherSpeed * 100).toFixed(0)}% Gather</span>}
              </div>
            </div>
            <button onClick={() => handleBuyGear(itemId, priceGold)} disabled={!canAfford}
              className={`font-cinzel font-bold px-3 py-2 rounded-lg text-sm active:scale-95 ${canAfford ? 'bg-primary-500 text-dark-800' : 'bg-dark-600 text-white/30 cursor-not-allowed'}`}>
              <span className="flex items-center gap-1"><IconGold size={12} /> {priceGold}</span>
            </button>
          </div>
        );
      })}
    </>
  );

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-dark-800/80 backdrop-blur anim-fade-in">
      <div className="relative w-full max-w-md bg-dark-700 border border-white/10 rounded-t-2xl flex flex-col anim-slide-up" style={{ maxHeight: '70vh' }}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <div>
            <h2 className="text-white font-cinzel font-bold">{npcT.title}</h2>
            <p className="text-white/40 text-xs mt-0.5 font-almendra">{npcT.sub}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X size={18} /></button>
        </div>

        <div className="px-5 py-2 bg-dark-800/40 border-b border-white/5 flex justify-between items-center">
          <span className="text-white/40 text-xs">{language === 'ru' ? 'Ваше золото' : 'Your gold'}</span>
          <span className="text-primary-400 font-bold flex items-center gap-1 font-cinzel"><IconGold size={14} /> {goldBalance}</span>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-2">
          {npcKey === 'galahad' && renderGalhad()}
          {npcKey === 'darius' && renderDarius()}
          {npcKey === 'alchemist' && renderShop(ALCHEMIST_ITEMS)}
          {npcKey === 'armorer' && renderShop(ARMORER_ITEMS)}
          {npcKey === 'tavern' && (
            <div className="space-y-3">
              {TAVERN_RUMORS.map((r, i) => (
                <div key={i} className="bg-dark-800 rounded-xl p-3 border border-white/5">
                  <p className="text-white/60 text-sm font-almendra italic">{language === 'ru' ? r.ru : r.en}</p>
                </div>
              ))}
            </div>
          )}
          {npcKey === 'alliance_m' && (
            <div className="text-center py-6">
              <p className="text-white/40 text-sm font-almendra">{language === 'ru' ? 'Объединяйтесь с другими воинами!' : 'Unite with other warriors!'}</p>
              <button onClick={() => { onClose(); setScreen('alliance'); }}
                className="mt-3 bg-secondary-500 text-white font-cinzel font-bold px-6 py-2 rounded-xl text-sm active:scale-95">
                {language === 'ru' ? 'Альянсы' : 'Alliances'}
              </button>
            </div>
          )}
          {npcKey === 'arena_m' && (
            <div className="text-center py-6">
              <p className="text-white/40 text-sm font-almendra">{language === 'ru' ? 'Испытай себя в бою!' : 'Test yourself in battle!'}</p>
              <button onClick={() => { onClose(); startDuel(language === 'ru' ? 'Гладиатор' : 'Gladiator'); playSfx('sword_swing'); }}
                className="mt-3 bg-red-600 hover:bg-red-500 text-white font-cinzel font-bold px-6 py-2 rounded-xl text-sm active:scale-95"
                style={{ boxShadow: '0 0 12px rgba(239,68,68,0.3)' }}>
                {t.arena_m.duel}
              </button>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-dark-600 border border-white/20 text-white text-sm font-bold px-5 py-2.5 rounded-xl anim-slide-up shadow-xl font-cinzel">
          {toast}
        </div>
      )}
    </div>
  );
};
