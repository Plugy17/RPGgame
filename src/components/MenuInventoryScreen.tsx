import React from 'react';
import { useGameStore } from '../store/gameStore';
import { InventoryPanel } from './InventoryPanel';

export const MenuInventoryScreen: React.FC = () => {
  const { setScreen } = useGameStore();
  return (
    <InventoryPanel onClose={() => setScreen('menu')} standalone />
  );
};
