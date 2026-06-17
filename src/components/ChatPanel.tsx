import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export const ChatPanel: React.FC = () => {
  const { chatMessages, chatOpen, setChatOpen, sendChatMessage, language } = useGameStore();
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatOpen) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatOpen]);

  const submit = () => {
    const text = input.trim();
    if (!text) return;
    sendChatMessage(text);
    setInput('');
  };

  if (!chatOpen) {
    return (
      <button
        onClick={() => setChatOpen(true)}
        className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-dark-800/80 border border-white/20 flex items-center justify-center active:scale-90 transition-transform"
      >
        <MessageSquare size={16} className="text-white/70" />
        {chatMessages.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full text-[9px] text-dark-800 font-black flex items-center justify-center">
            {Math.min(chatMessages.length, 9)}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="absolute top-3 right-3 z-30 w-64 flex flex-col bg-dark-800/95 backdrop-blur border border-white/10 rounded-xl overflow-hidden anim-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <span className="text-white/80 text-sm font-semibold">
          {language === 'ru' ? '💬 Чат' : '💬 Chat'}
        </span>
        <button onClick={() => setChatOpen(false)} className="text-white/40 hover:text-white">
          <X size={14} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-2 space-y-1.5" style={{ maxHeight: '180px' }}>
        {chatMessages.map(msg => (
          <div key={msg.id} className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-primary-400 text-[10px] font-semibold">{msg.sender}</span>
              <span className="text-white/20 text-[9px]">{msg.time}</span>
            </div>
            <p className="text-white/80 text-xs leading-relaxed">{msg.text}</p>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-1.5 px-2 py-2 border-t border-white/10">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder={language === 'ru' ? 'Написать...' : 'Message...'}
          className="flex-1 bg-dark-700 text-white text-xs rounded-lg px-2 py-1.5 border border-white/10 outline-none focus:border-primary-500/50 placeholder-white/30"
        />
        <button
          onClick={submit}
          className="w-7 h-7 rounded-lg bg-primary-500 flex items-center justify-center active:scale-90"
        >
          <Send size={12} className="text-dark-800" />
        </button>
      </div>
    </div>
  );
};
