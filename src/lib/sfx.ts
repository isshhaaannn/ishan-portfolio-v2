// Tiny synthesized UI sounds (no audio files). They play only while the
// header sound toggle is on, so the site stays silent by default.
import { useUIStore } from "@/store/useUIStore";

let ctx: AudioContext | null = null;
let lastTick = 0;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!useUIStore.getState().isAudioPlaying) return null;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return null;
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  } catch {
    return null;
  }
}

function blip(freq: number, dur: number, gain: number, type: OscillatorType = "sine", slideTo?: number) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(a.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export const sfx = {
  /** Soft tick as a tile passes under the pointer. Rate-limited. */
  tick() {
    const now = performance.now();
    if (now - lastTick < 70) return;
    lastTick = now;
    blip(1850, 0.035, 0.04, "triangle");
  },
  /** Opening a project. */
  open() {
    blip(420, 0.16, 0.09, "sine", 760);
  },
  /** Menu / panel open and close. */
  swish(opening = true) {
    blip(opening ? 300 : 520, 0.2, 0.05, "sine", opening ? 620 : 260);
  },
  /** Filter change. */
  snap() {
    blip(980, 0.06, 0.06, "square");
    setTimeout(() => blip(1320, 0.05, 0.04, "triangle"), 45);
  },
  /** Secret unlocked. */
  sparkle() {
    [880, 1175, 1568, 2093].forEach((f, i) => setTimeout(() => blip(f, 0.18, 0.05, "triangle"), i * 70));
  },
};
