/**
 * card.js – Třída Card
 * ==========================================================
 * Reprezentuje jednu kartu v pexesu.
 * Stará se o svůj DOM element, stavy a o generování SVG obsahu.
 */

// =============================================
// ZÁKLADNÍ TŘÍDA: Card
// =============================================

/**
 * @constructor
 * @param {string} cardId - id obrázku (klíč do PexesoSVG)
 * @param {number} index  - pořadí karty na ploše
 */
function Card(cardId, index) {
  this.cardId   = cardId;   // identifikátor motivu
  this.index    = index;    // pořadí na ploše
  this.isFlipped  = false;
  this.isMatched  = false;
  this.element    = null;
  this.image = "img/"+cardId+".jpg";
}

/**
 * Vytvoří DOM element karty.
 *
 * @returns {HTMLElement} vytvořený element .card
 */
Card.prototype.createDOM = function () {
  // Obal karty
  var card = document.createElement('div');
  card.className = 'card';
  card.setAttribute('role', 'gridcell');
  card.setAttribute('aria-label', 'Karta ' + (this.index + 1));
  card.setAttribute('tabindex', '0');
  // CSS animace – kaskádové zpoždění pro efekt rozložení karet
  card.style.animationDelay = (this.index * 40) + 'ms';

  // Vnitřní kontejner
  var inner = document.createElement('div');
  inner.className = 'card-inner';

  // Rub karty
  var back = document.createElement('div');
  back.className = 'card-back';

  // SVG vzor rubu generujeme v PictureCard.createDOM
  var backSVG = PexesoSVG.generateCardBack();

  // Líc karty
  var front = document.createElement('div');
  front.className = 'card-front';

  back.appendChild(backSVG);
  inner.appendChild(back);
  inner.appendChild(front);
  card.appendChild(inner);

  this.element = card;
  this._frontEl = front;

  return card;
};

/**
 * Přidá posluchač kliknutí na kartu.
 * @param {function(Card): void} onClick
 */
Card.prototype.addClickListener = function (onClick) {
  var self = this
  this.element.addEventListener('click', function () {
    onClick(self);
  });
};

/**
 * Otočí kartu lícem nahoru.
 * Přidá CSS třídu .is-flipped.
 */
Card.prototype.flip = function () {
  this.isFlipped = true;
  this.element.classList.add('is-flipped');
};

/**
 * Otočí kartu zpět rubem nahoru.
 * Odstraní CSS třídu .is-flipped.
 */
Card.prototype.unflip = function () {
  this.isFlipped = false;
  this.element.classList.remove('is-flipped');
};

/**
 * Označí kartu jako spárovanou.
 * Přidá CSS třídu .is-matched.
 */
Card.prototype.match = function () {
  this.isMatched = true;
  this.element.classList.add('is-matched');
  };

// =============================================
// POTOMEK: PictureCard
// =============================================

/**
 * Karta s SVG obrázkem.
 * Dědí všechny metody z Card, pouze přidá SVG do líce.
 */
function PictureCard(cardId, index) {
  Card.call(this, cardId, index);
}

PictureCard.prototype = Object.create(Card.prototype);

PictureCard.prototype.createDOM = function () {
  var element = Card.prototype.createDOM.call(this);

  // Vložení obrázku pomocí innerHTML je nejkratší cesta
  this._frontEl.innerHTML = '<img src="' + this.image + '" '+
      'alt="' + PexesoSVG.getCardName(this.cardId) + '" ' +
      'class="card-image">';

  return element;
};
