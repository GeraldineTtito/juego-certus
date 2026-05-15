// @ts-check

import { ArenaAmbientAudio } from "../audio/ArenaAmbientAudio.js";
import { SfxBus } from "../audio/SfxBus.js";
import { buildResolvedLevel } from "../config/GameplayRuntime.js";
import { getNextLevelId } from "../config/Levels.js";
import { GameWorld } from "../game/GameWorld.js";
import {
  getAccumulatedKills,
  markCampaignFinished,
  markLevelCompleted,
  recordRunOutcome,
  recordRunStarted,
  setAccumulatedKills,
  setCurrentCampaignLevel,
  unlockCampaignLevel,
} from "../services/CampaignProgress.js";
import {
  isReducedMotionActive,
  loadUserSettings,
} from "../services/user-settings.service.js";
import { BaseScene } from "./BaseScene.js";

/**
 * @param {number} seconds
 * @returns {string}
 */
function formatTime(seconds) {
  const clamped = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(clamped / 60)
    .toString()
    .padStart(2, "0");
  const remainingSeconds = (clamped % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

/**
 * @param {string} difficulty
 * @returns {number}
 */
function getDifficultyShakeAccent(difficulty) {
  if (difficulty === "hard") {
    return 1.08;
  }

  if (difficulty === "easy") {
    return 0.9;
  }

  return 1;
}

/**
 * @param {boolean} paused
 * @param {boolean} lockLost
 * @returns {string}
 */
function getGameplayHudStatus(paused, lockLost) {
  if (paused) {
    return "Pausado \u2014 Enter reanuda \u2014 Esc alterna pausa";
  }

  if (lockLost) {
    return "Clic en la arena para fijar la c\u00e1mara";
  }

  return "Mouse mira \u2014 Clic / J / X atacan \u2014 Shift / B esquivan \u2014 F pantalla completa";
}

/** @type {Record<string, string>} */
const DIFFICULTY_LABEL = {
  easy: "Cadete",
  normal: "Guardi\u00e1n",
  hard: "Profec\u00eda cruel",
};

export class GameplayScene extends BaseScene {
  /**
   * @param {import("../app/GameApp.js").GameApp} app
   * @param {import("../core/SceneManager.js").ScenePayload} payload
   */
  constructor(app, payload) {
    super(app);

    const settingsSnapshot = loadUserSettings();
    this.level = buildResolvedLevel(
      payload.levelId ?? 1,
      settingsSnapshot.difficulty,
    );
    /** @type {SfxBus} */
    this.sfxBus = new SfxBus();

    const initialKills = getAccumulatedKills(this.level.id);
    const shakeAccent = getDifficultyShakeAccent(
      /** @type {string} */ (this.level.runtime?.difficulty ?? "normal"),
    );

    this.world = new GameWorld(
      this.level,
      app.renderer.getViewport(),
      initialKills,
      {
        mouseSensitivity: settingsSnapshot.mouseSensitivity,
        lookInvertY: settingsSnapshot.invertLookY,
        shakeScale: shakeAccent,
        reducedShake: isReducedMotionActive(settingsSnapshot),
        sfx: this.sfxBus,
      },
    );

    this.lastPersistedDefeated = initialKills;
    this.paused = false;
    this.transitionHandled = false;

    /** @type {ArenaAmbientAudio | null} */
    this.ambientAudio = null;
  }

  /** @override */
  async enter() {
    const settings = loadUserSettings();
    this.app.ingestUserSettings(settings);
    recordRunStarted();
    setCurrentCampaignLevel(this.level.id);

    const heat = this.level.visual.ambientHeat ?? 0.5;
    /** @type {number} */
    const ambientGain = Math.min(
      1.05,
      settings.ambientVolume * (0.48 + settings.musicVolume * 0.52),
    );

    this.ambientAudio = new ArenaAmbientAudio();
    await this.ambientAudio.start({
      levelId: this.level.id,
      ambientHeat: heat,
      ambientUserVolume: ambientGain,
    });

    const bridge = this.ambientAudio.getAudioBridge();

    if (bridge) {
      this.sfxBus.attachShared(bridge.context, bridge.sfxGain);
    }

    this.sfxBus.setVolumeMultiplier(settings.sfxVolume);
  }

  exit() {
    this.sfxBus.detachShared();
    this.ambientAudio?.stop();
    this.ambientAudio = null;
  }

  persistKillsIfNeeded() {
    const defeated = this.world.stats.defeated;

    if (defeated === this.lastPersistedDefeated) {
      return;
    }

    this.lastPersistedDefeated = defeated;
    setAccumulatedKills(this.level.id, defeated);
  }

  /**
   * @param {number} deltaTime
   * @param {import("../core/InputManager.js").InputManager} input
   */
  update(deltaTime, input) {
    if (input.consumePress("pause")) {
      this.paused = !this.paused;
    }

    if (this.paused) {
      if (input.consumePress("confirm")) {
        this.paused = false;
      }
      return;
    }

    this.world.update(deltaTime, input, this.app.renderer.getViewport());
    this.persistKillsIfNeeded();

    if (this.transitionHandled || this.world.result === "running") {
      return;
    }

    this.transitionHandled = true;

    const summary = this.world.getSummary();

    if (this.world.result === "won") {
      this.sfxBus.play("victory");
      markLevelCompleted(this.level.id, summary);

      const nextLevelId = getNextLevelId(this.level.id);
      if (nextLevelId) {
        unlockCampaignLevel(nextLevelId);
        setCurrentCampaignLevel(nextLevelId);
      }

      recordRunOutcome({
        outcome: "win",
        flawless: summary.flawlessRun === true,
        summary,
      });

      if (nextLevelId) {
        this.app.sceneManager.setScene("result", {
          kind: "level-complete",
          levelId: this.level.id,
          nextLevelId: nextLevelId,
          summary,
        });
        return;
      }

      markCampaignFinished();
      this.app.sceneManager.setScene("result", {
        kind: "campaign-complete",
        levelId: this.level.id,
        summary,
      });
      return;
    }

    this.sfxBus.play("defeat");
    const bucket = this.world.failureReason === "time" ? "timeout" : "defeat";

    recordRunOutcome({
      outcome: bucket,
      flawless: false,
      summary,
    });

    void this.app.sceneManager.setScene("result", {
      kind: bucket,
      levelId: this.level.id,
      summary,
    });
  }

  /**
   * @param {string} action
   */
  handleUiAction(action) {
    if (!this.paused) {
      return;
    }

    if (action === "secondary") {
      void this.app.sceneManager.setScene("menu");
      return;
    }

    this.paused = false;
  }

  getOverlayState() {
    if (!this.paused) {
      return { visible: false };
    }

    return {
      visible: true,
      kicker: "Combate en pausa",
      title: "Arena detenida",
      body: "El combate est\u00e1 congelado. Reanuda cuando est\u00e9s listo o vuelve al men\u00fa para reorganizar tu estrategia.",
      details: [
        "La c\u00e1mara y el puntero se mantienen tal como los dejaste.",
        "Enter reanuda; Escape abre otra vez la pausa.",
        "Desde el men\u00fa principal puedes ajustar dificultad y audio en Opciones.",
      ],
      primaryLabel: "Reanudar combate",
      secondaryLabel: "Salir al men\u00fa",
      showSecondary: true,
    };
  }

  getHudState() {
    const lockLost = !this.app.input.pointerLocked && !this.paused;
    const status = getGameplayHudStatus(this.paused, lockLost);

    /** @type {string} */
    const diffKey =
      typeof this.level.runtime?.difficulty === "string"
        ? this.level.runtime.difficulty
        : "normal";

    return {
      visible: true,
      level: `${this.level.realm} · ${DIFFICULTY_LABEL[diffKey] ?? "Guardi\u00e1n"}`,
      objective: `${this.world.stats.defeated} / ${this.world.stats.objective}`,
      health: `${this.world.player.health} / ${this.world.player.maxHealth}`,
      healthPct: (this.world.player.health / this.world.player.maxHealth) * 100,
      time: formatTime(this.world.timeRemaining),
      status,
      timeCritical: !this.paused && this.world.timeRemaining <= 10,
      healthPulse: this.world.hudPainPulse > 0,
    };
  }

  /**
   * @param {import("../render/CanvasRenderer.js").CanvasRenderer} renderer
   */
  render(renderer) {
    renderer.drawGameplayWorld(this.world);
    if (this.paused) {
      renderer.drawPausedShade();
    }
  }

  describeState() {
    return {
      ...this.world.describeState(),
      paused: this.paused,
    };
  }
}
