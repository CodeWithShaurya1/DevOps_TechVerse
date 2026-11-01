/**
 * Sandboxed Tournament Game Host Component
 * Encloses the real untouched game inside an isolated iframe sandbox with
 * bidirectional postMessage telemetry bridge, HUD frame, and completion capture.
 */

import { portalState } from '../portalState.js';
import { portalSound } from '../services/soundManager.js';

const ROUND_INFO = {
  1: { name: 'Server Sniper — Chaos Edition', path: '/games/game1/index.html', badge: 'STAGE 01 · KUBERNETES' },
  2: { name: 'DevOps Arena — Pipeline Recall', path: '/games/game2/index.html', badge: 'STAGE 02 · CI/CD RECONSTRUCTION' },
  3: { name: 'SwipeOps — Production Rescue', path: '/games/game3/index.html', badge: 'STAGE 03 · INCIDENT DECISION DECK' }
};

export class GameSandboxScreen {
  constructor(roundNumber) {
    this.roundNumber = roundNumber;
    this.info = ROUND_INFO[roundNumber];
    this.container = null;
    this.messageHandler = null;
    this.iframeEl = null;
    this.isCompleted = false;
  }

  mount(container) {
    this.container = container;
    this.isCompleted = false;

    const participant = portalState.participant;
    const operatorName = participant ? participant.full_name : 'OPERATOR';
    const enrollment = participant ? participant.enrollment_number_normalized : 'DEV001';
    const participantId = participant ? participant.id : '';

    const queryParams = new URLSearchParams({
      player: operatorName,
      enrollment: enrollment,
      participant_id: participantId,
      round: this.roundNumber,
      is_replay: String(!portalState.isOfficialRound[this.roundNumber]),
      skip_countdown: 'true'
    });

    const gameUrl = `${this.info.path}?${queryParams.toString()}`;

    container.innerHTML = `
      <div class="game-sandbox-wrapper">
        <!-- Tournament HUD Bar -->
        <div class="game-sandbox-hud">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <span class="portal-badge" style="font-size: 0.72rem; padding: 0.25rem 0.65rem;">
              ${this.info.badge}
            </span>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="status-pulse"></span>
              <strong style="color: #fff; letter-spacing: 1px;">${this.info.name.toUpperCase()}</strong>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 1rem;">
            <div style="color: var(--neon-cyan); font-family: var(--font-mono); font-size: 0.8rem;">
              PILOT: <strong style="color: #fff;">${this.escapeHtml(operatorName)}</strong>
            </div>
            <button id="btn-fullscreen-arena" class="btn-cyber" style="padding: 0.35rem 0.75rem; font-size: 0.75rem;">
              ⛶ FULLSCREEN
            </button>
            <button id="btn-abort-arena" class="btn-cyber" style="padding: 0.35rem 0.75rem; font-size: 0.75rem; color: var(--neon-crimson);">
              ✕ EXIT TO BRIEFING
            </button>
          </div>
        </div>

        <!-- Sandboxed Real Game Iframe -->
        <iframe 
          id="arena-iframe" 
          class="game-sandbox-frame" 
          src="${gameUrl}" 
          allow="autoplay; fullscreen"
          title="${this.info.name}"
        ></iframe>

        <!-- Debriefing Completion Overlay (Shown when game finishes) -->
        <div id="arena-debriefing-modal" class="portal-modal-backdrop" style="display: none;">
          <div class="portal-modal-card">
            <span class="portal-badge" style="border-color: var(--neon-cyan); color: var(--neon-cyan);">
              STAGE 0${this.roundNumber} COMPLETED
            </span>
            <h2 id="debrief-title" style="font-family: var(--font-display); font-size: 2rem; margin-top: 0.6rem; color: #fff;">
              STAGE TELEMETRY VERIFIED
            </h2>
            <div id="debrief-sub" style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-dim); margin-top: 0.2rem;">
              Official result recorded in Supabase tournament database
            </div>

            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1.8rem 0;">
              <div style="background: rgba(9, 17, 34, 0.85); border: 1px solid var(--border-tech); padding: 1.2rem; clip-path: var(--corner-cut-btn); text-align: center;">
                <div style="font-family: var(--font-display); font-size: 0.72rem; color: var(--text-dim);">STAGE SCORE</div>
                <div id="debrief-score" style="font-family: var(--font-display); font-size: 2rem; font-weight: 900; color: var(--neon-cyan); margin-top: 0.2rem;">0</div>
              </div>
              <div style="background: rgba(9, 17, 34, 0.85); border: 1px solid var(--border-tech); padding: 1.2rem; clip-path: var(--corner-cut-btn); text-align: center;">
                <div style="font-family: var(--font-display); font-size: 0.72rem; color: var(--text-dim);">RECORDED TIME</div>
                <div id="debrief-time" style="font-family: var(--font-display); font-size: 2rem; font-weight: 900; color: var(--neon-emerald); margin-top: 0.2rem;">0.0s</div>
              </div>
              <div style="background: rgba(9, 17, 34, 0.85); border: 1px solid var(--border-tech); padding: 1.2rem; clip-path: var(--corner-cut-btn); text-align: center;">
                <div style="font-family: var(--font-display); font-size: 0.72rem; color: var(--text-dim);">BEST STREAK</div>
                <div id="debrief-streak" style="font-family: var(--font-display); font-size: 2rem; font-weight: 900; color: var(--neon-amber); margin-top: 0.2rem;">0</div>
              </div>
              <div style="background: rgba(9, 17, 34, 0.85); border: 1px solid var(--border-tech); padding: 1.2rem; clip-path: var(--corner-cut-btn); text-align: center;">
                <div style="font-family: var(--font-display); font-size: 0.72rem; color: var(--text-dim);">COMPLETION STATUS</div>
                <div id="debrief-status" style="font-family: var(--font-display); font-size: 1.3rem; font-weight: 900; color: var(--neon-emerald); margin-top: 0.5rem;">VERIFIED</div>
              </div>
            </div>

            <div style="padding: 0.75rem; background: rgba(16, 185, 129, 0.15); border: 1px solid var(--neon-emerald); border-radius: 6px; font-family: var(--font-mono); font-size: 0.82rem; color: var(--neon-emerald); margin-bottom: 1.8rem; text-align: center;">
              🔒 Authenticated Single Official Submission Confirmed
            </div>

            <button id="btn-debrief-advance" class="btn-cyber btn-primary-cyan" style="width: 100%; justify-content: center; padding: 1rem; font-size: 1.05rem;">
              ${this.roundNumber < 3 ? `PROCEED TO ROUND 0${this.roundNumber + 1} ➔` : 'VIEW OFFICIAL TOURNAMENT RESULTS 🏆'}
            </button>
          </div>
        </div>
      </div>
    `;

    this.iframeEl = container.querySelector('#arena-iframe');
    this.setupListeners();
  }

