/**
 * TECHVERSE ’26 — DevOps Matrix Digital Rain
 * High-performance, atmospheric terminal code rain featuring prominent DevOps keywords:
 * build, test, deploy, kubernetes, docker, kubectl, pod, logs, k8s, CI/CD, git push, YAML, etc.
 * Features dynamic speed tiers, rich cyan/teal/blue/violet palette, and immediate full-viewport presence.
 */

const DEVOPS_TOKENS = [
  'kubernetes', 'docker', 'deploy', 'build', 'test',
  'kubectl', 'pod', 'logs', 'k8s', 'CI/CD', 'git push',
  'release', 'helm', 'YAML', 'main', 'env', 'cluster',
  'BUILD_OK', 'DEPLOY', '0x7FA2', '01', '{}', '</>',
  'docker run', 'git commit', 'terraform', 'prometheus', 'grafana'
];

const DEVOPS_SYMBOLS = [
  '{', '}', '[', ']', '$', '>', '/', '#', ':', '=', '01', '0', '1', '</>', '::', '->', '~', '&&'
];

export class DevopsRain {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext('2d') : null;
    this.animId = null;
    this.columns = [];
    this.width = 0;
    this.height = 0;
    this.isPaused = false;
    this.prefersReducedMotion = false;
    this.lastTimestamp = 0;

    // Configurable parameters with dynamic speeds, sparse density, and crisp rendering
    this.config = {
      columnSpacing: options.columnSpacing || 72,     // Spacing between column streams (sparse, elegant)
      minSpeed: options.minSpeed || 55,               // Pixels per second (dynamic, fluid fall)
      maxSpeed: options.maxSpeed || 135,              // Pixels per second
      fastSpeed: options.fastSpeed || 210,            // Fast highlight streams
      slotHeight: options.slotHeight || 22,           // Vertical spacing between items
      fontSize: options.fontSize || 12,               // Clean, legible typography
      tokenRatio: options.tokenRatio || 0.45,         // 45% of items are full DevOps words
      ...options
    };

