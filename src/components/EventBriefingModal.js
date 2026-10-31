/**
 * TECHVERSE ’26 — Optional Mission Briefing & Tournament Rules Modal
 * Accessible anytime from header or registration without interrupting the tournament flow.
 */
import { portalSound } from '../services/soundManager.js';

export class EventBriefingModal {
  constructor({ onClose } = {}) {
    this.onClose = onClose;
    this.container = null;
    this.activeTab = 'all';
    this.keydownHandler = null;
  }

  mount(parent = document.body) {
    this.container = document.createElement('div');
    this.container.className = 'portal-modal-backdrop';
    this.container.id = 'briefing-modal-root';

    this.container.innerHTML = `
      <div class="portal-modal-card briefing-modal-card" role="dialog" aria-modal="true" aria-labelledby="briefing-title">
        <button class="modal-close-btn" id="btn-briefing-close" aria-label="Close Rules">✕</button>

        <span class="portal-badge" style="font-size: 0.72rem; margin-bottom: 0.6rem; display: inline-block;">
          TOURNAMENT MISSION BRIEFING
        </span>

        <h2 id="briefing-title" style="font-family: var(--font-display); font-size: 1.9rem; font-weight: 900; letter-spacing: 1.5px; color: #fff; margin-bottom: 0.3rem;">
          OPERATIONAL DIRECTIVES & RULES
        </h2>

        <div style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-dim); margin-bottom: 1.2rem;">
          Official Tri-Athlon Guidelines · 3 Timed Stages · Unified Supabase Ranking
        </div>

        <!-- Tab Bar -->
        <div class="briefing-nav-tabs">
          <button class="briefing-tab-btn active" data-tab="all">ALL STAGES</button>
          <button class="briefing-tab-btn" data-tab="stage1">STAGE 01: SERVER SNIPER</button>
          <button class="briefing-tab-btn" data-tab="stage2">STAGE 02: PIPELINE RECALL</button>
          <button class="briefing-tab-btn" data-tab="stage3">STAGE 03: SWIPEOPS</button>
          <button class="briefing-tab-btn" data-tab="ranking">RANKING PROTOCOL</button>
        </div>

        <!-- Content Area -->
        <div id="briefing-tab-content" style="min-height: 280px;">
          ${this.renderTabContent('all')}
        </div>

        <div style="display: flex; justify-content: flex-end; margin-top: 1.6rem; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 1rem;">
          <button type="button" id="btn-briefing-dismiss" class="btn-primary-gradient" style="padding: 0.75rem 2rem;">
            DISMISS & RETURN →
          </button>
        </div>
      </div>
    `;

    parent.appendChild(this.container);
    portalSound.playClick();

    this.attachEvents();
  }

