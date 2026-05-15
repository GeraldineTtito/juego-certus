// @ts-check

import { getLevelById } from "../config/Levels.js";
import { resolveMenuNavigation } from "../services/campaign-navigation.service.js";
import {
  getCampaignState,
  hasMeaningfulProgress,
} from "../services/CampaignProgress.js";
import { loadUserSettings } from "../services/user-settings.service.js";
import { BaseScene } from "./BaseScene.js";
import { MEDIA_PATHS } from "../config/media-paths.config.js";

const MENU_VISUAL = {
  bgImage: MEDIA_PATHS.backgrounds.menu,
  skyTop: "#6b809b",
  skyBottom: "#09121b",
  mist: "rgba(165, 201, 233, 0.14)",
  accent: "#d6ebff",
  floorColor: "#0a0e14",
  floorGlow: "#92d5ef",
  rimColor: "#f1f7ff",
  particleColor: "#d9edff",
  sunColor: "#f5fbff",
  ambientHeat: 0,
  emberIntensity: 0.1,
};

export class MenuScene extends BaseScene {
  /**
   * @param {import("../app/GameApp.js").GameApp} app
   */
  constructor(app) {
    super(app);
    this.elapsed = 0;
    this.state = getCampaignState();
  }

  /** @override */
  async enter() {
    this.state = getCampaignState();
    this.app.ingestUserSettings(loadUserSettings());
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
  }

  /**
   * @param {string} action
   */
  handleUiAction(action) {
    const plan = resolveMenuNavigation(action, this.state);
    if (plan.syncStateFromStorage) {
      this.state = getCampaignState();
    }
    void this.app.sceneManager.setScene(plan.scene, plan.payload);
  }

  getOverlayState() {
    const hasProgress = hasMeaningfulProgress(this.state);
    const currentLevel =
      getLevelById(this.state.currentLevel) ?? getLevelById(1);
    if (!currentLevel) {
      throw new Error("MenuScene: critical level data missing");
    }
    const completedCount = Object.keys(this.state.completedLevels).length;

    return {
      visible: true,
      kicker: hasProgress ? "Continua la campaña" : "Campaña de guerra nórdica",
      title: "Furia del Slime",
      body: hasProgress
        ? `Las hordas caen, pero la guerra continúa. Tu avance se ha detenido en ${currentLevel.realm}. Prepárate para seguir purgando la corrupción y reclamar tu dominio sobre los reinos nórdicos.`
        : "Las deidades nórdicas han corrompido los reinos. Como el slime primigenio, debes purgar la podredumbre desde Midgard hasta el mismísimo Ragnarök en un combate visceral donde cada golpe cuenta.",
      details: [
        `Reinos purgados: ${completedCount} / 5.`,
        hasProgress
          ? `Las puertas de ${currentLevel.realm} aguardan tu retorno.`
          : "Tu cruzada comenzará con una visión antes de descender al campo de batalla.",
        "Muévete con WASD o flechas. Explora tu entorno girando la cámara con el mouse.",
        "Clic izquierdo o J ataca sin piedad. Shift o B esquiva el castigo enemigo. Espacio salta.",
        "Pulsa F para pantalla completa y Esc para pausar la masacre.",
        "Configura dificultad, mirada y volumen desde Opciones.",
      ],
      primaryLabel: hasProgress ? "Continuar viaje" : "Iniciar campaña",
      secondaryLabel: hasProgress ? "Reiniciar campaña" : "",
      showSecondary: hasProgress,
      showTertiary: true,
      tertiaryLabel: "Opciones",
    };
  }

  /**
   * @param {import("../render/CanvasRenderer.js").CanvasRenderer} renderer
   */
  render(renderer) {
    const currentLevel =
      getLevelById(this.state.currentLevel) ?? getLevelById(1);
    if (!currentLevel) {
      throw new Error("MenuScene: level data missing in render");
    }
    renderer.drawBackdrop({
      visual: { ...MENU_VISUAL, bgImage: currentLevel.visual.bgImage },
      time: this.elapsed,
      variant: "menu",
    });
  }

  describeState() {
    return {
      mode: "menu",
      currentLevel: this.state.currentLevel,
      unlockedLevel: this.state.unlockedLevel,
      finishedCampaign: this.state.finishedCampaign,
    };
  }
}
