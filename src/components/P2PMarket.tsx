import React, { useState, useEffect } from 'react';
import { X, TrendingUp, ShoppingBag, Plus, Minus } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { ITEMS } from '../data/items';
import { ItemIcon, IconGold } from './GameIcons';

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

// Fake player names for generated offers
const FAKE_SELLERS = [
  'VikingSlayer', 'ThórHammer', 'Freya_92', 'BjornFury',
  'Loki_X', 'HeimdallR', 'Ragnhild', 'GunnarK', 'Skadi99',
];

function makeFakeOffer(): P2POffer {
  const tradeableItems = ['wood', 'ore', 'gold', 'iron_sword', 'iron_helmet', 'iron_chestplate', 'iron_boots'];
  const itemId = tradeableItems[Math.floor(Math.random() * tradeableItems.length)];
  const def = ITEMS[itemId];
  const qty = def?.stackable ? Math.floor(Math.random() * 20) + 1 : 1;
  const basePriceGold = def?.slot === 'resource' ? 2 + Math.floor(Math.random() * 8) :
    20 + Math.floor(Math.random() * 80);
  const hasTon = Math.random() > 0.65;
  return {
    id: `offer_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    seller: FAKE_SELLERS[Math.floor(Math.random() * FAKE_SELLERS.length)],
    itemId,
    quantity: qty,
    priceGold: basePriceGold * qty,
    priceTon: hasTon ? parseFloat((Math.random() * 0.5 + 0.05).toFixed(2)) : null,
    createdAt: Date.now() - Math.floor(Math.random() * 1000 * 60 * 60),
  };
}

const INITIAL_OFFERS: P2POffer[] = Array.from({ length: 8 }, makeFakeOffer);

const T = {
  ru: {
    title: 'P2P Рынок', buy: 'Купить', sell: 'Продать', myOffers: 'Мои лоты',
    price: 'Цена', qty: 'Кол-во', seller: 'Продавец',
    purchase: 'Купить', list: 'Выставить',
    selectItem: 'Выберите предмет', setPrice: 'Укажите цену',
    yourInventory: 'Ваш инвентарь', noItems: 'Нет предметов для продажи',
    noOffers: 'Нет активных лотов', goldSuffix: 'золото',
    tonSuffix: 'TON', confirmBuy: 'Подтвердить покупку',
    listed: 'Выставлено!', notEnoughGold: 'Недостаточно золота',
    alreadyListed: 'Уже выставлен',
    ago: 'назад', min: 'мин', hour: 'ч',
  },
  en: {
    title: 'P2P Market', buy: 'Buy', sell: 'Sell', myOffers: 'My Offers',
    price: 'Price', qty: 'Qty', seller: 'Seller',
    purchase: 'Buy', list: 'List',
    selectItem: 'Select item', setPrice: 'Set price',
    yourInventory: 'Your inventory', noItems: 'No items to sell',
    noOffers: 'No active offers', goldSuffix: 'gold',
    tonSuffix: 'TON', confirmBuy: 'Confirm purchase',
    listed: 'Listed!', notEnoughGold: 'Not enough gold',
    alreadyListed: 'Already listed',
    ago: 'ago', min: 'min', hour: 'h',
  },
};

export const P2PMarket: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { inventory, language, goldBalance, addInventoryItem, removeInventoryItem, setGoldBalance, addP2POffer, removeP2POffer, p2pOffers } = useGameStore();
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');
  const [marketOffers, setMarketOffers] = useState<P2POffer[]>(INITIAL_OFFERS);
  const [selectedInvItem, setSelectedInvItem] = useState<string | null>(null);
  const [sellQty, setSellQty] = useState(1);
  const [sellPriceGold, setSellPriceGold] = useState(10);
  const [sellPriceTon, setSellPriceTon] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const t = T[language];

  // Auto-generate fake offers every 5 min
  useEffect(() => {
    const id = setInterval(() => {
      const newOffers = Array.from({ length: 1 + Math.floor(Math.random() * 2) }, makeFakeOffer);
      setMarketOffers(prev => [...newOffers, ...prev].slice(0, 40));
    }, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleBuy = (offer: P2POffer) => {
    if (goldBalance < offer.priceGold) {
      showToast(t.notEnoughGold);
      return;
    }
    setGoldBalance(goldBalance - offer.priceGold);
    addInventoryItem(offer.itemId, offer.quantity);
    setMarketOffers(prev => prev.filter(o => o.id !== offer.id));
    showToast(`✅ ${language === 'ru' ? 'Куплено!' : 'Bought!'}`);
  };

  const handleBuyMyOffer = (offer: P2POffer) => {
    removeP2POffer(offer.id);
    showToast(language === 'ru' ? '↩️ Снято с продажи' : '↩️ Unlisted');
  };

  const handleList = () => {
    if (!selectedInvItem) return;
    const inv = inventory.find(i => i.instanceId === selectedInvItem);
    if (!inv) return;
    const alreadyListed = p2pOffers.some(o => o.id.startsWith('mine_') && o.itemId === inv.itemId);
    if (alreadyListed) { showToast(t.alreadyListed); return; }

    const qty = Math.min(sellQty, inv.quantity);
    const offer: P2POffer = {
      id: `mine_${Date.now()}`,
      seller: useGameStore.getState().playerName,
      itemId: inv.itemId,
      quantity: qty,
      priceGold: sellPriceGold,
      priceTon: sellPriceTon ? parseFloat(sellPriceTon) : null,
      createdAt: Date.now(),
      isMine: true,
    };
    removeInventoryItem(selectedInvItem, qty);
    addP2POffer(offer);
    setSelectedInvItem(null);
    showToast(t.listed);
  };

  const timeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} ${t.min} ${t.ago}`;
    return `${Math.floor(mins / 60)} ${t.hour} ${t.ago}`;
  };

  const allOffers = tab === 'buy'
    ? [...marketOffers, ...p2pOffers.filter(o => !o.isMine)]
    : p2pOffers.filter(o => o.isMine);

  const sellableInventory = inventory.filter(i => {
    const def = ITEMS[i.itemId];
    return def && def.slot !== 'resource' ? true : def?.slot === 'resource';
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-800/95 backdrop-blur anim-fade-in">
      <div className="relative w-full max-w-md mx-3 bg-dark-700 border border-white/10 rounded-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: '92vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <h2 className="text-white font-bold text-lg">🤝 {t.title}</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X size={20} /></button>
        </div>

        {/* Gold balance */}
        <div className="flex items-center justify-between px-5 py-2 bg-dark-800/60 border-b border-white/5">
          <span className="text-white/50 text-xs">{language === 'ru' ? 'Ваш баланс' : 'Your balance'}</span>
          <span className="text-primary-400 font-bold text-sm flex items-center gap-1"><IconGold size={12} /> {goldBalance} {language === 'ru' ? 'золота' : 'gold'}</span>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-white/10">
          {(['buy', 'sell'] as const).map(tabKey => (
            <button
              key={tabKey}
              onClick={() => setTab(tabKey)}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                tab === tabKey
                  ? 'text-primary-400 border-b-2 border-primary-400 bg-primary-900/10'
                  : 'text-white/50 hover:text-white/70'
              }`}
            >
              {tabKey === 'buy' ? <ShoppingBag size={14} /> : <TrendingUp size={14} />}
              {tabKey === 'buy' ? t.buy : t.sell}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-3">
          {/* BUY tab */}
          {tab === 'buy' && (
            <div className="space-y-2">
              {allOffers.length === 0 && (
                <p className="text-white/30 text-sm text-center py-8">{t.noOffers}</p>
              )}
              {allOffers.map(offer => {
                const def = ITEMS[offer.itemId];
                if (!def) return null;
                return (
                  <div key={offer.id}
                    className="flex items-center gap-3 bg-dark-800 rounded-xl p-3 border border-white/5 hover:border-white/10">
                    <ItemIcon iconName={def.iconName} size={28} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-white/90 text-sm font-medium">
                          {language === 'ru' ? def.name : def.nameEn}
                        </span>
                        {def.stackable && offer.quantity > 1 && (
                          <span className="text-white/40 text-xs">×{offer.quantity}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-white/30 text-[10px] truncate">{offer.seller}</span>
                        <span className="text-white/20 text-[10px]">• {timeAgo(offer.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-primary-400 text-sm font-bold flex items-center gap-1"><IconGold size={12} /> {offer.priceGold}</span>
                      {offer.priceTon && (
                        <span className="text-blue-400 text-xs">💎 {offer.priceTon} TON</span>
                      )}
                      <button
                        onClick={() => handleBuy(offer)}
                        className="bg-primary-500 text-dark-800 font-bold px-3 py-1 rounded-lg text-xs active:scale-95 transition-transform mt-1"
                      >
                        {t.purchase}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* SELL tab */}
          {tab === 'sell' && (
            <div className="space-y-3">
              {/* My listed offers */}
              {p2pOffers.filter(o => o.isMine).length > 0 && (
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-2">{t.myOffers}</p>
                  {p2pOffers.filter(o => o.isMine).map(offer => {
                    const def = ITEMS[offer.itemId];
                    return (
                      <div key={offer.id} className="flex items-center gap-3 bg-dark-800 rounded-xl p-3 border border-accent-500/20 mb-2">
                        {def && <ItemIcon iconName={def.iconName} size={24} />}
                        <div className="flex-1">
                          <span className="text-white/80 text-sm">{language === 'ru' ? def?.name : def?.nameEn}</span>
                          <div className="flex gap-2 mt-0.5">
                            <span className="text-primary-400 text-xs flex items-center gap-1"><IconGold size={12} /> {offer.priceGold}</span>
                            {offer.priceTon && <span className="text-blue-400 text-xs">💎 {offer.priceTon} TON</span>}
                          </div>
                        </div>
                        <button onClick={() => handleBuyMyOffer(offer)}
                          className="text-red-400 hover:text-red-300 text-xs border border-red-400/30 rounded-lg px-2 py-1">
                          {language === 'ru' ? 'Снять' : 'Unlist'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* List form */}
              <div className="bg-dark-800 rounded-xl p-3 border border-white/5">
                <p className="text-white/40 text-xs uppercase tracking-wider mb-2">{t.yourInventory}</p>
                {sellableInventory.length === 0 ? (
                  <p className="text-white/20 text-sm">{t.noItems}</p>
                ) : (
                  <div className="grid grid-cols-5 gap-1.5 mb-3">
                    {sellableInventory.slice(0, 15).map(item => {
                      const def = ITEMS[item.itemId];
                      return (
                        <button
                          key={item.instanceId}
                          onClick={() => { setSelectedInvItem(item.instanceId); setSellQty(1); }}
                          className={`aspect-square rounded-lg border flex flex-col items-center justify-center relative active:scale-90 ${
                            selectedInvItem === item.instanceId
                              ? 'border-primary-400 bg-primary-900/30'
                              : 'border-white/10 bg-dark-700 hover:border-white/20'
                          }`}
                        >
                          {def && <ItemIcon iconName={def.iconName} size={24} />}
                          {def?.stackable && item.quantity > 1 && (
                            <span className="absolute bottom-0 right-0.5 text-[9px] text-white/60 font-bold">{item.quantity}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {selectedInvItem && (() => {
                  const inv = inventory.find(i => i.instanceId === selectedInvItem);
                  const def = inv ? ITEMS[inv.itemId] : null;
                  if (!def) return null;
                  return (
                    <div className="space-y-2 border-t border-white/5 pt-3 anim-slide-up">
                      <div className="flex items-center gap-2">
                        <ItemIcon iconName={def.iconName} size={28} />
                        <span className="text-white font-medium">{language === 'ru' ? def.name : def.nameEn}</span>
                      </div>
                      {def.stackable && (
                        <div className="flex items-center gap-2">
                          <span className="text-white/50 text-xs w-16">{t.qty}</span>
                          <div className="flex items-center gap-2 bg-dark-700 rounded-lg p-1">
                            <button onClick={() => setSellQty(q => Math.max(1, q - 1))}
                              className="w-6 h-6 rounded text-white/60 hover:text-white flex items-center justify-center">
                              <Minus size={12} />
                            </button>
                            <span className="text-white text-sm w-6 text-center">{sellQty}</span>
                            <button onClick={() => setSellQty(q => Math.min(inv?.quantity ?? 1, q + 1))}
                              className="w-6 h-6 rounded text-white/60 hover:text-white flex items-center justify-center">
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-white/50 text-xs w-16 flex items-center gap-1"><IconGold size={12} /> {t.price}</span>
                        <input
                          type="number" min={1} value={sellPriceGold}
                          onChange={e => setSellPriceGold(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-24 bg-dark-700 text-white text-sm rounded-lg px-2 py-1 border border-white/10 outline-none focus:border-primary-400/50"
                        />
                        <span className="text-white/30 text-xs">gold</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white/50 text-xs w-16">💎 TON</span>
                        <input
                          type="number" min={0} step={0.01} value={sellPriceTon}
                          placeholder="0.00"
                          onChange={e => setSellPriceTon(e.target.value)}
                          className="w-24 bg-dark-700 text-white text-sm rounded-lg px-2 py-1 border border-white/10 outline-none focus:border-blue-400/50 placeholder-white/20"
                        />
                        <span className="text-white/30 text-xs">optional</span>
                      </div>
                      <button
                        onClick={handleList}
                        className="w-full bg-primary-500 text-dark-800 font-bold py-2.5 rounded-xl text-sm active:scale-95 transition-transform mt-1"
                      >
                        {t.list} → {language === 'ru' ? 'на рынок' : 'to market'}
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-dark-700 border border-white/20 text-white text-sm font-semibold px-6 py-3 rounded-xl anim-slide-up shadow-xl z-60">
          {toast}
        </div>
      )}
    </div>
  );
};
