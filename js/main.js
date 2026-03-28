/**
 * main.js – Inicializace aplikace Pexeso
 * ========================================
 * Tento soubor:
 *   - Inicializuje všechny komponenty po načtení stránky
 *   - Propojuje formulář menu s herní logikou
 *   - Spravuje přepínání obrazovek (menu ↔ hra)
 *   - Implementuje přepínání tématu (dark/light)
 *   - Reaguje na History API (tlačítka zpět/vpřed)
 *   - Detekuje stav internetového připojení (offline/online)
 *   - Generuje SVG pozadí a dekorace
 *   - Vykresluje žebříček výsledků

 */

// Spustíme inicializaci po plném načtení DOM
document.addEventListener('DOMContentLoaded', function () {

  // ==========================================
  // 1. REFERENCE NA DOM ELEMENTY
  // ==========================================

  var screenMenu    = document.getElementById('screen-menu');
  var screenGame    = document.getElementById('screen-game');
  var settingsForm  = document.getElementById('game-settings');
  var playerInput   = document.getElementById('player-name');
  var volumeSlider  = document.getElementById('volume-control');
  var volumeOutput  = document.getElementById('volume-output');
  var btnScores     = document.getElementById('btn-scores');
  var btnCloseScores= document.getElementById('btn-close-scores');
  var scoresPanel   = document.getElementById('scores-panel');
  var scoresList    = document.getElementById('scores-list');
  var btnBack       = document.getElementById('btn-back');
  var btnRestart    = document.getElementById('btn-restart');
  var offlineBanner = document.getElementById('offline-banner');
  var headerBg      = document.getElementById('header-bg');
  var winModal      = document.getElementById('win-modal');

  // Přepínače tématu (jsou dva – v menu a ve hře)
  var themeToggles  = document.querySelectorAll('[id^="theme-toggle"]');

  // ==========================================
  // 2. INICIALIZACE HRY
  // ==========================================

  var game = new Game();

  // ==========================================
  // 3. ULOŽENÉ NASTAVENÍ (LocalStorage)
  // Načteme téma a hlasitost z předchozí relace
  // ==========================================

  var savedTheme  = PexesoStorage.getTheme();
  var savedVolume = PexesoStorage.getVolume();

  // Aplikujeme uložené téma
  document.documentElement.setAttribute('data-theme', savedTheme);

  // Nastavíme slider na uloženou hodnotu
  volumeSlider.value      = savedVolume;
  volumeOutput.textContent = savedVolume + '%';
  PexesoSounds.setVolume(savedVolume);

  // ==========================================
  // 4. SVG DEKORACE MENU
  // ==========================================

  PexesoSVG.generateHeaderBackground(headerBg);

  // ==========================================
  // 5. PŘEPÍNÁNÍ TÉMATU (dark/light mode)
  // ==========================================

  /**
   * Přepne téma a uloží volbu do LocalStorage.
   */
  function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme');
    var next    = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    PexesoStorage.saveTheme(next);
    PexesoSounds.playClick();
  }

  // Posluchač pro všechna témátovací tlačítka
  themeToggles.forEach(function (btn) {
    btn.addEventListener('click', toggleTheme);
  });

  // ==========================================
  // 6. HLASITOST – slider
  // ==========================================

  volumeSlider.addEventListener('input', function () {
    var vol = parseInt(this.value, 10);
    volumeOutput.textContent = vol + '%';
    PexesoSounds.setVolume(vol);
    PexesoStorage.saveVolume(vol);
  });

  // ==========================================
  // 7. PŘEPÍNÁNÍ OBRAZOVEK (menu ↔ hra)
  // ==========================================

  /**
   * Zobrazí menu, skryje hru.
   */
  function showMenu() {
    screenMenu.classList.remove('hidden');
    screenMenu.classList.add('active');
    screenGame.classList.add('hidden');
    screenGame.classList.remove('active');
  }

  /**
   * Zobrazí herní plochu, skryje menu.
   */
  function showGame() {
    screenGame.classList.remove('hidden');
    screenGame.classList.add('active');
    screenMenu.classList.add('hidden');
    screenMenu.classList.remove('active');
  }

  // ==========================================
  // 8. FORMULÁŘ – SPUŠTĚNÍ HRY
  // ==========================================

  settingsForm.addEventListener('submit', function (e) {
    e.preventDefault(); // Zabráníme reload stránky

    // Validace: jméno hráče nesmí být prázdné
    var name = playerInput.value.trim();
    if (!name) {
      playerInput.focus();
      playerInput.style.borderColor = 'var(--color-error)';
      // Odstranit červené ohraničení po 2 sekundách
      setTimeout(function () {
        playerInput.style.borderColor = '';
      }, 2000);
      return;
    }

    // Načteme vybranou obtížnost
    var difficultyEl = settingsForm.querySelector('input[name="difficulty"]:checked');
    var difficulty   = difficultyEl ? difficultyEl.value : 'easy';

    PexesoSounds.playClick();
    showGame();

    // Spustíme hru s vybranými nastaveními
    game.start({
      difficulty: difficulty,
      playerName: name
    });
  });

  // ==========================================
  // 9. TLAČÍTKO "ZPĚT DO MENU"
  // ==========================================

  btnBack.addEventListener('click', function () {
    game.timer.stop();
    PexesoSounds.playClick();
    showMenu();
    // Přidáme stav "menu" do historie
    history.pushState({ screen: 'menu' }, '', '#menu');
  });

  // ==========================================
  // 10. TLAČÍTKO "RESTART"
  // ==========================================

  btnRestart.addEventListener('click', function () {
    PexesoSounds.playClick();
    winModal.hide();
    game.restart();
  });

  // ==========================================
  // 11. ŽEBŘÍČEK VÝSLEDKŮ
  // ==========================================

  btnScores.addEventListener('click', function () {
    PexesoSounds.playClick();
    renderScores();
    scoresPanel.classList.toggle('hidden');
  });

  btnCloseScores.addEventListener('click', function () {
    scoresPanel.classList.add('hidden');
  });

  /**
   * Vykreslí nejlepší výsledky do panelu.
   */
  function renderScores() {
    var all = PexesoStorage.getAllScores();

    if (all.length === 0) {
      scoresList.innerHTML = '';
      return;
    }

    // Seřadíme: nejdříve podle obtížnosti (hard > medium > easy), pak podle času
    var sorted = all.slice().sort(function (a, b) {
      var diffOrder = { hard: 0, medium: 1, easy: 2 };
      if (diffOrder[a.difficulty] !== diffOrder[b.difficulty]) {
        return diffOrder[a.difficulty] - diffOrder[b.difficulty];
      }
      return a.time - b.time;
    });

    // Vezměme top 10
    var top10 = sorted.slice(0, 10);

    var diffLabels = { easy: 'L', medium: 'S', hard: 'T' };

    scoresList.innerHTML = top10.map(function (s, i) {
      return '<div class="score-item">' +
        '<span>' + escapeHtml(s.player) + ' <small>(' + (diffLabels[s.difficulty] || s.difficulty) + ')</small></span>' +
        '<span>' + Timer.formatTime(s.time) + ' / ' + s.moves + ' tahů</span>' +
        '</div>';
    }).join('');
  }

  // ==========================================
  // 12. UDÁLOSTI MODÁLNÍHO OKNA
  // ==========================================

  // Událost "hrát znovu" z win-modal
  winModal.addEventListener('restart', function () {
    game.restart();
    showGame();
  });

  // Událost "zpět do menu" z win-modal
  winModal.addEventListener('gotomenu', function () {
    showMenu();
    history.pushState({ screen: 'menu' }, '', '#menu');
  });

  // ==========================================
  // 13. HISTORY API – navigace prohlížeč - zajišťuje správ nost talčítek zpět/vpřd v závislosti na stavu (ve hře, v menu,..)
  // ==========================================

  /**
   * Reaguje na popstate event (
   */
  window.addEventListener('popstate', function (e) {
    var state = e.state;

    if (!state) {
      showMenu();
      return;
    }

    if (state.screen === 'menu') {
      game.timer.stop();
      winModal.hide();
      showMenu();

    } else if (state.screen === 'game') {
      showGame();

    } else if (state.screen === 'win') {
      // Pokud uživatel jde "dopředu" na win, prostě ukáže hru
      showGame();
    }
  });

  // Nastavíme počáteční stav v historii
  history.replaceState({ screen: 'menu' }, '', '#menu');

  // ==========================================
  // 14. OFFLINE DETEKCE
  // Reaguje na stav internetového připojení
  // ==========================================

  function updateOnlineStatus() {
    if (!navigator.onLine) {
      offlineBanner.classList.remove('hidden');
    } else {
      offlineBanner.classList.add('hidden');
    }
  }

  // Zkontrolujeme při načtení stránky /voláme hned/
  updateOnlineStatus();

  // Sledujeme změny připojení
  window.addEventListener('online',  updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);

  // ==========================================
  // POMOCNÉ FUNKCE - zabraňuje XSS útoku
  // ==========================================

  /**
   * Escapuje HTML znaky pro bezpečné vložení textu.
   * @param {string} str
   * @returns {string}
   */
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(String(str)));
    return div.innerHTML;
  }

  // ==========================================
  // 15. ZRUŠENÍ DRAG & DROP - aby se nedalo posouvat obrázkem mimo kartu
  // ==========================================

  document.addEventListener('dragstart', function (e) {
    // Najdeme nejbližší .card ancestor
    var cardEl = e.target.closest && e.target.closest('.card');
    if (cardEl) {
      e.dataTransfer.effectAllowed = 'none';
      e.preventDefault();
    }
  });

  console.log(
    '%c🃏 Pexeso načteno!',
    'color: #8b4513; font-size: 18px; font-weight: bold;'
  );

});
