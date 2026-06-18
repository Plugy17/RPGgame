import React, { useEffect, useRef, useState } from 'react';
import { MenuScene } from '../game/MenuScene';
import { useGameStore } from '../store/gameStore';
import { WalletButton } from './WalletButton';
import { P2PMarket } from './P2PMarket';
import { playSfx } from '../audio/sfx';
import { IconPlay, IconHub, IconBackpack, IconProfile, IconStats, IconSettings, IconMarket, IconFriends, IconAlliance, IconAirdrop, IconGold, IconCrown, IconSword, IconShield, IconMagic, IconBow, IconClassWarrior, IconClassMage, IconClassArcher } from './GameIcons';

const T = {
  ru: {
    play:'ВОЙТИ В МИР', hub:'ЦИТАДЕЛЬ', inventory:'СУМКА', profile:'ГЕРОЙ',
    stats:'ХАРАКТЕРИСТИКИ', settings:'НАСТРОЙКИ', tagline:'Мир ждёт своего героя',
    market:'ТОРГОВАЯ ПЛОЩАДЬ', gold:'золота', friends:'ДРУЗЬЯ', alliance:'АЛЬЯНСЫ',
    airdrop:'ДРОП $AZR', charCreate:'СОЗДАТЬ ГЕРОЯ', level: 'УРОВЕНЬ'
  },
  en: {
    play:'ENTER THE WORLD', hub:'CITADEL', inventory:'INVENTORY', profile:'HERO',
    stats:'STATS', settings:'SETTINGS', tagline:'The world awaits its hero',
    market:'TRADE QUARTER', gold:'gold', friends:'FRIENDS', alliance:'ALLIANCES',
    airdrop:'$AZR DROP', charCreate:'CREATE HERO', level: 'LEVEL'
  },
};

/** WoW-style ornate corner SVG */
const WowCorner = ({ className = '', flip = '' }: { className?: string; flip?: string }) => (
  <svg className={`absolute w-10 h-10 text-wow-gold/50 ${className}`} viewBox="0 0 40 40" fill="none" style={{ transform: flip }}>
    <path d="M4 36 L4 12 Q4 4 12 4 L36 4" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M4 24 Q4 14 14 14 L24 14" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5"/>
    <circle cx="10" cy="10" r="3" fill="currentColor" opacity="0.7"/>
    <circle cx="4" cy="4" r="1.5" fill="currentColor"/>
    <path d="M8 8 L12 12 M12 8 L8 12" stroke="currentColor" strokeWidth="0.8" opacity="0.4"/>
  </svg>
);

/** WoW-style runic separator */
const WowSeparator = ({ className = '' }: { className?: string }) => (
  <svg className={`w-full h-3 text-wow-gold/40 ${className}`} viewBox="0 0 200 12" preserveAspectRatio="none" fill="none">
    <path d="M0 6 L60 6 L65 2 L70 6 L75 10 L80 6 L85 2 L90 6 L95 10 L100 6 L105 2 L110 6 L115 10 L120 6 L125 2 L130 6 L135 10 L140 6 L200 6" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="65" cy="4" r="1.5" fill="currentColor" opacity="0.6"/>
    <circle cx="85" cy="4" r="1.5" fill="currentColor" opacity="0.6"/>
    <circle cx="105" cy="4" r="1.5" fill="currentColor" opacity="0.6"/>
    <circle cx="125" cy="4" r="1.5" fill="currentColor" opacity="0.6"/>
  </svg>
);

