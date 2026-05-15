// @ts-check

import { adjustHexBrightness } from "../../canvasColor.js";
import { offsetPoint } from "../../canvasGeometry.js";
import {
  drawOrb,
  drawOrbRim,
  drawGelOrb,
  drawCapsule,
} from "../../canvasProjectedPrimitives.js";
import { drawFiendMouth, drawSlimeEyes } from "../../canvasSlimeFeatures.js";

/**
 * @typedef {import("../../canvasOrganicBlob.js").CameraLike} CameraLike
 * @typedef {import("./slimeTypes.js").FiendRenderState} FiendRenderState
 */

/**
 * @param {import("../../../game/entities/Enemy.js").Enemy} enemy
 */
export function resolveFiendEyeSquint(enemy) {
  if (enemy.attackPhase === "active") {
    return 1.15;
  }
  if (enemy.attackPhase === "windup") {
    return 0.68;
  }
  if (enemy.state === "hit") {
    return 0.74;
  }
  return 1;
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {CameraLike} camera
 * @param {FiendRenderState} fiendState
 * @param {number} wobble
 */
export function drawFiendHeadDetails(ctx, camera, fiendState, wobble) {
  const { center, crest, facing, side, alpha, gelPhase, elapsed, enemy } =
    fiendState;
  const leftSpine = offsetPoint({ ...center }, side, -0.26, facing, -0.06);
  leftSpine.y = enemy.position.y + 0.88 + wobble * 0.06;
  const rightSpine = offsetPoint({ ...center }, side, 0.26, facing, -0.06);
  rightSpine.y = enemy.position.y + 0.88 + wobble * 0.06;

  const eyeSquint = resolveFiendEyeSquint(enemy);

  drawGelOrb(ctx, camera, crest, 0.3, {
    color: enemy.detailColor,
    highlight: "#ffffff",
    alpha: alpha * 0.92,
    phase: gelPhase * 1.4 + wobble * 4,
  });
  drawGelOrb(ctx, camera, leftSpine, 0.2, {
    color: enemy.bodyColor,
    highlight: enemy.detailColor,
    alpha: alpha * 0.82,
    phase: gelPhase + 0.55,
  });
  drawGelOrb(ctx, camera, rightSpine, 0.2, {
    color: enemy.bodyColor,
    highlight: enemy.detailColor,
    alpha: alpha * 0.82,
    phase: gelPhase + 0.88,
  });
  drawFiendCrestDrips(ctx, camera, fiendState);
  drawFiendHorns(ctx, camera, fiendState);

  const faceVoid = offsetPoint(crest, side, 0, facing, -0.06);
  faceVoid.y -= 0.03;
  drawOrb(
    ctx,
    camera,
    faceVoid,
    0.16,
    "#0a0810",
    adjustHexBrightness(enemy.bodyColor, 0.35),
    alpha * 0.36,
  );
  drawSlimeEyes(ctx, camera, crest, {
    side,
    facing,
    alpha,
    variant: "fiend",
    eyeScale: eyeSquint,
    elapsed,
  });

  const mouthMid = offsetPoint(center, side, 0, facing, 0.18);
  mouthMid.y = enemy.position.y + 0.52 + wobble * 0.06;
  drawFiendMouth(ctx, camera, mouthMid, {
    side,
    facing,
    alpha,
    detailColor: enemy.detailColor,
    squint: eyeSquint,
  });
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {CameraLike} camera
 * @param {FiendRenderState} fiendState
 */
export function drawFiendCrestDrips(ctx, camera, fiendState) {
  const { crest, side, facing, toxicHull, enemy, gelPhase, alpha } = fiendState;
  const dripSwing = Math.sin(gelPhase * 1.35) * 0.022;
  for (let drip = 0; drip < 4; drip += 1) {
    const dripPoint = offsetPoint(
      crest,
      side,
      (drip - 1.5) * 0.07 + dripSwing,
      facing,
      0.06,
    );
    dripPoint.y = crest.y - 0.08 - drip * 0.065;
    drawGelOrb(ctx, camera, dripPoint, 0.048 - drip * 0.008, {
      color: toxicHull,
      highlight: enemy.detailColor,
      alpha: alpha * (0.52 - drip * 0.1),
      phase: gelPhase + drip * 1.05,
    });
  }
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {CameraLike} camera
 * @param {FiendRenderState} fiendState
 */
export function drawFiendHorns(ctx, camera, fiendState) {
  const {
    crest,
    side,
    facing,
    hornOuter,
    hornSheen,
    toxicRim,
    elapsed,
    enemy,
    alpha,
  } = fiendState;
  const hornWiggle = Math.sin(elapsed * 2.9 + enemy.motionPhase) * 0.04;
  const hornTipLeft = offsetPoint(crest, side, -0.14, facing, -0.02);
  hornTipLeft.y += 0.16 + hornWiggle;
  const hornTipRight = offsetPoint(crest, side, 0.14, facing, -0.02);
  hornTipRight.y += 0.16 - hornWiggle * 0.8;

  drawCapsule(ctx, camera, crest, hornTipLeft, 0.1, hornOuter, alpha * 0.92);
  drawCapsule(ctx, camera, crest, hornTipLeft, 0.045, hornSheen, alpha * 0.42);
  drawOrbRim(ctx, camera, hornTipLeft, 0.068, toxicRim, alpha * 0.36, 1.06);
  drawCapsule(ctx, camera, crest, hornTipRight, 0.1, hornOuter, alpha * 0.92);
  drawCapsule(ctx, camera, crest, hornTipRight, 0.045, hornSheen, alpha * 0.42);
  drawOrbRim(ctx, camera, hornTipRight, 0.068, toxicRim, alpha * 0.36, 1.06);
}
