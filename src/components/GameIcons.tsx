import React from 'react';

type IconProps = { size?: number; className?: string; glow?: boolean };

const WowGlow = (glow?: boolean) =>
  glow ? { filter: 'drop-shadow(0 0 4px rgba(212,168,74,0.7))' } : {};

// === WoW-STYLE ICONS ===

export const IconSword: React.FC<IconProps> = ({ size = 20, className, glow }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={WowGlow(glow)}>
    <path d="M6 18L18 6M18 6L20 4L16 8M18 6L14 2M6 18L2 22L4 20M6 18L8 20" stroke="#d4a84a" strokeWidth="2" strokeLinecap="round"/>
    <path d="M10 10L14 14" stroke="#c084fc" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 8V12M10 10H14" stroke="#d4a84a" strokeWidth="1" opacity="0.5"/>
  </svg>
);

export const IconShield: React.FC<IconProps> = ({ size = 20, className, glow }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={WowGlow(glow)}>
    <path d="M12 2L4 6V12C4 16.4 7.4 20.5 12 22C16.6 20.5 20 16.4 20 12V6L12 2Z" stroke="#d4a84a" strokeWidth="1.8" fill="rgba(212,168,74,0.08)"/>
    <path d="M12 8V16M8 12H16" stroke="#d4a84a" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M8 10L12 6L16 10" stroke="#d4a84a" strokeWidth="1" opacity="0.4"/>
  </svg>
);

export const IconHelmet: React.FC<IconProps> = ({ size = 20, className, glow }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={WowGlow(glow)}>
    <path d="M6 14C6 9 8.5 4 12 4C15.5 4 18 9 18 14V16H6V14Z" stroke="#d4a84a" strokeWidth="1.8" fill="rgba(212,168,74,0.06)"/>
    <path d="M4 16H20V18C20 19 19 20 18 20H6C5 20 4 19 4 18V16Z" stroke="#d4a84a" strokeWidth="1.5" fill="rgba(212,168,74,0.03)"/>
    <path d="M12 4V2" stroke="#d4a84a" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="2" r="1.2" fill="#d4a84a"/>
    <path d="M8 4H16" stroke="#d4a84a" strokeWidth="0.8" opacity="0.4"/>
  </svg>
);

export const IconArmor: React.FC<IconProps> = ({ size = 20, className, glow }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={WowGlow(glow)}>
    <path d="M8 4H16L18 8V18L12 22L6 18V8L8 4Z" stroke="#d4a84a" strokeWidth="1.8" fill="rgba(212,168,74,0.06)"/>
    <path d="M6 8H18M12 8V22" stroke="#d4a84a" strokeWidth="1" opacity="0.5"/>
    <circle cx="12" cy="13" r="2" stroke="#d4a84a" strokeWidth="0.8" opacity="0.4"/>
  </svg>
);

export const IconBoots: React.FC<IconProps> = ({ size = 20, className, glow }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={WowGlow(glow)}>
    <path d="M7 20V10C7 8 8 6 10 6H14C16 6 17 8 17 10V20H7Z" stroke="#d4a84a" strokeWidth="1.8" fill="rgba(212,168,74,0.06)"/>
    <path d="M7 16H17M9 20H15" stroke="#d4a84a" strokeWidth="1.2" opacity="0.6"/>
    <path d="M10 6L12 4L14 6" stroke="#d4a84a" strokeWidth="0.8" opacity="0.4"/>
  </svg>
);

export const IconWood: React.FC<IconProps> = ({ size = 20, className, glow }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={WowGlow(glow)}>
    <path d="M8 20V12L6 14L4 10L12 4L20 10L18 14L16 12V20H8Z" stroke="#b8860b" strokeWidth="1.8" fill="rgba(184,134,11,0.08)"/>
    <path d="M12 8V14M10 11H14" stroke="#b8860b" strokeWidth="1.2" opacity="0.5"/>
  </svg>
);

