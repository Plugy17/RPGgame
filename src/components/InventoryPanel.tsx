import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { ITEMS, RARITY_COLORS } from '../data/items';
import type { Equipment } from '../store/gameStore';
import { WEAPON_TAGS, canEquipWeapon } from '../data/classes';
import { ItemIcon, IconArmor, IconSword, IconBackpack } from './GameIcons';

type EquipSlotKey = keyof Equipment;

const EQUIP_SLOTS: { key: EquipSlotKey; label: string; labelEn: string; icon: React.ReactNode }[] = [
  { key: 'head',   label: 'Голова',   labelEn: 'Head',   icon: <IconArmor size={24} /> },
  { key: 'body',   label: 'Тело',     labelEn: 'Body',   icon: <IconArmor size={24} /> },
  { key: 'legs',   label: 'Ноги',     labelEn: 'Legs',   icon: <IconArmor size={24} /> },
  { key: 'weapon', label: 'Оружие',   labelEn: 'Weapon', icon: <IconSword size={24} /> },
];

const GRID_COLS = 6;
const GRID_ROWS = 4;

export const InventoryPanel: React.FC<{ onClose?: () => void; standalone?: boolean }> = ({ onClose, standalone }) => {
  const { inventory, equipment, equipItem, unequipSlot, setInventoryOpen, language, computedStats, characterClass } = useGameStore();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const t = language === 'ru';

  const canEquip = (def: typeof ITEMS[string]): boolean => {
    if (def.slot === 'resource' || def.slot === 'skin') return false;
    if (def.classRestriction && !def.classRestriction.includes(characterClass)) return false;
    if (def.slot === 'weapon' && def.weaponTag) {
      return canEquipWeapon(characterClass, def.weaponTag);
    }
    return true;
  };

  const handleItemClick = (iid: string) => {
    setSelectedItem(iid === selectedItem ? null : iid);
  };

  const handleEquip = (iid: string) => {
    const inv = inventory.find(i => i.instanceId === iid);
    if (!inv) return;
    const def = ITEMS[inv.itemId];
    if (!def || !canEquip(def)) return;
    equipItem(iid);
    setSelectedItem(null);
  };

  const handleSlotClick = (slot: EquipSlotKey) => {
    if (selectedItem) {
      const inv = inventory.find(i => i.instanceId === selectedItem);
      if (inv) {
        const def = ITEMS[inv.itemId];
        if (def && def.slot !== 'resource' && def.slot === slot) {
          equipItem(selectedItem);
          setSelectedItem(null);
          return;
        }
      }
    }
    if (equipment[slot]) {
      unequipSlot(slot);
    }
  };

  const gridItems = Array.from({ length: GRID_COLS * GRID_ROWS }, (_, i) => inventory[i] ?? null);

  return (
    <div className={`${standalone ? 'relative flex flex-col h-full' : 'absolute inset-0 z-30 flex items-center justify-center bg-dark-800/90 backdrop-blur'} anim-fade-in`}>
      <div className="relative w-full max-w-lg mx-3 bg-dark-700 border border-white/10 rounded-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: '90vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <IconBackpack size={20} /> {t ? 'Инвентарь' : 'Inventory'}
          </h2>
          <button onClick={() => onClose ? onClose() : setInventoryOpen(false)} className="text-white/50 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-4 overflow-y-auto scrollbar-hide">
          {/* Stats */}
          <div className="flex gap-3">
            {[
              { label: t ? 'Защита' : 'Defense', val: computedStats.defense, color: 'text-blue-400' },
              { label: t ? 'Урон' : 'Damage', val: computedStats.damage.toFixed(1), color: 'text-red-400' },
              { label: t ? 'Сбор ×' : 'Gather ×', val: computedStats.gatherSpeed.toFixed(2), color: 'text-green-400' },
            ].map(s => (
              <div key={s.label} className="flex-1 bg-dark-800 rounded-xl p-2 text-center border border-white/5">
                <div className={`font-black text-lg ${s.color}`}>{s.val}</div>
                <div className="text-white/40 text-[10px]">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Equipment doll */}
          <div className="bg-dark-800 rounded-xl p-3 border border-white/5">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-2">
              {t ? 'Экипировка' : 'Equipment'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {EQUIP_SLOTS.map(slot => {
                const equippedIId = equipment[slot.key];
                const equippedInv = equippedIId ? inventory.find(i => i.instanceId === equippedIId) : null;
                const equippedDef = equippedInv ? ITEMS[equippedInv.itemId] : null;
                const isTarget = selectedItem
                  ? ITEMS[inventory.find(i => i.instanceId === selectedItem)?.itemId ?? '']?.slot === slot.key
                  : false;

                return (
                  <button
                    key={slot.key}
                    onClick={() => handleSlotClick(slot.key)}
                    className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                      isTarget
                        ? 'border-accent-400 bg-accent-900/30'
                        : equippedDef
                        ? 'border-primary-500/30 bg-dark-700'
                        : 'border-white/10 bg-dark-700/50'
                    }`}
                  >
                    <span>{equippedDef ? <ItemIcon iconName={equippedDef.iconName} size={24} /> : slot.icon}</span>
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-white/40 text-[10px]">{t ? slot.label : slot.labelEn}</span>
                      {equippedDef ? (
                        <span className="text-xs font-medium text-white/90 truncate"
                          style={{ color: RARITY_COLORS[equippedDef.rarity] }}>
                          {t ? equippedDef.name : equippedDef.nameEn}
                        </span>
                      ) : (
                        <span className="text-white/20 text-xs">{t ? 'Пусто' : 'Empty'}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Item selected info */}
          {selectedItem && (() => {
            const inv = inventory.find(i => i.instanceId === selectedItem);
            const def = inv ? ITEMS[inv.itemId] : null;
            if (!def) return null;
            return (
              <div className="bg-dark-800 rounded-xl p-3 border border-primary-500/30 anim-slide-up">
                <div className="flex items-center gap-3">
                  <ItemIcon iconName={def.iconName} size={36} />
                  <div className="flex-1">
                    <p className="font-bold text-white" style={{ color: RARITY_COLORS[def.rarity] }}>
                      {t ? def.name : def.nameEn}
                    </p>
                    <p className="text-white/40 text-xs capitalize">{def.rarity}</p>
                  </div>
                  {def.slot !== 'resource' && def.slot !== 'skin' && canEquip(def) && (
                    <button
                      onClick={() => handleEquip(selectedItem)}
                      className="bg-primary-500 text-dark-800 font-bold px-3 py-1.5 rounded-lg text-sm active:scale-95"
                    >
                      {t ? 'Надеть' : 'Equip'}
                    </button>
                  )}
                  {def.slot !== 'resource' && def.slot !== 'skin' && !canEquip(def) && (
                    <span className="text-red-400 text-xs font-semibold">
                      {t ? 'Класс не подходит' : 'Class restricted'}
                    </span>
                  )}
                </div>
                <div className="flex gap-3 mt-2">
                  {def.stats.defense && (
                    <span className="text-blue-400 text-xs">+{def.stats.defense} {t ? 'Защита' : 'DEF'}</span>
                  )}
                  {def.stats.damage && (
                    <span className="text-red-400 text-xs">+{def.stats.damage} {t ? 'Урон' : 'DMG'}</span>
                  )}
                  {def.stats.gatherSpeed && (
                    <span className="text-green-400 text-xs">+{(def.stats.gatherSpeed * 100).toFixed(0)}% {t ? 'Сбор' : 'Gather'}</span>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Inventory grid */}
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider mb-2">
              {t ? 'Предметы' : 'Items'}
            </p>
            <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)` }}>
              {gridItems.map((item, idx) => {
                if (!item) {
                  return (
                    <div key={idx}
                      className="aspect-square bg-dark-800 rounded-lg border border-white/5" />
                  );
                }
                const def = ITEMS[item.itemId];
                if (!def) return null;
                const isSelected = item.instanceId === selectedItem;
                const isEquipped = Object.values(equipment).includes(item.instanceId);
                return (
                  <button
                    key={item.instanceId}
                    onClick={() => handleItemClick(item.instanceId)}
                    className={`aspect-square rounded-lg border flex flex-col items-center justify-center relative transition-all active:scale-90 ${
                      isSelected
                        ? 'border-primary-400 bg-primary-900/30'
                        : isEquipped
                        ? 'border-accent-500/50 bg-accent-900/20'
                        : 'border-white/10 bg-dark-800 hover:border-white/20'
                    }`}
                    style={{ borderColor: isSelected ? RARITY_COLORS[def.rarity] : undefined }}
                  >
                    <ItemIcon iconName={def.iconName} size={24} />
                    {def.stackable && item.quantity > 1 && (
                      <span className="absolute bottom-0.5 right-1 text-[9px] text-white/70 font-bold">
                        {item.quantity}
                      </span>
                    )}
                    {isEquipped && (
                      <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-accent-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
