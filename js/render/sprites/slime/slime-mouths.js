// @ts-check

import { hexToRgba } from "../../canvasColor.js";
import { offsetPoint } from "../../canvasGeometry.js";

/** @typedef {{ x: number; y: number; z: number }} WorldPoint */
/** @typedef {{ side: WorldPoint; facing: WorldPoint; alpha: number; detailColor: string; squint?: number }} FiendMouthVisual */

/**
 * @param {string | null} attackPhase
 * @returns {number}
 */
function getHeroMouthWidth(attackPhase) {
  if (attackPhase === "windup") {
    return 0.07;
  }
  if (attackPhase === "active") {
    return 0.1;
  }
  return 0.085;
}

/**
 * @param {number} squint
 * @returns {number}
 */
function getFiendMouthWidth(squint) {
  if (squint > 1.05) {
    return 0.13;
  }
  if (squint < 0.78) {
    return 0.055;
  }
  return 0.098;
}

/**
 * @param {number} squint
 * @returns {number}
 */
function getFiendMouthLineWidth(squint) {
  if (squint > 1.05) {
    return 2.1;
  }
  return 1.65;
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {import("../../../core/Camera.js").CameraLike} camera
 * @param {WorldPoint} core
 * @param {WorldPoint} side
 * @param {WorldPoint} facing
 * @param {number} alpha
 * @param {string | null} attackPhase
 */
export function drawHeroMouth(
  ctx,
  camera,
  core,
  side,
  facing,
  alpha,
  attackPhase,
) {
  const width = getHeroMouthWidth(attackPhase);
  const left = offsetPoint(core, side, -width, facing, 0.16);
  const right = offsetPoint(core, side, width, facing, 0.16);
  const mid = offsetPoint(core, side, 0, facing, 0.12);
  left.y = core.y - 0.12;
  right.y = core.y - 0.12;
  mid.y = core.y - 0.18;

  const pLeft = camera.project(left);
  const pRight = camera.project(right);
  const pMid = camera.project(mid);
  if (!pLeft || !pRight || !pMid) {
    return;
  }

  ctx.save();
  ctx.strokeStyle = hexToRgba("#0c1220", alpha * 0.55);
  ctx.lineWidth = 1.75;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(pLeft.x, pLeft.y);
  ctx.quadraticCurveTo(pMid.x, pMid.y + 1.6, pRight.x, pRight.y);
  ctx.stroke();
  ctx.restore();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {import("../../../core/Camera.js").CameraLike} camera
 * @param {WorldPoint} mouthMid
 * @param {FiendMouthVisual} visual
 */
export function drawFiendMouth(ctx, camera, mouthMid, visual) {
  const { side, facing, alpha, detailColor, squint = 1 } = visual;
  const width = getFiendMouthWidth(squint);
  const left = offsetPoint(mouthMid, side, -width, facing, 0);
  const right = offsetPoint(mouthMid, side, width, facing, 0);
  const low = offsetPoint(mouthMid, side, 0, facing, -0.05);
  low.y -= 0.045;

  const pLeft = camera.project(left);
  const pRight = camera.project(right);
  const pLow = camera.project(low);
  if (!pLeft || !pRight || !pLow) {
    return;
  }

  ctx.save();
  ctx.strokeStyle = hexToRgba(detailColor, alpha * 0.58);
  ctx.lineWidth = getFiendMouthLineWidth(squint);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(pLeft.x, pLeft.y);
  ctx.quadraticCurveTo(pLow.x, pLow.y + 2.8, pRight.x, pRight.y);
  ctx.stroke();
  ctx.restore();
}
