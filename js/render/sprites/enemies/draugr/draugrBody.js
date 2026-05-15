// @ts-check

import { adjustHexBrightness, hexToRgba } from "../../../canvasColor.js";
import { offsetPoint } from "../../../canvasGeometry.js";
import {
  drawCapsule,
  drawOrb,
  drawMetalCapsule,
  drawProjectedLine,
  drawSoftBloom,
} from "../../../primitives/index.js";

/** @typedef {import("./draugrPose.js").DraugrRenderPose} DraugrRenderPose */

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {import("../../../../core/Camera.js").CameraLike} camera
 * @param {DraugrRenderPose} pose
 * @param {import("../../../../game/entities/Enemy.js").Enemy} enemy
 */
export function drawDraugrLegsAndBelt(ctx, camera, pose, enemy) {
  const beltLow = offsetPoint(pose.hips, pose.side, -0.24, pose.facing, -0.04);
  const beltHigh = offsetPoint(pose.hips, pose.side, 0.24, pose.facing, -0.04);
  beltLow.y -= 0.06;
  beltHigh.y -= 0.06;

  drawMetalCapsule(ctx, camera, beltLow, beltHigh, 0.11, {
    primary: "#1a1612",
    secondary: adjustHexBrightness(enemy.detailColor, 1.35),
    alpha: pose.alpha * 0.78,
    jointCount: 2,
  });
  drawMetalCapsule(ctx, camera, pose.leftHip, pose.leftFoot, 0.092, {
    primary: "#2c3038",
    secondary: pose.boneSheen,
    alpha: pose.alpha * 0.94,
    jointCount: 3,
  });
  drawMetalCapsule(ctx, camera, pose.rightHip, pose.rightFoot, 0.092, {
    primary: "#2c3038",
    secondary: pose.boneSheen,
    alpha: pose.alpha * 0.94,
    jointCount: 3,
  });

  const kneeLeft = {
    x: pose.leftHip.x + (pose.leftFoot.x - pose.leftHip.x) * 0.52,
    y: pose.leftHip.y + (pose.leftFoot.y - pose.leftHip.y) * 0.52 - 0.02,
    z: pose.leftHip.z + (pose.leftFoot.z - pose.leftHip.z) * 0.52,
  };
  const kneeRight = {
    x: pose.rightHip.x + (pose.rightFoot.x - pose.rightHip.x) * 0.52,
    y: pose.rightHip.y + (pose.rightFoot.y - pose.rightHip.y) * 0.52 - 0.02,
    z: pose.rightHip.z + (pose.rightFoot.z - pose.rightHip.z) * 0.52,
  };
  drawOrb(
    ctx,
    camera,
    kneeLeft,
    0.072,
    "#2a2e36",
    pose.boneSheen,
    pose.alpha * 0.78,
  );
  drawOrb(
    ctx,
    camera,
    kneeRight,
    0.072,
    "#2a2e36",
    pose.boneSheen,
    pose.alpha * 0.78,
  );
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {import("../../../../core/Camera.js").CameraLike} camera
 * @param {DraugrRenderPose} pose
 * @param {import("../../../../game/entities/Enemy.js").Enemy} enemy
 */
export function drawDraugrTorso(ctx, camera, pose, enemy) {
  drawCapsule(
    ctx,
    camera,
    pose.hips,
    pose.chest,
    0.24,
    enemy.bodyColor,
    pose.alpha,
  );
  const sternum = offsetPoint(pose.chest, pose.side, 0, pose.facing, 0.06);
  const ribLowLeft = offsetPoint(
    pose.hips,
    pose.side,
    -0.12,
    pose.facing,
    0.04,
  );
  const ribLowRight = offsetPoint(
    pose.hips,
    pose.side,
    0.12,
    pose.facing,
    0.04,
  );
  ribLowLeft.y += 0.35;
  ribLowRight.y += 0.35;
  drawProjectedLine(
    ctx,
    camera,
    sternum,
    ribLowLeft,
    1.2,
    hexToRgba(enemy.detailColor, pose.alpha * 0.35),
  );
  drawProjectedLine(
    ctx,
    camera,
    sternum,
    ribLowRight,
    1.2,
    hexToRgba(enemy.detailColor, pose.alpha * 0.35),
  );
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {import("../../../../core/Camera.js").CameraLike} camera
 * @param {DraugrRenderPose} pose
 * @param {import("../../../../game/entities/Enemy.js").Enemy} enemy
 * @param {number} elapsed
 */
export function drawDraugrCloak(ctx, camera, pose, enemy, elapsed) {
  const cloakMass = offsetPoint(pose.chest, pose.side, 0, pose.facing, -0.34);
  cloakMass.y += 0.08;
  drawSoftBloom(ctx, camera, cloakMass, 0.62, "#05070c", pose.alpha * 0.38);
  const cloakRoot = offsetPoint(pose.chest, pose.side, 0, pose.facing, -0.06);
  cloakRoot.y -= 0.12;
  for (let strand = 0; strand < 4; strand += 1) {
    const fray = strand * 0.24 + pose.sway * (0.1 + strand * 0.04);
    const hem = offsetPoint(
      pose.hips,
      pose.side,
      (strand - 1.5) * 0.32 + Math.sin(elapsed + strand) * 0.06,
      pose.facing,
      -0.2,
    );
    hem.y = enemy.position.y + 0.18 + fray * 0.05;
    drawCapsule(
      ctx,
      camera,
      cloakRoot,
      hem,
      0.052 + strand * 0.012,
      "#151820",
      pose.alpha * (0.5 + strand * 0.06),
    );
  }
}
