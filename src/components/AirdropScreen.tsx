import React, { useState } from 'react';
import { ArrowLeft, Loader } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { tonConnect, TON_SHOP_ITEMS } from '../web3/tonConnect';
import { IconAirdrop, IconTon, IconVerified, IconUnverified, IconCrown } from './GameIcons';

const T = {
  ru: { title:'Airdrop & Листинг $AZR', back:'Назад', activate:'Активировать квалификацию',
        verified:'Квалифицирован', unverified:'Не верифицирован для дропа', verifyCost:'Верификация: 0.5 TON',
        progress:'Готовность к листингу', rules:'Правила распределения', rule1:'Опыт → количество $AZR',
        rule2:'Выполненные квесты → бонусный множитель', rule3:'Верификация кошелька → стартовый буст x2 XP',
        rule4:'Уровень 50 → максимальный дроп', connecting:'Подключение кошельта...', processing:'Обработка транзакции...',
        success:'Вы верифицированы! Бонус x2 XP активирован.', error:'Транзакция отклонена',
        already:'Вы уже верифицированы', tonShop:'TON Магазин', buy:'Купить' },
  en: { title:'Airdrop & $AZR Listing', back:'Back', activate:'Activate Qualification',
        verified:'Qualified', unverified:'Not verified for drop', verifyCost:'Verification: 0.5 TON',
        progress:'Listing Readiness', rules:'Distribution Rules', rule1:'Experience → $AZR amount',
        rule2:'Completed quests → bonus multiplier', rule3:'Wallet verification → x2 XP start boost',
        rule4:'Level 50 → maximum drop', connecting:'Connecting wallet...', processing:'Processing transaction...',
        success:'You are verified! x2 XP boost activated.', error:'Transaction rejected',
        already:'Already verified', tonShop:'TON Shop', buy:'Buy' },
};

export const AirdropScreen: React.FC = () => {
  const { setScreen, language, airdropVerified, setAirdropVerified, walletAddress,
          playerLevel, questProgress, setWallet } = useGameStore();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const t = T[language];

  const completedQuests = questProgress.filter(q => q.claimed).length;
  const totalQuests = questProgress.length;
  const progressPct = Math.min(100,
    (playerLevel / 50) * 30 +
    (completedQuests / totalQuests) * 40 +
    (airdropVerified ? 20 : 0) +
    (walletAddress ? 10 : 0)
  );

  const handleActivate = async () => {
    if (airdropVerified) { showToast(t.already); return; }
    if (!walletAddress) {
      setLoading(true);
      try { const state = await tonConnect.connect('Tonkeeper'); setWallet(state.address, state.balance); }
      catch { setLoading(false); showToast(t.error); return; }
      setLoading(false);
    }
    setLoading(true);
    const result = await tonConnect.sendTransaction({ tonAmount: 0.5, itemId: 'airdrop_verify' });
    setLoading(false);
    if (result.ok) {
      setAirdropVerified(true);
      showToast(t.success);
    } else { showToast(t.error); }
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  return (
    <div className="relative w-full h-full flex flex-col bg-dark-800 overflow-y-auto scrollbar-hide">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
        <button onClick={() => setScreen('menu')} className="text-white/50 hover:text-white"><ArrowLeft size={20} /></button>
        <h1 className="text-white font-bold text-xl flex items-center gap-2">
          <IconAirdrop size={22} glow /> {t.title}
        </h1>
      </div>

      <div className="flex-1 px-5 py-5 space-y-5">
        {/* Verification status */}
        <div className={`rounded-xl p-4 border ${airdropVerified ? 'border-accent-500/40 bg-accent-900/10' : 'border-red-500/30 bg-red-900/10'}`}>
          <div className="flex items-center gap-3">
            {airdropVerified ? <IconVerified size={28} /> : <IconUnverified size={28} />}
            <div>
              <p className={`font-bold text-lg ${airdropVerified ? 'text-accent-400' : 'text-red-400'}`}>
                {airdropVerified ? t.verified : t.unverified}
              </p>
              {!airdropVerified && <p className="text-white/40 text-xs mt-0.5">{t.verifyCost}</p>}
            </div>
          </div>
          {!airdropVerified && (
            <button
              onClick={handleActivate}
              disabled={loading}
              className="mt-3 w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white font-bold py-3 rounded-xl text-sm active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader size={16} className="animate-spin" /> : <IconTon size={16} />}
              {loading ? (walletAddress ? t.processing : t.connecting) : t.activate}
            </button>
          )}
        </div>

        {/* Listing progress */}
        <div className="bg-dark-700 rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/60 text-sm font-semibold">{t.progress}</p>
            <span className="text-primary-400 font-bold text-lg">{Math.round(progressPct)}%</span>
          </div>
          <div className="w-full h-3 bg-dark-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary-500 to-accent-400 rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }} />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <Stat label={`LV ${playerLevel}/50`} pct={Math.min(playerLevel/50*100,100)} color="text-yellow-400" />
            <Stat label={`${completedQuests}/${totalQuests} Q`} pct={completedQuests/totalQuests*100} color="text-green-400" />
            <Stat label={walletAddress ? 'Wallet' : 'No Wallet'} pct={walletAddress?100:0} color="text-blue-400" />
            <Stat label={airdropVerified ? 'Verified' : 'Unverified'} pct={airdropVerified?100:0} color="text-purple-400" />
          </div>
        </div>

        {/* Rules */}
        <div className="bg-dark-700 rounded-xl p-4 border border-white/10">
          <p className="text-white/60 text-sm font-semibold mb-3">{t.rules}</p>
          <div className="space-y-2">
            {[t.rule1, t.rule2, t.rule3, t.rule4].map((r, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-primary-400 text-xs mt-0.5 font-bold">{i+1}.</span>
                <p className="text-white/60 text-xs">{r}</p>
              </div>
            ))}
          </div>
        </div>

        {/* TON Shop preview */}
        <div className="bg-dark-700 rounded-xl p-4 border border-white/10">
          <p className="text-white/60 text-sm font-semibold mb-3 flex items-center gap-2">
            <IconCrown size={16} glow /> {t.tonShop}
          </p>
          {TON_SHOP_ITEMS.slice(0, 2).map(item => (
            <div key={item.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: item.rarity === 'epic' ? 'rgba(192,132,252,0.2)' : 'rgba(96,165,250,0.2)' }}>
                <IconTon size={16} />
              </div>
              <div className="flex-1">
                <p className="text-white/80 text-sm">{language === 'ru' ? item.name : item.nameEn}</p>
              </div>
              <span className="text-blue-400 text-xs font-bold">💎 {item.price} TON</span>
            </div>
          ))}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-dark-600 border border-white/20 text-white text-sm font-bold px-5 py-2.5 rounded-xl anim-slide-up z-[100]">
          {toast}
        </div>
      )}
    </div>
  );
};

const Stat: React.FC<{ label: string; pct: number; color: string }> = ({ label, pct, color }) => (
  <div>
    <div className="flex justify-between text-[10px]">
      <span className="text-white/40">{label}</span>
      <span className={color}>{Math.round(pct)}%</span>
    </div>
    <div className="w-full h-1 bg-dark-800 rounded-full overflow-hidden mt-0.5">
      <div className="h-full bg-white/20 rounded-full" style={{ width: `${pct}%` }} />
    </div>
  </div>
);
