import React, { useEffect, useRef, useState } from 'react';
import { HubEngine, HUB_NPCS } from '../game/HubEngine';
import { useGameStore } from '../store/gameStore';
import { HUD } from './HUD';
import { InventoryPanel } from './InventoryPanel';
import { ChatPanel } from './ChatPanel';
import { NpcDialog } from './NpcDialog';
import { P2PMarket } from './P2PMarket';
import { DuelOverlay } from './DuelOverlay';
import { IconHub, IconBackpack, IconMarket, IconSword } from './GameIcons';
import { playSfx } from '../audio/sfx';

interface JoystickState { active: boolean; baseX: number; baseY: number; knobX: number; knobY: number; }
const JOYSTICK_RADIUS = 52;

export const HubScreen: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<HubEngine | null>(null);
  const joystickRef = useRef<{ dx: number; dz: number }>({ dx: 0, dz: 0 });

  const [joystick, setJoystick] = useState<JoystickState>({ active: false, baseX: 60, baseY: 0, knobX: 0, knobY: 0 });
  const [nearNpcId, setNearNpcId] = useState<string | null>(null);
  const [openNpcId, setOpenNpcId] = useState<string | null>(null);
  const [showP2P, setShowP2P] = useState(false);
  const [privateChatUser, setPrivateChatUser] = useState<string | null>(null);
  const [showDuelPrompt, setShowDuelPrompt] = useState<string | null>(null);

  const store = useGameStore();
  const { inventory, equipment, inventoryOpen, setInventoryOpen, setPlayerPos, language, activeSkin, duel } = store;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new HubEngine(canvas, {
      onNpcNear: setNearNpcId,
      onPositionUpdate: setPlayerPos,
      onBotClick: (name) => setShowDuelPrompt(name),
    });
    engineRef.current = engine;
    engine.updateEquipment({ head: equipment.head, weapon: equipment.weapon }, inventory);
    engine.updateSkin(activeSkin);
    engine.start();

    const ro = new ResizeObserver(() => engine.resize(canvas.clientWidth, canvas.clientHeight));
    ro.observe(canvas);
    const tick = setInterval(() => engine.setJoystick(joystickRef.current), 16);
    return () => { engine.dispose(); ro.disconnect(); clearInterval(tick); };
  }, []);

  useEffect(() => {
    engineRef.current?.updateEquipment({ head: equipment.head, weapon: equipment.weapon }, inventory);
  }, [equipment, inventory]);

  useEffect(() => { engineRef.current?.updateSkin(activeSkin); }, [activeSkin]);

  const onJoyStart = (e: React.PointerEvent) => {
    e.preventDefault();
    setJoystick({ active: true, baseX: e.clientX, baseY: e.clientY, knobX: 0, knobY: 0 });
  };
  const onJoyMove = (e: React.PointerEvent) => {
    if (!joystick.active) return;
    const dx = e.clientX - joystick.baseX;
    const dy = e.clientY - joystick.baseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const capped = Math.min(dist, JOYSTICK_RADIUS);
    const angle = Math.atan2(dy, dx);
    const knobX = Math.cos(angle) * capped;
    const knobY = Math.sin(angle) * capped;
    joystickRef.current = { dx: knobX / JOYSTICK_RADIUS, dz: knobY / JOYSTICK_RADIUS };
    setJoystick(j => ({ ...j, knobX, knobY }));
  };
  const onJoyEnd = () => {
    joystickRef.current = { dx: 0, dz: 0 };
    setJoystick(j => ({ ...j, active: false, knobX: 0, knobY: 0 }));
  };

  const npcDef = HUB_NPCS.find(n => n.id === nearNpcId);
  const npcLabel = npcDef ? (language === 'ru' ? npcDef.name : npcDef.nameEn) : null;

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <HUD />

      <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-dark-800/70 backdrop-blur px-4 py-1 rounded-full border border-primary-500/20 z-20 flex items-center gap-1.5">
        <IconHub size={14} glow />
        <span className="text-white/90 text-xs font-cinzel font-semibold tracking-wider uppercase">
          {language === 'ru' ? 'Цитадель Азерии' : 'Citadel of Azeria'}
        </span>
      </div>

      <button onClick={() => store.setScreen('menu')}
        className="absolute top-3 left-3 z-20 bg-dark-800/80 border border-white/15 rounded-full px-3 py-1.5 text-white/70 text-xs hover:text-white active:scale-95 font-cinzel">
        ← {language === 'ru' ? 'Меню' : 'Menu'}
      </button>

      {nearNpcId && !openNpcId && !inventoryOpen && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none anim-fade-in">
          <div className="bg-dark-800/80 backdrop-blur border border-primary-400/40 rounded-xl px-6 py-3 text-center">
            <p className="text-primary-200 font-cinzel font-bold text-sm">{npcLabel}</p>
            <p className="text-white/50 text-xs mt-1 font-almendra">{language === 'ru' ? 'Нажмите для взаимодействия' : 'Tap to interact'}</p>
          </div>
        </div>
      )}

      {nearNpcId && !openNpcId && !inventoryOpen && (
        <button className="absolute inset-0 z-21" style={{ background:'transparent' }} onClick={() => setOpenNpcId(nearNpcId)} />
      )}

      <div className="absolute bottom-0 left-0 w-1/2 h-2/5 z-22"
        onPointerDown={onJoyStart} onPointerMove={onJoyMove} onPointerUp={onJoyEnd} onPointerLeave={onJoyEnd}
        style={{ touchAction: 'none' }}>
        {joystick.active ? (
          <div className="absolute pointer-events-none" style={{ left: joystick.baseX - JOYSTICK_RADIUS, top: joystick.baseY - JOYSTICK_RADIUS - (window.innerHeight - (canvasRef.current?.offsetHeight ?? window.innerHeight)) }}>
            <div className="absolute rounded-full bg-white/10 border-2 border-white/30" style={{ width: JOYSTICK_RADIUS * 2, height: JOYSTICK_RADIUS * 2 }} />
            <div className="absolute rounded-full bg-white/50 border-2 border-white/80" style={{ width: 40, height: 40, left: JOYSTICK_RADIUS - 20 + joystick.knobX, top: JOYSTICK_RADIUS - 20 + joystick.knobY }} />
          </div>
        ) : (
          <div className="absolute bottom-8 left-8 w-24 h-24 rounded-full border border-white/10 bg-white/5 flex items-center justify-center pointer-events-none">
            <span className="text-white/20 text-3xl">+</span>
          </div>
        )}
      </div>

      <div className="absolute bottom-6 right-4 z-20 flex flex-col gap-3 items-end">
        <button onClick={() => setShowP2P(true)}
          className="flex items-center gap-1.5 bg-dark-800/80 border border-white/20 rounded-full px-3 py-2 text-sm font-semibold text-white/80 active:scale-90 transition-transform hover:border-primary-400/50 font-cinzel">
          <IconMarket size={14} glow /> {language === 'ru' ? 'Рынок' : 'Market'}
        </button>
        <button onClick={() => setInventoryOpen(true)}
          className="w-12 h-12 rounded-full bg-dark-800/80 border border-white/20 flex items-center justify-center active:scale-90 transition-transform">
          <IconBackpack size={20} glow />
        </button>
      </div>

      <ChatPanel />

      {inventoryOpen && <InventoryPanel />}
      {openNpcId && <NpcDialog npcId={openNpcId} onClose={() => setOpenNpcId(null)} />}
      {showP2P && <P2PMarket onClose={() => setShowP2P(false)} />}

      {/* Duel prompt on bot click */}
      {showDuelPrompt && !duel.active && (
        <div className="absolute inset-0 z-40 flex items-end bg-dark-800/80 backdrop-blur anim-fade-in" onClick={() => setShowDuelPrompt(null)}>
          <div className="w-full bg-dark-700 border-t border-white/10 rounded-t-2xl p-4 anim-slide-up" onClick={e => e.stopPropagation()}>
            <p className="text-white font-cinzel font-semibold text-sm mb-2">
              {showDuelPrompt}
            </p>
            <p className="text-white/40 text-xs font-almendra mb-3">
              {language === 'ru' ? 'Что вы хотите сделать?' : 'What would you like to do?'}
            </p>
            <div className="flex gap-2">
              <button onClick={() => { store.startDuel(showDuelPrompt); playSfx('sword_swing'); setShowDuelPrompt(null); }}
                className="flex-1 bg-red-600 text-white font-cinzel font-bold py-2 rounded-xl text-sm active:scale-95 flex items-center justify-center gap-2">
                <IconSword size={14} /> {language === 'ru' ? 'Дуэль' : 'Duel'}
              </button>
              <button onClick={() => { store.setPrivateChatTarget(showDuelPrompt); setShowDuelPrompt(null); }}
                className="flex-1 bg-primary-500 text-dark-800 font-cinzel font-bold py-2 rounded-xl text-sm active:scale-95">
                {language === 'ru' ? 'Чат' : 'Chat'}
              </button>
              <button onClick={() => setShowDuelPrompt(null)}
                className="bg-dark-800 border border-white/10 text-white/50 py-2 px-4 rounded-xl text-sm active:scale-95 font-cinzel">
                {language === 'ru' ? 'Закрыть' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duel overlay */}
      {duel.active && <DuelOverlay />}
      {!duel.active && duel.log.length > 0 && <DuelOverlay />}
    </div>
  );
};