export const IconOre: React.FC<IconProps> = ({ size = 20, className, glow }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={WowGlow(glow)}>
    <path d="M6 18L3 14L6 6L12 3L18 6L21 14L18 18H6Z" stroke="#94a3b8" strokeWidth="1.8" fill="rgba(148,163,184,0.08)"/>
    <path d="M10 10L14 14M14 10L10 14" stroke="#e2e8f0" strokeWidth="1.5" opacity="0.7"/>
  </svg>
);

export const IconGold: React.FC<IconProps> = ({ size = 20, className, glow }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={WowGlow(glow)}>
    <circle cx="12" cy="12" r="9" stroke="#d4a84a" strokeWidth="2" fill="rgba(212,168,74,0.1)"/>
    <path d="M9 9.5C9 8 10.5 7 12 7C13.5 7 15 8 15 9.5C15 11 13 11.5 12 12.5C11 11.5 9 11 9 9.5Z" fill="#d4a84a"/>
    <path d="M12 12.5V17" stroke="#d4a84a" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="13" r="1" fill="#d4a84a" opacity="0.3"/>
  </svg>
);

export const IconHerb: React.FC<IconProps> = ({ size = 20, className, glow }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={WowGlow(glow)}>
    <path d="M12 20V10M12 10C8 6 4 8 4 12C4 16 8 14 12 10Z" stroke="#22c55e" strokeWidth="1.8" fill="rgba(34,197,94,0.06)"/>
    <path d="M12 14C16 10 20 12 20 16C20 20 16 18 12 14Z" stroke="#22c55e" strokeWidth="1.8" fill="rgba(34,197,94,0.06)"/>
  </svg>
);

// === UI ICONS ===
export const IconPlay: React.FC<IconProps> = ({ size = 20, className, glow }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={WowGlow(glow)}>
    <path d="M5 3L21 12L5 21V3Z" stroke="#d4a84a" strokeWidth="2" fill="rgba(212,168,74,0.12)"/>
    <path d="M8 8V16L17 12Z" fill="#d4a84a" opacity="0.5"/>
  </svg>
);

export const IconHub: React.FC<IconProps> = ({ size = 20, className, glow }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={WowGlow(glow)}>
    <path d="M12 2L2 8V18L12 22L22 18V8L12 2Z" stroke="#d4a84a" strokeWidth="1.8" fill="rgba(212,168,74,0.05)"/>
    <path d="M12 2V22M2 8L22 18M22 8L2 18" stroke="#d4a84a" strokeWidth="1" opacity="0.4"/>
    <circle cx="12" cy="12" r="3" stroke="#d4a84a" strokeWidth="0.8" opacity="0.5"/>
  </svg>
);

export const IconBackpack: React.FC<IconProps> = ({ size = 20, className, glow }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={WowGlow(glow)}>
    <rect x="5" y="8" width="14" height="14" rx="2" stroke="#d4a84a" strokeWidth="1.8" fill="rgba(212,168,74,0.05)"/>
    <path d="M8 8V6C8 4 9.5 2 12 2C14.5 2 16 4 16 6V8" stroke="#d4a84a" strokeWidth="1.8"/>
    <path d="M9 13H15M9 17H13" stroke="#d4a84a" strokeWidth="1.2" opacity="0.5"/>
  </svg>
);

export const IconProfile: React.FC<IconProps> = ({ size = 20, className, glow }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={WowGlow(glow)}>
    <circle cx="12" cy="8" r="4" stroke="#d4a84a" strokeWidth="1.8" fill="rgba(212,168,74,0.06)"/>
    <path d="M4 22C4 17 7.5 14 12 14C16.5 14 20 17 20 22" stroke="#d4a84a" strokeWidth="1.8"/>
    <path d="M9 8L12 5L15 8" stroke="#d4a84a" strokeWidth="0.8" opacity="0.3"/>
  </svg>
);

