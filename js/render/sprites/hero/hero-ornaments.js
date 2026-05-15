// @ts-check

import { adjustHexBrightness, hexToRgba } from "../../canvasColor.js";
import { offsetPoint } from "../../canvasGeometry.js";
import {
  drawOrb,
  drawCapsule,
  drawProjectedLine,
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
export function drawHeroOrnaments(ctx, camera, heroState) {
  const { pose, side, facing, alpha, slimeHighlight, slimeVivid, slimeDeep } =
    heroState;
  const thoraxGlint = offsetPoint(pose.core, side, 0.14, facing, 0.1);
  thoraxGlint.y -= 0.06;
  drawOrb(
    ctx,
    camera,
    thoraxGlint,
    0.11,
    "#ffffff",
    slimeHighlight,
    alpha * 0.36,
  );

  const bellyShine = offsetPoint(pose.core, side, -0.18, facing, -0.05);
  bellyShine.y -= 0.02;
  drawOrb(
    ctx,
    camera,
    bellyShine,
    0.075,
    slimeHighlight,
    slimeVivid,
    alpha * 0.28,
  );

  const collarLeft = offsetPoint(pose.core, side, -0.32, facing, -0.04);
  const collarRight = offsetPoint(pose.core, side, 0.32, facing, -0.04);
  drawCapsule(
    ctx,
    camera,
    collarLeft,
    collarRight,
    0.098,
    adjustHexBrightness(slimeDeep, 0.95),
    alpha * 0.88,
  );
  drawCapsule(
    ctx,
    camera,
    collarLeft,
    collarRight,
    0.05,
    slimeHighlight,
    alpha * 0.35,
  );
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {CameraLike} camera
 * @param {import("../../hero/hero-pose-builder.js").HeroPose} pose
 * @param {string} slimeVivid
 * @param {number} alpha
 */
export function drawHeroCrest(ctx, camera, pose, slimeVivid, alpha) {
  drawProjectedLine(
    ctx,
    camera,
    pose.crown,
    pose.crestLeft,
    2.2,
    hexToRgba(slimeVivid, alpha * 0.58),
  );
  drawProjectedLine(
    ctx,
    camera,
    pose.crown,
    pose.crestTop,
    2.2,
    hexToRgba("#ffffff", alpha * 0.62),
  );
  drawProjectedLine(
    ctx,
    camera,
    pose.crown,
    pose.crestRight,
    2.2,
    hexToRgba(slimeVivid, alpha * 0.58),
  );
}
