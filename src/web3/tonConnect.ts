// TON Connect integration — uses a lightweight mock that matches the TonConnect v2 API shape.
// In production, replace with @tonconnect/sdk or @tonconnect/ui.
// Emulates wallet connection, address display, balance fetch, and contract call for item purchase.

export interface TonWalletState {
  connected: boolean;
  address: string | null;
  balance: number | null; // in TON
}

type WalletListener = (state: TonWalletState) => void;

const FAKE_WALLETS = [
  { name: 'Tonkeeper',      icon: '💎' },
  { name: 'MyTonWallet',    icon: '🔷' },
  { name: 'Telegram Wallet', icon: '✈️' },
];

class TonConnectService {
  private state: TonWalletState = { connected: false, address: null, balance: null };
  private listeners: WalletListener[] = [];
  private balanceInterval: ReturnType<typeof setInterval> | null = null;

  get wallets() { return FAKE_WALLETS; }

  getState(): TonWalletState { return { ...this.state }; }

  subscribe(fn: WalletListener): () => void {
    this.listeners.push(fn);
    return () => { this.listeners = this.listeners.filter(l => l !== fn); };
  }

  private notify() {
    const snap = this.getState();
    for (const fn of this.listeners) fn(snap);
  }

  async connect(_walletName: string): Promise<TonWalletState> {
    // Simulate async handshake (200-600ms)
    await delay(300 + Math.random() * 300);
    const addr = generateFakeAddress();
    const bal  = parseFloat((10 + Math.random() * 90).toFixed(2));
    this.state = { connected: true, address: addr, balance: bal };
    this.startBalancePoll();
    this.notify();
    return this.getState();
  }

  disconnect() {
    this.state = { connected: false, address: null, balance: null };
    if (this.balanceInterval) clearInterval(this.balanceInterval);
    this.notify();
  }

  // Emulated smart-contract call: buy in-game item for tonAmount TON
  // Returns true if "transaction" succeeded (always succeeds in emulation).
  async sendTransaction(opts: { tonAmount: number; itemId: string }): Promise<{ ok: boolean; txHash: string }> {
    if (!this.state.connected || this.state.balance === null) {
      return { ok: false, txHash: '' };
    }
    if (this.state.balance < opts.tonAmount) {
      return { ok: false, txHash: '' };
    }
    await delay(1200 + Math.random() * 800);
    this.state = {
      ...this.state,
      balance: parseFloat((this.state.balance - opts.tonAmount).toFixed(2)),
    };
    this.notify();
    return { ok: true, txHash: fakeTxHash() };
  }

  // Emulate refreshing balance from chain
  private startBalancePoll() {
    if (this.balanceInterval) clearInterval(this.balanceInterval);
    this.balanceInterval = setInterval(() => {
      if (!this.state.connected) return;
      // Tiny random drift to look "live"
      const drift = (Math.random() - 0.48) * 0.1;
      this.state = {
        ...this.state,
        balance: parseFloat(Math.max(0, (this.state.balance ?? 0) + drift).toFixed(2)),
      };
      this.notify();
    }, 8000);
  }
}

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

function generateFakeAddress(): string {
  const hex = (n: number) => Math.floor(Math.random() * 16 ** n).toString(16).toUpperCase().padStart(n, '0');
  return `EQ${hex(4)}...${hex(4)}`;
}

function fakeTxHash(): string {
  const hex = (n: number) => Math.floor(Math.random() * 16 ** n).toString(16).padStart(n, '0');
  return hex(64);
}

export function shortAddress(addr: string): string {
  if (addr.length <= 12) return addr;
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}

// Singleton
export const tonConnect = new TonConnectService();

// Premium shop items purchasable for TON
export interface TonShopItem {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  price: number; // TON
  icon: string;
  itemId: string; // maps to items.ts key
  rarity: 'rare' | 'epic';
}

export const TON_SHOP_ITEMS: TonShopItem[] = [
  {
    id: 'tsi_dragon_blade',
    name: 'Клинок Дракона',
    nameEn: 'Dragon Blade',
    description: 'Легендарный меч из чешуи дракона.',
    descriptionEn: 'Legendary sword forged from dragon scales.',
    price: 0.5,
    icon: '🐉',
    itemId: 'iron_sword',
    rarity: 'epic',
  },
  {
    id: 'tsi_golden_helm',
    name: 'Золотой Шлем',
    nameEn: 'Golden Helmet',
    description: 'Шлем из чистого аурума — символ власти.',
    descriptionEn: 'Pure aurum helmet — a symbol of power.',
    price: 0.3,
    icon: '👑',
    itemId: 'iron_helmet',
    rarity: 'rare',
  },
  {
    id: 'tsi_gold_bag',
    name: 'Мешок Золота ×100',
    nameEn: 'Gold Bag ×100',
    description: 'Мгновенно добавляет 100 золотых монет.',
    descriptionEn: 'Instantly adds 100 gold coins.',
    price: 0.1,
    icon: '💰',
    itemId: 'gold',
    rarity: 'rare',
  },
];
