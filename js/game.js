/**
 * game.js – Třída Game (hlavní herní logika)
 * =============================================
 * Řídí celý průběh hry pexeso:
 *   - Generování a zamíchání karet
 *   - Sledování tahů a párů
 *   - Komunikace s Timer, PexesoSounds, PexesoStorage
 *   - History API (tlačítka zpět/vpřed prohlížeče)
 */
function Game() {
  this.cards         = [];   // pole objektů PictureCard
  this.flippedCards  = [];   // právě otočené karty (max. 2)
  this.moves         = 0;    // počet tahů
  this.matchedPairs  = 0;    // počet nalezených párů
  this.totalPairs    = 0;    // celkový počet párů
  this.isLocked      = false;// zámek – zabraňuje klikání při animaci
  this.difficulty    = 'easy';
  this.playerName    = '';

  // Časovač
  let self = this;
  this.timer = new Timer(function (elapsed) {
    self._updateTimerDisplay(elapsed);
  });

  // Reference na DOM elementy
  this.boardEl = document.getElementById('game-board');
  this.movesEl = document.getElementById('moves-count');
  this.pairsEl = document.getElementById('pairs-count');
  this.timerEl = document.getElementById('timer-display');
  this.winModal = document.getElementById('win-modal');
}

// =============================================
// KONFIGURACE OBTÍŽNOSTÍ
// =============================================

/** @type {Object} Nastavení pro každou obtížnost */
Game.DIFFICULTIES = {
  easy:   { cols: 4, pairs: 8  },
  medium: { cols: 6, pairs: 18 },
  hard:   { cols: 8, pairs: 32 }
};

// =============================================
// INICIALIZACE A SPUŠTĚNÍ HRY
// =============================================

/**
 * Spustí novou hru.
 * @param {Object} settings - { difficulty, playerName }
 */
Game.prototype.start = function (settings) {
  this.difficulty = settings.difficulty || 'easy';
  this.playerName = settings.playerName || 'Hráč';

  let config = Game.DIFFICULTIES[this.difficulty];
  this.totalPairs   = config.pairs;
  this.matchedPairs = 0;
  this.moves        = 0;
  this.isLocked     = false;
  this.flippedCards = [];

  // Reset časovače a zobrazení
  this.timer.reset();
  this._updateMovesDisplay();
  this._updatePairsDisplay();

  // Nastav počet sloupců mřížky (CSS proměnná)
  this.boardEl.style.setProperty('--board-cols', config.cols);

  // Generuj karty a vykresli je
  this._generateCards(config.pairs);
  this._renderCards();

  // Zapiš do History API – stav "hraje se"
  history.pushState(
    { screen: 'game', difficulty: this.difficulty },
    '',
    '#game'
  );
};

/**
 * Restartuje aktuální hru (stejná obtížnost).
 */
Game.prototype.restart = function () {
  this.timer.reset();
  this.start({
    difficulty: this.difficulty,
    playerName: this.playerName
  });
};

// =============================================
// GENEROVÁNÍ KARET
// =============================================

/**
 * Vygeneruje pole karet (každý motiv 2×) a zamíchá je.
 * @param {number} pairCount - počet párů
 */
Game.prototype._generateCards = function (pairCount) {
  let allCards = PexesoSVG.getCards();

  // Pokud je párů víc než karet, opakujeme sadu
  let selectedIds = [];
  let i = 0;
  while (selectedIds.length < pairCount) {
    selectedIds.push(allCards[i % allCards.length].id);
    i++;
  }

  // Zduplikujeme každý id pro vytvoření páru
  let pairs = [];
  selectedIds.forEach(function (id) {
    pairs.push(id, id); // dvě karty se stejným id
  });

  // Fisher-Yates shuffle – algoritmus pro náhodné promíchání
  for (var j = pairs.length - 1; j > 0; j--) {
    let k = Math.floor(Math.random() * (j + 1));
    let tmp = pairs[j];
    pairs[j] = pairs[k];
    pairs[k] = tmp;
  }

  // Vytvoříme PictureCard objekty
  this.cards = pairs.map(function (id, index) {
    return new PictureCard(id, index);
  });
};

/**
 * Vykreslí karty do herní plochy.
 */
