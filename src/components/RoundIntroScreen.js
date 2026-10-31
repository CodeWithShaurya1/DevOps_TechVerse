/**
 * Screens 4, 6, 8 — Cinematic Multiverse Dimensional Warp Countdown
 * Clean, cinematic countdown transition into each game.
 * Automatically validates pre-flight credentials, displays converging energy rings,
 * triggers countdown 3 -> 2 -> 1 -> DEPLOY, and directly launches the game iframe.
 */
import { portalState } from '../portalState.js';
import { portalSound } from '../services/soundManager.js';
import { ChallengeLockedModal } from './ChallengeLockedModal.js';

const ROUND_WARP_CONFIG = {
  1: {
    roundNumber: 1,
    theme: 'warp-theme-cyan',
    badge: 'STAGE 01 · SERVER SNIPER',
    title: 'SERVER SNIPER: CHAOS EDITION',
    telemetry: 'CONVERGING 36-POD KUBERNETES TELEMETRY MATRIX',
    status: 'SYSTEM CLUSTER INITIALIZING...'
  },
  2: {
    roundNumber: 2,
    theme: 'warp-theme-purple',
    badge: 'STAGE 02 · PIPELINE RECALL',
    title: 'PIPELINE RECALL: CI/CD MATRIX',
    telemetry: 'CONVERGING ENTERPRISE DEPLOYMENT ARCHITECTURE',
    status: 'RECONSTRUCTION NODES SYNCHRONIZING...'
  },
  3: {
    roundNumber: 3,
    theme: 'warp-theme-emerald',
    badge: 'STAGE 03 · SWIPEOPS',
    title: 'SWIPEOPS: PRODUCTION CRISIS',
    telemetry: 'CONVERGING REAL-TIME SRE INCIDENT SIGNALS',
    status: 'ENTERING 45-SECOND RESCUE GAUNTLET...'
  }
};

export class RoundIntroScreen {
  constructor(roundNumber) {
    this.roundNumber = roundNumber;
    this.config = ROUND_WARP_CONFIG[roundNumber] || ROUND_WARP_CONFIG[1];
    this.container = null;
    this.countdownTimer = null;
    this.hasLaunched = false;
  }

  async mount(container) {
    this.container = container;
    this.hasLaunched = false;

    // Pre-flight authorization check
    const check = await portalState.prepareRound(this.roundNumber);

    if (!check.allowed && check.reason === 'locked') {
      new ChallengeLockedModal({
        roundNumber: this.roundNumber,
        officialAttempt: check.officialAttempt,
        onReplayAuthorized: () => {
          this.mount(container);
        },
        onClose: () => {
          portalState.goToScreen('leaderboard');
        }
      }).mount(document.body);
      return;
    }

    // Mount Multiverse Countdown Screen
    const prefersReducedMotion = typeof window !== 'undefined' && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    container.innerHTML = `
      <div class="multiverse-transition-overlay ${this.config.theme}">
        <div class="multiverse-warp-container">
          <!-- Dimensional Energy Rings -->
          <div class="warp-ring warp-ring-outer"></div>
          <div class="warp-ring warp-ring-mid"></div>
          <div class="warp-ring warp-ring-inner"></div>

          <!-- Countdown Core -->
          <div class="multiverse-countdown-digit" id="warp-digit">3</div>

          <!-- Tournament Metadata -->
          <span class="portal-badge" style="margin-top: 1.5rem; font-size: 0.74rem; letter-spacing: 1.5px;">
            ${this.config.badge}
          </span>

          <h2 class="multiverse-round-title">
            ${this.config.title}
          </h2>

          <div class="multiverse-status-text" id="warp-status-line">
            ${this.config.telemetry}
          </div>
        </div>
      </div>
    `;

    this.startMultiverseCountdown(prefersReducedMotion);
  }

  startMultiverseCountdown(reducedMotion) {
    let count = 3;
    const digitEl = this.container.querySelector('#warp-digit');
    const statusEl = this.container.querySelector('#warp-status-line');

    portalSound.playCountdownTick();

    const intervalMs = reducedMotion ? 350 : 650;

    this.countdownTimer = setInterval(() => {
      count--;
      if (count === 2) {
        if (digitEl) digitEl.textContent = '2';
        if (statusEl) statusEl.textContent = 'CONVERGENCE AT 66%...';
        portalSound.playCountdownTick();
      } else if (count === 1) {
        if (digitEl) digitEl.textContent = '1';
        if (statusEl) statusEl.textContent = this.config.status;
        portalSound.playCountdownTick();
      } else if (count === 0) {
        if (digitEl) digitEl.textContent = 'DEPLOY';
        if (statusEl) statusEl.textContent = 'ENTERING ARENA SIMULATION ⚡';
        portalSound.playCountdownGo();
      } else {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
        this.launchGame();
      }
    }, intervalMs);
  }

  launchGame() {
    if (this.hasLaunched) return;
    this.hasLaunched = true;
    portalState.startRoundGameplay(this.roundNumber);
  }

  destroy() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    this.container = null;
  }
}
