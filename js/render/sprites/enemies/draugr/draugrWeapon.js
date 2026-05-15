// @ts-check

import { hexToRgba } from "../../../canvasColor.js";
import { offsetPoint } from "../../../canvasGeometry.js";

/** @typedef {import("./draugrPose.js").DraugrRenderPose} DraugrRenderPose */

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {import("../../../../core/Camera.js").CameraLike} camera
 * @param {DraugrRenderPose} pose
 * @param {import("../../../../game/entities/Enemy.js").Enemy} enemy
 */
export function drawDraugrWeapon(ctx, camera, pose, enemy) {
  const bladeTip = offsetPoint(
    pose.rightHand,
    pose.side,
    0.04,
    pose.facing,
    0.62,
  );
  const bladeStart = camera.project(pose.rightHand);
  const bladeEnd = camera.project(bladeTip);
  if (bladeStart && bladeEnd) {
    ctx.save();
    ctx.strokeStyle = hexToRgba(enemy.detailColor, pose.alpha * 0.92);
    ctx.lineWidth = enemy.attackPhase === "active" ? 5.2 : 3.45;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(bladeStart.x, bladeStart.y);
    ctx.lineTo(bladeEnd.x, bladeEnd.y);
    ctx.stroke();
    ctx.restore();
  }
}
