// @ts-check

/**
 * @typedef {import("../core/SceneManager.js").ScenePayload} ScenePayload
 */

export class BaseScene {
  /** @type {string} */
  name = "";
  /**
   * @param {import("../app/GameApp.js").GameApp} app
   */
  constructor(app) {
    this.app = app;
  }

  /**
   * @param {ScenePayload} [_payload]
   * @returns {Promise<void> | void}
   */
  enter(_payload) {
    // optional hook for subclasses
  }

  exit() {
    // optional hook for subclasses
  }

  /**
   * @param {number} [_deltaTime]
   * @param {import("../core/InputManager.js").InputManager} [_input]
   */
  update(_deltaTime, _input) {
    // subclasses override
  }

  /**
   * @param {import("../render/CanvasRenderer.js").CanvasRenderer} [_renderer]
   */
  render(_renderer) {
    // subclasses override
  }

  /**
   * @param {string} [_action]
   */
  handleUiAction(_action) {
    // subclasses override
  }

  getOverlayState() {
    return { visible: false };
  }

  getHudState() {
    return { visible: false };
  }

  getMediaState() {
    return { visible: false };
  }

  describeState() {
    return {
      mode: "scene",
    };
  }
}
