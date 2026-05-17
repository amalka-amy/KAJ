/*
 * LocalStorage
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

  //Čtení
  function safeGet(key, defaultValue) {
    try {
      let raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : defaultValue;
    } catch (e) {
      console.warn('LocalStorage read error:', e);
      return defaultValue;
    }
  }

  // Zápis
  function safeSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage write error:', e);
    }
  }

  return {
    saveScore: function (result) {
      let scores = safeGet(KEYS.SCORES, []);
      scores.push(result);

      // Řazení výsledků: nejprve od nejtěžší úroveň pak nejlepší čas, pak tahy
      scores.sort(function (a, b) {
        if (a.difficulty !== b.difficulty) return b.difficulty - a.difficulty;
        if (a.time !== b.time) return a.time - b.time;
        return a.moves - b.moves;
      });

      if (scores.length > 20) scores = scores.slice(0, 20);
      safeSet(KEYS.SCORES, scores);
    },

    getScores: function (difficulty) {
      let all = safeGet(KEYS.SCORES, []);
      return all
        .filter(function (s) { return s.difficulty === difficulty; })
        .slice(0, 5); // Top 5
    },

    getAllScores: function () {
      return safeGet(KEYS.SCORES, []);
    },

    saveTheme: function (theme) {
      safeSet(KEYS.THEME, theme);
    },

    getTheme: function () {
      return safeGet(KEYS.THEME, 'light');
    },

    saveVolume: function (volume) {
      safeSet(KEYS.VOLUME, volume);
    },

    getVolume: function () {
      return safeGet(KEYS.VOLUME, 50);
    }
  };

}());
