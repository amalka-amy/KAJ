/**
 * sounds.js – Správa zvuků pomocí Web Audio API
 * ================================================
 * Vytváří zvukové efekty
 *
 * Použité API: Web Audio API (AudioContext, OscillatorNode, GainNode)
 */

var PexesoSounds = (function () {

  /** @type {AudioContext|null} Sdílený audio kontext */
  var ctx = null;

  /** @type {number} Hlasitost 0–1 */
  var masterVolume = 0.6;

  /**
   *
   * @returns {AudioContext}
   */
  function getContext() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Pokud byl kontext pozastavený (autoplay policy), obnovíme ho
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx;
  }

  /**
   * Přehraje tón pomocí oscilátoru.
   * @param {number} frequency  - frekvence v Hz
   * @param {string} type       - typ vlny: 'sine' | 'square' | 'triangle' | 'sawtooth'
   * @param {number} duration   - délka v sekundách
   * @param {number} [delay=0]  - zpoždění startu v sekundách
   * @param {number} [vol=1]    - relativní hlasitost (násobí masterVolume)
   */
  function playTone(frequency, type, duration, delay, vol) {
    delay = delay || 0;
    vol   = vol   !== undefined ? vol : 1;

    var context = getContext();
    var now = context.currentTime;

    // Oscilátor – generuje zvuk
    var osc = context.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now + delay);

    // Gain nod – ovládá hlasitost
    var gain = context.createGain();
    gain.gain.setValueAtTime(0, now + delay);
    // Náběh (attack)
    gain.gain.linearRampToValueAtTime(masterVolume * vol, now + delay + 0.02);
    // Doznění (release)
    gain.gain.exponentialRampToValueAtTime(0.001, now + delay + duration);

    // Zapojení do grafu: osc → gain → výstup
    osc.connect(gain);
    gain.connect(context.destination);

    osc.start(now + delay);
    osc.stop(now + delay + duration + 0.05);
  }

  // ==========================================
  // VEŘEJNÉ ZVUKOVÉ EFEKTY
  // ==========================================

  return {

    /**
     * Nastaví hlavní hlasitost.
     * @param {number} volume - hodnota 0–100 (ze slideru)
     */
    setVolume: function (volume) {
      masterVolume = volume / 100;
    },

    /**
     * Zvuk otočení karty – jemné "klik".
     * Krátký přechod od vyšší k nižší frekvenci.
     */
    playFlip: function () {
      playTone(440, 'triangle', 0.08, 0, 0.4);
      playTone(320, 'triangle', 0.06, 0.06, 0.2);
    },

    /**
     * Zvuk nalezeného páru – příjemný akord.
     * Tři tóny v durové tercii postupně.
     */
    playMatch: function () {
      // Akord C-E-G (do-mi-sol)
      playTone(523, 'sine', 0.3, 0,    0.8);  // C5
      playTone(659, 'sine', 0.3, 0.08, 0.8);  // E5
      playTone(784, 'sine', 0.4, 0.16, 1.0);  // G5
    },

    /**
     * Zvuk chybného páru – disonantní "bzz".
     */
    playMismatch: function () {
      playTone(200, 'sawtooth', 0.15, 0,    0.4);
      playTone(185, 'sawtooth', 0.15, 0.08, 0.4);
    },

    /**
     * Zvuk výhry – fanfára.
     * Sekvence tónů, které znějí slavnostně.
     */
    playWin: function () {
      var melody = [
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

    /**
     * Zvuk tlačítka / UI akce – jemné kliknutí.
     */
    playClick: function () {
      playTone(600, 'triangle', 0.05, 0, 0.3);
    }
  };

}());
