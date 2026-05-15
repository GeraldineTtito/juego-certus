// @ts-check

import {
  drawOrganicSlimeHull,
  drawSlimeCoreLumen,
} from "../../canvasOrganicBlob.js";
import { drawGelOrb, drawOrbRim } from "../../canvasProjectedPrimitives.js";
import { buildHeroHullWorldPoints } from "../../hero/hero-pose-builder.js";

/**
 * @typedef {import("../../canvasOrganicBlob.js").CameraLike} CameraLike
 * @typedef {import("./heroTypes.js").HeroRenderState} HeroRenderState
 */

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {CameraLike} camera
 * @param {HeroRenderState} heroState
 * @param {string} slimeGlow
 */
export function drawHeroBodyWithHull(ctx, camera, heroState, slimeGlow) {
  const { pose, slimeVivid, slimeHighlight, alpha, gelPhase, motion } =
    heroState;
  const coreRadius =
    0.62 + motion.bodyPulse + (heroState.dodgeStretch > 0 ? 0.05 : 0);

  const forwardHullPulse =
    motion.dodgeStretch > 0
      ? motion.dodgeStretch
      : Math.abs(motion.locomotionWave) * motion.locomotionStride;

  const hullPoints = buildHeroHullWorldPoints(
    pose.core,
    heroState.side,
    heroState.facing,
    gelPhase,
    forwardHullPulse,
    motion.bodyPulse,
    motion.dodgeStretch,
  );

  drawOrganicSlimeHull(
    ctx,
    camera,
    hullPoints,
    slimeVivid,
    slimeHighlight,
    slimeGlow,
    alpha * 0.88,
  );
  drawSlimeCoreLumen(
    ctx,
    camera,
    { x: pose.core.x, y: pose.core.y + 0.05, z: pose.core.z + 0.02 },
    coreRadius * 1.08,
    {
      vividHex: slimeVivid,
      highlightHex: slimeHighlight,
      alpha: alpha * 0.88,
      phase: gelPhase,
    },
  );
  drawGelOrb(
    ctx,
    camera,
    { x: pose.core.x, y: pose.core.y + 0.02, z: pose.core.z },
    coreRadius * 0.5,
    {
      color: slimeVivid,
      highlight: slimeHighlight,
      alpha: alpha * 0.38,
      phase: gelPhase + 0.4,
    },
  );
  drawOrbRim(
    ctx,
    camera,
    pose.core,
    coreRadius * 0.84,
    slimeHighlight,
    alpha * 0.26,
    1.02,
  );
}
