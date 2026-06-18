import React from 'react';
import { useGameStore } from '../store/gameStore';
import { QUESTS } from '../data/quests';

const T = {
  ru: { lv: 'УР', quest: 'Квест', noQuest: 'Нет активного квеста', xp: 'ОПЫТ', def: 'ЗАЩИТА' },
  en: { lv: 'LV', quest: 'Quest', noQuest: 'No active quest', xp: 'XP', def: 'DEFENSE' },
};

/** WoW-style corner */
const WowCorner = ({ className = '', flip = '' }: { className?: string; flip?: string }) => (
  <svg className={`absolute w-3 h-3 text-wow-gold/50 ${className}`} viewBox="0 0 12 12" fill="none" style={{ transform: flip }}>
    <path d="M0 0 L6 0 Q12 0 12 6 L12 12" stroke="currentColor" strokeWidth="1" fill="none"/>
    <circle cx="3" cy="3" r="0.8" fill="currentColor" opacity="0.6"/>
  </svg>
);

/** WoW rpg-style XP bar */
const XpBar = ({ current, max }: { current: number; max: number }) => {
  const pct = Math.min((current / max) * 100, 100);
  return (
    <div className="relative w-full h-2.5 bg-dark-800/90 rounded-sm overflow-hidden mt-1"
      style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.8)' }}>
      {/* Background runic pattern */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(212,168,74,0.1) 4px, rgba(212,168,74,0.1) 5px)' }}/>
      {/* Fill */}
      <div className="h-full bg-gradient-to-r from-wow-gold-dark via-wow-gold to-wow-gold-dark rounded-sm relative transition-all duration-500"
        style={{ width: `${pct}%` }}>
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"/>
      </div>
      {/* Border shine */}
      <div className="absolute inset-0 border border-wow-gold/20 rounded-sm pointer-events-none"/>
    </div>
  );
};

