/**
 * Inicializace aplikace Pexeso
 * ========================================
 * Tento soubor:
 *   - Inicializuje všechny komponenty po načtení stránky
 *   - Propojuje formulář menu s herní logikou
 *   - Spravuje přepínání obrazovek
 *   - Implementuje přepínání tématu
 *   - Reaguje na History API
 *   - Detekuje stav internetového připojení
 *   - Vykresluje žebříček výsledků
 */

// Inicializace až po plném načtní DOM
document.addEventListener('DOMContentLoaded', function () {

  let hiddenDiv = document.createElement('div');
  hiddenDiv.style.display = 'none';
  document.body.appendChild(hiddenDiv);

  let allCards = PexesoSVG.getCards();
  allCards.forEach(function(card) {
    let preloadImg = new Image();
    preloadImg.src = 'img/' + card.id + '.jpg';
    preloadImg.alt = card.name;
    hiddenDiv.appendChild(preloadImg);
  });

  let screenMenu    = document.getElementById('screen-menu');
  let screenGame    = document.getElementById('screen-game');
  let settingsForm  = document.getElementById('game-settings');
  let playerInput   = document.getElementById('player-name');
  let volumeSlider  = document.getElementById('volume-control');
  let volumeOutput  = document.getElementById('volume-output');
  let btnScores     = document.getElementById('btn-scores');
  let btnCloseScores= document.getElementById('btn-close-scores');
  let scoresPanel   = document.getElementById('scores-panel');
  let scoresList    = document.getElementById('scores-list');
  let btnBack       = document.getElementById('btn-back');
  let offlineBanner = document.getElementById('offline-banner');
  let winModal      = document.getElementById('win-modal');

  let themeToggles  = document.querySelectorAll('[id^="theme-toggle"]');

  // inicializuje se hra podle předchozích nastvení
  let game = new Game();

  let savedTheme  = PexesoStorage.getTheme();
  let savedVolume = PexesoStorage.getVolume();

  document.documentElement.setAttribute('data-theme', savedTheme);

  volumeSlider.value      = savedVolume;
  volumeOutput.textContent = savedVolume + '%';
  PexesoSounds.setVolume(savedVolume);


  function toggleTheme() {
    let current = document.documentElement.getAttribute('data-theme');
    let next    = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    PexesoStorage.saveTheme(next);
    PexesoSounds.playClick();
  }

  // Posluchač pro všechna témátovací tlačítka
  themeToggles.forEach(function (btn) {
    btn.addEventListener('click', toggleTheme);
  });


  // spouštění hry a menu
  function showMenu() {
    screenMenu.classList.remove('hidden');
    screenMenu.classList.add('active');
    screenGame.classList.add('hidden');
    screenGame.classList.remove('active');
    document.body.classList.remove('no-scroll');
  }

  function showGame() {
    screenGame.classList.remove('hidden');
    screenGame.classList.add('active');
    screenMenu.classList.add('hidden');
    screenMenu.classList.remove('active');
    document.body.classList.add('no-scroll');
  }

  // spuštění hry po kliknutí na tlačítko
  settingsForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // kontrola jména kráče - není prázndé
    let name = playerInput.value.trim();
    if (!name) {
      playerInput.focus();
      playerInput.style.borderColor = 'var(--color-error)';
      setTimeout(function () {
        playerInput.style.borderColor = '';
      }, 2000);
      return;
    }

    let difficultyEl = settingsForm.querySelector('input[name="difficulty"]:checked'); // vybraná obtížkost
    let difficulty   = difficultyEl ? difficultyEl.value : 'easy'; // pokud "není" tak easy

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
    PexesoSounds.playClick();
    showGame();

    game.start({
      difficulty: difficulty,
      playerName: name
    });
  });

  // tlačítko zpět

  btnBack.addEventListener('click', function () {
    game.timer.stop();
    PexesoSounds.playClick();
    showMenu();
    history.pushState({ screen: 'menu' }, '', '#menu');
  });

  // žebříček výsledků
  btnScores.addEventListener('click', function () {

    PexesoSounds.playClick();

    renderScores();

    scoresPanel.classList.toggle('hidden');
  });

  btnCloseScores.addEventListener('click', function () {

    scoresPanel.classList.add('hidden');
  });


  // vykrelsení síně slávy
  function renderScores() {
    let all = PexesoStorage.getAllScores();
    scoresList.innerHTML = '';

    if (all.length === 0) return;


    // řazení podle obtížnosti, pak
    let sorted = all.slice().sort(function (a, b) {
      let diffOrder = { hard: 0, easy: 1};
      if (diffOrder[a.difficulty] !== diffOrder[b.difficulty]) {
        return diffOrder[a.difficulty] - diffOrder[b.difficulty];
      }
      if (a.moves !== b.moves) {
        return a.moves - b.moves;
      }
      return a.time - b.time;
    });

    // vyberem 10 nejlepších
    let top10 = sorted.slice(0, 10);

    let diffLabels = { easy: 'L', hard: 'T' };

    // vykreslení pomocí textContent
    top10.forEach(function (s) {
      let itemDiv = document.createElement('div');
      itemDiv.className = 'score-item';

      let nameSpan = document.createElement('span');
      let label = diffLabels[s.difficulty] || s.difficulty;
      nameSpan.textContent = s.player + ' (' + label + ')';

      let statsSpan = document.createElement('span');
      statsSpan.textContent = Timer.formatTime(s.time) + ' / ' + s.moves + ' tahů';

      itemDiv.appendChild(nameSpan);
      itemDiv.appendChild(statsSpan);

      scoresList.appendChild(itemDiv);
    });
  }


  // tlačítka na konci
  // změt menu
  winModal.addEventListener('gotomenu', function () {
    showMenu();
    history.pushState({ screen: 'menu' }, '', '#menu');
  });

  // počíteční stav history API
  history.replaceState({ screen: 'menu' }, '', '#menu');

  // reakce na změnu stavu
  window.addEventListener('popstate', function (e) {
    let state = e.state;

    if (!state) {
      showMenu();
      return;
    }

    if (state.screen === 'menu') {
      game.timer.stop();
      winModal.hide();
      showMenu();

    } else if (state.screen === 'game' || state.screen === 'win') {
      showGame();

    }
  });



  // Offline aplka, díky preloadu se načtou obrázky předem a proto appka může fungovat
  function updateOnlineStatus() {
    if (!navigator.onLine) {
      offlineBanner.classList.remove('hidden');
    } else {
      offlineBanner.classList.add('hidden');
    }
  }

  updateOnlineStatus();

  window.addEventListener('online',  updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);

  // volume slider reakce na změnu
  volumeSlider.addEventListener('input', function () {
    let vol = parseInt(this.value, 10);
    volumeOutput.textContent = vol + '%';
    PexesoSounds.setVolume(vol);
    PexesoStorage.saveVolume(vol);
  });

});
