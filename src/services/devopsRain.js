/**
 * TECHVERSE ’26 — Authentic DevOps Matrix Digital Rain
 * Continuously cascading vertical telemetry streams of binary, hex fragments,
 * terminal symbols, and DevOps infrastructure tokens.
 */

const DEVOPS_TOKENS = [
  'kubectl', 'DEPLOY', 'BUILD_OK', '0x7FA2', 'PIPELINE',
  'HEALTH_CHECK', 'ROLLBACK', 'CONTAINER_READY', 'K8S', 'HELM', '0xDEAD',
  '0xBEEF', '101101', 'INGRESS', 'POD_RUNNING', 'DOCKER', 'PROMETHEUS',
  'GRAFANA', '0x4F8B', 'SYS_SYNC', 'STABLE', 'MUTEX', '010101',
  'CANARY', 'SERVICE_MESH', 'GIT_COMMIT', 'RETRY_ACK', 'TLS_OK',
  'LOAD_BALANCER', 'DRAIN_NODE', 'OOM_KILL', 'TERRAFORM', '200_OK'
];

const GLYPHS = '0123456789ABCDEF{}[]<>/\\:;*#$_~+=!?%^&|';

export class DevopsRain {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext('2d') : null;
    this.animId = null;
    this.columns = [];
    this.width = 0;
    this.height = 0;
    this.isPaused = false;
    this.prefersReducedMotion = false;
    this.lastTimestamp = 0;

