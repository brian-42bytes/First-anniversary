// Web Audio API romantic acoustic piano / guitar engine and ambient sound effects
// Background music now uses a real MP3 instead of synthesized chords

class RomanticAudioManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private isPlaying: boolean = false;
  private masterGain: GainNode | null = null;

  // ===== NEW: real song =====
  private bgAudio: HTMLAudioElement | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.4, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;

    // Control the MP3 volume
    if (this.bgAudio) {
      this.bgAudio.volume = this.isMuted ? 0 : 0.4;
    }

    // Also control the old Web Audio master gain (used by SFX)
    const ctx = this.getContext();
    if (this.masterGain) {
      const targetGain = this.isMuted ? 0 : 0.35;
      this.masterGain.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.2);
    }

    if (!this.isMuted && !this.isPlaying) {
      this.startMusic();
    }
    return this.isMuted;
  }

  public unmute(): void {
    if (this.isMuted) {
      this.toggleMute();
    }
  }

  // ===== BACKGROUND MUSIC (now MP3) =====
  public startMusic(): void {
    if (this.isPlaying) return;
    this.isPlaying = true;

    if (!this.bgAudio) {
      // ↓↓↓ CHANGE THIS PATH to match where you put your MP3 ↓↓↓
      this.bgAudio = new Audio('/assets/avant-toi-song.mp3');
      this.bgAudio.loop = true;
      this.bgAudio.volume = this.isMuted ? 0 : 0.4;
    }

    // Browsers require a user gesture before playing audio
    this.bgAudio.play().catch(() => {
      // silently fail if autoplay is blocked
    });
  }

  public stopMusic(): void {
    this.isPlaying = false;
    if (this.bgAudio) {
      this.bgAudio.pause();
      this.bgAudio.currentTime = 0;
    }
  }

  // ===== ALL SOUND EFFECTS BELOW ARE UNCHANGED =====

  // 1. Easter egg sparkle chime (3 heart clicks)
  public playEasterEggChime(): void {
    try {
      const ctx = this.getContext();
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C5, E5, G5, C6, E6, G6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.08 + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 1.2);
      });
    } catch {
      // AudioContext fallback
    }
  }

  // 2. Playful "No" dodge whoosh / cute squeak
  public playDodgeSqueak(): void {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      const now = ctx.currentTime;
      // Quick cute slide up then down
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(750, now + 0.09);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.18);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // Audio fallback
    }
  }

  // 3. "Yes" romantic chime
  public playYesCelebration(): void {
    try {
      const ctx = this.getContext();
      const freqs = [392.00, 523.25, 659.25, 783.99, 1046.50]; // G4, C5, E5, G5, C6
      const now = ctx.currentTime;
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + i * 0.06);

        gain.gain.setValueAtTime(0.001, now + i * 0.06);
        gain.gain.linearRampToValueAtTime(0.25, now + i * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 1.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 1.8);
      });
    } catch {
      // Audio fallback
    }
  }

  // 4. Soft tap / chime for quiz selection
  public playQuizOptionSound(): void {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.08);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch {
      // Fallback
    }
  }

  // Playful success chime when answer is correct
  public playQuizCorrectSound(): void {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.07);

        gain.gain.setValueAtTime(0.001, now + i * 0.07);
        gain.gain.linearRampToValueAtTime(0.18, now + i * 0.07 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.07 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.65);
      });
    } catch {
      // Fallback
    }
  }

  // Playful gentle wobble when answer is wrong
  public playQuizWrongSound(): void {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.28);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.16, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Fallback
    }
  }

  // 5. Confetti and heart burst sound
  public playConfettiPop(): void {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.05);

        gain.gain.setValueAtTime(0.001, now + i * 0.05);
        gain.gain.linearRampToValueAtTime(0.18, now + i * 0.05 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.05 + 1.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 1.5);
      });
    } catch {
      // Fallback
    }
  }

  // 6. Subtle tactile UI button click / tap
  public playButtonClick(): void {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Soft warm wooden tap / pop sound
      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(820, now + 0.025);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.06);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // Fallback
    }
  }

  // 7. Tactile screen transition sweep / whoosh
  public playTransitionWhoosh(): void {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Soft filtered noise/sine sweep with sparkle harmonics
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(680, now + 0.18);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.35);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(2400, now + 0.15);
      filter.frequency.exponentialRampToValueAtTime(400, now + 0.35);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.14, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);

      // Light companion sparkle chime
      const chime = ctx.createOscillator();
      const chimeGain = ctx.createGain();
      chime.type = 'sine';
      chime.frequency.setValueAtTime(1174.66, now + 0.06); // D6
      chime.frequency.exponentialRampToValueAtTime(1567.98, now + 0.22); // G6

      chimeGain.gain.setValueAtTime(0.0001, now + 0.06);
      chimeGain.gain.linearRampToValueAtTime(0.08, now + 0.09);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

      chime.connect(chimeGain);
      chimeGain.connect(ctx.destination);

      chime.start(now + 0.06);
      chime.stop(now + 0.4);
    } catch {
      // Fallback
    }
  }

  // 8. Intense cascading confetti rain sound
  public playIntenseConfettiRainSound(): void {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      // Multi-tier sparkling bells mimicking raindrops of joy
      const rainNotes = [
        { f: 587.33, delay: 0.0 },
        { f: 880.00, delay: 0.06 },
        { f: 1174.66, delay: 0.12 },
        { f: 1318.51, delay: 0.18 },
        { f: 1760.00, delay: 0.24 },
        { f: 1567.98, delay: 0.32 },
        { f: 2093.00, delay: 0.40 },
        { f: 1760.00, delay: 0.48 },
        { f: 1318.51, delay: 0.58 },
      ];

      rainNotes.forEach((n) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.f, now + n.delay);

        gain.gain.setValueAtTime(0.0001, now + n.delay);
        gain.gain.linearRampToValueAtTime(0.12, now + n.delay + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + n.delay + 0.85);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + n.delay);
        osc.stop(now + n.delay + 0.9);
      });
    } catch {
      // Fallback
    }
  }
}

