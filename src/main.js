/**
 * TECHVERSE ’26 — Main Application Entry Point
 * Mounts the unified portal router, top navigation bar, and canvas background.
 */

import { portalState } from './portalState.js';
import { PortalHeader } from './components/PortalHeader.js';
import { CinematicIntro } from './components/CinematicIntro.js';
import { RegistrationScreen } from './components/RegistrationScreen.js';
import { EventBriefing } from './components/EventBriefing.js';
import { RoundIntroScreen } from './components/RoundIntroScreen.js';
import { FinalResultsScreen } from './components/FinalResultsScreen.js';
import { LeaderboardScreen } from './components/LeaderboardScreen.js';

import { ServerSniperGame } from './games/ServerSniperGame.js';
import { PipelineRecallGame } from './games/PipelineRecallGame.js';
import { SwipeOpsGame } from './games/SwipeOpsGame.js';

class PortalApp {
  constructor() {
    this.appRoot = document.getElementById('app');
    this.headerComponent = new PortalHeader();
    this.activeScreenComponent = null;
    this.contentSlot = null;
  }

  init() {
    this.initCanvasBackground();
    this.renderShell();

    portalState.subscribe(() => {
      this.route();
    });

    this.route();
  }

  renderShell() {
    this.appRoot.innerHTML = `
      <div id="portal-header-slot"></div>
      <main id="portal-content-slot" style="flex: 1; display: flex; flex-direction: column; width: 100%;"></main>
    `;

    const headerSlot = this.appRoot.querySelector('#portal-header-slot');
    this.contentSlot = this.appRoot.querySelector('#portal-content-slot');

    headerSlot.innerHTML = this.headerComponent.render();
    this.headerComponent.attachEvents(headerSlot);
  }

  route() {
    // Re-render header to reflect participant state & active screen
    const headerSlot = this.appRoot.querySelector('#portal-header-slot');
    if (headerSlot) {
      headerSlot.innerHTML = this.headerComponent.render();
      this.headerComponent.attachEvents(headerSlot);
    }

    // Teardown previous active component
    if (this.activeScreenComponent && typeof this.activeScreenComponent.destroy === 'function') {
      try {
        this.activeScreenComponent.destroy();
      } catch (e) {
        console.warn('Error destroying screen component:', e);
      }
    }
    this.activeScreenComponent = null;
    this.contentSlot.innerHTML = '';

    const screen = portalState.currentScreen;

    switch (screen) {
      case 'cinematic_intro':
        this.activeScreenComponent = new CinematicIntro();
        break;
      case 'registration':
        this.activeScreenComponent = new RegistrationScreen();
        break;
      case 'briefing':
        this.activeScreenComponent = new EventBriefing();
        break;
      case 'round1_intro':
        this.activeScreenComponent = new RoundIntroScreen(1);
        break;
      case 'round1_game':
        this.activeScreenComponent = new ServerSniperGame();
        break;
      case 'round2_intro':
        this.activeScreenComponent = new RoundIntroScreen(2);
        break;
      case 'round2_game':
        this.activeScreenComponent = new PipelineRecallGame();
        break;
      case 'round3_intro':
        this.activeScreenComponent = new RoundIntroScreen(3);
        break;
      case 'round3_game':
        this.activeScreenComponent = new SwipeOpsGame();
        break;
      case 'final_results':
        this.activeScreenComponent = new FinalResultsScreen();
        break;
      case 'leaderboard':
        this.activeScreenComponent = new LeaderboardScreen();
        break;
      default:
        this.activeScreenComponent = new CinematicIntro();
    }

    if (this.activeScreenComponent) {
      this.activeScreenComponent.mount(this.contentSlot);
    }
  }

  initCanvasBackground() {
    const canvas = document.getElementById('portal-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = Math.floor((width * height) / 22000);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.2
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw faint cyber grid nodes
      ctx.fillStyle = 'rgba(0, 243, 255, 0.25)';
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 243, 255, ${p.alpha * 0.4})`;
        ctx.fill();

        // Connect nearby nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 90) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 243, 255, ${0.08 * (1 - dist / 90)})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    };

    animate();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new PortalApp();
  app.init();
});
