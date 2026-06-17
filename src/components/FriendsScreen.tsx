import React, { useState } from 'react';
import { ArrowLeft, Search, UserPlus, UserMinus } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { IconFriends, IconClassWarrior, IconClassMage, IconClassArcher, IconChat } from './GameIcons';

const FAKE_PLAYERS = [
  { id:'fp1', name:'BjornIronside', level:22, class:'warrior' as const, online:true },
  { id:'fp2', name:'LunaStarweaver', level:18, class:'mage' as const, online:true },
  { id:'fp3', name:'ShadowArrow', level:25, class:'archer' as const, online:false },
  { id:'fp4', name:'ThornBreaker', level:30, class:'warrior' as const, online:true },
  { id:'fp5', name:'IceWitch99', level:16, class:'mage' as const, online:false },
];

const T = {
  ru: { title:'Друзья', back:'Назад', search:'Поиск по нику...', add:'Добавить', remove:'Удалить',
        chat:'Чат', online:'Онлайн', offline:'Оффлайн', myFriends:'Мои друзья',
        found:'Найденные игроки', noFriends:'Список пуст', noResults:'Ничего не найдено',
        privateChat:'Приватный чат с', send:'Отправить', typeMsg:'Напишите сообщение...' },
  en: { title:'Friends', back:'Back', search:'Search by nickname...', add:'Add', remove:'Remove',
        chat:'Chat', online:'Online', offline:'Offline', myFriends:'My Friends',
        found:'Found Players', noFriends:'List is empty', noResults:'Nothing found',
        privateChat:'Private chat with', send:'Send', typeMsg:'Type a message...' },
};

const ClassIcon: React.FC<{ c: string; size?: number }> = ({ c, size = 16 }) => {
  if (c === 'mage') return <IconClassMage size={size} />;
  if (c === 'archer') return <IconClassArcher size={size} />;
  return <IconClassWarrior size={size} />;
};

export const FriendsScreen: React.FC = () => {
  const { setScreen, language, friends, addFriend, removeFriend, setPrivateChatTarget, playerName } = useGameStore();
  const [search, setSearch] = useState('');
  const [privateChat, setPrivateChat] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string }[]>([]);
  const t = T[language];

  const results = search.length >= 2
    ? FAKE_PLAYERS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) && !friends.find(f => f.id === p.id))
    : [];

  const handleAdd = (p: typeof FAKE_PLAYERS[0]) => {
    addFriend({ id: p.id, name: p.name, online: p.online, level: p.level, class: p.class });
  };

  const openChat = (name: string) => {
    setPrivateChat(name);
    setPrivateChatTarget(name);
    setChatMessages([{ sender: name, text: language === 'ru' ? 'Привет, путник!' : 'Hello, traveler!' }]);
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { sender: playerName, text: chatInput }]);
    // Simulate reply
    setTimeout(() => {
      const replies = language === 'ru'
        ? ['Давай в рейд!', 'У тебя есть руда?', 'Встретимся в Цитадели!', 'Я нашёл редкий меч!']
        : ['Let\'s raid!', 'Got any ore?', 'See you at the Citadel!', 'I found a rare sword!'];
      setChatMessages(prev => [...prev, { sender: privateChat!, text: replies[Math.floor(Math.random() * replies.length)] }]);
    }, 1500);
    setChatInput('');
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-dark-800 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
        <button onClick={() => setScreen('menu')} className="text-white/50 hover:text-white"><ArrowLeft size={20} /></button>
        <h1 className="text-white font-bold text-xl flex items-center gap-2"><IconFriends size={22} glow /> {t.title}</h1>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-white/5">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t.search}
            className="w-full bg-dark-700 text-white text-sm rounded-xl pl-9 pr-3 py-2.5 border border-white/10 outline-none focus:border-primary-400/50 placeholder-white/30"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Search results */}
        {results.length > 0 && (
          <div className="px-4 py-3">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-2">{t.found}</p>
            {results.map(p => (
              <div key={p.id} className="flex items-center gap-3 py-2.5 border-b border-white/5">
                <ClassIcon c={p.class} />
                <div className="flex-1">
                  <p className="text-white/90 text-sm font-medium">{p.name}</p>
                  <p className="text-white/30 text-xs">LV {p.level} · {p.online ? t.online : t.offline}</p>
                </div>
                <button onClick={() => handleAdd(p)} className="text-accent-400 text-xs font-semibold flex items-center gap-1">
                  <UserPlus size={12} /> {t.add}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Friends list */}
        <div className="px-4 py-3">
          <p className="text-white/40 text-xs uppercase tracking-wider mb-2">{t.myFriends}</p>
          {friends.length === 0 ? (
            <p className="text-white/20 text-sm text-center py-6">{t.noFriends}</p>
          ) : (
            friends.map(f => (
              <div key={f.id} className="flex items-center gap-3 py-2.5 border-b border-white/5">
                <div className="relative">
                  <ClassIcon c={f.class} />
                  <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${f.online ? 'bg-green-400' : 'bg-gray-500'}`} />
                </div>
                <div className="flex-1">
                  <p className="text-white/90 text-sm font-medium">{f.name}</p>
                  <p className="text-white/30 text-xs">LV {f.level} · {f.online ? t.online : t.offline}</p>
                </div>
                {f.online && (
                  <button onClick={() => openChat(f.name)} className="text-primary-400 text-xs flex items-center gap-1">
                    <IconChat size={12} /> {t.chat}
                  </button>
                )}
                <button onClick={() => removeFriend(f.id)} className="text-red-400/60 text-xs flex items-center gap-1">
                  <UserMinus size={12} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Private chat overlay */}
      {privateChat && (
        <div className="absolute inset-0 z-40 flex items-end bg-dark-800/95 backdrop-blur anim-fade-in">
          <div className="w-full bg-dark-700 border-t border-white/10 rounded-t-2xl flex flex-col" style={{ maxHeight: '60vh' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span className="text-white font-semibold text-sm">{t.privateChat} {privateChat}</span>
              <button onClick={() => setPrivateChat(null)} className="text-white/40 hover:text-white text-lg">x</button>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide p-3 space-y-2">
              {chatMessages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.sender === playerName ? 'items-end' : 'items-start'}`}>
                  <span className="text-white/30 text-[10px]">{m.sender}</span>
                  <div className={`px-3 py-1.5 rounded-xl text-sm ${m.sender === playerName ? 'bg-primary-500/20 text-primary-200' : 'bg-dark-800 text-white/80'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 px-3 py-2 border-t border-white/10">
              <input
                value={chatInput} onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder={t.typeMsg}
                className="flex-1 bg-dark-800 text-white text-sm rounded-lg px-3 py-2 border border-white/10 outline-none focus:border-primary-400/50 placeholder-white/20"
              />
              <button onClick={sendMessage} className="bg-primary-500 text-dark-800 font-bold px-3 py-2 rounded-lg text-sm active:scale-95">{t.send}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
