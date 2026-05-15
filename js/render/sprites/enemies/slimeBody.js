// @ts-check

import { adjustHexBrightness, blendHex, hexToRgba } from "../../canvasColor.js";
import { offsetPoint } from "../../canvasGeometry.js";
import {
  drawOrganicSlimeHull,
  drawSlimeCoreLumen,
} from "../../canvasOrganicBlob.js";
import {
  drawOrb,
  drawOrbRim,
  drawGelOrb,
  drawSoftBloom,
  drawProjectedLine,
  drawCapsule,
} from "../../canvasProjectedPrimitives.js";

/**
 * @typedef {import("../../canvasOrganicBlob.js").CameraLike} CameraLike
 * @typedef {import("./slimeTypes.js").FiendRenderState} FiendRenderState
 */

/**
 * @param {{ x: number; y: number; z: number }} center
 * @param {{ x: number; y: number; z: number }} side
 * @param {{ x: number; y: number; z: number }} facing
 * @param {import("../../../game/entities/Enemy.js").Enemy} enemy
 * @param {number} gelPhase
 * @param {number} wobble
 */
export function buildFiendHullPoints(
  center,
  side,
  facing,
  enemy,
  gelPhase,
  wobble,
) {
  const fiendHull = [];
  for (let hullIndex = 0; hullIndex < 13; hullIndex += 1) {
    const t = (hullIndex / 13) * Math.PI * 2;
    const lump =
      1 +
      0.38 * Math.sin(t * 2 + gelPhase) +
      0.2 * Math.sin(t * 4 - gelPhase * 1.3) -
      (enemy.elite ? 0.06 : 0);
    const rf =
      (0.58 + Math.abs(wobble) * 0.08) * lump * (1 + 0.32 * Math.cos(t) ** 2);
    const rs = (0.52 + Math.abs(wobble) * 0.06) * lump;
    const point = offsetPoint(
      center,
      side,
      Math.sin(t) * rs,
      facing,
      Math.cos(t) * rf,
    );
    fiendHull.push({
      x: point.x,
      y: center.y + Math.sin(t * 3 + gelPhase) * 0.06,
      z: point.z,
    });
  }
  return fiendHull;
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {CameraLike} camera
 * @param {FiendRenderState} fiendState
 * @param {number} wobble
 */
export function drawFiendMainBody(ctx, camera, fiendState, wobble) {
  const { center, facing, side, alpha, gelPhase, toxicHull, toxicRim, enemy } =
    fiendState;
  const fiendHull = buildFiendHullPoints(
    center,
    side,
    facing,
    enemy,
    gelPhase,
    wobble,
  );

  drawOrganicSlimeHull(
    ctx,
    camera,
    fiendHull,
    toxicHull,
    enemy.detailColor,
    toxicRim,
    alpha * 0.92,
  );
  drawGelOrb(
    ctx,
    camera,
    { x: center.x, y: center.y - 0.06, z: center.z + 0.05 },
    0.3,
    {
      color: enemy.bodyColor,
      highlight: enemy.detailColor,
      alpha: alpha * 0.44,
      phase: gelPhase * 1.05,
    },
  );
  drawSlimeCoreLumen(
    ctx,
    camera,
    { x: center.x, y: center.y + 0.04, z: center.z - 0.02 },
    0.38 + Math.abs(wobble) * 0.06,
    {
      vividHex: blendHex(toxicHull, enemy.detailColor, 0.55),
      highlightHex: toxicRim,
      alpha: alpha * 0.55,
      phase: gelPhase + enemy.motionPhase,
    },
  );
  drawGelOrb(ctx, camera, center, 0.6 + Math.abs(wobble) * 0.05, {
    color: enemy.bodyColor,
    highlight: enemy.detailColor,
    alpha: alpha * 0.78,
    phase: gelPhase,
  });
  drawSoftBloom(
    ctx,
    camera,
    { x: center.x, y: center.y + 0.02, z: center.z },
    0.88,
    enemy.detailColor,
    alpha * 0.26,
  );
  drawOrbRim(ctx, camera, center, 0.6, enemy.detailColor, alpha * 0.46, 1.52);

  const thoraxBright = offsetPoint(center, side, 0.2, facing, -0.04);
  thoraxBright.y += 0.06;
  drawOrb(
    ctx,
    camera,
    thoraxBright,
    0.11,
    enemy.detailColor,
    "#fff8fc",
    alpha * 0.22,
  );
  drawFiendVeins(ctx, camera, fiendState);
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {CameraLike} camera
 * @param {FiendRenderState} fiendState
 */
export function drawFiendVeins(ctx, camera, fiendState) {
  const { center, side, facing, enemy, gelPhase, alpha } = fiendState;
  const veinCore = adjustHexBrightness(enemy.bodyColor, 0.38);
  for (let vein = 0; vein < 8; vein += 1) {
    const angle = (vein / 8) * Math.PI * 2 + gelPhase * 0.12;
    const surface = offsetPoint(
      center,
      side,
      Math.sin(angle) * 0.52,
      facing,
      Math.cos(angle) * 0.14,
    );
    surface.y = center.y - 0.06 + Math.sin(gelPhase * 0.4 + vein) * 0.03;
    drawProjectedLine(
      ctx,
      camera,
      center,
      surface,
      1.4,
      hexToRgba(veinCore, alpha * (0.32 + (vein % 2) * 0.06)),
    );

    const veinTip = offsetPoint(
      surface,
      side,
      Math.sin(angle * 2) * 0.06,
      facing,
      -0.04,
    );
    drawGelOrb(ctx, camera, veinTip, 0.034, {
      color: enemy.bodyColor,
      highlight: enemy.detailColor,
      alpha: alpha * 0.26,
      phase: gelPhase + vein,
    });
  }
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {CameraLike} camera
 * @param {FiendRenderState} fiendState
 */
export function drawFiendBubbles(ctx, camera, fiendState) {
  const { center, side, facing, enemy, elapsed, alpha } = fiendState;
  const boil = elapsed * (2.8 + (enemy.id.length % 9) * 0.08);
  for (let bubbleIndex = 0; bubbleIndex < 9; bubbleIndex += 1) {
    const bubbleAngle = boil * 1.05 + bubbleIndex * 0.93;
    const lift = Math.sin(boil + bubbleIndex * 5.9) * 0.041;
    const bubble = offsetPoint(
      center,
      side,
      Math.sin(bubbleAngle) * (0.38 + (bubbleIndex % 3) * 0.06),
      facing,
      Math.cos(bubbleAngle) * (0.2 + bubbleIndex * 0.018) - 0.06,
    );
    bubble.y = center.y + 0.06 + bubbleIndex * 0.024 + lift;
    drawGelOrb(ctx, camera, bubble, 0.041 + (bubbleIndex % 3) * 0.018, {
      color: enemy.bodyColor,
      highlight: enemy.detailColor,
      alpha: alpha * (0.3 - bubbleIndex * 0.022),
      phase: boil + bubbleIndex * 1.9,
    });
  }
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {CameraLike} camera
 * @param {FiendRenderState} fiendState
 */
export function drawFiendTendrils(ctx, camera, fiendState) {
  const {
    enemy,
    side,
    facing,
    hornOuter,
    hornSheen,
    toxicRim,
    gelPhase,
    elapsed,
    alpha,
  } = fiendState;
  const tendrilRoot = {
    x: enemy.position.x,
    y: enemy.position.y + 0.4,
    z: enemy.position.z,
  };

  for (let tendril = 0; tendril < 4; tendril += 1) {
    const sway = elapsed * 2.4 + enemy.motionPhase + tendril * 1.37;
    const tip = offsetPoint(
      tendrilRoot,
      side,
      Math.cos(sway) * 0.38,
      facing,
      Math.sin(sway) * 0.26 - 0.08,
    );
    tip.y = enemy.position.y + 0.14 + Math.sin(sway * 1.3) * 0.06;
    drawCapsule(ctx, camera, tendrilRoot, tip, 0.064, hornOuter, alpha * 0.88);
    drawCapsule(ctx, camera, tendrilRoot, tip, 0.028, hornSheen, alpha * 0.4);
    drawGelOrb(ctx, camera, tip, 0.068, {
      color: enemy.bodyColor,
      highlight: enemy.detailColor,
      alpha: alpha * 0.74,
      phase: gelPhase + tendril * 1.6,
    });
    drawOrbRim(ctx, camera, tip, 0.064, toxicRim, alpha * 0.4, 1.02);
  }
}
