// @ts-check

import { GameLoop } from "../core/GameLoop.js";
import { InputManager } from "../core/InputManager.js";
import { SceneManager } from "../core/SceneManager.js";
import { CanvasRenderer } from "../render/CanvasRenderer.js";
import {
  loadUserSettings,
  sanitizeSettings,
} from "../services/user-settings.service.js";
import { GameDomView } from "../ui/GameDomView.js";
import { SettingsFormBinder } from "../ui/SettingsFormBinder.js";
import { CongratsModal } from "../ui/CongratsModal.js";
import { registerAppScenes } from "./scene-registry.js";
import { AppLifecycle } from "./app-lifecycle.js";

/**
 * @typedef {{
 *   panel: HTMLElement;
 *   vitalityWrapper: HTMLElement;
 *   healthFill: HTMLElement;
 *   level: HTMLElement;
 *   objective: HTMLElement;
 *   health: HTMLElement;
 *   time: HTMLElement;
 *   timePanel: HTMLElement;
 *   status: HTMLElement;
 * }} GameHudRefs
 *
 * @typedef {{
 *   panel: HTMLElement;
 *   kicker: HTMLElement;
 *   title: HTMLElement;
 *   body: HTMLElement;
 *   list: HTMLElement;
 *   primaryButton: HTMLElement;
 *   secondaryButton: HTMLElement;
 *   tertiaryButton: HTMLElement | null;
 * }} GameOverlayRefs
 *
 * @typedef {{
 *   panel: HTMLElement | null;
 *   difficulty: HTMLSelectElement | null;
 *   mouseSensitivity: HTMLInputElement | null;
 *   invertLookY: HTMLInputElement | null;
 *   ambientVolume: HTMLInputElement | null;
 *   sfxVolume: HTMLInputElement | null;
 *   musicVolume: HTMLInputElement | null;
 *   highContrastHud: HTMLInputElement | null;
 *   reducedMotion: HTMLSelectElement | null;
 *   saveButton: HTMLElement | null;
 *   resetButton: HTMLElement | null;
 *   closeButton: HTMLElement | null;
 *   exportButton: HTMLElement | null;
 *   importField: HTMLTextAreaElement | null;
 *   importButton: HTMLElement | null;
 *   statusLine: HTMLElement | null;
 * }} GameSettingsRefs
 *
 * @typedef {{
 *   canvas: HTMLCanvasElement;
 *   hudRefs: GameHudRefs;
 *   overlayRefs: GameOverlayRefs;
 *   mediaRefs: {
 *     layer: HTMLElement;
 *     video: HTMLVideoElement;
 *   };
 *   shellElement: HTMLElement;
 *   transitionLayer?: HTMLElement | null;
 *   settingsRefs?: GameSettingsRefs;
 * }} GameAppOptions
 */

export class GameApp {
  /**
   * @param {GameAppOptions} options
   */
  constructor({
    canvas,
    hudRefs,
    overlayRefs,
    mediaRefs,
    shellElement,
    transitionLayer,
    settingsRefs,
  }) {
    this.hudRefs = hudRefs;
    this.overlayRefs = overlayRefs;
    this.mediaRefs = mediaRefs;
    this.shellElement = shellElement;
    /** @type {HTMLElement | null | undefined} */
    this.transitionLayer = transitionLayer ?? null;
    /** @type {typeof settingsRefs | undefined} */
    this.settingsRefs = settingsRefs;

    this.renderer = new CanvasRenderer(canvas);
    this.input = new InputManager(canvas);
    this.sceneManager = new SceneManager(this);
    this.domView = new GameDomView({
      hudRefs,
      overlayRefs,
      mediaRefs,
      shellElement,
      settingsRefs,
      getCurrentSceneName: () => this.sceneManager.currentScene?.name,
    });
    this.settingsBinder = new SettingsFormBinder({
      ingestUserSettings: (snapshot) => this.ingestUserSettings(snapshot),
      navigateToMenu: () => {
        void this.sceneManager.setScene("menu");
      },
    });
    this.loop = new GameLoop({
      update: (/** @type {number} */ deltaTime) => this.update(deltaTime),
      render: () => this.render(),
    });

    this.lifecycle = new AppLifecycle(this);
    /** @type {ResizeObserver | null} */
    this.resizeObserver = null;
    this.handleResize = this.handleResize.bind(this);
    this.handleFullscreenChange = this.handleFullscreenChange.bind(this);

    /** @type {Map<HTMLElement, { type: string, listener: EventListenerOrEventListenerObject }[]>} */
    this.uiHandlers = new Map();
  }

  async init() {
    const canvas = this.renderer.canvas;
    canvas.style.backgroundImage = "";
    canvas.style.backgroundSize = "";
    canvas.style.backgroundPosition = "";
    canvas.style.backgroundRepeat = "";

    this.ingestUserSettings(loadUserSettings());
    this.input.attach();
    registerAppScenes(this.sceneManager, this);
    this.bindUi();
    this.lifecycle.attach();
    this.initCongratsModal();
    await this.sceneManager.setScene("menu");
    this.syncPresentation();
  }

