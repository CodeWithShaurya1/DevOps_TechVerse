/**
 * Screen 2 — Operator Registration Component
 * Clean, cinematic, high-quality futuristic interface following reference design.
 * Order: 1. FULL NAME, 2. ENROLLMENT NUMBER
 * Uppercase normalization on input/paste & validation.
 * Direct progression into Round 1 with optional Mission Rules modal.
 */
import { portalState } from '../portalState.js';
import { supabaseService } from '../services/supabaseClient.js';
import { portalSound } from '../services/soundManager.js';
import { EventBriefingModal } from './EventBriefingModal.js';

export class RegistrationScreen {
  mount(container) {
    const existingParticipant = portalState.participant;
    const initialName = existingParticipant?.full_name || '';
    const initialEnrollment = existingParticipant?.enrollment_number_normalized || '';

    container.innerHTML = `
      <div class="screen-container" style="max-width: 540px; margin: 0 auto; width: 100%; padding: clamp(1rem, 3vh, 2rem) 1rem;">
        <div class="registration-form-card">
          <!-- Card Header -->
          <div class="reg-form-header">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
              <span class="portal-badge" style="font-size: 0.72rem; padding: 0.25rem 0.75rem;">
                CREDENTIAL ACCESS
              </span>
              <button type="button" id="reg-rules-btn" class="btn-subtle" title="View official tournament rules">
                📖 VIEW RULES
              </button>
            </div>
            <h2 class="reg-form-title">
              OPERATOR REGISTRATION
            </h2>
            <p class="reg-form-subtitle">
              Enter your credentials to authorize all three tournament challenges.
            </p>
          </div>

          <form id="registration-form" autocomplete="off" novalidate>
            <!-- 1. Full Name (FIRST FIELD) -->
            <div class="form-field-group">
              <label class="form-field-label" for="reg-fullname">
                FULL NAME
              </label>
              <input 
                type="text" 
                id="reg-fullname" 
                class="futuristic-input" 
                value="${this.escapeHtml(initialName)}"
                placeholder="ENTER YOUR FULL NAME" 
                maxlength="50" 
                required 
                autofocus
                spellcheck="false"
              />
            </div>

            <!-- 2. Enrollment Number (SECOND FIELD) -->
            <div class="form-field-group">
              <label class="form-field-label" for="reg-enrollment">
                ENROLLMENT NUMBER
              </label>
              <input 
                type="text" 
                id="reg-enrollment" 
                class="futuristic-input" 
                value="${this.escapeHtml(initialEnrollment)}"
                placeholder="ENTER YOUR ENROLLMENT NUMBER" 
                maxlength="30" 
                required 
                spellcheck="false"
              />
            </div>

            <!-- Error Banner -->
            <div id="reg-error-msg" class="reg-error-box" style="display: none;"></div>

            <!-- Primary Action Button -->
            <div style="margin-top: clamp(1.4rem, 2.8vh, 2rem);">
              <button type="submit" id="reg-submit-btn" class="btn-primary-gradient" style="width: 100%;">
                CONTINUE TO GAME →
              </button>
            </div>

            <!-- Back Link -->
            <div style="text-align: center; margin-top: 1rem;">
              <button type="button" id="reg-back-btn" class="btn-text-nav">
                ← BACK TO INTRO
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    const form = container.querySelector('#registration-form');
    const nameInput = container.querySelector('#reg-fullname');
    const enrollInput = container.querySelector('#reg-enrollment');
    const errorMsg = container.querySelector('#reg-error-msg');
    const submitBtn = container.querySelector('#reg-submit-btn');
    const backBtn = container.querySelector('#reg-back-btn');
    const rulesBtn = container.querySelector('#reg-rules-btn');

    // Immediate uppercase conversion on input and paste
    const handleUppercaseInput = (inputEl) => {
      inputEl.addEventListener('input', () => {
        const start = inputEl.selectionStart;
        const end = inputEl.selectionEnd;
        inputEl.value = inputEl.value.toUpperCase();
        if (start !== null && end !== null) {
          inputEl.setSelectionRange(start, end);
        }
      });
      inputEl.addEventListener('paste', (e) => {
        setTimeout(() => {
          inputEl.value = inputEl.value.toUpperCase();
        }, 0);
      });
    };

    handleUppercaseInput(nameInput);
    handleUppercaseInput(enrollInput);

    rulesBtn?.addEventListener('click', () => {
      new EventBriefingModal().mount(document.body);
    });

    backBtn?.addEventListener('click', () => {
      portalState.goToScreen('cinematic_intro');
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorMsg.style.display = 'none';

      // JavaScript normalization: Trim and uppercase
      const rawName = nameInput.value.trim().toUpperCase();
      const rawEnroll = enrollInput.value.trim().toUpperCase();

      if (!rawName || rawName.length < 2) {
        errorMsg.textContent = 'Please enter your Full Name (minimum 2 characters).';
        errorMsg.style.display = 'block';
        nameInput.focus();
        portalSound.playError();
        return;
      }

      if (!rawEnroll || rawEnroll.length < 3) {
        errorMsg.textContent = 'Please enter a valid Enrollment Number (minimum 3 characters).';
        errorMsg.style.display = 'block';
        enrollInput.focus();
        portalSound.playError();
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'AUTHENTICATING LEDGER...';

      try {
        const { participant } = await supabaseService.registerOrGetParticipant(rawName, rawEnroll);
        
        portalState.setParticipant(participant);
        portalSound.playSuccess();
        
        // Direct progression into Round 1
        portalState.goToScreen('round1_intro');
      } catch (err) {
        errorMsg.textContent = err.message || 'Authentication error. Verify database network status.';
        errorMsg.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'CONTINUE TO GAME →';
        portalSound.playError();
      }
    });
  }

  escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
