/**
 * Procedural Web Audio API Sound Generator for Baseball Umpire Simulator
 * 100% synthesized - zero external audio files / zero 404 dependencies!
 */

class SoundSystem {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.85;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  public isSoundMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Powerful leather catcher mitt catch snap!
   * Heavy low thud + sharp high leather slap crack
   */
  public playGloveCatch(speedKmh: number = 145) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const intensity = Math.min(1.4, Math.max(0.7, speedKmh / 140));

    // 1. Low Thud (body resonance inside mitt)
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120 * intensity, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.12);

    oscGain.gain.setValueAtTime(0.75 * this.volume * intensity, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);

    // 2. High leather slap / pop (burst of filtered noise)
    const bufferSize = ctx.sampleRate * 0.08;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.18));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400 * intensity, t);
    filter.Q.setValueAtTime(3.0, t);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.9 * this.volume * intensity, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(t);
    noise.stop(t + 0.09);
  }

  /**
   * Synthesized umpire call voice: "STRIKE!", "BALL!", "HE'S OUT!"
   */
  public playUmpireCall(call: 'STRIKE' | 'BALL' | 'OUT') {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;

    if (call === 'STRIKE') {
      // Powerful, explosive umpire shout: "STEEEEE-RIKE!"
      // Two-tone rising punch with formant harmonics
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(180, t);
      osc1.frequency.linearRampToValueAtTime(320, t + 0.12);
      osc1.frequency.linearRampToValueAtTime(260, t + 0.35);

      osc2.frequency.setValueAtTime(360, t);
      osc2.frequency.linearRampToValueAtTime(640, t + 0.12);
      osc2.frequency.linearRampToValueAtTime(520, t + 0.35);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, t);
      filter.frequency.linearRampToValueAtTime(1500, t + 0.1);
      filter.frequency.linearRampToValueAtTime(1100, t + 0.35);
      filter.Q.setValueAtTime(4.0, t);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.6 * this.volume, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.42);
      osc2.stop(t + 0.42);
    } else if (call === 'BALL') {
      // Lower, calm short authoritative voice: "BALL."
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';

      osc.frequency.setValueAtTime(160, t);
      osc.frequency.exponentialRampToValueAtTime(110, t + 0.22);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, t);

      gain.gain.setValueAtTime(0.45 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.26);
    } else if (call === 'OUT') {
      // Huge emphatic punch-out: "YOU'RE OUT!" + dramatic strike 3 chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'square';

      osc1.frequency.setValueAtTime(240, t);
      osc1.frequency.exponentialRampToValueAtTime(420, t + 0.15);
      osc1.frequency.exponentialRampToValueAtTime(180, t + 0.55);

      osc2.frequency.setValueAtTime(120, t);
      osc2.frequency.exponentialRampToValueAtTime(210, t + 0.15);
      osc2.frequency.exponentialRampToValueAtTime(90, t + 0.55);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, t);
      filter.Q.setValueAtTime(3.0, t);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.7 * this.volume, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.62);
      osc2.stop(t + 0.62);

      // Also trigger crowd cheer
      this.playCrowdReaction('punchout');
    }
  }

  /**
   * Dynamic crowd reactions: cheering, gasping at close calls, booing at missed calls
   */
  public playCrowdReaction(type: 'cheer' | 'gasp' | 'boo' | 'punchout') {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const duration = type === 'punchout' ? 1.8 : type === 'gasp' ? 0.7 : 1.2;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = type === 'boo' ? 'lowpass' : 'bandpass';

    const gain = ctx.createGain();

    if (type === 'punchout' || type === 'cheer') {
      filter.frequency.setValueAtTime(450, t);
      filter.frequency.linearRampToValueAtTime(850, t + 0.4);
      filter.frequency.exponentialRampToValueAtTime(350, t + duration);
      filter.Q.setValueAtTime(2.0, t);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.4 * this.volume, t + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    } else if (type === 'gasp') {
      filter.frequency.setValueAtTime(700, t);
      filter.frequency.exponentialRampToValueAtTime(1100, t + 0.2);
      filter.Q.setValueAtTime(2.5, t);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.3 * this.volume, t + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    } else if (type === 'boo') {
      filter.frequency.setValueAtTime(220, t);
      filter.frequency.linearRampToValueAtTime(180, t + 0.8);
      filter.Q.setValueAtTime(1.5, t);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.35 * this.volume, t + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    }

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(t);
    noise.stop(t + duration);
  }

  /**
   * Whoosh of pitch cutting through the air
   */
  public playPitchWhoosh() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(90, t);
    osc.frequency.exponentialRampToValueAtTime(260, t + 0.25);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(300, t);
    filter.frequency.linearRampToValueAtTime(900, t + 0.25);
    filter.Q.setValueAtTime(3.0, t);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.18 * this.volume, t + 0.18);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.38);
  }

  /**
   * Feedback chime for correct decision
   */
  public playCorrectChime() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const startTime = t + i * 0.05;
      gain.gain.setValueAtTime(0.12 * this.volume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.28);
    });
  }

  /**
   * Feedback buzzer for incorrect decision (miscall / 誤審)
   */
  public playMissBuzzer() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.setValueAtTime(130, t + 0.15);

    gain.gain.setValueAtTime(0.2 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.38);

    this.playCrowdReaction('boo');
  }

  /**
   * Traditional stadium organ riff celebration
   */
  public playOrganRiff() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    // Classic baseball "Da-da-da-da-DA-DAH! Charge!" notes
    const notes = [
      { f: 261.63, d: 0.15, wait: 0 },
      { f: 329.63, d: 0.15, wait: 0.15 },
      { f: 392.00, d: 0.15, wait: 0.30 },
      { f: 523.25, d: 0.25, wait: 0.45 },
      { f: 392.00, d: 0.15, wait: 0.72 },
      { f: 523.25, d: 0.45, wait: 0.90 }
    ];

    notes.forEach(n => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = n.f;

      const st = t + n.wait;
      gain.gain.setValueAtTime(0.18 * this.volume, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + n.d);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(st);
      osc.stop(st + n.d + 0.05);
    });
  }
}

export const sounds = new SoundSystem();
