// BIBLIOTECA DE EFECTOS DE SONIDO - Web Audio API (Edición Broadcast TV Show)

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

  /* 🔔 CAMPANA ARMÓNICA DE ACIERTO (Ding Chime TV) */
  playCorrect() {
    this.init();
    const vol = this.getVolume();
    if (vol === 0) return;

    const now = this.ctx.currentTime;
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

  /* ⚙️ SONIDO MECÁNICO DE PERSIANA SPLIT-FLAP (Clack-Flap) */
  playMechanicalFlap() {
    this.init();
    const vol = this.getVolume();
    if (vol === 0) return;

    const now = this.ctx.currentTime;
    // Ráfaga de clacks mecánicos como persiana de aeropuerto / panel de concurso
    for (let i = 0; i < 4; i++) {
      const flapTime = now + (i * 0.04);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320 - (i * 30), flapTime);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(900 + (i * 120), flapTime);
      filter.Q.setValueAtTime(2.5, flapTime);

      gain.gain.setValueAtTime(0.22 * vol, flapTime);
      gain.gain.exponentialRampToValueAtTime(0.001, flapTime + 0.035);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(flapTime);
      osc.stop(flapTime + 0.04);
    }
  }

  /* ⚡ PULSADOR DE DUELO / FACE-OFF (Buzzer de Capitanes) */
  playFaceOffBuzzer() {
    this.init();
    const vol = this.getVolume();
    if (vol === 0) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(440, now);
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(445, now); // Desafinación para zumbido de campana eléctrica

    gain.gain.setValueAtTime(0.35 * vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.36);
    osc2.stop(now + 0.36);
  }

  /* ❌ ZUMBADOR DE ERROR / STRIKE (Heavy TV Buzzer) */
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
    osc2.frequency.setValueAtTime(129, now); // Aspereza cortante

    osc3.type = 'square';
    osc3.frequency.setValueAtTime(63, now); // Graves para golpe en auditorio

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.65);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.48 * vol, now + 0.02);
    gainNode.gain.setValueAtTime(0.48 * vol, now + 0.45);
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

  /* ⚠️ RESPUESTA REPETIDA EN DINERO RÁPIDO (Du-Dup) */
  playRepeatAnswer() {
    this.init();
    const vol = this.getVolume();
    if (vol === 0) return;

    const now = this.ctx.currentTime;
    [0, 0.14].forEach((delay, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(idx === 0 ? 330 : 260, now + delay);

      gain.gain.setValueAtTime(0.35 * vol, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + 0.13);
    });
  }

  /* 🚨 ALERTA DRAMÁTICA DE ROBO DE PUNTOS (Steal Opportunity Sting) */
  playStealAlert() {
    this.init();
    const vol = this.getVolume();
    if (vol === 0) return;

    const now = this.ctx.currentTime;
    // Acorde disminuido tenso de show de televisión
    const freqs = [220, 261.63, 311.13, 370.00]; // A3, C4, Eb4, F#4
    freqs.forEach(f => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, now);
      filter.frequency.linearRampToValueAtTime(400, now + 1.2);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime((0.28 / freqs.length) * vol, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.25);
    });
  }

  /* 🎺 FANFARRIA DE CELEBRACIÓN Y VICTORIA (Grand Win Brass) */
  playWin() {
    this.init();
    const vol = this.getVolume();
    if (vol === 0) return;

    const now = this.ctx.currentTime;
    const chords = [
      { time: 0.0, freqs: [261.63, 329.63, 392.00], dur: 0.16 },
      { time: 0.17, freqs: [261.63, 329.63, 392.00], dur: 0.16 },
      { time: 0.34, freqs: [349.23, 440.00, 523.25], dur: 0.22 },
      { time: 0.58, freqs: [392.00, 493.88, 587.33], dur: 0.26 },
      { time: 0.88, freqs: [523.25, 659.25, 783.99, 1046.50], dur: 1.1 }
    ];

    chords.forEach(chord => {
      chord.freqs.forEach(freq => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + chord.time);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2400, now + chord.time);

        g.gain.setValueAtTime(0, now + chord.time);
        g.gain.linearRampToValueAtTime((0.20 / chord.freqs.length) * vol, now + chord.time + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0008, now + chord.time + chord.dur);

        osc.connect(filter);
        filter.connect(g);
        g.connect(this.ctx.destination);

        osc.start(now + chord.time);
        osc.stop(now + chord.time + chord.dur + 0.05);
      });
    });
  }

  /* ⏱️ TICK METRÓNOMO DE CRONÓMETRO */
  playTick() {
    this.init();
    const vol = this.getVolume();
    if (vol === 0) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.03);

    gain.gain.setValueAtTime(0.25 * vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  /* 💨 WHOOSH DE TRANSICIÓN */
  playWhoosh() {
    this.init();
    const vol = this.getVolume();
    if (vol === 0) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(480, now + 0.12);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(350, now);
    filter.frequency.exponentialRampToValueAtTime(1200, now + 0.12);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.18 * vol, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }
}

window.sounds = new SoundEffects();
