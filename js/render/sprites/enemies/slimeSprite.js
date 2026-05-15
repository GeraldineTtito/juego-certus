// @ts-check

import { adjustHexBrightness, blendHex } from "../../canvasColor.js";
import { drawGroundEnergyRing } from "../../canvasWorldVfx.js";
import { getFacingAxes } from "../../enemies/enemy-helpers.js";
import {
  drawFiendMainBody,
  drawFiendBubbles,
  drawFiendTendrils,
} from "./slimeBody.js";
import { drawFiendHeadDetails } from "./slimeFace.js";
import { drawFiendReactiveEffects } from "./slimeEffects.js";

/**
 * @typedef {import("./slimeTypes.js").FiendRenderState} FiendRenderState
 */

/**
 * @param {import("../../../game/entities/Enemy.js").Enemy} enemy
 * @param {number} elapsed
 * @returns {FiendRenderState}
 */
export function buildFiendRenderState(enemy, elapsed) {
  const wobble = Math.sin(enemy.motionPhase) * 0.13;
  const { facing, side } = getFacingAxes(enemy.facingYaw);
  const center = {
    x: enemy.position.x,
    y: enemy.position.y + 0.66 + wobble * 0.22,
    z: enemy.position.z,
  };
  const crest = {
    x: enemy.position.x,
    y: enemy.position.y + 1.08 + wobble * 0.32,
    z: enemy.position.z,
  };
  const alpha = enemy.dead ? 0.5 : 1;
  const gelPhase = elapsed * 2.12 + enemy.motionPhase * 1.08;
  const hornOuter = blendHex(
    enemy.bodyColor,
    "#08040c",
    enemy.elite ? 0.32 : 0.26,
  );
  const hornSheen = adjustHexBrightness(
    enemy.detailColor,
    enemy.elite ? 1.45 : 1.32,
  );
  const toxicHull = blendHex(
    enemy.bodyColor,
    "#482070",
    enemy.elite ? 0.22 : 0.14,
  );
  const toxicRim = blendHex(
    enemy.detailColor,
    "#ffa8dc",
    enemy.elite ? 0.12 : 0.06,
  );

  return {
    alpha,
    center,
    crest,
    elapsed,
    enemy,
    facing,
    gelPhase,
    hornOuter,
    hornSheen,
    side,
    toxicHull,
    toxicRim,
  };
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {import("../../canvasOrganicBlob.js").CameraLike} camera
 * @param {import("../../../game/entities/Enemy.js").Enemy} enemy
 * @param {number} [elapsed]
 */
export function drawSlimeEnemySprite(ctx, camera, enemy, elapsed = 0) {
  const fiendState = buildFiendRenderState(enemy, elapsed);
  const { center, alpha } = fiendState;
  const wobble = Math.sin(enemy.motionPhase) * 0.13;

  drawGroundEnergyRing(
    ctx,
    camera,
    enemy.position,
    enemy.radius * 2.05,
    enemy.detailColor,
    alpha * (enemy.elite ? 0.95 : 0.58),
    elapsed * 1.85 + enemy.motionPhase,
  );

  drawFiendMainBody(ctx, camera, fiendState, wobble);
  drawFiendHeadDetails(ctx, camera, fiendState, wobble);

  drawFiendBubbles(ctx, camera, fiendState);
  drawFiendTendrils(ctx, camera, fiendState);
  drawFiendReactiveEffects(ctx, camera, enemy, center, enemy.detailColor);
}
