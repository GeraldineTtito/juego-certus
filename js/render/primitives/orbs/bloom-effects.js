// @ts-check

import { hexToRgba } from "../../canvasColor.js";

/**
 * Resplandor suave aditivo alrededor de un punto (aura de gel, energia).
 * @param {CanvasRenderingContext2D} ctx
 * @param {import("../types.js").CameraLike} camera
 * @param {{ x: number; y: number; z: number }} point
 * @param {number} radius
 * @param {string} colorHex
 * @param {number} alpha
 */
export function drawSoftBloom(ctx, camera, point, radius, colorHex, alpha) {
  const projection = camera.project(point);
  if (!projection) {
    return;
  }

  const radiusScreen = Math.max(3, radius * projection.scale);
  const cx = projection.x;
  const cy = projection.y;
  const outer = radiusScreen * 1.75;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const g = ctx.createRadialGradient(
    cx,
    cy,
    radiusScreen * 0.08,
    cx,
    cy,
    outer,
  );
  g.addColorStop(0, hexToRgba(colorHex, alpha * 0.42));
  g.addColorStop(0.45, hexToRgba(colorHex, alpha * 0.16));
  g.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, outer, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
