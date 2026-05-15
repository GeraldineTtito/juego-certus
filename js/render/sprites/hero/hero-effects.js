// @ts-check

import { adjustHexBrightness } from "../../canvasColor.js";
import { offsetPoint } from "../../canvasGeometry.js";
import {
  drawGelOrb,
  drawCapsule,
  drawSoftBloom,
  drawOrb,
  drawOrbRim,
} from "../../canvasProjectedPrimitives.js";

/**
 * @typedef {import("../../canvasOrganicBlob.js").CameraLike} CameraLike
 * @typedef {import("./heroTypes.js").HeroRenderState} HeroRenderState
 */

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {CameraLike} camera
 * @param {HeroRenderState} heroState
 */
export function drawHeroBubbles(ctx, camera, heroState) {
  const {
    pose,
    side,
    facing,
    elapsed,
    gelPhase,
    slimeDeep,
    slimeHighlight,
    alpha,
  } = heroState;
  const { core } = pose;
  for (let bub = 0; bub < 9; bub += 1) {
    const swirl = gelPhase * 1.95 + bub * 1.17;
    const lift = Math.sin(elapsed * 2.95 + bub * 3.71) * 0.11;
    const bubblePoint = offsetPoint(
      core,
      side,
      Math.sin(swirl + bub * 0.92) * 0.41,
      facing,
      Math.cos(swirl - bub * 0.55) * 0.24 - 0.04,
    );
    bubblePoint.y = core.y - 0.02 + lift + bub * 0.018;
    drawGelOrb(ctx, camera, bubblePoint, 0.036 + (bub % 3) * 0.014, {
      color: adjustHexBrightness(slimeDeep, 1.05),
      highlight: slimeHighlight,
      alpha: alpha * (0.22 - bub * 0.014),
      phase: gelPhase + bub * 2.05,
    });
  }
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {CameraLike} camera
 * @param {HeroRenderState} heroState
 */
export function drawHeroCrownDrips(ctx, camera, heroState) {
  const { pose, side, facing, gelPhase, motion, slimeHighlight, alpha } =
    heroState;
  const { crown } = pose;
  const { idleBreath } = motion;
  drawGelOrb(ctx, camera, crown, 0.24 + idleBreath * 0.4, {
    color: slimeHighlight,
    highlight: "#ffffff",
    alpha: alpha * 0.98,
    phase: gelPhase * 1.55 + idleBreath * 6,
  });

  const dripSwing = Math.sin(gelPhase * 1.4) * 0.02;
  for (let drip = 0; drip < 3; drip += 1) {
    const dripPoint = offsetPoint(
      crown,
      side,
      (drip - 1) * 0.07 + dripSwing,
      facing,
      0.04,
    );
    dripPoint.y = crown.y - 0.1 - drip * 0.09;
    drawGelOrb(ctx, camera, dripPoint, 0.055 - drip * 0.01, {
      color: slimeHighlight,
      highlight: "#ffffff",
      alpha: alpha * (0.42 - drip * 0.08),
      phase: gelPhase + drip * 0.9,
    });
  }
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {CameraLike} camera
 * @param {HeroRenderState} heroState
 */
export function drawHeroOrbitalDrone(ctx, camera, heroState) {
  const {
    pose,
    side,
    facing,
    elapsed,
    motion,
    slimeVivid,
    slimeHighlight,
    slimeDeep,
    alpha,
  } = heroState;
  const { crown } = pose;
  const { idleBreath } = motion;
  const droneAnchorFoot = offsetPoint(
    crown,
    side,
    Math.sin(elapsed * 2.05) * 0.052,
    facing,
    0.05,
  );
  droneAnchorFoot.y += 0.1;

  const droneHull = offsetPoint(
    crown,
    side,
    Math.sin(elapsed * 1.93) * 0.068,
    facing,
    Math.cos(elapsed * 1.55) * 0.036,
  );
  droneHull.y =
    crown.y + 0.38 + idleBreath * 0.1 + Math.sin(elapsed * 2.42) * 0.036;

  drawCapsule(
    ctx,
    camera,
    droneAnchorFoot,
    droneHull,
    0.05,
    adjustHexBrightness(slimeVivid, 0.72),
    alpha * 0.34,
  );
  drawCapsule(
    ctx,
    camera,
    droneAnchorFoot,
    droneHull,
    0.019,
    slimeHighlight,
    alpha * 0.48,
  );
  drawSoftBloom(ctx, camera, droneHull, 0.24, slimeHighlight, alpha * 0.34);
  drawOrb(ctx, camera, droneHull, 0.12, "#2a343c", "#121820", alpha * 0.82);
  drawOrb(ctx, camera, droneHull, 0.102, "#3d4a54", slimeDeep, alpha * 0.45);
  drawOrbRim(ctx, camera, droneHull, 0.099, slimeHighlight, alpha * 0.52, 1.06);
  drawOrb(
    ctx,
    camera,
    droneHull,
    0.048,
    slimeVivid,
    slimeHighlight,
    alpha * 0.93,
  );
}
