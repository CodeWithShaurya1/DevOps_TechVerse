/**
 * ROUND 3: SWIPEOPS — THE PRODUCTION RESCUE MISSION
 * 100% Authentic integration preserving the Tinder-style swipe physics,
 * incident deck, 3-round countdown timers, accuracy metrics, streaks,
 * production health vitals, sound effects, and feedback animations.
 */

import { portalState } from '../portalState.js';
import { IncidentEngine } from '../systems/IncidentEngine.js';
import { ScoringEngine } from '../systems/ScoringEngine.js';
import { ProductionState } from '../systems/ProductionState.js';
import { MissionTimer } from '../systems/MissionTimer.js';
import { IncidentCard } from '../ui/IncidentCard.js';
import { ProductionHealth } from '../ui/ProductionHealth.js';
import { sound } from '../systems/SoundFX.js';
import { Icons } from '../ui/icons.js';

export class SwipeOpsGame {
  constructor() {
    this.container = null;
    this.incidentEngine = null;
    this.scoringEngine = null;
    this.productionState = null;
    this.missionTimer = null;
    this.cardComponent = null;
    this.healthComponent = null;
    this.currentIncident = null;
    this.isFinished = false;
  }

  mount(container) {
    this.container = container;
    this.isFinished = false;

    // Instantiate fresh systems
    this.incidentEngine = new IncidentEngine();
    this.incidentEngine.prepareMission();

    this.scoringEngine = new ScoringEngine();
    this.productionState = new ProductionState();

    this.missionTimer = new MissionTimer({
      totalDuration: 45,
      roundDuration: 15
    });

    this.renderLayout();
    this.setupListeners();
    this.missionTimer.startMission();
    this.loadNextIncident();
  }

  destroy() {
    if (this.missionTimer) {
      this.missionTimer.stopAll();
    }
    if (this.cardComponent && typeof this.cardComponent.destroy === 'function') {
      this.cardComponent.destroy();
    }
  }

  renderLayout() {
    const operatorName = portalState.participant ? portalState.participant.full_name : 'OPERATOR';

    this.container.innerHTML = `
      <div class="swipeops-viewport" style="width: 100%; max-width: 850px; margin: 0 auto; padding: 1rem;">
        <!-- Top HUD -->
        <header class="top-status-bar glass-surface" style="display: flex; justify-content: space-between; align-items: center; padding: 0.8rem 1.2rem; border-radius: var(--radius-md); margin-bottom: 1rem; background: rgba(14, 22, 41, 0.85); border: 1px solid var(--portal-border);">
          <div class="brand-section" style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="font-family: var(--font-display); font-weight: 800; font-size: 1.15rem; color: #fff;">
              SWIPE<span style="color: var(--neon-cyan);">OPS</span>
            </div>
            <div class="player-tag" style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-dim);">
              <span>${this.escapeHtml(operatorName)}</span>
            </div>
          </div>

          <!-- 3-Segment Round Tracker -->
          <div class="mission-rounds-tracker" style="display: flex; gap: 0.5rem;">
            <div class="round-segment" id="so-seg-1" style="padding: 3px 8px; border-radius: 4px; font-family: var(--font-mono); font-size: 0.75rem; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);">
              R1
            </div>
            <div class="round-segment" id="so-seg-2" style="padding: 3px 8px; border-radius: 4px; font-family: var(--font-mono); font-size: 0.75rem; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);">
              R2
            </div>
            <div class="round-segment" id="so-seg-3" style="padding: 3px 8px; border-radius: 4px; font-family: var(--font-mono); font-size: 0.75rem; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);">
              R3
            </div>
          </div>

          <!-- Score & Timer Cluster -->
          <div style="display: flex; align-items: center; gap: 1rem;">
            <div style="font-family: var(--font-mono); font-size: 0.82rem; color: var(--neon-amber);" id="so-streak-pill">
              🔥 <span id="so-streak-val">0 streak</span>
            </div>
            <div style="font-family: var(--font-mono); font-size: 0.95rem; font-weight: 700; color: var(--neon-cyan);">
              <span id="so-score-val">0</span> PTS
            </div>
            <div style="font-family: var(--font-mono); font-size: 1.1rem; font-weight: 800; color: #fff; background: rgba(255,255,255,0.08); padding: 0.25rem 0.65rem; border-radius: 6px;" id="so-time-box">
              <span id="so-time-val">45s</span>
            </div>
          </div>
        </header>

        <!-- Production Health Slot -->
        <div id="so-health-slot" style="margin-bottom: 1rem;"></div>

        <!-- Interactive Swipe Card Deck Slot -->
        <div id="so-deck-slot" style="min-height: 480px; position: relative;"></div>
      </div>
    `;

    // Mount Production Health
    const healthSlot = this.container.querySelector('#so-health-slot');
    this.healthComponent = new ProductionHealth(this.productionState);
    this.healthComponent.mount(healthSlot);
  }

