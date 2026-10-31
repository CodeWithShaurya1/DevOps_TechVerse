/**
 * Participant Registration Screen Component
 */
import { portalState } from '../portalState.js';
import { supabaseService } from '../services/supabaseClient.js';
import { portalSound } from '../services/soundManager.js';

export class RegistrationScreen {
  mount(container) {
    container.innerHTML = `
      <div class="screen-container" style="max-width: 540px; margin: 0 auto;">
        <div class="glass-panel" style="width: 100%;">
          <div style="text-align: center; margin-bottom: 2rem;">
            <span class="portal-badge" style="margin-bottom: 0.8rem; display: inline-block;">COMPETITOR ACCESS CONTROL</span>
            <h2 style="font-family: var(--font-display); font-size: 1.8rem; letter-spacing: 1px;">
              PARTICIPANT REGISTRATION
            </h2>
            <p style="font-size: 0.88rem; color: var(--text-dim); margin-top: 0.5rem;">
              Register once. Your unique ID will authorize all three official challenge rounds.
            </p>
          </div>

          <form id="registration-form" autocomplete="off">
            <div style="margin-bottom: 1.5rem;">
              <label class="input-label" for="reg-fullname">FULL OPERATOR NAME *</label>
              <input 
                type="text" 
                id="reg-fullname" 
                class="cyber-input" 
                placeholder="e.g. SHAURYA BANSAL" 
                maxlength="50" 
                required 
                autofocus
              />
            </div>

            <div style="margin-bottom: 2rem;">
              <label class="input-label" for="reg-enrollment">ENROLLMENT NUMBER *</label>
              <input 
                type="text" 
                id="reg-enrollment" 
                class="cyber-input" 
                placeholder="e.g. 23CS001" 
                maxlength="30" 
                required
              />
              <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.4rem; font-family: var(--font-mono);">
                🔒 Protected identity. Enrollment is never displayed on the public leaderboard.
              </div>
            </div>

            <div id="reg-error-msg" style="display: none; padding: 0.8rem 1rem; background: rgba(239, 68, 68, 0.15); border: 1px solid var(--neon-red); border-radius: var(--radius-sm); color: var(--neon-red); font-size: 0.85rem; font-family: var(--font-mono); margin-bottom: 1.5rem;"></div>

            <button type="submit" id="reg-submit-btn" class="btn-cyber btn-primary-cyan" style="width: 100%; justify-content: center; padding: 0.85rem; font-size: 1rem;">
              AUTHORIZE ACCESS & PROCEED ⚡
            </button>
          </form>
        </div>
      </div>
    `;

    const form = container.querySelector('#registration-form');
    const nameInput = container.querySelector('#reg-fullname');
    const enrollInput = container.querySelector('#reg-enrollment');
    const errorMsg = container.querySelector('#reg-error-msg');
    const submitBtn = container.querySelector('#reg-submit-btn');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorMsg.style.display = 'none';

      const rawName = nameInput.value.trim();
      const rawEnroll = enrollInput.value.trim();

      if (!rawName || rawName.length < 2) {
        errorMsg.textContent = 'Please enter your valid Full Name (min 2 chars).';
        errorMsg.style.display = 'block';
        portalSound.playError();
        return;
      }

      if (!rawEnroll || rawEnroll.length < 3) {
        errorMsg.textContent = 'Please enter your valid Enrollment Number (min 3 chars).';
        errorMsg.style.display = 'block';
        portalSound.playError();
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'AUTHENTICATING SUPABASE...';

      try {
        const { participant, isNew } = await supabaseService.registerOrGetParticipant(rawName, rawEnroll);
        portalState.setParticipant(participant);

        portalSound.playSuccess();
        portalState.goToScreen('briefing');
      } catch (err) {
        errorMsg.textContent = err.message || 'Registration failed. Check connection.';
        errorMsg.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'AUTHORIZE ACCESS & PROCEED ⚡';
        portalSound.playError();
      }
    });
  }
}
