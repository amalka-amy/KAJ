/**
 * hlavní herní logika
 * =============================================
 * Řídí celý průběh hry pexeso:
 *   - Generování a zamíchání karet
 *   - Sledování tahů a párů
 *   - Komunikace s Timer, PexesoSounds, PexesoStorage
 *   - History API (tlačítka zpět/vpřed prohlížeče)
 */
function Game() {
  this.cards         = [];
  this.flippedCards  = [];
  this.moves         = 0;
  this.matchedPairs  = 0;
  this.totalPairs    = 0;
  this.isLocked      = false;
  this.difficulty    = 'easy';
  this.playerName    = '';

  let self = this;
  this.timer = new Timer(function (elapsed) {
    self._updateTimerDisplay(elapsed);
  });

  this.boardEl = document.getElementById('game-board');
  this.movesEl = document.getElementById('moves-count');
  this.pairsEl = document.getElementById('pairs-count');
  this.timerEl = document.getElementById('timer-display');
  this.winModal = document.getElementById('win-modal');
}



// Nastavení pro obtížnosti
Game.DIFFICULTIES = {
  easy:   { cols: 4, pairs: 8  },
  hard: { cols: 6, pairs: 18 },
};



Game.prototype.start = function (settings) {
  this.difficulty = settings.difficulty || 'easy'; // pokud není zvoleno jinak tak easy
  this.playerName = settings.playerName || 'Hráč';

  let config = Game.DIFFICULTIES[this.difficulty];
  this.totalPairs   = config.pairs;
  this.matchedPairs = 0;
  this.moves        = 0;
  this.isLocked     = false;
  this.flippedCards = [];

  this.timer.reset();
  this._updateMovesDisplay();
  this._updatePairsDisplay();

  this.boardEl.style.setProperty('--board-cols', config.cols);

  this._generateCards(config.pairs);
  this._renderCards();

  // uloženo history api stav
  history.pushState(
    { screen: 'game', difficulty: this.difficulty },
    '',
    '#game'
  );
};

// počítadlo
Game.prototype._updateMovesDisplay = function () {
  this.movesEl.textContent = this.moves;
};

// páry
Game.prototype._updatePairsDisplay = function () {
  this.pairsEl.textContent = this.matchedPairs + ' / ' + this.totalPairs;
};

// časovač
Game.prototype._updateTimerDisplay = function (elapsed) {
  this.timerEl.textContent = Timer.formatTime(elapsed);
};





// generoání karet
Game.prototype._generateCards = function (pairCount) {
  let allCards = PexesoSVG.getCards();

  // Když je potřeba více karet než má sada, tak se karty opakují
  let selectedIds = [];
  let i = 0;
  while (selectedIds.length < pairCount) {
    selectedIds.push(allCards[i % allCards.length].id);
    i++;
  }

  let pairs = [];
  selectedIds.forEach(function (id) {
    pairs.push(id, id); // dvě karty se stejným id
  });

  // Fisher-Yates shuffle – algoritmus pro náhodné promíchání zdroj: https://www.w3schools.com/js/tryit.asp?filename=tryjs_array_sort_random2
  for (var j = pairs.length - 1; j > 0; j--) {
    let k = Math.floor(Math.random() * (j + 1));
    let tmp = pairs[j];
    pairs[j] = pairs[k];
    pairs[k] = tmp;
  }


  this.cards = pairs.map(function (id, index) {
    return new PictureCard(id, index);
  });
};



// vykreslení karet na plochu
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




// Zpracuje kliknutí na kartu.
Game.prototype._onCardClick = function (card) {
  if (this.isLocked)                          return;
  if (card.isMatched)                          return;
  if (card.isFlipped)                          return;
  if (this.flippedCards.length >= 2)           return;

  // start časovače
  if (!this.timer.isRunning()) {
    this.timer.start();
  }

  card.flip();
  PexesoSounds.playFlip();
  this.flippedCards.push(card);

  // Pokud jsou otočeny 2 karty, kontrola páru probějne
  if (this.flippedCards.length === 2) {
    this.moves++;
    this._updateMovesDisplay();
    this._checkMatch();
  }
};



// kontrola páru
Game.prototype._checkMatch = function () {
  let card1 = this.flippedCards[0];
  let card2 = this.flippedCards[1];

  if (card1.cardId === card2.cardId) {
    this._handleMatch(card1, card2);
  } else {
    this._handleMismatch(card1, card2);
  }
};




// pár OK
Game.prototype._handleMatch = function (card1, card2) {
  PexesoSounds.playMatch();

  setTimeout(function () {
    card1.match();
    card2.match();
  }, 500);

  this.flippedCards = [];
  this.matchedPairs++;
  this._updatePairsDisplay();

  // Zkontrolujeme výhru
  if (this.matchedPairs === this.totalPairs) {
    this._handleWin();
  }
};




// pár to není
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

// Zpracování výhry
Game.prototype._handleWin = function () {
  let self = this;

  setTimeout(function () {
    self.timer.stop();
    PexesoSounds.playWin();

    // výsledek uložen do Local Storage
    let result = {
      player:     self.playerName,
      difficulty: self.difficulty,
      time:       self.timer.getElapsed(),
      moves:      self.moves,
      date:       new Date().toLocaleDateString('cs-CZ')
    };
    PexesoStorage.saveScore(result);

    self.winModal.show(result);

    history.pushState(
      { screen: 'win' },
      '',
      '#win'
    );
  }, 600);
};
