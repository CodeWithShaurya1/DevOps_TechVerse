/**
 * ROUND 1: SERVER SNIPER (CHAOS EDITION)
 * 100% Authentic integration preserving all original 6x6 pod arena mechanics,
 * Kubernetes incident states, autoscaler, drag-and-drop load balancer, terminal modal,
 * SLA scoring, combo multipliers, sound synthesizer, and screen shake.
 */

import { portalState } from '../portalState.js';
import { portalSound } from '../services/soundManager.js';

export class ServerSniperGame {
  constructor() {
    this.container = null;
    this.gameTickInterval = null;
    this.countdownInterval = null;
    this.sound = null;
    this.state = null;
    this.dom = null;
    this.isFinished = false;
  }

  mount(container) {
    this.container = container;
    this.isFinished = false;
    this.render();
    this.initGameEngine();
  }

  destroy() {
    if (this.gameTickInterval) {
      clearInterval(this.gameTickInterval);
      this.gameTickInterval = null;
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    document.body.classList.remove('screen-shake');
  }

  render() {
    const operatorName = portalState.participant ? portalState.participant.full_name : 'OPERATOR';

    this.container.innerHTML = `
      <div class="server-sniper-viewport" style="width: 100%; max-width: 1350px; margin: 0 auto; padding: 1rem;">
        <!-- HUD METRIC BARS -->
        <div class="hud-bar" style="margin-bottom: 1rem;">
          <!-- Health Bar -->
          <div class="hud-card">
            <div class="hud-title">
              <span>CLUSTER HEALTH</span>
              <span id="ss-system-health-val" style="color: var(--neon-green);">100%</span>
            </div>
            <div class="health-meter-container">
              <div id="ss-health-meter-fill" class="health-meter-fill" style="width: 100%;"></div>
            </div>
          </div>

          <!-- Timer -->
          <div class="hud-card">
            <div class="hud-title">SHIFT COUNTDOWN</div>
            <div class="hud-value-row">
              <span id="ss-time-remaining" class="hud-val">60s</span>
              <span style="font-size: 0.7rem; color: var(--text-dim);">60s STANDARD</span>
            </div>
          </div>

          <!-- Score & Multiplier -->
          <div class="hud-card">
            <div class="hud-title">
              <span>UPTIME SCORE</span>
              <span id="ss-combo-badge" class="combo-badge">🔥 2X COMBO (<span id="ss-combo-timer-val">5.0s</span>)</span>
            </div>
            <div class="hud-value-row">
              <span id="ss-score-val" class="hud-val" style="color: var(--neon-cyan);">0</span>
              <span style="font-size: 0.7rem; color: var(--text-dim);">PTS</span>
            </div>
          </div>

          <!-- Cluster Node Breakdown -->
          <div class="hud-card">
            <div class="hud-title">ACTIVE POD BREAKDOWN</div>
            <div style="display: flex; gap: 8px; margin-top: 4px;">
              <span class="metric-pill green">🟢 <strong id="ss-healthy-count">36</strong></span>
              <span class="metric-pill yellow">⚠️ <strong id="ss-warning-count">0</strong></span>
              <span class="metric-pill red">🔥 <strong id="ss-critical-count">0</strong></span>
            </div>
          </div>
        </div>

        <!-- MAIN WORKSPACE -->
        <div style="display: grid; grid-template-columns: 260px 1fr 280px; gap: 1.2rem; align-items: start;">
          <!-- LEFT SIDEBAR: SRE TOOLKIT -->
          <aside class="left-sidebar">
            <div class="panel-card" style="margin-bottom: 1rem;">
              <h3>🛠️ SRE Action Panel</h3>
              <!-- Draggable Load Balancer -->
              <div id="ss-load-balancer-tool" class="tool-item" draggable="true" title="Drag and drop onto yellow pods to offload traffic">
                <div class="tool-icon">⚖️</div>
                <div class="tool-info">
                  <div class="tool-name">Load Balancer</div>
                  <div class="tool-desc">Drag onto Yellow Pod to offload</div>
                </div>
              </div>

              <!-- Autoscaler Button -->
              <button id="ss-autoscaler-btn" class="action-btn-large" title="Scale up all warning pods immediately (20s cooldown)">
                <span>⚡ Autoscaler</span>
                <span class="kbd-badge">[A]</span>
                <div id="ss-autoscaler-cooldown-bar" class="cooldown-overlay"></div>
              </button>
            </div>

            <!-- Quick Controls Guide -->
            <div class="panel-card">
              <h3>📋 Incident Protocols</h3>
              <div class="control-guide" style="font-size: 0.8rem;">
                <div class="control-row"><span>High CPU (⚠️):</span><span class="kbd-badge">Hover + S</span></div>
                <div class="control-row"><span>Crash Loop (🔄):</span><span class="kbd-badge">Hover + S / Balancer</span></div>
                <div class="control-row"><span>Offload Traffic:</span><span class="kbd-badge">Drag Balancer</span></div>
                <div class="control-row"><span>Hard Reboot Red:</span><span class="kbd-badge">Hold Click 1.5s</span></div>
                <div class="control-row"><span>Terminal Emergency Fix:</span><span class="kbd-badge">Double-Click</span></div>
                <div class="control-row"><span>Autoscale All Yellow:</span><span class="kbd-badge">Key [A]</span></div>
                <div class="control-row"><span>Ghost Pod (False Alarm):</span><span style="color: var(--neon-cyan); font-weight:700;">DO NOT TOUCH</span></div>
                <div class="control-row"><span>Wrong Action:</span><span style="color: #f87171;">-25 PTS</span></div>
              </div>
            </div>
          </aside>

          <!-- CENTER: 6x6 KUBERNETES POD ARENA -->
          <section class="arena-container">
            <div class="arena-header">
              <div class="arena-title">
                <span>☸️ PRODUCTION CLUSTER</span>
                <span style="color: var(--text-dim); font-size: 0.72rem;">(36 Managed Pods)</span>
              </div>
              <div class="cluster-metrics">
                <span>Operator: <strong>${this.escapeHtml(operatorName)}</strong></span>
              </div>
            </div>

            <div id="ss-pod-grid" class="pod-grid">
              <!-- 36 Pod elements generated dynamically -->
            </div>
          </section>

          <!-- RIGHT SIDEBAR: SRE LOG -->
          <aside class="right-sidebar">
            <div class="panel-card" style="display: flex; flex-direction: column; height: 480px;">
              <h3>📡 Cluster Event Log</h3>
              <div id="ss-event-log" class="event-log-container" style="flex: 1; overflow-y: auto;">
                <!-- Live events logged here -->
              </div>
            </div>
          </aside>
        </div>

        <!-- MINI TERMINAL MODAL -->
        <div id="ss-terminal-overlay" class="terminal-overlay">
          <div class="terminal-box">
            <div class="terminal-topbar">
              <span>EMERGENCY KUBERNETES TERMINAL</span>
              <button id="ss-terminal-close-btn" class="icon-btn" style="padding: 2px 6px;">✕</button>
            </div>
            <div class="terminal-body">
              <div class="term-log">
                <div>[CRITICAL K8S ALERT] Pod deadlocked with exit code 137.</div>
                <div>Target Node: <strong id="ss-terminal-target-label" style="color: var(--neon-red);">pod-01</strong></div>
                <div style="color: var(--neon-yellow); margin-top: 4px;">Execute 'kill' or 'fix' to force pod remediation:</div>
              </div>
              <div class="term-cmd-row">
                <span class="term-prompt">k8s-sre&gt;</span>
                <input type="text" id="ss-terminal-input" class="term-input" placeholder="type 'kill' or 'fix' and hit enter" autocomplete="off" spellcheck="false">
              </div>
              <div class="term-hint">Press ENTER to execute | ESC to abort</div>
            </div>
          </div>
        </div>

        <!-- ROUND 1 COMPLETION MODAL -->
        <div id="ss-completion-modal" class="modal-backdrop hidden" style="display: none;">
          <div class="modal-card" style="max-width: 580px;">
            <span class="portal-badge" style="border-color: var(--neon-cyan); color: var(--neon-cyan);">
              STAGE 01 COMPLETE
            </span>
            <h2 id="ss-result-title" style="font-family: var(--font-display); font-size: 2rem; margin-top: 0.6rem;">
              SHIFT SURVIVED
            </h2>
            <div id="ss-result-subtitle" class="modal-sub">60 seconds survived</div>

            <div class="stats-summary-grid" style="margin: 1.5rem 0;">
              <div class="summary-stat-box">
                <div class="summary-stat-label">Final Score</div>
                <div id="ss-result-score" class="summary-stat-val" style="color: var(--neon-cyan);">0</div>
              </div>
              <div class="summary-stat-box">
                <div class="summary-stat-label">Pods Remediated</div>
                <div id="ss-result-pods-saved" class="summary-stat-val">0</div>
              </div>
              <div class="summary-stat-box">
                <div class="summary-stat-label">Max Combo Streak</div>
                <div id="ss-result-combo" class="summary-stat-val" style="color: var(--neon-amber);">0x</div>
              </div>
              <div class="summary-stat-box">
                <div class="summary-stat-label">Mean Time to Recovery</div>
                <div id="ss-result-mttr" class="summary-stat-val">0.0s</div>
              </div>
            </div>

            <div id="ss-sync-badge" style="padding: 0.6rem; border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: 0.8rem; margin-bottom: 1.5rem; background: rgba(16, 185, 129, 0.15); border: 1px solid var(--neon-green); color: var(--neon-green);">
              ✅ Official Round 1 Result Stored in Supabase
            </div>

            <button id="ss-btn-next-round" class="btn-cyber btn-primary-cyan" style="width: 100%; justify-content: center; padding: 0.95rem; font-size: 1.05rem;">
              PROCEED TO ROUND 2: PIPELINE RECALL ➔
            </button>
          </div>
        </div>
      </div>
    `;
  }

  initGameEngine() {
    const root = this.container;
    const TICK_INTERVAL_MS = 100;
    const AUTOSCALER_COOLDOWN_MS = 20000;
    const COMBO_WINDOW_MS = 2000;
    const COMBO_DURATION_MS = 5000;

    // Procedural sound synthesizer
    class SSSoundEngine {
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
      playClick() { this.playTone(800, 'triangle', 0.04, 0.08); }
      playScale() {
        this.playTone(523.25, 'sine', 0.12, 0.2);
        setTimeout(() => this.playTone(659.25, 'sine', 0.18, 0.2), 60);
      }
      playCrashLoop() {
        this.playTone(320, 'sawtooth', 0.05, 0.15);
        setTimeout(() => this.playTone(480, 'sawtooth', 0.07, 0.18), 65);
      }
      playReboot() {
        this.playTone(150, 'sawtooth', 0.35, 0.2);
        setTimeout(() => this.playTone(880, 'sine', 0.2, 0.2), 100);
      }
      playCombo() {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          setTimeout(() => this.playTone(freq, 'triangle', 0.15, 0.25), idx * 80);
        });
      }
      playPenalty() { this.playTone(130, 'sawtooth', 0.2, 0.3); }
      playChaosSiren() { this.playTone(450, 'sawtooth', 0.6, 0.3); }
      playVictory() {
        [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, idx) => {
          setTimeout(() => this.playTone(freq, 'triangle', 0.25, 0.3), idx * 100);
        });
      }
      playGameOver() {
        [300, 260, 220, 180].forEach((freq, idx) => {
          setTimeout(() => this.playTone(freq, 'sawtooth', 0.3, 0.3), idx * 120);
        });
      }
    }

    const sound = new SSSoundEngine();
    this.sound = sound;

    const state = {
      roundDurationSec: 60,
      timeRemainingSec: 60,
      systemHealth: 100.0,
      score: 0,
      running: true,
      paused: false,
      pods: [],
      yellowResolvedCount: 0,
      highCpuResolvedCount: 0,
      crashLoopsResolvedCount: 0,
      redResolvedCount: 0,
      falseAlarmsHit: 0,
      totalDowntimeTicks: 0,
      totalUptimeTicks: 0,
      recoveryTimes: [],
      remediationTimestamps: [],
      comboMultiplierActive: false,
      comboEndTime: 0,
      longestCombo: 0,
      currentComboCount: 0,
      trafficSpikeFired: false,
      chaosMonkeyFired: false,
      autoscalerCooldownEnd: 0,
      hoveredPodIndex: null,
      holdTargetIndex: null,
      holdStartTime: 0,
      holdAnimationFrame: null,
      terminalTargetIndex: null
    };
    this.state = state;

    const dom = {
      systemHealthVal: root.querySelector('#ss-system-health-val'),
      healthFill: root.querySelector('#ss-health-meter-fill'),
      timeRemaining: root.querySelector('#ss-time-remaining'),
      scoreVal: root.querySelector('#ss-score-val'),
      comboBadge: root.querySelector('#ss-combo-badge'),
      comboTimerVal: root.querySelector('#ss-combo-timer-val'),
      healthyCount: root.querySelector('#ss-healthy-count'),
      warningCount: root.querySelector('#ss-warning-count'),
      criticalCount: root.querySelector('#ss-critical-count'),
      podGrid: root.querySelector('#ss-pod-grid'),
      eventLog: root.querySelector('#ss-event-log'),
      autoscalerBtn: root.querySelector('#ss-autoscaler-btn'),
      autoscalerCooldownBar: root.querySelector('#ss-autoscaler-cooldown-bar'),
      loadBalancerTool: root.querySelector('#ss-load-balancer-tool'),
      terminalOverlay: root.querySelector('#ss-terminal-overlay'),
      terminalInput: root.querySelector('#ss-terminal-input'),
      terminalCloseBtn: root.querySelector('#ss-terminal-close-btn'),
      terminalTargetLabel: root.querySelector('#ss-terminal-target-label'),
      completionModal: root.querySelector('#ss-completion-modal'),
      resultTitle: root.querySelector('#ss-result-title'),
      resultSubtitle: root.querySelector('#ss-result-subtitle'),
      resultScore: root.querySelector('#ss-result-score'),
      resultPodsSaved: root.querySelector('#ss-result-pods-saved'),
      resultCombo: root.querySelector('#ss-result-combo'),
      resultMttr: root.querySelector('#ss-result-mttr'),
      btnNextRound: root.querySelector('#ss-btn-next-round')
    };
    this.dom = dom;

    const logEvent = (msg, type = 'info') => {
      if (!dom.eventLog) return;
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
      const entry = document.createElement('div');
      entry.className = `log-entry log-${type}`;
      entry.style.cssText = 'padding: 4px 6px; font-family: var(--font-mono); font-size: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.04);';
      entry.innerHTML = `<span style="color: var(--text-dim);">[${timeStr}]</span> <span>${this.escapeHtml(msg)}</span>`;
      dom.eventLog.appendChild(entry);
      dom.eventLog.scrollTop = dom.eventLog.scrollHeight;
    };

    const updateHudBreakdown = () => {
      let h = 0, w = 0, c = 0;
      state.pods.forEach(p => {
        if (p.state === 'healthy') h++;
        else if (p.state === 'warning') w++;
        else if (p.state === 'critical') c++;
      });
      dom.healthyCount.textContent = h;
      dom.warningCount.textContent = w;
      dom.criticalCount.textContent = c;
    };

    const setPodState = (index, newState, warningType = null) => {
      const pod = state.pods[index];
      if (!pod) return;

      pod.state = newState;
      pod.warningType = warningType;
      pod.stateStartTime = performance.now();

      const el = pod.element;
      el.className = 'pod';

      if (newState === 'healthy') {
        el.classList.add('healthy');
        pod.iconEl.textContent = '🟢';
        pod.statusEl.textContent = 'Running';
      } else if (newState === 'warning') {
        el.classList.add('warning');
        if (warningType === 'crash-loop') {
          el.classList.add('crash-loop');
          pod.iconEl.textContent = '🔄';
          pod.statusEl.textContent = 'CrashLoop';
          sound.playCrashLoop();
        } else {
          pod.iconEl.textContent = '⚠️';
          pod.statusEl.textContent = 'High CPU';
        }
      } else if (newState === 'critical') {
        el.classList.add('critical');
        pod.iconEl.textContent = '🔥';
        pod.statusEl.textContent = 'Deadlock';
      } else if (newState === 'ghost') {
        el.classList.add('ghost');
        pod.iconEl.textContent = '👻';
        pod.statusEl.textContent = 'Ghost Pod';
        setTimeout(() => {
          if (pod.state === 'ghost') setPodState(index, 'healthy');
        }, 2500);
      }
      updateHudBreakdown();
    };

    const awardScore = (points, reason) => {
      const multiplier = state.comboMultiplierActive ? 2 : 1;
      const totalPoints = points * multiplier;
      state.score += totalPoints;
      dom.scoreVal.textContent = state.score.toLocaleString();

      if (points > 0) {
        const now = performance.now();
        state.remediationTimestamps.push(now);
        state.remediationTimestamps = state.remediationTimestamps.filter(t => now - t <= COMBO_WINDOW_MS);

        if (state.remediationTimestamps.length >= 3 && !state.comboMultiplierActive) {
          state.comboMultiplierActive = true;
          state.comboEndTime = now + COMBO_DURATION_MS;
          state.currentComboCount++;
          if (state.currentComboCount > state.longestCombo) {
            state.longestCombo = state.currentComboCount;
          }
          dom.comboBadge.classList.add('active');
          sound.playCombo();
          logEvent('🔥 2X COMBO MULTIPLIER UNLOCKED FOR 5.0 SECONDS!', 'event');
        }
      }
    };

    const applyPenalty = (points, reason) => {
      state.score = Math.max(0, state.score - points);
      dom.scoreVal.textContent = state.score.toLocaleString();
      sound.playPenalty();
      logEvent(`⚠️ Penalty: -${points} pts (${reason})`, 'warning');
    };

    const remediateYellowPod = (index) => {
      const pod = state.pods[index];
      if (!pod) return;

      if (pod.state === 'warning') {
        sound.playScale();
        const duration = performance.now() - pod.stateStartTime;
        state.recoveryTimes.push(duration);
        state.yellowResolvedCount++;
        if (pod.warningType === 'high-cpu') state.highCpuResolvedCount++;
        if (pod.warningType === 'crash-loop') state.crashLoopsResolvedCount++;

        awardScore(200, 'Remediated Warning Pod');
        logEvent(`⚡ Remediated ${pod.id} (${pod.warningType}) in ${(duration / 1000).toFixed(1)}s`, 'success');
        setPodState(index, 'healthy');
      } else if (pod.state === 'ghost') {
        applyPenalty(150, 'Touched Ghost Pod false alarm');
        setPodState(index, 'healthy');
      } else if (pod.state === 'healthy') {
        applyPenalty(25, 'Misfired action on healthy pod');
      }
    };

    const remediateRedPod = (index) => {
      const pod = state.pods[index];
      if (!pod) return;

      if (pod.state === 'critical') {
        sound.playReboot();
        const duration = performance.now() - pod.stateStartTime;
        state.recoveryTimes.push(duration);
        state.redResolvedCount++;

        awardScore(500, 'Rebooted Critical Deadlock');
        logEvent(`🛡️ Rebooted critical deadlocked pod ${pod.id}`, 'success');
        setPodState(index, 'healthy');
      }
    };

    // Autoscaler Action
    const triggerAutoscaler = () => {
      const now = performance.now();
      if (now < state.autoscalerCooldownEnd) return;

      state.autoscalerCooldownEnd = now + AUTOSCALER_COOLDOWN_MS;
      let scaledCount = 0;

      state.pods.forEach((pod, idx) => {
        if (pod.state === 'warning') {
          scaledCount++;
          remediateYellowPod(idx);
        }
      });

      if (scaledCount > 0) {
        logEvent(`⚡ Autoscaler power-up triggered: Cleared ${scaledCount} warning pods!`, 'event');
      } else {
        logEvent(`⚡ Autoscaler triggered, but no warning pods active.`, 'info');
      }
    };

    // Generate 36 Pod elements
    dom.podGrid.innerHTML = '';
    for (let i = 0; i < 36; i++) {
      const podId = `pod-${String(i + 1).padStart(2, '0')}`;
      const podEl = document.createElement('div');
      podEl.className = 'pod healthy';
      podEl.dataset.index = i;

      podEl.innerHTML = `
        <div class="pod-header">
          <span class="pod-name">${podId}</span>
          <span class="pod-icon">🟢</span>
        </div>
        <div class="pod-status">Running</div>
        <div class="pod-hold-ring">
          <svg viewBox="0 0 40 40">
            <circle class="ring-bg" cx="20" cy="20" r="16"></circle>
            <circle class="ring-fill" cx="20" cy="20" r="16"></circle>
          </svg>
        </div>
      `;

      dom.podGrid.appendChild(podEl);

      const podObj = {
        index: i,
        id: podId,
        state: 'healthy',
        warningType: null,
        stateStartTime: 0,
        element: podEl,
        iconEl: podEl.querySelector('.pod-icon'),
        statusEl: podEl.querySelector('.pod-status'),
        ringFill: podEl.querySelector('.ring-fill')
      };
      state.pods.push(podObj);

      // Mouse Events
      podEl.addEventListener('mouseenter', () => { state.hoveredPodIndex = i; });
      podEl.addEventListener('mouseleave', () => {
        if (state.hoveredPodIndex === i) state.hoveredPodIndex = null;
        if (state.holdTargetIndex === i) cancelHoldReboot();
      });

      // Hold Click 1.5s on Critical Pod
      podEl.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        if (podObj.state === 'critical') {
          startHoldReboot(i);
        }
      });

      // Double-Click opens Emergency Terminal
      podEl.addEventListener('dblclick', () => {
        if (podObj.state === 'critical') {
          openEmergencyTerminal(i);
        }
      });

      // Drag and Drop Load Balancer target
      podEl.addEventListener('dragover', (e) => e.preventDefault());
      podEl.addEventListener('drop', (e) => {
        e.preventDefault();
        remediateYellowPod(i);
      });
    }

    const startHoldReboot = (index) => {
      state.holdTargetIndex = index;
      state.holdStartTime = performance.now();
      const ringFill = state.pods[index].ringFill;

      const tickHold = () => {
        if (state.holdTargetIndex !== index) return;
        const elapsed = performance.now() - state.holdStartTime;
        const progress = Math.min(1.0, elapsed / 1500);

        const circumference = 2 * Math.PI * 16;
        const offset = circumference * (1 - progress);
        if (ringFill) ringFill.style.strokeDashoffset = offset;

        if (progress >= 1.0) {
          remediateRedPod(index);
          cancelHoldReboot();
        } else {
          state.holdAnimationFrame = requestAnimationFrame(tickHold);
        }
      };
      state.holdAnimationFrame = requestAnimationFrame(tickHold);
    };

    const cancelHoldReboot = () => {
      if (state.holdTargetIndex !== null) {
        const ringFill = state.pods[state.holdTargetIndex]?.ringFill;
        if (ringFill) ringFill.style.strokeDashoffset = '100';
      }
      state.holdTargetIndex = null;
      if (state.holdAnimationFrame) {
        cancelAnimationFrame(state.holdAnimationFrame);
        state.holdAnimationFrame = null;
      }
    };

    window.addEventListener('mouseup', cancelHoldReboot);

    // Emergency Terminal Modal handlers
    const openEmergencyTerminal = (index) => {
      state.terminalTargetIndex = index;
      dom.terminalTargetLabel.textContent = state.pods[index].id;
      dom.terminalInput.value = '';
      dom.terminalOverlay.classList.add('active');
      dom.terminalInput.focus();
    };

    const closeEmergencyTerminal = () => {
      dom.terminalOverlay.classList.remove('active');
      state.terminalTargetIndex = null;
    };

    dom.terminalCloseBtn.addEventListener('click', closeEmergencyTerminal);
    dom.terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeEmergencyTerminal();
      } else if (e.key === 'Enter') {
        const cmd = dom.terminalInput.value.trim().toLowerCase();
        if (cmd === 'kill' || cmd === 'fix') {
          if (state.terminalTargetIndex !== null) {
            remediateRedPod(state.terminalTargetIndex);
            closeEmergencyTerminal();
          }
        } else {
          sound.playPenalty();
          dom.terminalInput.value = '';
        }
      }
    });

    // Keyboard controls
    const onKeyDown = (e) => {
      if (dom.terminalOverlay.classList.contains('active')) return;

      if (e.key === 's' || e.key === 'S') {
        if (state.hoveredPodIndex !== null) {
          remediateYellowPod(state.hoveredPodIndex);
        }
      } else if (e.key === 'a' || e.key === 'A') {
        triggerAutoscaler();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    dom.autoscalerBtn.addEventListener('click', triggerAutoscaler);

    // Chaos Spawns & Game Tick Interval
    let lastSecondTime = performance.now();
    let nextSpawnTime = performance.now() + 500;

    const onGameTick = () => {
      if (!state.running || state.paused) return;

      const now = performance.now();

      // Drain cluster health if critical red pods are active (5% per second)
      const criticalCount = state.pods.filter(p => p.state === 'critical').length;
      if (criticalCount > 0) {
        state.systemHealth = Math.max(0, state.systemHealth - (criticalCount * 0.5));
      }

      // Check SLA thresholds
      if (state.systemHealth <= 0) {
        endRound(false, 'Infrastructure Collapse: Cluster Health reached 0%');
        return;
      }

      // 1-Second Timer Updates
      if (now - lastSecondTime >= 1000) {
        state.timeRemainingSec--;
        lastSecondTime = now;
        dom.timeRemaining.textContent = `${state.timeRemainingSec}s`;

        // SLA points
        if (state.systemHealth >= 80.0) {
          state.score += 50;
          state.totalUptimeTicks++;
        } else if (state.systemHealth < 30.0) {
          state.score = Math.max(0, state.score - 100);
          state.totalDowntimeTicks++;
        }
        dom.scoreVal.textContent = state.score.toLocaleString();

        // T-45s Traffic Spike: 6 random healthy pods become yellow
        if (state.timeRemainingSec === 45 && !state.trafficSpikeFired) {
          state.trafficSpikeFired = true;
          logEvent('⚡ TRAFFIC SPIKE INCOMING! 6 nodes transitioning to High CPU.', 'warning');
          const healthy = state.pods.filter(p => p.state === 'healthy');
          healthy.slice(0, 6).forEach(p => setPodState(p.index, 'warning', 'high-cpu'));
        }

        // T-20s Chaos Monkey: 8 random pods abruptly crash to Critical Red!
        if (state.timeRemainingSec === 20 && !state.chaosMonkeyFired) {
          state.chaosMonkeyFired = true;
          document.body.classList.add('screen-shake');
          sound.playChaosSiren();
          setTimeout(() => document.body.classList.remove('screen-shake'), 1200);
          logEvent('💥 CHAOS MONKEY UNLEASHED! 8 Pods Crashed Directly to Deadlock!', 'critical');
          const available = state.pods.filter(p => p.state !== 'critical');
          available.slice(0, 8).forEach(p => setPodState(p.index, 'critical'));
        }

        if (state.timeRemainingSec <= 0) {
          endRound(true, 'Shift Survived! 60 seconds elapsed with cluster online.');
          return;
        }
      }

      // Combo timer countdown
      if (state.comboMultiplierActive) {
        const remainingComboMs = Math.max(0, state.comboEndTime - now);
        dom.comboTimerVal.textContent = `${(remainingComboMs / 1000).toFixed(1)}s`;
        if (remainingComboMs <= 0) {
          state.comboMultiplierActive = false;
          dom.comboBadge.classList.remove('active');
        }
      }

      // Autoscaler cooldown fill
      if (now < state.autoscalerCooldownEnd) {
        const remainingCd = state.autoscalerCooldownEnd - now;
        const pct = (remainingCd / AUTOSCALER_COOLDOWN_MS) * 100;
        dom.autoscalerCooldownBar.style.width = `${pct}%`;
        dom.autoscalerBtn.disabled = true;
      } else {
        dom.autoscalerCooldownBar.style.width = '0%';
        dom.autoscalerBtn.disabled = false;
      }

      // Random Incident Spawning
      if (now >= nextSpawnTime) {
        nextSpawnTime = now + (Math.random() * 1200 + 800);
        const healthy = state.pods.filter(p => p.state === 'healthy');
        if (healthy.length > 0) {
          const target = healthy[Math.floor(Math.random() * healthy.length)];
          const roll = Math.random();
          if (roll < 0.08) {
            setPodState(target.index, 'ghost');
          } else if (state.timeRemainingSec <= 25 && roll < 0.25) {
            setPodState(target.index, 'critical');
            logEvent(`💥 Sudden crash on ${target.id}`, 'critical');
          } else {
            const wType = Math.random() < 0.5 ? 'crash-loop' : 'high-cpu';
            setPodState(target.index, 'warning', wType);
          }
        }
      }

      // Update Health Meter UI
      dom.systemHealthVal.textContent = `${Math.round(state.systemHealth)}%`;
      dom.healthFill.style.width = `${state.systemHealth}%`;
      if (state.systemHealth >= 70) dom.healthFill.className = 'health-meter-fill';
      else if (state.systemHealth >= 35) dom.healthFill.className = 'health-meter-fill yellow';
      else dom.healthFill.className = 'health-meter-fill red';
    };

    this.gameTickInterval = setInterval(onGameTick, TICK_INTERVAL_MS);
    logEvent(`🟢 Shift Started for ${portalState.participant?.full_name || 'OPERATOR'}. Cluster online.`, 'event');

    // End Round Function
    const endRound = async (survived, reason) => {
      if (this.isFinished) return;
      this.isFinished = true;
      state.running = false;
      if (this.gameTickInterval) clearInterval(this.gameTickInterval);

      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('mouseup', cancelHoldReboot);
      document.body.classList.remove('screen-shake');

      if (survived) sound.playVictory();
      else sound.playGameOver();

      const totalSaved = state.yellowResolvedCount + state.redResolvedCount;
      let avgMttr = '0.0s';
      if (state.recoveryTimes.length > 0) {
        const sum = state.recoveryTimes.reduce((a, b) => a + b, 0);
        avgMttr = `${((sum / state.recoveryTimes.length) / 1000).toFixed(2)}s`;
      }

      dom.resultTitle.textContent = survived ? 'SHIFT SURVIVED' : 'CLUSTER CRASHED';
      dom.resultTitle.style.color = survived ? 'var(--neon-green)' : 'var(--neon-red)';
      dom.resultSubtitle.textContent = reason;
      dom.resultScore.textContent = state.score.toLocaleString();
      dom.resultPodsSaved.textContent = totalSaved;
      dom.resultCombo.textContent = `${state.longestCombo}x`;
      dom.resultMttr.textContent = avgMttr;

      // Submit official score to Supabase via portalState
      await portalState.submitRoundResult(1, {
        gameName: 'Server Sniper',
        score: state.score,
        maximumScore: 30000,
        streak: state.longestCombo,
        completionStatus: survived ? 'completed' : 'failed',
        successfulActions: totalSaved,
        totalActions: totalSaved + state.falseAlarmsHit
      });

      dom.completionModal.style.display = 'flex';
      dom.completionModal.classList.remove('hidden');

      dom.btnNextRound.addEventListener('click', () => {
        portalState.goToScreen('round2_intro');
      });
    };
  }

  escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
