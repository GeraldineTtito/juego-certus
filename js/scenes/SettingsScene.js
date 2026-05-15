// @ts-check

import { BaseScene } from "./BaseScene.js";
import { MEDIA_PATHS } from "../config/media-paths.config.js";

const SETTINGS_VISUAL = {
  bgImage: MEDIA_PATHS.backgrounds.menu,
  skyTop: "#4c5c79",
  skyBottom: "#060b15",
  mist: "rgba(160, 198, 255, 0.16)",
  accent: "#d6ebff",
  floorColor: "#0a0e14",
  floorGlow: "#7ec6ff",
  rimColor: "#f1f7ff",
  particleColor: "#d9edff",
  sunColor: "#f5fbff",
  ambientHeat: 0,
  emberIntensity: 0.1,
};

export class SettingsScene extends BaseScene {
  /**
   * @param {import("../app/GameApp.js").GameApp} app
   */
  constructor(app) {
    super(app);
    this.elapsed = 0;
  }

  /** @override */
  async enter() {
    this.app.input.releasePointerLock();
    this.app.bindSettingsForm();
  }

  /**
   * @param {number} deltaTime
   * @param {import("../core/InputManager.js").InputManager} input
   */
  update(deltaTime, input) {
    this.elapsed += deltaTime;

    if (input.consumePress("pause")) {
      this.app.sceneManager.setScene("menu");
    }
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

  /**
   * @param {import("../render/CanvasRenderer.js").CanvasRenderer} renderer
   */
  render(renderer) {
    renderer.drawBackdrop({
      visual: SETTINGS_VISUAL,
      time: this.elapsed,
      variant: "menu",
    });
  }

  describeState() {
    return { mode: "settings" };
  }
}
