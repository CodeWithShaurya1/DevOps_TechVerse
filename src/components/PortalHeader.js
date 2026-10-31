/**
 * Techverse '26 Portal Header Component
 */
import { portalState } from '../portalState.js';
import { portalSound } from '../services/soundManager.js';

export class PortalHeader {
  constructor() {
    this.container = null;
  }

  render() {
    const participant = portalState.participant;
    const operatorName = participant ? participant.full_name : 'UNASSIGNED';
    const currentScreen = portalState.currentScreen;

    return `
      <header class="portal-navbar">
        <div class="portal-brand" id="nav-brand">
          <span class="portal-badge">TECHVERSE ’26</span>
          <div class="portal-title-wrap">
            <h1>DEVOPS TRI-ATHLON</h1>
            <div class="subtext">3-ROUND SRE & CI/CD CHAMPIONSHIP</div>
          </div>
        </div>

        <div class="portal-nav-actions">
          <div class="operator-badge" title="Registered Competitor">
            <span>OPERATOR:</span>
            <strong>${this.escapeHtml(operatorName)}</strong>
          </div>

          <button id="nav-sound-toggle" class="btn-cyber" title="Toggle sound effects">
            🔊 AUDIO
          </button>

          <button id="nav-leaderboard-btn" class="btn-cyber ${currentScreen === 'leaderboard' ? 'btn-primary-cyan' : ''}">
            🏆 LEADERBOARD
          </button>

          ${participant ? `
            <button id="nav-exit-btn" class="btn-cyber" style="color: var(--neon-red);" title="Switch operator / logout">
              ✕
            </button>
          ` : ''}
        </div>
      </header>
    `;
  }

  attachEvents(parentElement) {
    const brand = parentElement.querySelector('#nav-brand');
    if (brand) {
      brand.addEventListener('click', () => {
        if (portalState.participant) {
          portalState.goToScreen('briefing');
        } else {
          portalState.goToScreen('cinematic_intro');
        }
      });
    }

    const soundBtn = parentElement.querySelector('#nav-sound-toggle');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        const isMuted = portalSound.toggleMute();
        soundBtn.textContent = isMuted ? '🔇 MUTED' : '🔊 AUDIO';
      });
    }

    const lbBtn = parentElement.querySelector('#nav-leaderboard-btn');
    if (lbBtn) {
      lbBtn.addEventListener('click', () => {
        portalState.goToScreen('leaderboard');
      });
    }

    const exitBtn = parentElement.querySelector('#nav-exit-btn');
    if (exitBtn) {
      exitBtn.addEventListener('click', () => {
        if (confirm('Switch participant or exit active session?')) {
          portalState.clearParticipant();
        }
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
