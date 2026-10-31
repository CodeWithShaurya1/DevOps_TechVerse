/**
 * Full-Screen Round Introduction Component with Countdown & Pre-flight Validation
 */
import { portalState } from '../portalState.js';
import { portalSound } from '../services/soundManager.js';
import { ChallengeLockedModal } from './ChallengeLockedModal.js';

const ROUND_CONFIGS = {
  1: {
    roundNumber: 1,
    title: 'ROUND 1: SERVER SNIPER',
    subtitle: 'CHAOS EDITION // KUBERNETES SRE SIMULATOR',
    badgeColor: 'var(--neon-cyan)',
    objective: 'Keep 36-pod Kubernetes cluster health > 0% for 60 seconds.',
    protocols: [
      { label: 'High CPU (⚠️)', action: 'Hover + Press S OR Drag Load Balancer (+200 pts)' },
      { label: 'CrashLoopBackOff (🔄)', action: 'Hover + Press S OR Drag Load Balancer (+200 pts)' },
      { label: 'Deadlocked Red Pod (🔥)', action: 'Hold click for 1.5s OR double-click terminal "kill" (+500 pts)' },
      { label: 'Autoscaler [A]', action: 'Press A to clear all yellow pods immediately (20s cooldown)' },
      { label: 'Ghost Pods (Cyan)', action: 'DO NOT TOUCH! False alarms dock 150 points.' }
    ]
  },
  2: {
    roundNumber: 2,
    title: 'ROUND 2: PIPELINE RECALL',
    subtitle: 'CI/CD ARCHITECTURE & RECONSTRUCTION SIMULATOR',
    badgeColor: 'var(--neon-purple)',
    objective: 'Memorize the verified CI/CD stages, reconstruct them in order, and filter decoy stages.',
    protocols: [
      { label: 'Phase 1: Memorization', action: 'Study the target pipeline stages and their categories.' },
      { label: 'Phase 2: Rebuild Track', action: 'Drag & drop stages into order. Click cards to swap or return.' },
      { label: 'Decoy Stages', action: 'Beware of "Force push", "Disable quality gate", and "SSH hotpatch"!' },
      { label: 'Phase 3: Automated Runner', action: 'Execute build to run real-time terminal step verification.' },
      { label: 'Speed Multiplier', action: 'Skipping memorization early awards a speed bonus.' }
    ]
  },
  3: {
    roundNumber: 3,
    title: 'ROUND 3: SWIPEOPS',
    subtitle: 'THE PRODUCTION RESCUE MISSION // INCIDENT TRIAGE DECK',
    badgeColor: 'var(--neon-green)',
    objective: 'Make rapid incident response decisions on production alarms across 3 timed segments.',
    protocols: [
      { label: 'Swipe Left (←)', action: 'Mitigate / Reject dangerous changes & false alarms' },
      { label: 'Swipe Right (→)', action: 'Deploy / Apply critical hotfixes & emergency scaling' },
      { label: 'Tempo & Clock', action: '45 seconds total mission duration with 15s per-round windows.' },
      { label: 'Streak Bonus', action: 'Maintain consecutive correct decisions for multiplier streaks.' },
      { label: 'Production Vitals', action: 'Every wrong decision drains infrastructure uptime.' }
    ]
  }
};

export class RoundIntroScreen {
  constructor(roundNumber) {
    this.roundNumber = roundNumber;
    this.config = ROUND_CONFIGS[roundNumber];
    this.countdownTimer = null;
    this.isChecking = true;
  }

