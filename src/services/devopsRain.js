/**
 * TECHVERSE ’26 — Slow DevOps Terminal Digital Rain
 * Atmospheric, slow-moving, dark-mode terminal matrix rain.
 * Deep black and navy background with muted cyan, teal, blue, and occasional violet glyphs.
 * Configurable, deltaTime timestep-controlled, accessible, and ultra-smooth.
 */

const DEVOPS_WORDS = [
  'main', 'logs', 'pod', 'deploy', 'docker', 'test',
  'k8s', 'git', 'ci', 'cd', 'node', 'tls', 'helm', 'sync',
  'kubectl', 'DEPLOY', 'BUILD_OK', '0x7FA2'
];

const DEVOPS_SYMBOLS = [
  '{', '}', '[', ']', '$', '>', '/', '#', ':', '=', '01', '0', '1'
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

    // Configurable parameters
    this.config = {
      columnSpacing: options.columnSpacing || 38,     // Sparse vertical columns
      minSpeed: options.minSpeed || 9,                // Pixels per second (calm & tranquil)
      maxSpeed: options.maxSpeed || 20,               // Pixels per second
      slotHeight: options.slotHeight || 18,           // Vertical spacing between characters
      fontSize: options.fontSize || 12,               // Clean thin typography
      wordColumnChance: options.wordColumnChance || 0.35, // 35% word streams, 65% symbols
      glowRate: options.glowRate || 0.05,             // Only 5% of columns have subtle cyan glow
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

    // Responsive width and height
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;

    const isMobile = this.width < 768;
    const spacing = isMobile ? 30 : this.config.columnSpacing;
    const colCount = Math.floor(this.width / spacing);

    this.columns = [];

    // Pre-populate sparse columns
    for (let i = 0; i < colCount; i++) {
      // Keep only ~65% of potential column slots active so the rain feels sparse and calm
      const isActive = Math.random() < 0.68;
      if (!isActive) continue;

      const isWordCol = Math.random() < this.config.wordColumnChance;
      const isViolet = Math.random() < 0.12;
      const hasGlow = Math.random() < this.config.glowRate;

      // Color themes: muted cyan/teal, deep dim blue, and occasional violet
      let baseColor = '14, 116, 144'; // Muted dark teal
      if (isViolet) {
        baseColor = '139, 92, 246'; // Occasional soft violet
      } else if (Math.random() < 0.4) {
        baseColor = '30, 75, 120'; // Deep ambient blue
      } else if (Math.random() < 0.3) {
        baseColor = '6, 182, 212'; // Muted cyan
      }

      const streamLength = Math.floor(Math.random() * 12 + 10);
      const speed = this.config.minSpeed + Math.random() * (this.config.maxSpeed - this.config.minSpeed);

      // Pre-fill initial glyphs for this column
      const glyphs = [];
      if (isWordCol) {
        const word = DEVOPS_WORDS[Math.floor(Math.random() * DEVOPS_WORDS.length)];
        for (let w = 0; w < streamLength; w++) {
          glyphs.push(word[w % word.length]);
        }
      } else {
        for (let s = 0; s < streamLength; s++) {
          glyphs.push(DEVOPS_SYMBOLS[Math.floor(Math.random() * DEVOPS_SYMBOLS.length)]);
        }
      }

      this.columns.push({
        x: Math.round(i * spacing + (spacing / 2)),
        // Stagger positions across full height so animation is immediately populated
        y: Math.random() * (this.height + 200) - 100,
        speed: speed, // Pixels per second
        streamLength: streamLength,
        glyphs: glyphs,
        baseColor: baseColor,
        hasGlow: hasGlow,
        isWordCol: isWordCol,
        alphaMultiplier: Math.random() * 0.25 + 0.35, // 0.35 to 0.60
        // Slow glyph mutation timer
        nextMutateTime: Math.random() * 2000 + 1000
      });
    }

    // Paint initial dark deep navy/black canvas backdrop
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
    grad.addColorStop(0.45, '#030816');
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
    ctx.font = `${this.config.fontSize}px "JetBrains Mono", "Fira Code", monospace`;
    ctx.textBaseline = 'top';

    for (let col of this.columns) {
      for (let j = 0; j < col.glyphs.length; j++) {
        const glyphY = (col.y + (j * this.config.slotHeight)) % this.height;
        const alpha = (0.12 * (1 - (j / col.streamLength))).toFixed(3);
        ctx.fillStyle = `rgba(${col.baseColor}, ${alpha})`;
        ctx.fillText(col.glyphs[j], col.x, glyphY);
      }
    }
  }

  render(timestamp) {
    if (this.isPaused || this.prefersReducedMotion) return;

    if (!this.lastTimestamp) this.lastTimestamp = timestamp;
    const deltaMs = Math.min(timestamp - this.lastTimestamp, 64); // Clamped delta to avoid skips
    const deltaSec = deltaMs / 1000;
    this.lastTimestamp = timestamp;

    const ctx = this.ctx;
    const width = this.width;
    const height = this.height;
    const slotH = this.config.slotHeight;

    // Atmospheric dark dissolving veil: fades trails slowly into deep black/navy
    ctx.fillStyle = 'rgba(2, 4, 10, 0.08)';
    ctx.fillRect(0, 0, width, height);

    ctx.font = `${this.config.fontSize}px "JetBrains Mono", "Fira Code", monospace`;
    ctx.textBaseline = 'top';

    for (let i = 0; i < this.columns.length; i++) {
      const col = this.columns[i];

      // Very slow, smooth downward drift (pixels per second * deltaSeconds)
      col.y += col.speed * deltaSec;

      // Subtle glyph mutation over time for realistic live terminal effect
      col.nextMutateTime -= deltaMs;
      if (col.nextMutateTime <= 0) {
        col.nextMutateTime = Math.random() * 3000 + 1500;
        const mutateIndex = Math.floor(Math.random() * col.glyphs.length);
        if (col.isWordCol) {
          const word = DEVOPS_WORDS[Math.floor(Math.random() * DEVOPS_WORDS.length)];
          col.glyphs[mutateIndex] = word[mutateIndex % word.length];
        } else {
          col.glyphs[mutateIndex] = DEVOPS_SYMBOLS[Math.floor(Math.random() * DEVOPS_SYMBOLS.length)];
        }
      }

      // Render vertical stream of glyphs
      for (let j = 0; j < col.glyphs.length; j++) {
        const charY = col.y - (j * slotH);

        // Skip characters outside visible screen
        if (charY < -20 || charY > height + 20) continue;

        const isHead = j === 0;
        const progress = j / col.streamLength;
        const fade = Math.pow(1 - progress, 1.35);
        const alpha = Math.max(0.04, col.alphaMultiplier * fade);

        if (isHead && col.hasGlow) {
          // Rare, calm subtle cyan glow at leading head
          ctx.fillStyle = '#67e8f9';
          ctx.shadowColor = 'rgba(6, 182, 212, 0.55)';
          ctx.shadowBlur = 5;
          ctx.fillText(col.glyphs[j], col.x, charY);
          ctx.shadowBlur = 0;
        } else if (isHead) {
          // Normal clean leading character (slightly brighter)
          ctx.fillStyle = `rgba(103, 232, 249, ${(alpha * 1.5).toFixed(3)})`;
          ctx.fillText(col.glyphs[j], col.x, charY);
        } else {
          // Softly trailing dim characters blending into the background
          ctx.fillStyle = `rgba(${col.baseColor}, ${alpha.toFixed(3)})`;
          ctx.fillText(col.glyphs[j], col.x, charY);
        }
      }

      // Smooth reset once stream has completely cascaded off-screen
      const tailY = col.y - (col.streamLength * slotH);
      if (tailY > height + 30) {
        col.y = -Math.random() * 150 - 20;
        col.speed = this.config.minSpeed + Math.random() * (this.config.maxSpeed - this.config.minSpeed);
        col.hasGlow = Math.random() < this.config.glowRate;
        col.isWordCol = Math.random() < this.config.wordColumnChance;
        
        // Re-generate fresh stream glyphs
        if (col.isWordCol) {
          const word = DEVOPS_WORDS[Math.floor(Math.random() * DEVOPS_WORDS.length)];
          for (let w = 0; w < col.streamLength; w++) {
            col.glyphs[w] = word[w % word.length];
          }
        } else {
          for (let s = 0; s < col.streamLength; s++) {
            col.glyphs[s] = DEVOPS_SYMBOLS[Math.floor(Math.random() * DEVOPS_SYMBOLS.length)];
          }
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