    this.handleResize = this.handleResize.bind(this);
    this.handleVisibility = this.handleVisibility.bind(this);
  }

  init() {
    if (!this.canvas || !this.ctx) return;

    this.checkReducedMotion();
    this.handleResize();

    window.addEventListener('resize', this.handleResize);
    document.addEventListener('visibilitychange', this.handleVisibility);

    if (this.prefersReducedMotion) {
      this.renderStaticStream();
    } else {
      this.lastTimestamp = performance.now();
      this.animId = requestAnimationFrame(this.render.bind(this));
    }
  }

  checkReducedMotion() {
    if (typeof window !== 'undefined' && window.matchMedia) {
      this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }

  handleResize() {
    if (!this.canvas) return;
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;

    // Responsive column spacing: 16px on desktop, 20px on mobile
    const isMobile = this.width < 768;
    const colSpacing = isMobile ? 20 : 16;
    const colCount = Math.floor(this.width / colSpacing);

    this.columns = [];
    for (let i = 0; i < colCount; i++) {
      const isAmbient = Math.random() < 0.5; // 50% ambient streams, 50% prominent streams
      const colorRoll = Math.random();
      let headColor = '#00f3ff';
      let trailColor = '0, 243, 255';

      if (colorRoll < 0.35) {
        headColor = '#10b981'; // Matrix emerald
        trailColor = '16, 185, 129';
      } else if (colorRoll < 0.45) {
        headColor = '#c084fc'; // Holographic violet
        trailColor = '192, 132, 252';
      }

      this.columns.push({
        x: i * colSpacing + (Math.random() * 2 - 1),
        // Distribute across screen height immediately so rain is falling on first frame
        y: (Math.random() * 1.5 - 0.4) * this.height,
        speed: (Math.random() * 1.5 + 1.3) * (isAmbient ? 0.8 : 1.25),
        fontSize: isAmbient ? 11 : 13,
        streamLength: Math.floor(Math.random() * 16 + 14),
        alphaBase: isAmbient ? 0.32 : 0.65,
        headColor: headColor,
        trailColor: trailColor,
        history: [],
        activeWord: Math.random() < 0.35 ? this.getRandomToken() : null,
        wordIndex: 0,
        wordCooldown: Math.floor(Math.random() * 30 + 15)
      });
    }

    if (this.prefersReducedMotion) {
      this.renderStaticStream();
    }
  }

  getRandomToken() {
    return DEVOPS_TOKENS[Math.floor(Math.random() * DEVOPS_TOKENS.length)];
  }

  handleVisibility() {
    if (document.hidden) {
      this.isPaused = true;
      if (this.animId) {
        cancelAnimationFrame(this.animId);
        this.animId = null;
      }
    } else {
      this.isPaused = false;
      if (!this.animId && !this.prefersReducedMotion) {
        this.lastTimestamp = performance.now();
        this.animId = requestAnimationFrame(this.render.bind(this));
      }
    }
  }

  renderStaticStream() {
    if (!this.ctx) return;
    this.ctx.fillStyle = '#02040a';
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.font = '11px "Fira Code", monospace';
    for (let col of this.columns) {
      this.ctx.fillStyle = 'rgba(0, 243, 255, 0.12)';
      const char = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      this.ctx.fillText(char, col.x, Math.random() * this.height);
    }
  }

  render(timestamp) {
    if (this.isPaused || this.prefersReducedMotion) return;

    // Cap at ~45-60 FPS for ultra-smooth performance and light battery footprint
    const delta = timestamp - this.lastTimestamp;
    if (delta < 20) {
      this.animId = requestAnimationFrame(this.render.bind(this));
      return;
    }
    this.lastTimestamp = timestamp;

    const ctx = this.ctx;
    const width = this.width;
    const height = this.height;

    // Atmospheric semi-transparent overlay gently dissolves trails continuously
    ctx.fillStyle = 'rgba(2, 4, 10, 0.14)';
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < this.columns.length; i++) {
      const col = this.columns[i];
      col.y += col.speed * 2.0;

      // Select next falling glyph or DevOps telemetry character
      let nextChar = '';
      let isTokenChar = false;
      if (col.activeWord) {
        nextChar = col.activeWord[col.wordIndex] || '';
        isTokenChar = true;
        col.wordIndex++;
        if (col.wordIndex >= col.activeWord.length) {
          col.activeWord = null;
          col.wordIndex = 0;
          col.wordCooldown = Math.floor(Math.random() * 45 + 20);
        }
      } else {
        col.wordCooldown--;
        if (col.wordCooldown <= 0 && Math.random() < 0.3) {
          col.activeWord = this.getRandomToken();
          col.wordIndex = 0;
          nextChar = col.activeWord[0];
          isTokenChar = true;
        } else {
          nextChar = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
      }

      col.history.unshift({
        char: nextChar,
        y: col.y,
        isToken: isTokenChar
      });

      if (col.history.length > col.streamLength) {
        col.history.pop();
      }

      ctx.font = `${col.fontSize}px "Fira Code", "JetBrains Mono", monospace`;

      // Render descending stream characters
      for (let t = 0; t < col.history.length; t++) {
        const item = col.history[t];
        const isHead = t === 0;

        if (isHead) {
          // White-hot core with intense neon glow
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = col.headColor;
          ctx.shadowBlur = 8;
          ctx.fillText(item.char, col.x, item.y);
          ctx.shadowBlur = 0;
        } else {
          // Smooth vertical fading trail
          const ratio = 1 - (t / col.streamLength);
          const alpha = col.alphaBase * Math.pow(ratio, 1.15);

          if (item.isToken) {
            // Enhanced brightness for recognizable DevOps tokens
            ctx.fillStyle = `rgba(255, 255, 255, ${(alpha * 1.3).toFixed(3)})`;
          } else {
            ctx.fillStyle = `rgba(${col.trailColor}, ${alpha.toFixed(3)})`;
          }
          ctx.fillText(item.char, col.x, item.y);
        }
      }

      // Reset stream to top after it completely cascades off bottom
      if (col.y - (col.streamLength * col.fontSize) > height) {
        col.y = Math.random() * -120;
        col.history = [];
        col.speed = (Math.random() * 1.5 + 1.3) * (col.fontSize === 11 ? 0.8 : 1.25);
        if (Math.random() < 0.4) {
          col.activeWord = this.getRandomToken();
          col.wordIndex = 0;
        }
      }
    }

    this.animId = requestAnimationFrame(this.render.bind(this));
  }

  destroy() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('visibilitychange', this.handleVisibility);
  }
}
