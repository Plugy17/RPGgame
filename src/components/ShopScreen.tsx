import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { tonConnect, GRAM_SHOP_ITEMS, type GramShopItem } from '../web3/tonConnect';
import { playSfx } from '../audio/sfx';
import { IconTon, IconSkinFire, IconSkinIce, IconSkinShadow } from './GameIcons';

const T = {
  ru: { title: 'Магазин Скинов', gram: 'GRAM', buy: 'Купить', owned: 'Владеете', noWallet: 'Подключите кошелёк', insufficient: 'Недостаточно GRAM', success: 'Покупка успешна!', close: 'Закрыть', back: 'Назад' },
  en: { title: 'Skin Shop', gram: 'GRAM', buy: 'Buy', owned: 'Owned', noWallet: 'Connect wallet', insufficient: 'Insufficient GRAM', success: 'Purchase successful!', close: 'Close', back: 'Back' },
};

const skinIcons: Record<string, React.FC<{ size?: number; className?: string }>> = {
  skin_fire: IconSkinFire,
  skin_ice: IconSkinIce,
  skin_shadow: IconSkinShadow,
};

interface ShopScreenProps {
  onClose: () => void;
}

export const ShopScreen: React.FC<ShopScreenProps> = ({ onClose }) => {
  const lang = useGameStore(s => s.language);
  const activeSkin = useGameStore(s => s.activeSkin);
  const setActiveSkin = useGameStore(s => s.setActiveSkin);
  const addInventoryItem = useGameStore(s => s.addInventoryItem);
  const inventory = useGameStore(s => s.inventory);
  const addGold = useGameStore(s => s.addGold);
  const t = T[lang];

  const [walletState, setWalletState] = useState(tonConnect.getState());
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  React.useEffect(() => {
    const unsub = tonConnect.subscribe(setWalletState);
    return unsub;
  }, []);

  /** Check if the player already owns this item */
  const hasItem = (gi: GramShopItem): boolean => {
    if (gi.itemId === 'gold') return false; // gold is always purchasable
    return inventory.some(i => i.itemId === gi.itemId);
  };

  /** Check if skin is currently equipped */
  const isSkinActive = (gi: GramShopItem): boolean => {
    if (!gi.skinId) return false;
    return activeSkin === gi.skinId;
  };

  /** Handle purchase via GRAM */
  const handlePurchase = async (item: GramShopItem) => {
    playSfx('coin');
    setPurchasing(item.id);
    setStatusMsg(null);

    // 1. Check wallet connection
    if (!walletState.connected) {
      setStatusMsg(t.noWallet);
      setPurchasing(null);
      return;
    }

    // 2. Check balance
    if ((walletState.balance ?? 0) < item.priceGram) {
      setStatusMsg(t.insufficient);
      setPurchasing(null);
      return;
    }

    // 3. Send GRAM transaction
    const result = await tonConnect.sendTransaction({
      gramAmount: item.priceGram,
      to: 'EQD...developerWallet', // Replace with actual dev wallet
      itemId: item.id,
    });

    if (result.ok) {
      // 4. Grant item to player
      if (item.skinId) {
        // It's a skin — equip it immediately
        setActiveSkin(item.skinId);
        // Also add to inventory for persistence
        addInventoryItem(item.itemId, 1);
      } else if (item.itemId === 'gold') {
        addGold(200);
      } else if (item.itemId === 'listing_qualification') {
        // This is handled separately in gameStore
        useGameStore.getState().qualifyForAirdrop();
      } else {
        addInventoryItem(item.itemId, 1);
      }

      setStatusMsg(t.success);
      playSfx('magic_cast');
    } else {
      setStatusMsg(t.insufficient);
    }
    setPurchasing(null);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 max-h-[85vh] overflow-y-auto">
        {/* Ornate frame */}
        <svg className="absolute inset-0 w-full h-full text-primary-400/30" viewBox="0 0 400 600" preserveAspectRatio="none">
          <path d="M8 0 L110 0 L118 8 L130 8 L138 0 L392 0 Q400 0 400 8 L400 592 Q400 600 392 600 L138 600 L130 592 L118 592 L110 600 L8 600 Q0 600 0 592 L0 8 Q0 0 8 0 Z"
            fill="rgba(13,13,26,0.95)" stroke="currentColor" strokeWidth="1.5"/>
        </svg>

        <div className="relative px-5 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-primary-400 text-lg font-cinzel font-black tracking-wider">
              {t.title}
            </h2>
            <button onClick={() => { playSfx('coin'); onClose(); }}
              className="text-white/50 hover:text-white/80 transition-colors active:scale-90">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Wallet connection status */}
          <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-dark-800/80 rounded-lg border border-primary-500/20">
            <IconTon size={18} />
            {walletState.connected ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-green-400 text-xs font-cinzel">
                  {walletState.balance?.toFixed(2)} {t.gram}
                </span>
                <span className="text-white/30 text-[10px] font-cinzel">
                  {walletState.address ? `${walletState.address.slice(0, 6)}...` : ''}
                </span>
              </div>
            ) : (
              <button
                onClick={() => tonConnect.connect('Tonkeeper')}
                className="text-primary-300 text-xs font-cinzel hover:text-primary-200 transition-colors"
              >
                {t.noWallet}
              </button>
            )}
          </div>

          {/* Status message */}
          {statusMsg && (
            <div className="mb-3 px-3 py-2 bg-dark-800/90 rounded-lg border border-accent-400/30 text-center">
              <span className={`text-xs font-cinzel ${
                statusMsg === t.success ? 'text-green-400' : 'text-red-400'
              }`}>
                {statusMsg}
              </span>
            </div>
          )}

          {/* Shop items */}
          <div className="space-y-3">
            {GRAM_SHOP_ITEMS.map(item => {
              const owned = hasItem(item);
              const IconComp = item.skinId ? skinIcons[item.skinId] : undefined;
              const isProcessing = purchasing === item.id;

              return (
                <div key={item.id}
                  className="relative flex items-center gap-3 px-3 py-3 bg-dark-800/80 rounded-lg border border-white/5 hover:border-primary-400/30 transition-all"
                >
                  {/* Item icon */}
                  <div className="w-12 h-12 rounded-lg bg-dark-700/80 flex items-center justify-center text-2xl">
                    {IconComp ? <IconComp size={24} /> : <span>{item.icon}</span>}
                  </div>

                  {/* Item info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white/90 text-xs font-cinzel font-semibold truncate">
                      {lang === 'ru' ? item.name : item.nameEn}
                    </p>
                    <p className="text-white/40 text-[10px] font-almendra truncate mt-0.5">
                      {lang === 'ru' ? item.description : item.descriptionEn}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`text-[10px] font-cinzel ${
                        item.rarity === 'legendary' ? 'text-yellow-300' :
                        item.rarity === 'epic' ? 'text-purple-400' : 'text-blue-400'
                      }`}>
                        {item.rarity.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Buy / Owned button */}
                  <div>
                    {owned && isSkinActive(item) ? (
                      <span className="text-green-400 text-[10px] font-cinzel">{t.owned}</span>
                    ) : owned ? (
                      <button
                        onClick={() => { if (item.skinId) setActiveSkin(item.skinId); playSfx('magic_cast'); }}
                        className="text-primary-400 text-[10px] font-cinzel hover:text-primary-300 underline transition-colors"
                      >
                        {lang === 'ru' ? 'Надеть' : 'Equip'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePurchase(item)}
                        disabled={isProcessing}
                        className={`relative flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold transition-all active:scale-95 ${
                          isProcessing
                            ? 'bg-dark-600 text-white/30'
                            : 'bg-gradient-to-r from-primary-600 to-primary-500 text-dark-800 hover:from-primary-500 hover:to-primary-400'
                        }`}
                      >
                        {isProcessing ? (
                          <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round"/>
                          </svg>
                        ) : (
                          <>
                            <IconTon size={10} />
                            {item.priceGram}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Back button */}
          <button
            onClick={() => { playSfx('coin'); onClose(); }}
            className="relative mt-4 w-full py-2.5 text-white/50 text-xs font-cinzel tracking-wider border border-white/10 rounded-lg hover:border-primary-400/30 active:scale-95 transition-all"
          >
            {t.back}
          </button>
        </div>
      </div>
    </div>
  );
};