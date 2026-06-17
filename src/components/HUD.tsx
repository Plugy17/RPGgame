import React from 'react';
import { useGameStore } from '../store/gameStore';
import { QUESTS } from '../data/quests';

const T = {
  ru: { lv: 'УР', quest: 'Квест', noQuest: 'Нет активного квеста' },
  en: { lv: 'LV', quest: 'Quest', noQuest: 'No active quest' },
};

const OrnateCardCorner = ({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) => {
  const transforms = {
    tl: '',
    tr: 'scale(-1,1)',
    bl: 'scale(1,-1)',
    br: 'scale(-1,-1)',
  };
  const positions = {
    tl: 'left-0 top-0',
    tr: 'right-0 top-0',
    bl: 'left-0 bottom-0',
    br: 'right-0 bottom-0',
  };
  return (
    <svg
      className={`absolute w-3 h-3 text-primary-400/50 ${positions[position]}`}
      viewBox="0 0 12 12"
      style={{ transform: transforms[position] }}
    >
      <path d="M0 0 L6 0 Q12 0 12 6 L12 12" stroke="currentColor" strokeWidth="1" fill="none"/>
      <circle cx="3" cy="3" r="1" fill="currentColor" opacity="0.6"/>
    </svg>
  );
};

const QuestScrollIcon = () => (
  <svg className="w-4 h-4 text-primary-400" viewBox="0 0 16 16" fill="none">
    <path d="M2 3 Q2 1 4 1 L12 1 Q14 1 14 3 L14 13 Q14 15 12 15 L4 15 Q2 15 2 13 Z" stroke="currentColor" strokeWidth="0.75" fill="rgba(245,158,11,0.1)"/>
    <path d="M4 4 L12 4 M4 6 L10 6 M4 8 L11 8 M4 10 L8 10" stroke="currentColor" strokeWidth="0.5" opacity="0.7"/>
    <path d="M1 4 Q1 2 3 2 L3 14 Q3 16 1 16" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.5"/>
  </svg>
);

const StarOrnament = () => (
  <svg className="w-3 h-3 text-primary-400" viewBox="0 0 12 12" fill="none">
    <path d="M6 0 L6 12 M0 6 L12 6 M2 2 L10 10 M10 2 L2 10" stroke="currentColor" strokeWidth="0.5" opacity="0.5"/>
    <circle cx="6" cy="6" r="2" fill="currentColor" opacity="0.8"/>
  </svg>
);

export const HUD: React.FC = () => {
  const { playerLevel, playerXP, playerXPToNext, activeQuestId, questProgress, language,
          computedStats, levelUpVisible, dismissLevelUp, questCompleteVisible,
          claimQuestReward, dismissQuestComplete } = useGameStore();
  const t = T[language];

  const activeQP = activeQuestId ? questProgress.find(q => q.questId === activeQuestId) : null;
  const activeQDef = activeQuestId ? QUESTS.find(q => q.id === activeQuestId) ?? null : null;
  const xpPct = Math.min((playerXP / playerXPToNext) * 100, 100);

  return (
    <>
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
        <div className="relative flex flex-col bg-dark-800/85 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[100px]">
          <svg className="absolute inset-0 w-full h-full text-primary-400/30" viewBox="0 0 100 56" preserveAspectRatio="none">
            <path d="M4 0 L96 0 Q100 0 100 4 L100 52 Q100 56 96 56 L4 56 Q0 56 0 52 L0 4 Q0 0 4 0 Z"
              fill="rgba(13,13,26,0.9)" stroke="currentColor" strokeWidth="1"/>
            <path d="M0 28 L6 28 M94 28 L100 28 M50 0 L50 6 M50 50 L50 56" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
          </svg>

          <OrnateCardCorner position="tl" />
          <OrnateCardCorner position="tr" />
          <OrnateCardCorner position="bl" />
          <OrnateCardCorner position="br" />

          <div className="relative flex items-center gap-2">
            <div className="relative">
              <svg className="absolute -inset-1 w-6 h-6 text-primary-400" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="0.5"/>
              </svg>
              <span className="text-primary-400 text-xs font-bold font-cinzel">{t.lv} {playerLevel}</span>
            </div>
            <div className="w-px h-3 bg-white/20"/>
            <span className="text-white/60 text-xs">DEF {computedStats.defense}</span>
          </div>

          <div className="relative w-full h-2 bg-dark-700/80 rounded-full mt-1.5 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 via-transparent to-primary-500/20"/>
            <div className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-all duration-500 relative"
              style={{ width: `${xpPct}%` }}>
              <div className="absolute inset-0 bg-gradient-to-b from-white/25 to-transparent"/>
            </div>
          </div>

          <span className="text-primary-400/60 text-[9px] mt-1 font-cinzel tracking-wider">
            {playerXP}/{playerXPToNext} XP
          </span>
        </div>
      </div>

      {activeQDef && activeQP && !activeQP.claimed && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 anim-fade-in">
          <div className="relative bg-dark-800/90 backdrop-blur-sm rounded-lg px-4 py-2.5 min-w-[220px] max-w-[280px]">
            <svg className="absolute inset-0 w-full h-full text-primary-500/25" viewBox="0 0 240 60" preserveAspectRatio="none">
              <path d="M4 0 L100 0 L108 6 L132 6 L140 0 L236 0 Q240 0 240 4 L240 56 Q240 60 236 60 L140 60 L132 54 L108 54 L100 60 L4 60 Q0 60 0 56 L0 4 Q0 0 4 0 Z"
                fill="rgba(13,13,26,0.85)" stroke="currentColor" strokeWidth="1"/>
            </svg>

            <div className="absolute left-1.5 top-1/2 -translate-y-1/2 opacity-50">
              <QuestScrollIcon />
            </div>
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-50 scale-x-[-1]">
              <QuestScrollIcon />
            </div>

            <div className="relative flex items-center gap-2 mb-1.5">
              <StarOrnament />
              <span className="text-primary-300 text-xs font-cinzel font-semibold tracking-wider truncate flex-1">
                {language === 'ru' ? activeQDef.name : activeQDef.nameEn}
              </span>
              <StarOrnament />
            </div>

            <div className="relative w-full h-2 bg-dark-700/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-accent-400 rounded-full transition-all duration-300"
                style={{ width: `${(activeQP.progress / activeQDef.required) * 100}%` }}
              />
            </div>
            <span className="text-primary-400/70 text-[10px] font-cinzel mt-1 block text-center tracking-wide">
              {activeQP.progress}/{activeQDef.required}
            </span>
          </div>
        </div>
      )}

      {levelUpVisible && (
        <div
          className="absolute inset-0 z-40 flex items-center justify-center pointer-events-auto bg-black/60 backdrop-blur-sm"
          onClick={dismissLevelUp}
        >
          <div className="relative anim-slide-up">
            <svg className="absolute -inset-4 w-[calc(100%+32px)] h-[calc(100%+32px)] text-primary-400/30" viewBox="0 0 200 160" preserveAspectRatio="none">
              <path d="M8 0 L80 0 L88 8 L112 8 L120 0 L192 0 Q200 0 200 8 L200 152 Q200 160 192 160 L120 160 L112 152 L88 152 L80 160 L8 160 Q0 160 0 152 L0 8 Q0 0 8 0 Z"
                fill="rgba(13,13,26,0.95)" stroke="currentColor" strokeWidth="2"/>
            </svg>

            <div className="relative bg-dark-800/95 rounded-xl px-10 py-8 text-center"
              style={{ boxShadow: '0 0 50px rgba(251,191,36,0.4), inset 0 0 30px rgba(251,191,36,0.1)' }}>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <svg className="w-24 h-24 text-primary-400" viewBox="0 0 100 100" fill="none">
                  <polygon points="50,5 61,40 98,40 68,62 79,97 50,75 21,97 32,62 2,40 39,40"
                    stroke="currentColor" strokeWidth="1" fill="none"/>
                </svg>
              </div>

              <div className="relative">
                <svg className="w-12 h-12 mx-auto mb-3 text-primary-400" viewBox="0 0 48 48" fill="none">
                  <path d="M24 4 L24 44" stroke="currentColor" strokeWidth="2"/>
                  <path d="M10 18 L24 4 L38 18" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M10 30 L24 44 L38 30" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="24" cy="24" r="4" stroke="currentColor" strokeWidth="1.5"/>
                </svg>

                <h2 className="text-primary-400 text-2xl font-cinzel font-black tracking-wider" style={{
                  textShadow: '0 0 20px rgba(251,191,36,0.6)'
                }}>
                  {language === 'ru' ? 'НОВЫЙ УРОВЕНЬ!' : 'LEVEL UP!'}
                </h2>
                <p className="text-white/70 text-sm mt-2 font-almendra">
                  {language === 'ru' ? `Уровень ${playerLevel}` : `Level ${playerLevel}`}
                </p>

                <button className="mt-4 relative mx-auto block text-white/60 text-xs font-cinzel tracking-wider hover:text-white/80 transition-colors">
                  <span className="border-b border-white/30 pb-0.5">
                    {language === 'ru' ? 'Продолжить' : 'Continue'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {questCompleteVisible && (
        <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-auto bg-black/60 backdrop-blur-sm">
          <div className="relative anim-slide-up max-w-xs">
            <svg className="absolute -inset-4 w-[calc(100%+32px)] h-[calc(100%+32px)] text-accent-400/30" viewBox="0 0 220 180" preserveAspectRatio="none">
              <path d="M8 0 L90 0 L98 8 L130 8 L138 0 L212 0 Q220 0 220 8 L220 172 Q220 180 212 180 L138 180 L130 172 L98 172 L90 180 L8 180 Q0 180 0 172 L0 8 Q0 0 8 0 Z"
                fill="rgba(13,13,26,0.95)" stroke="currentColor" strokeWidth="2"/>
            </svg>

            <div className="relative bg-dark-800/95 rounded-xl px-8 py-6 text-center"
              style={{ boxShadow: '0 0 50px rgba(16,185,129,0.4), inset 0 0 30px rgba(16,185,129,0.1)' }}>
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-accent-400/20 to-transparent"/>
              </div>

              <div className="relative">
                <svg className="w-12 h-12 mx-auto mb-3 text-accent-400" viewBox="0 0 48 48" fill="none">
                  <rect x="4" y="8" width="40" height="32" rx="4" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M4 16 L44 16" stroke="currentColor" strokeWidth="0.5"/>
                  <path d="M12 24 L20 28 L28 22 L36 26" stroke="currentColor" strokeWidth="1"/>
                  <circle cx="38" cy="10" r="1" fill="currentColor"/>
                </svg>

                <h2 className="text-accent-400 text-xl font-cinzel font-black tracking-wider" style={{
                  textShadow: '0 0 15px rgba(16,185,129,0.6)'
                }}>
                  {language === 'ru' ? 'КВЕСТ ВЫПОЛНЕН!' : 'QUEST COMPLETE!'}
                </h2>
                {(() => {
                  const qdef = QUESTS.find(q => q.id === questCompleteVisible);
                  return qdef ? (
                    <p className="text-white/70 text-sm mt-2 font-almendra">
                      {language === 'ru' ? qdef.name : qdef.nameEn}
                    </p>
                  ) : null;
                })()}

                <button
                  className="relative mt-4 bg-gradient-to-r from-accent-500 to-accent-400 text-dark-800 font-cinzel font-bold px-6 py-2.5 rounded-lg text-sm active:scale-95 transition-transform"
                  onClick={() => { claimQuestReward(questCompleteVisible!); dismissQuestComplete(); }}
                  style={{ boxShadow: '0 0 20px rgba(16,185,129,0.5)' }}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 0 L10 6 L16 6 L11 10 L13 16 L8 12 L3 16 L5 10 L0 6 L6 6 Z"/>
                    </svg>
                    {language === 'ru' ? 'Забрать награду' : 'Claim reward'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
