/**
 * ROUND 2: PIPELINE RECALL
 * 100% Authentic integration preserving all CI/CD pipeline reconstruction stages,
 * decoy filtering, memorization scan, drag-and-drop slots, automated runner verification,
 * audio synthesizers, terminal logs, and original scoring formula.
 */

import { portalState } from '../portalState.js';
import confetti from 'canvas-confetti';

const PIPELINE_MISSION = {
  id: "official_fintech",
  name: "Official Tournament: FinTech Security & Orchestration",
  difficulty: "6 Pipeline Stages + Decoys",
  memorizeTime: 15,
  rebuildTime: 60,
  maxPoints: 150,
  scenario: "Techverse FinTech platform core banking release. Must pass rigorous security scans, compliance auditing, and automated container orchestration before live traffic switch.",
  stages: [
    {
      id: "pr_merge",
      order: 1,
      title: "1. Pull Request Approval",
      category: "SOURCE",
      categoryColor: "#00f3ff",
      icon: "git-pull",
      description: "Peer review approvals validated with signed branch protection rules and secret leak detection.",
      terminalLogs: [
        "[github] PR #1402: 2/2 Senior approvals confirmed",
        "[gitleaks] Scanning commit diff for exposed tokens... Clean",
        "[ci] Branch protection verified. Pipeline triggered."
      ]
    },
    {
      id: "sonarqube",
      order: 2,
      title: "2. SonarQube SAST & Quality Gate",
      category: "SECURITY",
      categoryColor: "#ec4899",
      icon: "shield",
      description: "Static Application Security Testing checks for OWASP vulnerabilities and code quality score.",
      terminalLogs: [
        "[sonarqube] Scanning 42,500 lines of source code...",
        "[sonarqube] Vulnerabilities: 0 | Bugs: 0 | Security Rating: A",
        "[quality-gate] STATUS: PASSED (Quality gate threshold met)"
      ]
    },
    {
      id: "container_build",
      order: 3,
      title: "3. Build Optimized Container",
      category: "BUILD",
      categoryColor: "#3b82f6",
      icon: "box",
      description: "Packages application with multi-stage build, strips debug symbols, and generates SBOM manifest.",
      terminalLogs: [
        "[build] Multi-stage build initiated for arm64/amd64",
        "[sbom] Generating CycloneDX software bill of materials",
        "[registry] Digest: sha256:8894df012e8b... tagged 'prod-release-v4.0'"
      ]
    },
    {
      id: "trivy_scan",
      order: 4,
      title: "4. Trivy Container Vulnerability Scan",
      category: "SECURITY",
      categoryColor: "#f59e0b",
      icon: "search-code",
      description: "Deep binary and package scan against CVE databases to ensure zero high/critical vulnerabilities.",
      terminalLogs: [
        "[trivy] Inspecting OS packages and Node modules...",
        "[trivy] Total: 418 packages scanned",
        "[trivy] 0 CRITICAL, 0 HIGH. Image security clearance granted."
      ]
    },
    {
      id: "staging_tests",
      order: 5,
      title: "5. Staging Integration Tests",
      category: "TEST",
      categoryColor: "#a855f7",
      icon: "check-circle",
      description: "Deploys to ephemeral staging environment and triggers synthetic end-to-end integration flows.",
      terminalLogs: [
        "[staging] Ephemeral environment ephemeral-pr-1402 ready",
        "[cypress] Running 32 end-to-end payment test scenarios...",
        "[cypress] All 32 suites passed (100% assertions verified)"
      ]
    },
    {
      id: "blue_green",
      order: 6,
      title: "6. Production Blue/Green Switch",
      category: "DEPLOY",
      categoryColor: "#10b981",
      icon: "zap",
      description: "Switches ingress load balancer from Blue environment to Green with zero downtime and instant rollback capability.",
      terminalLogs: [
        "[ingress] Warm-up green fleet target groups...",
        "[ingress] Switching 100% ingress routing to Green fleet",
        "[alert] Telemetry nominal: 0 HTTP 5xx errors recorded. RELEASE LIVE!"
      ]
    }
  ]
};

