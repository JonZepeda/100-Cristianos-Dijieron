// BIBLIOTECA DE EFECTOS DE SONIDO - Web Audio API (Autocontenida, alta fidelidad)

class SoundEffects {
  constructor() {
    this.ctx = null;
    this.masterVolume = 0.85;
    this.isMuted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(val) {
    this.masterVolume = Math.max(0, Math.min(1, parseFloat(val) || 0.85));
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  getVolume() {
    return this.isMuted ? 0 : this.masterVolume;
  }

  /* 🔔 CAMPANA ARMÓNICA DE ACIERTO (Ding Chime) */
  playCorrect() {
    this.init();
    const vol = this.getVolume();
    if (vol === 0) return;

    const now = this.ctx.currentTime;
    // Campana de show de TV con armónicos brillantes
    const harmonics = [
      { freq: 783.99, type: 'triangle', gain: 0.28, dur: 0.8 }, // G5
      { freq: 1046.50, type: 'sine', gain: 0.32, dur: 1.0 },     // C6
      { freq: 1318.51, type: 'sine', gain: 0.25, dur: 1.1 },     // E6
      { freq: 1567.98, type: 'sine', gain: 0.20, dur: 1.2 },     // G6
      { freq: 2093.00, type: 'sine', gain: 0.15, dur: 0.7 }      // C7 sparkle
    ];

    harmonics.forEach(h => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = h.type;
      osc.frequency.setValueAtTime(h.freq, now);

      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(h.gain * vol, now + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0008, now + h.dur);

      osc.connect(g);
      g.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + h.dur + 0.05);
    });
  }

  /* ❌ ZUMBADOR DE ERROR / STRIKE (Buzzer de Family Feud) */
  playWrong() {
    this.init();
    const vol = this.getVolume();
    if (vol === 0) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const osc3 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gainNode = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(125, now);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(129, now); // Ligera desafinación para aspereza cortante

    osc3.type = 'square';
    osc3.frequency.setValueAtTime(63, now); // Sub-grave para contundencia en proyector

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.65);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.45 * vol, now + 0.02);
    gainNode.gain.setValueAtTime(0.45 * vol, now + 0.45);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc1.connect(filter);
    osc2.connect(filter);
    osc3.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc3.start(now);

    osc1.stop(now + 0.72);
    osc2.stop(now + 0.72);
    osc3.stop(now + 0.72);
  }

  /* 🎺 FANFARRIA DE CELEBRACIÓN Y VICTORIA (Grand Win Brass) */
  playWin() {
    this.init();
    const vol = this.getVolume();
    if (vol === 0) return;

    const now = this.ctx.currentTime;
    // Acordes triunfales estilo metales de show
    const chords = [
      { time: 0.0, freqs: [261.63, 329.63, 392.00], dur: 0.16 }, // C4 - E4 - G4
      { time: 0.17, freqs: [261.63, 329.63, 392.00], dur: 0.16 }, // C4 - E4 - G4
      { time: 0.34, freqs: [349.23, 440.00, 523.25], dur: 0.22 }, // F4 - A4 - C5
      { time: 0.58, freqs: [392.00, 493.88, 587.33], dur: 0.26 }, // G4 - B4 - D5
      { time: 0.88, freqs: [523.25, 659.25, 783.99, 1046.50], dur: 0.95 } // C5 - E5 - G5 - C6 Gran final
    ];

    chords.forEach(chord => {
      chord.freqs.forEach(freq => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + chord.time);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2200, now + chord.time);

        g.gain.setValueAtTime(0, now + chord.time);
        g.gain.linearRampToValueAtTime((0.15 / chord.freqs.length) * vol, now + chord.time + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0008, now + chord.time + chord.dur);

        osc.connect(filter);
        filter.connect(g);
        g.connect(this.ctx.destination);

        osc.start(now + chord.time);
        osc.stop(now + chord.time + chord.dur + 0.05);
      });
    });
  }

  /* ⏱️ RELOJ DE CRONÓMETRO (Tick normal o Urgente) */
  playTick(urgent = false) {
    this.init();
    const vol = this.getVolume();
    if (vol === 0) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = urgent ? 'square' : 'sine';
    osc.frequency.setValueAtTime(urgent ? 1200 : 750, now);

    const dur = urgent ? 0.08 : 0.04;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime((urgent ? 0.22 : 0.12) * vol, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + dur + 0.01);
  }

  /* 💨 WHOOSH DE APERTURA DE CARTA */
  playWhoosh() {
    this.init();
    const vol = this.getVolume();
    if (vol === 0) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.22);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, now);
    filter.Q.setValueAtTime(1.5, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.18 * vol, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.26);
  }

  /* 🔢 SONIDO DE CONTEO / ROLLUP DE PUNTOS */
  playCountBlip() {
    this.init();
    const vol = this.getVolume();
    if (vol === 0) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(920, now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.06 * vol, now + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  playTone(freq, type, time, volume, duration) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(volume * this.getVolume(), time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }
}

window.sounds = new SoundEffects();
