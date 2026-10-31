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

import { GameSandboxScreen } from './components/GameSandboxScreen.js';
import { DevopsRain } from './services/devopsRain.js';

class PortalApp {
  constructor() {
    this.appRoot = document.getElementById('app');
    this.headerComponent = new PortalHeader();
    this.activeScreenComponent = null;
    this.currentRenderedScreen = null;
    this.contentSlot = null;
    this.devopsRain = null;
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

    const screen = portalState.currentScreen;

    // Prevent destroying and restarting active screen (e.g. ongoing countdowns) on background data updates
    if (this.currentRenderedScreen === screen && this.activeScreenComponent) {
      return;
    }
    this.currentRenderedScreen = screen;

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
        this.activeScreenComponent = new GameSandboxScreen(1);
        break;
      case 'round2_intro':
        this.activeScreenComponent = new RoundIntroScreen(2);
        break;
      case 'round2_game':
        this.activeScreenComponent = new GameSandboxScreen(2);
        break;
      case 'round3_intro':
        this.activeScreenComponent = new RoundIntroScreen(3);
        break;
      case 'round3_game':
        this.activeScreenComponent = new GameSandboxScreen(3);
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
    this.devopsRain = new DevopsRain(canvas);
    this.devopsRain.init();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new PortalApp();
  app.init();
});
