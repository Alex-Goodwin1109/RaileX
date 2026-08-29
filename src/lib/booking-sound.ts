import confirmSound from "@/assets/dreamcast_confirm.mp3.asset.json";
import { loadSound, saveSound } from "@/lib/settings";

const TRACK_URL = confirmSound.url;

export function loadMuted(): boolean {
  return !loadSound();
}

export function saveMuted(muted: boolean) {
  saveSound(!muted);
}

/**
 * Booking-confirmed chime (dreamcast_confirm.mp3). Plays once, never loops,
 * never autoplays outside an explicit confirmation event. Falls back to a
 * synthesised cue if the file cannot be played.
 */
export function playDepartureAmbience(): () => void {
  let stopped = false;
  let stopFallback: (() => void) | null = null;

  const audio = new Audio(TRACK_URL);
  audio.preload = "auto";
  audio.loop = false;
  audio.volume = 0.85;

  const fallback = () => {
    if (stopped || stopFallback) return;
    stopFallback = synthesiseDeparture();
  };

  audio.addEventListener("error", fallback);
  audio.play().catch(fallback);


  return () => {
    stopped = true;
    audio.pause();
    stopFallback?.();
  };
}

function synthesiseDeparture(): () => void {
  try {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctor();
    const now = ctx.currentTime;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.linearRampToValueAtTime(1, now + 1.5);
    master.gain.setValueAtTime(1, now + 4.5);
    master.gain.linearRampToValueAtTime(0.0001, now + 6);
    master.connect(ctx.destination);

    const rumble = ctx.createOscillator();
    rumble.type = "sawtooth";
    rumble.frequency.value = 40;
    const rumbleGain = ctx.createGain();
    rumbleGain.gain.value = 0.03;
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 220;
    rumble.connect(rumbleGain).connect(lowpass).connect(master);
    rumble.start(now);
    rumble.stop(now + 6);

    // Wheel-on-track clicks every 0.8s from a short noise buffer.
    const len = Math.floor(ctx.sampleRate * 0.06);
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const chan = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) chan[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;

    const sources: AudioBufferSourceNode[] = [];
    for (let t = 0.2; t < 6; t += 0.8) {
      for (const offset of [0, 0.12]) {
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        const g = ctx.createGain();
        g.gain.value = offset ? 0.05 : 0.08;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = 900;
        src.connect(g).connect(bp).connect(master);
        src.start(now + t + offset);
        sources.push(src);
      }
    }

    return () => {
      try {
        rumble.stop();
        sources.forEach((s) => s.stop());
      } catch {
        /* already stopped */
      }
      void ctx.close();
    };
  } catch {
    return () => {};
  }
}
