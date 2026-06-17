import React from 'react';
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { LOCATIONS } from '../data/locations';

const T = {
  ru: {
    settings: 'Настройки', sound: 'Звук', language: 'Язык', on: 'Вкл', off: 'Выкл',
    lang_ru: 'Русский', lang_en: 'English', back: 'Назад', save: 'Сохранено',
    clearData: 'Сбросить прогресс', clearConfirm: 'Вы уверены? Данные будут удалены.',
    locations: 'Локации', unlocked: 'Открыта', locked: 'Закрыта', level_req: 'Нужен ур.',
  },
  en: {
    settings: 'Settings', sound: 'Sound', language: 'Language', on: 'On', off: 'Off',
    lang_ru: 'Russian', lang_en: 'English', back: 'Back', save: 'Saved',
    clearData: 'Reset Progress', clearConfirm: 'Are you sure? Data will be deleted.',
    locations: 'Locations', unlocked: 'Unlocked', locked: 'Locked', level_req: 'Needs lv.',
  },
};

export const SettingsScreen: React.FC = () => {
  const { setScreen, language, soundEnabled, toggleLanguage, toggleSound, locationsUnlocked } = useGameStore();
  const t = T[language];

  const ToggleBtn: React.FC<{ on: boolean; onToggle: () => void }> = ({ on, onToggle }) => (
    <button
      onClick={onToggle}
      className={`relative w-14 h-7 rounded-full border transition-all duration-300 ${
        on ? 'bg-accent-500 border-accent-400' : 'bg-dark-700 border-white/20'
      }`}
    >
      <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all duration-300 flex items-center justify-center text-[9px] font-black ${
        on ? 'right-0.5 text-accent-600' : 'left-0.5 text-dark-700'
      }`}>
        {on ? '✓' : '✗'}
      </span>
    </button>
  );

  return (
    <div className="relative w-full h-full flex flex-col bg-dark-800 overflow-y-auto scrollbar-hide">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
        <button onClick={() => setScreen('menu')} className="text-white/50 hover:text-white">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-white font-bold text-xl">⚙️ {t.settings}</h1>
      </div>

      <div className="flex-1 px-5 py-4 space-y-4">
        {/* Sound */}
        <div className="bg-dark-700 rounded-xl p-4 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {soundEnabled ? <Volume2 size={20} className="text-accent-400" /> : <VolumeX size={20} className="text-white/30" />}
            <div>
              <p className="text-white font-medium">{t.sound}</p>
              <p className="text-white/40 text-xs">{soundEnabled ? t.on : t.off}</p>
            </div>
          </div>
          <ToggleBtn on={soundEnabled} onToggle={toggleSound} />
        </div>

        {/* Language */}
        <div className="bg-dark-700 rounded-xl p-4 border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-white font-medium">🌐 {t.language}</p>
            <p className="text-white/40 text-xs">{language === 'ru' ? t.lang_ru : t.lang_en}</p>
          </div>
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 bg-dark-800 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white/80 hover:border-primary-400/50 transition-colors"
          >
            <span>{language === 'ru' ? '🇷🇺' : '🇬🇧'}</span>
            <span>{language === 'ru' ? 'RU' : 'EN'}</span>
          </button>
        </div>

        {/* Locations map */}
        <div className="bg-dark-700 rounded-xl p-4 border border-white/10">
          <p className="text-white/60 text-sm font-semibold mb-3 uppercase tracking-wider">🗺️ {t.locations}</p>
          <div className="space-y-2">
            {LOCATIONS.map((loc, i) => {
              const unlocked = locationsUnlocked.includes(loc.id);
              return (
                <div key={loc.id} className={`flex items-center gap-3 p-2.5 rounded-lg border ${
                  unlocked ? 'border-accent-500/30 bg-accent-900/10' : 'border-white/5 bg-dark-800/50'
                }`}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black"
                    style={{ backgroundColor: loc.groundColor, color: '#fff' }}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${unlocked ? 'text-white' : 'text-white/40'}`}>
                      {language === 'ru' ? loc.name : loc.nameEn}
                    </p>
                    <p className="text-xs text-white/30">
                      {unlocked ? `✅ ${t.unlocked}` : `🔒 ${t.locked} (${t.level_req} ${loc.unlockLevel})`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Version */}
        <div className="text-center py-4">
          <p className="text-white/20 text-xs">RPG Quest v1.0.0 — Telegram Mini App</p>
        </div>
      </div>
    </div>
  );
};
