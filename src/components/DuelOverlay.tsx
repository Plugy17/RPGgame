import React from 'react';
import { useGameStore } from '../store/gameStore';
import { IconSword, IconShield } from './GameIcons';
import { playSfx } from '../audio/sfx';

const T = {
  ru: { duel: 'Дуэль', attack: 'Атаковать', flee: 'Сбежать', victory: 'Победа!', defeat: 'Поражение', vs: 'против', hp: 'Здоровье', reward: '+50 золота' },
  en: { duel: 'Duel', attack: 'Attack', flee: 'Flee', victory: 'Victory!', defeat: 'Defeat', vs: 'vs', hp: 'Health', reward: '+50 gold' },
};

export const DuelOverlay: React.FC = () => {
  const { duel, duelAttack, endDuel, language, playerName } = useGameStore();
  const t = T[language];

  if (!duel.active && duel.log.length === 0) return null;

  const isOver = !duel.active && duel.log.length > 0;
  const playerWon = duel.opponentHp <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-800/90 backdrop-blur anim-fade-in">
      {/* Arena dome visual */}
      <div className="absolute inset-8 rounded-full border-2 border-red-500/30"
        style={{ boxShadow: 'inset 0 0 60px rgba(239,68,68,0.1), 0 0 30px rgba(239,68,68,0.15)' }} />

      <div className="relative z-10 w-full max-w-sm mx-4 bg-dark-700 border border-red-500/30 rounded-2xl overflow-hidden anim-slide-up">
        <div className="px-4 py-3 border-b border-red-500/20 bg-gradient-to-r from-red-900/30 to-dark-700">
          <h2 className="text-white font-cinzel font-bold text-lg text-center anim-rune flex items-center justify-center gap-2">
            <IconSword size={20} /> {t.duel}
          </h2>
        </div>

        <div className="p-4 space-y-4">
          {/* Combatants */}
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="text-white font-cinzel font-bold text-sm">{playerName}</p>
              <div className="w-24 h-2.5 bg-dark-800 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all"
                  style={{ width: `${(duel.playerHp / duel.maxHp) * 100}%` }} />
              </div>
              <span className="text-green-400 text-xs font-bold">{duel.playerHp}/{duel.maxHp}</span>
            </div>
            <span className="text-white/40 font-cinzel font-bold text-xs">{t.vs}</span>
            <div className="text-center">
              <p className="text-red-300 font-cinzel font-bold text-sm">{duel.opponentName}</p>
              <div className="w-24 h-2.5 bg-dark-800 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all"
                  style={{ width: `${(duel.opponentHp / 100) * 100}%` }} />
              </div>
              <span className="text-red-400 text-xs font-bold">{duel.opponentHp}/100</span>
            </div>
          </div>

          {/* Battle log */}
          <div className="bg-dark-800 rounded-xl p-3 border border-white/5 max-h-28 overflow-y-auto scrollbar-hide">
            {duel.log.map((line, i) => (
              <p key={i} className="text-white/60 text-xs font-almendra">{line}</p>
            ))}
          </div>

          {/* Actions */}
          {!isOver ? (
            <button onClick={() => { duelAttack(); playSfx('duel_hit'); }}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-cinzel font-bold text-sm tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 active:scale-95"
              style={{ boxShadow: '0 0 15px rgba(239,68,68,0.3)' }}>
              <IconSword size={16} /> {t.attack}
            </button>
          ) : (
            <div className="text-center space-y-2">
              <p className={`font-cinzel font-black text-xl ${playerWon ? 'text-primary-400' : 'text-red-400'}`}>
                {playerWon ? t.victory : t.defeat}
              </p>
              {playerWon && <p className="text-primary-300 text-xs font-almendra">{t.reward}</p>}
              <button onClick={() => endDuel()}
                className="w-full py-3 bg-dark-800 border border-white/15 text-white/80 font-cinzel font-bold text-sm rounded-xl active:scale-95">
                OK
              </button>
            </div>
          )}

          {!isOver && (
            <button onClick={() => endDuel()}
              className="w-full py-2 bg-dark-800 border border-white/10 text-white/40 font-cinzel text-xs rounded-xl active:scale-95">
              {t.flee}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
