import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { InventoryItem } from '../data/items';
import { ITEMS, STARTER_ITEMS } from '../data/items';
import { QUESTS } from '../data/quests';
import { TelegramSDK } from '../telegram/sdk';
import type { Race, CharClass, AttributePoints } from '../data/classes';
import { computeStatsFromAttributes, canEquipWeapon, WEAPON_TAGS } from '../data/classes';

export type Screen = 'menu' | 'game' | 'hub' | 'inventory' | 'profile' | 'stats' | 'settings' | 'friends' | 'alliance' | 'raid' | 'airdrop' | 'charcreate' | 'attributes';
export type Language = 'ru' | 'en';
export type CharacterClass = CharClass;

export interface Equipment {
  head: string | null;
  body: string | null;
  legs: string | null;
  weapon: string | null;
}

export interface PlayerStats {
  defense: number;
  gatherSpeed: number;
  damage: number;
  xpBonus: number;
}

export interface QuestProgress {
  questId: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
}

export interface P2POffer {
  id: string;
  seller: string;
  itemId: string;
  quantity: number;
  priceGold: number;
  priceTon: number | null;
  createdAt: number;
  isMine?: boolean;
}

export interface FriendEntry {
  id: string;
  name: string;
  online: boolean;
  level: number;
  class: CharacterClass;
}

export interface Alliance {
  id: string;
  name: string;
  tag: string;
  members: number;
  maxMembers: number;
  level: number;
}

export interface RaidBoss {
  id: string;
  name: string;
  nameEn: string;
  level: number;
  hp: number;
  maxHp: number;
  rewardGold: number;
  rewardXp: number;
  rewardItems: { itemId: string; qty: number }[];
  spawnTime: number;
  duration: number;
}

export interface DuelState {
  active: boolean;
  opponentName: string;
  playerHp: number;
  opponentHp: number;
  maxHp: number;
  turn: 'player' | 'opponent';
  log: string[];
}

export const RAID_BOSSES: RaidBoss[] = [
  { id:'goblin_chief', name:'Вождь Гоблинов', nameEn:'Goblin Chieftain', level:5,  hp:500,  maxHp:500,  rewardGold:100, rewardXp:500,  rewardItems:[{itemId:'iron_helmet',qty:1}], spawnTime:Date.now()+60000, duration:300 },
  { id:'shadow_drake', name:'Теневой Дрейк',  nameEn:'Shadow Drake',     level:15, hp:2000, maxHp:2000, rewardGold:300, rewardXp:1500, rewardItems:[{itemId:'iron_sword',qty:1}], spawnTime:Date.now()+180000, duration:600 },
  { id:'inferno_lord', name:'Владыка Инферно',nameEn:'Inferno Lord',     level:30, hp:8000, maxHp:8000, rewardGold:800, rewardXp:4000, rewardItems:[{itemId:'skin_fire',qty:1}],  spawnTime:Date.now()+360000, duration:900 },
];

export interface GameState {
  screen: Screen;
  language: Language;
  soundEnabled: boolean;
  playtime: number;

  // Web3
  walletAddress: string | null;
  tonBalance: number | null;
  airdropVerified: boolean;
  airdropQualificationProgress: number;

  // Economy
  goldBalance: number;
  p2pOffers: P2POffer[];
  /** In-game $AZR tokens earned from quests/raids (NOT affected by listing payments) */
  gameTokens: number;
  /** Whether player paid the 0.5 GRAM listing qualification fee */
  isQualifiedForAirdrop: boolean;

  // Character
  playerName: string;
  characterRace: Race;
  characterClass: CharacterClass;
  activeSkin: string;
  playerLevel: number;
  playerXP: number;
  playerXPToNext: number;
  playerPos: { x: number; z: number };
  locationsUnlocked: string[];
  computedStats: PlayerStats;
  attributes: AttributePoints;

  // Current location
  currentLocationId: string;
  portalReached: boolean;

  // Inventory & equipment
  inventory: InventoryItem[];
  equipment: Equipment;

  // Quests
  questProgress: QuestProgress[];
  activeQuestId: string | null;

  // Chat
  chatMessages: ChatMessage[];
  chatOpen: boolean;

  // Friends
  friends: FriendEntry[];
  privateChatTarget: string | null;