const DECOY_STAGES = [
  { id: 'decoy_force', order: 0, title: 'Force Push Without Review', category: 'SOURCE', categoryColor: '#00f3ff', icon: 'git-pull', description: 'Pushes directly to the protected branch, bypassing approvals and branch rules.', terminalLogs: ['[git] push --force origin main'] },
  { id: 'decoy_gate', order: 0, title: 'Disable Quality Gate', category: 'QUALITY', categoryColor: '#a855f7', icon: 'shield', description: 'Turns off scanners and coverage thresholds so the pipeline never blocks a release.', terminalLogs: ['[ci] quality gate: DISABLED'] },
  { id: 'decoy_prodbuild', order: 0, title: 'Build Image On Prod Server', category: 'BUILD', categoryColor: '#3b82f6', icon: 'layers', description: 'Compiles the container directly on the live host instead of a clean CI runner.', terminalLogs: ['[docker] building on prod-01...'] },
  { id: 'decoy_ftp', order: 0, title: 'Manual FTP Upload To Prod', category: 'DEPLOY', categoryColor: '#10b981', icon: 'cloud', description: 'Copies artifacts to production by hand, with no rollback or health probes.', terminalLogs: ['[ftp] put app.zip /var/www'] },
  { id: 'decoy_ssh', order: 0, title: 'SSH Hotpatch In Production', category: 'DEPLOY', categoryColor: '#10b981', icon: 'zap', description: 'Engineer edits live files over SSH, leaving servers out of sync with git.', terminalLogs: ['[ssh] root@prod-01: vim app.js'] }
];

export class PipelineRecallGame {
  constructor() {
    this.container = null;
    this.level = PIPELINE_MISSION;
    this.phase = 'MEMORIZE';
    this.timer = null;
    this.timeLeft = 0;
    this.startTime = 0;
    this.elapsedRebuildTime = 0;
    this.skippedMemorizeEarly = false;
    this.placedSlots = [];
    this.poolItems = [];
    this.draggedItem = null;
    this.dragSource = null;
    this.selectedSlot = null;
    this.attempts = 1;
    this.firstTryAccuracy = 100;
    this.sound = null;
    this.isFinished = false;
  }

  mount(container) {
    this.container = container;
    this.isFinished = false;
    this.initAudio();
    this.render();
    this.startMemorizationPhase();
  }

  destroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  initAudio() {
    class PRSnd {
      constructor() {
        this.ctx = null;
      }
      init() {
        if (!this.ctx && typeof window !== 'undefined') {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (AudioCtx) this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
      }
      playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.15) {
        this.init();
        if (!this.ctx) return;
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = type;
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
          gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + duration);
        } catch (_) {}
      }
      playSnap() { this.playTone(800, 'triangle', 0.05, 0.12); }
      playStepPass() {
        this.playTone(523.25, 'sine', 0.1, 0.2);
        setTimeout(() => this.playTone(659.25, 'sine', 0.14, 0.2), 60);
      }
      playSuccess() {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          setTimeout(() => this.playTone(freq, 'triangle', 0.15, 0.25), idx * 80);
        });
      }
      playError() { this.playTone(140, 'sawtooth', 0.22, 0.25); }
    }
    this.sound = new PRSnd();
  }

  render() {
    const operatorName = portalState.participant ? portalState.participant.full_name : 'OPERATOR';

    this.container.innerHTML = `
      <div class="pipeline-viewport" style="width: 100%; max-width: 1350px; margin: 0 auto; padding: 1rem;">
        <!-- Top HUD -->
        <div class="hud-bar" style="margin-bottom: 1rem;">
          <div class="hud-card">
            <div class="hud-title">ACTIVE OPERATOR</div>
            <div class="hud-val" style="font-size: 1.1rem; color: #fff;">${this.escapeHtml(operatorName)}</div>
          </div>
          <div class="hud-card">
            <div class="hud-title">CURRENT PHASE</div>
            <div id="pr-hud-phase" class="hud-val" style="font-size: 1.1rem; color: var(--neon-cyan);">STUDYING TARGET</div>
          </div>
          <div class="hud-card">
            <div class="hud-title">COUNTDOWN CLOCK</div>
            <div id="pr-hud-timer" class="hud-val" style="color: var(--neon-amber);">${this.level.memorizeTime}s</div>
          </div>
          <div class="hud-card">
            <div class="hud-title">ACCURACY TARGET</div>
            <div class="hud-val" style="color: var(--neon-green);">100% CI/CD</div>
          </div>
        </div>

        <!-- Phase Banner -->
        <div id="pr-phase-banner" class="phase-banner memorize-phase" style="padding: 1rem 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--neon-cyan); margin-bottom: 1.2rem; background: rgba(14, 22, 41, 0.85); display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div id="pr-phase-tag" style="font-family: var(--font-display); font-size: 0.8rem; color: var(--neon-cyan); letter-spacing: 1px;">
              PHASE 1: MEMORIZATION SCAN
            </div>
            <h2 id="pr-phase-heading" style="font-family: var(--font-display); font-size: 1.35rem; margin-top: 0.2rem;">
              MEMORIZE VERIFIED PIPELINE STAGE ORDER
            </h2>
            <div id="pr-phase-sub" style="font-size: 0.85rem; color: var(--text-dim); margin-top: 0.2rem;">
              The sequence will scramble when the timer reaches zero. Filter out malicious decoy steps.
            </div>
          </div>
          <div style="display: flex; gap: 0.8rem;">
            <button id="pr-btn-skip-memorize" class="btn-cyber btn-primary-cyan" style="font-size: 0.85rem;">
              SKIP SCAN (BONUS SPEED) ➔
            </button>
            <button id="pr-btn-clear" class="btn-cyber" style="display: none; font-size: 0.85rem;">
              RESET SLOTS
            </button>
            <button id="pr-btn-execute" class="btn-cyber btn-primary-cyan" style="display: none; font-size: 0.85rem;">
              EXECUTE PIPELINE ⚡
            </button>
          </div>
        </div>

        <!-- SLOTS CONTAINER (THE TRACK) -->
        <div id="pr-slots-container" class="pipeline-slots-wrapper" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; min-height: 180px;">
          <!-- Rendered dynamically -->
        </div>

        <!-- INVENTORY POOL -->
        <div id="pr-pool-section" style="display: none; margin-bottom: 1.5rem; background: rgba(10, 16, 31, 0.7); border: 1px solid var(--portal-border); border-radius: var(--radius-md); padding: 1.2rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.8rem;">
            <span style="font-family: var(--font-display); font-size: 0.85rem; color: var(--text-dim); letter-spacing: 1px;">INVENTORY POOL (DECOY STAGES INCLUDED)</span>
            <span id="pr-pool-count" style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--neon-cyan);">6 ITEMS</span>
          </div>
          <div id="pr-pool-container" style="display: flex; flex-wrap: wrap; gap: 0.8rem; min-height: 120px;">
            <!-- Pool items -->
          </div>
        </div>

        <!-- TERMINAL LOG DISPLAY -->
        <div class="panel-card" style="height: 180px; display: flex; flex-direction: column;">
          <div style="font-family: var(--font-display); font-size: 0.8rem; color: var(--text-dim); margin-bottom: 0.5rem; text-transform: uppercase;">
            CI/CD Runner Logs & Terminal Telemetry
          </div>
          <div id="pr-terminal-body" style="flex: 1; overflow-y: auto; font-family: var(--font-mono); font-size: 0.78rem; background: rgba(4, 7, 15, 0.95); padding: 0.75rem; border-radius: var(--radius-sm); border: 1px solid rgba(255,255,255,0.06);">
            <div style="color: var(--text-dim);">[CI] Ready to execute runner sequence...</div>
          </div>
        </div>

        <!-- ROUND 2 COMPLETION MODAL -->
        <div id="pr-completion-modal" class="modal-backdrop hidden" style="display: none;">
          <div class="modal-card" style="max-width: 580px;">
            <span class="portal-badge" style="border-color: var(--neon-purple); color: var(--neon-purple);">
              STAGE 02 COMPLETE
            </span>
            <h2 id="pr-result-title" style="font-family: var(--font-display); font-size: 2rem; margin-top: 0.6rem;">
              DEPLOYMENT VERIFIED
            </h2>
            <div id="pr-result-subtitle" class="modal-sub">100% CI/CD checks passed</div>

            <div class="stats-summary-grid" style="margin: 1.5rem 0;">
              <div class="summary-stat-box">
                <div class="summary-stat-label">Official Score</div>
                <div id="pr-result-score" class="summary-stat-val" style="color: var(--neon-purple);">145 / 150</div>
              </div>
              <div class="summary-stat-box">
                <div class="summary-stat-label">Completion Duration</div>
                <div id="pr-result-time" class="summary-stat-val">22.4s</div>
              </div>
              <div class="summary-stat-box">
                <div class="summary-stat-label">Consecutive Streak</div>
                <div id="pr-result-streak" class="summary-stat-val" style="color: var(--neon-amber);">6 Stages</div>
              </div>
              <div class="summary-stat-box">
                <div class="summary-stat-label">First-Try Accuracy</div>
                <div id="pr-result-acc" class="summary-stat-val" style="color: var(--neon-green);">100%</div>
              </div>
            </div>

            <div id="pr-sync-badge" style="padding: 0.6rem; border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: 0.8rem; margin-bottom: 1.5rem; background: rgba(16, 185, 129, 0.15); border: 1px solid var(--neon-green); color: var(--neon-green);">
              ✅ Official Round 2 Result Stored in Supabase
            </div>

            <button id="pr-btn-next-round" class="btn-cyber btn-primary-purple" style="width: 100%; justify-content: center; padding: 0.95rem; font-size: 1.05rem;">
              PROCEED TO ROUND 3: SWIPEOPS ➔
            </button>
          </div>
        </div>
      </div>
    `;

    // Hook skip button
    const skipBtn = this.container.querySelector('#pr-btn-skip-memorize');
    skipBtn.addEventListener('click', () => {
      this.sound.playSnap();
      this.skippedMemorizeEarly = true;
      this.startRebuildPhase();
    });

    const clearBtn = this.container.querySelector('#pr-btn-clear');
    clearBtn.addEventListener('click', () => {
      this.resetAllSlots();
    });

    const execBtn = this.container.querySelector('#pr-btn-execute');
    execBtn.addEventListener('click', () => {
      this.executeAndVerify();
    });
  }

  logTerminal(msg, type = 'info') {
    const term = this.container.querySelector('#pr-terminal-body');
    if (!term) return;
    const entry = document.createElement('div');
    entry.style.cssText = 'padding: 2px 0;';
    if (type === 'success') entry.style.color = 'var(--neon-green)';
    else if (type === 'error') entry.style.color = 'var(--neon-red)';
    else if (type === 'warn') entry.style.color = 'var(--neon-amber)';
    else entry.style.color = 'var(--text-main)';
    entry.textContent = msg;
    term.appendChild(entry);
    term.scrollTop = term.scrollHeight;
  }

  // --- PHASE 1: STUDY VIEW ---
  startMemorizationPhase() {
    this.phase = 'MEMORIZE';
    this.timeLeft = this.level.memorizeTime;
    this.skippedMemorizeEarly = false;

    const timerEl = this.container.querySelector('#pr-hud-timer');
    const phaseEl = this.container.querySelector('#pr-hud-phase');
    const slots = this.container.querySelector('#pr-slots-container');

    phaseEl.textContent = 'STUDYING TARGET';
    timerEl.textContent = `${this.timeLeft}s`;

    // Render target cards in order
    slots.innerHTML = '';
    this.level.stages.forEach((stage, idx) => {
      const card = this.createCardElement(stage, true, idx);
      slots.appendChild(card);
    });

    this.timer = setInterval(() => {
      this.timeLeft--;
      if (timerEl) timerEl.textContent = `${this.timeLeft}s`;
      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        this.startRebuildPhase();
      }
    }, 1000);
  }

  // --- PHASE 2: REBUILD VIEW ---
  startRebuildPhase() {
    if (this.timer) clearInterval(this.timer);
    this.phase = 'REBUILD';
    this.startTime = Date.now();
    this.timeLeft = this.level.rebuildTime;

    const phaseEl = this.container.querySelector('#pr-hud-phase');
    const timerEl = this.container.querySelector('#pr-hud-timer');
    const banner = this.container.querySelector('#pr-phase-banner');
    const heading = this.container.querySelector('#pr-phase-heading');
    const sub = this.container.querySelector('#pr-phase-sub');
    const tag = this.container.querySelector('#pr-phase-tag');
    const skipBtn = this.container.querySelector('#pr-btn-skip-memorize');
    const clearBtn = this.container.querySelector('#pr-btn-clear');
    const execBtn = this.container.querySelector('#pr-btn-execute');
    const poolSec = this.container.querySelector('#pr-pool-section');

    phaseEl.textContent = 'REBUILDING PIPELINE';
    tag.textContent = 'PHASE 2: RECONSTRUCT TRACK';
    heading.textContent = 'DRAG STAGES INTO CORRECT EXECUTION ORDER';
    sub.textContent = 'Filter decoy stages and click Execute Pipeline when all slots are filled.';
    skipBtn.style.display = 'none';
    clearBtn.style.display = 'inline-flex';
    execBtn.style.display = 'inline-flex';
    poolSec.style.display = 'block';

    // Mix stages with decoys
    this.placedSlots = new Array(this.level.stages.length).fill(null);
    const combined = [...this.level.stages, ...DECOY_STAGES.slice(0, 3)];
    // Shuffle pool
    for (let i = combined.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [combined[i], combined[j]] = [combined[j], combined[i]];
    }
    this.poolItems = combined;

    this.renderSlots();
    this.renderPool();

    this.timer = setInterval(() => {
      this.timeLeft--;
      if (timerEl) timerEl.textContent = `${this.timeLeft}s`;
      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        this.handleTimeout();
      }
    }, 1000);
  }

  renderSlots() {
    const slots = this.container.querySelector('#pr-slots-container');
    slots.innerHTML = '';

    this.placedSlots.forEach((st, idx) => {
      const slotEl = document.createElement('div');
      slotEl.className = `pipeline-slot ${st ? 'filled' : 'empty'}`;
      slotEl.style.cssText = 'min-height: 160px; border: 2px dashed rgba(0, 243, 255, 0.25); border-radius: var(--radius-md); display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(14, 22, 41, 0.5); cursor: pointer; position: relative; padding: 0.5rem;';

      if (st) {
        const card = this.createCardElement(st, false, idx);
        slotEl.appendChild(card);
      } else {
        slotEl.innerHTML = `
          <div style="font-family: var(--font-display); font-size: 0.8rem; color: var(--neon-cyan); margin-bottom: 0.4rem;">
            STEP 0${idx + 1}
          </div>
          <div style="font-size: 0.75rem; color: var(--text-dim); font-family: var(--font-mono);">
            EMPTY SLOT
          </div>
        `;
      }

      slotEl.addEventListener('dragover', (e) => e.preventDefault());
      slotEl.addEventListener('drop', (e) => {
        e.preventDefault();
        this.handleDropOnSlot(idx);
      });

      slotEl.addEventListener('click', () => {
        if (!st && this.poolItems.length > 0) {
          const item = this.poolItems.shift();
          this.placedSlots[idx] = item;
          this.sound.playSnap();
          this.renderSlots();
          this.renderPool();
        }
      });

      slots.appendChild(slotEl);
    });
  }

  renderPool() {
    const pool = this.container.querySelector('#pr-pool-container');
    const poolCount = this.container.querySelector('#pr-pool-count');
    pool.innerHTML = '';

    if (this.poolItems.length === 0) {
      pool.innerHTML = '<div style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--neon-green); padding: 1rem;">ALL STAGES PLACED! READY TO EXECUTE BUILD.</div>';
      poolCount.textContent = 'POOL EMPTY';
      return;
    }

    poolCount.textContent = `${this.poolItems.length} ITEMS`;
    this.poolItems.forEach((stage, idx) => {
      const card = this.createCardElement(stage, false, null, idx);
      pool.appendChild(card);
    });
  }

  createCardElement(stage, isStudyView, slotIndex = null, poolIndex = null) {
    const card = document.createElement('div');
    card.className = 'stage-card';
    card.draggable = !isStudyView && this.phase === 'REBUILD';
    card.style.cssText = `
      width: 100%;
      background: rgba(17, 28, 52, 0.85);
      border: 1px solid ${stage.categoryColor || 'var(--neon-cyan)'};
      border-radius: var(--radius-sm);
      padding: 0.85rem;
      cursor: ${isStudyView ? 'default' : 'grab'};
      position: relative;
    `;

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
        <span style="font-size: 0.7rem; font-family: var(--font-display); color: ${stage.categoryColor}; border: 1px solid ${stage.categoryColor}; padding: 1px 6px; border-radius: 4px;">
          ${stage.category}
        </span>
        ${slotIndex !== null && !isStudyView ? `
          <button class="remove-btn" style="background: none; border: none; color: var(--neon-red); cursor: pointer; font-size: 0.9rem;" title="Return to pool">✕</button>
        ` : ''}
      </div>
      <div style="font-size: 0.9rem; font-weight: 700; color: #fff; margin-bottom: 0.3rem;">
        ${stage.title}
      </div>
      <div style="font-size: 0.75rem; color: var(--text-dim); line-height: 1.3;">
        ${stage.description}
      </div>
    `;

    if (!isStudyView && slotIndex !== null) {
      const removeBtn = card.querySelector('.remove-btn');
      if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const item = this.placedSlots[slotIndex];
          this.placedSlots[slotIndex] = null;
          this.poolItems.push(item);
          this.sound.playSnap();
          this.renderSlots();
          this.renderPool();
        });
      }
    }

    if (!isStudyView && poolIndex !== null) {
      card.addEventListener('click', () => {
        const firstEmpty = this.placedSlots.findIndex(s => s === null);
        if (firstEmpty !== -1) {
          const item = this.poolItems.splice(poolIndex, 1)[0];
          this.placedSlots[firstEmpty] = item;
          this.sound.playSnap();
          this.renderSlots();
          this.renderPool();
        }
      });
    }

    if (!isStudyView) {
      card.addEventListener('dragstart', (e) => {
        this.draggedItem = stage;
        this.dragSource = slotIndex !== null ? slotIndex : 'pool';
        e.dataTransfer.setData('text/plain', stage.id);
      });
    }

    return card;
  }

  handleDropOnSlot(targetIdx) {
    if (!this.draggedItem) return;
    this.sound.playSnap();

    if (typeof this.dragSource === 'number') {
      const existing = this.placedSlots[targetIdx];
      this.placedSlots[targetIdx] = this.draggedItem;
      this.placedSlots[this.dragSource] = existing;
    } else {
      const poolIdx = this.poolItems.findIndex(i => i.id === this.draggedItem.id);
      if (poolIdx !== -1) this.poolItems.splice(poolIdx, 1);
      const existing = this.placedSlots[targetIdx];
      if (existing) this.poolItems.push(existing);
      this.placedSlots[targetIdx] = this.draggedItem;
    }

    this.draggedItem = null;
    this.dragSource = null;
    this.renderSlots();
    this.renderPool();
  }

  resetAllSlots() {
    this.sound.playSnap();
    this.placedSlots.forEach(s => { if (s) this.poolItems.push(s); });
    this.placedSlots = new Array(this.level.stages.length).fill(null);
    this.renderSlots();
    this.renderPool();
  }

  // --- PHASE 3: EXECUTE & VERIFY ---
  async executeAndVerify() {
    const emptyCount = this.placedSlots.filter(s => s === null).length;
    if (emptyCount > 0) {
      this.sound.playError();
      alert(`Pipeline incomplete! ${emptyCount} slot(s) remain empty.`);
      return;
    }

    if (this.timer) clearInterval(this.timer);
    this.phase = 'EXECUTING';
    this.elapsedRebuildTime = (Date.now() - this.startTime) / 1000;

    const banner = this.container.querySelector('#pr-phase-banner');
    const heading = this.container.querySelector('#pr-phase-heading');
    const clearBtn = this.container.querySelector('#pr-btn-clear');
    const execBtn = this.container.querySelector('#pr-btn-execute');

    heading.textContent = 'RUNNING LIVE CI/CD PIPELINE VERIFICATION...';
    clearBtn.style.display = 'none';
    execBtn.style.display = 'none';

    this.logTerminal('------------------------------------------------------------', 'info');
    this.logTerminal('[CI] Executing verification runner for commit HEAD...', 'info');

    let allCorrect = true;
    let consecutiveStreak = 0;
    const expected = this.level.stages;

    for (let i = 0; i < this.placedSlots.length; i++) {
      const placed = this.placedSlots[i];
      const target = expected[i];

      if (placed.terminalLogs) {
        for (const log of placed.terminalLogs) {
          this.logTerminal(log);
          await this.sleep(120);
        }
      }

      await this.sleep(300);

      if (placed.id === target.id) {
        consecutiveStreak++;
        this.sound.playStepPass();
        this.logTerminal(`[PASS] Step ${i + 1} (${placed.title}) verified successfully.`, 'success');
      } else {
        allCorrect = false;
        this.sound.playError();
        this.logTerminal(`[FATAL ERROR] Step ${i + 1} Failed! Sequence dependency violation.`, 'error');
        this.logTerminal(`[DIAGNOSTIC] Expected ${target.title}, but found ${placed.title}`, 'error');
        break;
      }
    }

    await this.sleep(500);

    if (allCorrect) {
      this.handleVictory(consecutiveStreak);
    } else {
      this.handleFailure();
    }
  }

  async handleVictory(consecutiveStreak) {
    if (this.isFinished) return;
    this.isFinished = true;
    this.sound.playSuccess();
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

    const basePoints = 100;
    const timeRatio = Math.max(0, (this.level.rebuildTime - this.elapsedRebuildTime) / this.level.rebuildTime);
    let speedBonus = Math.round(timeRatio * 40);
    if (this.skippedMemorizeEarly) speedBonus += 10;
    speedBonus = Math.min(50, speedBonus);

    const totalScore = Math.max(20, basePoints + speedBonus - (this.attempts - 1) * 15);

    // Save to Supabase via portalState
    await portalState.submitRoundResult(2, {
      gameName: 'Pipeline Recall',
      score: totalScore,
      maximumScore: 150,
      streak: consecutiveStreak,
      completionStatus: 'completed',
      successfulActions: consecutiveStreak,
      totalActions: this.level.stages.length
    });

    const modal = this.container.querySelector('#pr-completion-modal');
    modal.querySelector('#pr-result-score').textContent = `${totalScore} / 150`;
    modal.querySelector('#pr-result-time').textContent = `${this.elapsedRebuildTime.toFixed(1)}s`;
    modal.querySelector('#pr-result-streak').textContent = `${consecutiveStreak} Stages`;
    modal.querySelector('#pr-result-acc').textContent = '100%';
    modal.style.display = 'flex';
    modal.classList.remove('hidden');

    modal.querySelector('#pr-btn-next-round').addEventListener('click', () => {
      portalState.goToScreen('round3_intro');
    });
  }

  handleFailure() {
    this.attempts++;
    this.firstTryAccuracy = Math.max(30, this.firstTryAccuracy - 20);
    alert('Pipeline build failed! Review the runner log, adjust stages, and try again.');
    const clearBtn = this.container.querySelector('#pr-btn-clear');
    const execBtn = this.container.querySelector('#pr-btn-execute');
    clearBtn.style.display = 'inline-flex';
    execBtn.style.display = 'inline-flex';
    this.renderSlots();
    this.renderPool();
  }

  handleTimeout() {
    if (this.isFinished) return;
    this.isFinished = true;
    this.sound.playError();

    const partial = 40;
    portalState.submitRoundResult(2, {
      gameName: 'Pipeline Recall',
      score: partial,
      maximumScore: 150,
      streak: 0,
      completionStatus: 'timeout',
      successfulActions: 0,
      totalActions: this.level.stages.length
    });

    const modal = this.container.querySelector('#pr-completion-modal');
    modal.querySelector('#pr-result-title').textContent = 'TIME EXPIRED';
    modal.querySelector('#pr-result-title').style.color = 'var(--neon-red)';
    modal.querySelector('#pr-result-subtitle').textContent = 'SLA time limit exceeded';
    modal.querySelector('#pr-result-score').textContent = `${partial} / 150`;
    modal.querySelector('#pr-result-time').textContent = `${this.level.rebuildTime}s`;
    modal.querySelector('#pr-result-streak').textContent = '0 Stages';
    modal.querySelector('#pr-result-acc').textContent = '0%';
    modal.style.display = 'flex';
    modal.classList.remove('hidden');

    modal.querySelector('#pr-btn-next-round').addEventListener('click', () => {
      portalState.goToScreen('round3_intro');
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
