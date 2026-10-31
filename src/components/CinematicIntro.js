/**
 * Cinematic Intro Animation Component
 */
import { portalState } from '../portalState.js';
import { portalSound } from '../services/soundManager.js';

export class CinematicIntro {
  mount(container) {
    container.innerHTML = `
      <div class="screen-container" style="text-align: center; max-width: 850px; margin: 0 auto;">
        <div style="margin-bottom: 1.5rem;">
          <span class="portal-badge" style="font-size: 0.9rem; padding: 0.5rem 1.2rem;">
            CLUB BATTLE: TECHVERSE ’26
          </span>
        </div>

        <h1 style="font-family: var(--font-display); font-size: 3.2rem; font-weight: 900; letter-spacing: 2px; line-height: 1.15; margin-bottom: 1.5rem; text-shadow: 0 0 30px rgba(0, 243, 255, 0.45);">
          THE DEVOPS <span style="background: linear-gradient(120deg, var(--neon-cyan), var(--neon-purple)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">TRI-ATHLON</span>
        </h1>

        <p style="font-size: 1.2rem; color: var(--text-dim); max-width: 650px; margin: 0 auto 2.5rem; line-height: 1.6;">
          Three production-grade DevOps gauntlets. One shared Supabase tournament database.
          Test your SRE micro-reactions, CI/CD pipeline memory, and rapid incident triage.
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.2rem; margin-bottom: 3rem; text-align: left;">
          <div class="glass-panel" style="padding: 1.4rem; border-color: rgba(0, 243, 255, 0.25);">
            <div style="font-family: var(--font-display); color: var(--neon-cyan); font-size: 0.85rem; margin-bottom: 0.4rem;">ROUND 01</div>
            <h3 style="font-size: 1.15rem; margin-bottom: 0.4rem;">Server Sniper</h3>
            <p style="font-size: 0.85rem; color: var(--text-dim);">6×6 Kubernetes Pod Arena with live traffic spikes & Chaos Monkey.</p>
          </div>

          <div class="glass-panel" style="padding: 1.4rem; border-color: rgba(168, 85, 247, 0.25);">
            <div style="font-family: var(--font-display); color: var(--neon-purple); font-size: 0.85rem; margin-bottom: 0.4rem;">ROUND 02</div>
            <h3 style="font-size: 1.15rem; margin-bottom: 0.4rem;">Pipeline Recall</h3>
            <p style="font-size: 0.85rem; color: var(--text-dim);">Memorize and reconstruct complex automated CI/CD deployment tracks.</p>
          </div>

          <div class="glass-panel" style="padding: 1.4rem; border-color: rgba(16, 185, 129, 0.25);">
            <div style="font-family: var(--font-display); color: var(--neon-green); font-size: 0.85rem; margin-bottom: 0.4rem;">ROUND 03</div>
            <h3 style="font-size: 1.15rem; margin-bottom: 0.4rem;">SwipeOps</h3>
            <p style="font-size: 0.85rem; color: var(--text-dim);">High-tempo Tinder-style production outage decision deck.</p>
          </div>
        </div>

        <div style="display: flex; justify-content: center; gap: 1.2rem;">
          <button id="btn-enter-arena" class="btn-cyber btn-primary-cyan" style="font-size: 1.1rem; padding: 0.9rem 2.5rem;">
            INITIALIZE OPERATOR TERMINAL ⚡
          </button>
        </div>
      </div>
    `;

    portalSound.playIntroBoot();

    const enterBtn = container.querySelector('#btn-enter-arena');
    if (enterBtn) {
      enterBtn.addEventListener('click', () => {
        if (portalState.participant) {
          portalState.goToScreen('briefing');
        } else {
          portalState.goToScreen('registration');
        }
      });
    }
  }
}
