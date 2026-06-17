export type ItemSlot = 'head' | 'body' | 'legs' | 'weapon' | 'resource' | 'skin';

export interface ItemDef {
  id: string;
  name: string;
  nameEn: string;
  slot: ItemSlot;
  iconName: string;
  color: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  stats: { defense?: number; gatherSpeed?: number; damage?: number; xpBonus?: number };
  stackable?: boolean;
  weaponTag?: string;
  classRestriction?: string[];
}

export const ITEMS: Record<string, ItemDef> = {
  // Resources
  wood:           { id:'wood',           name:'Дерево',              nameEn:'Wood',              slot:'resource', iconName:'IconWood',    color:'#8B4513', rarity:'common',    stats:{}, stackable:true },
  ore:            { id:'ore',            name:'Руда',                nameEn:'Ore',               slot:'resource', iconName:'IconOre',     color:'#708090', rarity:'common',    stats:{}, stackable:true },
  gold:           { id:'gold',           name:'Золото',              nameEn:'Gold',               slot:'resource', iconName:'IconGold',    color:'#FFD700', rarity:'uncommon',   stats:{}, stackable:true },
  herb:           { id:'herb',           name:'Трава',               nameEn:'Herb',               slot:'resource', iconName:'IconHerb',    color:'#228B22', rarity:'common',    stats:{}, stackable:true },

  // Warrior weapons
  wooden_sword:   { id:'wooden_sword',   name:'Деревянный Меч',     nameEn:'Wooden Sword',       slot:'weapon',   iconName:'IconSword',   color:'#8B4513', rarity:'common',    stats:{ damage:3, gatherSpeed:0.1 },  weaponTag:'sword', classRestriction:['warrior'] },
  iron_sword:      { id:'iron_sword',     name:'Железный Меч',        nameEn:'Iron Sword',         slot:'weapon',   iconName:'IconSword',   color:'#C0C0C0', rarity:'uncommon',   stats:{ damage:8, gatherSpeed:0.2 },  weaponTag:'sword', classRestriction:['warrior'] },
  battle_axe:      { id:'battle_axe',     name:'Боевой Топор',        nameEn:'Battle Axe',         slot:'weapon',   iconName:'IconSword',   color:'#8B6914', rarity:'rare',       stats:{ damage:12, defense:2 },       weaponTag:'axe',   classRestriction:['warrior'] },

  // Archer weapons
  wooden_bow:      { id:'wooden_bow',     name:'Деревянный Лук',      nameEn:'Wooden Bow',         slot:'weapon',   iconName:'IconBow',     color:'#8B4513', rarity:'common',    stats:{ damage:4, gatherSpeed:0.15 }, weaponTag:'bow',   classRestriction:['archer'] },
  crossbow:        { id:'crossbow',        name:'Арбалет',             nameEn:'Crossbow',           slot:'weapon',   iconName:'IconBow',     color:'#708090', rarity:'uncommon',   stats:{ damage:9, gatherSpeed:0.1 },  weaponTag:'crossbow', classRestriction:['archer'] },

  // Mage weapons
  apprentice_staff:{ id:'apprentice_staff',name:'Посох Ученика',      nameEn:'Apprentice Staff',   slot:'weapon',   iconName:'IconMagic',   color:'#6a3a9a', rarity:'common',    stats:{ damage:3, xpBonus:0.05 },    weaponTag:'staff', classRestriction:['mage'] },
  rune_crystal:    { id:'rune_crystal',    name:'Кристалл Рун',        nameEn:'Rune Crystal',       slot:'weapon',   iconName:'IconMagic',   color:'#93c5fd', rarity:'uncommon',   stats:{ damage:6, xpBonus:0.1 },     weaponTag:'rune',  classRestriction:['mage'] },

  // Armor
  leather_helmet:  { id:'leather_helmet', name:'Кожаный Шлем',        nameEn:'Leather Helmet',     slot:'head',     iconName:'IconHelmet',  color:'#8B6914', rarity:'common',    stats:{ defense:2, gatherSpeed:0.05 } },
  iron_helmet:     { id:'iron_helmet',    name:'Железный Шлем',       nameEn:'Iron Helmet',        slot:'head',     iconName:'IconHelmet',  color:'#708090', rarity:'uncommon',   stats:{ defense:6, gatherSpeed:0.1 } },
  leather_armor:   { id:'leather_armor',  name:'Кожаная Броня',       nameEn:'Leather Armor',      slot:'body',     iconName:'IconArmor',   color:'#8B6914', rarity:'common',    stats:{ defense:3, gatherSpeed:0.08 } },
  iron_chestplate: { id:'iron_chestplate',name:'Железный Нагрудник',  nameEn:'Iron Chestplate',    slot:'body',     iconName:'IconArmor',   color:'#708090', rarity:'uncommon',   stats:{ defense:10, gatherSpeed:0.15 } },
  cloth_pants:     { id:'cloth_pants',    name:'Тряпичные Штаны',     nameEn:'Cloth Pants',        slot:'legs',     iconName:'IconBoots',   color:'#4682B4', rarity:'common',    stats:{ defense:1, gatherSpeed:0.03 } },
  iron_boots:      { id:'iron_boots',     name:'Железные Сапоги',     nameEn:'Iron Boots',         slot:'legs',     iconName:'IconBoots',   color:'#708090', rarity:'uncommon',   stats:{ defense:4, gatherSpeed:0.1 } },

  // Alchemist potions
  health_potion:   { id:'health_potion',  name:'Зелье Здоровья',      nameEn:'Health Potion',      slot:'resource', iconName:'IconHerb',    color:'#dc2626', rarity:'uncommon',   stats:{}, stackable:true },
  xp_potion:       { id:'xp_potion',       name:'Зелье Опыта',         nameEn:'XP Potion',          slot:'resource', iconName:'IconHerb',    color:'#3b82f6', rarity:'rare',       stats:{ xpBonus:0.2 }, stackable:true },
  gather_potion:   { id:'gather_potion',  name:'Зелье Сбора',         nameEn:'Gather Potion',      slot:'resource', iconName:'IconHerb',    color:'#22c55e', rarity:'uncommon',   stats:{ gatherSpeed:0.3 }, stackable:true },

  // Skins
  skin_default:    { id:'skin_default',   name:'Стандартный',         nameEn:'Default',            slot:'skin',     iconName:'IconShield',  color:'#3b82f6', rarity:'common',    stats:{} },
  skin_ice:        { id:'skin_ice',       name:'Ледяной Рыцарь',      nameEn:'Ice Knight',         slot:'skin',     iconName:'IconSkinIce', color:'#93c5fd', rarity:'epic',      stats:{ defense:5, xpBonus:0.1 } },
  skin_fire:       { id:'skin_fire',      name:'Огненный Паладин',    nameEn:'Fire Paladin',       slot:'skin',     iconName:'IconSkinFire',color:'#f97316', rarity:'epic',      stats:{ damage:5, xpBonus:0.1 } },
  skin_shadow:     { id:'skin_shadow',    name:'Теневой Убийца',      nameEn:'Shadow Assassin',    slot:'skin',     iconName:'IconSkinShadow',color:'#374151',rarity:'legendary', stats:{ damage:8, gatherSpeed:0.25 } },
};

export interface InventoryItem {
  instanceId: string;
  itemId: string;
  quantity: number;
}

export const RARITY_COLORS: Record<string, string> = {
  common:'#9ca3af', uncommon:'#34d399', rare:'#60a5fa', epic:'#c084fc', legendary:'#fbbf24',
};

export const STARTER_ITEMS: InventoryItem[] = [
  { instanceId:'inv_wood_0',   itemId:'wood',           quantity:5 },
  { instanceId:'inv_ws_0',    itemId:'wooden_sword',   quantity:1 },
  { instanceId:'inv_lh_0',    itemId:'leather_helmet', quantity:1 },
  { instanceId:'inv_la_0',    itemId:'leather_armor',  quantity:1 },
  { instanceId:'inv_cp_0',    itemId:'cloth_pants',    quantity:1 },
  { instanceId:'inv_sd_0',    itemId:'skin_default',   quantity:1 },
];
