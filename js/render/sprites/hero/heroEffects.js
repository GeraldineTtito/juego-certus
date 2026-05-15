// @ts-check

import { drawOrb } from "../../canvasProjectedPrimitives.js";
import { drawSlashArc } from "../../canvasWorldVfx.js";

/**
 * @typedef {import("../../canvasOrganicBlob.js").CameraLike} CameraLike
 */

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {CameraLike} camera
 * @param {import("../../../game/entities/Player.js").Player} player
 * @param {{ x: number; y: number; z: number }} core
 * @param {string} slimeHighlight
 */
export function drawHeroReactiveEffects(
  ctx,
  camera,
  player,
  core,
  slimeHighlight,
) {
  if (player.attackPhase === "active") {
    drawSlashArc(
      ctx,
      camera,
      player.position,
      player.facingYaw,
      2.2,
      slimeHighlight,
    );
  }

  if (player.hitFlashRemaining > 0) {
    drawOrb(
      ctx,
      camera,
      core,
      0.72,
      "#ffffff",
      slimeHighlight,
      (player.hitFlashRemaining / 0.16) * 0.18,
    );
  }
}
