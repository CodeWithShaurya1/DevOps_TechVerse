/**
 * TECHVERSE ’26 — Operator Selection & Identity Modal
 * Allows updating or setting the operator callsign.
 * Adheres to tournament integrity: protects locked official attempt records.
 */

import { portalState } from '../portalState.js';
import { portalSound } from '../services/soundManager.js';

export class OperatorSelectModal {
  constructor({ onSave, onClose } = {}) {
    this.onSave = onSave;
    this.onClose = onClose;
    this.container = null;
    this.keydownHandler = null;
  }

  mount(parent = document.body) {
    const currentName = portalState.getEffectiveOperatorName();
    const isRegistered = !!portalState.participant;
    const hasStarted = portalState.hasStartedOfficialPlay();

    this.container = document.createElement('div');
    this.container.className = 'portal-modal-backdrop';
    this.container.id = 'operator-modal-root';

    this.container.innerHTML = `
      <div class="portal-modal-card operator-modal-card" style="max-width: 520px;" role="dialog" aria-modal="true" aria-labelledby="op-modal-title">
        <button class="modal-close-btn" id="btn-op-close" aria-label="Close modal">✕</button>

        <span class="portal-badge" style="font-size: 0.72rem; margin-bottom: 0.6rem; display: inline-block;">
          OPERATOR CALLSIGN ASSIGNMENT
        </span>

        <h2 id="op-modal-title" style="font-family: var(--font-display); font-size: 1.8rem; font-weight: 900; letter-spacing: 1px; color: #fff; margin-bottom: 0.4rem;">
          OPERATOR IDENTITY
        </h2>

        <div style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-dim); margin-bottom: 1.6rem; display: flex; align-items: center; gap: 0.5rem;">
          <span>STATUS:</span>
          <span style="color: ${isRegistered ? 'var(--neon-emerald)' : 'var(--neon-cyan)'}; font-weight: 700;">
            ${isRegistered ? `AUTHENTICATED PARTICIPANT (${portalState.participant.enrollment_number_normalized})` : 'GUEST / PRE-AUTHENTICATION CALLSIGN'}
          </span>
        </div>

        <form id="op-form" autocomplete="off">
          <div style="margin-bottom: 1.4rem;">
            <label class="input-label" for="op-name-input">
              OPERATOR CALLSIGN / DISPLAY NAME
            </label>
            <input 
              type="text" 
              id="op-name-input" 
              class="futuristic-input" 
              value="${this.escapeHtml(currentName === 'UNASSIGNED' ? '' : currentName)}" 
              placeholder="ENTER CALLSIGN" 
              maxlength="50" 
              required
              autofocus
            />
            <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted); margin-top: 0.4rem;">
              Min 2 characters. Displays on tactical HUD, briefing screens, and scorecard.
            </div>
          </div>

          ${hasStarted ? `
            <div style="margin-bottom: 1.4rem; padding: 0.9rem; background: rgba(245, 158, 11, 0.12); border: 1px solid var(--neon-amber); border-radius: 12px;">
              <div style="font-family: var(--font-display); font-size: 0.78rem; font-weight: 800; color: var(--neon-amber); letter-spacing: 1px; margin-bottom: 0.3rem;">
                ⚠️ ACTIVE TOURNAMENT INTEGRITY LOCK
              </div>
              <p style="font-size: 0.82rem; color: #fef08a; line-height: 1.4; margin-bottom: 0.8rem; font-family: var(--font-ui);">
                Official attempt records are locked to this participant. Identity changes mid-tournament require Tournament Admin Authorization.
              </p>
              <label class="input-label" for="op-admin-pass" style="color: var(--neon-amber);">ADMIN AUTHORIZATION PASSPHRASE</label>
              <input 
                type="password" 
                id="op-admin-pass" 
                class="futuristic-input" 
                placeholder="ENTER ADMIN KEY" 
                style="border-color: var(--neon-amber);"
              />
            </div>
          ` : ''}

          <div id="op-error-msg" style="display: none; padding: 0.75rem 1rem; background: rgba(239, 68, 68, 0.15); border: 1px solid var(--neon-crimson); border-radius: 10px; color: var(--neon-crimson); font-size: 0.82rem; font-family: var(--font-mono); margin-bottom: 1.4rem;"></div>

          <div style="display: flex; gap: 0.9rem; justify-content: flex-end; margin-top: 1.6rem;">
            <button type="button" id="btn-op-cancel" class="btn-subtle">
              CANCEL
            </button>
            <button type="submit" id="btn-op-save" class="btn-primary-gradient" style="padding: 0.65rem 1.6rem;">
              SAVE CHANGES
            </button>
          </div>
        </form>
      </div>
    `;

    parent.appendChild(this.container);
    portalSound.playClick();

    const input = this.container.querySelector('#op-name-input');
    if (input) {
      setTimeout(() => input.focus(), 50);
    }

    this.attachEvents();
  }

  attachEvents() {
    const closeBtn = this.container.querySelector('#btn-op-close');
    const cancelBtn = this.container.querySelector('#btn-op-cancel');
    const form = this.container.querySelector('#op-form');
    const nameInput = this.container.querySelector('#op-name-input');
    const adminPassInput = this.container.querySelector('#op-admin-pass');
    const errorMsg = this.container.querySelector('#op-error-msg');
    const saveBtn = this.container.querySelector('#btn-op-save');

    const handleClose = () => {
      portalSound.playClick();
      this.close();
    };

    closeBtn?.addEventListener('click', handleClose);
    cancelBtn?.addEventListener('click', handleClose);

    // Click outside modal
    this.container.addEventListener('click', (e) => {
      if (e.target === this.container) {
        handleClose();
      }
    });

    // Keyboard navigation (Escape to close)
    this.keydownHandler = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', this.keydownHandler);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorMsg.style.display = 'none';

      const raw = (nameInput.value || '').trim();
      if (!raw || raw.length < 2) {
        errorMsg.textContent = 'Operator name must contain at least 2 characters.';
        errorMsg.style.display = 'block';
        portalSound.playError();
        return;
      }

      const adminPass = adminPassInput ? adminPassInput.value.trim() : null;

      saveBtn.disabled = true;
      saveBtn.textContent = 'UPDATING...';

      try {
        await portalState.updateOperatorName(raw, adminPass);
        portalSound.playSuccess();
        if (typeof this.onSave === 'function') {
          this.onSave(raw);
        }
        this.close();
      } catch (err) {
        saveBtn.disabled = false;
        saveBtn.textContent = 'SAVE CHANGES ⚡';
        errorMsg.textContent = err.message || 'Failed to update operator identity.';
        errorMsg.style.display = 'block';
        portalSound.playError();
      }
    });
  }

  close() {
    if (this.keydownHandler) {
      window.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = null;
    }
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
      this.container = null;
    }
    if (typeof this.onClose === 'function') {
      this.onClose();
    }
  }

  escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