/** WoW-styled navigation button */
const WowNavButton = ({
  icon: Icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.FC<{ size?: number; className?: string }>;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) => (
  <button
    onClick={() => { playSfx('coin'); onClick?.(); }}
    className={`relative group flex flex-col items-center gap-1 py-2.5 px-2 transition-all duration-300 active:scale-95 ${
      active ? 'text-wow-gold' : 'text-wow-gold-dark/70 hover:text-wow-gold/80'
    }`}
  >
    <svg className="absolute inset-0 w-full h-full transition-all duration-300 opacity-0 group-hover:opacity-100" viewBox="0 0 60 60" preserveAspectRatio="none">
      <path d="M5 5 L55 5 Q60 5 60 10 L60 50 Q60 58 55 58 L5 58 Q0 58 0 50 L0 10 Q0 5 5 5 Z"
        fill="rgba(139,122,58,0.08)" stroke="currentColor" strokeWidth="0.5" opacity="0.5"/>
    </svg>
    <Icon size={18} />
    <span className="text-[8px] font-wow-heading tracking-widest">{label}</span>
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
  const characterClass = useGameStore(s => s.characterClass);
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

  /** Class icon for character display */
  const ClassIcon = characterClass === 'warrior' ? IconClassWarrior :
    characterClass === 'mage' ? IconClassMage : IconClassArcher;

  return (
    <div className="relative w-full h-full flex flex-col items-center overflow-hidden wow-stone">
      {/* 3D Canvas — full screen background */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }} />

      {/* Dark vignette overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        zIndex: 1,
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(10,10,15,0.95) 100%)'
      }} />

      {/* Top bar — Gold & Wallet */}
      <div className="relative z-10 w-full flex items-center justify-between px-4 mt-3">
        {/* Gold display — WoW style */}
        <div className="relative wow-panel rounded-lg px-3 py-1.5">
          <div className="relative flex items-center gap-2">
            <IconGold size={16} glow />
            <span className="wow-gold text-xs font-wow-heading">{goldBalance.toLocaleString()}</span>
            <span className="text-wow-gold-dark/50 text-[9px] font-wow">{t.gold}</span>
          </div>
        </div>
        <WalletButton />
      </div>

      {/* Center content — Title + Character area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full" style={{ marginTop: '-5vh' }}>
        {/* Title — WoW Epic Style */}
        <div className="relative mb-2 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-1">
            <svg className="text-wow-gold w-20 h-4 opacity-60" viewBox="0 0 80 16" preserveAspectRatio="none">
              <path d="M0 8 L20 8 L25 4 L30 8 L35 12 L40 8 L45 4 L50 12 L55 8 L60 4 L65 8 L80 8" stroke="currentColor" strokeWidth="1" fill="none"/>
            </svg>
            <span className="text-wow-gold/50 text-[10px] font-wow-heading tracking-[0.5em]">VOLUME</span>
            <svg className="text-wow-gold w-20 h-4 opacity-60" viewBox="0 0 80 16" preserveAspectRatio="none" style={{ transform: 'scaleX(-1)' }}>
              <path d="M0 8 L20 8 L25 4 L30 8 L35 12 L40 8 L45 4 L50 12 L55 8 L60 4 L65 8 L80 8" stroke="currentColor" strokeWidth="1" fill="none"/>
            </svg>
          </div>

          <h1 className="font-wow-heading text-3xl sm:text-4xl text-wow-gold tracking-[0.15em] text-center leading-none"
            style={{ textShadow: '0 0 30px rgba(212,168,74,0.8), 0 4px 8px rgba(0,0,0,0.9), 0 0 60px rgba(212,168,74,0.3)' }}>
            CHRONICLES
          </h1>

          <div className="flex items-center gap-2 my-1">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-wow-gold/50"/>
            <span className="text-wow-gold text-lg font-wow italic tracking-[0.3em]">of</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-wow-gold/50"/>
          </div>

          <h1 className="font-wow-heading text-3xl sm:text-4xl text-wow-gold tracking-[0.2em] text-center leading-none"
            style={{ textShadow: '0 0 30px rgba(212,168,74,0.6), 0 4px 8px rgba(0,0,0,0.9)' }}>
            AZERIA
          </h1>

          <p className="text-wow-gold-dark/60 text-xs font-wow italic tracking-[0.3em] mt-2 uppercase anim-rune">
            {t.tagline}
          </p>
        </div>

        {/* Character Info Bar — WoW Style */}
        <div className="relative wow-panel rounded-lg px-4 py-2 mt-1 flex items-center gap-3">
          <ClassIcon size={20} />
          <div className="h-8 w-px bg-gradient-to-b from-wow-gold/50 via-wow-gold/20 to-transparent"/>
          <div className="relative">
            <span className="text-wow-gold-dark/50 text-[8px] font-wow-heading tracking-widest">{t.level}</span>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-wow-gold" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
                <text x="10" y="13" textAnchor="middle" fill="currentColor" fontSize="10" fontFamily="Cinzel" fontWeight="bold">{playerLevel}</text>
              </svg>
              <span className="text-white/90 text-sm font-wow-heading">{playerName}</span>
            </div>
          </div>
          <div className="h-8 w-px bg-gradient-to-b from-wow-gold/50 via-wow-gold/20 to-transparent"/>
          <div className="flex gap-2 text-[8px] font-wow-heading">
            <span className="text-red-400/80">⚔️ {attributes.strength}</span>
            <span className="text-green-400/80">🎯 {attributes.dexterity}</span>
            <span className="text-blue-400/80">✨ {attributes.intelligence}</span>
          </div>
          {attributes.unspent > 0 && (
            <button onClick={() => { playSfx('coin'); setScreen('attributes'); }}
              className="wow-btn text-[8px] px-2 py-0.5 rounded animate-wow-glow font-wow-heading">
              +{attributes.unspent}
            </button>
          )}
        </div>
      </div>

      {/* Bottom panel — WoW Style Navigation */}
      <div className="relative z-10 w-full anim-slide-up">
        {/* Play Button */}
        <div className="relative px-6 mb-4">
          <WowSeparator className="mb-3" />
          <button
            onClick={() => { playSfx('magic_cast'); setScreen('game'); }}
            className="relative w-full group wow-btn rounded-sm py-3 text-lg"
          >
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 280 48" preserveAspectRatio="none">
              <defs>
                <linearGradient id="wowPlayBtn" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b7535" stopOpacity="0"/>
                  <stop offset="50%" stopColor="#c4a84a" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#8b7535" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <rect x="2" y="2" width="276" height="44" rx="2" fill="url(#wowPlayBtn)" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
            </svg>
            <div className="relative flex items-center justify-center gap-3">
              <IconPlay size={22} />
              <span className="tracking-[0.2em]">{t.play}</span>
              <IconSword size={16} />
            </div>
          </button>
        </div>

        {/* Navigation Grid — WoW Style */}
        <div className="relative wow-panel rounded-t-lg">
          <WowCorner className="left-2 top-2" />
          <WowCorner className="right-2 top-2" flip="scale(-1,1)" />
          <WowCorner className="left-2 bottom-2" flip="scale(1,-1)" />
          <WowCorner className="right-2 bottom-2" flip="scale(-1,-1)" />

          <div className="relative px-3 pt-3 pb-4">
            <div className="grid grid-cols-4 gap-1">
              {menuButtons.map(item => (
                <WowNavButton
                  key={item.key}
                  icon={item.Icon}
                  label={t[item.key as keyof typeof t] as string}
                  active={item.accent}
                  onClick={() => setScreen(item.screen)}
                />
              ))}
            </div>

            <div className="wow-separator my-2"/>

            <div className="flex gap-2">
              <button onClick={() => { playSfx('coin'); setShowMarket(true); }}
                className="relative flex-1 wow-btn rounded-sm py-2 text-[9px]">
                <div className="flex items-center justify-center gap-2">
                  <IconMarket size={14} />
                  <span className="tracking-widest">{t.market}</span>
                </div>
              </button>
              <button onClick={() => { playSfx('magic_cast'); setScreen('charcreate'); }}
                className="relative flex-1 wow-btn rounded-sm py-2 text-[9px]">
                <div className="flex items-center justify-center gap-2">
                  <IconCrown size={14} />
                  <span className="tracking-widest">{t.charCreate}</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showMarket && <P2PMarket onClose={() => setShowMarket(false)} />}
    </div>
  );
};