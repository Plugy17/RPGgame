type SfxName = 'sword_swing' | 'arrow_shot' | 'magic_cast' | 'coin' | 'gather' | 'levelup' | 'quest_complete' | 'duel_hit' | 'portal';

const AUDIO_CONTEXT = typeof AudioContext !== 'undefined' ? new AudioContext() : null;

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
  if (!AUDIO_CONTEXT) return;
  if (AUDIO_CONTEXT.state === 'suspended') AUDIO_CONTEXT.resume();
  const osc = AUDIO_CONTEXT.createOscillator();
  const gain = AUDIO_CONTEXT.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = volume;
  gain.gain.exponentialRampToValueAtTime(0.001, AUDIO_CONTEXT.currentTime + duration);
  osc.connect(gain);
  gain.connect(AUDIO_CONTEXT.destination);
  osc.start();
  osc.stop(AUDIO_CONTEXT.currentTime + duration);
}

function playNoise(duration: number, volume = 0.05) {
  if (!AUDIO_CONTEXT) return;
  if (AUDIO_CONTEXT.state === 'suspended') AUDIO_CONTEXT.resume();
  const bufferSize = AUDIO_CONTEXT.sampleRate * duration;
  const buffer = AUDIO_CONTEXT.createBuffer(1, bufferSize, AUDIO_CONTEXT.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * volume;
  const source = AUDIO_CONTEXT.createBufferSource();
  const gain = AUDIO_CONTEXT.createGain();
  source.buffer = buffer;
  gain.gain.value = 1;
  gain.gain.exponentialRampToValueAtTime(0.001, AUDIO_CONTEXT.currentTime + duration);
  source.connect(gain);
  gain.connect(AUDIO_CONTEXT.destination);
  source.start();
}

const SFX_MAP: Record<SfxName, () => void> = {
  sword_swing: () => {
    playNoise(0.08, 0.06);
    playTone(800, 0.1, 'sawtooth', 0.08);
    setTimeout(() => playTone(400, 0.15, 'sawtooth', 0.05), 50);
  },
  arrow_shot: () => {
    playNoise(0.05, 0.04);
    playTone(1200, 0.08, 'sine', 0.1);
    playTone(600, 0.12, 'sine', 0.06);
  },
  magic_cast: () => {
    playTone(440, 0.3, 'sine', 0.1);
    playTone(660, 0.25, 'sine', 0.08);
    playTone(880, 0.2, 'triangle', 0.06);
  },
  coin: () => {
    playTone(1800, 0.1, 'sine', 0.1);
    setTimeout(() => playTone(2400, 0.15, 'sine', 0.08), 80);
  },
  gather: () => {
    playTone(300, 0.15, 'triangle', 0.08);
    playNoise(0.1, 0.03);
    setTimeout(() => playTone(450, 0.1, 'triangle', 0.06), 100);
  },
  levelup: () => {
    playTone(523, 0.15, 'sine', 0.12);
    setTimeout(() => playTone(659, 0.15, 'sine', 0.1), 120);
    setTimeout(() => playTone(784, 0.2, 'sine', 0.12), 240);
    setTimeout(() => playTone(1047, 0.3, 'sine', 0.1), 380);
  },
  quest_complete: () => {
    playTone(440, 0.12, 'sine', 0.1);
    setTimeout(() => playTone(554, 0.12, 'sine', 0.08), 100);
    setTimeout(() => playTone(659, 0.2, 'sine', 0.1), 200);
  },
  duel_hit: () => {
    playNoise(0.06, 0.07);
    playTone(200, 0.12, 'sawtooth', 0.1);
  },
  portal: () => {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => playTone(300 + i * 150, 0.2, 'sine', 0.05), i * 60);
    }
  },
};

export const playSfx = (name: SfxName) => {
  try { SFX_MAP[name](); } catch { /* audio context may fail on mobile */ }
};