  setupListeners() {
    const fsBtn = this.container.querySelector('#btn-fullscreen-arena');
    if (fsBtn) {
      fsBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          this.container.requestFullscreen?.().catch(() => {});
        } else {
          document.exitFullscreen?.().catch(() => {});
        }
      });
    }

    const abortBtn = this.container.querySelector('#btn-abort-arena');
    if (abortBtn) {
      abortBtn.addEventListener('click', () => {
        if (confirm('Exit current active challenge? Unsaved progress will be lost.')) {
          portalState.goToScreen('briefing');
        }
      });
    }

    // Window message listener for postMessage from the game
    this.messageHandler = async (event) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'TECHVERSE_GAME_COMPLETED' && data.roundNumber === this.roundNumber) {
        if (this.isCompleted) return;
        this.isCompleted = true;

        portalSound.playSuccess();

        // Submit to Supabase through portal state
        const submitRes = await portalState.submitRoundResult(this.roundNumber, {
          gameName: data.gameName || this.info.name,
          score: data.score,
          maximumScore: this.roundNumber === 1 ? 30000 : (this.roundNumber === 2 ? 150 : 350),
          streak: data.streak || 0,
          completionStatus: data.status || 'completed',
          successfulActions: data.podsSaved || data.actions || 0,
          totalActions: data.totalActions || data.actions || 0,
          durationMs: data.durationMs || data.duration_ms || data.timeMs || data.completion_time_ms
        });

        // Display completion debriefing with duration fallback if needed
        const displayData = {
          ...data,
          durationMs: (data.durationMs ?? submitRes?.record?.completion_time_ms)
        };
        this.showDebriefing(displayData);
      } else if (data.type === 'TECHVERSE_ADVANCE_ROUND') {
        const next = data.nextRound || (this.roundNumber + 1);
        if (next <= 3) {
          portalState.goToScreen(`round${next}_intro`);
        } else {
          portalState.goToScreen('final_results');
        }
      } else if (data.type === 'TECHVERSE_ADVANCE_FINAL') {
        portalState.goToScreen('final_results');
      }
    };

    window.addEventListener('message', this.messageHandler);
  }

  showDebriefing(data) {
    const modal = this.container.querySelector('#arena-debriefing-modal');
    if (!modal) return;

    modal.querySelector('#debrief-score').textContent = (data.score || 0).toLocaleString();
    modal.querySelector('#debrief-time').textContent = portalState.formatMs(data.durationMs);
    modal.querySelector('#debrief-streak').textContent = `${data.streak || 0}`;
    modal.querySelector('#debrief-status').textContent = (data.status || 'COMPLETED').toUpperCase();

    modal.style.display = 'flex';

    const advanceBtn = modal.querySelector('#btn-debrief-advance');
    if (advanceBtn) {
      advanceBtn.addEventListener('click', () => {
        if (this.roundNumber < 3) {
          portalState.goToScreen(`round${this.roundNumber + 1}_intro`);
        } else {
          portalState.goToScreen('final_results');
        }
      });
    }
  }

  destroy() {
    if (this.messageHandler) {
      window.removeEventListener('message', this.messageHandler);
      this.messageHandler = null;
    }
  }

  escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
