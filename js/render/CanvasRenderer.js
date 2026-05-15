// @ts-check

/**
 * Orquestador del frame 2D: viewport, ciclo gameplay y delegates por responsabilidad.
 * Color, geometría, primitivas, arena, sprites y HUD están en módulos dedicados (SRP).
 */

import {
  drawArena,
  drawArenaEmbers,
  drawArenaMarks,
  drawArenaProps,
} from "./canvasArenaPainter.js";
import { drawCanvasBackdrop } from "./canvasBackdropPainter.js";
import { drawEnemySprite } from "./canvasEnemySprites.js";
import {
  drawGameplayCrosshair,
  drawPausedShadeOverlay,
} from "./canvasGameplayHud.js";
import { drawHeroSprite } from "./canvasHeroSprite.js";
import { drawEffects, drawGroundShadow } from "./canvasWorldVfx.js";

export class CanvasRenderer {
  /** @param {HTMLCanvasElement} canvas */
  constructor(canvas) {
    this.canvas = canvas;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("CanvasRenderingContext2D no disponible");
    }
    this.ctx = context;
    this.width = canvas.width;
    this.height = canvas.height;
    this.devicePixelRatio = 1;
    this.resize();
  }

  resize() {
    const bounds = this.canvas.getBoundingClientRect();
    const nextWidth = Math.max(320, Math.round(bounds.width || this.width));
    const nextHeight = Math.max(240, Math.round(bounds.height || this.height));
    const nextDpr = Math.min(window.devicePixelRatio || 1, 2);

    if (
      nextWidth === this.width &&
      nextHeight === this.height &&
      nextDpr === this.devicePixelRatio
    ) {
      return false;
    }

    this.width = nextWidth;
    this.height = nextHeight;
    this.devicePixelRatio = nextDpr;
    this.canvas.width = Math.round(this.width * this.devicePixelRatio);
    this.canvas.height = Math.round(this.height * this.devicePixelRatio);
    this.ctx.setTransform(
      this.devicePixelRatio,
      0,
      0,
      this.devicePixelRatio,
      0,
      0,
    );
    return true;
  }

  getViewport() {
    return {
      width: this.width,
      height: this.height,
    };
  }

  /** @readonly */
  get canvasState() {
    return {
      ctx: this.ctx,
      width: this.width,
      height: this.height,
    };
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  /**
   * @param {{ visual: import("../config/Levels.js").CampaignLevel["visual"]; time?: number; variant?: "menu" | "gameplay" | "story" | "result" }} opts
   */
  drawBackdrop({ visual, time = 0, variant = "menu" }) {
    this.clear();
    drawCanvasBackdrop(
      this.ctx,
      { width: this.width, height: this.height },
      { visual, time, variant },
    );
  }

  /** @param {import("../game/GameWorld.js").GameWorld} world */
  drawGameplayWorld(world) {
    this._renderBackground(world);
    this._renderArena(world);
    this._renderShadows(world);
    this._renderEntities(world);
    this._renderUI(world);
  }

  /**
   * @private
   * @param {import("../game/GameWorld.js").GameWorld} world
   */
  _renderBackground(world) {
    drawCanvasBackdrop(
      this.ctx,
      { width: this.width, height: this.height },
      {
        visual: world.level.visual,
        time: world.elapsed,
        variant: "gameplay",
      },
    );
  }

  /**
   * @private
   * @param {import("../game/GameWorld.js").GameWorld} world
   */
  _renderArena(world) {
    const cs = this.canvasState;
    drawArena(cs, world);
    drawArenaMarks(cs.ctx, world);
    drawArenaEmbers(cs.ctx, world);
    drawArenaProps(cs.ctx, world);
  }

  /**
   * @private
   * @param {import("../game/GameWorld.js").GameWorld} world
   */
  _renderShadows(world) {
    const camera = world.camera;
    for (const enemy of world.enemies) {
      drawGroundShadow(
        this.ctx,
        camera,
        enemy.position,
        enemy.radius * 1.8,
        enemy.shadowColor,
        { tintHex: enemy.detailColor, tintAlpha: enemy.elite ? 0.14 : 0.08 },
      );
    }

    drawGroundShadow(
      this.ctx,
      camera,
      world.player.position,
      world.player.radius * 1.9,
      "rgba(0, 0, 0, 0.34)",
      {
        tintHex: world.player.palette.primary,
        tintAlpha: 0.24,
      },
    );
  }

  /**
   * @private
   * @param {import("../game/GameWorld.js").GameWorld} world
   */
  _renderEntities(world) {
    const camera = world.camera;
    const cs = this.canvasState;
    const elapsed = world.elapsed;

    const cullMarginX = Math.max(world.viewport.width * 0.42, 200);
    const cullMarginY = Math.max(world.viewport.height * 0.5, 220);

    const drawables = [
      ...world.enemies.map((enemy) => ({ kind: "enemy", entity: enemy })),
      { kind: "player", entity: world.player },
    ]
      .map((drawable) => {
        const projection = camera.project({
          x: drawable.entity.position.x,
          y: drawable.entity.position.y + drawable.entity.height * 0.6,
          z: drawable.entity.position.z,
        });

        const offscreen =
          !projection ||
          projection.x < -cullMarginX ||
          projection.x > cs.width + cullMarginX ||
          projection.y < -cullMarginY ||
          projection.y > cs.height + cullMarginY;

        return {
          ...drawable,
          depth: projection?.depth ?? 0,
          offscreen,
        };
      })
      .sort((left, right) => right.depth - left.depth);

    for (const drawable of drawables) {
      if (drawable.offscreen) {
        continue;
      }

      if (drawable.kind === "player") {
        drawHeroSprite(
          this.ctx,
          camera,
          /** @type {import("../game/entities/Player.js").Player} */ (
            drawable.entity
          ),
          elapsed,
        );
      } else {
        drawEnemySprite(
          this.ctx,
          camera,
          /** @type {import("../game/entities/Enemy.js").Enemy} */ (
            drawable.entity
          ),
          elapsed,
        );
      }
    }
  }

  /**
   * @private
   * @param {import("../game/GameWorld.js").GameWorld} world
   */
  _renderUI(world) {
    drawEffects(this.ctx, world.camera, world.effects);
    drawGameplayCrosshair(this.ctx, this.width, this.height, world.player);
  }

  drawPausedShade() {
    drawPausedShadeOverlay(this.ctx, this.width, this.height);
  }
}
