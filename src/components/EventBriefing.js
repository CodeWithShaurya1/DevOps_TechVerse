/**
 * Event Briefing & Tournament Instructions Screen
 */
import { portalState } from '../portalState.js';

export class EventBriefing {
  mount(container) {
    const participant = portalState.participant;
    const operatorName = participant ? participant.full_name : 'OPERATOR';

    container.innerHTML = `
      <div class="screen-container" style="max-width: 860px; margin: 0 auto;">
        <div class="portal-stepper">
          <div class="step-item completed">
            <span class="step-num">00</span>
            <span class="step-title">Identity</span>
          </div>
          <div class="step-item active">
            <span class="step-num">01</span>
            <span class="step-title">Briefing</span>
          </div>
          <div class="step-item">
            <span class="step-num">02</span>
            <span class="step-title">Round 1</span>
          </div>
          <div class="step-item">
            <span class="step-num">03</span>
            <span class="step-title">Round 2</span>
          </div>
          <div class="step-item">
            <span class="step-num">04</span>
            <span class="step-title">Round 3</span>
          </div>
        </div>

        <div class="glass-panel" style="width: 100%;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
            <div>
              <span class="portal-badge">MISSION BRIEFING</span>
              <h2 style="font-family: var(--font-display); font-size: 1.9rem; margin-top: 0.4rem;">
                TECHVERSE ’26 TOURNAMENT RULES
              </h2>
            </div>
            <div class="operator-badge">
              <span>PILOT:</span>
              <strong>${this.escapeHtml(operatorName)}</strong>
            </div>
          </div>

          <p style="font-size: 1rem; color: var(--text-dim); margin-bottom: 2rem; line-height: 1.6;">
            Welcome to the official DevOps Tri-athlon. You will navigate three high-stakes operational arenas.
            Each round is an official timed challenge recorded in the unified Supabase ledger.
          </p>

          <!-- The 3 Rounds -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.2rem; margin-bottom: 2.2rem;">
            <div style="background: rgba(8, 14, 26, 0.7); border: 1px solid rgba(0, 243, 255, 0.3); border-radius: var(--radius-md); padding: 1.2rem;">
              <div style="color: var(--neon-cyan); font-family: var(--font-display); font-size: 0.8rem; margin-bottom: 0.3rem;">STAGE 1</div>
              <h4 style="font-size: 1.05rem; margin-bottom: 0.4rem;">Server Sniper</h4>
              <p style="font-size: 0.84rem; color: var(--text-dim); line-height: 1.5;">
                Keep cluster health > 0% for 60s. Remediate CPU spikes, reboot crash loops, and trigger the Autoscaler.
              </p>
            </div>

            <div style="background: rgba(8, 14, 26, 0.7); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: var(--radius-md); padding: 1.2rem;">
              <div style="color: var(--neon-purple); font-family: var(--font-display); font-size: 0.8rem; margin-bottom: 0.3rem;">STAGE 2</div>
              <h4 style="font-size: 1.05rem; margin-bottom: 0.4rem;">Pipeline Recall</h4>
              <p style="font-size: 0.84rem; color: var(--text-dim); line-height: 1.5;">
                Memorize the verified CI/CD sequence. Reconstruct it via drag-and-drop while filtering out dangerous decoy stages.
              </p>
            </div>

            <div style="background: rgba(8, 14, 26, 0.7); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: var(--radius-md); padding: 1.2rem;">
              <div style="color: var(--neon-green); font-family: var(--font-display); font-size: 0.8rem; margin-bottom: 0.3rem;">STAGE 3</div>
              <h4 style="font-size: 1.05rem; margin-bottom: 0.4rem;">SwipeOps</h4>
              <p style="font-size: 0.84rem; color: var(--text-dim); line-height: 1.5;">
                45s production triage deck. Swipe left to mitigate/reject or swipe right to deploy/apply hotfixes.
              </p>
            </div>
          </div>

          <!-- Official Scoring Formula -->
          <div style="background: rgba(14, 22, 41, 0.8); border: 1px solid var(--portal-border); border-radius: var(--radius-md); padding: 1.4rem; margin-bottom: 2rem;">
            <h4 style="font-family: var(--font-display); font-size: 0.95rem; color: var(--neon-cyan); margin-bottom: 0.8rem; text-transform: uppercase;">
              🏆 Official Ranking Protocol
            </h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; font-family: var(--font-mono); font-size: 0.85rem;">
              <div>
                <span style="color: var(--neon-cyan); font-weight: 700;">Priority 1:</span>
                <div>Average Score (R1+R2+R3)/3</div>
              </div>
              <div>
                <span style="color: var(--neon-green); font-weight: 700;">Priority 2:</span>
                <div>Total Completion Time (R1+R2+R3)</div>
              </div>
              <div>
                <span style="color: var(--neon-purple); font-weight: 700;">Priority 3:</span>
                <div>Combined Streaks (Sum of best combos)</div>
              </div>
              <div>
                <span style="color: var(--neon-amber); font-weight: 700;">Priority 4:</span>
                <div>Earlier Completion Timestamp</div>
              </div>
            </div>
            <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.8rem; font-family: var(--font-mono);">
              ⏱️ Round timers run strictly during active gameplay. Time spent reading briefings or on countdown screens is excluded.
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 1rem;">
            <button id="btn-start-triathlon" class="btn-cyber btn-primary-cyan" style="padding: 0.85rem 2.2rem; font-size: 1rem;">
              PROCEED TO ROUND 1: SERVER SNIPER ➔
            </button>
          </div>
        </div>
      </div>
    `;

    const startBtn = container.querySelector('#btn-start-triathlon');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        portalState.goToScreen('round1_intro');
      });
    }
  }

  escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