  // Alliance
  currentAllianceId: string | null;

  // Duel
  duel: DuelState;

  // UI state
  inventoryOpen: boolean;
  questPanelOpen: boolean;
  collectingResource: string | null;
  collectProgress: number;
  levelUpVisible: boolean;
  questCompleteVisible: string | null;

  // Actions
  setScreen: (s: Screen) => void;
  toggleLanguage: () => void;
  toggleSound: () => void;
  setWallet: (address: string | null, tonBalance: number | null) => void;
  setAirdropVerified: (v: boolean) => void;
  setGoldBalance: (v: number) => void;
  addGold: (amount: number) => void;
  addP2POffer: (offer: P2POffer) => void;
  removeP2POffer: (id: string) => void;
  setCharacterRace: (r: Race) => void;
  setCharacterClass: (c: CharacterClass) => void;
  setActiveSkin: (skinId: string) => void;
  allocateAttribute: (attr: 'strength' | 'dexterity' | 'intelligence') => void;
  addInventoryItem: (itemId: string, qty?: number) => void;
  removeInventoryItem: (instanceId: string, qty?: number) => void;
  equipItem: (instanceId: string) => void;
  unequipSlot: (slot: keyof Equipment) => void;
  startQuest: (questId: string) => void;
  advanceQuest: (questId: string, amount?: number) => void;
  claimQuestReward: (questId: string) => void;
  completeHubQuest: (questId: string) => void;
  setCurrentLocation: (id: string) => void;
  setPortalReached: (v: boolean) => void;
  setPlayerPos: (pos: { x: number; z: number }) => void;
  addXP: (amount: number) => void;
  incrementPlaytime: (seconds: number) => void;
  setCollecting: (id: string | null, progress?: number) => void;
  setInventoryOpen: (v: boolean) => void;
  setQuestPanelOpen: (v: boolean) => void;
  setChatOpen: (v: boolean) => void;
  sendChatMessage: (text: string) => void;
  dismissLevelUp: () => void;
  dismissQuestComplete: () => void;
  initFromTelegram: () => void;
  addFriend: (f: FriendEntry) => void;
  removeFriend: (id: string) => void;
  setPrivateChatTarget: (id: string | null) => void;
  setAlliance: (id: string | null) => void;
  /** Pay 0.5 GRAM to qualify for $AZR airdrop listing (does NOT affect gameTokens) */
  qualifyForAirdrop: () => void;
  startDuel: (opponentName: string) => void;
  duelAttack: () => void;
  endDuel: () => void;
}

const XP_TABLE = [0, 100, 300, 600, 1000, 1500, 2200, 3100, 4200, 5500, 7200, 9200, 11500, 14200, 17300, 20800, 25000, 30000, 36000, 43000, 51000, 60000, 70000, 82000, 95000, 110000, 127000, 146000, 168000, 193000, 220000, 250000, 285000, 325000, 370000, 420000, 480000, 550000, 630000, 720000, 820000, 930000, 1050000, 1200000, 1400000, 1650000, 1950000, 2300000, 2700000, 3200000];
const xpToLevel = (xp: number) => {
  let level = 1;
  for (let i = 1; i < XP_TABLE.length; i++) { if (xp >= XP_TABLE[i]) level = i + 1; else break; }
  return level;
};
const xpToNext = (level: number) => XP_TABLE[level] ?? XP_TABLE[XP_TABLE.length - 1] * 2;

function computeStats(equipment: Equipment, inventory: InventoryItem[], activeSkin: string, attributes: AttributePoints, characterClass: CharacterClass): PlayerStats {
  const fromAttrs = computeStatsFromAttributes(attributes, characterClass);
  let defense = fromAttrs.defense, gatherSpeed = fromAttrs.gatherSpeed, damage = fromAttrs.damage, xpBonus = fromAttrs.xpBonus;
  const skinDef = ITEMS[activeSkin];
  if (skinDef?.stats) {
    if (skinDef.stats.defense) defense += skinDef.stats.defense;
    if (skinDef.stats.gatherSpeed) gatherSpeed += skinDef.stats.gatherSpeed;
    if (skinDef.stats.damage) damage += skinDef.stats.damage;
    if (skinDef.stats.xpBonus) xpBonus += skinDef.stats.xpBonus;
  }
  const slots: (keyof Equipment)[] = ['head', 'body', 'legs', 'weapon'];
  for (const slot of slots) {
    const iid = equipment[slot];
    if (!iid) continue;
    const invItem = inventory.find(i => i.instanceId === iid);
    if (!invItem) continue;
    const def = ITEMS[invItem.itemId];
    if (!def) continue;
    if (def.stats.defense) defense += def.stats.defense;
    if (def.stats.gatherSpeed) gatherSpeed += def.stats.gatherSpeed;
    if (def.stats.damage) damage += def.stats.damage;
    if (def.stats.xpBonus) xpBonus += def.stats.xpBonus;
  }
  return { defense, gatherSpeed, damage, xpBonus };
}

