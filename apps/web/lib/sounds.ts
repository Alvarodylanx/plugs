export type SoundType = 'chime' | 'bell' | 'ping' | 'adventure' | 'zen';

export const SOUND_OPTIONS: Array<{ type: SoundType; label: string; emoji: string }> = [
  { type: 'chime', label: 'Chime', emoji: '🔔' },
  { type: 'bell', label: 'Bell', emoji: '🛎️' },
  { type: 'ping', label: 'Ping', emoji: '✨' },
  { type: 'adventure', label: 'Adventure', emoji: '🎺' },
  { type: 'zen', label: 'Zen', emoji: '🪘' },
];

export function playSound(type: SoundType, volume = 0.6): void {
  if (typeof window === 'undefined') return;
  try {
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx: AudioContext = new Ctx();
    const now = ctx.currentTime;

    const tone = (freq: number, start: number, dur: number, vol: number, wave: OscillatorType = 'sine') => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = wave;
      osc.frequency.setValueAtTime(freq, now + start);
      g.gain.setValueAtTime(0, now + start);
      g.gain.linearRampToValueAtTime(vol * volume, now + start + 0.025);
      g.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + dur + 0.05);
    };

    if (type === 'chime') {
      tone(880, 0, 0.6, 0.35);
      tone(1108, 0.15, 0.5, 0.28);
      tone(1318, 0.3, 0.7, 0.32);
    } else if (type === 'bell') {
      tone(587, 0, 1.0, 0.45, 'triangle');
      tone(880, 0.05, 0.7, 0.18);
      tone(1174, 0.08, 0.4, 0.08);
    } else if (type === 'ping') {
      tone(1318, 0, 0.04, 0.55);
      tone(1047, 0.04, 0.35, 0.38);
    } else if (type === 'adventure') {
      tone(523, 0, 0.18, 0.3, 'triangle');
      tone(659, 0.18, 0.18, 0.3, 'triangle');
      tone(784, 0.36, 0.18, 0.3, 'triangle');
      tone(1047, 0.54, 0.55, 0.4, 'triangle');
    } else if (type === 'zen') {
      tone(350, 0, 2.5, 0.42);
      tone(525, 0.08, 1.8, 0.18);
      tone(700, 0.15, 1.2, 0.09);
    }

    setTimeout(() => ctx.close().catch(() => {}), 5000);
  } catch {
    // Audio not available in this environment
  }
}
