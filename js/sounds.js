/*
 * sounds.js – Správa zvuků pomocí Web Audio API
 * ================================================
 * Vytváří zvukové efekty
 *
 * Použité API: Web Audio API (AudioContext, OscillatorNode, GainNode)
 */

let PexesoSounds = (function () {

  let ctx = null;

  let masterVolume = 0.5;

  function getContext() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return ctx;
  }

  /*
   * AUDIO API
   * @param {number} frequency
   * @param {string} type
   * @param {number} duration
   * @param {number} [delay=0]a
   * @param {number} [vol=1]
   */
  function playTone(frequency, type, duration, delay, vol) {
    delay = delay || 0;
    vol   = vol   !== undefined ? vol : 0.5;

    let context = getContext();
    let now = context.currentTime;

    let osc = context.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now + delay);

    let gain = context.createGain();
    gain.gain.setValueAtTime(0, now + delay);
    gain.gain.linearRampToValueAtTime(masterVolume * vol * 0.15, now + delay + 0.03);

    osc.connect(gain);
    gain.connect(context.destination);

    osc.start(now + delay);
    osc.stop(now + delay + duration + 0.05);
  }

  return {

    setVolume: function (volume) {
      masterVolume = volume / 100;
    },

    playFlip: function () {
      playTone(440, 'triangle', 0.08, 0, 0.4);
      playTone(320, 'triangle', 0.06, 0.06, 0.2);
    },

    playMatch: function () {
      playTone(523, 'sine', 0.3, 0,    0.8);
      playTone(659, 'sine', 0.3, 0.08, 0.8);
      playTone(784, 'sine', 0.4, 0.16, 1.0);
    },

    playMismatch: function () {
      playTone(200, 'sawtooth', 0.15, 0,    0.3);
      playTone(185, 'sawtooth', 0.15, 0.08, 0.4);
    },

    playWin: function () {
      let melody = [
        { f: 523, d: 0.15, t: 0 },    // C5
        { f: 659, d: 0.15, t: 0.15 }, // E5
        { f: 784, d: 0.15, t: 0.30 }, // G5
        { f: 1047,d: 0.40, t: 0.45 }, // C6
        { f: 784, d: 0.10, t: 0.55 }, // G5
        { f: 1047,d: 0.50, t: 0.65 }, // C6
      ];
      melody.forEach(function (note) {
        playTone(note.f, 'sine', note.d, note.t, 0.9);
      });
    },

    playClick: function () {
      playTone(600, 'triangle', 0.05, 0, 0.2);
    }
  };

}());