  /**
   * Finaliza la aplicación y libera recursos globales.
   */
  destroy() {
    this.lifecycle.detach();
    this.settingsBinder.detach();
    this.detachUi();
  }

  /**
   * @private
   * @param {HTMLElement | null | undefined} element
   * @param {string} type
   * @param {EventListenerOrEventListenerObject} listener
   */
  addUiListener(element, type, listener) {
    if (!element) {
      return;
    }
    element.addEventListener(type, listener);
    if (!this.uiHandlers.has(element)) {
      this.uiHandlers.set(element, []);
    }
    this.uiHandlers.get(element)?.push({ type, listener });
  }

  bindUi() {
    this.addUiListener(this.overlayRefs.primaryButton, "click", () => {
      this.sceneManager.handleUiAction("primary");
    });

    this.addUiListener(this.overlayRefs.secondaryButton, "click", () => {
      this.sceneManager.handleUiAction("secondary");
    });

    this.addUiListener(this.overlayRefs.tertiaryButton, "click", () => {
      this.sceneManager.handleUiAction("tertiary");
    });
  }

  detachUi() {
    for (const [element, listeners] of this.uiHandlers.entries()) {
      for (const { type, listener } of listeners) {
        element.removeEventListener(type, listener);
      }
    }
    this.uiHandlers.clear();
  }

  renderIfViewportChanged() {
    if (this.renderer.resize()) {
      this.render();
    }
  }

  handleResize() {
    this.renderIfViewportChanged();
  }

  handleFullscreenChange() {
    this.renderIfViewportChanged();
  }

  initCongratsModal() {
    const dialog = /** @type {HTMLDialogElement | null} */ (
      document.getElementById("congrats-modal")
    );
    const canvasHost = document.getElementById("confetti-canvas");
    const title = document.getElementById("congrats-title");
    const realm = document.getElementById("congrats-realm");
    const nextBtn = /** @type {HTMLButtonElement | null} */ (
      document.getElementById("congrats-next-btn")
    );

    if (dialog && canvasHost && title && realm && nextBtn) {
      /** @type {import("../ui/CongratsModal.js").CongratsModal | null} */
      this.congratsModal = new CongratsModal(
        dialog,
        canvasHost,
        title,
        realm,
        nextBtn,
      );
    } else {
      this.congratsModal = null;
    }
  }

  start() {
    this.loop.start();
  }

  /**
   * @param {number} deltaTime
   */
  update(deltaTime) {
    if (this.input.consumePress("fullscreen")) {
      void this.toggleFullscreen();
    }

    this.sceneManager.update(deltaTime, this.input);
    this.syncPresentation();
    this.input.endFrame();
  }

  render() {
    this.sceneManager.render(this.renderer);
  }

  syncPresentation() {
    this.domView.applyHudState(this.sceneManager.getHudState());
    const overlayPayload = this.sceneManager.getOverlayState();
    this.domView.applyOverlayState(overlayPayload);
    this.domView.applyMediaState(this.sceneManager.getMediaState());
    this.domView.refreshShellLayout(overlayPayload);
  }

  /**
   * @param {Partial<ReturnType<import("../services/user-settings.service.js").loadUserSettings>>} settings
   */
  ingestUserSettings(settings) {
    const snapshot = sanitizeSettings(settings);

    document.documentElement.dataset.difficulty = /** @type {string} */ (
      snapshot.difficulty
    );
    document.documentElement.dataset.motion = this.resolveMotionPreference(
      snapshot.reducedMotionOverride,
    );

    this.shellElement.dataset.highContrast = snapshot.highContrastHud
      ? "true"
      : "false";
  }

  /**
   * @param {boolean | "system" | null | undefined} reducedMotionOverride
   */
  resolveMotionPreference(reducedMotionOverride) {
    if (reducedMotionOverride === true) {
      return "forced";
    }

    if (reducedMotionOverride === false) {
      return "off";
    }

    return "system";
  }

  /**
   * @param {() => Promise<void> | void} task
   */
  async runSceneTransition(task) {
    const layer = this.transitionLayer;
    if (!layer) {
      await task();
      return;
    }

    await new Promise((resolve) => {
      layer.classList.add("is-visible");
      globalThis.window.setTimeout(resolve, 190);
    });

    await task();

    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        layer.classList.remove("is-visible");
        globalThis.window.setTimeout(resolve, 190);
      });
    });
  }

  bindSettingsForm() {
    this.settingsBinder.attachIfNeeded(this.settingsRefs);
  }

  refreshSettingsControls() {
    this.settingsBinder.refreshControls(this.settingsRefs);
  }

  async toggleFullscreen() {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await this.shellElement.requestFullscreen();
  }

  /**
   * @param {number} milliseconds
   */
  advanceTime(milliseconds) {
    this.loop.advance(milliseconds);
  }

  renderGameToText() {
    return JSON.stringify({
      ...this.sceneManager.describeState(),
      overlayVisible: !this.overlayRefs.panel.classList.contains("is-hidden"),
      hudVisible: !this.hudRefs.panel.classList.contains("is-hidden"),
      mediaVisible: !this.mediaRefs.layer.classList.contains("is-hidden"),
    });
  }
}