  async mount(container) {
    this.container = container;
    container.innerHTML = `
      <div class="screen-container" style="max-width: 820px; margin: 0 auto;">
        <div class="glass-panel" style="width: 100%; text-align: center; padding: 2.5rem;">
          <div style="margin-bottom: 1.2rem;">
            <span class="portal-badge" style="border-color: ${this.config.badgeColor}; color: ${this.config.badgeColor};">
              TOURNAMENT STAGE 0${this.roundNumber}
            </span>
          </div>

          <h1 style="font-family: var(--font-display); font-size: 2.4rem; font-weight: 900; letter-spacing: 1.5px; margin-bottom: 0.5rem;">
            ${this.config.title}
          </h1>
          <div style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-dim); letter-spacing: 1px; margin-bottom: 1.8rem;">
            ${this.config.subtitle}
          </div>

          <!-- Pre-flight Status -->
          <div id="preflight-status" style="margin-bottom: 1.8rem; font-family: var(--font-mono); font-size: 0.9rem; color: var(--neon-cyan);">
            VALIDATING TOURNAMENT AUTHORIZATION...
          </div>

          <!-- Mission Protocols -->
          <div style="background: rgba(8, 14, 26, 0.75); border: 1px solid var(--portal-border); border-radius: var(--radius-md); padding: 1.5rem; text-align: left; margin-bottom: 2rem;">
            <div style="font-family: var(--font-display); font-size: 0.9rem; color: var(--text-dim); text-transform: uppercase; margin-bottom: 0.8rem; letter-spacing: 1px;">
              Target Objective:
            </div>
            <p style="font-size: 1rem; color: #fff; margin-bottom: 1.2rem; font-weight: 600;">
              ${this.config.objective}
            </p>

            <div style="font-family: var(--font-display); font-size: 0.85rem; color: var(--text-dim); text-transform: uppercase; margin-bottom: 0.8rem; letter-spacing: 1px;">
              Protocol & Controls:
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.6rem; font-family: var(--font-mono); font-size: 0.85rem;">
              ${this.config.protocols.map(p => `
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding-bottom: 0.4rem; gap: 1rem; flex-wrap: wrap;">
                  <span style="color: var(--neon-cyan);">${p.label}</span>
                  <span style="color: var(--text-dim);">${p.action}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Countdown / Launch Area -->
          <div id="launch-control-area">
            <button id="btn-begin-round" class="btn-cyber btn-primary-cyan" style="font-size: 1.15rem; padding: 1rem 3rem; display: none;">
              LAUNCH ROUND 0${this.roundNumber} ⚡
            </button>
          </div>
        </div>
      </div>
    `;

    await this.validateAttempt();
  }

  async validateAttempt() {
    const preflight = this.container.querySelector('#preflight-status');
    const launchArea = this.container.querySelector('#launch-control-area');
    const beginBtn = this.container.querySelector('#btn-begin-round');

    const check = await portalState.prepareRound(this.roundNumber);

    if (!check.allowed && check.reason === 'locked') {
      preflight.innerHTML = `
        <span style="color: var(--neon-red);">🔒 OFFICIAL ATTEMPT ALREADY COMPLETED</span>
      `;
      new ChallengeLockedModal({
        roundNumber: this.roundNumber,
        officialAttempt: check.officialAttempt,
        onReplayAuthorized: () => {
          this.validateAttempt();
        },
        onClose: () => {
          portalState.goToScreen('leaderboard');
        }
      }).mount(document.body);
      return;
    }

    const isOfficial = check.isOfficial;
    preflight.innerHTML = `
      <span style="color: ${isOfficial ? 'var(--neon-green)' : 'var(--neon-amber)'};">
        ${isOfficial ? '✅ OFFICIAL ATTEMPT AUTHORIZED — READY TO ENGAGE' : '⚡ PRACTICE REPLAY AUTHORIZED (NON-OFFICIAL)'}
      </span>
    `;

    beginBtn.style.display = 'inline-flex';
    beginBtn.addEventListener('click', () => {
      this.startCountdown();
    });
  }

  startCountdown() {
    const launchArea = this.container.querySelector('#launch-control-area');
    let count = 3;

    launchArea.innerHTML = `
      <div class="round-countdown-overlay">
        <div class="big-countdown-num" id="countdown-num">${count}</div>
        <div style="font-family: var(--font-mono); color: var(--text-dim); letter-spacing: 2px;">
          PREPARING ARENA ENGINES...
        </div>
      </div>
    `;

    portalSound.playCountdownTick();

    this.countdownTimer = setInterval(() => {
      count--;
      const numEl = this.container.querySelector('#countdown-num');
      if (count > 0) {
        if (numEl) numEl.textContent = count;
        portalSound.playCountdownTick();
      } else if (count === 0) {
        if (numEl) numEl.textContent = 'GO!';
        portalSound.playCountdownGo();
      } else {
        clearInterval(this.countdownTimer);
        portalState.startRoundGameplay(this.roundNumber);
      }
    }, 700);
  }
}
