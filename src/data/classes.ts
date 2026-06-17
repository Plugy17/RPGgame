export type Race = 'human' | 'elf' | 'orc' | 'undead';
export type CharClass = 'warrior' | 'archer' | 'mage';

export interface RaceDef {
  id: Race;
  name: string;
  nameEn: string;
  desc: string;
  descEn: string;
  skinColor: number;
  bodyScale: { x: number; y: number; z: number };
  hasEars: boolean;
  isBulky: boolean;
  baseStats: { strength: number; dexterity: number; intelligence: number };
}

export interface ClassDef {
  id: CharClass;
  name: string;
  nameEn: string;
  desc: string;
  descEn: string;
  allowedWeapons: string[];
  iconName: string;
  color: string;
  primaryStat: 'strength' | 'dexterity' | 'intelligence';
}

export interface AttributePoints {
  strength: number;
  dexterity: number;
  intelligence: number;
  unspent: number;
}

export const RACES: RaceDef[] = [
  { id: 'human', name: 'Человек', nameEn: 'Human', desc: 'Универсальная раса, адаптируется к любой роли.', descEn: 'Versatile race, adapts to any role.', skinColor: 0xf0c8a0, bodyScale: { x: 1, y: 1, z: 1 }, hasEars: false, isBulky: false, baseStats: { strength: 2, dexterity: 2, intelligence: 2 } },
  { id: 'elf', name: 'Эльф', nameEn: 'Elf', desc: 'Изящные и ловкие, мастера магии и стрельбы.', descEn: 'Graceful and agile, masters of magic and archery.', skinColor: 0xf5dbc8, bodyScale: { x: 0.9, y: 1.1, z: 0.9 }, hasEars: true, isBulky: false, baseStats: { strength: 1, dexterity: 3, intelligence: 3 } },
  { id: 'orc', name: 'Орк', nameEn: 'Orc', desc: 'Массивные воины, невероятная сила и выносливость.', descEn: 'Massive warriors, incredible strength and endurance.', skinColor: 0x7a9a5a, bodyScale: { x: 1.3, y: 1.1, z: 1.2 }, hasEars: false, isBulky: true, baseStats: { strength: 4, dexterity: 1, intelligence: 1 } },
  { id: 'undead', name: 'Нежить', nameEn: 'Undead', desc: 'Бледные и мистические, повелители тёмной магии.', descEn: 'Pale and mystical, masters of dark magic.', skinColor: 0xc8b8a8, bodyScale: { x: 1, y: 1.05, z: 1 }, hasEars: false, isBulky: false, baseStats: { strength: 1, dexterity: 2, intelligence: 4 } },
];

export const CLASSES: ClassDef[] = [
  { id: 'warrior', name: 'Воин', nameEn: 'Warrior', desc: 'Мастер ближнего боя. Оружие: мечи, топоры.', descEn: 'Master of melee. Weapons: swords, axes.', allowedWeapons: ['sword', 'axe'], iconName: 'IconClassWarrior', color: '#ef4444', primaryStat: 'strength' },
  { id: 'archer', name: 'Лучник', nameEn: 'Archer', desc: 'Меткий стрелок. Оружие: луки, арбалеты.', descEn: 'Precise marksman. Weapons: bows, crossbows.', allowedWeapons: ['bow', 'crossbow'], iconName: 'IconClassArcher', color: '#22c55e', primaryStat: 'dexterity' },
  { id: 'mage', name: 'Маг', nameEn: 'Mage', desc: 'Повелитель стихий. Оружие: посохи, руны.', descEn: 'Master of elements. Weapons: staves, runes.', allowedWeapons: ['staff', 'rune'], iconName: 'IconClassMage', color: '#c084fc', primaryStat: 'intelligence' },
];

export const WEAPON_TAGS: Record<string, string> = {
  wooden_sword: 'sword',
  iron_sword: 'sword',
  battle_axe: 'axe',
  wooden_bow: 'bow',
  crossbow: 'crossbow',
  apprentice_staff: 'staff',
  rune_crystal: 'rune',
};

export const getRace = (id: Race) => RACES.find(r => r.id === id) ?? RACES[0];
export const getClass = (id: CharClass) => CLASSES.find(c => c.id === id) ?? CLASSES[0];

export const canEquipWeapon = (classId: CharClass, weaponTag: string | undefined): boolean => {
  if (!weaponTag) return true;
  const cls = getClass(classId);
  return cls.allowedWeapons.includes(weaponTag);
};

export const computeStatsFromAttributes = (attrs: AttributePoints, classId: CharClass) => {
  const cls = getClass(classId);
  const bonus = attrs[cls.primaryStat] * 0.5;
  return {
    defense: Math.floor(attrs.strength * 0.8 + bonus * 0.3),
    damage: 1 + attrs.strength * 0.3 + attrs.dexterity * 0.2 + bonus * 0.5,
    gatherSpeed: 1 + attrs.dexterity * 0.05,
    xpBonus: attrs.intelligence * 0.02,
  };
};
