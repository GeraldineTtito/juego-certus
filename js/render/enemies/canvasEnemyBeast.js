// @ts-check

import { directionFromYaw } from "../../game/Vector3.js";
import { hexToRgba } from "../canvasColor.js";
import { offsetPoint } from "../canvasGeometry.js";
import {
  drawCapsule,
  drawOrb,
  drawProjectedLine,
} from "../canvasProjectedPrimitives.js";
import { drawSlimeEyes } from "../canvasSlimeFeatures.js";
import { drawGroundEnergyRing } from "../canvasWorldVfx.js";

/**
 * @typedef {import("../../game/entities/Enemy.js").Enemy} Enemy
 * @typedef {{ x: number; y: number; z: number }} Vec3
 * @typedef {{
 *   enemy: Enemy;
 *   hips: Vec3;
 *   shoulders: Vec3;
 *   headBase: Vec3;
 *   side: Vec3;
 *   facing: Vec3;
 *   alpha: number;
 *   bound: number;
 *   elapsed: number;
 * }} BeastRenderState
 */

/**
 * @private
 * @param {CanvasRenderingContext2D} ctx
 * @param {import("../../core/Camera.js").CameraLike} camera
 * @param {{ x: number; y: number; z: number }} base
 * @param {string} colorHex
 * @param {number} alpha
 */
function drawBeastSpines(ctx, camera, base, colorHex, alpha) {
  for (let i = 0; i < 6; i += 1) {
    const tip = {
      x: base.x + Math.sin(i * 1.5) * 0.18,
      y: base.y + 0.32 + Math.cos(i * 1.1) * 0.08,
      z: base.z + Math.cos(i * 1.5) * 0.18,
    };
    drawProjectedLine(
      ctx,
      camera,
      base,
      tip,
      1.08,
      hexToRgba(colorHex, alpha * (0.22 + (i % 3) * 0.06)),
    );
  }
}

/**
 * @param {import("../../game/entities/Enemy.js").Enemy} enemy
 * @param {number} bound
 * @param {{ x: number; y: number; z: number }} facing
 * @param {{ x: number; y: number; z: number }} side
 */
function getBeastLegPoints(enemy, bound, facing, side) {
  const rearLeft = offsetPoint(
    {
      x: enemy.position.x,
      y: enemy.position.y + 0.08,
      z: enemy.position.z - 0.3,
    },
    side,
    -0.18,
    facing,
    -0.1 + bound,
  );
  const rearRight = offsetPoint(
    {
      x: enemy.position.x,
      y: enemy.position.y + 0.08,
      z: enemy.position.z - 0.3,
    },
    side,
    0.18,
    facing,
    0.1 - bound,
  );
  const frontLeft = offsetPoint(
    {
      x: enemy.position.x,
      y: enemy.position.y + 0.08,
      z: enemy.position.z + 0.28,
    },
    side,
    -0.2,
    facing,
    0.16 - bound,
  );
  const frontRight = offsetPoint(
    {
      x: enemy.position.x,
      y: enemy.position.y + 0.08,
      z: enemy.position.z + 0.28,
    },
    side,
    0.2,
    facing,
    0.16 + bound,
  );

  return { rearLeft, rearRight, frontLeft, frontRight };
}

/**
 * @private
 * @param {CanvasRenderingContext2D} ctx
 * @param {import("../../core/Camera.js").CameraLike} camera
 * @param {BeastRenderState} state
 */
function drawBeastBody(ctx, camera, state) {
  const { enemy, hips, shoulders, headBase, alpha, bound } = state;

  drawCapsule(
    ctx,
    camera,
    hips,
    shoulders,
    0.44 + bound * 0.04,
    enemy.bodyColor,
    alpha,
  );
  drawCapsule(ctx, camera, shoulders, headBase, 0.28, enemy.bodyColor, alpha);

  drawBeastSpines(ctx, camera, shoulders, enemy.detailColor, alpha);
  drawBeastSpines(ctx, camera, hips, enemy.detailColor, alpha);
}

/**
 * @private
 * @param {CanvasRenderingContext2D} ctx
 * @param {import("../../core/Camera.js").CameraLike} camera
 * @param {import("../../game/entities/Enemy.js").Enemy} enemy
 * @param {{ x: number; y: number; z: number }} headBase
 * @param {number} alpha
 */
function drawBeastHead(ctx, camera, enemy, headBase, alpha) {
  drawOrb(
    ctx,
    camera,
    headBase,
    0.32,
    enemy.bodyColor,
    enemy.detailColor,
    alpha,
  );
  drawSlimeEyes(ctx, camera, headBase, {
    side: { x: 1, y: 0, z: 0 },
    facing: { x: 0, y: 0, z: 1 },
    alpha,
    variant: "beast",
    eyeScale: 1.2,
    elapsed: 0,
  });
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {import("../../core/Camera.js").CameraLike} camera
 * @param {import("../../game/entities/Enemy.js").Enemy} enemy
 * @param {number} [elapsed]
 */
export function drawBeastSprite(ctx, camera, enemy, elapsed = 0) {
  const bound = Math.sin(enemy.motionPhase + elapsed * 1.05) * 0.17;
  const facing = directionFromYaw(enemy.facingYaw);
  const side = {
    x: Math.cos(enemy.facingYaw),
    y: 0,
    z: -Math.sin(enemy.facingYaw),
  };
  const alpha = enemy.dead ? 0.48 : 1;

  if (enemy.elite) {
    drawGroundEnergyRing(
      ctx,
      camera,
      enemy.position,
      enemy.radius * 2.35,
      enemy.detailColor,
      alpha * 0.52,
      elapsed * 1.15 + enemy.motionPhase,
    );
  }

  const hips = {
    x: enemy.position.x,
    y: enemy.position.y + 0.72,
    z: enemy.position.z - 0.26,
  };
  const shoulders = {
    x: enemy.position.x,
    y: enemy.position.y + 0.9,
    z: enemy.position.z + 0.18,
  };
  const headBase = {
    x: enemy.position.x + facing.x * 0.58,
    y: enemy.position.y + 1.02 + bound * 0.05,
    z: enemy.position.z + facing.z * 0.58,
  };

  /** @type {BeastRenderState} */
  const state = {
    enemy,
    hips,
    shoulders,
    headBase,
    side,
    facing,
    alpha,
    bound,
    elapsed,
  };

  const { rearLeft, rearRight, frontLeft, frontRight } = getBeastLegPoints(
    enemy,
    bound,
    facing,
    side,
  );
  const hipLeft = offsetPoint(hips, side, -0.16, facing, 0);
  const hipRight = offsetPoint(hips, side, 0.16, facing, 0);
  const shoulderLeft = offsetPoint(shoulders, side, -0.2, facing, 0);
  const shoulderRight = offsetPoint(shoulders, side, 0.2, facing, 0);

  drawBeastBody(ctx, camera, state);

  drawCapsule(ctx, camera, hipLeft, rearLeft, 0.086, "#382922", alpha);
  drawCapsule(ctx, camera, hipRight, rearRight, 0.086, "#382922", alpha);
  drawCapsule(ctx, camera, shoulderLeft, frontLeft, 0.086, "#382922", alpha);
  drawCapsule(ctx, camera, shoulderRight, frontRight, 0.086, "#382922", alpha);

  drawBeastHead(ctx, camera, enemy, headBase, alpha);
}
