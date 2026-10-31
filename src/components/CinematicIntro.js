/**
 * Screen 1 — Cinematic Intro Component
 * Clean, uncluttered futuristic tournament landing page.
 * Responsive 3-card horizontal layout with equal height and no decorative double slashes.
 */
import { portalState } from '../portalState.js';
import { portalSound } from '../services/soundManager.js';

export class CinematicIntro {
  mount(container) {
    container.innerHTML = `
      <div class="screen-container" style="max-width: 1180px; margin: 0 auto; text-align: center; position: relative; padding: clamp(0.75rem, 2vh, 1.4rem) clamp(0.8rem, 2vw, 1.4rem);">
        <!-- Top Status Bar -->
        <div class="intro-status-bar">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <span class="status-pulse"></span>
            <span style="font-family: var(--font-mono); font-size: 0.74rem; color: var(--text-muted); letter-spacing: 1px;">SYSTEM ONLINE</span>
          </div>
          <div>
            <button id="btn-skip-intro" class="btn-subtle" style="font-size: 0.75rem;">
              SKIP INTRO →
            </button>
          </div>
        </div>

        <!-- Main Cinematic Hero -->
        <div style="margin-bottom: 0.5rem;">
          <span class="portal-badge" style="font-size: 0.74rem; padding: 0.25rem 0.9rem;">
            SRE ARENA CHAMPIONSHIP
          </span>
        </div>

        <h1 class="portal-hero-title">
          TECHVERSE <span class="gradient-text">’26</span>
        </h1>

        <div class="portal-hero-subtitle">
          THE UNIFIED DEVOPS TRI-ATHLON
        </div>

        <p class="portal-hero-desc">
          Three live production-grade DevOps gauntlets in one seamless tournament portal.
          Master Kubernetes pod triage, CI/CD pipeline reconstruction, and rapid incident mitigation.
        </p>

        <!-- The 3 Challenge Cards in One Horizontal Row on Desktop -->
        <div class="tournament-games-grid">
          <!-- Stage 01: Server Sniper -->
          <div class="tournament-game-card card-stage-1">
            <div class="game-card-top">
              <div class="game-card-badge-row">
                <span class="card-stage-pill pill-cyan">
                  STAGE 01 · 60s SHIFT
                </span>
                <span class="game-card-category">K8S CLUSTER</span>
              </div>
              <h3 class="game-card-title">
                Server Sniper
              </h3>
              <p class="game-card-desc">
                Triage a 36-pod Kubernetes cluster under severe traffic spikes, CPU throttles, and Chaos Monkey deadlocks.
              </p>
            </div>
            <div class="game-card-tags">
              <span class="game-card-tag">[S] Triage</span>
              <span class="game-card-tag">[A] Autoscaler</span>
              <span class="game-card-tag">+2X Combo</span>
            </div>
          </div>

          <!-- Stage 02: Pipeline Recall -->
          <div class="tournament-game-card card-stage-2">
            <div class="game-card-top">
              <div class="game-card-badge-row">
                <span class="card-stage-pill pill-purple">
                  STAGE 02 · 60s SPRINT
                </span>
                <span class="game-card-category">CI/CD PIPELINE</span>
              </div>
              <h3 class="game-card-title">
                Pipeline Recall
              </h3>
              <p class="game-card-desc">
                Memorize enterprise deployment tracks, reconstruct stages in dependency order, and filter decoy steps.
              </p>
            </div>
            <div class="game-card-tags">
              <span class="game-card-tag">Visual Scan</span>
              <span class="game-card-tag">Decoy Filter</span>
              <span class="game-card-tag">Speed Bonus</span>
            </div>
          </div>

          <!-- Stage 03: SwipeOps -->
          <div class="tournament-game-card card-stage-3">
            <div class="game-card-top">
              <div class="game-card-badge-row">
                <span class="card-stage-pill pill-emerald">
                  STAGE 03 · 45s DURATION
                </span>
                <span class="game-card-category">INCIDENT TRIAGE</span>
              </div>
              <h3 class="game-card-title">
                SwipeOps
              </h3>
              <p class="game-card-desc">
                Execute rapid incident triage decisions across three 15-second rounds while monitoring live production vitals.
              </p>
            </div>
            <div class="game-card-tags">
              <span class="game-card-tag">← Mitigate</span>
              <span class="game-card-tag">Deploy →</span>
              <span class="game-card-tag">Streak Multiplier</span>
            </div>
          </div>
        </div>

        <!-- Call to Action -->
        <div style="display: flex; justify-content: center; margin-top: clamp(0.6rem, 1.6vh, 1.2rem);">
          <button id="btn-enter-arena" class="btn-primary-gradient" style="font-size: clamp(0.95rem, 1.4vw, 1.05rem); padding: 0.85rem 2.4rem;">
            INITIALIZE OPERATOR TERMINAL →
          </button>
        </div>
      </div>
    `;

    portalSound.playIntroBoot();

    const proceed = () => {
      portalState.goToScreen('registration');
    };

    container.querySelector('#btn-enter-arena')?.addEventListener('click', proceed);
    container.querySelector('#btn-skip-intro')?.addEventListener('click', proceed);
  }
}