Game.prototype._renderCards = function () {
  this.boardEl.innerHTML = '';

  let self = this;
  this.cards.forEach(function (card) {
    let el = card.createDOM();
    card.addClickListener(function (clickedCard) {
      self._onCardClick(clickedCard);
    });
    self.boardEl.appendChild(el);
  });
};

// =============================================
// HERNÍ LOGIKA – kliknutí na kartu
// =============================================

/**
 * Zpracuje kliknutí na kartu.
 * @param {PictureCard} card - kliknutá karta
 */
Game.prototype._onCardClick = function (card) {
  // Ignoruj klik pokud: hra je zamčená, karta je spárovaná,
  // karta je již otočena, nebo jsou otočeny již 2 karty
  if (this.isLocked)                          return;
  if (card.isMatched)                          return;
  if (card.isFlipped)                          return;
  if (this.flippedCards.length >= 2)           return;

  // Spustíme časovač při prvním tahu
  if (!this.timer.isRunning()) {
    this.timer.start();
  }

  // Otočíme kartu a přehrajeme zvuk
  card.flip();
  PexesoSounds.playFlip();
  this.flippedCards.push(card);

  // Pokud jsou otočeny 2 karty, zkontrolujeme pár
  if (this.flippedCards.length === 2) {
    this.moves++;
    this._updateMovesDisplay();
    this._checkMatch();
  }
};

/**
 * Zkontroluje, zda otočené dvě karty tvoří pár.
 */
Game.prototype._checkMatch = function () {
  let card1 = this.flippedCards[0];
  let card2 = this.flippedCards[1];

  if (card1.cardId === card2.cardId) {
    // ✅ SHODA! – označíme karty jako spárované
    this._handleMatch(card1, card2);
  } else {
    // ❌ NESHODA – otočíme karty zpět
    this._handleMismatch(card1, card2);
  }
};

/**
 * Zpracuje nalezený pár.
 */
Game.prototype._handleMatch = function (card1, card2) {
  // Zahrajeme zvuk shody
  PexesoSounds.playMatch();

  // Označíme karty (s mírným zpožděním pro animaci)
  setTimeout(function () {
    card1.match();
    card2.match();
  }, 300);

  this.flippedCards = [];
  this.matchedPairs++;
  this._updatePairsDisplay();

  // Zkontrolujeme výhru
  if (this.matchedPairs === this.totalPairs) {
    this._handleWin();
  }
};

/**
 * Zpracuje nesprávný pár.
 */
Game.prototype._handleMismatch = function (card1, card2) {
  // Zamkneme plochu na dobu animace
  this.isLocked = true;
  let self = this;

  PexesoSounds.playMismatch();

  // Po krátké chvilce otočíme karty zpět
  setTimeout(function () {
    card1.unflip();
    card2.unflip();
    self.flippedCards = [];
    self.isLocked = false;
  }, 900);
};

/**
 * Zpracuje výhru – zastaví časovač, zobrazí modál.
 */
Game.prototype._handleWin = function () {
  let self = this;
  // Krátké zpoždění pro poslední animaci karty
  setTimeout(function () {
    self.timer.stop();
    PexesoSounds.playWin();

    // Uložíme výsledek do LocalStorage
    let result = {
      player:     self.playerName,
      difficulty: self.difficulty,
      time:       self.timer.getElapsed(),
      moves:      self.moves,
      date:       new Date().toLocaleDateString('cs-CZ')
    };
    PexesoStorage.saveScore(result);

    // Zobrazíme výsledkový modál (webová komponenta)
    self.winModal.show(result);

    // Zapiš do History API – stav "výhra"
    history.pushState(
      { screen: 'win' },
      '',
      '#win'
    );
  }, 600);
};

// =============================================
// AKTUALIZACE ZOBRAZENÍ (DOM)
// =============================================

/** Aktualizuje počítadlo tahů. */
Game.prototype._updateMovesDisplay = function () {
  this.movesEl.textContent = this.moves;
};

/** Aktualizuje počítadlo párů. */
Game.prototype._updatePairsDisplay = function () {
  this.pairsEl.textContent = this.matchedPairs + ' / ' + this.totalPairs;
};

/**
 * Aktualizuje zobrazení časovače.
 * Volá se z Timer callback.
 * @param {number} elapsed - sekundy
 */
Game.prototype._updateTimerDisplay = function (elapsed) {
  this.timerEl.textContent = Timer.formatTime(elapsed);
};
