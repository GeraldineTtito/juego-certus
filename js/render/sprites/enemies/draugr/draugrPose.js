// @ts-check

import { offsetPoint } from "../../../canvasGeometry.js";
import { getFacingAxes } from "../../../enemies/enemy-helpers.js";

/**
 * @typedef {{
 *   sway: number;
 *   facing: { x: number; y: number; z: number };
 *   side: { x: number; y: number; z: number };
 *   alpha: number;
 *   hips: { x: number; y: number; z: number };
 *   chest: { x: number; y: number; z: number };
 *   head: { x: number; y: number; z: number };
 *   leftHip: { x: number; y: number; z: number };
 *   rightHip: { x: number; y: number; z: number };
 *   leftFoot: { x: number; y: number; z: number };
 *   rightFoot: { x: number; y: number; z: number };
 *   leftShoulder: { x: number; y: number; z: number };
 *   rightShoulder: { x: number; y: number; z: number };
 *   leftHand: { x: number; y: number; z: number };
 *   rightHand: { x: number; y: number; z: number };
 *   boneSheen: string;
 * }} DraugrRenderPose
 */

/**
 * @param {import("../../../../game/entities/Enemy.js").Enemy} enemy
 * @param {number} elapsed
 * @returns {DraugrRenderPose}
 */
export function buildDraugrPose(enemy, elapsed) {
  const sway = Math.sin(enemy.motionPhase + elapsed * 0.55) * 0.1;
  const { facing, side } = getFacingAxes(enemy.facingYaw);
  const alpha = enemy.dead ? 0.45 : 1;
  const hips = {
    x: enemy.position.x,
    y: enemy.position.y + 0.92,
    z: enemy.position.z,
  };
  const chest = offsetPoint(
    { x: enemy.position.x, y: enemy.position.y + 1.45, z: enemy.position.z },
    side,
    0,
    facing,
    0.08,
  );
  const head = {
    x: enemy.position.x,
    y: enemy.position.y + 1.89,
    z: enemy.position.z + sway * 0.05,
  };
  const leftHip = offsetPoint(hips, side, -0.18, facing, 0);
  const rightHip = offsetPoint(hips, side, 0.18, facing, 0);
  const leftFoot = offsetPoint(
    { x: enemy.position.x, y: enemy.position.y + 0.06, z: enemy.position.z },
    side,
    -0.16,
    facing,
    sway,
  );
  const rightFoot = offsetPoint(
    { x: enemy.position.x, y: enemy.position.y + 0.06, z: enemy.position.z },
    side,
    0.16,
    facing,
    -sway,
  );
  const leftShoulder = offsetPoint(chest, side, -0.28, facing, 0.06);
  const rightShoulder = offsetPoint(chest, side, 0.28, facing, 0.06);
  const leftHand = offsetPoint(
    { x: enemy.position.x, y: enemy.position.y + 1.08, z: enemy.position.z },
    side,
    -0.42,
    facing,
    -0.08,
  );
  let rightHand = offsetPoint(
    { x: enemy.position.x, y: enemy.position.y + 1.14, z: enemy.position.z },
    side,
    0.46,
    facing,
    0.12,
  );

  if (enemy.attackPhase === "active") {
    rightHand = offsetPoint(
      { x: enemy.position.x, y: enemy.position.y + 1.1, z: enemy.position.z },
      side,
      0.5,
      facing,
      0.74,
    );
  }

  return {
    sway,
    facing,
    side,
    alpha,
    hips,
    chest,
    head,
    leftHip,
    rightHip,
    leftFoot,
    rightFoot,
    leftShoulder,
    rightShoulder,
    leftHand,
    rightHand,
    boneSheen: "#8a9aae",
  };
}
