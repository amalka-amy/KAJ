/**
 * Webová komponenta <win-modal>
 * ==============================================
 * Vlastní HTML element registrovaný pomocí Custom Elements API.
 * Zobrazí modální okno s výsledky po skončení hry.
 */


class WinModal extends HTMLElement {
  constructor() {
    super();
    this._result = null;
  }

  show(result) {
    this._result = result;
    this.removeAttribute('hidden');
    this._render();
  }

  hide() {
    this.setAttribute('hidden', '');
    this.innerHTML = '';
  }

  _render() {
    let r = this._result;
    let timeStr  = Timer.formatTime(r.time);
    let diffLabels = { easy: 'Lehká', medium: 'Střední', hard: 'Těžká' };
    let diffLabel  = diffLabels[r.difficulty] || r.difficulty;

    let scores   = PexesoStorage.getScores(r.difficulty);
    let isRecord = scores.length === 1 ||
        (scores.length > 1 && scores[0].time === r.time && scores[0].moves === r.moves);

    this.innerHTML = `
      <div class="modal-overlay" role="dialog" aria-modal="true"
           aria-label="Výsledky hry">
        <div class="modal-box">

          ${isRecord ? '<span class="new-record-badge">Nový rekord!</span>' : ''}

          <h2>Výborně, <span id="modal-player-name"></span>!</h2>
          <p style="color: var(--color-text-muted); margin-bottom: 0.5rem;">
            Obtížnost: <strong>${diffLabel}</strong>
          </p>

          <dl class="win-stats">
            <dt>ČAS</dt>
            <dd>${timeStr}</dd>
            <dt>TAHY</dt>
            <dd>${r.moves}</dd>
          </dl>

            <button class="btn btn-secondary" id="modal-btn-menu">
              ← Menu
            </button>
    
        </div>
      </div>
    `;

    this.querySelector('#modal-player-name').textContent = r.player;

    let self = this;
    this.querySelector('#modal-btn-menu').addEventListener('click', function () {
      PexesoSounds.playClick();
      self.hide();
      self.dispatchEvent(new CustomEvent('gotomenu', { bubbles: true }));
    });

    let firstBtn = this.querySelector('#modal-btn-again');
    if (firstBtn) firstBtn.focus();
  }
}
customElements.define('win-modal', WinModal);