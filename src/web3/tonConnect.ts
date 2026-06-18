/**
 * TON/GRAM Connect integration
 * Uses @tonconnect/ui for wallet connection and transactions.
 * GRAM is the native token of the GRAM/TON blockchain.
 */

export interface TonWalletState {
  connected: boolean;
  address: string | null;
  balance: number | null; // in GRAM
}

type WalletListener = (state: TonWalletState) => void;

/**
 * TonConnectService — wrapper around TonConnectUI SDK.
 * In production, this uses @tonconnect/ui-react's TonConnectButton and sendTransaction.
 * For this version, we provide a full working emulation that matches the TonConnect v2 API shape,
 * with GRAM as the native currency.
 */
class TonConnectService {
  private state: TonWalletState = { connected: false, address: null, balance: null };
  private listeners: WalletListener[] = [];
  private balanceInterval: ReturnType<typeof setInterval> | null = null;

  /** Base URL for the dApp (used in manifest) */
  readonly manifestUrl = "https://telegram-3d-rpg-mini-k097.bolt.host/tonconnect-manifest.json";

  get wallets() {
    return [
      { name: 'Tonkeeper',      icon: '💎' },
      { name: 'MyTonWallet',    icon: '🔷' },
      { name: 'Telegram Wallet', icon: '✈️' },
    ];
  }

  getState(): TonWalletState { return { ...this.state }; }

  subscribe(fn: WalletListener): () => void {
    this.listeners.push(fn);
    return () => { this.listeners = this.listeners.filter(l => l !== fn); };
  }

  private notify() {
    const snap = this.getState();
    for (const fn of this.listeners) fn(snap);
  }

  /**
   * Connect to a GRAM wallet.
   * @param _walletName — wallet display name (for UI)
   */
  async connect(_walletName: string): Promise<TonWalletState> {
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

  /**
   * Send GRAM transaction.
   * Mimics TonConnectUI.sendTransaction().
   * @param opts.gramAmount — amount in GRAM
   * @param opts.to — recipient address (wallet of game developer)
   * @param opts.itemId — optional item identifier for logging
   */
  async sendTransaction(opts: {
    gramAmount: number;
    to?: string;
    itemId?: string;
  }): Promise<{ ok: boolean; txHash: string }> {
    if (!this.state.connected || this.state.balance === null) {
      return { ok: false, txHash: '' };
    }
    if (this.state.balance < opts.gramAmount) {
      return { ok: false, txHash: '' };
    }
    await delay(1200 + Math.random() * 800);
    this.state = {
      ...this.state,
      balance: parseFloat((this.state.balance - opts.gramAmount).toFixed(2)),
    };
    this.notify();
    return { ok: true, txHash: fakeTxHash() };
  }

  /**
   * Emulate balance refresh from chain
   */
  private startBalancePoll() {
    if (this.balanceInterval) clearInterval(this.balanceInterval);
    this.balanceInterval = setInterval(() => {
      if (!this.state.connected) return;
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

// In-app shop items purchasable for GRAM
export interface GramShopItem {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  priceGram: number; // price in GRAM
  icon: string;      // CSS class or emoji fallback
  itemId: string;    // maps to items.ts key
  rarity: 'rare' | 'epic' | 'legendary';
  /** Skin ID if this is a cosmetic skin */
  skinId?: string;
}

export const GRAM_SHOP_ITEMS: GramShopItem[] = [
  {
    id: 'skin_fire_gram',
    name: 'Огненный Образ',
    nameEn: 'Fire Aspect Skin',
    description: 'Пылающий образ для твоего героя. Доспехи охвачены вечным пламенем.',
    descriptionEn: 'Burning aspect for your hero. Armor engulfed in eternal flame.',
    priceGram: 1.5,
    icon: '🔥',
    itemId: 'skin_fire',
    rarity: 'epic',
    skinId: 'skin_fire',
  },
  {
    id: 'skin_ice_gram',
    name: 'Ледяной Образ',
    nameEn: 'Ice Aspect Skin',
    description: 'Холодная эстетика северных земель. Доспехи покрыты инеем.',
    descriptionEn: 'Cold aesthetics of the northern lands. Armor covered in frost.',
    priceGram: 1.5,
    icon: '❄️',
    itemId: 'skin_ice',
    rarity: 'epic',
    skinId: 'skin_ice',
  },
  {
    id: 'skin_shadow_gram',
    name: 'Теневой Образ',
    nameEn: 'Shadow Aspect Skin',
    description: 'Образ из самой тьмы. Идеально для скрытных убийц.',
    descriptionEn: 'Aspect from the darkness itself. Perfect for stealthy assassins.',
    priceGram: 2.0,
    icon: '🌑',
    itemId: 'skin_shadow',
    rarity: 'legendary',
    skinId: 'skin_shadow',
  },
  {
    id: 'gram_gold_pack',
    name: 'Мешок Золота ×200',
    nameEn: 'Gold Bag ×200',
    description: 'Мгновенно добавляет 200 золотых монет в казну.',
    descriptionEn: 'Instantly adds 200 gold coins to your treasury.',
    priceGram: 0.5,
    icon: '💰',
    itemId: 'gold',
    rarity: 'rare',
  },
  {
    id: 'gram_listing_qualification',
    name: 'Квалификация Листинга',
    nameEn: 'Listing Qualification',
    description: 'Оплата верификации для участия в листинге $AZR (0.5 GRAM).',
    descriptionEn: 'Verification payment for $AZR listing participation (0.5 GRAM).',
    priceGram: 0.5,
    icon: '📋',
    itemId: 'listing_qualification',
    rarity: 'rare',
  },
];

/** Alias for backward compatibility with WalletButton — references GRAM prices */
export const TON_SHOP_ITEMS: GramShopItem[] = GRAM_SHOP_ITEMS;