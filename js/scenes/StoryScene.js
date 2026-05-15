// @ts-check

import { buildResolvedLevel } from "../config/GameplayRuntime.js";
import { resolveLevelIdFromPayloadOrProgress } from "../services/CampaignProgress.js";
import { loadUserSettings } from "../services/user-settings.service.js";
import { BaseScene } from "./BaseScene.js";

export class StoryScene extends BaseScene {
  /**
   * @param {import("../app/GameApp.js").GameApp} app
   * @param {import("../core/SceneManager.js").ScenePayload} payload
   */
  constructor(app, payload) {
    super(app);
    const prefs = loadUserSettings();
    this.level = buildResolvedLevel(
      resolveLevelIdFromPayloadOrProgress(payload),
      prefs.difficulty,
    );
    this.elapsed = 0;
  }

  /**
   * @param {number} deltaTime
   * @param {import("../core/InputManager.js").InputManager} input
   */
  update(deltaTime, input) {
    this.elapsed += deltaTime;

    if (input.consumePress("confirm")) {
      this.handleUiAction("primary");
    }

    if (input.consumePress("pause")) {
      this.handleUiAction("secondary");
    }
  }

  /**
   * @param {"primary"|"secondary"|string} action
   */
  handleUiAction(action) {
    if (action === "secondary") {
      this.app.sceneManager.setScene("menu");
      return;
    }

    this.app.sceneManager.setScene("gameplay", { levelId: this.level.id });
  }

  getOverlayState() {
    return {
      visible: true,
      kicker: `Reino ${this.level.id}`,
      title: `${this.level.realm} - ${this.level.subtitle}`,
      body: this.level.story,
      details: [
        `Objetivo: derrota ${this.level.objectiveKills} enemigos dentro de la arena.`,
        `Tiempo límite: ${this.level.timeLimit} segundos.`,
        "La cámara se gobierna con el mouse y la arena usa oleadas radiales.",
        "Solo recibes daño por ataques comprometidos, no por simple contacto.",
      ],
      primaryLabel: "Entrar a la arena",
      secondaryLabel: "Volver al menú",
      showSecondary: true,
    };
  }

  /**
   * @param {import("../render/CanvasRenderer.js").CanvasRenderer} renderer
   */
  render(renderer) {
    renderer.drawBackdrop({
      visual: this.level.visual,
      time: this.elapsed,
      variant: "story",
    });
  }

  describeState() {
    return {
      mode: "story",
      levelId: this.level.id,
      realm: this.level.realm,
    };
  }
}