export const IconStats: React.FC<IconProps> = ({ size = 20, className, glow }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={WowGlow(glow)}>
    <path d="M4 20V14H8V20M8 20V8H12V20M12 20V4H16V20M16 20V10H20V20" stroke="#d4a84a" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

export const IconSettings: React.FC<IconProps> = ({ size = 20, className, glow }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={WowGlow(glow)}>
    <circle cx="12" cy="12" r="3" stroke="#d4a84a" strokeWidth="1.8"/>
    <path d="M12 2V5M12 19V22M22 12H19M5 12H2M19.1 4.9L17 7M7 17L4.9 19.1M4.9 4.9L7 7M17 17L19.1 19.1" stroke="#d4a84a" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const IconMarket: React.FC<IconProps> = ({ size = 20, className, glow }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={WowGlow(glow)}>
    <path d="M3 7L12 3L21 7V9H3V7Z" stroke="#d4a84a" strokeWidth="1.8" fill="rgba(212,168,74,0.05)"/>
    <path d="M5 9V19H9V13H15V19H19V9" stroke="#d4a84a" strokeWidth="1.5"/>
    <path d="M9 19H15" stroke="#d4a84a" strokeWidth="1.2"/>
  </svg>
);

export const IconWallet: React.FC<IconProps> = ({ size = 20, className, glow }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={WowGlow(glow)}>
    <rect x="2" y="6" width="20" height="14" rx="2" stroke="#d4a84a" strokeWidth="1.8" fill="rgba(212,168,74,0.05)"/>
    <path d="M16 13H16.01M2 10H22" stroke="#d4a84a" strokeWidth="1.5"/>
  </svg>
);

export const IconPortal: React.FC<IconProps> = ({ size = 20, className, glow }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={WowGlow(glow)}>
    <circle cx="12" cy="12" r="9" stroke="#c084fc" strokeWidth="2" fill="rgba(192,132,252,0.06)"/>
    <circle cx="12" cy="12" r="5" stroke="#c084fc" strokeWidth="1.5" fill="rgba(192,132,252,0.03)"/>
    <circle cx="12" cy="12" r="1.5" fill="#c084fc"/>
    <path d="M12 3V6M12 18V21M3 12H6M18 12H21" stroke="#c084fc" strokeWidth="1" opacity="0.5"/>
  </svg>
);

export const IconGather: React.FC<IconProps> = ({ size = 20, className, glow }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={WowGlow(glow)}>
    <path d="M12 4C8 4 5 7 5 11C5 15 8 20 12 20C16 20 19 15 19 11C19 7 16 4 12 4Z" stroke="#22c55e" strokeWidth="1.8" fill="rgba(34,197,94,0.06)"/>
    <path d="M9 11H15M12 8V14" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const IconFriends: React.FC<IconProps> = ({ size = 20, className, glow }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={WowGlow(glow)}>
    <circle cx="9" cy="7" r="3" stroke="#d4a84a" strokeWidth="1.5" fill="rgba(212,168,74,0.05)"/>
    <circle cx="17" cy="7" r="2.5" stroke="#d4a84a" strokeWidth="1.5" fill="rgba(212,168,74,0.05)"/>
    <path d="M3 20C3 16 5.5 14 9 14C12.5 14 15 16 15 20" stroke="#d4a84a" strokeWidth="1.5"/>
    <path d="M15 20C15 17 16.5 15 19 15C21 15 22 16.5 22 18.5" stroke="#d4a84a" strokeWidth="1.5"/>
  </svg>
);

export const IconAlliance: React.FC<IconProps> = ({ size = 20, className, glow }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={WowGlow(glow)}>
    <path d="M12 2L3 7V12C3 17 7 21.5 12 22C17 21.5 21 17 21 12V7L12 2Z" stroke="#d4a84a" strokeWidth="1.8" fill="rgba(212,168,74,0.05)"/>
    <path d="M8 12H16M12 8V16" stroke="#d4a84a" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const IconRaid: React.FC<IconProps> = ({ size = 20, className, glow }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={WowGlow(glow)}>
    <path d="M12 2L9 9H2L8 14L5 22L12 17L19 22L16 14L22 9H15L12 2Z" stroke="#ef4444" strokeWidth="1.8" fill="rgba(239,68,68,0.06)"/>
  </svg>
);

export const IconAirdrop: React.FC<IconProps> = ({ size = 20, className, glow }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={WowGlow(glow)}>
    <path d="M12 2L4 8L12 14L20 8L12 2Z" stroke="#60a5fa" strokeWidth="1.8" fill="rgba(96,165,250,0.08)"/>
    <path d="M4 8V16L12 22L20 16V8" stroke="#60a5fa" strokeWidth="1.5"/>
    <path d="M12 14V22" stroke="#60a5fa" strokeWidth="1.2" opacity="0.5"/>
  </svg>
);

export const IconQuest: React.FC<IconProps> = ({ size = 20, className, glow }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={WowGlow(glow)}>
    <path d="M4 4H12L14 6H20V20H4V4Z" stroke="#d4a84a" strokeWidth="1.8" fill="rgba(212,168,74,0.05)"/>
    <path d="M8 10H16M8 14H13" stroke="#d4a84a" strokeWidth="1.2" opacity="0.6"/>
  </svg>
);

export const IconCrown: React.FC<IconProps> = ({ size = 20, className, glow }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={WowGlow(glow)}>
    <path d="M3 18L5 8L9 12L12 6L15 12L19 8L21 18H3Z" stroke="#d4a84a" strokeWidth="2" fill="rgba(212,168,74,0.12)"/>
    <rect x="3" y="18" width="18" height="2" rx="1" fill="#d4a84a" opacity="0.7"/>
  </svg>
);

export const IconFire: React.FC<IconProps> = ({ size = 20, className, glow }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={WowGlow(glow)}>
    <path d="M12 22C16 22 19 18 19 14C19 10 16 8 14 5C13 3.5 12 2 12 2C12 2 11 3.5 10 5C8 8 5 10 5 14C5 18 8 22 12 22Z" stroke="#ef4444" strokeWidth="1.8" fill="rgba(239,68,68,0.08)"/>
    <path d="M12 22C14 22 15 20 15 18C15 16 13 15 12 13C11 15 9 16 9 18C9 20 10 22 12 22Z" stroke="#d4a84a" strokeWidth="1.2" fill="rgba(212,168,74,0.08)"/>
  </svg>
);

export const IconIce: React.FC<IconProps> = ({ size = 20, className, glow }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={WowGlow(glow)}>
    <path d="M12 2V22M2 12H22M4.9 4.9L19.1 19.1M19.1 4.9L4.9 19.1" stroke="#93c5fd" strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="3" stroke="#93c5fd" strokeWidth="1.2" fill="rgba(147,197,253,0.08)"/>
  </svg>
);

export const IconMagic: React.FC<IconProps> = ({ size = 20, className, glow }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={WowGlow(glow)}>
    <path d="M15 4L4 15L9 17L8 22L19 11L14 9L15 4Z" stroke="#c084fc" strokeWidth="1.8" fill="rgba(192,132,252,0.08)"/>
    <circle cx="12" cy="12" r="1" fill="#c084fc" opacity="0.5"/>
  </svg>
);

export const IconBow: React.FC<IconProps> = ({ size = 20, className, glow }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={WowGlow(glow)}>
    <path d="M6 4C6 4 2 8 2 12C2 16 6 20 6 20" stroke="#d4a84a" strokeWidth="2"/>
    <path d="M6 12H22M18 8L22 12L18 16" stroke="#d4a84a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconVerified: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" stroke="#22c55e" strokeWidth="2" fill="rgba(34,197,94,0.08)"/>
    <path d="M8 12.5L11 15.5L16.5 9" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconUnverified: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2" fill="rgba(239,68,68,0.05)"/>
    <path d="M9 9L15 15M15 9L9 15" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const IconTon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2L22 8V16L12 22L2 16V8L12 2Z" stroke="#60a5fa" strokeWidth="1.8" fill="rgba(96,165,250,0.08)"/>
    <path d="M7 12H17M12 7V17" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const IconChat: React.FC<IconProps> = ({ size = 20, className, glow }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={WowGlow(glow)}>
    <path d="M21 15C21 16 20 17 19 17H7L3 21V5C3 4 4 3 5 3H19C20 3 21 4 21 5V15Z" stroke="#d4a84a" strokeWidth="1.8" fill="rgba(212,168,74,0.05)"/>
    <path d="M7 9H17M7 13H13" stroke="#d4a84a" strokeWidth="1.2" opacity="0.5"/>
  </svg>
);

// === CLASS ICONS ===
export const IconClassWarrior: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 4L4 8V14C4 18 7.5 21.5 12 22C16.5 21.5 20 18 20 14V8L12 4Z" stroke="#ef4444" strokeWidth="1.8" fill="rgba(239,68,68,0.06)"/>
    <path d="M10 12L14 16M14 12L10 16" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 14L12 10L16 14" stroke="#ef4444" strokeWidth="1" opacity="0.4"/>
  </svg>
);

export const IconClassMage: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 4L4 8V14C4 18 7.5 21.5 12 22C16.5 21.5 20 18 20 14V8L12 4Z" stroke="#c084fc" strokeWidth="1.8" fill="rgba(192,132,252,0.06)"/>
    <circle cx="12" cy="13" r="4" stroke="#c084fc" strokeWidth="1.5"/>
    <path d="M12 9V7M12 19V17M8 13H6M18 13H16" stroke="#c084fc" strokeWidth="1.2"/>
  </svg>
);

export const IconClassArcher: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 4L4 8V14C4 18 7.5 21.5 12 22C16.5 21.5 20 18 20 14V8L12 4Z" stroke="#22c55e" strokeWidth="1.8" fill="rgba(34,197,94,0.06)"/>
    <path d="M8 16L16 10M16 10H12M16 10V14" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// === SKIN ICONS ===
export const IconSkinIce: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2L4 8V14C4 18 7.5 21.5 12 22C16.5 21.5 20 18 20 14V8L12 2Z" stroke="#93c5fd" strokeWidth="2" fill="rgba(147,197,253,0.1)"/>
    <path d="M8 11L16 11M12 7L12 15" stroke="#e0f2fe" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const IconSkinFire: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2L4 8V14C4 18 7.5 21.5 12 22C16.5 21.5 20 18 20 14V8L12 2Z" stroke="#f97316" strokeWidth="2" fill="rgba(249,115,22,0.1)"/>
    <path d="M9 14C9 14 10 11 12 11C14 11 15 14 15 14" stroke="#d4a84a" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const IconSkinShadow: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2L4 8V14C4 18 7.5 21.5 12 22C16.5 21.5 20 18 20 14V8L12 2Z" stroke="#6b7280" strokeWidth="2" fill="rgba(107,114,128,0.1)"/>
    <path d="M8 12H16M12 8V16" stroke="#374151" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
  </svg>
);

// Helper component to render item icons by name
export const ItemIcon: React.FC<{ iconName: string; size?: number; className?: string }> = ({
  iconName,
  size = 20,
  className
}) => {
  const iconMap: Record<string, React.FC<IconProps>> = {
    IconSword, IconShield, IconHelmet, IconArmor, IconBoots,
    IconWood, IconOre, IconGold, IconHerb,
    IconSkinIce, IconSkinFire, IconSkinShadow,
  };

  const Comp = iconMap[iconName];
  if (!Comp) {
    return <span className={className} style={{ width: size, height: size, display: 'inline-block' }} />;
  }
  return <Comp size={size} className={className} />;
};