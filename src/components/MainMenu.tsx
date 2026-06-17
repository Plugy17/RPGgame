import React, { useEffect, useRef, useState } from 'react';
import { MenuScene } from '../game/MenuScene';
import { useGameStore } from '../store/gameStore';
import { WalletButton } from './WalletButton';
import { P2PMarket } from './P2PMarket';
import { IconPlay, IconHub, IconBackpack, IconProfile, IconStats, IconSettings, IconMarket, IconFriends, IconAlliance, IconAirdrop, IconGold, IconCrown } from './GameIcons';

const T = {
  ru: { play:'ИГРАТЬ', hub:'Цитадель', inventory:'Инвентарь', profile:'Профиль', stats:'Статистика',
        settings:'Настройки', tagline:'Мир ждёт героя', market:'P2P Рынок', gold:'золота',
        friends:'Друзья', alliance:'Альянсы', airdrop:'Airdrop $AZR', charCreate:'Создать' },
  en: { play:'PLAY', hub:'Citadel', inventory:'Inventory', profile:'Profile', stats:'Statistics',
        settings:'Settings', tagline:'The world awaits a hero', market:'P2P Market', gold:'gold',
        friends:'Friends', alliance:'Alliances', airdrop:'Airdrop $AZR', charCreate:'Create' },
};

const OrnateCorner = ({ className = '', flip = '' }: { className?: string; flip?: string }) => (
  <svg className={`absolute w-8 h-8 text-primary-300/60 ${className}`} viewBox="0 0 32 32" fill="none">
    <g transform={flip}>
      <path d="M4 28 L4 8 Q4 4 8 4 L28 4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M4 20 Q4 12 12 12 L20 12" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.6"/>
      <circle cx="8" cy="8" r="2" fill="currentColor" opacity="0.8"/>
      <circle cx="4" cy="4" r="1" fill="currentColor"/>
    </g>
  </svg>
);

const OrnateBorder = ({ vertical = false }: { vertical?: boolean }) => (
  <svg
    className={`absolute ${vertical ? 'w-2.5 h-full top-0' : 'w-full h-2.5 left-0'} text-primary-400/30`}
    viewBox={vertical ? "0 0 10 100" : "0 0 100 10"}
    preserveAspectRatio="none"
    fill="none"
  >
    <line
      x1={vertical ? "5" : "0"} y1={vertical ? "0" : "5"}
      x2={vertical ? "5" : "100"} y2={vertical ? "100" : "5"}
      stroke="currentColor"
      strokeWidth="0.5"
      strokeDasharray="4 2"
    />
  </svg>
);

const DecorativeRune = ({ className = '' }: { className?: string }) => (
  <svg className={`text-primary-400/40 ${className}`} width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M12 2 L12 22" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M6 8 L12 2 L18 8" stroke="currentColor" strokeWidth="1" opacity="0.7"/>
    <path d="M6 16 L12 22 L18 16" stroke="currentColor" strokeWidth="1" opacity="0.7"/>
    <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1"/>
  </svg>
);

const OrnateButtonFrame = ({ children, primary = false, accent = false, className = '', onClick }: {
  children: React.ReactNode;
  primary?: boolean;
  accent?: boolean;
  className?: string;
  onClick?: () => void;
}) => {
  const borderColorClass = primary
    ? 'text-primary-400'
    : accent
      ? 'text-accent-400'
      : 'text-secondary-400';

  return (
    <button
      onClick={onClick}
      className={`relative group flex items-center justify-center gap-2 px-3 py-2.5 transition-all duration-300 active:scale-95 ${className}`}
    >
      <svg className={`absolute inset-0 w-full h-full ${borderColorClass}`} viewBox="0 0 120 40" preserveAspectRatio="none">
        <path
          d="M2 20 L2 8 Q2 2 8 2 L40 2 L50 6 L70 6 L80 2 L112 2 Q118 2 118 8 L118 32 Q118 38 112 38 L80 38 L70 34 L50 34 L40 38 L8 38 Q2 38 2 32 Z"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="rgba(13,13,26,0.85)"
          className="group-hover:fill-opacity-100"
        />
        <path
          d="M6 20 L6 12 Q6 6 12 6 L38 6 L46 10 L74 10 L82 6 L108 6 Q114 6 114 12 L114 28 Q114 34 108 34 L82 34 L74 30 L46 30 L38 34 L12 34 Q6 34 6 28 Z"
          stroke="currentColor"
          strokeWidth="0.5"
          fill="none"
          opacity="0.5"
        />
      </svg>
      <span className="relative z-10">{children}</span>
    </button>
  );
};

