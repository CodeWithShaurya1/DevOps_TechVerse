/**
 * TECHVERSE ’26 — Portal State & Navigation Controller
 * Manages participant session, active screen routing, round timer isolation,
 * official attempt enforcement, and streak metric calculations.
 */

import { supabaseService } from './services/supabaseClient.js';
import { portalSound } from './services/soundManager.js';

const SESSION_PARTICIPANT_KEY = 'techverse_session_participant';
const SESSION_ROUND_START_PREFIX = 'techverse_session_round_start_';
const SESSION_OFFICIAL_ATTEMPT_PREFIX = 'techverse_session_is_official_';

class PortalStateManager {
  constructor() {
    this.currentScreen = 'cinematic_intro';
    this.participant = null;
    this.roundResults = { 1: null, 2: null, 3: null };
    this.isOfficialRound = { 1: true, 2: true, 3: true };
    this.activeRoundStartTime = null;
    this.listeners = new Set();

    this._restoreSession();
  }

  _restoreSession() {
    if (typeof sessionStorage === 'undefined') return;
    try {
      const saved = sessionStorage.getItem(SESSION_PARTICIPANT_KEY);
      if (saved) {
        this.participant = JSON.parse(saved);
        this._fetchOfficialResults();
      }
    } catch (_) {}
  }

  async _fetchOfficialResults() {
    if (!this.participant || !this.participant.id) return;
    try {
      const results = await supabaseService.getParticipantOfficialResults(this.participant.id);
      this.roundResults = { ...this.roundResults, ...results };
      this.notify();
    } catch (_) {}
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this);
      } catch (e) {
        console.error('[PortalState] Listener error:', e);
      }
    }
  }

  setParticipant(participant) {
    this.participant = participant;
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(SESSION_PARTICIPANT_KEY, JSON.stringify(participant));
    }
    this._fetchOfficialResults();
    this.notify();
  }

  clearParticipant() {
    this.participant = null;
    this.roundResults = { 1: null, 2: null, 3: null };
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(SESSION_PARTICIPANT_KEY);
      [1, 2, 3].forEach(r => {
        sessionStorage.removeItem(SESSION_ROUND_START_PREFIX + r);
        sessionStorage.removeItem(SESSION_OFFICIAL_ATTEMPT_PREFIX + r);
      });
    }
    this.goToScreen('cinematic_intro');
  }

  goToScreen(screenName) {
    this.currentScreen = screenName;
    portalSound.playClick();
    this.notify();
  }

  // --- ROUND TIMING & START ---
  async prepareRound(roundNumber) {
    if (!this.participant) {
      this.goToScreen('registration');
      return { allowed: false, reason: 'unregistered' };
    }

    // Check if official attempt is locked
    const lockCheck = await supabaseService.checkRoundLocked(this.participant.id, roundNumber);

    if (lockCheck.isLocked) {
      return {
        allowed: false,
        reason: 'locked',
        officialAttempt: lockCheck.officialAttempt
      };
    }

    // Set whether this attempt is official or practice
    const isPractice = lockCheck.hasReplayAuthorization;
    this.isOfficialRound[roundNumber] = !isPractice;

    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(
        SESSION_OFFICIAL_ATTEMPT_PREFIX + roundNumber,
        String(!isPractice)
      );
    }

    return { allowed: true, isOfficial: !isPractice };
  }

  startRoundGameplay(roundNumber) {
    // Record round start timestamp. If already started (e.g. page refresh), preserve original start!
    const key = SESSION_ROUND_START_PREFIX + roundNumber;
    let savedStart = null;
    if (typeof sessionStorage !== 'undefined') {
      savedStart = Number(sessionStorage.getItem(key));
    }

    const now = Date.now();
    if (!savedStart || isNaN(savedStart) || now - savedStart > 300000) { // Max 5m window protection
      this.activeRoundStartTime = now;
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(key, String(now));
      }
    } else {
      this.activeRoundStartTime = savedStart;
    }

    this.goToScreen(`round${roundNumber}_game`);
  }

  // --- SUBMIT RESULT ---
  async submitRoundResult(roundNumber, {
    gameName,
    score,
    maximumScore = null,
    streak = 0,
    completionStatus = 'completed',
    successfulActions = 0,
    totalActions = 0
  }) {
    if (!this.participant) return;

    // Calculate duration strictly for the round gameplay
    const key = SESSION_ROUND_START_PREFIX + roundNumber;
    let startTime = this.activeRoundStartTime;
    if (!startTime && typeof sessionStorage !== 'undefined') {
      startTime = Number(sessionStorage.getItem(key));
    }
    const completionTimeMs = startTime ? Math.max(1000, Date.now() - startTime) : 45000;

    // Clear saved start key for this round
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(key);
    }

    const isOfficial = this.isOfficialRound[roundNumber] !== false;

    const res = await supabaseService.submitGameResult({
      participantId: this.participant.id,
      roundNumber,
      gameName,
      score,
      maximumScore,
      completionTimeMs,
      completionStatus,
      streakCount: streak,
      bestStreak: streak,
      successfulActions,
      totalActions,
      attemptNumber: isOfficial ? 1 : 2,
      isOfficialAttempt: isOfficial,
      startedAt: new Date(startTime || Date.now() - completionTimeMs).toISOString(),
      completedAt: new Date().toISOString()
    });

    if (isOfficial) {
      this.roundResults[roundNumber] = res.record;
    }

    this.notify();
    return res;
  }

  // --- COMPUTE EVENT SUMMARY METRICS ---
  getEventSummary() {
    const r1 = this.roundResults[1];
    const r2 = this.roundResults[2];
    const r3 = this.roundResults[3];

    const r1Score = r1 ? r1.score : null;
    const r2Score = r2 ? r2.score : null;
    const r3Score = r3 ? r3.score : null;

    const r1Time = r1 ? r1.completion_time_ms : null;
    const r2Time = r2 ? r2.completion_time_ms : null;
    const r3Time = r3 ? r3.completion_time_ms : null;

    const r1Streak = r1 ? r1.best_streak : 0;
    const r2Streak = r2 ? r2.best_streak : 0;
    const r3Streak = r3 ? r3.best_streak : 0;

    const completedCount = [r1, r2, r3].filter(Boolean).length;
    const isFullyCompleted = completedCount === 3;

    const totalRawScore = (r1Score || 0) + (r2Score || 0) + (r3Score || 0);
    // Exact average: sum / 3.0
    const averageScore = isFullyCompleted ? Number((totalRawScore / 3.0).toFixed(2)) : null;

    const totalCompletionTimeMs = (r1Time || 0) + (r2Time || 0) + (r3Time || 0);
    // Combined streak: sum of best streaks
    const combinedStreak = r1Streak + r2Streak + r3Streak;

    return {
      r1Score,
      r2Score,
      r3Score,
      totalRawScore,
      averageScore,
      r1Time,
      r2Time,
      r3Time,
      totalCompletionTimeMs,
      r1Streak,
      r2Streak,
      r3Streak,
      combinedStreak,
      completedCount,
      isFullyCompleted,
      status: isFullyCompleted ? 'COMPLETED' : `IN PROGRESS (${completedCount}/3)`
    };
  }

  formatMs(ms) {
    if (ms === null || ms === undefined) return '--';
    const totalSeconds = ms / 1000;
    const mins = Math.floor(totalSeconds / 60);
    const secs = (totalSeconds % 60).toFixed(1);
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  }
}

export const portalState = new PortalStateManager();
