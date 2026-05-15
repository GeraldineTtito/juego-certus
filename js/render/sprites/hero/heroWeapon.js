// @ts-check

import {
  drawCapsule,
  drawOrb,
  drawOrbRim,
  drawGelOrb,
  drawSoftBloom,
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
export function drawHeroTentacles(ctx, camera, heroState) {
  const { pose, slimeDeep, slimeHighlight, slimeVivid, alpha, gelPhase } =
    heroState;
  drawCapsule(
    ctx,
    camera,
    pose.leftTentacleBase,
    pose.leftTentacleTip,
    0.11,
    slimeDeep,
    alpha * 0.93,
  );
  drawCapsule(
    ctx,
    camera,
    pose.leftTentacleBase,
    pose.leftTentacleTip,
    0.052,
    slimeHighlight,
    alpha * 0.32,
  );
  drawCapsule(
    ctx,
    camera,
    pose.rightTentacleBase,
    pose.rightTentacleTip,
    0.11,
    slimeDeep,
    alpha * 0.94,
  );
  drawCapsule(
    ctx,
    camera,
    pose.rightTentacleBase,
    pose.rightTentacleTip,
    0.052,
    slimeHighlight,
    alpha * 0.32,
  );
  drawOrb(
    ctx,
    camera,
    pose.leftTentacleTip,
    0.055,
    "#101820",
    "#080c12",
    alpha * 0.62,
  );
  drawOrbRim(
    ctx,
    camera,
    pose.leftTentacleTip,
    0.05,
    slimeHighlight,
    alpha * 0.38,
    0.85,
  );
  drawGelOrb(ctx, camera, pose.leftTentacleTip, 0.08, {
    color: slimeVivid,
    highlight: slimeHighlight,
    alpha: alpha * 0.82,
    phase: gelPhase + 1.1,
  });
  drawOrb(
    ctx,
    camera,
    pose.rightTentacleTip,
    0.058,
    "#101820",
    "#080c12",
    alpha * 0.62,
  );
  drawOrbRim(
    ctx,
    camera,
    pose.rightTentacleTip,
    0.052,
    slimeHighlight,
    alpha * 0.4,
    0.85,
  );
  drawGelOrb(ctx, camera, pose.rightTentacleTip, 0.085, {
    color: slimeVivid,
    highlight: slimeHighlight,
    alpha: alpha * 0.83,
    phase: gelPhase + 0.77,
  });
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {CameraLike} camera
 * @param {HeroRenderState} heroState
 */
export function drawHeroSpear(ctx, camera, heroState) {
  const { pose, slimeVivid, slimeHighlight, alpha, attackPhase } = heroState;
  drawCapsule(
    ctx,
    camera,
    pose.rightTentacleTip,
    pose.spearTip,
    0.068,
    slimeVivid,
    alpha * 0.95,
  );
  drawCapsule(
    ctx,
    camera,
    pose.rightTentacleTip,
    pose.spearTip,
    0.032,
    slimeHighlight,
    alpha * 0.45,
  );
  drawSoftBloom(
    ctx,
    camera,
    pose.spearTip,
    0.28,
    slimeHighlight,
    alpha * (attackPhase === "active" ? 0.42 : 0.16),
  );
  drawOrb(ctx, camera, pose.spearTip, 0.13, "#f7fdff", slimeHighlight, alpha);
  drawOrb(
    ctx,
    camera,
    pose.spearTip,
    0.065,
    slimeVivid,
    "#ffffff",
    alpha * 0.75,
  );
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {CameraLike} camera
 * @param {HeroRenderState} heroState
 */
export function drawHeroAppendages(ctx, camera, heroState) {
  drawHeroTentacles(ctx, camera, heroState);
  drawHeroSpear(ctx, camera, heroState);
}
