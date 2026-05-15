// @ts-check

import { drawOrb } from "../../canvasProjectedPrimitives.js";
import { drawSlashArc } from "../../canvasWorldVfx.js";

/**
 * @typedef {import("../../canvasOrganicBlob.js").CameraLike} CameraLike
 */

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {CameraLike} camera
 * @param {import("../../../game/entities/Enemy.js").Enemy} enemy
 * @param {{ x: number; y: number; z: number }} center
 * @param {string} detailColor
 */
export function drawFiendReactiveEffects(
  ctx,
  camera,
  enemy,
  center,
  detailColor,
) {
  if (enemy.hitFlashRemaining > 0) {
    drawOrb(
      ctx,
      camera,
      center,
      0.64,
      "#ffffff",
      detailColor,
      (enemy.hitFlashRemaining / 0.15) * 0.16,
    );
  }
  if (enemy.attackPhase === "active") {
    drawSlashArc(
      ctx,
      camera,
      enemy.position,
      enemy.facingYaw,
      1.6,
      detailColor,
    );
  }
}