export const HUD: React.FC = () => {
  const { playerLevel, playerXP, playerXPToNext, activeQuestId, questProgress, language,
          computedStats, levelUpVisible, dismissLevelUp, questCompleteVisible,
          claimQuestReward, dismissQuestComplete } = useGameStore();
  const t = T[language];

  const activeQP = activeQuestId ? questProgress.find(q => q.questId === activeQuestId) : null;
  const activeQDef = activeQuestId ? QUESTS.find(q => q.id === activeQuestId) ?? null : null;

  return (
    <>
      {/* Top-left XP Panel — WoW Style */}
      <div className="absolute top-3 left-3 z-20">
        <div className="relative wow-panel rounded-sm px-3 py-2 min-w-[110px]">
          <WowCorner className="left-0.5 top-0.5" />
          <WowCorner className="right-0.5 top-0.5" flip="scale(-1,1)" />
          <WowCorner className="left-0.5 bottom-0.5" flip="scale(1,-1)" />
          <WowCorner className="right-0.5 bottom-0.5" flip="scale(-1,-1)" />

          {/* Level + Defense row */}
          <div className="relative flex items-center gap-2">
            {/* Level badge */}
            <div className="relative flex items-center gap-1">
              <svg className="w-5 h-5 text-wow-gold" viewBox="0 0 20 20" fill="none">
                <path d="M10 2 L12 7 L17 7 L13 10 L14 15 L10 12 L6 15 L7 10 L3 7 L8 7 Z" stroke="currentColor" strokeWidth="1" fill="rgba(212,168,74,0.15)"/>
              </svg>
              <span className="text-wow-gold text-[10px] font-wow-heading">{t.lv} {playerLevel}</span>
            </div>

            <div className="h-3 w-px bg-gradient-to-b from-wow-gold/30 to-transparent"/>

            {/* Defense */}
            <div>
              <span className="text-wow-gold-dark/60 text-[8px] font-wow-heading">{t.def}</span>
              <span className="text-white/70 text-[10px] font-wow-heading ml-1">{computedStats.defense}</span>
            </div>
          </div>

          {/* XP Bar */}
          <div className="relative mt-1">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-wow-gold-dark/40 text-[7px] font-wow-heading tracking-widest">{t.xp}</span>
              <span className="text-wow-gold-dark/40 text-[7px] font-wow-heading">{playerXP}/{playerXPToNext}</span>
            </div>
            <XpBar current={playerXP} max={playerXPToNext} />
          </div>
        </div>
      </div>

      {/* Quest tracker — WoW Style */}
      {activeQDef && activeQP && !activeQP.claimed && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 anim-fade-in">
          <div className="relative wow-panel rounded-sm px-4 py-2.5 min-w-[200px] max-w-[260px]">
            {/* Quest icon */}
            <div className="absolute -left-1 top-1/2 -translate-y-1/2">
              <svg className="w-5 h-5 text-wow-gold/40" viewBox="0 0 20 20" fill="none">
                <path d="M3 3 H17 V13 H12 L10 17 L8 13 H3 Z" stroke="currentColor" strokeWidth="1" fill="rgba(212,168,74,0.05)"/>
                <path d="M6 7 H14 M6 10 H10" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
              </svg>
            </div>

            <div className="relative flex items-center gap-2 mb-1.5 ml-4">
              <div className="h-px flex-1 bg-gradient-to-r from-wow-gold/20 to-transparent"/>
              <span className="text-wow-gold text-[10px] font-wow-heading tracking-wider truncate">
                {language === 'ru' ? activeQDef.name : activeQDef.nameEn}
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-wow-gold/20 to-transparent"/>
            </div>

            {/* Quest progress bar */}
            <div className="relative w-full h-2 bg-dark-800/90 rounded-sm overflow-hidden">
              <div className="absolute inset-0 border border-wow-gold/10 rounded-sm"/>
              <div
                className="h-full bg-gradient-to-r from-wow-gold-dark to-wow-gold rounded-sm relative transition-all duration-300"
                style={{ width: `${(activeQP.progress / activeQDef.required) * 100}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent"/>
              </div>
            </div>
            <span className="text-wow-gold-dark/50 text-[8px] font-wow-heading mt-1 block text-center tracking-wide">
              {activeQP.progress}/{activeQDef.required}
            </span>
          </div>
        </div>
      )}

      {/* Level Up modal — WoW Style */}
      {levelUpVisible && (
        <div
          className="absolute inset-0 z-40 flex items-center justify-center pointer-events-auto bg-black/70 backdrop-blur-sm"
          onClick={dismissLevelUp}
        >
          <div className="relative anim-slide-up wow-panel rounded-sm px-10 py-8 text-center max-w-xs"
            style={{ boxShadow: '0 0 60px rgba(212,168,74,0.4), inset 0 0 40px rgba(212,168,74,0.1)' }}>
            
            {/* Star burst */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15">
              <svg className="w-28 h-28 text-wow-gold" viewBox="0 0 100 100" fill="none">
                <polygon points="50,5 61,40 98,40 68,62 79,97 50,75 21,97 32,62 2,40 39,40"
                  stroke="currentColor" strokeWidth="1" fill="none"/>
              </svg>
            </div>

            <div className="relative">
              {/* Level up icon */}
              <svg className="w-14 h-14 mx-auto mb-3 text-wow-gold" viewBox="0 0 48 48" fill="none">
                <path d="M24 4 L24 44" stroke="currentColor" strokeWidth="2"/>
                <path d="M10 18 L24 4 L38 18" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10 30 L24 44 L38 30" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="24" cy="24" r="4" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="24" cy="24" r="2" fill="currentColor"/>
              </svg>

              <h2 className="text-wow-gold text-2xl font-wow-heading tracking-wider"
                style={{ textShadow: '0 0 20px rgba(212,168,74,0.6)' }}>
                {language === 'ru' ? 'НОВЫЙ УРОВЕНЬ!' : 'LEVEL UP!'}
              </h2>
              <p className="text-wow-gold-dark/70 text-sm mt-2 font-wow">
                {language === 'ru' ? `Уровень ${playerLevel}` : `Level ${playerLevel}`}
              </p>

              <button
                onClick={dismissLevelUp}
                className="mt-4 wow-btn text-[10px] px-4 py-1.5 rounded-sm font-wow-heading"
              >
                {language === 'ru' ? 'ПРОДОЛЖИТЬ' : 'CONTINUE'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quest Complete modal — WoW Style */}
      {questCompleteVisible && (
        <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-auto bg-black/70 backdrop-blur-sm">
          <div className="relative anim-slide-up max-w-xs wow-panel rounded-sm px-8 py-6 text-center"
            style={{ boxShadow: '0 0 60px rgba(16,185,129,0.4), inset 0 0 30px rgba(16,185,129,0.1)' }}>
            <div className="relative">
              {/* Scroll icon */}
              <svg className="w-12 h-12 mx-auto mb-3 text-accent-400" viewBox="0 0 48 48" fill="none">
                <rect x="4" y="8" width="40" height="32" rx="4" stroke="currentColor" strokeWidth="1.5" fill="rgba(16,185,129,0.05)"/>
                <path d="M4 16 L44 16" stroke="currentColor" strokeWidth="0.5"/>
                <path d="M12 24 L20 28 L28 22 L36 26" stroke="currentColor" strokeWidth="1"/>
                <circle cx="38" cy="10" r="1" fill="currentColor"/>
              </svg>

              <h2 className="text-accent-400 text-xl font-wow-heading tracking-wider"
                style={{ textShadow: '0 0 15px rgba(16,185,129,0.6)' }}>
                {language === 'ru' ? 'КВЕСТ ВЫПОЛНЕН!' : 'QUEST COMPLETE!'}
              </h2>
              {(() => {
                const qdef = QUESTS.find(q => q.id === questCompleteVisible);
                return qdef ? (
                  <p className="text-wow-gold-dark/70 text-sm mt-2 font-wow">
                    {language === 'ru' ? qdef.name : qdef.nameEn}
                  </p>
                ) : null;
              })()}

              <button
                className="relative mt-4 wow-btn text-[10px] px-4 py-1.5 rounded-sm font-wow-heading"
                onClick={() => { claimQuestReward(questCompleteVisible!); dismissQuestComplete(); }}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 0 L10 6 L16 6 L11 10 L13 16 L8 12 L3 16 L5 10 L0 6 L6 6 Z"/>
                  </svg>
                  {language === 'ru' ? 'ЗАБРАТЬ НАГРАДУ' : 'CLAIM REWARD'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};