export const romanticAudio = new RomanticAudioManager();oid {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.28);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.16, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Fallback
    }
  }

  // 5. Confetti and heart burst sound
  public playConfettiPop(): void {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.05);

        gain.gain.setValueAtTime(0.001, now + i * 0.05);
        gain.gain.linearRampToValueAtTime(0.18, now + i * 0.05 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.05 + 1.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 1.5);
      });
    } catch {
      // Fallback
    }
  }

  // 6. Subtle tactile UI button click / tap
  public playButtonClick(): void {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Soft warm wooden tap / pop sound
      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(820, now + 0.025);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.06);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // Fallback
    }
  }

  // 7. Tactile screen transition sweep / whoosh
  public playTransitionWhoosh(): void {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Soft filtered noise/sine sweep with sparkle harmonics
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(680, now + 0.18);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.35);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(2400, now + 0.15);
      filter.frequency.exponentialRampToValueAtTime(400, now + 0.35);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.14, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);

      // Light companion sparkle chime
      const chime = ctx.createOscillator();
      const chimeGain = ctx.createGain();
      chime.type = 'sine';
      chime.frequency.setValueAtTime(1174.66, now + 0.06); // D6
      chime.frequency.exponentialRampToValueAtTime(1567.98, now + 0.22); // G6

      chimeGain.gain.setValueAtTime(0.0001, now + 0.06);
      chimeGain.gain.linearRampToValueAtTime(0.08, now + 0.09);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

      chime.connect(chimeGain);
      chimeGain.connect(ctx.destination);

      chime.start(now + 0.06);
      chime.stop(now + 0.4);
    } catch {
      // Fallback
    }
  }

  // 8. Intense cascading confetti rain sound
  public playIntenseConfettiRainSound(): void {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      // Multi-tier sparkling bells mimicking raindrops of joy
      const rainNotes = [
        { f: 587.33, delay: 0.0 },
        { f: 880.00, delay: 0.06 },
        { f: 1174.66, delay: 0.12 },
        { f: 1318.51, delay: 0.18 },
        { f: 1760.00, delay: 0.24 },
        { f: 1567.98, delay: 0.32 },
        { f: 2093.00, delay: 0.40 },
        { f: 1760.00, delay: 0.48 },
        { f: 1318.51, delay: 0.58 },
      ];

      rainNotes.forEach((n) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.f, now + n.delay);

        gain.gain.setValueAtTime(0.0001, now + n.delay);
        gain.gain.linearRampToValueAtTime(0.12, now + n.delay + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + n.delay + 0.85);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + n.delay);
        osc.stop(now + n.delay + 0.9);
      });
    } catch {
      // Fallback
    }
  }
}

export const romanticAudio = new RomanticAudioManager();
