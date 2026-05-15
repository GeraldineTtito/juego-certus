// @ts-check

/**
 * @typedef {Object} GameplaySummary
 * @property {number} defeated
 * @property {number} objective
 * @property {number} timeRemaining
 * @property {number} damageTaken
 * @property {string} [difficulty]
 * @property {boolean} [flawlessRun]
 */

/**
 * @typedef {Object} ScenePayload
 * @property {number} [levelId]
 * @property {number} [nextLevelId]
 * @property {boolean} [skipFade]
 * @property {boolean} [victory]
 * @property {string} [source]
 * @property {string} [kind]
 * @property {GameplaySummary} [summary]
 */

export class SceneManager {
  /**
   * @param {import("../app/GameApp.js").GameApp} app
   */
  constructor(app) {
    this.app = app;
    /** @type {Map<string, (payload?: ScenePayload) => (import("../scenes/BaseScene.js").BaseScene | Promise<import("../scenes/BaseScene.js").BaseScene>)>} */
    this.registry = new Map();
    /** @type {import("../scenes/BaseScene.js").BaseScene | null} */
    this.currentScene = null;
    /** @type {boolean} evita cortina en el bootstrap inicial */
    this.enableTransitions = false;
    /** @type {boolean} evita carreras entre transiciones simultaneas */
    this.transitionInProgress = false;
    /** @type {Promise<void> | null} */
    this.activeTransition = null;
  }

  /**
   * @param {string} name
   * @param {(payload?: ScenePayload) => (import("../scenes/BaseScene.js").BaseScene | Promise<import("../scenes/BaseScene.js").BaseScene>)} factory
   */
  register(name, factory) {
    this.registry.set(name, factory);
  }

  /**
   * @param {string} name
   * @param {ScenePayload} [payload]
   */
  async setScene(name, payload = {}) {
    if (this.transitionInProgress && this.activeTransition !== null) {
      return this.activeTransition;
    }

    const factory = this.registry.get(name);
    if (!factory) {
      throw new Error(`Scene "${name}" no esta registrada.`);
    }

    this.transitionInProgress = true;

    this.activeTransition = this.runSceneSwap(name, factory, payload);

    try {
      await this.activeTransition;
    } finally {
      this.enableTransitions = true;
      this.transitionInProgress = false;
      this.activeTransition = null;
    }
  }

  /**
   * @param {string} name
   * @param {(payload?: ScenePayload) => (import("../scenes/BaseScene.js").BaseScene | Promise<import("../scenes/BaseScene.js").BaseScene>)} factory
   * @param {ScenePayload} payload
   */
  async runSceneSwap(name, factory, payload) {
    /** @type {boolean} */
    const allowFade =
      payload?.skipFade !== true &&
      typeof this.app.runSceneTransition === "function" &&
      this.enableTransitions === true;

    const swapOperation = async () => {
      if (this.currentScene?.exit) {
        this.currentScene.exit();
      }

      this.currentScene = await Promise.resolve(factory(payload));
      this.currentScene.name = name;

      if (this.currentScene.enter) {
        await Promise.resolve(this.currentScene.enter(payload));
      }

      this.app.syncPresentation();
    };

    if (allowFade) {
      await this.app.runSceneTransition(swapOperation);
    } else {
      await swapOperation();
    }
  }

  /**
   * @param {number} deltaTime
   * @param {import("./InputManager.js").InputManager} input
   */
  update(deltaTime, input) {
    this.currentScene?.update?.(deltaTime, input);
  }

  /**
   * @param {import("../render/CanvasRenderer.js").CanvasRenderer} renderer
   */
  render(renderer) {
    this.currentScene?.render?.(renderer);
  }

  /**
   * @param {string} action
   */
  handleUiAction(action) {
    this.currentScene?.handleUiAction?.(action);
  }

  /**
   * @returns {{ visible: boolean; [key: string]: unknown }}
   */
  getOverlayState() {
    return this.currentScene?.getOverlayState?.() ?? { visible: false };
  }

  /**
   * @returns {{ visible: boolean; [key: string]: unknown }}
   */
  getHudState() {
    return this.currentScene?.getHudState?.() ?? { visible: false };
  }

  /**
   * @returns {{ visible: boolean; [key: string]: unknown }}
   */
  getMediaState() {
    return this.currentScene?.getMediaState?.() ?? { visible: false };
  }

  describeState() {
    return this.currentScene?.describeState?.() ?? { mode: "unknown" };
  }
}
