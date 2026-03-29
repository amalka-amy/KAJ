/**
 * win-modal.js – Webová komponenta <win-modal>
 * ==============================================
 * Vlastní HTML element registrovaný pomocí Custom Elements API.
 * Zobrazí modální okno s výsledky po skončení hry.
 *
 * Použití v HTML:
 *   <win-modal id="win-modal" hidden></win-modal>
 *
 * Volání z JS:
 *   document.getElementById('win-modal').show(resultObject);
 *
 * Web Components API:
 *   - customElements.define()
 *   - HTMLElement extend
 *   - connectedCallback, attributeChangedCallback
 */

class WinModal extends HTMLElement {
  constructor() {
    super();
    this._result = null;
  }

  /**
   * Zobrazí modální okno s výsledkem.
   * @param {Object} result - { player, difficulty, time, moves, date }
   */
  show(result) {
    this._result = result;
    this.removeAttribute('hidden');
    this._render();
  }

  /** Skryje modální okno. */
  hide() {
    this.setAttribute('hidden', '');
    this.innerHTML = '';
  }

  /**
   * Vykreslí HTML obsah modálního okna.
   * (Místo Shadow DOM používáme Light DOM – snazší stylování)
   */
  _render() {
    let r = this._result;
    let timeStr  = Timer.formatTime(r.time);
    let diffLabels = { easy: 'Lehká', medium: 'Střední', hard: 'Těžká' };
    let diffLabel  = diffLabels[r.difficulty] || r.difficulty;

    // Zkontrolujeme, zda je to nový rekord (pokud je jeden anebo pokud splnuje podmínky)
    let scores   = PexesoStorage.getScores(r.difficulty);
    let isRecord = scores.length === 1 ||
                   (scores.length > 0 && scores[0].time === r.time && scores[0].moves === r.moves);

    this.innerHTML = `
      <div class="modal-overlay" role="dialog" aria-modal="true"
           aria-label="Výsledky hry">
        <div class="modal-box">
          <span class="win-trophy" aria-hidden="true">🏆</span>

          ${isRecord ? '<span class="new-record-badge">✦ Nový rekord! ✦</span>' : ''}

          <h2>Výborně, ${this._escapeHtml(r.player)}!</h2>
          <p style="color: var(--color-text-muted); margin-bottom: 0.5rem;">
            Obtížnost: <strong>${diffLabel}</strong>
          </p>

          <dl class="win-stats">
            <dt>Čas</dt>
            <dd>${timeStr}</dd>
            <dt>Tahy</dt>
            <dd>${r.moves}</dd>
          </dl>

          <div class="modal-actions">
            <button class="btn btn-primary" id="modal-btn-again">
              ↺ Hrát znovu
            </button>
            <button class="btn btn-secondary" id="modal-btn-menu">
              ← Menu
            </button>
          </div>
        </div>
      </div>
    `;

    // Přidáme posluchače tlačítek
    let self = this;
    this.querySelector('#modal-btn-again').addEventListener('click', function () {
      PexesoSounds.playClick();
      self.hide();
      // Signalizujeme aplikaci přes custom event
      self.dispatchEvent(new CustomEvent('restart', { bubbles: true }));
    });
    this.querySelector('#modal-btn-menu').addEventListener('click', function () {
      PexesoSounds.playClick();
      self.hide();
      self.dispatchEvent(new CustomEvent('gotomenu', { bubbles: true }));
    });

    // Fokus na první tlačítko (přístupnost)
    let firstBtn = this.querySelector('#modal-btn-again');
    if (firstBtn) firstBtn.focus();
  }

  /**
   * Escapuje HTML znaky v textu (prevence XSS).
   * @param {string} str
   * @returns {string}
   */
  _escapeHtml(str) {
    let div = document.createElement('div');
    div.appendChild(document.createTextNode(String(str)));
    return div.innerHTML;
  }
}

// Registrace vlastního elementu <win-modal>
customElements.define('win-modal', WinModal);
