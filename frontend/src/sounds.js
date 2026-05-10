/**
 * Sound effects using Web Audio API — no external files needed.
 * Generates tones programmatically.
 */

let ctx = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

function playTone({ frequency = 440, type = 'sine', duration = 0.15, gain = 0.3, delay = 0 }) {
  try {
    const ac = getCtx();
    const osc = ac.createOscillator();
    const gainNode = ac.createGain();
    osc.connect(gainNode);
    gainNode.connect(ac.destination);

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ac.currentTime + delay);

    gainNode.gain.setValueAtTime(0, ac.currentTime + delay);
    gainNode.gain.linearRampToValueAtTime(gain, ac.currentTime + delay + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + duration);

    osc.start(ac.currentTime + delay);
    osc.stop(ac.currentTime + delay + duration + 0.05);
  } catch { /* silently fail if audio not available */ }
}

export const sounds = {
  correct() {
    // Happy ascending chord
    playTone({ frequency: 523, type: 'sine', duration: 0.12, gain: 0.25 });
    playTone({ frequency: 659, type: 'sine', duration: 0.12, gain: 0.2,  delay: 0.07 });
    playTone({ frequency: 784, type: 'sine', duration: 0.2,  gain: 0.2,  delay: 0.14 });
  },

  wrong() {
    // Low buzz
    playTone({ frequency: 200, type: 'sawtooth', duration: 0.25, gain: 0.15 });
    playTone({ frequency: 160, type: 'sawtooth', duration: 0.2,  gain: 0.1, delay: 0.08 });
  },

  complete() {
    // Victory fanfare
    [523, 659, 784, 1047].forEach((f, i) => {
      playTone({ frequency: f, type: 'sine', duration: 0.18, gain: 0.2, delay: i * 0.1 });
    });
  },

  click() {
    playTone({ frequency: 880, type: 'sine', duration: 0.06, gain: 0.1 });
  },

  heartLost() {
    playTone({ frequency: 300, type: 'sine', duration: 0.1,  gain: 0.2 });
    playTone({ frequency: 200, type: 'sine', duration: 0.3,  gain: 0.15, delay: 0.1 });
  },
};
