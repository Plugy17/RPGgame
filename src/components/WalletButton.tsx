import React, { useState, useEffect } from 'react';
import { Wallet, Loader } from 'lucide-react';
import { tonConnect, shortAddress, GRAM_SHOP_ITEMS, type GramShopItem } from '../web3/tonConnect';
import { useGameStore } from '../store/gameStore';
import { playSfx } from '../audio/sfx';

const T = {
  ru: { connect: 'Подключить кошелёк', connecting: 'Подключение...', disconnect: 'Отключить',
        buy: 'Купить за GRAM', success: 'Куплено!', error: 'Ошибка', notEnough: 'Мало GRAM',
        shop: 'GRAM Магазин', close: 'Закрыть', balance: 'Баланс GRAM', selectWallet: 'Выберите кошелёк' },
  en: { connect: 'Connect Wallet', connecting: 'Connecting...', disconnect: 'Disconnect',
        buy: 'Buy for GRAM', success: 'Purchased!', error: 'Error', notEnough: 'Not enough GRAM',
        shop: 'GRAM Shop', close: 'Close', balance: 'GRAM Balance', selectWallet: 'Select wallet' },
};

export const WalletButton: React.FC = () => {
  const { walletAddress, tonBalance, setWallet, language, addInventoryItem, addGold, qualifyForAirdrop } = useGameStore();
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const t = T[language];

  useEffect(() => {
    const unsub = tonConnect.subscribe(s => {
      setWallet(s.address, s.balance);
    });
    return unsub;
  }, []);

  const handleConnect = async (walletName: string) => {
    setLoading(true);
    setShowMenu(false);
    try {
      playSfx('coin');
      await tonConnect.connect(walletName);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    tonConnect.disconnect();
    setShowMenu(false);
  };

  const handleBuy = async (item: GramShopItem) => {
    playSfx('coin');
    setBuyingId(item.id);
    const result = await tonConnect.sendTransaction({
      gramAmount: item.priceGram,
      itemId: item.itemId,
      to: 'EQD...developerWallet',
    });
    setBuyingId(null);
    if (result.ok) {
      if (item.itemId === 'gold') {
        addGold(200);
      } else if (item.itemId === 'listing_qualification') {
        qualifyForAirdrop();
      } else if (item.skinId) {
        useGameStore.getState().setActiveSkin(item.skinId);
        addInventoryItem(item.itemId, 1);
      } else {
        addInventoryItem(item.itemId, 1);
      }
      showToast(`✅ ${t.success}`);
      playSfx('magic_cast');
    } else {
      showToast(`❌ ${tonBalance !== null && tonBalance < item.priceGram ? t.notEnough : t.error}`);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 bg-dark-800/80 border border-white/10 rounded-full px-3 py-1.5">
        <Loader size={12} className="text-primary-400 animate-spin" />
        <span className="text-white/60 text-xs">{t.connecting}</span>
      </div>
    );
  }

  if (!walletAddress) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-1.5 bg-dark-800/80 border border-primary-400/40 rounded-full px-3 py-1.5 hover:border-primary-400 transition-colors active:scale-95"
        >
          <Wallet size={13} className="text-primary-400" />
          <span className="text-primary-300 text-xs font-semibold">{t.connect}</span>
        </button>
        {showMenu && (
          <div className="absolute top-9 right-0 bg-dark-700 border border-white/15 rounded-xl overflow-hidden shadow-xl z-50 w-48 anim-slide-up">
            <p className="text-white/40 text-[10px] uppercase px-3 pt-2 pb-1 tracking-wider">{t.selectWallet}</p>
            {tonConnect.wallets.map(w => (
              <button
                key={w.name}
                onClick={() => handleConnect(w.name)}
                className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-dark-600 transition-colors text-left"
              >
                <span className="text-lg">{w.icon}</span>
                <span className="text-white/80 text-sm">{w.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="relative flex items-center gap-1">
        <button
          onClick={() => setShowShop(true)}
          className="flex items-center gap-1.5 bg-dark-800/80 border border-accent-500/40 rounded-full px-3 py-1.5 hover:border-accent-400 transition-colors active:scale-95"
        >
          <span className="text-[10px] text-accent-300 font-mono">{shortAddress(walletAddress)}</span>
          {tonBalance !== null && (
            <span className="text-accent-400 text-xs font-bold ml-1">💎 {tonBalance.toFixed(2)}</span>
          )}
        </button>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-6 h-6 rounded-full bg-dark-800/80 border border-white/10 flex items-center justify-center text-white/40 hover:text-white"
        >
          ⋯
        </button>
        {showMenu && (
          <div className="absolute top-9 right-0 bg-dark-700 border border-white/15 rounded-xl overflow-hidden shadow-xl z-50 w-40 anim-slide-up">
            <button onClick={handleDisconnect}
              className="w-full px-3 py-2.5 text-red-400 hover:bg-dark-600 text-sm text-left">
              🔌 {t.disconnect}
            </button>
          </div>
        )}
      </div>

      {/* GRAM Shop Modal */}
      {showShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-800/90 backdrop-blur anim-fade-in"
          onClick={() => setShowShop(false)}>
          <div className="bg-dark-700 border border-white/10 rounded-2xl p-5 w-80 mx-3 anim-slide-up"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold font-cinzel">💎 {t.shop}</h3>
              <div className="flex items-center gap-1.5">
                <span className="text-accent-400 text-sm font-bold">{tonBalance?.toFixed(2)} GRAM</span>
                <button onClick={() => setShowShop(false)} className="text-white/40 hover:text-white text-lg ml-2">×</button>
              </div>
            </div>
            <div className="space-y-2">
              {GRAM_SHOP_ITEMS.map(item => (
                <div key={item.id} className="flex items-center gap-3 bg-dark-800 rounded-xl p-3 border border-white/5 hover:border-primary-400/30 transition-all">
                  <span className="text-3xl w-10 h-10 flex items-center justify-center">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-xs font-cinzel">{language === 'ru' ? item.name : item.nameEn}</p>
                    <p className="text-white/40 text-[10px] truncate font-almendra">{language === 'ru' ? item.description : item.descriptionEn}</p>
                  </div>
                  <button
                    disabled={buyingId === item.id}
                    onClick={() => handleBuy(item)}
                    className="relative flex items-center gap-1 bg-gradient-to-r from-primary-600 to-primary-500 text-dark-800 font-bold px-3 py-1.5 rounded-lg text-xs active:scale-95 disabled:opacity-50 font-cinzel"
                  >
                    {buyingId === item.id
                      ? <Loader size={12} className="animate-spin" />
                      : <span>💎 {item.priceGram} GRAM</span>
                    }
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-dark-700 border border-primary-400/30 text-primary-200 text-sm font-semibold px-5 py-2.5 rounded-xl anim-slide-up z-[100] font-cinzel">
          {toast}
        </div>
      )}
    </>
  );
};