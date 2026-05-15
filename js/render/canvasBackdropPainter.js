// @ts-check

import { getCachedImage } from "../services/image-cache.service.js";
import { hexToRgba } from "./canvasColor.js";

/**
 * Cielo, niebla y siluetas del menú / gameplay detrás del canvas de juego.
 * Responsabilidad única: capas de backdrop no interactivas.
 */

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ width: number; height: number }} size
 * @param {import("../config/Levels.js").CampaignLevel["visual"]} visual
 * @param {number} time
 */
function drawBackdropPlanes(ctx, size, visual, time) {
  const wave = Math.sin(time * 0.25) * 18;

  ctx.fillStyle = hexToRgba(visual.accent, 0.07);
  ctx.beginPath();
  ctx.moveTo(0, size.height * 0.62 + wave);
  ctx.quadraticCurveTo(
    size.width * 0.18,
    size.height * 0.49,
    size.width * 0.38,
    size.height * 0.58,
  );
  ctx.quadraticCurveTo(
    size.width * 0.56,
    size.height * 0.44,
    size.width * 0.74,
    size.height * 0.55,
  );
  ctx.quadraticCurveTo(
    size.width * 0.93,
    size.height * 0.63,
    size.width,
    size.height * 0.57,
  );
  ctx.lineTo(size.width, size.height);
  ctx.lineTo(0, size.height);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = hexToRgba(visual.floorGlow, 0.08);
  ctx.beginPath();
  ctx.moveTo(0, size.height * 0.72);
  ctx.quadraticCurveTo(
    size.width * 0.22,
    size.height * 0.65,
    size.width * 0.41,
    size.height * 0.72,
  );
  ctx.quadraticCurveTo(
    size.width * 0.64,
    size.height * 0.63,
    size.width,
    size.height * 0.74,
  );
  ctx.lineTo(size.width, size.height);
  ctx.lineTo(0, size.height);
  ctx.closePath();
  ctx.fill();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ width: number; height: number }} size
 * @param {import("../config/Levels.js").CampaignLevel["visual"]} visual
 * @param {number} time
 * @param {"menu" | "gameplay" | "story" | "result"} variant
 */
function drawBackdropParticles(ctx, size, visual, time, variant) {
  const ambient = visual?.emberIntensity ?? 0.62;
  const count =
    variant === "gameplay"
      ? Math.round(52 + ambient * 36)
      : Math.round(30 + ambient * 10);
  for (let index = 0; index < count; index += 1) {
    const speed = variant === "menu" ? 0.055 : 0.09;
    const progress = (time * speed + index * 0.079) % 1;
    const x =
      (index / count) * size.width + Math.sin(index * 2.1 + time * 0.4) * 28;
    const y = progress * size.height;
    const radius = 1 + (index % 3) * 0.8;

    const alpha = variant === "gameplay" ? 0.14 + ambient * 0.16 : 0.22;
    ctx.fillStyle = hexToRgba(visual.particleColor ?? visual.accent, alpha);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ width: number; height: number }} size
 * @param {import("../config/Levels.js").CampaignLevel["visual"]} visual
 * @param {number} time
 * @param {"menu" | "gameplay" | "story" | "result"} variant
 */
function drawBackdropSilhouette(ctx, size, visual, time, variant) {
  const centerX = size.width * 0.72;
  const baseY = size.height * 0.82;

  if (variant === "menu") {
    ctx.fillStyle = "rgba(4, 8, 12, 0.56)";
    ctx.beginPath();
    ctx.moveTo(centerX - 240, baseY);
    ctx.lineTo(centerX - 170, baseY - 74);
    ctx.lineTo(centerX - 108, baseY - 58);
    ctx.lineTo(centerX - 42, baseY - 138);
    ctx.lineTo(centerX + 24, baseY - 120);
    ctx.lineTo(centerX + 76, baseY - 208);
    ctx.lineTo(centerX + 145, baseY - 170);
    ctx.lineTo(centerX + 228, baseY - 50);
    ctx.lineTo(centerX + 290, baseY);
    ctx.closePath();
    ctx.fill();

    const pulse = 0.28 + Math.sin(time * 1.1) * 0.08;
    ctx.strokeStyle = hexToRgba(visual.rimColor, pulse);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX + 32, baseY - 170, 58, -0.6, 0.9);
    ctx.stroke();
    return;
  }

  ctx.fillStyle = "rgba(4, 8, 12, 0.42)";
  ctx.beginPath();
  ctx.moveTo(centerX - 210, baseY);
  ctx.lineTo(centerX - 120, baseY - 92);
  ctx.lineTo(centerX - 42, baseY - 168);
  ctx.lineTo(centerX + 30, baseY - 182);
  ctx.lineTo(centerX + 132, baseY - 84);
  ctx.lineTo(centerX + 220, baseY);
  ctx.closePath();
  ctx.fill();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {HTMLImageElement} img
 * @param {number} width
 * @param {number} height
 * @returns {boolean}
 */
function drawImageCover(ctx, img, width, height) {
  const sw = img.naturalWidth;
  const sh = img.naturalHeight;
  if (!sw || !sh) {
    return false;
  }
  const scale = Math.max(width / sw, height / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  const dx = (width - dw) / 2;
  const dy = (height - dh) / 2;
  ctx.drawImage(img, 0, 0, sw, sh, dx, dy, dw, dh);
  return true;
}

/**
 * Capa inferior: foto de reino si está en caché, si no degradado procedural.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ width: number; height: number }} size
 * @param {import("../config/Levels.js").CampaignLevel["visual"]} visual
 */
function drawBackdropBase(ctx, size, visual) {
  const { width, height } = size;

  /** @type {string | undefined} */
  const bgSrc = typeof visual.bgImage === "string" ? visual.bgImage : undefined;

  const cached = bgSrc ? getCachedImage(bgSrc) : null;
  if (cached && drawImageCover(ctx, cached, width, height)) {
    return;
  }

  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, /** @type {string} */ (visual.skyTop));
  gradient.addColorStop(0.58, /** @type {string} */ (visual.skyBottom));
  gradient.addColorStop(1, "#04070d");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ width: number; height: number }} canvasSize
 * @param {{ visual: import("../config/Levels.js").CampaignLevel["visual"]; time?: number; variant?: "menu" | "gameplay" | "story" | "result" }} bundle
 */
export function drawCanvasBackdrop(
  ctx,
  canvasSize,
  { visual, time = 0, variant = "menu" },
) {
  const { width, height } = canvasSize;

  drawBackdropBase(ctx, canvasSize, visual);

  const glow = ctx.createRadialGradient(
    width * 0.73,
    height * 0.2,
    width * 0.02,
    width * 0.72,
    height * 0.24,
    width * 0.34,
  );
  glow.addColorStop(0, hexToRgba(visual.sunColor ?? visual.accent, 0.9));
  glow.addColorStop(0.36, hexToRgba(visual.sunColor ?? visual.accent, 0.22));
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  drawBackdropPlanes(ctx, canvasSize, visual, time);
  drawBackdropParticles(ctx, canvasSize, visual, time, variant);
  drawBackdropSilhouette(ctx, canvasSize, visual, time, variant);

  ctx.fillStyle = visual.mist;
  ctx.fillRect(0, height * 0.44, width, height * 0.3);

  const vignette = ctx.createRadialGradient(
    width * 0.52,
    height * 0.4,
    width * 0.16,
    width * 0.52,
    height * 0.4,
    width * 0.78,
  );
  vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
  vignette.addColorStop(1, "rgba(0, 0, 0, 0.54)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
}
