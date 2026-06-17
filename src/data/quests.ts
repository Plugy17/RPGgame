export type QuestType = 'gather' | 'explore' | 'equip' | 'talk' | 'raid';

export interface QuestReward {
  xp: number;
  items: { itemId: string; qty: number }[];
  gold?: number;
}

export interface QuestDef {
  id: string;
  type: QuestType;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  required: number;
  reward: QuestReward;
  condition: {
    resource?: string;
    location?: string;
    itemSlot?: string;
    npcId?: string;
    raidBoss?: string;
  };
  locationId: string;
  nextQuestId: string | null;
  unlocksLocationId?: string;
}

export const QUESTS: QuestDef[] = [
  // Early village quests
  { id:'q1_gather_wood',  type:'gather', name:'Первые Дрова',    nameEn:'First Firewood',    description:'Собери 10 дерева в деревне.',  descriptionEn:'Gather 10 wood in the village.', required:10, reward:{xp:150,items:[{itemId:'leather_helmet',qty:1}]}, condition:{resource:'wood'},            locationId:'village', nextQuestId:'q2_explore_portal' },
  { id:'q2_explore_portal',type:'explore',name:'Найди Портал',   nameEn:'Find the Portal',   description:'Доберись до портала.',         descriptionEn:'Reach the portal.',              required:1,  reward:{xp:300,items:[{itemId:'wooden_sword',qty:1}],gold:30}, condition:{location:'village_portal'}, locationId:'village', nextQuestId:'q3_equip_helmet' },
  { id:'q3_equip_helmet', type:'equip',  name:'Снаряжение Воина',nameEn:"Warrior's Gear",    description:'Надень шлем.',                descriptionEn:'Equip a helmet.',                required:1,  reward:{xp:250,items:[{itemId:'iron_chestplate',qty:1}],gold:20}, condition:{itemSlot:'head'},            locationId:'village', nextQuestId:null },
  // Hub quests (Galhad chain — unlocks locations)
  { id:'q_hub_1', type:'talk', name:'Галахад: Тёмный Лес',    nameEn:'Galahad: Dark Forest',     description:'Поговори с Верховным Магом Галахадом.', descriptionEn:'Speak to Archmage Galahad.',       required:1, reward:{xp:400,gold:50,items:[]},     condition:{npcId:'galahad'},  locationId:'hub', nextQuestId:'q_hub_1b', unlocksLocationId:'dark_forest' },
  { id:'q_hub_1b',type:'gather',name:'Древесина Тёмного Леса',nameEn:'Dark Forest Timber',      description:'Собери 15 дерева.',           descriptionEn:'Gather 15 wood.',                 required:15, reward:{xp:600,gold:40,items:[{itemId:'iron_helmet',qty:1}]}, condition:{resource:'wood'}, locationId:'dark_forest', nextQuestId:'q_hub_2' },
  { id:'q_hub_2', type:'talk', name:'Галахад: Пещеры Эха',    nameEn:'Galahad: Echo Caves',      description:'Вернись к Галахаду.',          descriptionEn:'Return to Galahad.',              required:1, reward:{xp:500,gold:60,items:[]},     condition:{npcId:'galahad'},  locationId:'hub', nextQuestId:'q_hub_2b', unlocksLocationId:'caves' },
  { id:'q_hub_2b',type:'gather',name:'Руда Пещер',            nameEn:'Cave Ore',                 description:'Собери 20 руды.',             descriptionEn:'Gather 20 ore.',                  required:20, reward:{xp:800,gold:80,items:[{itemId:'iron_boots',qty:1}]}, condition:{resource:'ore'}, locationId:'caves', nextQuestId:'q_hub_3' },
  { id:'q_hub_3', type:'talk', name:'Галахад: Болотные Топи', nameEn:'Galahad: Swamp Bogs',     description:'Вернись к Галахаду.',          descriptionEn:'Return to Galahad.',              required:1, reward:{xp:600,gold:100,items:[]},    condition:{npcId:'galahad'},  locationId:'hub', nextQuestId:'q_hub_3b', unlocksLocationId:'swamp' },
  { id:'q_hub_3b',type:'gather',name:'Травы Болота',           nameEn:'Swamp Herbs',              description:'Собери 25 травы.',            descriptionEn:'Gather 25 herbs.',                required:25, reward:{xp:1000,gold:120,items:[{itemId:'iron_sword',qty:1}]}, condition:{resource:'herb'}, locationId:'swamp', nextQuestId:'q_hub_4' },
  { id:'q_hub_4', type:'talk', name:'Галахад: Пустыня Забвения',nameEn:'Galahad: Oblivion Desert',description:'Вернись к Галахаду.',         descriptionEn:'Return to Galahad.',              required:1, reward:{xp:800,gold:150,items:[]},    condition:{npcId:'galahad'},  locationId:'hub', nextQuestId:'q_hub_4b', unlocksLocationId:'desert' },
  { id:'q_hub_4b',type:'gather',name:'Золото Пустыни',         nameEn:'Desert Gold',              description:'Собери 20 золота.',           descriptionEn:'Gather 20 gold.',                 required:20, reward:{xp:1400,gold:200,items:[{itemId:'iron_chestplate',qty:1}]}, condition:{resource:'gold'}, locationId:'desert', nextQuestId:'q_hub_5' },
  { id:'q_hub_5',  type:'talk', name:'Галахад: Драконьи Горы', nameEn:'Galahad: Dragon Mountains',description:'Вернись к Галахаду.',         descriptionEn:'Return to Galahad.',              required:1, reward:{xp:1000,gold:250,items:[]},   condition:{npcId:'galahad'},  locationId:'hub', nextQuestId:null, unlocksLocationId:'mountains' },
  { id:'q_hub_6',  type:'talk', name:'Галахад: Вулкан',        nameEn:'Galahad: Volcano',          description:'Вернись к Галахаду.',         descriptionEn:'Return to Galahad.',              required:1, reward:{xp:1200,gold:300,items:[]},   condition:{npcId:'galahad'},  locationId:'hub', nextQuestId:null, unlocksLocationId:'volcano' },
  { id:'q_hub_7',  type:'talk', name:'Галахад: Ледяное Озеро', nameEn:'Galahad: Frozen Lake',     description:'Вернись к Галахаду.',         descriptionEn:'Return to Galahad.',              required:1, reward:{xp:1400,gold:350,items:[]},   condition:{npcId:'galahad'},  locationId:'hub', nextQuestId:null, unlocksLocationId:'frozen_lake' },
  { id:'q_hub_8',  type:'talk', name:'Галахад: Руины Древних', nameEn:'Galahad: Ancient Ruins',   description:'Вернись к Галахаду.',         descriptionEn:'Return to Galahad.',              required:1, reward:{xp:1600,gold:400,items:[]},   condition:{npcId:'galahad'},  locationId:'hub', nextQuestId:null, unlocksLocationId:'ruins' },
  { id:'q_hub_9',  type:'talk', name:'Галахад: Некрополь',     nameEn:'Galahad: Necropolis',      description:'Вернись к Галахаду.',         descriptionEn:'Return to Galahad.',              required:1, reward:{xp:1800,gold:450,items:[]},   condition:{npcId:'galahad'},  locationId:'hub', nextQuestId:null, unlocksLocationId:'necropolis' },
  { id:'q_hub_10', type:'talk', name:'Галахад: Царство Теней', nameEn:'Galahad: Shadow Realm',    description:'Вернись к Галахаду.',         descriptionEn:'Return to Galahad.',              required:1, reward:{xp:2000,gold:500,items:[]},   condition:{npcId:'galahad'},  locationId:'hub', nextQuestId:null, unlocksLocationId:'shadow_realm' },
  { id:'q_hub_11', type:'talk', name:'Галахад: Кристальные Пещеры',nameEn:'Galahad: Crystal Caves',description:'Вернись к Галахаду.',        descriptionEn:'Return to Galahad.',              required:1, reward:{xp:2200,gold:550,items:[]},   condition:{npcId:'galahad'},  locationId:'hub', nextQuestId:null, unlocksLocationId:'crystal_caves' },
  { id:'q_hub_12', type:'talk', name:'Галахад: Небесные Острова',nameEn:'Galahad: Sky Islands',   description:'Вернись к Галахаду.',         descriptionEn:'Return to Galahad.',              required:1, reward:{xp:2400,gold:600,items:[]},   condition:{npcId:'galahad'},  locationId:'hub', nextQuestId:null, unlocksLocationId:'sky_islands' },
  { id:'q_hub_13', type:'talk', name:'Галахад: Бездна',        nameEn:'Galahad: The Abyss',       description:'Вернись к Галахаду.',         descriptionEn:'Return to Galahad.',              required:1, reward:{xp:2600,gold:650,items:[]},   condition:{npcId:'galahad'},  locationId:'hub', nextQuestId:null, unlocksLocationId:'abyss' },
  { id:'q_hub_14', type:'talk', name:'Галахад: Демоническое Измерение',nameEn:'Galahad: Demon Realm',description:'Вернись к Галахаду.',       descriptionEn:'Return to Galahad.',              required:1, reward:{xp:2800,gold:700,items:[]},   condition:{npcId:'galahad'},  locationId:'hub', nextQuestId:null, unlocksLocationId:'demon_realm' },
  { id:'q_hub_15', type:'talk', name:'Галахад: Небесный Пик',  nameEn:'Galahad: Celestial Peak',  description:'Вернись к Галахаду.',         descriptionEn:'Return to Galahad.',              required:1, reward:{xp:3000,gold:800,items:[]},   condition:{npcId:'galahad'},  locationId:'hub', nextQuestId:null, unlocksLocationId:'celestial_peak' },
  { id:'q_hub_16', type:'talk', name:'Галахад: Пустота',       nameEn:'Galahad: The Void',        description:'Вернись к Галахаду.',         descriptionEn:'Return to Galahad.',              required:1, reward:{xp:3200,gold:900,items:[]},   condition:{npcId:'galahad'},  locationId:'hub', nextQuestId:null, unlocksLocationId:'void' },
  { id:'q_hub_17', type:'talk', name:'Галахад: Трон Азерии',   nameEn:'Galahad: Throne of Azeria', description:'Финальная миссия.',           descriptionEn:'Final mission.',                  required:1, reward:{xp:5000,gold:2000,items:[{itemId:'skin_shadow',qty:1}]}, condition:{npcId:'galahad'}, locationId:'hub', nextQuestId:null, unlocksLocationId:'throne_of_azeria' },
];

export const getQuest = (id: string) => QUESTS.find(q => q.id === id) ?? null;
export const getQuestsForLocation = (locId: string) => QUESTS.filter(q => q.locationId === locId);
