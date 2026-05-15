// @ts-check

import { adjustHexBrightness, hexToRgba } from "./canvasColor.js";

/**
 * Silueta gelatinosa fusionada en 2D (menos bolas aisladas, mas masa unica).
 * @typedef {{ project: (p: { x: number; y: number; z: number }) => { x: number; y: number; scale: number } | null }} CameraLike
 */
/** @typedef {{ vividHex: string; highlightHex: string; alpha: number; phase: number }} SlimeCoreLumenStyle */

/**
 * @private
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number; y: number }[]} projected
 * @returns {{ cx: number; cy: number }}
 */
function buildHullPath(ctx, projected) {
  const n = projected.length;
  let cx = 0;
  let cy = 0;
  for (const p of projected) {
    cx += p.x;
    cy += p.y;
  }
  cx /= n;
  cy /= n;

  const mid = projected.map((a, i) => {
    const b = projected[(i + 1) % n];
    return { x: (a.x + b.x) * 0.5, y: (a.y + b.y) * 0.5 };
  });

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(mid[0].x, mid[0].y);
  for (let i = 0; i < n; i += 1) {
    const v = projected[(i + 1) % n];
    const mNext = mid[(i + 1) % n];
    ctx.quadraticCurveTo(v.x, v.y, mNext.x, mNext.y);
  }
  ctx.closePath();

  return { cx, cy };
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {CameraLike} camera
 * @param {{ x: number; y: number; z: number }[]} worldPoints orden aproximado CCW en XZ
 * @param {string} fillHex
 * @param {string} highlightHex
 * @param {string} rimHex
 * @param {number} alpha
 */
export function drawOrganicSlimeHull(
  ctx,
  camera,
  worldPoints,
  fillHex,
  highlightHex,
  rimHex,
  alpha,
) {
  /** @type {{ x: number; y: number }[]} */
  const projected = [];
  for (const w of worldPoints) {
    const p = camera.project(w);
    if (p) {
      projected.push(p);
    }
  }
  const n = projected.length;
  if (n < 4) {
    return;
  }

  const { cx, cy } = buildHullPath(ctx, projected);

  const rSpan = projected.reduce(
    (max, q) => Math.max(max, Math.hypot(q.x - cx, q.y - cy)),
    0,
  );
  const g = ctx.createRadialGradient(
    cx - rSpan * 0.38,
    cy - rSpan * 0.42,
    rSpan * 0.06,
    cx + rSpan * 0.06,
    cy + rSpan * 0.22,
    rSpan * 1.06,
  );
  g.addColorStop(0, hexToRgba(highlightHex, alpha * 0.95));
  g.addColorStop(0.35, hexToRgba(fillHex, alpha * 0.93));
  g.addColorStop(
    0.72,
    hexToRgba(adjustHexBrightness(fillHex, 0.55), alpha * 0.9),
  );
  g.addColorStop(
    1,
    hexToRgba(adjustHexBrightness(fillHex, 0.25), alpha * 0.82),
  );

  ctx.fillStyle = g;
  ctx.fill();

  ctx.strokeStyle = hexToRgba(rimHex, alpha * 0.38);
  ctx.lineWidth = Math.max(1.1, rSpan * 0.036);
  ctx.stroke();

  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = hexToRgba(highlightHex, alpha * 0.14);
  ctx.beginPath();
  ctx.ellipse(
    cx - rSpan * 0.24,
    cy - rSpan * 0.26,
    rSpan * 0.36,
    rSpan * 0.44,
    -0.42,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.restore();
}

/**
 * Brillo interno del slime sin gradiente a negro que parezca pupila en el pecho.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {CameraLike} camera
 * @param {{ x: number; y: number; z: number }} point
 * @param {number} radiusWorld
 * @param {SlimeCoreLumenStyle} visual
 */
export function drawSlimeCoreLumen(ctx, camera, point, radiusWorld, visual) {
  const projection = camera.project(point);
  if (!projection) {
    return;
  }

  const { vividHex, highlightHex, alpha, phase } = visual;
  const rs = Math.max(5, radiusWorld * (projection.scale ?? 1));
  const sway = Math.sin(phase * 2.1) * rs * 0.035;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const g = ctx.createRadialGradient(
    projection.x - rs * 0.18 + sway,
    projection.y - rs * 0.26,
    rs * 0.03,
    projection.x + rs * 0.08,
    projection.y + rs * 0.06,
    rs * 0.95,
  );
  g.addColorStop(0, hexToRgba("#f4fffe", alpha * 0.52));
  g.addColorStop(0.28, hexToRgba(highlightHex, alpha * 0.44));
  g.addColorStop(0.55, hexToRgba(vividHex, alpha * 0.38));
  g.addColorStop(
    0.78,
    hexToRgba(adjustHexBrightness(vividHex, 0.65), alpha * 0.22),
  );
  g.addColorStop(1, "rgba(0, 96, 88, 0)");

  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(
    projection.x + sway * 0.4,
    projection.y + rs * 0.02,
    rs * 0.58,
    rs * 0.68,
    phase * 0.06,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  const g2 = ctx.createRadialGradient(
    projection.x + rs * 0.22,
    projection.y + rs * 0.18,
    0,
    projection.x + rs * 0.18,
    projection.y + rs * 0.14,
    rs * 0.28,
  );
  g2.addColorStop(0, hexToRgba(vividHex, alpha * 0.2));
  g2.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = g2;
  ctx.beginPath();
  ctx.ellipse(
    projection.x + rs * 0.2,
    projection.y + rs * 0.16,
    rs * 0.22,
    rs * 0.26,
    -0.5,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.restore();
}
