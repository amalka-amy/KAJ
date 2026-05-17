/**
 * Třída Timer
 * =======================
 * Logika časovače hry.
 * Vytvořeno pomocí AI
 *
 * Použití:
 *   let t = new Timer(function(elapsed) { ... });
 *   t.start();
 *   t.stop();
 *   t.reset();
 *   t.getElapsed(); // vrátí sekundy
 */

function Timer(onTick) {
  this._onTick    = onTick || function () {};
  this._elapsed   = 0;     // uplynulé sekundy
  this._intervalId = null; // ID intervalu (pro zastavení)
  this._running   = false;
}

Timer.prototype.start = function () {
  if (this._running) return;
  this._running = true;

  let self = this; // uložíme kontext pro closure
  this._intervalId = setInterval(function () {
    self._elapsed += 1;
    self._onTick(self._elapsed);
  }, 1000);
};

Timer.prototype.stop = function () {
  if (!this._running) return;
  this._running = false;
  clearInterval(this._intervalId);
  this._intervalId = null;
};

Timer.prototype.reset = function () {
  this.stop();
  this._elapsed = 0;
  this._onTick(0);
};

Timer.prototype.getElapsed = function () {
  return this._elapsed;
};

Timer.prototype.isRunning = function () {
  return this._running;
};

/*
 * Formátuje sekundy na "MM:SS".
 */
Timer.formatTime = function (seconds) {
  let m = Math.floor(seconds / 60);
  let s = seconds % 60;
  return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
};
