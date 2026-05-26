// BIBLIOTECA DE EFECTOS DE SONIDO - Web Audio API (Autocontenida, sin archivos externos)

class SoundEffects {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Reanudar si el navegador lo suspendió por falta de interacción
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playCorrect() {
    this.init();
    const now = this.ctx.currentTime;

    // Campana armónica agradable para "correcto" (Ding!)
    this.playTone(523.25, 'triangle', now, 0.1, 0.15); // C5
    this.playTone(659.25, 'sine', now + 0.08, 0.1, 0.2); // E5
    this.playTone(783.99, 'sine', now + 0.16, 0.15, 0.35); // G5
    this.playTone(1046.50, 'sine', now + 0.24, 0.2, 0.5); // C6
  }

  playWrong() {
    this.init();
    const now = this.ctx.currentTime;

    // Sonido zumbador grave para error (Buzzer!)
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(130, now); // Frecuencia baja áspera

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(133, now); // Desafinación menor para aspereza

    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.7);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);

    osc1.stop(now + 0.7);
    osc2.stop(now + 0.7);
  }

  playWin() {
    this.init();
    const now = this.ctx.currentTime;
    // Fanfarria alegre rápida
    const notes = [261.63, 329.63, 392.00, 523.25, 392.00, 523.25];
    const times = [0, 0.1, 0.2, 0.3, 0.45, 0.6];
    const durations = [0.1, 0.1, 0.1, 0.12, 0.12, 0.5];

    notes.forEach((freq, i) => {
      this.playTone(freq, 'triangle', now + times[i], 0.1, durations[i]);
    });
  }

  playTick() {
    this.init();
    const now = this.ctx.currentTime;
    // Tick sutil para cronómetro
    this.playTone(800, 'sine', now, 0.03, 0.05);
  }

  playTone(freq, type, time, volume, duration) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }
}

window.sounds = new SoundEffects();
