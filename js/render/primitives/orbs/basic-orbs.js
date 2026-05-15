// @ts-check

import { hexToRgba } from "../../canvasColor.js";

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {import("../types.js").CameraLike} camera
 * @param {{ x: number; y: number; z: number }} point
 * @param {number} radius
 * @param {string} color
 * @param {string} highlightColor
 * @param {number} [alpha]
 */
export function drawOrb(
  ctx,
  camera,
  point,
  radius,
  color,
  highlightColor,
  alpha = 1,
) {
  const projection = camera.project(point);
  if (!projection) {
    return;
  }

  const radiusScreen = Math.max(2, radius * projection.scale);
  const gradient = ctx.createRadialGradient(
    projection.x - radiusScreen * 0.28,
    projection.y - radiusScreen * 0.32,
    radiusScreen * 0.2,
    projection.x,
    projection.y,
    radiusScreen,
  );
  gradient.addColorStop(0, hexToRgba(highlightColor, alpha));
  gradient.addColorStop(0.26, hexToRgba(color, alpha));
  gradient.addColorStop(1, hexToRgba("#041016", alpha * 0.84));

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(projection.x, projection.y, radiusScreen, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {import("../types.js").CameraLike} camera
 * @param {{ x: number; y: number; z: number }} point
 * @param {number} radius
 * @param {string} rimColor
 * @param {number} alpha
 * @param {number} lineWidth
 */
export function drawOrbRim(
  ctx,
  camera,
  point,
  radius,
  rimColor,
  alpha,
  lineWidth,
) {
  const projection = camera.project(point);
  if (!projection) {
    return;
  }

  const radiusScreen = Math.max(2, radius * projection.scale);

  ctx.strokeStyle = hexToRgba(rimColor, alpha);
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.arc(projection.x, projection.y, radiusScreen, 0, Math.PI * 2);
  ctx.stroke();
}
