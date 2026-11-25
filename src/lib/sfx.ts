// Synthesized UI sounds — a small drum kit (no audio files). They play only
// while the header sound toggle is on, so a muted site stays silent.
import { useUIStore } from "@/store/useUIStore";

let ctx: AudioContext | null = null;
let noise: AudioBuffer | null = null;
let lastTick = 0;

export function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  } catch {
    return null;
  }
}

function live(): AudioContext | null {
  if (!useUIStore.getState().isAudioPlaying) return null;
  return audioContext();
}

function noiseBuf(a: AudioContext) {
  if (noise) return noise;
  noise = a.createBuffer(1, a.sampleRate, a.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return noise;
}

function env(a: AudioContext, peak: number, dur: number) {
  const g = a.createGain(), t = a.currentTime;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  g.connect(a.destination);
  return g;
}

function hit(kind: "hat" | "openhat" | "snare" | "kick" | "tom" | "clap" | "crash" | "rim" | "cowbell") {
  const a = live();
  if (!a) return;
  const t = a.currentTime;
  const noiseVoice = (dur: number, gain: number, type: BiquadFilterType, freq: number) => {
    const s = a.createBufferSource(); s.buffer = noiseBuf(a);
    const f = a.createBiquadFilter(); f.type = type; f.frequency.value = freq;
    s.connect(f).connect(env(a, gain, dur)); s.start(t); s.stop(t + dur + 0.02);
  };
  const tone = (from: number, to: number, dur: number, gain: number, type: OscillatorType = "sine") => {
    const o = a.createOscillator(); o.type = type;
    o.frequency.setValueAtTime(from, t); o.frequency.exponentialRampToValueAtTime(to, t + dur);
    o.connect(env(a, gain, dur)); o.start(t); o.stop(t + dur + 0.02);
  };
  switch (kind) {
    case "hat": noiseVoice(0.04, 0.05, "highpass", 8000); break;
    case "openhat": noiseVoice(0.28, 0.05, "highpass", 7000); break;
    case "snare": noiseVoice(0.16, 0.12, "bandpass", 1800); tone(220, 160, 0.1, 0.08, "triangle"); break;
    case "kick": tone(140, 42, 0.32, 0.3); break;
    case "tom": tone(200, 90, 0.28, 0.2); break;
    case "clap": [0, 0.012, 0.024].forEach((d) => setTimeout(() => noiseVoice(0.09, 0.09, "bandpass", 1200), d * 1000)); break;
    case "crash": noiseVoice(1.1, 0.06, "highpass", 5000); break;
    case "rim": tone(1700, 1600, 0.03, 0.08, "square"); break;
    case "cowbell": tone(800, 790, 0.18, 0.05, "square"); tone(540, 535, 0.18, 0.04, "square"); break;
  }
}

export const sfx = {
  /** Hi-hat as a tile passes under the pointer. Rate-limited. */
  tick() {
    const now = performance.now();
    if (now - lastTick < 70) return;
    lastTick = now;
    hit("hat");
  },
  /** Snare: opening a project. */
  open() { hit("snare"); },
  /** Cymbal swell: menu and panels. */
  swish(opening = true) { hit(opening ? "openhat" : "hat"); },
  /** Kick: filter change. */
  snap() { hit("kick"); },
  /** Crash + kick: secret unlocked. */
  sparkle() { hit("crash"); hit("kick"); },
  /** A short engine rev for hard throws of the helix. */
  rev() {
    const a = live();
    if (!a) return;
    const t = a.currentTime;
    const o = a.createOscillator(); o.type = "sawtooth";
    o.frequency.setValueAtTime(70, t); o.frequency.exponentialRampToValueAtTime(190, t + 0.35); o.frequency.exponentialRampToValueAtTime(90, t + 0.7);
    const f = a.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 900;
    o.connect(f).connect(env(a, 0.05, 0.7)); o.start(t); o.stop(t + 0.75);
  },
  /** Drum pad: keys A–L. */
  pad(key: string) {
    const map: Record<string, Parameters<typeof hit>[0]> = {
      a: "kick", s: "snare", d: "hat", f: "openhat", g: "tom", h: "clap", j: "rim", k: "cowbell", l: "crash",
    };
    const k = map[key.toLowerCase()];
    if (k) hit(k);
    return !!k;
  },
};
