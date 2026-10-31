/**
 * Screen 3 — Mission Briefing Component
 * Tactical tournament dispatch center with official 4-tier ranking rules,
 * stage breakdown, and isolated timer disclosure.
 */
import { portalState } from '../portalState.js';

export class EventBriefing {
  mount(container) {
    const participant = portalState.participant;
    const operatorName = participant ? participant.full_name : 'OPERATOR';

    container.innerHTML = `
      <div class="screen-container" style="max-width: 960px; margin: 0 auto; width: 100%;">
        <!-- Stepper Timeline -->
        <div class="portal-stepper">
          <div class="step-item completed">
            <span class="step-num">00</span>
            <span class="step-title">Biometrics</span>
          </div>
          <div class="step-item active">
            <span class="step-num">01</span>
            <span class="step-title">Briefing</span>
          </div>
          <div class="step-item">
            <span class="step-num">02</span>
            <span class="step-title">Stage 1</span>
          </div>
          <div class="step-item">
            <span class="step-num">03</span>
            <span class="step-title">Stage 2</span>
          </div>
          <div class="step-item">
            <span class="step-num">04</span>
            <span class="step-title">Stage 3</span>
          </div>
        </div>

        <div class="glass-panel" style="width: 100%;">
          <!-- Header Area -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; border-bottom: 1px solid rgba(0, 243, 255, 0.18); padding-bottom: 1.2rem;">
            <div>
              <span class="portal-badge">TACTICAL DISPATCH // MISSION RULES</span>
              <h2 style="font-family: var(--font-display); font-size: 2.2rem; font-weight: 900; margin-top: 0.5rem; letter-spacing: 1px; color: #fff;">
                TOURNAMENT ENGAGEMENT PROTOCOL
              </h2>
            </div>
            <div class="operator-badge">
              <span class="status-pulse"></span>
              <span>OPERATOR:</span>
              <strong>${this.escapeHtml(operatorName)}</strong>
            </div>
          </div>

          <p style="font-size: 1.05rem; color: var(--text-dim); margin-bottom: 2.2rem; line-height: 1.65;">
            Welcome to the official TechVerse ’26 DevOps Tri-athlon. You will navigate three high-stakes operational arenas.
            Each round is an official timed challenge recorded in the unified Supabase ledger.
          </p>

          <!-- 3 Gauntlets in One Horizontal Row on Desktop -->
          <div class="tournament-games-grid" style="margin-bottom: 2.4rem;">
            <div class="tournament-game-card card-stage-1">
              <div>
                <div style="color: var(--neon-cyan); font-family: var(--font-display); font-size: 0.76rem; letter-spacing: 2px; margin-bottom: 0.35rem;">STAGE 01 // 60s SHIFT</div>
                <h4 style="font-family: var(--font-display); font-size: 1.25rem; color: #fff; margin-bottom: 0.5rem;">Server Sniper</h4>
                <p style="font-size: 0.86rem; color: var(--text-dim); line-height: 1.5;">
                  Keep 36-pod Kubernetes cluster health > 0%. Triage CPU spikes [Hover+S / Drag Balancer], reboot deadlocked pods [Hold 1.5s / Terminal], and trigger Autoscaler [A].
                </p>
              </div>
              <div class="game-card-tags">
                <span class="game-card-tag">[S] Triage</span>
                <span class="game-card-tag">[A] Autoscaler</span>
                <span class="game-card-tag">+2X Combo</span>
              </div>
            </div>

            <div class="tournament-game-card card-stage-2">
              <div>
                <div style="color: var(--neon-purple); font-family: var(--font-display); font-size: 0.76rem; letter-spacing: 2px; margin-bottom: 0.35rem;">STAGE 02 // 60s SPRINT</div>
                <h4 style="font-family: var(--font-display); font-size: 1.25rem; color: #fff; margin-bottom: 0.5rem;">Pipeline Recall</h4>
                <p style="font-size: 0.86rem; color: var(--text-dim); line-height: 1.5;">
                  Phase 1 visual scan ➔ Phase 2 drag-and-drop reconstruction ➔ Phase 3 automated CI/CD runner verification. Filter out decoy stages and race for the speed bonus.
                </p>
              </div>
              <div class="game-card-tags">
                <span class="game-card-tag">Visual Scan</span>
                <span class="game-card-tag">Decoy Filter</span>
                <span class="game-card-tag">Speed Bonus</span>
              </div>
            </div>

            <div class="tournament-game-card card-stage-3">
              <div>
                <div style="color: var(--neon-emerald); font-family: var(--font-display); font-size: 0.76rem; letter-spacing: 2px; margin-bottom: 0.35rem;">STAGE 03 // 45s TOTAL</div>
                <h4 style="font-family: var(--font-display); font-size: 1.25rem; color: #fff; margin-bottom: 0.5rem;">SwipeOps</h4>
                <p style="font-size: 0.86rem; color: var(--text-dim); line-height: 1.5;">
                  3 timed 15-second rounds. Swipe Left to Mitigate/Reject or Swipe Right to Deploy/Apply critical hotfixes while monitoring live production vitals and combo streaks.
                </p>
              </div>
              <div class="game-card-tags">
                <span class="game-card-tag">← Mitigate</span>
                <span class="game-card-tag">Deploy →</span>
                <span class="game-card-tag">45s Mission Limit</span>
              </div>
            </div>
          </div>

          <!-- Official Ranking Protocol -->
          <div style="background: rgba(9, 17, 34, 0.95); border: 1px solid var(--border-tech); clip-path: var(--corner-cut-btn); padding: 1.6rem; margin-bottom: 2.4rem;">
            <div style="font-family: var(--font-display); font-size: 0.95rem; font-weight: 800; color: var(--neon-cyan); letter-spacing: 2px; margin-bottom: 1rem; text-transform: uppercase;">
              🏆 Official Ranking Protocol & Tie-Breaker Priority
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.2rem; font-family: var(--font-mono); font-size: 0.85rem;">
              <div style="border-left: 2px solid var(--neon-cyan); padding-left: 0.8rem;">
                <span style="color: var(--neon-cyan); font-weight: 800;">Priority 1: Average Score</span>
                <div style="color: var(--text-dim); margin-top: 0.2rem;">(R1 Score + R2 Score + R3 Score) / 3</div>
              </div>
              <div style="border-left: 2px solid var(--neon-emerald); padding-left: 0.8rem;">
                <span style="color: var(--neon-emerald); font-weight: 800;">Priority 2: Total Time</span>
                <div style="color: var(--text-dim); margin-top: 0.2rem;">Fastest cumulative round duration</div>
              </div>
              <div style="border-left: 2px solid var(--neon-purple); padding-left: 0.8rem;">
                <span style="color: var(--neon-purple); font-weight: 800;">Priority 3: Combined Streak</span>
                <div style="color: var(--text-dim); margin-top: 0.2rem;">R1 Max Combo + R2 Streak + R3 Streak</div>
              </div>
              <div style="border-left: 2px solid var(--neon-amber); padding-left: 0.8rem;">
                <span style="color: var(--neon-amber); font-weight: 800;">Priority 4: Timestamp</span>
                <div style="color: var(--text-dim); margin-top: 0.2rem;">Earlier verified database submission</div>
              </div>
            </div>
            <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 1.2rem; font-family: var(--font-mono); border-top: 1px solid rgba(255,255,255,0.06); padding-top: 0.8rem;">
              ⏱️ Timing Disclosure: Gameplay clocks run strictly during active simulation. Briefing, identity registration, and between-round countdown screens are never counted against your total time.
            </div>
          </div>

          <!-- Launch Button -->
          <div style="display: flex; justify-content: flex-end;">
            <button id="btn-start-triathlon" class="btn-cyber btn-primary-cyan" style="padding: 1rem 2.8rem; font-size: 1.05rem; letter-spacing: 2px;">
              COMMENCE ROUND 01: SERVER SNIPER ➔
            </button>
          </div>
        </div>
      </div>
    `;

    container.querySelector('#btn-start-triathlon')?.addEventListener('click', () => {
      portalState.goToScreen('round1_intro');
    });
  }

  escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