  renderTabContent(tab) {
    if (tab === 'stage1' || tab === 'all') {
      const stage1 = `
        <div style="background: rgba(5, 10, 22, 0.85); border: 1px solid rgba(0, 243, 255, 0.25); border-radius: 14px; padding: 1.2rem; margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
            <span style="color: var(--neon-cyan); font-family: var(--font-display); font-size: 0.78rem; font-weight: 800;">
              STAGE 01 · 60-SECOND SHIFT
            </span>
            <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted);">MAX SCORE: ~30,000 PTS</span>
          </div>
          <h3 style="font-family: var(--font-display); font-size: 1.3rem; color: #fff; margin-bottom: 0.4rem;">
            Server Sniper — Chaos Edition
          </h3>
          <p style="font-size: 0.86rem; color: var(--text-dim); line-height: 1.5; margin-bottom: 0.8rem;">
            <strong>Objective:</strong> Maintain Kubernetes cluster health > 0% for 60 seconds under severe traffic spikes and Chaos Monkey events.
          </p>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.6rem; font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-dim);">
            <div><strong style="color: var(--neon-cyan);">High CPU Spike (⚠️):</strong> Hover + [S] or drag balancer (+200 pts)</div>
            <div><strong style="color: var(--neon-crimson);">Deadlock Pod (🔥):</strong> Hold click 1.5s or type 'kill' (+500 pts)</div>
            <div><strong style="color: var(--neon-purple);">Autoscaler [A]:</strong> Clears warning pods (20s cooldown)</div>
            <div><strong style="color: var(--neon-amber);">Ghost Pod (👻):</strong> DO NOT TOUCH! Docks 150 pts if clicked</div>
          </div>
        </div>
      `;
      if (tab === 'stage1') return stage1;
    }

    if (tab === 'stage2' || tab === 'all') {
      const stage2 = `
        <div style="background: rgba(5, 10, 22, 0.85); border: 1px solid rgba(168, 85, 247, 0.25); border-radius: 14px; padding: 1.2rem; margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
            <span style="color: var(--neon-purple); font-family: var(--font-display); font-size: 0.78rem; font-weight: 800;">
              STAGE 02 · 60-SECOND SPRINT
            </span>
            <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted);">MAX SCORE: 150 PTS</span>
          </div>
          <h3 style="font-family: var(--font-display); font-size: 1.3rem; color: #fff; margin-bottom: 0.4rem;">
            DevOps Arena — Pipeline Recall
          </h3>
          <p style="font-size: 0.86rem; color: var(--text-dim); line-height: 1.5; margin-bottom: 0.8rem;">
            <strong>Objective:</strong> Memorize the verified FinTech banking CI/CD pipeline, reconstruct stages in precise dependency order, and filter decoy stages.
          </p>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.6rem; font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-dim);">
            <div><strong style="color: var(--neon-purple);">Phase 1:</strong> Study stages before scramble</div>
            <div><strong style="color: var(--neon-cyan);">Phase 2:</strong> Drag & drop stages into order</div>
            <div><strong style="color: var(--neon-crimson);">Decoys:</strong> Filter out force push & hotpatch decoys</div>
            <div><strong style="color: var(--neon-emerald);">Phase 3:</strong> Automated live step runner validation</div>
          </div>
        </div>
      `;
      if (tab === 'stage2') return stage2;
    }

    if (tab === 'stage3' || tab === 'all') {
      const stage3 = `
        <div style="background: rgba(5, 10, 22, 0.85); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 14px; padding: 1.2rem; margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
            <span style="color: var(--neon-emerald); font-family: var(--font-display); font-size: 0.78rem; font-weight: 800;">
              STAGE 03 · EXACT 45-SECOND DURATION (3 × 15s ROUNDS)
            </span>
            <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted);">MAX SCORE: ~350 PTS</span>
          </div>
          <h3 style="font-family: var(--font-display); font-size: 1.3rem; color: #fff; margin-bottom: 0.4rem;">
            SwipeOps — Production Rescue Mission
          </h3>
          <p style="font-size: 0.86rem; color: var(--text-dim); line-height: 1.5; margin-bottom: 0.8rem;">
            <strong>Objective:</strong> Execute rapid incident response triage decisions across 3 consecutive 15-second rounds while monitoring live production vitals.
          </p>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.6rem; font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-dim);">
            <div><strong style="color: var(--neon-cyan);">Swipe Left (←):</strong> Mitigate / Reject dangerous changes</div>
            <div><strong style="color: var(--neon-emerald);">Swipe Right (→):</strong> Deploy / Apply critical emergency hotfixes</div>
            <div><strong style="color: var(--neon-amber);">Streak Multiplier:</strong> Every 3 correct decisions awards +50 pts</div>
            <div><strong style="color: var(--neon-purple);">Production Vitals:</strong> Balance Availability, Data & Stability</div>
          </div>
        </div>
      `;
      if (tab === 'stage3') return stage3;
    }

    if (tab === 'ranking' || tab === 'all') {
      const ranking = `
        <div style="background: rgba(9, 17, 34, 0.95); border: 1px solid var(--border-tech); border-radius: 14px; padding: 1.2rem;">
          <div style="font-family: var(--font-display); font-size: 0.88rem; font-weight: 800; color: var(--neon-cyan); letter-spacing: 2px; margin-bottom: 0.8rem;">
            🏆 OFFICIAL TIE-BREAKER RANKING PROTOCOL
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.8rem; font-family: var(--font-mono); font-size: 0.78rem;">
            <div style="border-left: 2px solid var(--neon-cyan); padding-left: 0.6rem;">
              <span style="color: var(--neon-cyan); font-weight: 800;">Priority 1: Average Score</span>
              <div style="color: var(--text-dim); margin-top: 0.2rem;">(R1 + R2 + R3) / 3</div>
            </div>
            <div style="border-left: 2px solid var(--neon-emerald); padding-left: 0.6rem;">
              <span style="color: var(--neon-emerald); font-weight: 800;">Priority 2: Total Duration</span>
              <div style="color: var(--text-dim); margin-top: 0.2rem;">Lowest cumulative gameplay time</div>
            </div>
            <div style="border-left: 2px solid var(--neon-purple); padding-left: 0.6rem;">
              <span style="color: var(--neon-purple); font-weight: 800;">Priority 3: Combined Streak</span>
              <div style="color: var(--text-dim); margin-top: 0.2rem;">Sum of three rounds' max streaks</div>
            </div>
            <div style="border-left: 2px solid var(--neon-amber); padding-left: 0.6rem;">
              <span style="color: var(--neon-amber); font-weight: 800;">Priority 4: Verified Timestamp</span>
              <div style="color: var(--text-dim); margin-top: 0.2rem;">Earliest database completion</div>
            </div>
          </div>
          <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.8rem; font-family: var(--font-mono);">
            ⏱️ Timer Disclosure: Transition overlays and reading rules are never counted against your official gameplay time.
          </div>
        </div>
      `;
      if (tab === 'ranking') return ranking;
      return `${this.renderTabContent('stage1')}${this.renderTabContent('stage2')}${this.renderTabContent('stage3')}${ranking}`;
    }

    return '';
  }

  attachEvents() {
    const closeBtn = this.container.querySelector('#btn-briefing-close');
    const dismissBtn = this.container.querySelector('#btn-briefing-dismiss');
    const tabBtns = this.container.querySelectorAll('.briefing-tab-btn');
    const content = this.container.querySelector('#briefing-tab-content');

    const handleClose = () => {
      portalSound.playClick();
      this.close();
    };

    closeBtn?.addEventListener('click', handleClose);
    dismissBtn?.addEventListener('click', handleClose);

    this.container.addEventListener('click', (e) => {
      if (e.target === this.container) {
        handleClose();
      }
    });

    this.keydownHandler = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', this.keydownHandler);

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        portalSound.playClick();
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.getAttribute('data-tab');
        content.innerHTML = this.renderTabContent(tab);
      });
    });
  }

  close() {
    if (this.keydownHandler) {
      window.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = null;
    }
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
      this.container = null;
    }
    if (typeof this.onClose === 'function') {
      this.onClose();
    }
  }
}
