/**
 * Final Results Screen Component
 * Renders the comprehensive 3-round tournament performance breakdown,
 * exact average score calculation (sum / 3), isolated round times,
 * combined streak metric, and official leaderboard standing.
 */

import { portalState } from '../portalState.js';
import { supabaseService } from '../services/supabaseClient.js';
import { portalSound } from '../services/soundManager.js';
import confetti from 'canvas-confetti';

export class FinalResultsScreen {
  async mount(container) {
    const participant = portalState.participant;
    const operatorName = participant ? participant.full_name : 'OPERATOR';

    // Fetch latest official results and rank
    const summary = portalState.getEventSummary();
    const leaderboard = await supabaseService.getLeaderboard();
    const participantRankEntry = leaderboard.find(r => r.participant_id === participant?.id);
    const finalRank = participantRankEntry ? `#${participantRankEntry.rank}` : '--';

    container.innerHTML = `
      <div class="screen-container" style="max-width: 920px; margin: 0 auto; padding: 2rem 1rem;">
        <div class="glass-panel" style="width: 100%;">
          <div style="text-align: center; margin-bottom: 2rem;">
            <span class="portal-badge" style="padding: 0.4rem 1rem; font-size: 0.85rem;">
              TECHVERSE ’26 TOURNAMENT COMPLETE
            </span>
            <h1 style="font-family: var(--font-display); font-size: 2.4rem; font-weight: 900; margin-top: 0.6rem; letter-spacing: 1px;">
              OFFICIAL DEBRIEFING & METRICS
            </h1>
            <div style="font-family: var(--font-mono); font-size: 0.9rem; color: var(--text-dim); margin-top: 0.4rem;">
              Competitor: <strong style="color: #fff;">${this.escapeHtml(operatorName)}</strong> ·
              Status: <span style="color: ${summary.isFullyCompleted ? 'var(--neon-green)' : 'var(--neon-amber)'}; font-weight: 700;">${summary.status}</span> ·
              Official Rank: <span style="color: var(--neon-cyan); font-weight: 700; font-size: 1.1rem;">${finalRank}</span>
            </div>
          </div>

          <!-- Headline Score Displays -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
            <div style="background: rgba(8, 14, 26, 0.8); border: 1px solid var(--neon-cyan); border-radius: var(--radius-md); padding: 1.2rem; text-align: center;">
              <div style="font-family: var(--font-display); font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase;">Average Score (R1+R2+R3)/3</div>
              <div style="font-family: var(--font-display); font-size: 2.2rem; font-weight: 900; color: var(--neon-cyan); margin-top: 0.2rem;">
                ${summary.averageScore !== null ? summary.averageScore.toFixed(2) : 'PENDING'}
              </div>
              <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted);">Priority 1 Qualifier</div>
            </div>

            <div style="background: rgba(8, 14, 26, 0.8); border: 1px solid var(--neon-green); border-radius: var(--radius-md); padding: 1.2rem; text-align: center;">
              <div style="font-family: var(--font-display); font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase;">Total Completion Time</div>
              <div style="font-family: var(--font-display); font-size: 2.2rem; font-weight: 900; color: var(--neon-green); margin-top: 0.2rem;">
                ${portalState.formatMs(summary.totalCompletionTimeMs)}
              </div>
              <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted);">Priority 2 Tie-Breaker</div>
            </div>

            <div style="background: rgba(8, 14, 26, 0.8); border: 1px solid var(--neon-purple); border-radius: var(--radius-md); padding: 1.2rem; text-align: center;">
              <div style="font-family: var(--font-display); font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase;">Combined Streak Metric</div>
              <div style="font-family: var(--font-display); font-size: 2.2rem; font-weight: 900; color: var(--neon-purple); margin-top: 0.2rem;">
                ${summary.combinedStreak}
              </div>
              <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted);">Priority 3 Tie-Breaker</div>
            </div>
          </div>

          <!-- Comprehensive Results Table -->
          <div class="portal-table-container" style="margin-bottom: 2rem;">
            <table class="portal-table">
              <thead>
                <tr>
                  <th>Tournament Metric</th>
                  <th>Official Value</th>
                  <th>Metric Description & Verification Source</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Round 1 Score</strong></td>
                  <td style="color: var(--neon-cyan); font-weight: 700;">${summary.r1Score !== null ? summary.r1Score.toLocaleString() : 'Incomplete'}</td>
                  <td style="color: var(--text-dim);">Server Sniper — Kubernetes Pod SRE triage points</td>
                </tr>
                <tr>
                  <td><strong>Round 2 Score</strong></td>
                  <td style="color: var(--neon-purple); font-weight: 700;">${summary.r2Score !== null ? `${summary.r2Score} / 150` : 'Incomplete'}</td>
                  <td style="color: var(--text-dim);">Pipeline Recall — Base (100) + Speed Bonus - Retries</td>
                </tr>
                <tr>
                  <td><strong>Round 3 Score</strong></td>
                  <td style="color: var(--neon-green); font-weight: 700;">${summary.r3Score !== null ? `${summary.r3Score} / 350` : 'Incomplete'}</td>
                  <td style="color: var(--text-dim);">SwipeOps — Incident triage decisions & streak multipliers</td>
                </tr>
                <tr style="background: rgba(0, 243, 255, 0.04);">
                  <td><strong>Total Raw Score</strong></td>
                  <td style="font-weight: 800; font-size: 1.05rem; color: #fff;">${summary.totalRawScore.toLocaleString()} PTS</td>
                  <td style="color: var(--text-dim);">Sum of all three official challenge rounds</td>
                </tr>
                <tr style="background: rgba(0, 243, 255, 0.08);">
                  <td><strong style="color: var(--neon-cyan);">Average Score</strong></td>
                  <td style="font-weight: 900; font-size: 1.2rem; color: var(--neon-cyan);">
                    ${summary.averageScore !== null ? summary.averageScore.toFixed(2) : 'Awaiting Completion'}
                  </td>
                  <td style="color: var(--text-dim);">Total Raw Score divided by 3 (Primary Ranking Factor)</td>
                </tr>
                <tr>
                  <td><strong>Round 1 Time</strong></td>
                  <td>${portalState.formatMs(summary.r1Time)}</td>
                  <td style="color: var(--text-dim);">Server Sniper elapsed shift duration</td>
                </tr>
                <tr>
                  <td><strong>Round 2 Time</strong></td>
                  <td>${portalState.formatMs(summary.r2Time)}</td>
                  <td style="color: var(--text-dim);">Pipeline Recall active reconstruction duration</td>
                </tr>
                <tr>
                  <td><strong>Round 3 Time</strong></td>
                  <td>${portalState.formatMs(summary.r3Time)}</td>
                  <td style="color: var(--text-dim);">SwipeOps active incident decision duration</td>
                </tr>
                <tr style="background: rgba(16, 185, 129, 0.05);">
                  <td><strong style="color: var(--neon-green);">Total Completion Time</strong></td>
                  <td style="font-weight: 800; font-size: 1.05rem; color: var(--neon-green);">
                    ${portalState.formatMs(summary.totalCompletionTimeMs)}
                  </td>
                  <td style="color: var(--text-dim);">Sum of round durations (Excludes briefing & transition screens)</td>
                </tr>
                <tr>
                  <td><strong>Best Streak per Round</strong></td>
                  <td>R1: ${summary.r1Streak}x | R2: ${summary.r2Streak} | R3: ${summary.r3Streak}</td>
                  <td style="color: var(--text-dim);">Actual supported metrics: R1 Combo | R2 Step Streak | R3 Decisions</td>
                </tr>
                <tr style="background: rgba(168, 85, 247, 0.05);">
                  <td><strong style="color: var(--neon-purple);">Combined Streak Metric</strong></td>
                  <td style="font-weight: 800; font-size: 1.05rem; color: var(--neon-purple);">${summary.combinedStreak}</td>
                  <td style="color: var(--text-dim);">Sum of the three rounds' best streaks (3rd Tier Tie-Breaker)</td>
                </tr>
                <tr style="background: rgba(255, 215, 0, 0.08);">
                  <td><strong style="color: #ffd700;">Final Leaderboard Rank</strong></td>
                  <td style="font-weight: 900; font-size: 1.3rem; color: #ffd700;">${finalRank}</td>
                  <td style="color: var(--text-dim);">Calculated position among verified tournament participants</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Action Buttons -->
          <div style="display: flex; gap: 1rem; justify-content: space-between; flex-wrap: wrap;">
            <button id="res-btn-home" class="btn-cyber">
              ⟵ BACK TO BRIEFING
            </button>
            <div style="display: flex; gap: 1rem;">
              <button id="res-btn-view-leaderboard" class="btn-cyber btn-primary-cyan" style="padding: 0.85rem 2rem; font-size: 1rem;">
                VIEW FULL LEADERBOARD 🏆
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    if (summary.isFullyCompleted) {
      portalSound.playSuccess();
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    }

    container.querySelector('#res-btn-home')?.addEventListener('click', () => {
      portalState.goToScreen('briefing');
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
