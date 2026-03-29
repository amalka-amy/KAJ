/**
 * storage.js – Wrapper pro LocalStorage
 * =======================================
 * Ukládá a čte nejlepší výsledky hráčů.
 *
 * Klíče:
 *   pexeso_scores   – JSON pole s výsledky
 *   pexeso_theme    – uložené téma ('light' | 'dark')
 *   pexeso_volume   – uložená hlasitost (0–100)
 */

let PexesoStorage = (function () {

  let KEYS = {
    SCORES: 'pexeso_scores',
    THEME:  'pexeso_theme',
    VOLUME: 'pexeso_volume'
  };

  /**
   * Bezpečné čtení z LocalStorage.
   * @param {string} key
   * @param {*} defaultValue - výchozí hodnota pokud klíč neexistuje
   * @returns {*}
   */
  function safeGet(key, defaultValue) {
    try {
      let raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : defaultValue;
    } catch (e) {
      console.warn('LocalStorage read error:', e);
      return defaultValue;
    }
  }

  /**
   * Bezpečné zápis do LocalStorage.
   * @param {string} key
   * @param {*} value
   */
  function safeSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage write error:', e);
    }
  }

  return {

    /**
     * Uloží výsledek hry.
     * @param {Object} result - { player, difficulty, time, moves, date }
     */
    saveScore: function (result) {
      let scores = safeGet(KEYS.SCORES, []);
      scores.push(result);

      // Seřadí výsledky: nejprve nejlepší čas, pak tahy
      scores.sort(function (a, b) {
        if (a.difficulty !== b.difficulty) return 0; // různé obtížnosti nesrovnáváme
        if (a.time !== b.time) return a.time - b.time;
        return a.moves - b.moves;
      });

      // Uložíme maximálně 20 výsledků
      if (scores.length > 20) scores = scores.slice(0, 20);
      safeSet(KEYS.SCORES, scores);
    },

    /**
     * Načte výsledky pro danou obtížnost.
     * @param {string} difficulty - 'easy' | 'medium' | 'hard'
     * @returns {Array}
     */
    getScores: function (difficulty) {
      let all = safeGet(KEYS.SCORES, []);
      return all
        .filter(function (s) { return s.difficulty === difficulty; })
        .slice(0, 5); // Top 5
    },

    /**
     * Načte všechny výsledky.
     * @returns {Array}
     */
    getAllScores: function () {
      return safeGet(KEYS.SCORES, []);
    },

    /** Smaže všechny výsledky. */
    clearScores: function () {
      safeSet(KEYS.SCORES, []);
    },

    /** Uloží téma. @param {string} theme */
    saveTheme: function (theme) {
      safeSet(KEYS.THEME, theme);
    },

    /** Načte téma. @returns {string} */
    getTheme: function () {
      return safeGet(KEYS.THEME, 'light');
    },

    /** Uloží hlasitost. @param {number} volume */
    saveVolume: function (volume) {
      safeSet(KEYS.VOLUME, volume);
    },

    /** Načte hlasitost. @returns {number} */
    getVolume: function () {
      return safeGet(KEYS.VOLUME, 70);
    }
  };

}());
