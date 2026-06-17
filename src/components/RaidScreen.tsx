import React, { useState, useEffect } from 'react';
import { ArrowLeft, Swords } from 'lucide-react';
import { useGameStore, RAID_BOSSES } from '../store/gameStore';
import { IconRaid, IconSword, IconFriends, IconGold } from './GameIcons';

const T = {
  ru: { title:'Рейды на Боссов', back:'Назад', start:'Начать рейд', inProgress:'Рейд идёт...',
        reward:'Награда', xp:'Опыт', gold:'Золото', boss:'Босс', level:'Уровень',
        timer:'Таймер спавна', duration:'Длительность', friends:'Пригласить друзей',
        raidComplete:'Рейд завершён!', raidStart:'Рейд начат!', noAlliance:'Вступите в альянс для рейдов',
        joinRaid:'Присоединиться' },
  en: { title:'Boss Raids', back:'Back', start:'Start Raid', inProgress:'Raid in progress...',
        reward:'Reward', xp:'XP', gold:'Gold', boss:'Boss', level:'Level',
        timer:'Spawn Timer', duration:'Duration', friends:'Invite friends',
        raidComplete:'Raid complete!', raidStart:'Raid started!', noAlliance:'Join an alliance to raid',
        joinRaid:'Join Raid' },
};

export const RaidScreen: React.FC = () => {
  const { setScreen, language, currentAllianceId, friends, addInventoryItem, addGold, addXP } = useGameStore();
  const [activeRaid, setActiveRaid] = useState<string | null>(null);
  const [raidProgress, setRaidProgress] = useState(0);
  const [raidFriends, setRaidFriends] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const t = T[language];

  useEffect(() => {
    if (!activeRaid) return;
    const boss = RAID_BOSSES.find(b => b.id === activeRaid);
    if (!boss) return;
    const speed = 1 + raidFriends.length * 0.3;
    const interval = setInterval(() => {
      setRaidProgress(p => {
        const next = p + speed;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            addXP(boss.rewardXp);
            addGold(boss.rewardGold);
            for (const r of boss.rewardItems) addInventoryItem(r.itemId, r.qty);
            showToast(t.raidComplete);
            setActiveRaid(null);
          }, 500);
          return 100;
        }
        return next;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [activeRaid, raidFriends.length]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const toggleFriend = (id: string) => {
    setRaidFriends(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const formatTimer = (spawnTime: number) => {
    const diff = Math.max(0, spawnTime - Date.now());
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-dark-800 overflow-y-auto scrollbar-hide">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
        <button onClick={() => setScreen('alliance')} className="text-white/50 hover:text-white"><ArrowLeft size={20} /></button>
        <h1 className="text-white font-bold text-xl flex items-center gap-2"><IconRaid size={22} glow /> {t.title}</h1>
      </div>

      <div className="flex-1 px-5 py-5 space-y-4">
        {!currentAllianceId ? (
          <div className="text-center py-12">
            <p className="text-white/30 text-sm">{t.noAlliance}</p>
            <button onClick={() => setScreen('alliance')}
              className="mt-3 bg-primary-500 text-dark-800 font-bold px-6 py-2 rounded-xl text-sm active:scale-95">
              {t.back}
            </button>
          </div>
        ) : (
          <>
            {/* Active raid */}
            {activeRaid && (() => {
              const boss = RAID_BOSSES.find(b => b.id === activeRaid)!;
              return (
                <div className="bg-dark-700 rounded-xl p-4 border border-red-500/30">
                  <div className="flex items-center gap-3 mb-3">
                    <IconSword size={28} glow />
                    <div>
                      <p className="text-white font-bold text-lg">{language === 'ru' ? boss.name : boss.nameEn}</p>
                      <p className="text-white/40 text-xs">{t.inProgress}</p>
                    </div>
                  </div>
                  {/* Boss HP bar */}
                  <div className="w-full h-4 bg-dark-800 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-300"
                      style={{ width: `${100 - raidProgress}%` }} />
                  </div>
                  <p className="text-white/40 text-xs text-center">{Math.round(raidProgress)}%</p>
                  <div className="flex gap-2 mt-2">
                    {raidFriends.map(fid => {
                      const f = friends.find(fr => fr.id === fid);
                      return f ? (
                        <span key={fid} className="bg-primary-500/20 border border-primary-400/30 text-primary-300 text-xs px-2 py-1 rounded-full">{f.name}</span>
                      ) : null;
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Boss list */}
            {RAID_BOSSES.map(boss => {
              const isActive = activeRaid === boss.id;
              const canSpawn = Date.now() >= boss.spawnTime;
              return (
                <div key={boss.id} className={`bg-dark-700 rounded-xl p-4 border ${isActive ? 'border-red-500/30' : 'border-white/10'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-900/30 border border-red-500/30 flex items-center justify-center">
                      <IconSword size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-white/90 font-semibold">{language === 'ru' ? boss.name : boss.nameEn}</p>
                      <div className="flex gap-3 mt-0.5">
                        <span className="text-red-400 text-xs">{t.level} {boss.level}</span>
                        <span className="text-white/30 text-xs">HP {boss.hp.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="bg-dark-800 rounded-lg p-2">
                      <p className="text-primary-400 font-bold text-sm">+{boss.rewardXp}</p>
                      <p className="text-white/30 text-[10px]">{t.xp}</p>
                    </div>
                    <div className="bg-dark-800 rounded-lg p-2">
                      <p className="text-primary-400 font-bold text-sm flex items-center justify-center gap-1">+{boss.rewardGold} <IconGold size={14} /></p>
                      <p className="text-white/30 text-[10px]">{t.gold}</p>
                    </div>
                    <div className="bg-dark-800 rounded-lg p-2">
                      <p className="text-white/30 text-[10px]">{t.timer}</p>
                      <p className="text-white/50 text-xs font-mono">{canSpawn ? '00:00' : formatTimer(boss.spawnTime)}</p>
                    </div>
                  </div>

                  {/* Friend selection */}
                  {!isActive && canSpawn && (
                    <div className="mt-3">
                      <p className="text-white/40 text-xs mb-1.5 flex items-center gap-1"><IconFriends size={12} /> {t.friends}</p>
                      <div className="flex gap-2 flex-wrap">
                        {friends.filter(f => f.online).map(f => (
                          <button key={f.id}
                            onClick={() => toggleFriend(f.id)}
                            className={`text-xs px-2 py-1 rounded-full border transition-all ${
                              raidFriends.includes(f.id)
                                ? 'border-primary-400 bg-primary-500/20 text-primary-300'
                                : 'border-white/10 bg-dark-800 text-white/40'
                            }`}>
                            {f.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {!isActive && canSpawn && (
                    <button
                      onClick={() => { setActiveRaid(boss.id); setRaidProgress(0); showToast(t.raidStart); }}
                      className="mt-3 w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Swords size={14} /> {t.start}
                    </button>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-dark-600 border border-white/20 text-white text-sm font-bold px-5 py-2.5 rounded-xl anim-slide-up z-[100]">
          {toast}
        </div>
      )}
    </div>
  );
};
