// @ts-check

import { hexToRgba, adjustHexBrightness } from "../../canvasColor.js";

/** @typedef {{ color: string; highlight: string; alpha: number; phase?: number }} GelOrbStyle */

/**
 * @private
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx
 * @param {number} cy
 * @param {number} rs
 * @param {number} alpha
 * @param {number} phase
 */
function drawGelBubbles(ctx, cx, cy, rs, alpha, phase) {
  const bubbleA = phase * 1.95;
  const bubbleB = phase * 2.42 + 0.72;
  for (let bubbleIndex = 0; bubbleIndex < 5; bubbleIndex += 1) {
    const ang = bubbleIndex * 1.26 + bubbleA + bubbleIndex * bubbleB * 0.11;
    const bx = cx + Math.cos(ang) * rs * (0.22 + bubbleIndex * 0.05);
    const by = cy + Math.sin(ang) * rs * (0.2 + bubbleIndex * 0.06) + rs * 0.04;
    const br =
      rs * (0.06 + (bubbleIndex % 2) * 0.035 + (bubbleIndex >= 3 ? 0.025 : 0));
    const c = ctx.createRadialGradient(bx, by, 0, bx, by, br);
    c.addColorStop(
      0,
      hexToRgba("#ffffff", alpha * (0.11 - bubbleIndex * 0.014)),
    );
    c.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * @private
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx
 * @param {number} cy
 * @param {number} rs
 * @param {number} alpha
 * @param {number} phase
 * @param {string} highlight
 */
function drawGelPostEffects(ctx, cx, cy, rs, alpha, phase, highlight) {
  const causticAng = phase * 0.85;
  const cx1 = cx - rs * 0.55 + Math.cos(causticAng) * rs * 0.08;
  const cy1 = cy - rs * 0.35 + Math.sin(causticAng) * rs * 0.06;
  const caustic = ctx.createRadialGradient(cx1, cy1, 0, cx1, cy1, rs * 0.55);
  caustic.addColorStop(0, hexToRgba(highlight, alpha * 0.16));
  caustic.addColorStop(0.45, hexToRgba("#ffffff", alpha * 0.07));
  caustic.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = caustic;
  ctx.beginPath();
  ctx.arc(cx, cy, rs * 0.92, 0, Math.PI * 2);
  ctx.fill();

  const occlude = ctx.createRadialGradient(
    cx,
    cy + rs * 0.78,
    rs * 0.02,
    cx,
    cy + rs * 0.12,
    rs * 0.96,
  );
  occlude.addColorStop(0, "rgba(0, 0, 0, 0)");
  occlude.addColorStop(1, hexToRgba("#000000", alpha * 0.32));

  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = occlude;
  ctx.fillRect(cx - rs * 2.2, cy - rs * 2.2, rs * 4.4, rs * 4.4);
}

/**
 * Esfera tipo gel (subsuperficie, translucidez, fresnel ligero).
 * @param {CanvasRenderingContext2D} ctx
 * @param {import("../types.js").CameraLike} camera
 * @param {{ x: number; y: number; z: number }} point
 * @param {number} radius
 * @param {GelOrbStyle} visual
 */
export function drawGelOrb(ctx, camera, point, radius, visual) {
  const projection = camera.project(point);
  if (!projection) {
    return;
  }

  const { color, highlight, alpha, phase = 0 } = visual;
  const radiusScreen = Math.max(2.2, radius * projection.scale);
  const cx = projection.x;
  const cy = projection.y;
  const rs = radiusScreen;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, rs, 0, Math.PI * 2);
  ctx.clip();

  const lightX = cx - rs * 0.4;
  const lightY = cy - rs * 0.5;
  const coreShadowX = cx + rs * 0.42;
  const coreShadowY = cy + rs * 0.44;

  const body = ctx.createRadialGradient(
    lightX,
    lightY,
    rs * 0.04,
    coreShadowX,
    coreShadowY,
    rs * 1.12,
  );
  body.addColorStop(0, hexToRgba(highlight, alpha * 0.98));
  body.addColorStop(0.3, hexToRgba(color, alpha * 0.96));
  body.addColorStop(
    0.58,
    hexToRgba(adjustHexBrightness(color, 0.7), alpha * 0.92),
  );
  body.addColorStop(
    0.82,
    hexToRgba(adjustHexBrightness(color, 0.42), alpha * 0.9),
  );
  body.addColorStop(1, hexToRgba("#03050a", alpha * 0.84));

  ctx.fillStyle = body;
  ctx.fillRect(cx - rs * 2.2, cy - rs * 2.2, rs * 4.4, rs * 4.4);

  const translucent = ctx.createRadialGradient(
    cx + rs * 0.08,
    cy + rs * 0.55,
    rs * 0.02,
    cx - rs * 0.06,
    cy - rs * 0.2,
    rs * 0.98,
  );
  translucent.addColorStop(0, "rgba(255, 255, 255, 0)");
  translucent.addColorStop(0.5, hexToRgba(highlight, alpha * 0.22));
  translucent.addColorStop(1, hexToRgba(color, alpha * 0.14));

  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = translucent;
  ctx.fillRect(cx - rs * 2.2, cy - rs * 2.2, rs * 4.4, rs * 4.4);

  drawGelBubbles(ctx, cx, cy, rs, alpha, phase);
  drawGelPostEffects(ctx, cx, cy, rs, alpha, phase, highlight);
  ctx.restore();

  ctx.strokeStyle = hexToRgba(highlight, alpha * 0.55);
  ctx.lineWidth = Math.max(0.85, rs * 0.062);
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, rs * 0.94, Math.PI * 0.62, Math.PI * 2.52);
  ctx.stroke();

  ctx.strokeStyle = hexToRgba("#ffffff", alpha * 0.22);
  ctx.lineWidth = Math.max(0.45, rs * 0.028);
  ctx.beginPath();
  ctx.arc(cx, cy, rs * 0.88, Math.PI * 0.68, Math.PI * 1.92);
  ctx.stroke();
}
