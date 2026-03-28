/**
 * cards.js – Generátor karet načítající obrázky ze souborů
 * =============================================================
 * Každá karta načítá obrázek ze souboru podle svého id,
 * např. karta 'brokolice' načte 'brokolice.jpg'.
 *
 *
 * Každá karta je objekt s:
 *   - id:     jedinečný identifikátor (= název souboru bez přípony)
 *   - name:   název (zobrazí se v UI)
 *   - svg:    funkce vracející SVGElement s načteným obrázkem
 */

var PexesoSVG = (function () {

  /**
   * Vytvoří SVG element se správným namespace.
   * @param {string} tag - název elementu (např. 'image')
   * @param {Object} attrs - atributy elementu
   * @returns {SVGElement}
   */
  function el(tag, attrs) {
    var ns = 'http://www.w3.org/2000/svg';
    var e = document.createElementNS(ns, tag);
    for (var key in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, key)) {
        e.setAttribute(key, attrs[key]);
      }
    }
    return e;
  }

  /**
   * Vytvoří kořenový SVG element s viewBox 100×100.
   * @returns {SVGSVGElement}
   */
  function createSVG() {
    return el('svg', {
      viewBox: '0 0 100 100',   // ← zpět na 100x100
      xmlns: 'http://www.w3.org/2000/svg',
      role: 'img'
    });
  }

  function createImageCard(id, name) {
    var s = createSVG();
    s.setAttribute('aria-label', name);

    var bg = el('rect', {
      x: '5', y: '5', width: '90', height: '90',
      fill: 'white'
    });

    var img = el('image', {
      href: IMAGE_BASE_PATH + id + IMAGE_EXTENSION,
      x: '5',
      y: '5',
      width: '90',
      height: '90',
      preserveAspectRatio: 'xMidYMid meet'
    });

    s.append(bg, img);
    return s;
  }
  // ==========================================
  // DEFINICE KARET
  // Přidejte nebo odeberte položky dle potřeby.
  // Hodnota 'id' musí odpovídat názvu souboru
  // (bez přípony) ve složce IMAGE_BASE_PATH.
  // ==========================================

  var cards = [
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
        return createImageCard(card.id, card.name);
      }
    };
  });

  // ==========================================
  // VEŘEJNÉ API jmenného prostoru PexesoSVG
  // ==========================================

  return {
    /** Vrátí pole všech definovaných karet */
    getCards: function () {
      return cards;
    },

    /**
     * Vrátí název karty podle id.
     * @param {string} id
     * @returns {string}
     */
    getCardName: function (id) {
      var card = cards.find(function (c) { return c.id === id; });
      return card ? card.name : id;
    },

    /**
     * Změní cestu ke složce s obrázky za běhu.
     * Užitečné při dynamickém přepínání témat pexesa.
     * @param {string} path - nová cesta, např. 'themes/zvirata/'
     */
    setImagePath: function (path) {
      IMAGE_BASE_PATH = path;
    },

    /**
     * Změní příponu obrázků za běhu.
     * @param {string} ext - přípona včetně tečky, např. '.png'
     */
    setImageExtension: function (ext) {
      IMAGE_EXTENSION = ext;
    },

    /**
     * Generuje dekorativní SVG vzor pro rub karty.
     * Retro motiv: kříže a kroužky ve stylu hracích karet.
     * @returns {SVGSVGElement}
     */
    generateCardBack: function () {
      var s = el('svg', {
        viewBox: '0 0 100 100',
        xmlns: 'http://www.w3.org/2000/svg'
      });

      var bg = el('rect', { width: '100', height: '100', fill: '#8b4513' });
      s.appendChild(bg);

      var border = el('rect', { x: '5', y: '5', width: '90', height: '90',
        fill: 'none', stroke: '#f5d020', 'stroke-width': '2', rx: '3' });
      s.append(border);

      // Rohové dekorace (mini ♣)
      var corners = [[14, 14], [86, 14], [14, 86], [86, 86]];
      corners.forEach(function (c) {
        var club = el('text', {
          x: c[0], y: c[1],
          'text-anchor': 'middle',
          'dominant-baseline': 'central',
          'font-size': '10',
          fill: '#f5d020',
          opacity: '0.9',
          'font-family': 'serif'
        });
        club.textContent = '♣';
        s.appendChild(club);
      });

      return s;
    },

    /**
     * Generuje dekorativní SVG pozadí pro header menu.
     * @param {SVGSVGElement} container - element do kterého se kreslí
     */
    generateHeaderBackground: function (container) {
      container.setAttribute('viewBox', '0 0 800 280');

      for (var i = 0; i < 5; i++) {
        var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', '0');
        line.setAttribute('y1', String(56 * i));
        line.setAttribute('x2', '800');
        line.setAttribute('y2', String(56 * i));
        line.setAttribute('stroke', '#c8a96e');
        line.setAttribute('stroke-width', '0.5');
        line.setAttribute('opacity', '0.3');
        container.appendChild(line);
      }
    }
  };

}());