    this.handleResize = this.handleResize.bind(this);
    this.handleVisibility = this.handleVisibility.bind(this);
  }

  init() {
    if (!this.canvas || !this.ctx) return;

    this.checkReducedMotion();
    this.handleResize();

    window.addEventListener('resize', this.handleResize, { passive: true });
    document.addEventListener('visibilitychange', this.handleVisibility);

    if (this.prefersReducedMotion) {
      this.renderStaticTelemetry();
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

    // Retina / High-DPI support: render at device pixel ratio to eliminate blurriness
    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.canvas.width = Math.floor(this.width * dpr);
    this.canvas.height = Math.floor(this.height * dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    if (this.ctx) {
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.ctx.textRendering = 'geometricPrecision';
    }

    const isMobile = this.width < 768;
    const spacing = isMobile ? 55 : this.config.columnSpacing;
    const colCount = Math.floor(this.width / spacing);

    this.columns = [];

    for (let i = 0; i < colCount; i++) {
      // 52% sparse distribution across screen width (clean, breathable density)
      const isActive = Math.random() < 0.52;
      if (!isActive) continue;

      const isFast = Math.random() < 0.18; // Fast highlight streams
      const speed = isFast 
        ? this.config.fastSpeed * (0.85 + Math.random() * 0.3)
        : this.config.minSpeed + Math.random() * (this.config.maxSpeed - this.config.minSpeed);

      // Shorter, cleaner streams (5 to 11 items) for an uncluttered aesthetic
      const streamLength = Math.floor(Math.random() * 6 + 5);
      const items = [];

      for (let j = 0; j < streamLength; j++) {
        const isToken = Math.random() < this.config.tokenRatio;
        const text = isToken 
          ? DEVOPS_TOKENS[Math.floor(Math.random() * DEVOPS_TOKENS.length)]
          : DEVOPS_SYMBOLS[Math.floor(Math.random() * DEVOPS_SYMBOLS.length)];

        // Dynamic color palette: Cyan (dominant), Teal, Blue, and Violet
        const roll = Math.random();
        let colorRgb = '56, 189, 248'; // Bright cyan (#38bdf8)
        if (roll < 0.40) colorRgb = '45, 212, 191'; // Teal (#2dd4bf)
        else if (roll < 0.70) colorRgb = '96, 165, 250'; // Light blue (#60a5fa)
        else if (roll < 0.88) colorRgb = '192, 132, 252'; // Violet (#c084fc)

        items.push({
          text,
          isToken,
          colorRgb,
          glitchTimer: Math.random() * 2000 + 800
        });
      }

      this.columns.push({
        x: Math.round(i * spacing + (spacing / 2)),
        // Stagger immediately across the entire screen height so rain is falling right away
        y: Math.random() * (this.height + 400) - 200,
        speed: speed,
        streamLength: streamLength,
        items: items,
        isFast: isFast,
        alphaBase: isFast ? 0.85 : (Math.random() * 0.25 + 0.55)
      });
    }

    this.drawDeepBackdrop();

    if (this.prefersReducedMotion) {
      this.renderStaticTelemetry();
    }
  }

  drawDeepBackdrop() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const grad = ctx.createLinearGradient(0, 0, 0, this.height);
    grad.addColorStop(0, '#020409');
    grad.addColorStop(0.5, '#030816');
    grad.addColorStop(1, '#010307');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);
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
      this.lastTimestamp = performance.now();
      if (!this.animId && !this.prefersReducedMotion) {
        this.animId = requestAnimationFrame(this.render.bind(this));
      }
    }
  }

  renderStaticTelemetry() {
    if (!this.ctx) return;
    this.drawDeepBackdrop();

    const ctx = this.ctx;
    ctx.font = `600 ${this.config.fontSize}px "JetBrains Mono", "Fira Code", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    for (let col of this.columns) {
      for (let j = 0; j < col.items.length; j++) {
        const item = col.items[j];
        const itemY = (col.y + (j * this.config.slotHeight)) % this.height;
        ctx.fillStyle = `rgba(${item.colorRgb}, 0.25)`;
        ctx.fillText(item.text, col.x, itemY);
      }
    }
  }

  render(timestamp) {
    if (this.isPaused || this.prefersReducedMotion) return;

    if (!this.lastTimestamp) this.lastTimestamp = timestamp;
    const deltaMs = Math.min(timestamp - this.lastTimestamp, 64);
    const deltaSec = deltaMs / 1000;
    this.lastTimestamp = timestamp;

    const ctx = this.ctx;
    const width = this.width;
    const height = this.height;
    const slotH = this.config.slotHeight;

    // Atmospheric dark dissolution veil (cleaner fade prevents blurry smearing)
    ctx.fillStyle = 'rgba(2, 4, 10, 0.30)';
    ctx.fillRect(0, 0, width, height);

    ctx.font = `600 ${this.config.fontSize}px "JetBrains Mono", "Fira Code", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    for (let i = 0; i < this.columns.length; i++) {
      const col = this.columns[i];

      // Smooth, responsive downward movement
      col.y += col.speed * deltaSec;

      const totalItems = col.items.length;

      for (let j = 0; j < totalItems; j++) {
        const item = col.items[j];
        const itemY = col.y - (j * slotH);

        if (itemY < -30 || itemY > height + 30) continue;

        // Periodic glitch/mutation into new DevOps terms or symbols
        item.glitchTimer -= deltaMs;
        if (item.glitchTimer <= 0) {
          item.glitchTimer = Math.random() * 2500 + 1000;
          if (item.isToken) {
            item.text = DEVOPS_TOKENS[Math.floor(Math.random() * DEVOPS_TOKENS.length)];
          } else {
            item.text = DEVOPS_SYMBOLS[Math.floor(Math.random() * DEVOPS_SYMBOLS.length)];
          }
        }

        const isHead = j === 0;
        const progress = 1 - (j / totalItems);
        const alpha = Math.max(0.12, progress * col.alphaBase);

        if (isHead) {
          // Sharp luminous leading item with subtle, non-blurry neon glow
          ctx.fillStyle = col.isFast ? '#FFFFFF' : '#E0F8FF';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = col.isFast ? 4 : 2;
          ctx.fillText(item.text, col.x, itemY);
          ctx.shadowBlur = 0;
        } else {
          // Trailing DevOps tokens: razor-sharp, crisp, and beautifully shaded
          const tokenAlpha = item.isToken ? Math.min(0.95, alpha * 1.35) : alpha;
          ctx.fillStyle = `rgba(${item.colorRgb}, ${tokenAlpha.toFixed(3)})`;
          ctx.fillText(item.text, col.x, itemY);
        }
      }

      // Smooth reset when column flows past viewport bottom
      const tailY = col.y - (totalItems * slotH);
      if (tailY > height + 40) {
        col.y = -Math.random() * 180 - 20;
        col.isFast = Math.random() < 0.18;
        col.speed = col.isFast 
          ? this.config.fastSpeed * (0.85 + Math.random() * 0.3)
          : this.config.minSpeed + Math.random() * (this.config.maxSpeed - this.config.minSpeed);

        // Regenerate items with fresh DevOps terms on reset (keep stream short and crisp)
        col.items.forEach(item => {
          item.isToken = Math.random() < this.config.tokenRatio;
          item.text = item.isToken 
            ? DEVOPS_TOKENS[Math.floor(Math.random() * DEVOPS_TOKENS.length)]
            : DEVOPS_SYMBOLS[Math.floor(Math.random() * DEVOPS_SYMBOLS.length)];
        });
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
