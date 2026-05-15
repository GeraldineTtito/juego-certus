// @ts-check

import { MEDIA_PATHS } from "../config/media-paths.config.js";
import { getLevelById } from "../config/Levels.js";
import { BaseScene } from "./BaseScene.js";

const TRAILER_VISUAL = {
  bgImage: MEDIA_PATHS.backgrounds.menu,
  skyTop: "#758ba5",
  skyBottom: "#07101a",
  mist: "rgba(143, 183, 221, 0.13)",
  accent: "#d6ebff",
  floorColor: "#0a0e14",
  floorGlow: "#7dc8f0",
  rimColor: "#f3f8ff",
  particleColor: "#d7ecff",
  sunColor: "#fbfeff",
  ambientHeat: 0,
  emberIntensity: 0.1,
};

export class TrailerScene extends BaseScene {
  /**
   * @param {import("../app/GameApp.js").GameApp} app
   * @param {import("../core/SceneManager.js").ScenePayload} payload
   */
  constructor(app, payload) {
    super(app);
    const level = getLevelById(payload.levelId ?? 1) ?? getLevelById(1);
    if (!level) {
      throw new Error("TrailerScene: critical level data missing");
    }
    this.level = level;
    this.elapsed = 0;
    this.playbackState = "loading";
    this.advanceHandled = false;
    this.interactionLockRemaining = 0.32;

    this.handleEnded = this.handleEnded.bind(this);
    this.handlePlay = this.handlePlay.bind(this);
    this.handlePause = this.handlePause.bind(this);
  }

  get video() {
    return /** @type {HTMLVideoElement} */ (this.app.mediaRefs.video);
  }

  /** @override */
  async enter() {
    this.interactionLockRemaining = 0.32;
    if (document.pointerLockElement) {
      document.exitPointerLock?.();
    }

    this.app.syncPresentation();
    this.bindVideo();
    this.prepareVideo();
    this.tryAutoplay();
  }

  exit() {
    const video = this.video;
    video.pause();
    video.currentTime = 0;
    this.unbindVideo();
  }

  bindVideo() {
    const video = this.video;
    video.addEventListener("ended", this.handleEnded);
    video.addEventListener("play", this.handlePlay);
    video.addEventListener("pause", this.handlePause);
  }

  unbindVideo() {
    const video = this.video;
    video.removeEventListener("ended", this.handleEnded);
    video.removeEventListener("play", this.handlePlay);
    video.removeEventListener("pause", this.handlePause);
  }

  prepareVideo() {
    this.video.pause();
    this.video.currentTime = 0;
  }

  async tryAutoplay() {
    try {
      await this.video.play();
      this.playbackState = "playing";
    } catch {
      this.playbackState = "ready";
    }
  }

  handleEnded() {
    this.playbackState = "ended";
    this.continueToStory();
  }

  handlePlay() {
    this.playbackState = "playing";
  }

  handlePause() {
    if (this.video.ended) {
      return;
    }

    this.playbackState = "paused";
  }

  continueToStory() {
    if (this.advanceHandled) {
      return;
    }

    this.advanceHandled = true;
    this.video.pause();
    this.app.sceneManager.setScene("story", { levelId: this.level.id });
  }

  /**
   * @param {number} deltaTime
   * @param {import("../core/InputManager.js").InputManager} input
   */
  update(deltaTime, input) {
    this.elapsed += deltaTime;
    this.interactionLockRemaining = Math.max(
      0,
      this.interactionLockRemaining - deltaTime,
    );

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
    if (this.interactionLockRemaining > 0) {
      return;
    }

    if (action === "secondary") {
      this.video.pause();
      void this.app.sceneManager.setScene("menu");
      return;
    }

    this.continueToStory();
  }

  getOverlayState() {
    const playbackCopy =
      this.playbackState === "ready" || this.playbackState === "paused"
        ? "El navegador no sostuvo la reproduccion automatica. Puedes darle play en el video o saltar directo a la historia."
        : `Antes de entrar a ${this.level.realm}, la campana abre con un trailer corto para presentar el tono del reino.`;

    return {
      visible: true,
      kicker: "Trailer de campana",
      title: `${this.level.realm} despierta`,
      body: playbackCopy,
      details: [
        `Destino actual: ${this.level.realm} - ${this.level.subtitle}.`,
        "Si el video termina, la historia entra sola al siguiente paso.",
        "Puedes saltar el trailer con el boton principal o volver al menu con el secundario.",
      ],
      primaryLabel: "Saltar trailer",
      secondaryLabel: "Volver al menu",
      showSecondary: true,
    };
  }

  getMediaState() {
    return {
      visible: true,
      mode: "trailer",
      src: MEDIA_PATHS.trailer,
      controls: true,
      muted: false,
      loop: false,
      label: "Trailer de campana",
    };
  }

  /**
   * @param {import("../render/CanvasRenderer.js").CanvasRenderer} renderer
   */
  render(renderer) {
    renderer.drawBackdrop({
      visual: { ...TRAILER_VISUAL, bgImage: this.level.visual.bgImage },
      time: this.elapsed,
      variant: "menu",
    });
  }

  describeState() {
    return {
      mode: "trailer",
      levelId: this.level.id,
      realm: this.level.realm,
      playbackState: this.playbackState,
      currentTime: Number(this.video.currentTime.toFixed(2)),
      duration: Number.isFinite(this.video.duration)
        ? Number(this.video.duration.toFixed(2))
        : null,
    };
  }
}
