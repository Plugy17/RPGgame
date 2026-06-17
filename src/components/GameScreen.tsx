import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from '../game/GameEngine';
import { getLocation } from '../data/locations';
import { QUESTS } from '../data/quests';
import { useGameStore } from '../store/gameStore';
import { HUD } from './HUD';
import { InventoryPanel } from './InventoryPanel';
import { ChatPanel } from './ChatPanel';
import { IconBackpack, IconGather, IconPortal, IconHerb } from './GameIcons';
import { playSfx } from '../audio/sfx';

interface JoystickState {
  active: boolean;
  baseX: number;
  baseY: number;
  knobX: number;
  knobY: number;
}

const JOYSTICK_RADIUS = 52;

const OrnateJoystickBase = () => (
  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 110 110" fill="none">
    <circle cx="55" cy="55" r="54" stroke="rgba(251,191,36,0.2)" strokeWidth="1"/>
    <circle cx="55" cy="55" r="48" stroke="rgba(251,191,36,0.15)" strokeWidth="0.5"/>
    <circle cx="55" cy="55" r="42" stroke="rgba(251,191,36,0.1)" strokeWidth="0.5" strokeDasharray="4 2"/>
    <path d="M55 8 L55 16 M55 94 L55 102 M8 55 L16 55 M94 55 L102 55"
      stroke="rgba(251,191,36,0.3)" strokeWidth="1"/>
    <path d="M20 20 L26 26 M84 20 L78 26 M20 84 L26 78 M84 84 L78 78"
      stroke="rgba(251,191,36,0.2)" strokeWidth="1"/>
  </svg>
);

