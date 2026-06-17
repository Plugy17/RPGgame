import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useGameStore, type CharacterClass } from '../store/gameStore';
import { ITEMS } from '../data/items';
import { LOCATIONS } from '../data/locations';
import { RACES, CLASSES, type Race } from '../data/classes';
import { IconProfile, IconCrown, IconClassWarrior, IconClassMage, IconClassArcher, IconSkinIce, IconSkinFire, IconSkinShadow, IconShield, IconSword } from './GameIcons';

const CLASS_INFO: { id: CharacterClass; name: string; nameEn: string; icon: React.FC<{ size?: number }>; color: string; desc: string; descEn: string }[] = [
  { id:'warrior', name:'Воин',    nameEn:'Warrior',  icon:IconClassWarrior, color:'text-red-400', desc:'Мастер ближнего боя и защиты',       descEn:'Master of melee and defense' },
  { id:'mage',    name:'Маг',     nameEn:'Mage',     icon:IconClassMage,    color:'text-purple-400', desc:'Повелитель стихий и тайных знаний', descEn:'Master of elements and arcane knowledge' },
  { id:'archer',  name:'Лучник',  nameEn:'Archer',   icon:IconClassArcher, color:'text-green-400', desc:'Меткий стрелок издалека',            descEn:'Precise marksman from afar' },
];

const SKIN_ITEMS = ['skin_default', 'skin_ice', 'skin_fire', 'skin_shadow'];

const T = {
  ru: { profile:'Профиль', back:'Назад', level:'Уровень', xp:'Опыт', playtime:'Время в игре',
        locations:'Локации', defense:'Защита', damage:'Урон', gather:'Скорость сбора',
        hours:'ч', minutes:'мин', classLabel:'Класс', skins:'Скины', equip:'Надеть', equipped:'Надето',
        selectClass:'Выберите класс', lock:'Заблокировано', race:'Раса', attributes:'Характеристики' },
  en: { profile:'Profile', back:'Back', level:'Level', xp:'Experience', playtime:'Play Time',
        locations:'Locations', defense:'Defense', damage:'Damage', gather:'Gather Speed',
        hours:'h', minutes:'min', classLabel:'Class', skins:'Skins', equip:'Equip', equipped:'Equipped',
        selectClass:'Select class', lock:'Locked', race:'Race', attributes:'Attributes' },
};

