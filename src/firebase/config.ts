import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, child, type Database } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyABKHaAdlSFq1KzURXmCF5Q-9xMUgE4Ot0",
  authDomain: "berry-game-4fa9b.firebaseapp.com",
  databaseURL: "https://berry-game-4fa9b-default-rtdb.firebaseio.com",
  projectId: "berry-game-4fa9b",
  storageBucket: "berry-game-4fa9b.firebasestorage.app",
  messagingSenderId: "736707445306",
  appId: "1:736707445306:web:87a61ea4b725bd3071eb03",
  measurementId: "G-LLJ9L848G0"
};

const app = initializeApp(firebaseConfig);
export const db: Database = getDatabase(app);

/**
 * Sync player data to Firebase Realtime Database.
 * Uses Telegram User ID as primary key (falls back to "anon").
 */
export function getPlayerRef(userId?: string) {
  const uid = userId || 'anon';
  return ref(db, `players/${uid}`);
}

export async function savePlayerData(
  userId: string,
  data: {
    playerName: string;
    playerLevel: number;
    goldBalance: number;
    characterRace: string;
    characterClass: string;
    inventory: unknown[];
    equipment: unknown;
    playerXP: number;
  }
): Promise<void> {
  try {
    await set(ref(db, `players/${userId}`), {
      ...data,
      lastSeen: Date.now(),
    });
  } catch (e) {
    console.warn('Firebase save error:', e);
  }
}

export async function loadPlayerData(userId: string): Promise<Record<string, unknown> | null> {
  try {
    const snapshot = await get(child(ref(db), `players/${userId}`));
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (e) {
    console.warn('Firebase load error:', e);
    return null;
  }
}