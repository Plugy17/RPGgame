import React from 'react';
import { Smartphone } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export const RotateOverlay: React.FC = () => {
  const lang = useGameStore(s => s.language);
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-dark-800 gap-6">
      <div className="relative animate-bounce">
        <Smartphone size={72} className="text-primary-400" style={{ transform: 'rotate(90deg)' }} />
      </div>
      <p className="text-white text-xl font-semibold text-center px-8 leading-relaxed">
        {lang === 'ru'
          ? 'Пожалуйста, переверните\nтелефон горизонтально\nдля погружения в игру'
          : 'Please rotate your device\nto landscape mode\nfor the full experience'}
      </p>
      <div className="flex gap-2 items-center mt-2">
        <div className="w-2 h-2 rounded-full bg-primary-400 animate-ping" />
        <span className="text-primary-300 text-sm">
          {lang === 'ru' ? 'Ожидание поворота...' : 'Waiting for rotation...'}
        </span>
      </div>
    </div>
  );
};
