/**
 * Challenge Locked Modal with Admin Replay Key Authorization
 */
import { portalState } from '../portalState.js';
import { supabaseService, ADMIN_PASSPHRASE } from '../services/supabaseClient.js';
import { portalSound } from '../services/soundManager.js';

export class ChallengeLockedModal {
  constructor({ roundNumber, officialAttempt, onReplayAuthorized, onClose }) {
    this.roundNumber = roundNumber;
    this.officialAttempt = officialAttempt;
    this.onReplayAuthorized = onReplayAuthorized;
    this.onClose = onClose;
  }

  mount(container) {
    const modalEl = document.createElement('div');
    modalEl.className = 'portal-modal-backdrop';
    modalEl.innerHTML = `
      <div class="portal-modal-card" style="border-color: var(--neon-red);">
        <button class="modal-close-btn" id="modal-close">✕</button>

        <div style="text-align: center; margin-bottom: 1.5rem;">
          <span class="portal-badge" style="border-color: var(--neon-red); color: var(--neon-red); box-shadow: 0 0 10px rgba(239, 68, 68, 0.3);">
            ACCESS RESTRICTED
          </span>
          <h2 style="font-family: var(--font-display); font-size: 1.8rem; color: var(--neon-red); margin-top: 0.6rem;">
            CHALLENGE LOCKED
          </h2>
          <p style="font-size: 0.95rem; color: var(--text-dim); margin-top: 0.5rem; line-height: 1.5;">
            Your official attempt for <strong>Round ${this.roundNumber}</strong> has already been completed.
          </p>
        </div>

        <!-- Official Attempt Ledger -->
        <div style="background: rgba(8, 14, 26, 0.8); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: var(--radius-sm); padding: 1rem; margin-bottom: 1.5rem; font-family: var(--font-mono); font-size: 0.85rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
            <span style="color: var(--text-dim);">Official Score:</span>
            <strong style="color: var(--neon-cyan);">${(this.officialAttempt?.score || 0).toLocaleString()} PTS</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
            <span style="color: var(--text-dim);">Duration:</span>
            <span>${portalState.formatMs(this.officialAttempt?.completion_time_ms)}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-dim);">Best Streak:</span>
            <span style="color: var(--neon-amber);">${this.officialAttempt?.best_streak || 0}</span>
          </div>
        </div>

        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.2rem;">
          Contact the event administrator if you need an authorized practice replay.
          Practice replays do not overwrite official results.
        </p>

        <!-- Admin Passphrase Form -->
        <form id="admin-auth-form" autocomplete="off">
          <div style="margin-bottom: 1.2rem;">
            <label class="input-label" for="admin-key-input">ADMINISTRATOR AUTHORIZATION KEY</label>
            <input 
              type="password" 
              id="admin-key-input" 
              class="cyber-input" 
              placeholder="ENTER ADMIN PASSPHRASE" 
              required
            />
          </div>

          <div id="admin-auth-error" style="display: none; padding: 0.7rem; background: rgba(239, 68, 68, 0.15); border: 1px solid var(--neon-red); border-radius: var(--radius-sm); color: var(--neon-red); font-size: 0.8rem; font-family: var(--font-mono); margin-bottom: 1.2rem;"></div>

          <div style="display: flex; gap: 0.8rem;">
            <button type="button" id="btn-cancel-lock" class="btn-cyber" style="flex: 1; justify-content: center;">
              VIEW LEADERBOARD
            </button>
            <button type="submit" id="btn-grant-replay" class="btn-cyber btn-primary-cyan" style="flex: 1; justify-content: center;">
              AUTHORIZE REPLAY ⚡
            </button>
          </div>
        </form>
      </div>
    `;

    container.appendChild(modalEl);
    portalSound.playError();

    const closeBtn = modalEl.querySelector('#modal-close');
    const cancelBtn = modalEl.querySelector('#btn-cancel-lock');
    const authForm = modalEl.querySelector('#admin-auth-form');
    const keyInput = modalEl.querySelector('#admin-key-input');
    const errorMsg = modalEl.querySelector('#admin-auth-error');

    const closeModal = () => {
      modalEl.remove();
      if (this.onClose) this.onClose();
    };

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', () => {
      closeModal();
      portalState.goToScreen('leaderboard');
    });

    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorMsg.style.display = 'none';

      const key = keyInput.value.trim();
      const res = await supabaseService.authorizePracticeReplay(
        portalState.participant.id,
        this.roundNumber,
        key,
        `Admin authorized replay for Round ${this.roundNumber}`
      );

      if (res.success) {
        portalSound.playSuccess();
        modalEl.remove();
        if (this.onReplayAuthorized) this.onReplayAuthorized();
      } else {
        errorMsg.textContent = res.error || 'Invalid administrator key.';
        errorMsg.style.display = 'block';
        portalSound.playError();
      }
    });
  }
}
