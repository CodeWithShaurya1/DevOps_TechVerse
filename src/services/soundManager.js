/**
 * Web Audio procedural sound synthesizer for Techverse '26 Portal UI.
 * Zero external audio assets required.
 */
class PortalSoundManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.15) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const safeDuration = Math.max(0.01, Number(duration) || 0.1);
      const safeGain = Math.max(0.0002, Number(gainVal) || 0.15);
      const safeFreq = Math.max(20, Math.min(20000, Number(freq) || 440));
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(safeFreq, this.ctx.currentTime);
      gain.gain.setValueAtTime(safeGain, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + safeDuration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + safeDuration);
    } catch (_) {}
  }

  playClick() {
    this.playTone(880, 'triangle', 0.05, 0.1);
  }

  playCountdownTick() {
    this.playTone(440, 'triangle', 0.09, 0.15);
  }

  playCountdownGo() {
    this.playTone(880, 'triangle', 0.25, 0.25);
  }

  playSuccess() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.14, 0.2), idx * 75);
    });
  }

  playError() {
    this.playTone(150, 'sawtooth', 0.22, 0.25);
  }

  playIntroBoot() {
    this.playTone(220, 'sine', 0.4, 0.15);
    setTimeout(() => this.playTone(440, 'sine', 0.3, 0.18), 120);
    setTimeout(() => this.playTone(880, 'triangle', 0.35, 0.22), 240);
  }
}

export const portalSound = new PortalSoundManager();
