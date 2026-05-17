/*
 * Generátor karet načítající obrázky ze souborů
 * =============================================================
 * Každá karta načítá obrázek ze souboru podle svého id
 *
 * Každá karta je objekt s:
 *   - id:     jedinečný identifikátor (= název souboru bez přípony)
 *   - name:   název (zobrazí se v UI)
 *   - svg:    SVG prostor pro vykreslení karty
 */

let PexesoSVG = (function () {

  function el(tag, attrs) {
    let e = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var key in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, key)) {
        e.setAttribute(key, attrs[key]);
      }
    }
    return e;
  }


  function createSVG() {
    return el('svg', {
      viewBox: '0 0 100 100',
    });
  }

  function createImageCard(name, id) {
    let s = createSVG();
    s.setAttribute('aria-label', name);

    let img = el('image', {
      x: '0', y: '0', width: '100', height: '100',
      href: 'img/' + id + '.jpg',
      preserveAspectRatio: 'xMidYMid slice'
    });

    s.append(img);
    return s;
  }

  let cards = [
    { id: 'jablko',    name: 'Jablko' },
    { id: 'citron',    name: 'Citrón' },
    { id: 'jahoda',    name: 'Jahoda' },
    { id: 'hrozno',    name: 'Hrozno' },
    { id: 'mrkev',     name: 'Mrkev' },
    { id: 'meloun',    name: 'Meloun' },
    { id: 'kukurice',  name: 'Kukuřice' },
    { id: 'tresne',    name: 'Třešně' },
    { id: 'banan',     name: 'Banán' },
    { id: 'pomeranc',  name: 'Pomeranč' },
    { id: 'lilek',     name: 'Lilek' },
    { id: 'paprika',   name: 'Paprika' },
    { id: 'hrach',     name: 'Hrách' },
    { id: 'rajce',     name: 'Rajče' },
    { id: 'ananas',    name: 'Ananas' },
    { id: 'brokolice', name: 'Brokolice' }
  ].map(function (card) {
    return {
      id: card.id,
      name: card.name,
      svg: function () {
        return createImageCard(card.name, card.id);
      }
    };
  });

  return {
    getCards: function () {
      return cards;
    },

    getCardSVG: function (id) {
      let card = cards.find(function (c) { return c.id === id; });
      return card ? card.svg() : null;
    },

    getCardName: function (id) {
      let card = cards.find(function (c) { return c.id === id; });
      return card ? card.name : id;
    },

    generateCardBack: function () {
      let s = el('svg', {
        viewBox: '0 0 100 100',
      });

      let bg = el('rect', { width: '100', height: '100', fill: '#508342' });
      s.appendChild(bg);

      return s;
    }

  };

}());