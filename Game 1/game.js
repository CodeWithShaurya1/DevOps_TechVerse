/**
 * SERVER SNIPER (CHAOS EDITION) - GAME ENGINE
 * Full implementation adhering to the PRD & Change Log specifications.
 */

(function() {
  'use strict';

  // --- AUDIO SYNTHESIS ENGINE (Web Audio API) ---
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.muted = false;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.15) {
      if (this.muted || !this.ctx) return;
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
      } catch (e) {}
    }

    playClick() {
      this.playTone(800, 'triangle', 0.04, 0.08);
    }

    playScale() {
      // Pleasant upward two-tone chime
      this.playTone(523.25, 'sine', 0.12, 0.2); // C5
      setTimeout(() => this.playTone(659.25, 'sine', 0.18, 0.2), 60); // E5
    }

    playCrashLoop() {
      // Glitchy double restart stutter
      this.playTone(320, 'sawtooth', 0.05, 0.15);
      setTimeout(() => this.playTone(480, 'sawtooth', 0.07, 0.18), 65);
    }

    playReboot() {
      // Rich low synth reboot sweep
      if (this.muted || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.38);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.4);
      } catch (e) {}
    }

    playCombo() {
      // 4-note ascending fanfare
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        setTimeout(() => this.playTone(freq, 'triangle', 0.15, 0.25), idx * 80);
      });
    }

    playPenalty() {
      // Harsh low buzzer
      this.playTone(130, 'sawtooth', 0.2, 0.3);
    }

    playChaosSiren() {
      // Modulated siren for Chaos Monkey
      if (this.muted || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        const now = this.ctx.currentTime;
        // Frequency sweep up and down twice
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.linearRampToValueAtTime(950, now + 0.4);
        osc.frequency.linearRampToValueAtTime(450, now + 0.8);
        osc.frequency.linearRampToValueAtTime(950, now + 1.2);
        osc.frequency.linearRampToValueAtTime(450, now + 1.6);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 1.8);
      } catch (e) {}
    }

    playVictory() {
      const chords = [523.25, 659.25, 783.99, 1046.5];
      chords.forEach((n, i) => {
        setTimeout(() => this.playTone(n, 'triangle', 0.35, 0.2), i * 120);
      });
    }

    playGameOver() {
      const notes = [440, 370, 311, 220];
      notes.forEach((n, i) => {
        setTimeout(() => this.playTone(n, 'sawtooth', 0.3, 0.25), i * 150);
      });
    }

    toggleMute() {
      this.muted = !this.muted;
      return this.muted;
    }
  }

  // --- GAME CONSTANTS & CONFIGURATION (ACCELERATED FAST PACING) ---
  const DEFAULT_ROUND_DURATION_SEC = 45; // Fast 45s Blitz default
  const TICK_INTERVAL_MS = 100; // 10 ticks per second
  const WARNING_TO_RED_MS = 2200; // 2.2 seconds until yellow pod degrades to red
  const GHOST_DURATION_MS = 1800; // Ghost pod disappears after 1.8s
  const HOLD_REBOOT_DURATION_MS = 1000; // 1.0 second hold to reboot red pod (fast & snappy)
  const AUTOSCALER_COOLDOWN_MS = 12000; // 12s cooldown (tuned for fast rounds)
  const COMBO_WINDOW_MS = 2000; // 3 fixes within 2s triggers combo
  const COMBO_DURATION_MS = 5000; // 2x multiplier lasts 5 seconds

  // --- GAME STATE ---
  const state = {
    running: false,
    paused: false,
    playerHandle: 'ANON_SRE',
    roundDurationSec: DEFAULT_ROUND_DURATION_SEC,
    timeRemainingSec: DEFAULT_ROUND_DURATION_SEC,
    systemHealth: 100.0,
    score: 0,
    pods: [], // 36 pods
    hoveredPodIndex: null,
    
    // Autoscaler
    autoscalerCooldownEnd: 0,
    
    // Hold click state
    holdingPodIndex: null,
    holdStartTime: 0,
    holdTimerRef: null,
    
    // Combo Tracking
    recentFixTimestamps: [], // timestamps of recent fixes
    comboActiveUntil: 0,
    longestCombo: 0,
    currentComboCount: 0,
    
    // Stats for post-game report
    yellowResolvedCount: 0,
    highCpuResolvedCount: 0,
    crashLoopsResolvedCount: 0,
    redResolvedCount: 0,
    falseAlarmsHit: 0,
    totalDowntimeTicks: 0,
    totalUptimeTicks: 0,
    recoveryTimes: [], // array of ms taken to resolve pods
    
    // Scripted events trigger flags
    trafficSpikeFired: false,
    chaosMonkeyFired: false,
    
    // Spawner timers
    nextSpawnTime: 0
  };

  const sound = new SoundEngine();

  // --- DOM REFERENCES ---
  const dom = {
    // Headers & HUD
    timeRemaining: document.getElementById('time-remaining'),
    totalTimeBadge: document.getElementById('total-time-badge'),
    systemHealthVal: document.getElementById('system-health-val'),
    healthFill: document.getElementById('health-meter-fill'),
    scoreVal: document.getElementById('score-val'),
    comboBadge: document.getElementById('combo-badge'),
    comboTimerVal: document.getElementById('combo-timer-val'),
    playerHandleDisplay: document.getElementById('player-handle-display'),
    
    // Status counts
    healthyCount: document.getElementById('healthy-count'),
    warningCount: document.getElementById('warning-count'),
    criticalCount: document.getElementById('critical-count'),
    
    // Controls
    gridContainer: document.getElementById('pod-grid'),
    loadBalancerTool: document.getElementById('load-balancer-tool'),
    autoscalerBtn: document.getElementById('autoscaler-btn'),
    autoscalerCooldownBar: document.getElementById('autoscaler-cooldown-bar'),
    eventLog: document.getElementById('event-log'),
    muteBtn: document.getElementById('mute-btn'),
    pauseBtn: document.getElementById('pause-btn'),
    
    // Mini Terminal Modal
    terminalOverlay: document.getElementById('terminal-overlay'),
    terminalPromptTarget: document.getElementById('terminal-target-label'),
    terminalInput: document.getElementById('terminal-input'),
    terminalCloseBtn: document.getElementById('terminal-close-btn'),
    
    // Start Modal
    startModal: document.getElementById('start-modal'),
    handleInput: document.getElementById('handle-input'),
    startBtn: document.getElementById('start-btn'),
    
    // Countdown Modal
    countdownOverlay: document.getElementById('countdown-overlay'),
    countdownNumber: document.getElementById('countdown-number'),
    
    // Result Modal
    resultModal: document.getElementById('result-modal'),
    resultTitle: document.getElementById('result-title'),
    resultSubtitle: document.getElementById('result-subtitle'),
    resultScore: document.getElementById('result-score'),
    resultPodsSaved: document.getElementById('result-pods-saved'),
    resultHighCpu: document.getElementById('result-high-cpu'),
    resultCrashLoops: document.getElementById('result-crash-loops'),
    resultMttr: document.getElementById('result-mttr'),
    resultCombo: document.getElementById('result-combo'),
    resultUptime: document.getElementById('result-uptime'),
    syncStatusBadge: document.getElementById('sync-status-badge'),
    resultLeaderboardList: document.getElementById('result-leaderboard-list'),
    restartBtn: document.getElementById('restart-btn'),
    
    // Side Preview Leaderboard
    sideLeaderboardList: document.getElementById('side-leaderboard-list'),
    
    // Floating Notification
    floatingAlert: document.getElementById('floating-alert')
  };

  // --- INITIALIZATION ---
  function init() {
    createPodGrid();
    setupEventListeners();
    setupLeaderboardWatcher();
    logEvent('System initialized. Ready for Kubernetes incident response.', 'event');
  }

  // --- CREATE 6x6 POD GRID ---
  function createPodGrid() {
    dom.gridContainer.innerHTML = '';
    state.pods = [];

    for (let i = 0; i < 36; i++) {
      const podId = `pod-${String(i + 1).padStart(2, '0')}`;
      const podEl = document.createElement('div');
      podEl.className = 'pod-node state-healthy';
      podEl.dataset.index = i;
      podEl.dataset.id = podId;

      podEl.innerHTML = `
        <div class="pod-top-row">
          <span class="pod-label">${podId}</span>
          <span class="pod-indicator"></span>
        </div>
        <div class="pod-center-content">
          <span class="pod-icon">🟢</span>
          <span class="pod-status-text">HEALTHY</span>
        </div>
        <div class="pod-countdown-bar"></div>
        <svg class="hold-ring-svg" viewBox="0 0 54 54">
          <circle class="hold-ring-bg" cx="27" cy="27" r="22.5" />
          <circle class="hold-ring-progress" cx="27" cy="27" r="22.5" />
        </svg>
      `;

      dom.gridContainer.appendChild(podEl);

      state.pods.push({
        id: podId,
        index: i,
        element: podEl,
        state: 'healthy', // 'healthy', 'warning', 'critical', 'ghost'
        subType: 'none', // 'high-cpu', 'crash-loop', 'none'
        restartCount: 0,
        warningDuration: WARNING_TO_RED_MS,
        warningSpawnTime: 0,
        ghostExpiryTime: 0,
        stateStartTime: performance.now(),
        countdownBar: podEl.querySelector('.pod-countdown-bar'),
        holdSvg: podEl.querySelector('.hold-ring-svg'),
        holdCircle: podEl.querySelector('.hold-ring-progress'),
        iconEl: podEl.querySelector('.pod-icon'),
        statusTextEl: podEl.querySelector('.pod-status-text')
      });
    }

    updatePodMetricCounts();
  }

  // --- POD STATE TRANSITIONS ---
  function setPodState(index, newState, subType = 'high-cpu') {
    const pod = state.pods[index];
    if (!pod) return;

    pod.state = newState;
    pod.stateStartTime = performance.now();
    pod.element.className = `pod-node state-${newState}`;

    // Reset hold ring if state changes
    pod.holdSvg.style.display = 'none';
    pod.countdownBar.style.width = '0%';

    if (newState === 'healthy') {
      pod.iconEl.textContent = '🟢';
      pod.statusTextEl.textContent = 'HEALTHY';
      pod.element.classList.remove('type-crash-loop');
      pod.subType = 'none';
      pod.restartCount = 0;
    } else if (newState === 'warning') {
      pod.warningSpawnTime = performance.now();
      pod.subType = subType;

      if (subType === 'crash-loop') {
        pod.restartCount = (pod.restartCount || 0) + 1;
        pod.iconEl.textContent = '🔄';
        pod.statusTextEl.textContent = 'CRASH LOOP';
        pod.element.classList.add('type-crash-loop');
        pod.warningDuration = 2400; // Crash loop fails faster
        sound.playCrashLoop();
        logEvent(`🔄 ${pod.id} entered CrashLoopBackOff (Restart #${pod.restartCount})!`, 'warning');
      } else {
        pod.iconEl.textContent = '⚠️';
        pod.statusTextEl.textContent = 'HIGH CPU';
        pod.element.classList.remove('type-crash-loop');
        pod.warningDuration = WARNING_TO_RED_MS;
        logEvent(`⚠️ ${pod.id} High CPU load detected (Memory Spike)`, 'warning');
      }
    } else if (newState === 'critical') {
      pod.iconEl.textContent = '🔥';
      if (pod.subType === 'crash-loop') {
        pod.statusTextEl.textContent = 'CRASHED (LOOP)';
      } else {
        pod.statusTextEl.textContent = 'CRASHED';
      }
      pod.element.classList.remove('type-crash-loop');
    } else if (newState === 'ghost') {
      pod.iconEl.textContent = '👻';
      pod.statusTextEl.textContent = 'FALSE ALARM';
      pod.ghostExpiryTime = performance.now() + GHOST_DURATION_MS;
      pod.element.classList.remove('type-crash-loop');
      pod.subType = 'none';
    }

    updatePodMetricCounts();
  }

  function updatePodMetricCounts() {
    let healthy = 0, warning = 0, critical = 0;
    state.pods.forEach(p => {
      if (p.state === 'healthy') healthy++;
      else if (p.state === 'warning') warning++;
      else if (p.state === 'critical') critical++;
    });

    if (dom.healthyCount) dom.healthyCount.textContent = healthy;
    if (dom.warningCount) dom.warningCount.textContent = warning;
    if (dom.criticalCount) dom.criticalCount.textContent = critical;
  }

  // --- ACTION: QUICK SCALE-UP (S KEY) & LOAD BALANCER DRAG ---
  function handleScaleYellow(index, method = 'Key [S]') {
    const pod = state.pods[index];
    if (!pod) return;

    // Wrong-action penalty check:
    if (pod.state !== 'warning') {
      if (pod.state === 'ghost') {
        // Ghost pod hit penalty
        applyScoreChange(-150);
        state.falseAlarmsHit++;
        sound.playPenalty();
        showNotification(`⚠️ GHOST POD TRIGGERED! -150 PTS`);
        logEvent(`Penalty: False alarm triggered on ${pod.id} (-150)`, 'penalty');
        setPodState(index, 'healthy');
      } else {
        // Mashing S on healthy or critical
        applyScoreChange(-25);
        sound.playPenalty();
        showNotification(`MISFIRE ON ${pod.id.toUpperCase()}: -25 PTS`);
        logEvent(`Penalty: Incorrect action on ${pod.id} (-25)`, 'penalty');
      }
      return;
    }

    // Success: Resolving Warning Pod
    const duration = performance.now() - pod.stateStartTime;
    state.recoveryTimes.push(duration);
    state.yellowResolvedCount++;

    const isCrashLoop = pod.subType === 'crash-loop';
    if (isCrashLoop) {
      state.crashLoopsResolvedCount++;
    } else {
      state.highCpuResolvedCount++;
    }

    setPodState(index, 'healthy');
    sound.playScale();

    // Base +200 points
    const fixDesc = isCrashLoop
      ? `Broke CrashLoop on ${pod.id} via ${method}`
      : `Scaled up High CPU on ${pod.id} via ${method}`;
    registerFixSuccess(200, fixDesc);
  }

  // --- ACTION: HARD REBOOT (HOLD CLICK 1.5s) ---
  function startHoldReboot(index) {
    if (!state.running || state.paused) return;
    const pod = state.pods[index];
    if (!pod || pod.state !== 'critical') return;

    state.holdingPodIndex = index;
    state.holdStartTime = performance.now();

    pod.holdSvg.style.display = 'block';
    pod.holdCircle.style.strokeDashoffset = '141.37'; // full circumference: 2 * PI * 22.5 = 141.37

    if (state.holdTimerRef) clearInterval(state.holdTimerRef);

    state.holdTimerRef = setInterval(() => {
      if (state.holdingPodIndex !== index || pod.state !== 'critical') {
        cancelHoldReboot();
        return;
      }

      const elapsed = performance.now() - state.holdStartTime;
      const progress = Math.min(1, elapsed / HOLD_REBOOT_DURATION_MS);
      const offset = 141.37 * (1 - progress);
      pod.holdCircle.style.strokeDashoffset = offset;

      if (progress >= 1) {
        // Hold complete!
        cancelHoldReboot();
        completeHoldReboot(index);
      }
    }, 30);
  }

  function cancelHoldReboot() {
    if (state.holdTimerRef) {
      clearInterval(state.holdTimerRef);
      state.holdTimerRef = null;
    }
    if (state.holdingPodIndex !== null) {
      const pod = state.pods[state.holdingPodIndex];
      if (pod && pod.holdSvg) {
        pod.holdSvg.style.display = 'none';
        pod.holdCircle.style.strokeDashoffset = '141.37';
      }
      state.holdingPodIndex = null;
    }
  }

  function completeHoldReboot(index) {
    const pod = state.pods[index];
    if (!pod || pod.state !== 'critical') return;

    const duration = performance.now() - pod.stateStartTime;
    state.recoveryTimes.push(duration);
    state.redResolvedCount++;

    setPodState(index, 'healthy');
    sound.playReboot();

    // Base +500 points
    registerFixSuccess(500, `Hard reboot completed on ${pod.id}`);
  }

  // --- ACTION: EMERGENCY TERMINAL (DOUBLE-CLICK + KILL / FIX) ---
  let activeTerminalPodIndex = null;

  function openEmergencyTerminal(index) {
    if (!state.running || state.paused) return;
    const pod = state.pods[index];
    if (!pod || pod.state !== 'critical') return;

    cancelHoldReboot();
    activeTerminalPodIndex = index;

    const isCrashLoop = pod.subType === 'crash-loop';
    const alertTag = isCrashLoop ? 'CRASH LOOP [Exit 1]' : 'DEADLOCKED [Exit 137]';
    dom.terminalPromptTarget.textContent = `${pod.id} [${alertTag}]`;
    dom.terminalInput.value = '';
    dom.terminalOverlay.classList.add('active');
    setTimeout(() => dom.terminalInput.focus(), 50);
  }

  function closeEmergencyTerminal() {
    dom.terminalOverlay.classList.remove('active');
    activeTerminalPodIndex = null;
  }

  function handleTerminalCommand() {
    if (activeTerminalPodIndex === null) return;
    const cmd = dom.terminalInput.value.trim().toLowerCase();
    const pod = state.pods[activeTerminalPodIndex];

    if (!pod || pod.state !== 'critical') {
      closeEmergencyTerminal();
      return;
    }

    if (cmd === 'kill' || cmd === 'fix' || cmd === 'kubectl delete' || cmd === 'restart' || cmd === 'rollback' || cmd === 'patch') {
      const duration = performance.now() - pod.stateStartTime;
      state.recoveryTimes.push(duration);
      state.redResolvedCount++;

      const isCrashLoop = pod.subType === 'crash-loop';
      if (isCrashLoop) {
        state.crashLoopsResolvedCount++;
      }

      setPodState(activeTerminalPodIndex, 'healthy');
      sound.playReboot();
      closeEmergencyTerminal();

      const fixDesc = isCrashLoop
        ? `Emergency patch '${cmd}' fixed CrashLoop on ${pod.id}`
        : `Emergency command '${cmd}' executed on ${pod.id}`;
      registerFixSuccess(500, fixDesc);
    } else {
      sound.playPenalty();
      dom.terminalInput.value = '';
      dom.terminalInput.placeholder = 'INVALID CMD! Type "kill" or "fix"';
    }
  }

  // --- ACTION: AUTOSCALER (KEY [A] OR BUTTON) ---
  function triggerAutoscaler() {
    if (!state.running || state.paused) return;
    const now = performance.now();
    if (now < state.autoscalerCooldownEnd) {
      sound.playPenalty();
      const remainingSec = Math.ceil((state.autoscalerCooldownEnd - now) / 1000);
      showNotification(`Autoscaler recharging (${remainingSec}s remaining)`);
      return;
    }

    // Set 20s cooldown
    state.autoscalerCooldownEnd = now + AUTOSCALER_COOLDOWN_MS;
    dom.autoscalerBtn.disabled = true;

    // Find all yellow pods
    const yellowPods = state.pods.filter(p => p.state === 'warning');
    if (yellowPods.length === 0) {
      showNotification('Autoscaler fired: No high-CPU pods active');
      logEvent('Autoscaler triggered: 0 warning pods found', 'info');
      sound.playTone(350, 'triangle', 0.1);
      return;
    }

    logEvent(`⚡ AUTOSCALER ACTIVATED! Clearing ${yellowPods.length} pods!`, 'event');
    showNotification(`⚡ AUTOSCALER CLEARED ${yellowPods.length} PODS!`);

    yellowPods.forEach(pod => {
      const duration = performance.now() - pod.stateStartTime;
      state.recoveryTimes.push(duration);
      state.yellowResolvedCount++;
      setPodState(pod.index, 'healthy');
      registerFixSuccess(200, `Autoscaled ${pod.id}`);
    });

    sound.playScale();
  }

  // --- SCORING, COMBO MULTIPLIER & FIX SUCCESS ---
  function registerFixSuccess(basePoints, logMsg) {
    const now = performance.now();

    // Track fix timestamp for combo detection (3 fixes within 2 seconds)
    state.recentFixTimestamps.push(now);
    // Keep only timestamps within last 2 seconds
    state.recentFixTimestamps = state.recentFixTimestamps.filter(t => now - t <= COMBO_WINDOW_MS);

    if (state.recentFixTimestamps.length >= 3) {
      activateCombo(now);
    }

    // Check if 2x multiplier is active
    let multiplier = 1;
    if (now < state.comboActiveUntil) {
      multiplier = 2;
    }

    const earned = basePoints * multiplier;
    applyScoreChange(earned);

    if (multiplier === 2) {
      logEvent(`✅ ${logMsg} (+${earned} pts [2x Combo])`, 'success');
    } else {
      logEvent(`✅ ${logMsg} (+${earned} pts)`, 'success');
    }
  }

  function activateCombo(now) {
    state.comboActiveUntil = now + COMBO_DURATION_MS;
    state.currentComboCount++;
    if (state.currentComboCount > state.longestCombo) {
      state.longestCombo = state.currentComboCount;
    }

    sound.playCombo();
    dom.comboBadge.classList.add('active');
    showNotification('🔥 2X COMBO MULTIPLIER ACTIVATED! (5s)');
    logEvent('🔥 MULTIPLIER: 3 fixes under 2s! 2x Points active for 5s!', 'event');
  }

  function applyScoreChange(delta) {
    state.score = Math.max(0, state.score + delta);
    dom.scoreVal.textContent = state.score.toLocaleString();
  }

  // --- SCRIPTED CHAOS EVENTS ---
  function fireTrafficSpike() {
    state.trafficSpikeFired = true;
    logEvent('🚨 TRAFFIC SPIKE INCOMING! 6 pods struggling with High CPU & Crash Loops!', 'warning');
    showNotification('⚠️ T-45s: TRAFFIC SPIKE! HIGH CPU & CRASH LOOPS');
    sound.playChaosSiren();

    // Turn 6 random healthy pods yellow (mix of High CPU and Crash Loops)
    const healthy = state.pods.filter(p => p.state === 'healthy');
    shuffle(healthy);
    const targets = healthy.slice(0, 6);
    targets.forEach((p, idx) => {
      const type = idx % 2 === 0 ? 'high-cpu' : 'crash-loop';
      setPodState(p.index, 'warning', type);
    });
  }

  function fireChaosMonkey() {
    state.chaosMonkeyFired = true;
    logEvent('💥 CHAOS MONKEY STRIKES! 8 pods abruptly crashed! System health draining!', 'critical');
    showNotification('💥 T-20s: CHAOS MONKEY OUTAGE! REBOOT NOW!');
    sound.playChaosSiren();

    // Screen Shake effect
    document.body.classList.add('screen-shake');
    setTimeout(() => {
      document.body.classList.remove('screen-shake');
    }, 2500);

    // Turn 8 random pods directly to red (critical)
    const available = state.pods.filter(p => p.state !== 'critical');
    shuffle(available);
    const targets = available.slice(0, 8);
    targets.forEach(p => setPodState(p.index, 'critical'));
  }

  // --- MAIN TICK LOOP (100ms) ---
  let gameTickInterval = null;
  let lastSecondTime = performance.now();

  function onGameTick() {
    if (!state.running || state.paused) return;

    const now = performance.now();

    // 1. Countdown round timer
    state.timeRemainingSec = Math.max(0, state.timeRemainingSec - 0.1);
    dom.timeRemaining.textContent = `${Math.ceil(state.timeRemainingSec)}s`;

    // 2. Scripted Events Triggers (proportional to round duration)
    const trafficSpikeTime = state.roundDurationSec * 0.75;
    const chaosMonkeyTime = state.roundDurationSec * 0.33;

    if (!state.trafficSpikeFired && state.timeRemainingSec <= trafficSpikeTime) {
      fireTrafficSpike();
    }
    if (!state.chaosMonkeyFired && state.timeRemainingSec <= chaosMonkeyTime) {
      fireChaosMonkey();
    }

    // 3. Health degradation: Each active red pod drains 5% per second (0.5% per 100ms)
    let criticalCount = 0;
    state.pods.forEach(p => {
      if (p.state === 'critical') criticalCount++;
    });

    if (criticalCount > 0) {
      const healthDrain = criticalCount * 0.5; // 5% per second = 0.5% per 100ms tick
      state.systemHealth = Math.max(0, state.systemHealth - healthDrain);
    }

    // Update Health Bar UI
    dom.systemHealthVal.textContent = `${Math.round(state.systemHealth)}%`;
    dom.healthFill.style.width = `${state.systemHealth}%`;

    dom.healthFill.classList.toggle('warning', state.systemHealth < 60 && state.systemHealth >= 30);
    dom.healthFill.classList.toggle('critical', state.systemHealth < 30);

    // Instant Game Over Check: 0% Health
    if (state.systemHealth <= 0) {
      endGame(false, 'INFRASTRUCTURE COLLAPSE: System health reached 0%');
      return;
    }

    // Round Time Expired
    if (state.timeRemainingSec <= 0) {
      endGame(true, `SHIFT COMPLETED: ${state.roundDurationSec}s production window survived!`);
      return;
    }

    // 4. Per-Second Score Bonuses & Penalties
    if (now - lastSecondTime >= 1000) {
      lastSecondTime = now;
      if (state.systemHealth >= 80.0) {
        // +50 Uptime Bonus
        applyScoreChange(50);
        state.totalUptimeTicks++;
      } else if (state.systemHealth < 30.0) {
        // -100 Downtime Penalty
        applyScoreChange(-100);
        state.totalDowntimeTicks++;
        sound.playPenalty();
      }
    }

    // 5. Warning Pod Degradation Check (Degrades to Red after 2.4s - 3s)
    state.pods.forEach(pod => {
      if (pod.state === 'warning') {
        const durationLimit = pod.warningDuration || WARNING_TO_RED_MS;
        const elapsed = now - pod.warningSpawnTime;
        const pct = Math.min(100, (elapsed / durationLimit) * 100);
        pod.countdownBar.style.width = `${pct}%`;

        if (elapsed >= durationLimit) {
          setPodState(pod.index, 'critical');
          const reason = pod.subType === 'crash-loop' ? 'CrashLoopBackOff failed!' : 'High CPU timed out!';
          logEvent(`💥 Pod ${pod.id} ${reason} Escalated to CRITICAL crash state!`, 'critical');
          sound.playTone(200, 'sawtooth', 0.15, 0.2);
        }
      } else if (pod.state === 'ghost') {
        if (now >= pod.ghostExpiryTime) {
          setPodState(pod.index, 'healthy');
        }
      }
    });

    // 6. Combo Status Countdown
    if (now < state.comboActiveUntil) {
      const remainingComboSec = ((state.comboActiveUntil - now) / 1000).toFixed(1);
      dom.comboBadge.classList.add('active');
      dom.comboTimerVal.textContent = `${remainingComboSec}s`;
    } else {
      dom.comboBadge.classList.remove('active');
      state.currentComboCount = 0;
    }

    // 7. Autoscaler Cooldown Bar
    if (now < state.autoscalerCooldownEnd) {
      const remaining = state.autoscalerCooldownEnd - now;
      const pct = (remaining / AUTOSCALER_COOLDOWN_MS) * 100;
      dom.autoscalerCooldownBar.style.width = `${pct}%`;
      dom.autoscalerBtn.disabled = true;
    } else {
      dom.autoscalerCooldownBar.style.width = '0%';
      dom.autoscalerBtn.disabled = false;
    }

    // 8. Dynamic Spawning
    if (now >= state.nextSpawnTime) {
      scheduleNextSpawn(now);
    }
  }

  // --- DYNAMIC INCIDENT SPAWNER (FAST ACCELERATED DIFFICULTY) ---
  function scheduleNextSpawn(now) {
    // Dynamic difficulty: spawns get faster as time remaining decreases
    // Starts at ~950ms spawn interval, ramps down to ~380ms for rapid reaction
    const elapsedSec = state.roundDurationSec - state.timeRemainingSec;
    const progressFactor = Math.min(1, elapsedSec / state.roundDurationSec);
    const interval = Math.max(380, 950 - (progressFactor * 550));
    state.nextSpawnTime = now + interval;

    // Pick a candidate pod that is currently healthy
    const healthyPods = state.pods.filter(p => p.state === 'healthy');
    if (healthyPods.length === 0) return;

    const randomPod = healthyPods[Math.floor(Math.random() * healthyPods.length)];

    // Roll for type of spawn:
    // 8% chance: Ghost pod (false alarm)
    // In late game (last 35% time): 20% chance to spawn directly as critical red
    // Otherwise: Warning yellow pod (50% High CPU, 50% CrashLoopBackOff)
    const roll = Math.random();
    if (roll < 0.08) {
      setPodState(randomPod.index, 'ghost');
    } else if (state.timeRemainingSec <= state.roundDurationSec * 0.35 && roll < 0.25) {
      setPodState(randomPod.index, 'critical');
      logEvent(`💥 Sudden crash on ${randomPod.id}`, 'critical');
    } else {
      const warningType = Math.random() < 0.5 ? 'crash-loop' : 'high-cpu';
      setPodState(randomPod.index, 'warning', warningType);
    }
  }

  // --- START GAME & 3-2-1 COUNTDOWN ---
  function startShiftSequence() {
    const handle = dom.handleInput.value.trim().toUpperCase() || 'SRE_PILOT';
    state.playerHandle = handle.slice(0, 12);
    dom.playerHandleDisplay.textContent = state.playerHandle;

    dom.startModal.classList.add('hidden');
    dom.resultModal.classList.add('hidden');
    sound.init();

    // Check if tournament iframe already did the dimensional warp countdown
    const urlParams = new URLSearchParams(window.location.search);
    const isTournament = urlParams.get('skip_countdown') === 'true' || urlParams.get('round') || (window.parent && window.parent !== window);
    if (isTournament) {
      if (dom.countdownOverlay) dom.countdownOverlay.classList.remove('active');
      beginRound();
      return;
    }

    // Fast snappy 3-2-1 Countdown (for standalone mode only)
    dom.countdownOverlay.classList.add('active');
    let count = 3;
    dom.countdownNumber.textContent = count;
    sound.playTone(440, 'triangle', 0.08, 0.2);

    const countInterval = setInterval(() => {
      count--;
      if (count > 0) {
        dom.countdownNumber.textContent = count;
        sound.playTone(440, 'triangle', 0.08, 0.2);
      } else if (count === 0) {
        dom.countdownNumber.textContent = 'GO!';
        sound.playTone(880, 'triangle', 0.2, 0.3);
      } else {
        clearInterval(countInterval);
        dom.countdownOverlay.classList.remove('active');
        beginRound();
      }
    }, 550);
  }

  function beginRound() {
    // Reset state
    state.running = true;
    state.paused = false;
    state.timeRemainingSec = state.roundDurationSec;
    state.systemHealth = 100.0;
    state.score = 0;
    state.yellowResolvedCount = 0;
    state.highCpuResolvedCount = 0;
    state.crashLoopsResolvedCount = 0;
    state.redResolvedCount = 0;
    state.falseAlarmsHit = 0;
    state.totalDowntimeTicks = 0;
    state.totalUptimeTicks = 0;
    state.recoveryTimes = [];
    state.longestCombo = 0;
    state.currentComboCount = 0;
    state.trafficSpikeFired = false;
    state.chaosMonkeyFired = false;
    state.autoscalerCooldownEnd = 0;
    state.nextSpawnTime = performance.now() + 600;
    lastSecondTime = performance.now();

    // Reset pods
    for (let i = 0; i < 36; i++) {
      setPodState(i, 'healthy');
    }

    dom.scoreVal.textContent = '0';
    dom.timeRemaining.textContent = `${state.roundDurationSec}s`;
    if (dom.totalTimeBadge) dom.totalTimeBadge.textContent = `${state.roundDurationSec}s TOTAL`;
    dom.systemHealthVal.textContent = '100%';
    dom.healthFill.style.width = '100%';
    dom.healthFill.className = 'health-meter-fill';
    dom.comboBadge.classList.remove('active');

    if (gameTickInterval) clearInterval(gameTickInterval);
    gameTickInterval = setInterval(onGameTick, TICK_INTERVAL_MS);

    logEvent(`🟢 Shift started by ${state.playerHandle}. Kubernetes cluster active!`, 'event');
  }

  // --- END GAME & POST-GAME REPORT ---
  async function endGame(survived, reason) {
    state.running = false;
    if (gameTickInterval) {
      clearInterval(gameTickInterval);
      gameTickInterval = null;
    }
    cancelHoldReboot();
    closeEmergencyTerminal();
    document.body.classList.remove('screen-shake');

    if (survived) {
      sound.playVictory();
      dom.resultTitle.textContent = '🏆 SHIFT SURVIVED';
      dom.resultTitle.style.color = 'var(--neon-green)';
    } else {
      sound.playGameOver();
      dom.resultTitle.textContent = '💥 CLUSTER CRASHED';
      dom.resultTitle.style.color = 'var(--neon-red)';
    }

    dom.resultSubtitle.textContent = reason;

    // Calculate metrics
    const totalSaved = state.yellowResolvedCount + state.redResolvedCount;
    let avgMttr = '0.0s';
    if (state.recoveryTimes.length > 0) {
      const sum = state.recoveryTimes.reduce((a, b) => a + b, 0);
      avgMttr = `${((sum / state.recoveryTimes.length) / 1000).toFixed(2)}s`;
    }

    const totalSecondsTracked = state.totalUptimeTicks + state.totalDowntimeTicks || 1;
    const uptimePercent = Math.round((state.totalUptimeTicks / totalSecondsTracked) * 100);

    dom.resultScore.textContent = state.score.toLocaleString();
    dom.resultPodsSaved.textContent = totalSaved;
    if (dom.resultHighCpu) dom.resultHighCpu.textContent = state.highCpuResolvedCount;
    if (dom.resultCrashLoops) dom.resultCrashLoops.textContent = state.crashLoopsResolvedCount;
    dom.resultMttr.textContent = avgMttr;
    dom.resultCombo.textContent = `${state.longestCombo}x`;
    dom.resultUptime.textContent = `${Math.min(100, Math.max(0, uptimePercent))}%`;

    dom.syncStatusBadge.textContent = 'Connecting to database...';
    dom.syncStatusBadge.className = 'sync-status-badge';
    dom.resultModal.classList.remove('hidden');

    logEvent(`🏁 Shift Ended: Final Score ${state.score} | Pods Saved: ${totalSaved}`, 'event');

    // Submit to Firebase / localStorage abstraction layer
    const entry = {
      handle: state.playerHandle,
      score: state.score,
      podsSaved: totalSaved,
      mttr: avgMttr,
      maxCombo: state.longestCombo,
      timestamp: Date.now()
    };

    if (window.ServerSniperDB) {
      const res = await window.ServerSniperDB.submitScore(entry);
      if (res.synced) {
        dom.syncStatusBadge.textContent = '✅ Synced to Firebase Cloud Leaderboard';
        dom.syncStatusBadge.className = 'sync-status-badge';
      } else {
        dom.syncStatusBadge.textContent = `💾 ${res.message}`;
        dom.syncStatusBadge.className = 'sync-status-badge fallback';
      }

      renderResultLeaderboard(res.leaderboard);
    }
  }

  function renderResultLeaderboard(list) {
    if (!dom.resultLeaderboardList || !Array.isArray(list)) return;
    dom.resultLeaderboardList.innerHTML = '';
    list.slice(0, 5).forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = `preview-rank-row ${idx === 0 ? 'top-rank' : ''}`;
      row.innerHTML = `
        <span>#${idx + 1} ${escapeHtml(item.handle || 'ANON')}</span>
        <strong>${(item.score || 0).toLocaleString()} pts</strong>
      `;
      dom.resultLeaderboardList.appendChild(row);
    });
  }

  // --- LEADERBOARD WATCHER (SYNC TO SIDE PANEL) ---
  function setupLeaderboardWatcher() {
    if (window.ServerSniperDB && window.ServerSniperDB.watchLeaderboard) {
      window.ServerSniperDB.watchLeaderboard((scores, isFirebase) => {
        if (!dom.sideLeaderboardList) return;
        dom.sideLeaderboardList.innerHTML = '';
        scores.slice(0, 5).forEach((item, idx) => {
          const row = document.createElement('div');
          row.className = `preview-rank-row ${idx === 0 ? 'top-rank' : ''}`;
          row.innerHTML = `
            <span>#${idx + 1} ${escapeHtml(item.handle || 'ANON')}</span>
            <strong>${(item.score || 0).toLocaleString()}</strong>
          `;
          dom.sideLeaderboardList.appendChild(row);
        });
      });
    }
  }

  // --- EVENT LISTENERS ---
  function setupEventListeners() {
    // 1. Start Button & Input
    dom.startBtn.addEventListener('click', () => {
      startShiftSequence();
    });

    dom.handleInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') startShiftSequence();
    });

    dom.restartBtn.addEventListener('click', () => {
      startShiftSequence();
    });

    // Tempo Selection (30s Hyper / 45s Blitz / 60s Standard)
    const tempoBtns = document.querySelectorAll('.tempo-btn');
    tempoBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sound.init();
        sound.playClick();
        tempoBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const sec = parseInt(btn.dataset.sec, 10) || 45;
        state.roundDurationSec = sec;
        state.timeRemainingSec = sec;
        dom.timeRemaining.textContent = `${sec}s`;
        if (dom.totalTimeBadge) dom.totalTimeBadge.textContent = `${sec}s TOTAL`;
      });
    });

    // 2. Global Keydown Listener
    window.addEventListener('keydown', (e) => {
      sound.init();

      // If terminal is open, handle typing inside terminal
      if (dom.terminalOverlay.classList.contains('active')) {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleTerminalCommand();
        } else if (e.key === 'Escape') {
          closeEmergencyTerminal();
        }
        return;
      }

      // Quick Scale-up: 'S' key
      if (e.key === 's' || e.key === 'S') {
        if (state.running && !state.paused && state.hoveredPodIndex !== null) {
          handleScaleYellow(state.hoveredPodIndex, 'Key [S]');
        }
      }

      // Autoscaler: 'A' key
      if (e.key === 'a' || e.key === 'A') {
        if (state.running && !state.paused) {
          triggerAutoscaler();
        }
      }

      // Pause toggle: 'P' or 'Escape'
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        if (state.running) togglePause();
      }
    });

    // 3. Grid Pod Events (Hover, Hold-to-Reboot, Double-Click)
    state.pods.forEach((pod, index) => {
      // Hover detection
      pod.element.addEventListener('mouseenter', () => {
        state.hoveredPodIndex = index;
      });

      pod.element.addEventListener('mouseleave', () => {
        if (state.hoveredPodIndex === index) {
          state.hoveredPodIndex = null;
        }
        if (state.holdingPodIndex === index) {
          cancelHoldReboot();
        }
      });

      // Mouse Down / Up for Hold-to-Reboot
      pod.element.addEventListener('mousedown', (e) => {
        sound.init();
        if (e.button === 0) { // Left click
          if (pod.state === 'critical') {
            startHoldReboot(index);
          }
        }
      });

      pod.element.addEventListener('mouseup', () => {
        if (state.holdingPodIndex === index) {
          cancelHoldReboot();
        }
      });

      // Double-Click for Emergency Terminal
      pod.element.addEventListener('dblclick', () => {
        sound.init();
        if (pod.state === 'critical') {
          openEmergencyTerminal(index);
        }
      });

      // Click fallback for touch / fast click on Yellow or Ghost
      pod.element.addEventListener('click', (e) => {
        sound.init();
        if (pod.state === 'warning') {
          handleScaleYellow(index, 'Click');
        } else if (pod.state === 'ghost') {
          handleScaleYellow(index, 'Click');
        }
      });

      // Drag and Drop Target for Load Balancer
      pod.element.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (pod.state === 'warning') {
          pod.element.classList.add('drag-target-valid');
        } else {
          pod.element.classList.add('drag-target-invalid');
        }
      });

      pod.element.addEventListener('dragleave', () => {
        pod.element.classList.remove('drag-target-valid', 'drag-target-invalid');
      });

      pod.element.addEventListener('drop', (e) => {
        e.preventDefault();
        pod.element.classList.remove('drag-target-valid', 'drag-target-invalid');
        handleScaleYellow(index, 'Load Balancer Drop');
      });
    });

    // Global mouseup to safety cancel hold
    window.addEventListener('mouseup', () => {
      if (state.holdingPodIndex !== null) cancelHoldReboot();
    });

    // 4. Load Balancer Tool Dragging
    dom.loadBalancerTool.addEventListener('dragstart', (e) => {
      sound.init();
      e.dataTransfer.setData('text/plain', 'load-balancer');
      e.dataTransfer.effectAllowed = 'copy';
    });

    // 5. Autoscaler Button
    dom.autoscalerBtn.addEventListener('click', () => {
      sound.init();
      triggerAutoscaler();
    });

    // 6. Terminal Close Button
    dom.terminalCloseBtn.addEventListener('click', closeEmergencyTerminal);

    // 7. Mute Button
    dom.muteBtn.addEventListener('click', () => {
      sound.init();
      const isMuted = sound.toggleMute();
      dom.muteBtn.innerHTML = isMuted ? '🔇 Muted' : '🔊 Audio ON';
    });

    // 8. Pause Button
    dom.pauseBtn.addEventListener('click', () => {
      togglePause();
    });
  }

  function togglePause() {
    state.paused = !state.paused;
    dom.pauseBtn.innerHTML = state.paused ? '▶ Resume' : '⏸ Pause';
    if (state.paused) {
      showNotification('GAME PAUSED (Press P to resume)');
      logEvent('Session paused by user.', 'info');
    } else {
      showNotification('RESUMING SHIFT...');
      logEvent('Session resumed.', 'info');
    }
  }

  // --- UTILITIES ---
  function logEvent(msg, type = 'info') {
    if (!dom.eventLog) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;

    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    entry.innerHTML = `<span class="log-time">[${timeStr}]</span> <span>${escapeHtml(msg)}</span>`;
    dom.eventLog.appendChild(entry);
    dom.eventLog.scrollTop = dom.eventLog.scrollHeight;
  }

  let notifTimeout = null;
  function showNotification(text) {
    if (!dom.floatingAlert) return;
    dom.floatingAlert.textContent = text;
    dom.floatingAlert.classList.add('show');
    if (notifTimeout) clearTimeout(notifTimeout);
    notifTimeout = setTimeout(() => {
      dom.floatingAlert.classList.remove('show');
    }, 2200);
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

