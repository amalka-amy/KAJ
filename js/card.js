/**
 * Třída Card
 * ==========================================================
 * Reprezentuje jednu kartu v pexesu.
 * Stará se o svůj DOM element, stavy a o generování SVG obsahu.
 */

function Card(cardId, index) {
  this.cardId   = cardId;   // id pro párování dvojic pexsea
  this.index    = index;    // pořadí na ploše
  this.isFlipped  = false;
  this.isMatched  = false;
  this.element    = null;
  this.image = "img/"+cardId+".jpg";
}

Card.prototype.createDOM = function () {
  let card = document.createElement('div');
  card.className = 'card';
  card.setAttribute('aria-label', 'Karta ' + (this.index + 1));
  card.setAttribute('role', 'button');
  let inner = document.createElement('div');
  inner.className = 'card-inner';
  let back = document.createElement('div');
  back.className = 'card-back';
  let backSVG = PexesoSVG.generateCardBack();
  let front = document.createElement('div');
  front.className = 'card-front';

  back.appendChild(backSVG);
  inner.appendChild(back);
  inner.appendChild(front);
  card.appendChild(inner);

  this.element = card;
  this._frontEl = front;

  return card;
};

Card.prototype.addClickListener = function (onClick) {
  let self = this
  this.element.addEventListener('click', function () {
    onClick(self);
  });
};

Card.prototype.flip = function () {
  this.isFlipped = true;
  this.element.classList.add('is-flipped');
};

Card.prototype.unflip = function () {
  this.isFlipped = false;
  this.element.classList.remove('is-flipped');
};

Card.prototype.match = function () {
  this.isMatched = true;
  this.element.classList.add('is-matched');
  };

function PictureCard(cardId, index) {
  Card.call(this, cardId, index);
}

PictureCard.prototype = Object.create(Card.prototype);

PictureCard.prototype.createDOM = function () {
  let element = Card.prototype.createDOM.call(this);
  let svg = PexesoSVG.getCardSVG(this.cardId);
  if (svg) {
    svg.setAttribute('aria-label', PexesoSVG.getCardName(this.cardId));
    svg.setAttribute('role', 'img');
    this._frontEl.appendChild(svg);
  }

  return element;
};
