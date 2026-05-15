// @ts-check

import { hexToRgba, adjustHexBrightness } from "../canvasColor.js";

/** @typedef {{ primary: string; secondary: string; alpha: number; jointCount?: number }} MetalCapsuleStyle */

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {import("./types.js").CameraLike} camera
 * @param {{ x: number; y: number; z: number }} start
 * @param {{ x: number; y: number; z: number }} end
 * @param {number} radius
 * @param {string} color
 * @param {number} [alpha]
 */
export function drawCapsule(ctx, camera, start, end, radius, color, alpha = 1) {
  const startProjection = camera.project(start);
  const endProjection = camera.project(end);
  if (!startProjection || !endProjection) {
    return;
  }

  const width = Math.max(
    2,
    (startProjection.scale + endProjection.scale) * 0.5 * radius * 2.2,
  );
  const gradient = ctx.createLinearGradient(
    startProjection.x,
    startProjection.y,
    endProjection.x,
    endProjection.y,
  );
  gradient.addColorStop(0, hexToRgba(color, alpha * 0.95));
  gradient.addColorStop(1, hexToRgba(color, alpha * 0.72));

  ctx.strokeStyle = gradient;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(startProjection.x, startProjection.y);
  ctx.lineTo(endProjection.x, endProjection.y);
  ctx.stroke();
}

/**
 * Cilindro metalico proyectado + anillos de junta.
 * @param {CanvasRenderingContext2D} ctx
 * @param {import("./types.js").CameraLike} camera
 * @param {{ x: number; y: number; z: number }} start
 * @param {{ x: number; y: number; z: number }} end
 * @param {number} radius
 * @param {MetalCapsuleStyle} visual
 */
export function drawMetalCapsule(ctx, camera, start, end, radius, visual) {
  const startProjection = camera.project(start);
  const endProjection = camera.project(end);
  if (!startProjection || !endProjection) {
    return;
  }

  const {
    primary: huePrimaryHex,
    secondary: hueSecondaryHex,
    alpha,
    jointCount = 2,
  } = visual;
  const avgScale = (startProjection.scale + endProjection.scale) * 0.5;
  const strokeWidth = Math.max(2.4, avgScale * radius * 2.18);
  const dx = endProjection.x - startProjection.x;
  const dy = endProjection.y - startProjection.y;
  const len = Math.hypot(dx, dy) || 1;
  const perpScale = strokeWidth * 0.42;
  const nx = (-dy / len) * perpScale;
  const ny = (dx / len) * perpScale;

  const sheen = hexToRgba(
    adjustHexBrightness(hueSecondaryHex, 1.82),
    alpha * 0.96,
  );

  const bodyGrad = ctx.createLinearGradient(
    startProjection.x + nx,
    startProjection.y + ny,
    startProjection.x - nx,
    startProjection.y - ny,
  );
  bodyGrad.addColorStop(0, sheen);
  bodyGrad.addColorStop(0.26, hexToRgba(huePrimaryHex, alpha * 0.9));
  bodyGrad.addColorStop(
    0.52,
    hexToRgba(adjustHexBrightness(huePrimaryHex, 0.52), alpha * 0.94),
  );
  bodyGrad.addColorStop(0.76, hexToRgba("#1c2430", alpha * 0.9));
  bodyGrad.addColorStop(
    1,
    hexToRgba(adjustHexBrightness(hueSecondaryHex, 1.28), alpha * 0.78),
  );

  ctx.strokeStyle = bodyGrad;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(startProjection.x, startProjection.y);
  ctx.lineTo(endProjection.x, endProjection.y);
  ctx.stroke();

  ctx.strokeStyle = hexToRgba("#0b101a", alpha * 0.38);
  ctx.lineWidth = Math.max(1, strokeWidth * 0.11);
  ctx.beginPath();
  ctx.moveTo(startProjection.x, startProjection.y);
  ctx.lineTo(endProjection.x, endProjection.y);
  ctx.stroke();

  const ringGlow = hexToRgba(
    adjustHexBrightness(hueSecondaryHex, 2.1),
    alpha * 0.44,
  );
  for (let jointIndex = 0; jointIndex < jointCount; jointIndex += 1) {
    const t = (jointIndex + 1) / (jointCount + 1);
    const jx = start.x + (end.x - start.x) * t;
    const jy = start.y + (end.y - start.y) * t;
    const jz = start.z + (end.z - start.z) * t;
    const jointProjection = camera.project({ x: jx, y: jy, z: jz });
    if (!jointProjection) {
      continue;
    }

    ctx.strokeStyle = ringGlow;
    ctx.lineWidth = Math.max(1.2, strokeWidth * 0.16);
    ctx.beginPath();
    ctx.moveTo(jointProjection.x - nx * 0.22, jointProjection.y - ny * 0.22);
    ctx.lineTo(jointProjection.x + nx * 0.22, jointProjection.y + ny * 0.22);
    ctx.stroke();
    ctx.strokeStyle = hexToRgba("#04080e", alpha * 0.45);
    ctx.lineWidth = Math.max(0.9, strokeWidth * 0.11);
    ctx.beginPath();
    ctx.moveTo(jointProjection.x - nx * 0.18, jointProjection.y - ny * 0.18);
    ctx.lineTo(jointProjection.x + nx * 0.18, jointProjection.y + ny * 0.18);
    ctx.stroke();
  }
}