const MainMenuButton = ({
  children,
  onClick,
  primary = false,
  className = ''
}: {
  children: React.ReactNode;
  onClick?: () => void;
  primary?: boolean;
  className?: string;
}) => (
  <button
    onClick={onClick}
    className={`relative group ${className}`}
  >
    <svg
      className={`absolute inset-0 w-full h-full transition-all duration-300 ${
        primary ? 'text-primary-400' : 'text-white/30'
      }`}
      viewBox="0 0 140 44"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`btnGrad-${primary ? 'primary' : 'default'}`} x1="0%" y1="0%" x2="100%" y2="0%">
          {primary ? (
            <>
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.2"/>
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.9"/>
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.2"/>
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#fff" stopOpacity="0"/>
              <stop offset="50%" stopColor="#fff" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#fff" stopOpacity="0"/>
            </>
          )}
        </linearGradient>
      </defs>
      <path
        d="M8 0 L132 0 Q140 0 140 8 L140 36 Q140 44 132 44 L8 44 Q0 44 0 36 L0 8 Q0 0 8 0 Z"
        fill={primary ? "url(#btnGrad-primary)" : "rgba(26,26,46,0.9)"}
        stroke="currentColor"
        strokeWidth="1"
        className="group-hover:stroke-primary-300"
      />
      <path
        d="M3 10 L3 34 M137 10 L137 34 M10 3 L130 3 M10 41 L130 41"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeDasharray="3 3"
        opacity="0.3"
      />
    </svg>
    <div className={`relative z-10 flex items-center justify-center gap-2 px-5 py-2.5 rounded ${
      primary ? 'text-dark-800' : 'text-white/90'
    }`}>
      {children}
    </div>
  </button>
);

