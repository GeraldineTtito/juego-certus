// @ts-check

import { adjustHexBrightness } from "../../../canvasColor.js";
import { offsetPoint } from "../../../canvasGeometry.js";
import { drawOrb, drawMetalCapsule } from "../../../primitives/index.js";

/** @typedef {import("./draugrPose.js").DraugrRenderPose} DraugrRenderPose */

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {import("../../../../core/Camera.js").CameraLike} camera
 * @param {DraugrRenderPose} pose
 * @param {import("../../../../game/entities/Enemy.js").Enemy} enemy
 */
export function drawDraugrShouldersAndArms(ctx, camera, pose, enemy) {
  const paulLeft = offsetPoint(
    pose.leftShoulder,
    pose.side,
    -0.22,
    pose.facing,
    -0.02,
  );
  paulLeft.y += 0.12;
  const paulRight = offsetPoint(
    pose.rightShoulder,
    pose.side,
    0.22,
    pose.facing,
    -0.02,
  );
  paulRight.y += 0.12;
  drawOrb(
    ctx,
    camera,
    paulLeft,
    0.22,
    "#3d4a54",
    enemy.detailColor,
    pose.alpha * 0.9,
  );
  drawOrb(
    ctx,
    camera,
    paulRight,
    0.22,
    "#3d4a54",
    enemy.detailColor,
    pose.alpha * 0.9,
  );

  drawMetalCapsule(ctx, camera, pose.leftShoulder, pose.leftHand, 0.078, {
    primary: adjustHexBrightness(enemy.bodyColor, 0.78),
    secondary: pose.boneSheen,
    alpha: pose.alpha * 0.91,
    jointCount: 2,
  });
  drawMetalCapsule(ctx, camera, pose.rightShoulder, pose.rightHand, 0.078, {
    primary: adjustHexBrightness(enemy.bodyColor, 0.78),
    secondary: pose.boneSheen,
    alpha: pose.alpha * 0.91,
    jointCount: 2,
  });
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {import("../../../../core/Camera.js").CameraLike} camera
 * @param {DraugrRenderPose} pose
 * @param {import("../../../../game/entities/Enemy.js").Enemy} enemy
 */
export function drawDraugrHead(ctx, camera, pose, enemy) {
  drawOrb(
    ctx,
    camera,
    pose.head,
    0.21,
    enemy.detailColor,
    "#ffffff",
    pose.alpha * 0.92,
  );
  const eyeGlow = enemy.attackPhase ? 0.9 : 0.55;
  const eyeLeft = offsetPoint(pose.head, pose.side, -0.09, pose.facing, 0.12);
  const eyeRight = offsetPoint(pose.head, pose.side, 0.09, pose.facing, 0.12);
  drawOrb(
    ctx,
    camera,
    eyeLeft,
    0.062,
    "#ffb022",
    "#fff1a8",
    pose.alpha * eyeGlow * 0.94,
  );
  drawOrb(
    ctx,
    camera,
    eyeRight,
    0.062,
    "#ffb022",
    "#fff1a8",
    pose.alpha * eyeGlow * 0.94,
  );
}