export const ProfileScreen: React.FC = () => {
  const { setScreen, language, playerName, playerLevel, playerXP, playerXPToNext,
          playtime, locationsUnlocked, computedStats, characterClass, setCharacterClass,
          activeSkin, setActiveSkin, inventory, goldBalance, characterRace, setCharacterRace, attributes } = useGameStore();
  const t = T[language];
  const xpPct = Math.min((playerXP / playerXPToNext) * 100, 100);
  const hours = Math.floor(playtime / 3600);
  const minutes = Math.floor((playtime % 3600) / 60);

  const ownedSkins = inventory.filter(i => ITEMS[i.itemId]?.slot === 'skin');
  const activeClassInfo = CLASS_INFO.find(c => c.id === characterClass)!;
  const activeRaceInfo = RACES.find(r => r.id === characterRace)!;

  return (
    <div className="relative w-full h-full flex flex-col bg-dark-800 overflow-y-auto scrollbar-hide">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
        <button onClick={() => setScreen('menu')} className="text-white/50 hover:text-white"><ArrowLeft size={20} /></button>
        <h1 className="text-white font-cinzel font-bold text-xl anim-rune flex items-center gap-2"><IconProfile size={22} glow /> {t.profile}</h1>
      </div>

      <div className="flex-1 px-5 py-5 space-y-5">
        {/* Avatar & Name */}
        <div className="flex flex-col items-center gap-3 anim-fade-in">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center"
            style={{ boxShadow: '0 0 30px rgba(251,191,36,0.4)' }}>
            {React.createElement(activeClassInfo.icon, { size: 36 })}
          </div>
          <div className="text-center">
            <h2 className="text-white text-xl font-cinzel font-bold">{playerName}</h2>
            <p className="text-primary-400 text-sm font-cinzel font-semibold">{t.level} {playerLevel}</p>
            <span className={`text-xs font-cinzel font-semibold ${activeClassInfo.color}`}>
              {language === 'ru' ? activeRaceInfo.name : activeRaceInfo.nameEn} {language === 'ru' ? activeClassInfo.name : activeClassInfo.nameEn}
            </span>
          </div>
          <div className="w-full max-w-xs">
            <div className="flex justify-between text-xs text-white/40 mb-1">
              <span>{t.xp}</span><span>{playerXP} / {playerXPToNext}</span>
            </div>
            <div className="w-full h-3 bg-dark-700 rounded-full overflow-hidden border border-white/10">
              <div className="h-full bg-gradient-to-r from-primary-500 to-primary-300 rounded-full transition-all duration-700"
                style={{ width: `${xpPct}%` }} />
            </div>
          </div>
          <div className="flex items-center gap-1 bg-dark-700/60 rounded-full px-3 py-1 border border-white/10">
            <IconCrown size={14} glow />
            <span className="text-primary-400 text-sm font-cinzel font-bold">{goldBalance}</span>
          </div>
        </div>

        {/* Race selection */}
        <div className="bg-dark-700 rounded-xl p-4 border border-white/10">
          <p className="text-white/60 text-sm font-cinzel font-semibold mb-3 anim-rune">{t.race}</p>
          <div className="grid grid-cols-4 gap-2">
            {RACES.map(r => (
              <button key={r.id}
                onClick={() => setCharacterRace(r.id)}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all active:scale-95 ${
                  characterRace === r.id
                    ? 'border-primary-400 bg-primary-900/20'
                    : 'border-white/10 bg-dark-800 hover:border-white/20'
                }`}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-cinzel font-black"
                  style={{ background: `#${new THREE.Color(r.skinColor).getHexString()}44`, color: `#${new THREE.Color(r.skinColor).getHexString()}` }}>
                  {r.name[0]}
                </div>
                <span className="text-white/70 text-[9px] font-cinzel font-semibold">{language === 'ru' ? r.name : r.nameEn}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Class selection */}
        <div className="bg-dark-700 rounded-xl p-4 border border-white/10">
          <p className="text-white/60 text-sm font-cinzel font-semibold mb-3 anim-rune">{t.classLabel}</p>
          <div className="grid grid-cols-3 gap-2">
            {CLASS_INFO.map(c => (
              <button key={c.id}
                onClick={() => setCharacterClass(c.id)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all active:scale-95 ${
                  characterClass === c.id
                    ? 'border-primary-400 bg-primary-900/20'
                    : 'border-white/10 bg-dark-800 hover:border-white/20'
                }`}>
                {React.createElement(c.icon, { size: 28 })}
                <span className={`text-xs font-cinzel font-semibold ${c.color}`}>{language === 'ru' ? c.name : c.nameEn}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Attribute points link */}
        {attributes.unspent > 0 && (
          <button onClick={() => setScreen('attributes')}
            className="w-full bg-primary-900/20 border border-primary-400/30 text-primary-300 font-cinzel font-bold py-3 rounded-xl text-sm active:scale-95 animate-pulse">
            {t.attributes}: +{attributes.unspent} {language === 'ru' ? 'очков' : 'points'}
          </button>
        )}

        {/* Skins */}
        <div className="bg-dark-700 rounded-xl p-4 border border-white/10">
          <p className="text-white/60 text-sm font-cinzel font-semibold mb-3 anim-rune">{t.skins}</p>
          <div className="grid grid-cols-2 gap-2">
            {SKIN_ITEMS.map(skinId => {
              const def = ITEMS[skinId];
              if (!def) return null;
              const owned = ownedSkins.find(i => i.itemId === skinId);
              const isActive = activeSkin === skinId;
              const IconComp = skinId === 'skin_ice' ? IconSkinIce :
                               skinId === 'skin_fire' ? IconSkinFire :
                               skinId === 'skin_shadow' ? IconSkinShadow : IconShield;
              return (
                <button key={skinId}
                  onClick={() => owned && setActiveSkin(skinId)}
                  disabled={!owned}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all ${
                    isActive ? 'border-primary-400 bg-primary-900/20' :
                    owned ? 'border-white/10 bg-dark-800 hover:border-white/20' :
                    'border-white/5 bg-dark-800/50 opacity-40'
                  }`}>
                  <IconComp size={24} />
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-white/90 text-xs font-almendra font-medium truncate">{language === 'ru' ? def.name : def.nameEn}</p>
                    {isActive ? (
                      <span className="text-accent-400 text-[10px] font-cinzel">{t.equipped}</span>
                    ) : !owned ? (
                      <span className="text-white/20 text-[10px]">{t.lock}</span>
                    ) : (
                      <span className="text-primary-400 text-[10px] font-cinzel">{t.equip}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: t.defense,  value: computedStats.defense,              color: 'text-blue-400',   icon: <IconShield size={16} /> },
            { label: t.damage,   value: computedStats.damage.toFixed(1),    color: 'text-red-400',    icon: <IconSword size={16} /> },
            { label: t.gather,   value: `x${computedStats.gatherSpeed.toFixed(2)}`, color: 'text-green-400', icon: null },
            { label: t.locations,value: `${locationsUnlocked.length}/${LOCATIONS.length - 1}`, color: 'text-secondary-400', icon: null },
          ].map(s => (
            <div key={s.label} className="bg-dark-700 rounded-xl p-3 border border-white/10 flex items-center gap-2">
              {s.icon}
              <div>
                <span className={`text-lg font-black font-cinzel ${s.color}`}>{s.value}</span>
                <p className="text-white/40 text-[10px]">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Playtime */}
        <div className="bg-dark-700 rounded-xl p-4 border border-white/10 flex items-center gap-3">
          <IconCrown size={20} />
          <div>
            <p className="text-white/40 text-xs">{t.playtime}</p>
            <p className="text-white text-lg font-cinzel font-bold">{hours}{t.hours} {minutes}{t.minutes}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

import * as THREE from 'three';
