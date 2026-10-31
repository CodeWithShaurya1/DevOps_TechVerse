/**
 * Screen 9 — Final Results Component
 * Responsive layout fitted for 1366x768 / 1440x900 viewports without zoom.
 * Clean lifecycle reset button for next competitor.
 */
import { portalState } from '../portalState.js';
import { supabaseService } from '../services/supabaseClient.js';
import { portalSound } from '../services/soundManager.js';
import confetti from 'canvas-confetti';

export class FinalResultsScreen {
  async mount(container) {
    const participant = portalState.participant;
    const operatorName = participant ? participant.full_name : 'OPERATOR';

    const summary = portalState.getEventSummary();
    const leaderboard = await supabaseService.getLeaderboard();
    const participantRankEntry = leaderboard.find(r => r.participant_id === participant?.id);
    const finalRank = participantRankEntry ? `#${participantRankEntry.rank}` : '--';

    container.innerHTML = `
      <div class="screen-container" style="max-width: 960px; margin: 0 auto; padding: clamp(0.6rem, 1.8vh, 1.4rem) clamp(0.8rem, 2vw, 1.4rem); width: 100%;">
        <div class="glass-panel" style="width: 100%; padding: clamp(1rem, 2.5vh, 2rem);">
          <!-- Header Area -->
          <div style="text-align: center; margin-bottom: clamp(0.8rem, 2vh, 1.4rem);">
            <span class="portal-badge" style="padding: 0.35rem 1rem; font-size: 0.76rem;">
              TOURNAMENT CONCLUDED
            </span>
            <h1 style="font-family: var(--font-display); font-size: clamp(1.6rem, 3.2vw, 2.3rem); font-weight: 900; margin-top: 0.4rem; letter-spacing: 1.5px; color: #fff;">
              OFFICIAL TOURNAMENT SCORECARD
            </h1>
            <div style="font-family: var(--font-mono); font-size: clamp(0.78rem, 1.4vw, 0.88rem); color: var(--text-dim); margin-top: 0.25rem;">
              Competitor: <strong style="color: #fff;">${this.escapeHtml(operatorName)}</strong> ·
              Status: <span style="color: ${summary.isFullyCompleted ? 'var(--neon-emerald)' : 'var(--neon-amber)'}; font-weight: 800;">${summary.status}</span> ·
              Official Rank: <span style="color: var(--neon-cyan); font-weight: 900; font-size: 1.1rem;">${finalRank}</span>
            </div>
          </div>

          <!-- 3-Pillar Headline Metrics -->
          <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: clamp(0.6rem, 1.5vw, 1rem); margin-bottom: clamp(0.9rem, 2vh, 1.4rem);">
            <div style="background: rgba(5, 10, 22, 0.9); border: 1px solid rgba(0, 243, 255, 0.3); border-radius: 14px; padding: clamp(0.75rem, 1.8vh, 1.1rem); text-align: center; box-shadow: 0 4px 16px rgba(0, 243, 255, 0.1);">
              <div style="font-family: var(--font-display); font-size: 0.68rem; color: var(--text-dim); letter-spacing: 1.2px; text-transform: uppercase;">
                TOTAL SCORE (R1+R2+R3)
              </div>
              <div style="font-family: var(--font-display); font-size: clamp(1.5rem, 3.2vw, 2.1rem); font-weight: 900; color: var(--neon-cyan); margin-top: 0.15rem;">
                ${summary.totalRawScore !== null ? summary.totalRawScore.toLocaleString() : 'PENDING'}
              </div>
              <div style="font-family: var(--font-mono); font-size: 0.68rem; color: var(--neon-cyan);">
                Priority 1 Primary Metric
              </div>
            </div>

            <div style="background: rgba(5, 10, 22, 0.9); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 14px; padding: clamp(0.75rem, 1.8vh, 1.1rem); text-align: center; box-shadow: 0 4px 16px rgba(16, 185, 129, 0.1);">
              <div style="font-family: var(--font-display); font-size: 0.68rem; color: var(--text-dim); letter-spacing: 1.2px; text-transform: uppercase;">
                TOTAL GAMEPLAY TIME
              </div>
              <div style="font-family: var(--font-display); font-size: clamp(1.5rem, 3.2vw, 2.1rem); font-weight: 900; color: var(--neon-emerald); margin-top: 0.15rem;">
                ${portalState.formatMs(summary.totalCompletionTimeMs)}
              </div>
              <div style="font-family: var(--font-mono); font-size: 0.68rem; color: var(--neon-emerald);">
                Priority 2 Tie-Breaker (Less Time)
              </div>
            </div>

            <div style="background: rgba(5, 10, 22, 0.9); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 14px; padding: clamp(0.75rem, 1.8vh, 1.1rem); text-align: center; box-shadow: 0 4px 16px rgba(168, 85, 247, 0.1);">
              <div style="font-family: var(--font-display); font-size: 0.68rem; color: var(--text-dim); letter-spacing: 1.2px; text-transform: uppercase;">
                MAX STREAK
              </div>
              <div style="font-family: var(--font-display); font-size: clamp(1.5rem, 3.2vw, 2.1rem); font-weight: 900; color: var(--neon-purple); margin-top: 0.15rem;">
                ${summary.combinedStreak}
              </div>
              <div style="font-family: var(--font-mono); font-size: 0.68rem; color: var(--neon-purple);">
                Priority 3 Conflict Tie-Breaker
              </div>
            </div>
          </div>

          <!-- Comprehensive Results Table -->
          <div class="portal-table-container" style="margin-bottom: clamp(0.9rem, 2vh, 1.4rem); max-height: clamp(240px, 38vh, 340px); overflow-y: auto;">
            <table class="portal-table">
              <thead>
                <tr>
                  <th style="padding: 0.65rem 1rem;">Tournament Metric</th>
                  <th style="padding: 0.65rem 1rem;">Official Value</th>
                  <th style="padding: 0.65rem 1rem;">Rules & Verification</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Round 1: Server Sniper</strong></td>
                  <td style="color: var(--neon-cyan); font-weight: 800;">${summary.r1Score !== null ? summary.r1Score.toLocaleString() : 'Incomplete'}</td>
                  <td style="color: var(--text-dim); font-size: 0.8rem;">Time: ${portalState.formatMs(summary.r1Time)} · Best Streak: ${summary.r1Streak}x</td>
                </tr>
                <tr>
                  <td><strong>Round 2: Pipeline Recall</strong></td>
                  <td style="color: var(--neon-purple); font-weight: 800;">${summary.r2Score !== null ? `${summary.r2Score} / 150` : 'Incomplete'}</td>
                  <td style="color: var(--text-dim); font-size: 0.8rem;">Time: ${portalState.formatMs(summary.r2Time)} · Speed Bonus + Reconstruction</td>
                </tr>
                <tr>
                  <td><strong>Round 3: SwipeOps</strong></td>
                  <td style="color: var(--neon-emerald); font-weight: 800;">${summary.r3Score !== null ? `${summary.r3Score} / 350` : 'Incomplete'}</td>
                  <td style="color: var(--text-dim); font-size: 0.8rem;">Time: ${portalState.formatMs(summary.r3Time)} · 45s Incident Deck</td>
                </tr>
                <tr style="background: rgba(0, 243, 255, 0.08);">
                  <td><strong style="color: var(--neon-cyan);">Total Tournament Score</strong></td>
                  <td style="font-weight: 900; font-size: 1.2rem; color: var(--neon-cyan);">
                    ${summary.totalRawScore !== null ? summary.totalRawScore.toLocaleString() : 'Awaiting Completion'}
                  </td>
                  <td style="color: var(--text-dim); font-size: 0.8rem;">R1 + R2 + R3 (Primary Leaderboard Metric)</td>
                </tr>
                <tr style="background: rgba(0, 243, 255, 0.02);">
                  <td><strong style="color: var(--text-main);">Average Score (Reference)</strong></td>
                  <td style="font-weight: 700; font-size: 1rem; color: var(--text-main);">
                    ${summary.averageScore !== null ? summary.averageScore.toFixed(2) : 'Awaiting Completion'}
                  </td>
                  <td style="color: var(--text-dim); font-size: 0.8rem;">(R1 + R2 + R3) / 3</td>
                </tr>
                <tr style="background: rgba(16, 185, 129, 0.05);">
                  <td><strong style="color: var(--neon-emerald);">Total Official Time</strong></td>
                  <td style="font-weight: 800; font-size: 1.05rem; color: var(--neon-emerald);">
                    ${portalState.formatMs(summary.totalCompletionTimeMs)}
                  </td>
                  <td style="color: var(--text-dim); font-size: 0.8rem;">Excludes transitions and briefing screens</td>
                </tr>
                <tr style="background: rgba(255, 215, 0, 0.06);">
                  <td><strong style="color: #ffd700;">Final Leaderboard Rank</strong></td>
                  <td style="font-weight: 900; font-size: 1.2rem; color: #ffd700;">${finalRank}</td>
                  <td style="color: var(--text-dim); font-size: 0.8rem;">Verified official standing in Supabase database</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Action Buttons -->
          <div style="display: flex; gap: 0.8rem; justify-content: space-between; flex-wrap: wrap;">
            <button id="res-btn-home" class="btn-cyber" style="padding: 0.75rem 1.4rem; font-size: 0.88rem;">
              ⟵ TOURNAMENT HOME
            </button>
            <div style="display: flex; gap: 0.8rem;">
              <button id="res-btn-next-operator" class="btn-cyber" style="border-color: var(--neon-emerald); color: var(--neon-emerald); padding: 0.75rem 1.4rem; font-size: 0.88rem;">
                REGISTER NEXT OPERATOR ➔
              </button>
              <button id="res-btn-view-leaderboard" class="btn-cyber btn-primary-cyan" style="padding: 0.75rem 1.8rem; font-size: 0.92rem; letter-spacing: 1.2px;">
                LEADERBOARD 🏆
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    if (summary.isFullyCompleted) {
      portalSound.playSuccess();
      confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
    }

    container.querySelector('#res-btn-home')?.addEventListener('click', () => {
      portalState.goToScreen('cinematic_intro');
    });

    container.querySelector('#res-btn-next-operator')?.addEventListener('click', () => {
      // Clean participant lifecycle reset: clears session and form for the next competitor
      portalState.resetForNextParticipant();
    });

    container.querySelector('#res-btn-view-leaderboard')?.addEventListener('click', () => {
      portalState.goToScreen('leaderboard');
    });
  }

  escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
