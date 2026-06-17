import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { ITEMS } from '../data/items';
import { QUESTS } from '../data/quests';
import { ItemIcon, IconHerb } from './GameIcons';

const T = {
  ru: { stats: 'Статистика', back: 'Назад', inventory: 'Инвентарь', quests: 'Квесты',
        resources: 'Ресурсы', equipment: 'Снаряжение', total: 'Всего предметов',
        completed: 'Выполнено', active: 'Активен', inProgress: 'В процессе', pending: 'Ожидает' },
  en: { stats: 'Statistics', back: 'Back', inventory: 'Inventory', quests: 'Quests',
        resources: 'Resources', equipment: 'Equipment', total: 'Total Items',
        completed: 'Completed', active: 'Active', inProgress: 'In Progress', pending: 'Pending' },
};

export const StatsScreen: React.FC = () => {
  const { setScreen, language, inventory, questProgress, playerLevel,
          locationsUnlocked, activeQuestId } = useGameStore();
  const t = T[language];

  const resources = inventory.filter(i => ITEMS[i.itemId]?.slot === 'resource');
  const completedQuests = questProgress.filter(q => q.completed && q.claimed).length;
  const totalQuests = QUESTS.length;

  const ResourceRow: React.FC<{ itemId: string; qty: number }> = ({ itemId, qty }) => {
    const def = ITEMS[itemId];
    if (!def) return null;
    return (
      <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
        <div className="flex items-center gap-2">
          <ItemIcon iconName={def.iconName} size={24} />
          <span className="text-white/80 text-sm">{language === 'ru' ? def.name : def.nameEn}</span>
        </div>
        <span className="text-primary-400 font-bold text-sm">×{qty}</span>
      </div>
    );
  };

  // Aggregate stacked resources
  const resourceMap: Record<string, number> = {};
  for (const item of resources) {
    resourceMap[item.itemId] = (resourceMap[item.itemId] ?? 0) + item.quantity;
  }

  return (
    <div className="relative w-full h-full flex flex-col bg-dark-800 overflow-y-auto scrollbar-hide">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
        <button onClick={() => setScreen('menu')} className="text-white/50 hover:text-white">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-white font-bold text-xl">📊 {t.stats}</h1>
      </div>

      <div className="flex-1 px-5 py-4 space-y-4">
        {/* Overview */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { val: playerLevel, label: language === 'ru' ? 'Уровень' : 'Level', icon: '⭐', color: 'text-yellow-400' },
            { val: completedQuests, label: language === 'ru' ? 'Квестов' : 'Quests', icon: '📜', color: 'text-green-400' },
            { val: locationsUnlocked.length, label: language === 'ru' ? 'Локации' : 'Locations', icon: '🗺️', color: 'text-blue-400' },
          ].map(s => (
            <div key={s.label} className="bg-dark-700 rounded-xl p-3 border border-white/10 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className={`text-2xl font-black ${s.color}`}>{s.val}</div>
              <div className="text-white/40 text-[10px]">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Resources */}
        <div className="bg-dark-700 rounded-xl p-4 border border-white/10">
          <p className="text-white/60 text-sm font-semibold mb-2 uppercase tracking-wider flex items-center gap-2">
            <IconHerb size={16} /> {t.resources}
          </p>
          {Object.keys(resourceMap).length === 0 ? (
            <p className="text-white/30 text-sm">{language === 'ru' ? 'Нет ресурсов' : 'No resources'}</p>
          ) : (
            Object.entries(resourceMap).map(([id, qty]) => (
              <ResourceRow key={id} itemId={id} qty={qty} />
            ))
          )}
        </div>

        {/* Quest progress */}
        <div className="bg-dark-700 rounded-xl p-4 border border-white/10">
          <p className="text-white/60 text-sm font-semibold mb-3 uppercase tracking-wider">
            📜 {t.quests} ({completedQuests}/{totalQuests})
          </p>
          <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden mb-3">
            <div className="h-full bg-gradient-to-r from-accent-500 to-accent-300 rounded-full transition-all"
              style={{ width: `${(completedQuests / totalQuests) * 100}%` }} />
          </div>
          <div className="space-y-2">
            {QUESTS.map(q => {
              const qp = questProgress.find(p => p.questId === q.id);
              const isActive = q.id === activeQuestId;
              const status = qp?.claimed ? 'claimed' : qp?.completed ? 'done' : isActive ? 'active' : 'pending';
              const icons: Record<string, string> = { claimed: '✅', done: '🎁', active: '⚡', pending: '⬜' };
              const colors: Record<string, string> = {
                claimed: 'text-accent-400', done: 'text-yellow-400',
                active: 'text-blue-400', pending: 'text-white/30',
              };
              return (
                <div key={q.id} className="flex items-start gap-2 py-1.5 border-b border-white/5 last:border-0">
                  <span className="text-sm mt-0.5">{icons[status]}</span>
                  <div className="flex-1">
                    <p className={`text-xs font-medium ${colors[status]}`}>
                      {language === 'ru' ? q.name : q.nameEn}
                    </p>
                    {isActive && qp && (
                      <div className="mt-1 w-full h-1 bg-dark-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400 rounded-full"
                          style={{ width: `${(qp.progress / q.required) * 100}%` }} />
                      </div>
                    )}
                  </div>
                  <span className="text-white/30 text-[10px]">+{q.reward.xp}XP</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
