import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { RACES, CLASSES, type Race, type CharClass } from '../data/classes';
import { IconClassWarrior, IconClassMage, IconClassArcher } from './GameIcons';

const CLASS_ICONS: Record<string, React.FC<{ size?: number }>> = {
  warrior: IconClassWarrior,
  mage: IconClassMage,
  archer: IconClassArcher,
};

const RACE_ICONS: Record<Race, string> = {
  human: 'H', elf: 'E', orc: 'O', undead: 'U',
};

const T = {
  ru: { title: 'Создание Персонажа', race: 'Раса', class: 'Класс', confirm: 'Начать Путешествие', human: 'Человек', elf: 'Эльф', orc: 'Орк', undead: 'Нежить' },
  en: { title: 'Character Creation', race: 'Race', class: 'Class', confirm: 'Begin Your Journey', human: 'Human', elf: 'Elf', orc: 'Orc', undead: 'Undead' },
};

export const CharacterCreationScreen: React.FC = () => {
  const { language, setCharacterRace, setCharacterClass, setScreen, characterRace, characterClass } = useGameStore();
  const [selectedRace, setSelectedRace] = useState<Race>(characterRace);
  const [selectedClass, setSelectedClass] = useState<CharClass>(characterClass);
  const t = T[language];

  const handleConfirm = () => {
    setCharacterRace(selectedRace);
    setCharacterClass(selectedClass);
    setScreen('menu');
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-dark-800 overflow-y-auto scrollbar-hide">
      <div className="px-5 py-4 border-b border-white/10">
        <h1 className="text-white font-title font-bold text-xl anim-rune">{t.title}</h1>
      </div>

      <div className="flex-1 px-5 py-5 space-y-6 anim-fade-in">
        {/* Race Selection */}
        <div>
          <p className="text-primary-400 font-title font-semibold text-sm tracking-wider mb-3 anim-rune">{t.race}</p>
          <div className="grid grid-cols-2 gap-3">
            {RACES.map(r => (
              <button key={r.id}
                onClick={() => setSelectedRace(r.id)}
                className={`relative p-4 rounded-xl border transition-all active:scale-95 ${
                  selectedRace === r.id
                    ? 'border-primary-400 bg-primary-900/20'
                    : 'border-white/10 bg-dark-700 hover:border-white/20'
                }`}>
                <div className="w-10 h-10 rounded-full border-2 border-primary-400/50 flex items-center justify-center mx-auto mb-2"
                  style={{ background: `#${new THREE.Color(r.skinColor).getHexString()}33` }}>
                  <span className="text-primary-400 font-title font-black text-lg">{RACE_ICONS[r.id]}</span>
                </div>
                <p className="text-white/90 font-title font-bold text-sm text-center">{language === 'ru' ? r.name : r.nameEn}</p>
                <p className="text-white/40 text-[10px] text-center mt-1">{language === 'ru' ? r.desc : r.descEn}</p>
                <div className="flex justify-center gap-2 mt-2 text-[9px]">
                  <span className="text-red-400">STR {r.baseStats.strength}</span>
                  <span className="text-green-400">DEX {r.baseStats.dexterity}</span>
                  <span className="text-blue-400">INT {r.baseStats.intelligence}</span>
                </div>
                {selectedRace === r.id && (
                  <div className="absolute inset-0 rounded-xl pointer-events-none" style={{ boxShadow: 'inset 0 0 20px rgba(251,191,36,0.15)' }} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Class Selection */}
        <div>
          <p className="text-primary-400 font-title font-semibold text-sm tracking-wider mb-3 anim-rune">{t.class}</p>
          <div className="grid grid-cols-3 gap-2">
            {CLASSES.map(c => {
              const IconComp = CLASS_ICONS[c.id];
              return (
                <button key={c.id}
                  onClick={() => setSelectedClass(c.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all active:scale-95 ${
                    selectedClass === c.id
                      ? 'border-primary-400 bg-primary-900/20'
                      : 'border-white/10 bg-dark-700 hover:border-white/20'
                  }`}>
                  {IconComp && <IconComp size={32} />}
                  <span className="font-title font-bold text-xs" style={{ color: c.color }}>
                    {language === 'ru' ? c.name : c.nameEn}
                  </span>
                  <p className="text-white/30 text-[8px] text-center leading-tight">{language === 'ru' ? c.desc : c.descEn}</p>
                </button>
              );
            })}
          </div>
        </div>

        <button onClick={handleConfirm}
          className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-400 text-dark-800 font-title font-black text-base tracking-widest uppercase rounded-xl active:scale-95 anim-glow"
          style={{ boxShadow: '0 0 30px rgba(251,191,36,0.4)' }}>
          {t.confirm}
        </button>
      </div>
    </div>
  );
};

import * as THREE from 'three';
