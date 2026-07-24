import { isMuted } from "./Settings";

type Beep = {
  freq: number;
  dur: number;
  type?: OscillatorType;
  gain?: number;
  slide?: number;
};

/** SFX sintetizados (Web Audio) — sin assets externos. */
class AudioBus {
  private ctx: AudioContext | null = null;

  private ensure(): AudioContext | null {
    if (isMuted()) return null;
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctx();
    }
    if (this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  /** Llamar tras primer input del usuario. */
  unlock() {
    this.ensure();
  }

  private tone(opts: Beep) {
    const ctx = this.ensure();
    if (!ctx) return;
    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = opts.type ?? "square";
    osc.frequency.setValueAtTime(opts.freq, t0);
    if (opts.slide) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(40, opts.freq + opts.slide),
        t0 + opts.dur,
      );
    }
    const g = opts.gain ?? 0.045;
    gain.gain.setValueAtTime(g, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + opts.dur + 0.02);
  }

  shoot() {
    this.tone({ freq: 660, dur: 0.05, type: "square", gain: 0.03, slide: -220 });
  }

  hit() {
    this.tone({ freq: 180, dur: 0.08, type: "triangle", gain: 0.05, slide: -80 });
  }

  powerup() {
    this.tone({ freq: 440, dur: 0.07, type: "sine", gain: 0.05 });
    window.setTimeout(() => this.tone({ freq: 660, dur: 0.08, type: "sine", gain: 0.045 }), 60);
    window.setTimeout(() => this.tone({ freq: 880, dur: 0.1, type: "sine", gain: 0.04 }), 120);
  }

  hurt() {
    this.tone({ freq: 140, dur: 0.18, type: "sawtooth", gain: 0.05, slide: -90 });
  }

  gameOver() {
    this.tone({ freq: 220, dur: 0.2, type: "sawtooth", gain: 0.05, slide: -100 });
    window.setTimeout(() => this.tone({ freq: 140, dur: 0.35, type: "triangle", gain: 0.045, slide: -60 }), 160);
  }

  achievement() {
    this.tone({ freq: 523, dur: 0.08, type: "sine", gain: 0.045 });
    window.setTimeout(() => this.tone({ freq: 659, dur: 0.08, type: "sine", gain: 0.045 }), 90);
    window.setTimeout(() => this.tone({ freq: 784, dur: 0.14, type: "sine", gain: 0.05 }), 180);
  }

  ui() {
    this.tone({ freq: 520, dur: 0.04, type: "sine", gain: 0.03 });
  }
}

export const audio = new AudioBus();
