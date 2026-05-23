// High-fidelity Sound Synthesizer using Web Audio API
// Synthesizes elegant, lightweight UI micro-sounds without downloading audio files.

let soundEnabled = true;

// Retrieve initial state from local storage
try {
  const stored = localStorage.getItem('upyog_sound_enabled');
  if (stored !== null) {
    soundEnabled = stored === 'true';
  }
} catch (e) {
  // Ignore localStorage issues
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

export function toggleSound(): boolean {
  soundEnabled = !soundEnabled;
  try {
    localStorage.setItem('upyog_sound_enabled', String(soundEnabled));
  } catch (e) {
    // Ignore
  }
  return soundEnabled;
}

// Get or create Web Audio Context lazily to satisfy browser autoplay policies
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (!soundEnabled) return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a light organic micro-tick for standard hover or light tap feedback.
 */
export function playTick() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);

  gain.gain.setValueAtTime(0.015, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.05);
}

/**
 * Play a solid mechanical/digital button tap click.
 */
export function playClick() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);

  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.08);
}

/**
 * Play a gorgeous, premium, shimmering major chord sweep for success events.
 */
export function playSuccess() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const chords = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5 (C Major)
  const now = ctx.currentTime;

  chords.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const delay = index * 0.08;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + delay);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + delay + 0.35);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.04, now + delay + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + delay);
    osc.stop(now + delay + 0.4);
  });
}

/**
 * Play an elegant double-tone chime for switching dashboard sections.
 */
export function playChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [440, 554.37]; // A4, C#5 (Upward major intervals)
  
  notes.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const delay = index * 0.1;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + delay);
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.03, now + delay + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + delay);
    osc.stop(now + delay + 0.3);
  });
}

/**
 * Play a soft warning / low error sound to draw attention gracefully.
 */
export function playWarning() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const tones = [180, 150];

  tones.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const delay = index * 0.12;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + delay);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.06, now + delay + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + delay);
    osc.stop(now + delay + 0.25);
  });
}
