// Reads the background music's low end so the helix can move on the beat.
import { audioContext } from "@/lib/sfx";

let analyser: AnalyserNode | null = null;
let data: Uint8Array<ArrayBuffer> | null = null;
let connected: HTMLMediaElement | null = null;
let level = 0;

/** Route the music through an analyser. Call after playback has started from a gesture. */
export function attachBeat(el: HTMLMediaElement) {
  if (connected === el) return;
  const a = audioContext();
  if (!a) return;
  // Only reroute once audio is confirmed running; otherwise (e.g. iOS not yet
  // unlocked) leave the music alone so it never goes silent.
  a.resume().then(() => {
    if (a.state === "running") connect(a, el);
  }).catch(() => {});
}

function connect(a: AudioContext, el: HTMLMediaElement) {
  if (connected === el) return;
  try {
    const src = a.createMediaElementSource(el);
    analyser = a.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.6;
    src.connect(analyser);
    analyser.connect(a.destination);
    data = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
    connected = el;
  } catch {
    /* already attached or unsupported: the site simply doesn't pulse */
  }
}

/** 0..1 kick energy, eased; 0 when muted or unsupported. */
export function beatLevel(playing: boolean) {
  if (!analyser || !data || !playing) return (level *= 0.9);
  analyser.getByteFrequencyData(data);
  let bass = 0;
  for (let i = 1; i < 6; i++) bass += data[i]!;
  const v = Math.max(0, bass / (5 * 255) - 0.55) / 0.45; // only peaks above the floor count
  level = v > level ? v : level * 0.86;
  return level;
}
