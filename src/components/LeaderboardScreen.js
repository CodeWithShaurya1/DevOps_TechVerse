/**
 * Unified Central Leaderboard Component
 * Single source of truth querying Supabase.
 * Strictly adheres to Techverse 4-priority sorting:
 * 1. Average score (desc)
 * 2. Total completion time (asc)
 * 3. Combined streak metric (desc)
 * 4. Earlier verified completion timestamp
 * Never exposes enrollment numbers.
 */

import { portalState } from '../portalState.js';
import { supabaseService } from '../services/supabaseClient.js';
import { portalSound } from '../services/soundManager.js';

export class LeaderboardScreen {
  constructor() {
    this.container = null;
    this.searchQuery = '';
    this.rows = [];
    this.isLoading = true;
    this.error = null;
  }

  async mount(container) {
    this.container = container;
    this.renderShell();
    await this.fetchLeaderboard();
  }

  renderShell() {
    this.container.innerHTML = `
      <div class="screen-container" style="max-width: 1200px; margin: 0 auto; padding: 2rem 1rem; width: 100%;">
        <div class="glass-panel" style="width: 100%;">
          <!-- Header and Search -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
            <div>
              <span class="portal-badge" style="margin-bottom: 0.5rem; display: inline-block;">
                OFFICIAL TOURNAMENT STANDINGS
              </span>
              <h1 style="font-family: var(--font-display); font-size: 2.2rem; font-weight: 900; letter-spacing: 1px;">
                CENTRAL LEADERBOARD
              </h1>
              <div style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-dim); margin-top: 0.3rem;">
                Single Source of Truth powered by Supabase · Official attempts only
              </div>
            </div>

            <!-- Actions Cluster -->
            <div style="display: flex; gap: 0.8rem; align-items: center; flex-wrap: wrap;">
              <input 
                type="text" 
                id="lb-search-input" 
                class="cyber-input" 
                placeholder="SEARCH OPERATOR..." 
                style="width: 220px; padding: 0.55rem 0.9rem; font-size: 0.85rem;"
                value="${this.escapeHtml(this.searchQuery)}"
              />
              <button id="lb-refresh-btn" class="btn-cyber btn-primary-cyan" style="font-size: 0.85rem;">
                🔄 REFRESH
              </button>
              <button id="lb-back-btn" class="btn-cyber" style="font-size: 0.85rem;">
                ⟵ ARENA
              </button>
            </div>
          </div>

          <!-- Ranking Rule Transparency Banner -->
          <div style="background: rgba(8, 14, 26, 0.7); border: 1px solid var(--portal-border); border-radius: var(--radius-sm); padding: 0.75rem 1.2rem; margin-bottom: 1.5rem; display: flex; gap: 1.5rem; font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-dim); flex-wrap: wrap;">
            <span><strong style="color: var(--neon-cyan);">Priority 1:</strong> Average Score (Desc)</span>
            <span><strong style="color: var(--neon-green);">Priority 2:</strong> Total Duration (Asc)</span>
            <span><strong style="color: var(--neon-purple);">Priority 3:</strong> Combined Streak (Desc)</span>
            <span><strong style="color: var(--neon-amber);">Priority 4:</strong> Verified Timestamp (Asc)</span>
          </div>

          <!-- Table Container -->
          <div class="portal-table-container">
            <div id="lb-table-body-wrapper">
              <div style="padding: 3rem; text-align: center; color: var(--neon-cyan); font-family: var(--font-mono);">
                CONNECTING TO SUPABASE CLOUD DATABASE...
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const searchInput = this.container.querySelector('#lb-search-input');
    searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase();
      this.renderRows();
    });

    const refreshBtn = this.container.querySelector('#lb-refresh-btn');
    refreshBtn.addEventListener('click', async () => {
      portalSound.playClick();
      refreshBtn.disabled = true;
      refreshBtn.textContent = 'REFRESHING...';
      await this.fetchLeaderboard();
      refreshBtn.disabled = false;
      refreshBtn.textContent = '🔄 REFRESH';
    });

    const backBtn = this.container.querySelector('#lb-back-btn');
    backBtn.addEventListener('click', () => {
      if (portalState.participant) {
        portalState.goToScreen('briefing');
      } else {
        portalState.goToScreen('cinematic_intro');
      }
    });
  }

  async fetchLeaderboard() {
    this.isLoading = true;
    this.error = null;
    try {
      this.rows = await supabaseService.getLeaderboard();
      this.isLoading = false;
      this.renderRows();
    } catch (err) {
      this.isLoading = false;
      this.error = err.message || 'Failed to load leaderboard from database.';
      this.renderRows();
    }
  }

  renderRows() {
    const wrapper = this.container.querySelector('#lb-table-body-wrapper');
    if (!wrapper) return;

    if (this.isLoading) {
      wrapper.innerHTML = `
        <div style="padding: 3rem; text-align: center; color: var(--neon-cyan); font-family: var(--font-mono);">
          CONNECTING TO SUPABASE CLOUD DATABASE...
        </div>
      `;
      return;
    }

    if (this.error) {
      wrapper.innerHTML = `
        <div style="padding: 3rem; text-align: center; color: var(--neon-red); font-family: var(--font-mono);">
          ⚠️ ${this.escapeHtml(this.error)}
        </div>
      `;
      return;
    }

    const filtered = this.rows.filter(r => 
      !this.searchQuery || r.full_name.toLowerCase().includes(this.searchQuery)
    );

    if (filtered.length === 0) {
      wrapper.innerHTML = `
        <div style="padding: 3rem; text-align: center; color: var(--text-dim); font-family: var(--font-mono);">
          No official records found. Be the first operator to complete the tri-athlon!
        </div>
      `;
      return;
    }

    const activeParticipantId = portalState.participant?.id;

    wrapper.innerHTML = `
      <table class="portal-table">
        <thead>
          <tr>
            <th style="width: 70px;">Rank</th>
            <th>Operator Display Name</th>
            <th style="text-align: right;">R1 Score</th>
            <th style="text-align: right;">R2 Score</th>
            <th style="text-align: right;">R3 Score</th>
            <th style="text-align: right;">Average Score</th>
            <th style="text-align: right;">Total Time</th>
            <th style="text-align: center;">Combined Streak</th>
            <th style="text-align: center;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map((row) => {
            const isMe = row.participant_id === activeParticipantId;
            const rankClass = row.rank === 1 ? 'rank-1' : row.rank === 2 ? 'rank-2' : row.rank === 3 ? 'rank-3' : '';
            return `
              <tr style="${isMe ? 'background: rgba(0, 243, 255, 0.08); font-weight: 700;' : ''}">
                <td>
                  <span class="rank-badge ${rankClass}">${row.rank}</span>
                </td>
                <td style="color: #fff; font-weight: 700;">
                  ${this.escapeHtml(row.full_name)}
                  ${isMe ? '<span style="color: var(--neon-cyan); font-size: 0.75rem; margin-left: 6px;">(YOU)</span>' : ''}
                </td>
                <td style="text-align: right; color: var(--neon-cyan);">
                  ${row.round_1_score !== null && row.round_1_score !== undefined ? row.round_1_score.toLocaleString() : '<span style="color:var(--text-muted);">--</span>'}
                </td>
                <td style="text-align: right; color: var(--neon-purple);">
                  ${row.round_2_score !== null && row.round_2_score !== undefined ? row.round_2_score : '<span style="color:var(--text-muted);">--</span>'}
                </td>
                <td style="text-align: right; color: var(--neon-green);">
                  ${row.round_3_score !== null && row.round_3_score !== undefined ? row.round_3_score : '<span style="color:var(--text-muted);">--</span>'}
                </td>
                <td style="text-align: right; font-weight: 900; font-size: 1.05rem; color: var(--neon-cyan);">
                  ${row.average_score !== null && row.average_score !== undefined ? Number(row.average_score).toFixed(2) : '<span style="color:var(--text-muted);">--</span>'}
                </td>
                <td style="text-align: right; font-family: var(--font-mono); color: var(--neon-green);">
                  ${portalState.formatMs(row.total_completion_time_ms)}
                </td>
                <td style="text-align: center; color: var(--neon-amber); font-weight: 700;">
                  ${row.combined_streak}
                </td>
                <td style="text-align: center;">
                  <span style="font-size: 0.75rem; padding: 2px 8px; border-radius: 4px; font-family: var(--font-mono); ${
                    row.completed_rounds_count === 3 
                      ? 'background: rgba(16, 185, 129, 0.15); color: var(--neon-green); border: 1px solid var(--neon-green);' 
                      : 'background: rgba(245, 158, 11, 0.15); color: var(--neon-amber); border: 1px solid var(--neon-amber);'
                  }">
                    ${row.completion_status}
                  </span>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  }

  escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