  setupListeners() {
    // Scoring engine updates
    this.scoringEngine.subscribe((stats) => {
      const scoreVal = this.container.querySelector('#so-score-val');
      const streakVal = this.container.querySelector('#so-streak-val');
      if (scoreVal) scoreVal.textContent = stats.score;
      if (streakVal) streakVal.textContent = `${stats.currentStreak} streak`;
    });

    // Mission timer updates
    this.missionTimer.subscribeMissionTick((remaining) => {
      const timeVal = this.container.querySelector('#so-time-val');
      if (timeVal) {
        timeVal.textContent = `${remaining}s`;
        if (remaining <= 10) timeVal.style.color = 'var(--neon-red)';
      }
    });

    this.missionTimer.subscribeRoundTick((remaining) => {
      if (this.healthComponent) {
        this.healthComponent.updateTimerProgress(remaining, 15);
      }
    });

    this.missionTimer.subscribeRoundTimeout(() => {
      this.handleIncidentOutcome('timeout');
    });

    this.missionTimer.subscribeMissionTimeout(() => {
      this.completeMission();
    });
  }

  loadNextIncident() {
    if (!this.incidentEngine.hasNextRound()) {
      this.completeMission();
      return;
    }

    const roundData = this.incidentEngine.nextRound();
    this.currentIncident = roundData.incident;

    // Update round segment pill UI
    [1, 2, 3].forEach(r => {
      const seg = this.container.querySelector(`#so-seg-${r}`);
      if (seg) {
        if (r < roundData.roundNumber) {
          seg.style.background = 'rgba(16, 185, 129, 0.25)';
          seg.style.borderColor = 'var(--neon-green)';
          seg.style.color = 'var(--neon-green)';
        } else if (r === roundData.roundNumber) {
          seg.style.background = 'rgba(0, 243, 255, 0.25)';
          seg.style.borderColor = 'var(--neon-cyan)';
          seg.style.color = 'var(--neon-cyan)';
        } else {
          seg.style.background = 'rgba(255,255,255,0.06)';
          seg.style.borderColor = 'rgba(255,255,255,0.1)';
          seg.style.color = 'var(--text-dim)';
        }
      }
    });

    // Reset round countdown to 15s
    this.missionTimer.startRound();

    // Mount Incident Card Deck
    const deckSlot = this.container.querySelector('#so-deck-slot');
    if (this.cardComponent && typeof this.cardComponent.destroy === 'function') {
      this.cardComponent.destroy();
    }

    this.cardComponent = new IncidentCard({
      onSelectAction: (actionKey) => {
        this.evaluateDecision(actionKey);
      }
    });

    this.cardComponent.mount(deckSlot);
    this.cardComponent.loadIncident(this.currentIncident);
  }

  evaluateDecision(chosenActionKey) {
    if (!this.currentIncident) return;
    this.missionTimer.stopRound();

    const isCorrect = chosenActionKey === this.currentIncident.correctAction;
    this.handleIncidentOutcome(isCorrect ? 'correct' : 'incorrect');
  }

  handleIncidentOutcome(outcome) {
    const outcomeData = this.scoringEngine.processOutcome(this.currentIncident.id, outcome);

    if (outcome === 'correct') {
      sound.playSuccess();
      this.productionState.applyIncidentResolution(this.currentIncident, true);
    } else {
      sound.playError();
      this.productionState.applyIncidentResolution(this.currentIncident, false);
    }

    // Show feedback card or advance immediately
    if (this.cardComponent && typeof this.cardComponent.showResolutionFeedback === 'function') {
      this.cardComponent.showResolutionFeedback({
        outcome,
        explanation: this.currentIncident.resolutionExplanation || (outcome === 'correct' ? 'Optimal decision applied.' : 'SRE policy breached.'),
        points: outcomeData.pointsAwarded + outcomeData.bonusAwarded,
        isBonus: outcomeData.isStreakBonus,
        onAdvance: () => this.loadNextIncident()
      });
    } else {
      setTimeout(() => this.loadNextIncident(), 800);
    }
  }

  async completeMission() {
    if (this.isFinished) return;
    this.isFinished = true;
    this.missionTimer.stopAll();

    const stats = this.scoringEngine.getStats();
    const duration = this.missionTimer.getMissionElapsed();

    // Submit Round 3 official score to Supabase via portalState
    await portalState.submitRoundResult(3, {
      gameName: 'SwipeOps',
      score: stats.score,
      maximumScore: 350,
      streak: stats.maxStreak,
      completionStatus: 'completed',
      successfulActions: stats.correct,
      totalActions: stats.totalAnswered
    });

    // Navigate immediately to Final Results Page
    portalState.goToScreen('final_results');
  }

  escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