const INITIAL_QUESTS: QuestProgress[] = QUESTS.map(q => ({
  questId: q.id, progress: 0, completed: false, claimed: false,
}));

const FAKE_FRIENDS: FriendEntry[] = [
  { id:'f1', name:'VikingSlayer', online:true,  level:12, class:'warrior' },
  { id:'f2', name:'Freya_92',     online:false, level:8,  class:'mage' },
  { id:'f3', name:'HeimdallR',    online:true,  level:15, class:'archer' },
];

const recalcStats = (s: GameState) => computeStats(s.equipment, s.inventory, s.activeSkin, s.attributes, s.characterClass);

export const useGameStore = create<GameState>()(
  persist(
    (set, _get) => ({
      screen: 'menu',
      language: 'ru',
      soundEnabled: true,
      playtime: 0,

      walletAddress: null,
      tonBalance: null,
      airdropVerified: false,
      airdropQualificationProgress: 35,

      goldBalance: 50,
      p2pOffers: [],
      /** In-game $AZR tokens earned from quests/raids */
      gameTokens: 0,
      /** Whether player paid the 0.5 GRAM listing qualification fee */
      isQualifiedForAirdrop: false,

      playerName: 'Путник',
      characterRace: 'human' as Race,
      characterClass: 'warrior' as CharacterClass,
      activeSkin: 'skin_default',
      playerLevel: 1,
      playerXP: 0,
      playerXPToNext: xpToNext(1),
      playerPos: { x: 0, z: 0 },
      locationsUnlocked: ['village', 'hub'],
      computedStats: { defense: 2, gatherSpeed: 1.1, damage: 2, xpBonus: 0.04 },
      attributes: { strength: 2, dexterity: 2, intelligence: 2, unspent: 0 },

      currentLocationId: 'village',
      portalReached: false,

      inventory: [...STARTER_ITEMS],
      equipment: { head: null, body: null, legs: null, weapon: null },

      questProgress: INITIAL_QUESTS,
      activeQuestId: 'q1_gather_wood',

      chatMessages: [
        { id: '1', sender: 'Галахад', text: 'Азерия нуждается в тебе, герой!', time: '09:00' },
        { id: '2', sender: 'Дариус',  text: 'Заходи торговать — цены лучшие!', time: '09:01' },
      ],
      chatOpen: false,

      friends: FAKE_FRIENDS,
      privateChatTarget: null,

      currentAllianceId: null,

      duel: { active: false, opponentName: '', playerHp: 100, opponentHp: 100, maxHp: 100, turn: 'player', log: [] },

      inventoryOpen: false,
      questPanelOpen: false,
      collectingResource: null,
      collectProgress: 0,
      levelUpVisible: false,
      questCompleteVisible: null,

      setScreen: (screen) => set({ screen }),
      toggleLanguage: () => set(s => ({ language: s.language === 'ru' ? 'en' : 'ru' })),
      toggleSound: () => set(s => ({ soundEnabled: !s.soundEnabled })),
      setWallet: (walletAddress, tonBalance) => set({ walletAddress, tonBalance }),
      setAirdropVerified: (v) => set({ airdropVerified: v }),
      setGoldBalance: (goldBalance) => set({ goldBalance }),
      addGold: (amount) => set(s => ({ goldBalance: s.goldBalance + amount })),
      addP2POffer: (offer) => set(s => ({ p2pOffers: [...s.p2pOffers, offer] })),
      removeP2POffer: (id) => set(s => ({ p2pOffers: s.p2pOffers.filter(o => o.id !== id) })),

      setCharacterRace: (r) => set(s => ({ characterRace: r, computedStats: recalcStats({ ...s, characterRace: r }) })),
      setCharacterClass: (c) => set(s => ({ characterClass: c, computedStats: recalcStats({ ...s, characterClass: c }) })),
      setActiveSkin: (skinId) => set(s => {
        const stats = computeStats(s.equipment, s.inventory, skinId, s.attributes, s.characterClass);
        return { activeSkin: skinId, computedStats: stats };
      }),

      allocateAttribute: (attr) => set(s => {
        if (s.attributes.unspent <= 0) return {};
        const newAttrs = { ...s.attributes, [attr]: s.attributes[attr] + 1, unspent: s.attributes.unspent - 1 };
        const stats = computeStats(s.equipment, s.inventory, s.activeSkin, newAttrs, s.characterClass);
        return { attributes: newAttrs, computedStats: stats };
      }),

      addInventoryItem: (itemId, qty = 1) => set(s => {
        const def = ITEMS[itemId]; if (!def) return {};
        let inv = [...s.inventory];
        if (def.stackable) {
          const existing = inv.find(i => i.itemId === itemId);
          if (existing) inv = inv.map(i => i.itemId === itemId ? { ...i, quantity: i.quantity + qty } : i);
          else inv.push({ instanceId: `inv_${itemId}_${Date.now()}`, itemId, quantity: qty });
        } else {
          for (let i = 0; i < qty; i++) inv.push({ instanceId: `inv_${itemId}_${Date.now()}_${i}`, itemId, quantity: 1 });
        }
        return { inventory: inv };
      }),

      removeInventoryItem: (instanceId, qty = 1) => set(s => {
        let inv = [...s.inventory];
        const idx = inv.findIndex(i => i.instanceId === instanceId);
        if (idx === -1) return {};
        if (inv[idx].quantity <= qty) inv.splice(idx, 1);
        else inv[idx] = { ...inv[idx], quantity: inv[idx].quantity - qty };
        return { inventory: inv };
      }),

      equipItem: (instanceId) => set(s => {
        const invItem = s.inventory.find(i => i.instanceId === instanceId);
        if (!invItem) return {};
        const def = ITEMS[invItem.itemId];
        if (!def || def.slot === 'resource' || def.slot === 'skin') return {};
        // Class restriction check
        if (def.classRestriction && !def.classRestriction.includes(s.characterClass)) return {};
        const slot = def.slot as keyof Equipment;
        const newEquip = { ...s.equipment, [slot]: instanceId };
        const stats = computeStats(newEquip, s.inventory, s.activeSkin, s.attributes, s.characterClass);
        const qpUpdated = s.questProgress.map(qp => {
          if (qp.completed) return qp;
          const quest = QUESTS.find(q => q.id === qp.questId);
          if (!quest || quest.type !== 'equip') return qp;
          if (quest.condition.itemSlot === slot) return { ...qp, progress: 1, completed: true };
          return qp;
        });
        const justCompleted = qpUpdated.find(qp => qp.completed && !s.questProgress.find(p => p.questId === qp.questId)?.completed);
        return { equipment: newEquip, computedStats: stats, questProgress: qpUpdated, questCompleteVisible: justCompleted?.questId ?? s.questCompleteVisible };
      }),

      unequipSlot: (slot) => set(s => {
        const newEquip = { ...s.equipment, [slot]: null };
        return { equipment: newEquip, computedStats: computeStats(newEquip, s.inventory, s.activeSkin, s.attributes, s.characterClass) };
      }),

      startQuest: (questId) => set({ activeQuestId: questId }),

      advanceQuest: (questId, amount = 1) => set(s => {
        const qpUpdated = s.questProgress.map(qp => {
          if (qp.questId !== questId || qp.completed) return qp;
          const quest = QUESTS.find(q => q.id === questId); if (!quest) return qp;
          const newProgress = Math.min(qp.progress + amount, quest.required);
          return { ...qp, progress: newProgress, completed: newProgress >= quest.required };
        });
        const justDone = qpUpdated.find(qp => qp.questId === questId && qp.completed && !s.questProgress.find(p => p.questId === questId)?.completed);
        return { questProgress: qpUpdated, questCompleteVisible: justDone ? questId : s.questCompleteVisible };
      }),

      claimQuestReward: (questId) => set(s => {
        const quest = QUESTS.find(q => q.id === questId);
        const qp = s.questProgress.find(p => p.questId === questId);
        if (!quest || !qp || !qp.completed || qp.claimed) return {};
        const updatedQP = s.questProgress.map(p => p.questId === questId ? { ...p, claimed: true } : p);
        const xpMult = 1 + s.computedStats.xpBonus;
        let newXP = s.playerXP + Math.round(quest.reward.xp * xpMult);
        let newLevel = xpToLevel(newXP);
        const leveledUp = newLevel > s.playerLevel;
        const newUnspent = s.attributes.unspent + (leveledUp ? (newLevel - s.playerLevel) * 3 : 0);
        let inv = [...s.inventory];
        for (const r of quest.reward.items) {
          const def = ITEMS[r.itemId]; if (!def) continue;
          if (def.stackable) {
            const ex = inv.find(i => i.itemId === r.itemId);
            if (ex) inv = inv.map(i => i.itemId === r.itemId ? { ...i, quantity: i.quantity + r.qty } : i);
            else inv.push({ instanceId: `inv_${r.itemId}_${Date.now()}`, itemId: r.itemId, quantity: r.qty });
          } else {
            for (let k = 0; k < r.qty; k++) inv.push({ instanceId: `inv_${r.itemId}_${Date.now()}_${k}`, itemId: r.itemId, quantity: 1 });
          }
        }
        const goldGain = quest.reward.gold ?? 0;
        return {
          questProgress: updatedQP, playerXP: newXP, playerLevel: newLevel,
          playerXPToNext: xpToNext(newLevel), inventory: inv, goldBalance: s.goldBalance + goldGain,
          activeQuestId: quest.nextQuestId ?? s.activeQuestId,
          levelUpVisible: leveledUp ? true : s.levelUpVisible, questCompleteVisible: null,
          attributes: { ...s.attributes, unspent: newUnspent },
        };
      }),

      completeHubQuest: (questId) => set(s => {
        const quest = QUESTS.find(q => q.id === questId);
        if (!quest || quest.type !== 'talk') return {};
        const qpUpdated = s.questProgress.map(qp =>
          qp.questId === questId ? { ...qp, progress: 1, completed: true } : qp
        );
        let newLocs = s.locationsUnlocked;
        if (quest.unlocksLocationId && !newLocs.includes(quest.unlocksLocationId)) {
          newLocs = [...newLocs, quest.unlocksLocationId];
        }
        return { questProgress: qpUpdated, locationsUnlocked: newLocs, questCompleteVisible: questId };
      }),

      setCurrentLocation: (id) => set(s => {
        const locs = s.locationsUnlocked.includes(id) ? s.locationsUnlocked : [...s.locationsUnlocked, id];
        return { currentLocationId: id, locationsUnlocked: locs, portalReached: false };
      }),

      setPortalReached: (v) => set(s => {
        if (!v) return { portalReached: v };
        const qpUpdated = s.questProgress.map(qp => {
          if (qp.completed) return qp;
          const quest = QUESTS.find(q => q.id === qp.questId);
          if (!quest || quest.type !== 'explore') return qp;
          if (quest.locationId === s.currentLocationId) return { ...qp, progress: 1, completed: true };
          return qp;
        });
        const justDone = qpUpdated.find(qp => qp.completed && !s.questProgress.find(p => p.questId === qp.questId)?.completed);
        return { portalReached: v, questProgress: qpUpdated, questCompleteVisible: justDone?.questId ?? s.questCompleteVisible };
      }),

      setPlayerPos: (pos) => set({ playerPos: pos }),

      addXP: (amount) => set(s => {
        const xpMult = 1 + s.computedStats.xpBonus;
        const newXP = s.playerXP + Math.round(amount * xpMult);
        const newLevel = xpToLevel(newXP);
        const leveled = newLevel > s.playerLevel;
        const newUnspent = s.attributes.unspent + (leveled ? (newLevel - s.playerLevel) * 3 : 0);
        return { playerXP: newXP, playerLevel: newLevel, playerXPToNext: xpToNext(newLevel), levelUpVisible: leveled ? true : s.levelUpVisible, attributes: { ...s.attributes, unspent: newUnspent } };
      }),

      incrementPlaytime: (seconds) => set(s => ({ playtime: s.playtime + seconds })),
      setCollecting: (id, progress = 0) => set({ collectingResource: id, collectProgress: progress }),
      setInventoryOpen: (v) => set({ inventoryOpen: v }),
      setQuestPanelOpen: (v) => set({ questPanelOpen: v }),
      setChatOpen: (v) => set({ chatOpen: v }),

      sendChatMessage: (text) => set(s => ({
        chatMessages: [...s.chatMessages, {
          id: Date.now().toString(), sender: s.playerName, text,
          time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        }],
      })),

      dismissLevelUp: () => set({ levelUpVisible: false }),
      dismissQuestComplete: () => set({ questCompleteVisible: null }),

      initFromTelegram: () => {
        const user = TelegramSDK.user;
        if (user) set({ playerName: user.first_name + (user.last_name ? ' ' + user.last_name : '') });
        TelegramSDK.ready();
      },

      addFriend: (f) => set(s => ({ friends: [...s.friends, f] })),
      removeFriend: (id) => set(s => ({ friends: s.friends.filter(f => f.id !== id) })),
      setPrivateChatTarget: (id) => set({ privateChatTarget: id }),
      setAlliance: (id) => set({ currentAllianceId: id }),

      startDuel: (opponentName) => set(s => ({
        duel: { active: true, opponentName, playerHp: 50 + s.computedStats.defense * 5, opponentHp: 80, maxHp: 50 + s.computedStats.defense * 5, turn: 'player', log: [s.language === 'ru' ? 'Дуэль начата!' : 'Duel started!'] }
      })),

      duelAttack: () => set(s => {
        if (!s.duel.active || s.duel.turn !== 'player') return {};
        const dmg = Math.max(1, Math.round(s.computedStats.damage * (0.8 + Math.random() * 0.4)));
        const newOppHp = Math.max(0, s.duel.opponentHp - dmg);
        const log = [...s.duel.log, `${s.playerName} наносит ${dmg} урона!`];
        if (newOppHp <= 0) {
          return { duel: { ...s.duel, opponentHp: 0, log: [...log, s.language === 'ru' ? 'Победа!' : 'Victory!'], active: false }, goldBalance: s.goldBalance + 50 };
        }
        const oppDmg = Math.max(1, Math.round(3 + Math.random() * 5));
        const newPlayerHp = Math.max(0, s.duel.playerHp - oppDmg);
        const log2 = [...log, `${s.duel.opponentName} наносит ${oppDmg} урона!`];
        if (newPlayerHp <= 0) {
          return { duel: { ...s.duel, playerHp: 0, log: [...log2, s.language === 'ru' ? 'Поражение!' : 'Defeat!'], active: false } };
        }
        return { duel: { ...s.duel, opponentHp: newOppHp, playerHp: newPlayerHp, log: log2 } };
      }),

      /** Pay 0.5 GRAM to qualify for $AZR airdrop listing (does NOT affect gameTokens) */
      qualifyForAirdrop: () => set({ isQualifiedForAirdrop: true }),

      endDuel: () => set({ duel: { active: false, opponentName: '', playerHp: 100, opponentHp: 100, maxHp: 100, turn: 'player', log: [] } }),
    }),
    {
      name: 'azeria-game-state',
      partialize: (s) => ({
        language: s.language, soundEnabled: s.soundEnabled, playtime: s.playtime,
        walletAddress: s.walletAddress, airdropVerified: s.airdropVerified,
        goldBalance: s.goldBalance, p2pOffers: s.p2pOffers,
        playerName: s.playerName, characterRace: s.characterRace, characterClass: s.characterClass, activeSkin: s.activeSkin,
        playerLevel: s.playerLevel, playerXP: s.playerXP, playerXPToNext: s.playerXPToNext,
        playerPos: s.playerPos, locationsUnlocked: s.locationsUnlocked,
        currentLocationId: s.currentLocationId, inventory: s.inventory, equipment: s.equipment,
        questProgress: s.questProgress, activeQuestId: s.activeQuestId,
        chatMessages: s.chatMessages, friends: s.friends, currentAllianceId: s.currentAllianceId,
        gameTokens: s.gameTokens,
        isQualifiedForAirdrop: s.isQualifiedForAirdrop,
        attributes: s.attributes,
      }),
    }
  )
);
