// @ts-check
import { hexToRgba } from "../canvasColor.js";

/**
 * @typedef {Object} ArenaVisual
 * @property {string} floorColor
 * @property {string} floorGlow
 * @property {string} rimColor
 * @property {string} accent
 * @property {number} [ambientHeat]
 * @property {number} [emberIntensity]
 */

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {{x: number, y: number}[]} fillPoints
 * @returns {boolean}
 */
export function traceClosedPath(ctx, fillPoints) {
  if (fillPoints.length < 3) {
    return false;
  }
  ctx.beginPath();
  ctx.moveTo(fillPoints[0].x, fillPoints[0].y);
  for (let i = 1; i < fillPoints.length; i++) {
    const p = fillPoints[i];
    if (p) {
      ctx.lineTo(p.x, p.y);
    }
  }
  ctx.closePath();
  return true;
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ width: number; height: number }} canvasSize
 * @param {ArenaVisual} visual
 * @param {number} centroidX
 * @param {number} centroidY
 * @param {number} rimSpan
 */
export function drawArenaHazardBands(
  ctx,
  canvasSize,
  visual,
  centroidX,
  centroidY,
  rimSpan,
) {
  const bands = [
    { inner: 0.1, outer: 0.36, color: visual.floorColor, alpha: 0.16 },
    { inner: 0.32, outer: 0.64, color: visual.accent, alpha: 0.08 },
    { inner: 0.58, outer: 1.02, color: visual.rimColor, alpha: 0.1 },
  ];

  for (const band of bands) {
    const overlay = ctx.createRadialGradient(
      centroidX,
      centroidY,
      rimSpan * band.inner,
      centroidX,
      centroidY,
      rimSpan * band.outer,
    );
    overlay.addColorStop(0, "rgba(0, 0, 0, 0)");
    overlay.addColorStop(1, hexToRgba(band.color, band.alpha));
    ctx.fillStyle = overlay;
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
  }
}