export const GameScreen: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const joystickRef = useRef<{ dx: number; dz: number }>({ dx: 0, dz: 0 });
  const collectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [joystick, setJoystick] = useState<JoystickState>({ active: false, baseX: 60, baseY: 0, knobX: 0, knobY: 0 });
  const [nearResourceId, setNearResourceId] = useState<string | null>(null);
  const [nearPortal, setNearPortal] = useState(false);
  const [blackout, setBlackout] = useState(false);
  const [portalEntered, setPortalEntered] = useState(false);

  const store = useGameStore();
  const {
    currentLocationId, inventory, equipment, computedStats,
    inventoryOpen, setInventoryOpen, setCollecting,
    addInventoryItem, advanceQuest, activeQuestId, setCurrentLocation,
    setPlayerPos, setPortalReached, characterRace,
  } = store;

  const location = getLocation(currentLocationId);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new GameEngine(canvas, location, {
      onResourceNear: (id) => { setNearResourceId(id); if (id) playSfx('gather'); },
      onPortalNear: (near) => {
        setNearPortal(near);
        if (near) setPortalReached(true);
      },
      onPortalEnter: () => {
        if (portalEntered) return;
        setPortalEntered(true);
        handlePortalEnter();
      },
      onPositionUpdate: setPlayerPos,
    }, characterRace);
    engineRef.current = engine;
    engine.updateEquipment(equipment, inventory);
    engine.start();

    const ro = new ResizeObserver(() => engine.resize(canvas.clientWidth, canvas.clientHeight));
    ro.observe(canvas);

    const animFrame = setInterval(() => {
      engine.setJoystick(joystickRef.current);
    }, 16);

    return () => {
      engine.dispose();
      ro.disconnect();
      clearInterval(animFrame);
    };
  }, [currentLocationId]);

  useEffect(() => {
    engineRef.current?.updateEquipment(equipment, inventory);
  }, [equipment, inventory]);

  const handlePortalEnter = useCallback(() => {
    if (!location.nextLocationId) return;
    playSfx('portal');
    setBlackout(true);
    setTimeout(() => {
      setCurrentLocation(location.nextLocationId!);
      setPortalEntered(false);
      setBlackout(false);
    }, 800);
  }, [location, setCurrentLocation]);

  const onJoyStart = (e: React.TouchEvent | React.PointerEvent) => {
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.PointerEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.PointerEvent).clientY;
    setJoystick({ active: true, baseX: clientX, baseY: clientY, knobX: 0, knobY: 0 });
  };

  const onJoyMove = (e: React.TouchEvent | React.PointerEvent) => {
    if (!joystick.active) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.PointerEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.PointerEvent).clientY;
    const rawDx = clientX - joystick.baseX;
    const rawDy = clientY - joystick.baseY;
    const dist = Math.sqrt(rawDx * rawDx + rawDy * rawDy);
    const capped = Math.min(dist, JOYSTICK_RADIUS);
    const angle = Math.atan2(rawDy, rawDx);
    const knobX = Math.cos(angle) * capped;
    const knobY = Math.sin(angle) * capped;
    const ndx = knobX / JOYSTICK_RADIUS;
    const ndy = knobY / JOYSTICK_RADIUS;
    joystickRef.current = { dx: ndx, dz: ndy };
    setJoystick(j => ({ ...j, knobX, knobY }));
  };

  const onJoyEnd = () => {
    joystickRef.current = { dx: 0, dz: 0 };
    setJoystick(j => ({ ...j, active: false, knobX: 0, knobY: 0 }));
  };

  const handleCollect = () => {
    if (!nearResourceId) return;
    const [, type] = nearResourceId.split('_');
    setCollecting(nearResourceId, 0);

    let p = 0;
    const interval = setInterval(() => {
      p += 10 / computedStats.gatherSpeed;
      if (p >= 100) {
        clearInterval(interval);
        engineRef.current?.collectResource(nearResourceId);
        addInventoryItem(type);
        setCollecting(null, 0);
        setNearResourceId(null);
        if (activeQuestId) {
          const quest = QUESTS.find(q => q.id === activeQuestId);
          if (quest?.type === 'gather' && quest.condition.resource === type &&
              quest.locationId === currentLocationId) {
            advanceQuest(activeQuestId);
          }
        }
      } else {
        setCollecting(nearResourceId, p);
      }
    }, 200);
    collectTimerRef.current = interval as unknown as ReturnType<typeof setTimeout>;
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {blackout && (
        <div className="absolute inset-0 bg-black z-50 transition-opacity duration-500" style={{ opacity: blackout ? 1 : 0 }} />
      )}

      <HUD />

      <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20">
        <div className="relative">
          <svg className="absolute inset-0 w-full h-full text-primary-400/30" viewBox="0 0 180 32" preserveAspectRatio="none">
            <path d="M4 0 L80 0 L88 4 L92 4 L100 0 L176 0 Q180 0 180 4 L180 28 Q180 32 176 32 L100 32 L92 28 L88 28 L80 32 L4 32 Q0 32 0 28 L0 4 Q0 0 4 0 Z"
              fill="rgba(26,26,46,0.85)" stroke="currentColor" strokeWidth="1"/>
          </svg>
          <div className="relative px-5 py-1.5">
            <span className="text-primary-300 text-xs font-cinzel font-semibold tracking-[0.2em] uppercase">
              {store.language === 'ru' ? location.name : location.nameEn}
            </span>
          </div>
        </div>
      </div>

      {nearPortal && !inventoryOpen && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none anim-fade-in">
          <div className="relative">
            <svg className="absolute inset-0 w-full h-full text-secondary-400/30" viewBox="0 0 260 80" preserveAspectRatio="none">
              <path d="M8 0 L120 0 L128 6 L132 6 L140 0 L252 0 Q260 0 260 8 L260 72 Q260 80 252 80 L140 80 L132 74 L128 74 L120 80 L8 80 Q0 80 0 72 L0 8 Q0 0 8 0 Z"
                fill="rgba(88,28,135,0.9)" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <div className="relative px-6 py-4 text-center">
              <p className="text-secondary-200 font-cinzel font-bold text-sm flex items-center justify-center gap-2">
                <IconPortal size={18} />
                {store.language === 'ru' ? 'Портал в следующую локацию' : 'Portal to next location'}
              </p>
              {location.nextLocationId ? (
                <p className="text-secondary-400/70 text-xs mt-1.5 font-almendra">
                  {store.language === 'ru' ? 'Войдите, чтобы перейти' : 'Enter to travel'}
                </p>
              ) : (
                <p className="text-primary-400 text-xs mt-1.5 font-almendra">
                  {store.language === 'ru' ? 'Последняя локация' : 'Last location'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div
        className="absolute bottom-0 left-0 w-1/2 h-2/5 z-20"
        onPointerDown={onJoyStart}
        onPointerMove={onJoyMove}
        onPointerUp={onJoyEnd}
        onPointerLeave={onJoyEnd}
        style={{ touchAction: 'none' }}
      >
        {joystick.active && (
          <div className="absolute pointer-events-none"
            style={{ left: joystick.baseX - JOYSTICK_RADIUS, top: joystick.baseY - JOYSTICK_RADIUS - (window.innerHeight - (canvasRef.current?.offsetHeight ?? window.innerHeight)), transform: 'none' }}>
            <div className="relative" style={{ width: JOYSTICK_RADIUS * 2, height: JOYSTICK_RADIUS * 2 }}>
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 110 110" fill="none">
                <circle cx="55" cy="55" r="54" stroke="rgba(251,191,36,0.4)" strokeWidth="1.5" fill="rgba(13,13,26,0.6)"/>
                <circle cx="55" cy="55" r="48" stroke="rgba(251,191,36,0.2)" strokeWidth="0.5"/>
              </svg>
              <div
                className="absolute rounded-full bg-gradient-to-br from-primary-400 to-primary-600 border-2 border-primary-300"
                style={{
                  width: 44, height: 44,
                  left: JOYSTICK_RADIUS - 22 + joystick.knobX,
                  top: JOYSTICK_RADIUS - 22 + joystick.knobY,
                  boxShadow: '0 0 15px rgba(251,191,36,0.5)'
                }}
              />
            </div>
          </div>
        )}
        {!joystick.active && (
          <div className="absolute bottom-8 left-8 w-28 h-28 pointer-events-none">
            <div className="relative w-full h-full">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 112 112" fill="none">
                <circle cx="56" cy="56" r="55" stroke="rgba(251,191,36,0.15)" strokeWidth="1" fill="rgba(13,13,26,0.3)"/>
                <circle cx="56" cy="56" r="48" stroke="rgba(251,191,36,0.1)" strokeWidth="0.5"/>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-10 h-10 text-primary-400/30" viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="8" stroke="currentColor" strokeWidth="1"/>
                  <path d="M20 4 L20 12 M20 28 L20 36 M4 20 L12 20 M28 20 L36 20" stroke="currentColor" strokeWidth="1"/>
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-6 right-4 z-20 flex flex-col gap-3 items-end">
        {nearResourceId && !inventoryOpen && (
          <div className="relative anim-slide-up">
            {store.collectingResource ? (
              <div className="relative">
                <svg className="absolute inset-0 w-full h-full text-accent-400/30" viewBox="0 0 130 44" preserveAspectRatio="none">
                  <path d="M4 0 L126 0 Q130 0 130 4 L130 40 Q130 44 126 44 L4 44 Q0 44 0 40 L0 4 Q0 0 4 0 Z"
                    fill="rgba(13,13,26,0.9)" stroke="currentColor" strokeWidth="1"/>
                </svg>
                <div className="relative px-4 py-2.5">
                  <div className="w-28 h-2 bg-dark-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-accent-500 to-accent-400 rounded-full transition-all duration-200"
                      style={{ width: `${store.collectProgress}%` }} />
                  </div>
                  <p className="text-accent-300 text-xs text-center mt-1.5 font-cinzel tracking-wider">
                    {store.language === 'ru' ? 'Сбор...' : 'Gathering...'}
                  </p>
                </div>
              </div>
            ) : (
              <button
                onClick={handleCollect}
                className="relative active:scale-95 transition-transform"
              >
                <svg className="absolute inset-0 w-full h-full text-accent-400" viewBox="0 0 120 48" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="gatherGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#34d399" stopOpacity="0.8"/>
                      <stop offset="50%" stopColor="#10b981" stopOpacity="1"/>
                      <stop offset="100%" stopColor="#34d399" stopOpacity="0.8"/>
                    </linearGradient>
                  </defs>
                  <path d="M6 0 L114 0 Q120 0 120 6 L120 42 Q120 48 114 48 L6 48 Q0 48 0 42 L0 6 Q0 0 6 0 Z"
                    fill="url(#gatherGrad)"/>
                </svg>
                <div className="relative px-6 py-3 flex items-center gap-2 text-dark-800 font-cinzel font-bold text-sm"
                  style={{ boxShadow: '0 0 20px rgba(16,185,129,0.4)' }}>
                  <IconHerb size={16} />
                  {store.language === 'ru' ? 'Собрать' : 'Gather'}
                </div>
              </button>
            )}
          </div>
        )}

        <button
          onClick={() => setInventoryOpen(true)}
          className="relative w-14 h-14 active:scale-90 transition-transform group"
          style={{ boxShadow: '0 0 15px rgba(251,191,36,0.2)' }}
        >
          <svg className="absolute inset-0 w-full h-full text-primary-400/40 group-hover:text-primary-400/60 transition-colors" viewBox="0 0 56 56" fill="none">
            <circle cx="28" cy="28" r="27" stroke="currentColor" strokeWidth="1" fill="rgba(13,13,26,0.85)"/>
            <circle cx="28" cy="28" r="22" stroke="currentColor" strokeWidth="0.5" opacity="0.5"/>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <IconBackpack size={22} />
          </div>
        </button>
      </div>

      <ChatPanel />

      {inventoryOpen && <InventoryPanel />}
    </div>
  );
};
