// @ts-check

import { getLevelById } from "../config/Levels.js";
import { setCurrentCampaignLevel } from "../services/CampaignProgress.js";
import { BaseScene } from "./BaseScene.js";

export class ResultScene extends BaseScene {
  /**
   * @param {import("../app/GameApp.js").GameApp} app
   * @param {import("../core/SceneManager.js").ScenePayload} payload
   */
  constructor(app, payload) {
    super(app);
    this.kind = payload.kind ?? "defeat";
    this.summary = payload.summary ?? {
      defeated: 0,
      objective: 0,
      timeRemaining: 0,
      damageTaken: 0,
      difficulty: "normal",
      flawlessRun: false,
    };
    this.nextLevelId = payload.nextLevelId ?? 1;
    const level = getLevelById(payload.levelId ?? 1) ?? getLevelById(1);
    if (!level) {
      throw new Error("ResultScene: level data missing");
    }
    this.level = level;
    this.elapsed = 0;
    this.inputGracePeriod = 0.8;
    this.modalOpen = false;
  }

  /** @override */
  async enter() {
    this.app.input.releasePointerLock();

    const isVictory =
      this.kind === "level-complete" || this.kind === "campaign-complete";
    if (isVictory && this.app.congratsModal) {
      this.modalOpen = true;
      this.app.congratsModal.show(this.level.id, this.level.realm, () => {
        this.modalOpen = false;
      });
    }
  }

  /**
   * @param {number} deltaTime
   * @param {import("../core/InputManager.js").InputManager} input
   */
  update(deltaTime, input) {
    this.elapsed += deltaTime;

    if (this.modalOpen || this.elapsed < this.inputGracePeriod) {
      input.consumePress("confirm");
      input.consumePress("pause");
      return;
    }

    if (input.consumePress("confirm")) {
      this.handleUiAction("primary");
    }

    if (input.consumePress("pause")) {
      this.handleUiAction("secondary");
    }
  }

  /**
   * @param {string} action
   */
  handleUiAction(action) {
    if (this.modalOpen || this.elapsed < this.inputGracePeriod) {
      return;
    }

    if (action === "secondary") {
      this.app.sceneManager.setScene("menu");
      return;
    }

    if (this.kind === "campaign-complete") {
      this.app.sceneManager.setScene("menu");
      return;
    }

    if (this.kind === "level-complete") {
      this.app.sceneManager.setScene("story", {
        levelId: this.nextLevelId,
      });
      return;
    }

    setCurrentCampaignLevel(this.level.id);
    this.app.sceneManager.setScene("gameplay", { levelId: this.level.id });
  }

  getOverlayState() {
    const isCampaignComplete = this.kind === "campaign-complete";
    const isLevelComplete = this.kind === "level-complete";

    const title = (() => {
      if (isCampaignComplete) {
        return "Ragnarok contenido";
      }
      if (isLevelComplete) {
        return `${this.level.realm} purgado`;
      }
      if (this.kind === "timeout") {
        return "La grieta te sobrevivió";
      }
      return "El frente colapsó";
    })();

    const body = (() => {
      if (isCampaignComplete) {
        return "La nueva base ya soporta una campaña completa de cinco reinos con combate en tercera persona, control de cámara y progreso persistente.";
      }
      if (isLevelComplete) {
        return `Has asegurado la zona. El portal hacia el nivel ${this.nextLevelId} está abierto. ¿Deseas continuar tu avance en la campaña?`;
      }
      return "Reinicia la misma arena y ajusta distancia, timing de esquiva y prioridad de objetivos antes del siguiente intento.";
    })();

    const primaryLabel = (() => {
      if (isCampaignComplete) {
        return "Volver al menú";
      }
      if (isLevelComplete) {
        return `Continuar al nivel ${this.nextLevelId}`;
      }
      return "Reintentar arena";
    })();

    return {
      visible: true,
      kicker:
        isCampaignComplete || isLevelComplete
          ? `¡Felicidades por completar el nivel ${this.level.id}!`
          : "Intento fallido",
      title,
      body,
      details: [
        ...(this.kind === "level-complete" && this.summary.flawlessRun === true
          ? [`Combate impecable: recibiste 0 puntos de daño en este nivel.`]
          : []),
        `Enemigos derrotados: ${this.summary.defeated} / ${this.summary.objective}.`,
        `Tiempo restante: ${Math.max(0, Math.round(this.summary.timeRemaining))} s.`,
        `Daño recibido: ${this.summary.damageTaken}.`,
        ...(this.summary.difficulty
          ? [`Dificultad activada: ${this.summary.difficulty}.`]
          : []),
      ],
      primaryLabel,
      secondaryLabel: "Salir al menú",
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
      variant: "result",
    });
  }

  describeState() {
    return {
      mode: "result",
      kind: this.kind,
      summary: this.summary,
    };
  }
}
