import React, { useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { IconAlliance, IconCrown, IconRaid, IconGold } from './GameIcons';

const FAKE_ALLIANCES = [
  { id:'a1', name:'Стражи Азерии', tag:'SGA', members:42, maxMembers:50, level:8 },
  { id:'a2', name:'Железный Орден', tag:'IRO', members:28, maxMembers:50, level:5 },
  { id:'a3', name:'Тёмные Клинки', tag:'DB',  members:15, maxMembers:30, level:3 },
  { id:'a4', name:'Рыцари Рассвета',tag:'KR', members:38, maxMembers:50, level:7 },
];

const T = {
  ru: { title:'Альянсы', back:'Назад', create:'Создать альянс (500 золота)', join:'Вступить', leave:'Покинуть',
        myAlliance:'Мой альянс', available:'Доступные альянсы', name:'Название', members:'Участники',
        level:'Уровень', raid:'Рейды', noAlliance:'Вы не состоите в альянсе',
        createName:'Название альянса...', createTag:'Тег (3 буквы)...', created:'Альянс создан!',
        notEnoughGold:'Недостаточно золота', joined:'Вы вступили!', left:'Вы покинули альянс' },
  en: { title:'Alliances', back:'Back', create:'Create alliance (500 gold)', join:'Join', leave:'Leave',
        myAlliance:'My Alliance', available:'Available Alliances', name:'Name', members:'Members',
        level:'Level', raid:'Raids', noAlliance:'You are not in an alliance',
        createName:'Alliance name...', createTag:'Tag (3 letters)...', created:'Alliance created!',
        notEnoughGold:'Not enough gold', joined:'Joined!', left:'Left alliance' },
};

export const AllianceScreen: React.FC = () => {
  const { setScreen, language, currentAllianceId, setAlliance, goldBalance, setGoldBalance } = useGameStore();
  const [createMode, setCreateMode] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTag, setNewTag] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const t = T[language];

  const myAlliance = currentAllianceId ? FAKE_ALLIANCES.find(a => a.id === currentAllianceId) : null;

  const handleCreate = () => {
    if (goldBalance < 500) { showToast(t.notEnoughGold); return; }
    if (!newName || !newTag) return;
    setGoldBalance(goldBalance - 500);
    setAlliance(`custom_${Date.now()}`);
    setCreateMode(false);
    showToast(t.created);
  };

  const handleJoin = (id: string) => {
    setAlliance(id);
    showToast(t.joined);
  };

  const handleLeave = () => {
    setAlliance(null);
    showToast(t.left);
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  return (
    <div className="relative w-full h-full flex flex-col bg-dark-800 overflow-y-auto scrollbar-hide">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
        <button onClick={() => setScreen('menu')} className="text-white/50 hover:text-white"><ArrowLeft size={20} /></button>
        <h1 className="text-white font-bold text-xl flex items-center gap-2"><IconAlliance size={22} glow /> {t.title}</h1>
      </div>

      <div className="flex-1 px-5 py-5 space-y-4">
        {/* My alliance */}
        <div className="bg-dark-700 rounded-xl p-4 border border-white/10">
          <p className="text-white/40 text-xs uppercase tracking-wider mb-3">{t.myAlliance}</p>
          {myAlliance ? (
            <div>
              <div className="flex items-center gap-3">
                <IconCrown size={24} glow />
                <div>
                  <p className="text-white font-bold text-lg">[{myAlliance.tag}] {myAlliance.name}</p>
                  <div className="flex gap-3 mt-1">
                    <span className="text-white/40 text-xs">{t.members}: {myAlliance.members}/{myAlliance.maxMembers}</span>
                    <span className="text-primary-400 text-xs">{t.level}: {myAlliance.level}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-3">
                <button onClick={() => setScreen('raid')}
                  className="flex-1 bg-red-900/40 border border-red-500/30 text-red-300 font-bold py-2 rounded-xl text-sm flex items-center justify-center gap-2 active:scale-95">
                  <IconRaid size={14} /> {t.raid}
                </button>
                <button onClick={handleLeave}
                  className="bg-dark-800 border border-white/10 text-white/50 py-2 px-4 rounded-xl text-sm active:scale-95">
                  {t.leave}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-white/30 text-sm">{t.noAlliance}</p>
              {!createMode ? (
                <button onClick={() => setCreateMode(true)}
                  className="mt-3 w-full bg-primary-500 text-dark-800 font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 active:scale-95">
                  <Plus size={14} /> {t.create}
                </button>
              ) : (
                <div className="space-y-2 mt-3 anim-slide-up">
                  <input value={newName} onChange={e => setNewName(e.target.value)} placeholder={t.createName}
                    className="w-full bg-dark-800 text-white text-sm rounded-lg px-3 py-2 border border-white/10 outline-none focus:border-primary-400/50 placeholder-white/20" />
                  <input value={newTag} onChange={e => setNewTag(e.target.value.slice(0,3).toUpperCase())} placeholder={t.createTag}
                    className="w-full bg-dark-800 text-white text-sm rounded-lg px-3 py-2 border border-white/10 outline-none focus:border-primary-400/50 placeholder-white/20" />
                  <button onClick={handleCreate}
                    className="w-full bg-primary-500 text-dark-800 font-bold py-2.5 rounded-xl text-sm active:scale-95">
                    {t.create}
                  </button>
                  <button onClick={() => setCreateMode(false)} className="w-full text-white/30 text-xs py-1">{t.back}</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Available alliances */}
        {!currentAllianceId && (
          <div className="bg-dark-700 rounded-xl p-4 border border-white/10">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-3">{t.available}</p>
            <div className="space-y-2">
              {FAKE_ALLIANCES.map(a => (
                <div key={a.id} className="flex items-center gap-3 bg-dark-800 rounded-xl p-3 border border-white/5">
                  <IconCrown size={20} />
                  <div className="flex-1">
                    <p className="text-white/90 text-sm font-medium">[{a.tag}] {a.name}</p>
                    <div className="flex gap-3 mt-0.5">
                      <span className="text-white/30 text-xs">{a.members}/{a.maxMembers}</span>
                      <span className="text-primary-400/60 text-xs">LV {a.level}</span>
                    </div>
                  </div>
                  <button onClick={() => handleJoin(a.id)}
                    className="bg-primary-500 text-dark-800 font-bold px-3 py-1.5 rounded-lg text-xs active:scale-95">
                    {t.join}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-dark-600 border border-white/20 text-white text-sm font-bold px-5 py-2.5 rounded-xl anim-slide-up z-[100]">
          {toast}
        </div>
      )}
    </div>
  );
};
