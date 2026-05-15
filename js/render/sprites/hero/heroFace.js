// @ts-check

import { offsetPoint } from "../../canvasGeometry.js";
import { drawOrb } from "../../canvasProjectedPrimitives.js";
import { drawHeroMouth, drawSlimeEyes } from "../../canvasSlimeFeatures.js";

/**
 * @typedef {import("../../canvasOrganicBlob.js").CameraLike} CameraLike
 * @typedef {import("./heroTypes.js").HeroRenderState} HeroRenderState
 */

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {CameraLike} camera
 * @param {HeroRenderState} heroState
 */
export function drawHeroFace(ctx, camera, heroState) {
  const { pose, side, facing, alpha, elapsed, motion } = heroState;
  const facePod = offsetPoint(pose.crown, side, 0, facing, -0.078);
  facePod.y -= 0.04;
  drawOrb(ctx, camera, facePod, 0.185, "#0e161c", "#1a2730", alpha * 0.38);
  drawSlimeEyes(ctx, camera, pose.crown, {
    side,
    facing,
    alpha,
    variant: "hero",
    eyeScale: motion.eyeSquint,
    elapsed,
  });
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {CameraLike} camera
 * @param {HeroRenderState} heroState
 */
export function drawHeroExpression(ctx, camera, heroState) {
  const { pose, side, facing, alpha, attackPhase } = heroState;
  drawHeroMouth(ctx, camera, pose.core, side, facing, alpha, attackPhase);
}
