/**
 * timer.js – Třída Timer
 * =======================
 * Zapouzdřuje logiku časovače hry.
 *
 * Použití:
 *   var t = new Timer(function(elapsed) { ... });
 *   t.start();
 *   t.stop();
 *   t.reset();
 *   t.getElapsed(); // vrátí sekundy
 */

/**
 * Vytvoří nový časovač.
 * @constructor
 * @param {function(number): void} onTick - callback volaný každou sekundu
 *   Parametr je celkový počet uplynulých sekund.
 */
function Timer(onTick) {
  this._onTick    = onTick || function () {};
  this._elapsed   = 0;     // uplynulé sekundy
  this._intervalId = null; // ID intervalu (pro zastavení)
  this._running   = false;
}

/**
 * Spustí časovač.
 * Pokud již běží, nedělá nic.
 */
Timer.prototype.start = function () {
  if (this._running) return;
  this._running = true;

  var self = this; // uložíme kontext pro closure
  this._intervalId = setInterval(function () {
    self._elapsed += 1;
    self._onTick(self._elapsed);
  }, 1000);
};

/**
 * Zastaví (pozastaví) časovač.
 */
Timer.prototype.stop = function () {
  if (!this._running) return;
  this._running = false;
  clearInterval(this._intervalId);
  this._intervalId = null;
};

/**
 * Resetuje časovač na nulu a zastaví ho.
 */
Timer.prototype.reset = function () {
  this.stop();
  this._elapsed = 0;
  this._onTick(0);
};

/**
 * Vrátí uplynulý čas v sekundách.
 * @returns {number}
 */
Timer.prototype.getElapsed = function () {
  return this._elapsed;
};

/**
 * Vrátí, zda časovač právě běží.
 * @returns {boolean}
 */
Timer.prototype.isRunning = function () {
  return this._running;
};

/**
 * Statická pomocná metoda – formátuje sekundy na "MM:SS".
 * @param {number} seconds
 * @returns {string}
 */
Timer.formatTime = function (seconds) {
  var m = Math.floor(seconds / 60);
  var s = seconds % 60;
  return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
};
