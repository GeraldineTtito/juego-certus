// @ts-check

/**
 * Punto de entrada sin bundler: el navegador carga ES modules declarados en index.html.
 * Sirve la carpeta del proyecto con cualquier servidor estático (p.ej. VS Code Live Server).
 */

import { CAMPAIGN_LEVELS } from "../config/Levels.js";
import {
  preloadInitialBackground,
  preloadRemainingBackgrounds,
} from "../services/asset-loader.service.js";
import { GameApp } from "./GameApp.js";

/**
 * @param {string} id
 * @returns {HTMLElement}
 */
function requireElement(id) {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Required DOM element #${id} not found`);
  }
  return el;
}

function getAppRefs() {
  return {
    hud: {
      panel: requireElement("hud-panel"),
      vitalityWrapper: requireElement("vitality-bar-wrapper"),
      healthFill: requireElement("health-bar-fill"),
      level: requireElement("hud-level"),
      objective: requireElement("hud-objective"),
      health: requireElement("hud-health"),
      time: requireElement("hud-time"),
      timePanel: requireElement("hud-time-panel"),
      status: requireElement("hud-status"),
    },
    overlay: {
      panel: requireElement("overlay-panel"),
      kicker: requireElement("overlay-kicker"),
      title: requireElement("overlay-title"),
      body: requireElement("overlay-body"),
      list: requireElement("overlay-list"),
      primaryButton: requireElement("start-btn"),
      secondaryButton: requireElement("secondary-btn"),
      tertiaryButton: document.getElementById("tertiary-btn"),
    },
    media: {
      layer: requireElement("media-layer"),
      video: /** @type {HTMLVideoElement} */ (
        requireElement("campaign-trailer")
      ),
    },
    settings: {
      panel: document.getElementById("settings-panel"),
      difficulty: /** @type {HTMLSelectElement | null} */ (
        document.getElementById("setting-difficulty")
      ),
      mouseSensitivity: /** @type {HTMLInputElement | null} */ (
        document.getElementById("setting-mouse")
      ),
      invertLookY: /** @type {HTMLInputElement | null} */ (
        document.getElementById("setting-invert")
      ),
      ambientVolume: /** @type {HTMLInputElement | null} */ (
        document.getElementById("setting-ambient")
      ),
      sfxVolume: /** @type {HTMLInputElement | null} */ (
        document.getElementById("setting-sfx")
      ),
      musicVolume: /** @type {HTMLInputElement | null} */ (
        document.getElementById("setting-music")
      ),
      highContrastHud: /** @type {HTMLInputElement | null} */ (
        document.getElementById("setting-contrast")
      ),
      reducedMotion: /** @type {HTMLSelectElement | null} */ (
        document.getElementById("setting-motion")
      ),
      saveButton: document.getElementById("settings-save"),
      resetButton: document.getElementById("settings-reset"),
      closeButton: document.getElementById("settings-close"),
      exportButton: document.getElementById("settings-export"),
      importField: /** @type {HTMLTextAreaElement | null} */ (
        document.getElementById("settings-import-field")
      ),
      importButton: document.getElementById("settings-import"),
      statusLine: document.getElementById("settings-status"),
    },
  };
}

async function bootstrap() {
  const firstLevel = CAMPAIGN_LEVELS[0];
  if (firstLevel) {
    await preloadInitialBackground(firstLevel.visual.bgImage);
    const rest = CAMPAIGN_LEVELS.slice(1).map((l) => l.visual.bgImage);
    preloadRemainingBackgrounds(rest);
  }

  const canvasShell = /** @type {HTMLElement} */ (
    /** @type {Element} */ (document.querySelector(".canvas-shell"))
  );

  const refs = getAppRefs();

  const app = new GameApp({
    canvas: /** @type {HTMLCanvasElement} */ (requireElement("game-canvas")),
    hudRefs: refs.hud,
    overlayRefs: refs.overlay,
    mediaRefs: refs.media,
    settingsRefs: refs.settings,
    shellElement: canvasShell,
    transitionLayer: document.getElementById("scene-transition"),
  });

  await app.init();
  app.start();

  if (new URLSearchParams(location.search).has("debug")) {
    /** @type {globalThis & { render_game_to_text?: () => string, advanceTime?: (ms: number) => void }} */
    const g = /** @type {Window & typeof globalThis} */ (globalThis);
    g.render_game_to_text = () => app.renderGameToText();
    g.advanceTime = (ms) => app.advanceTime(ms);
  }
}

globalThis.window.addEventListener("DOMContentLoaded", () => {
  void bootstrap();
});
