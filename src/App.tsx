import React, { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { MainMenu } from './components/MainMenu';
import { GameScreen } from './components/GameScreen';
import { HubScreen } from './components/HubScreen';
import { MenuInventoryScreen } from './components/MenuInventoryScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { StatsScreen } from './components/StatsScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { RotateOverlay } from './components/RotateOverlay';
import { AirdropScreen } from './components/AirdropScreen';
import { FriendsScreen } from './components/FriendsScreen';
import { AllianceScreen } from './components/AllianceScreen';
import { RaidScreen } from './components/RaidScreen';
import { CharacterCreationScreen } from './components/CharacterCreationScreen';
import { AttributesScreen } from './components/AttributesScreen';

function useOrientation() {
  const [landscape, setLandscape] = React.useState(() => window.innerWidth > window.innerHeight);
  useEffect(() => {
    const handler = () => setLandscape(window.innerWidth > window.innerHeight);
    window.addEventListener('resize', handler);
    window.addEventListener('orientationchange', handler);
    return () => { window.removeEventListener('resize', handler); window.removeEventListener('orientationchange', handler); };
  }, []);
  return landscape;
}

export default function App() {
  const { screen, initFromTelegram, incrementPlaytime } = useGameStore();
  const isLandscape = useOrientation();

  useEffect(() => { initFromTelegram(); }, []);

  useEffect(() => {
    if (screen !== 'game' && screen !== 'hub') return;
    const id = setInterval(() => incrementPlaytime(5), 5000);
    return () => clearInterval(id);
  }, [screen]);

  const needsLandscape = screen === 'game' || screen === 'hub';
  const showRotateOverlay = needsLandscape && !isLandscape;

  return (
    <div className="w-full h-full" style={{ background: '#0d0d1a' }}>
      {showRotateOverlay && <RotateOverlay />}
      <div className={`w-full h-full transition-opacity duration-300 ${showRotateOverlay ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {screen === 'menu'       && <MainMenu />}
        {screen === 'game'       && <GameScreen />}
        {screen === 'hub'        && <HubScreen />}
        {screen === 'inventory'  && <MenuInventoryScreen />}
        {screen === 'profile'    && <ProfileScreen />}
        {screen === 'stats'      && <StatsScreen />}
        {screen === 'settings'   && <SettingsScreen />}
        {screen === 'airdrop'    && <AirdropScreen />}
        {screen === 'friends'    && <FriendsScreen />}
        {screen === 'alliance'   && <AllianceScreen />}
        {screen === 'raid'       && <RaidScreen />}
        {screen === 'charcreate' && <CharacterCreationScreen />}
        {screen === 'attributes' && <AttributesScreen />}
      </div>
    </div>
  );
}
