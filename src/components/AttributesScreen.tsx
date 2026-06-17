import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { IconSword, IconShield, IconHerb, IconProfile } from './GameIcons';

const T = {
  ru: { title: 'Характеристики', back: 'Назад', str: 'Сила', dex: 'Ловкость', int: 'Интеллект',
        unspent: 'Свободных очков', strDesc: 'Увеличивает урон и защиту', dexDesc: 'Увеличивает скорость сбора и ловкость', intDesc: 'Увеличивает бонус опыта и магию',
        stats: 'Итоговые статы', defense: 'Защита', damage: 'Урон', gather: 'Сбор', xpBonus: 'Бонус опыта' },
  en: { title: 'Attributes', back: 'Back', str: 'Strength', dex: 'Dexterity', int: 'Intelligence',
        unspent: 'Unspent points', strDesc: 'Increases damage and defense', dexDesc: 'Increases gather speed and agility', intDesc: 'Increases XP bonus and magic',
        stats: 'Resulting stats', defense: 'Defense', damage: 'Damage', gather: 'Gather', xpBonus: 'XP Bonus' },
};

const ATTR_CONFIG = [
  { key: 'strength' as const, labelRu: 'Сила', labelEn: 'Strength', descRu: 'Увеличивает урон и защиту', descEn: 'Increases damage and defense', color: 'text-red-400', Icon: IconSword, glowColor: 'rgba(239,68,68,0.3)' },
  { key: 'dexterity' as const, labelRu: 'Ловкость', labelEn: 'Dexterity', descRu: 'Увеличивает скорость сбора', descEn: 'Increases gather speed', color: 'text-green-400', Icon: IconHerb, glowColor: 'rgba(34,197,94,0.3)' },
  { key: 'intelligence' as const, labelRu: 'Интеллект', labelEn: 'Intelligence', descRu: 'Увеличивает бонус опыта', descEn: 'Increases XP bonus', color: 'text-blue-400', Icon: IconShield, glowColor: 'rgba(59,130,246,0.3)' },
];

export const AttributesScreen: React.FC = () => {
  const { setScreen, language, attributes, allocateAttribute, computedStats } = useGameStore();
  const t = T[language];

  return (
    <div className="relative w-full h-full flex flex-col bg-dark-800 overflow-y-auto scrollbar-hide">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
        <button onClick={() => setScreen('profile')} className="text-white/50 hover:text-white"><ArrowLeft size={20} /></button>
        <h1 className="text-white font-title font-bold text-xl anim-rune">{t.title}</h1>
      </div>

      <div className="flex-1 px-5 py-5 space-y-5 anim-fade-in">
        {/* Unspent points */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-primary-900/20 border border-primary-400/30 rounded-full px-4 py-2">
            <IconProfile size={16} glow />
            <span className="text-primary-400 font-title font-bold text-lg">{attributes.unspent}</span>
            <span className="text-white/50 text-xs">{t.unspent}</span>
          </div>
        </div>

        {/* Attribute rows */}
        {ATTR_CONFIG.map(attr => (
          <div key={attr.key} className="bg-dark-700 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: attr.glowColor }}>
                  <attr.Icon size={22} />
                </div>
                <div>
                  <p className={`font-title font-bold text-sm ${attr.color}`}>{language === 'ru' ? attr.labelRu : attr.labelEn}</p>
                  <p className="text-white/30 text-[10px]">{language === 'ru' ? attr.descRu : attr.descEn}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-white font-title font-black text-2xl">{attributes[attr.key]}</span>
                <button onClick={() => allocateAttribute(attr.key)}
                  disabled={attributes.unspent <= 0}
                  className={`w-9 h-9 rounded-lg font-black text-lg flex items-center justify-center active:scale-90 ${
                    attributes.unspent > 0
                      ? 'bg-primary-500 text-dark-800'
                      : 'bg-dark-800 text-white/20 cursor-not-allowed'
                  }`}>
                  +
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Computed stats */}
        <div className="bg-dark-700 rounded-xl p-4 border border-white/10">
          <p className="text-primary-400 font-title font-semibold text-sm mb-3 anim-rune">{t.stats}</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: t.defense, value: computedStats.defense, color: 'text-blue-400' },
              { label: t.damage, value: computedStats.damage.toFixed(1), color: 'text-red-400' },
              { label: t.gather, value: `x${computedStats.gatherSpeed.toFixed(2)}`, color: 'text-green-400' },
              { label: t.xpBonus, value: `${(computedStats.xpBonus * 100).toFixed(0)}%`, color: 'text-primary-400' },
            ].map(s => (
              <div key={s.label} className="bg-dark-800 rounded-lg p-2 text-center border border-white/5">
                <span className={`text-lg font-black font-title ${s.color}`}>{s.value}</span>
                <p className="text-white/30 text-[10px]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