export const MainMenu: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<MenuScene | null>(null);
  const setScreen = useGameStore(s => s.setScreen);
  const lang = useGameStore(s => s.language);
  const playerName = useGameStore(s => s.playerName);
  const playerLevel = useGameStore(s => s.playerLevel);
  const goldBalance = useGameStore(s => s.goldBalance);
  const characterRace = useGameStore(s => s.characterRace);
  const attributes = useGameStore(s => s.attributes);
  const [showMarket, setShowMarket] = useState(false);
  const t = T[lang];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scene = new MenuScene(canvas);
    sceneRef.current = scene;
    scene.start();
    const ro = new ResizeObserver(() => scene.resize(canvas.clientWidth, canvas.clientHeight));
    ro.observe(canvas);
    return () => { scene.dispose(); ro.disconnect(); };
  }, []);

  useEffect(() => {
    sceneRef.current?.updateRace(characterRace);
  }, [characterRace]);

  const menuButtons = [
    { key: 'hub',      Icon: IconHub,      screen: 'hub' as const,       accent: true },
    { key: 'airdrop',  Icon: IconAirdrop,  screen: 'airdrop' as const },
    { key: 'friends',  Icon: IconFriends,  screen: 'friends' as const },
    { key: 'alliance', Icon: IconAlliance, screen: 'alliance' as const },
    { key: 'inventory',Icon: IconBackpack, screen: 'inventory' as const },
    { key: 'profile',  Icon: IconProfile,  screen: 'profile' as const },
    { key: 'stats',    Icon: IconStats,    screen: 'stats' as const },
    { key: 'settings', Icon: IconSettings, screen: 'settings' as const },
  ];

  return (
    <div className="relative w-full h-full flex flex-col items-center overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }} />

      <div className="absolute inset-0 bg-gradient-to-t from-dark-800/95 via-dark-800/40 to-dark-800/60" style={{ zIndex: 1 }} />

      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        opacity: 0.03
      }} />

      <div className="relative z-10 w-full flex items-center justify-between px-4 mt-3">
        <div className="relative">
          <svg className="absolute inset-0 w-full h-full scale-x-110 text-primary-500/25" viewBox="0 0 120 32" preserveAspectRatio="none">
            <rect x="1" y="1" width="118" height="30" rx="16" fill="rgba(13,13,26,0.85)" stroke="currentColor" strokeWidth="1"/>
          </svg>
          <div className="relative flex items-center gap-1.5 px-3 py-1.5">
            <IconGold size={14} glow />
            <span className="text-primary-300 text-xs font-bold font-cinzel">{goldBalance}</span>
            <span className="text-white/30 text-[10px]">{t.gold}</span>
          </div>
        </div>
        <WalletButton />
      </div>

      <div className="relative z-10 mt-4 flex flex-col items-center anim-fade-in">
        <DecorativeRune className="mb-2 animate-pulse" />

        <div className="relative">
          <h1 className="font-cinzel font-black text-2xl sm:text-3xl text-white tracking-[0.2em] text-center leading-tight px-6" style={{
            textShadow: '0 0 30px rgba(251,191,36,0.8), 0 2px 4px rgba(0,0,0,0.8)',
          }}>
            CHRONICLES
          </h1>
          <div className="flex items-center gap-2 my-1">
            <svg className="text-primary-400 w-16 h-2" viewBox="0 0 64 8" preserveAspectRatio="none">
              <path d="M0 4 L28 4 L32 0 L36 4 L64 4" stroke="currentColor" strokeWidth="0.75" fill="none"/>
            </svg>
            <span className="text-primary-400 text-4xl font-almendra tracking-[0.15em]">OF</span>
            <svg className="text-primary-400 w-16 h-2" viewBox="0 0 64 8" preserveAspectRatio="none">
              <path d="M0 4 L28 4 L32 8 L36 4 L64 4" stroke="currentColor" strokeWidth="0.75" fill="none"/>
            </svg>
          </div>
          <h1 className="font-cinzel font-black text-2xl sm:text-3xl text-primary-300 tracking-[0.2em] text-center leading-tight" style={{
            textShadow: '0 0 25px rgba(251,191,36,0.6), 0 2px 4px rgba(0,0,0,0.8)',
          }}>
            AZERIA
          </h1>
        </div>

        <p className="text-accent-400/80 text-xs font-almendra tracking-[0.25em] mt-2 uppercase anim-rune">{t.tagline}</p>

        <DecorativeRune className="mt-2 rotate-180" />
      </div>

      <div className="relative z-10 mt-3 flex items-center gap-3 anim-fade-in">
        <svg className="absolute inset-0 w-full h-full text-primary-400/15" viewBox="0 0 300 44" preserveAspectRatio="none">
          <path d="M4 22 L4 10 Q4 4 10 4 L40 4 L50 0 L241 0 L241 0 L250 4 L290 4 Q296 4 296 10 L296 34 Q296 42 290 42 L250 42 L241 46 L50 46 L40 42 L10 42 Q4 42 4 34 Z"
            stroke="currentColor" strokeWidth="1" fill="rgba(13,13,26,0.9)"/>
        </svg>

        <div className="relative flex items-center gap-3 px-4 py-2">
          <div className="relative">
            <svg className="absolute inset-0 scale-110 text-primary-400" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="1"/>
              <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="0.5" opacity="0.5"/>
            </svg>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-xs font-black text-dark-800 font-cinzel">
              {playerLevel}
            </div>
          </div>
          <span className="text-white/90 text-sm font-almendra font-medium">{playerName}</span>
          <div className="flex gap-2 text-[9px] font-cinzel">
            <span className="text-red-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400"/>
              STR {attributes.strength}
            </span>
            <span className="text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400"/>
              DEX {attributes.dexterity}
            </span>
            <span className="text-blue-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"/>
              INT {attributes.intelligence}
            </span>
          </div>
          {attributes.unspent > 0 && (
            <button onClick={() => setScreen('attributes')}
              className="relative bg-gradient-to-r from-primary-500 to-primary-400 text-dark-800 text-[10px] font-bold px-2.5 py-1 font-cinzel animate-pulse rounded">
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent-400 rounded-full"/>
              +{attributes.unspent}
            </button>
          )}
        </div>
      </div>

      <div className="relative z-10 mt-auto w-full anim-slide-up">
        <div className="relative px-6 mb-3">
          <div className="flex justify-center gap-1 mb-3">
            <svg className="text-primary-400 w-20 h-3 opacity-60" viewBox="0 0 80 12" preserveAspectRatio="none">
              <path d="M0 6 L35 6 L40 2 L45 6 L80 6" stroke="currentColor" strokeWidth="1" fill="none"/>
            </svg>
          </div>

          <button onClick={() => setScreen('game')} className="relative w-full group">
            <svg className="absolute inset-0 w-full h-full text-primary-400" viewBox="0 0 280 48" preserveAspectRatio="none">
              <defs>
                <linearGradient id="playBtnGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.7"/>
                  <stop offset="50%" stopColor="#f59e0b" stopOpacity="1"/>
                  <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.7"/>
                </linearGradient>
              </defs>
              <path d="M8 0 L272 0 Q280 0 280 8 L280 40 Q280 48 272 48 L8 48 Q0 48 0 40 L0 8 Q0 0 8 0 Z"
                fill="url(#playBtnGrad)" stroke="currentColor" strokeWidth="2"/>
              <path d="M4 10 L4 38 M276 10 L276 38 M10 4 L80 4 L90 8 L190 8 L200 4 L270 4"
                stroke="currentColor" strokeWidth="0.5" opacity="0.3" fill="none"/>
            </svg>
            <div className="relative flex items-center justify-center gap-2 py-3 text-dark-800 font-cinzel font-black text-base tracking-[0.15em] uppercase">
              <IconPlay size={20} /> {t.play}
            </div>
          </button>
        </div>

        <div className="relative">
          <svg className="absolute inset-0 w-full h-full text-dark-800/90" viewBox="0 0 100 100" preserveAspectRatio="none">
            <rect x="0" y="0" width="100" height="100" fill="rgba(13,13,26,0.95)"/>
          </svg>

          <div className="h-px bg-gradient-to-r from-transparent via-primary-400/50 to-transparent"/>

          <OrnateCorner className="left-2 top-2" />
          <OrnateCorner className="right-2 top-2" flip="scale(-1,1)" />
          <OrnateCorner className="left-2 bottom-2" flip="scale(1,-1)" />
          <OrnateCorner className="right-2 bottom-2" flip="scale(-1,-1)" />

          <div className="relative px-4 pt-4 pb-6">
            <div className="grid grid-cols-4 gap-2">
              {menuButtons.map(item => (
                <button key={item.key} onClick={() => setScreen(item.screen)}
                  className={`relative group flex flex-col items-center gap-1.5 py-2.5 transition-all duration-300 active:scale-95 ${
                    item.accent ? 'text-primary-400' : 'text-white/70'
                  }`}>
                  <svg className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${
                    item.accent ? 'text-primary-400/25' : 'text-white/10'
                  } group-hover:opacity-100 opacity-60`}
                    viewBox="0 0 60 60" preserveAspectRatio="none">
                    <path d="M5 5 L55 5 Q60 5 60 10 L60 50 Q60 58 55 58 L5 58 Q0 58 0 50 L0 10 Q0 5 5 5 Z"
                      fill={item.accent ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.03)"}
                      stroke="currentColor" strokeWidth="0.5"/>
                  </svg>
                  <item.Icon size={18} glow={item.accent} />
                  <span className="text-[9px] font-cinzel font-semibold tracking-wider">{t[item.key as keyof typeof t]}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-2 mt-3">
              <button onClick={() => setShowMarket(true)}
                className="relative flex-1 group flex items-center justify-center gap-2 py-2.5 active:scale-95 transition-transform text-accent-400">
                <svg className="absolute inset-0 w-full h-full text-accent-400/20" viewBox="0 0 120 44" preserveAspectRatio="none">
                  <path d="M4 0 L116 0 Q120 0 120 4 L120 40 Q120 44 116 44 L4 44 Q0 44 0 40 L0 4 Q0 0 4 0 Z"
                    fill="rgba(16,185,129,0.15)" stroke="currentColor" strokeWidth="1"/>
                </svg>
                <IconMarket size={14} glow />
                <span className="text-[10px] font-cinzel font-semibold tracking-wider relative z-10">{t.market}</span>
              </button>
              <button onClick={() => setScreen('charcreate')}
                className="relative flex-1 group flex items-center justify-center gap-2 py-2.5 active:scale-95 transition-transform text-secondary-400">
                <svg className="absolute inset-0 w-full h-full text-secondary-400/20" viewBox="0 0 120 44" preserveAspectRatio="none">
                  <path d="M4 0 L116 0 Q120 0 120 4 L120 40 Q120 44 116 44 L4 44 Q0 44 0 40 L0 4 Q0 0 4 0 Z"
                    fill="rgba(59,130,246,0.15)" stroke="currentColor" strokeWidth="1"/>
                </svg>
                <IconCrown size={14} />
                <span className="text-[10px] font-cinzel font-semibold tracking-wider relative z-10">{t.charCreate}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showMarket && <P2PMarket onClose={() => setShowMarket(false)} />}
    </div>
  );
};
