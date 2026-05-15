// @ts-check

import { hexToRgba } from "./canvasColor.js";

/**
 * Efectos de mundo en pantalla (sombras, anillos de habilidad, arcos de slash).
 * Responsabilidad única: VFX 2D asociados a posición mundo / cámara.
 */

/** @typedef {{ project: (p: { x: number; y: number; z: number }) => { x: number; y: number; scale: number } | null }} CameraLike */

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {CameraLike} camera
 * @param {{ x: number; y: number; z: number }} origin
 * @param {number} yaw
 * @param {number} radius
 * @param {string} color
 */
export function drawSlashArc(ctx, camera, origin, yaw, radius, color) {
  /** @type {Array<{ x: number; y: number }>} */
  const points = [];
  for (let step = -4; step <= 4; step += 1) {
    const angle = yaw + step * 0.18;
    const point = {
      x: origin.x + Math.sin(angle) * radius,
      y: origin.y + 1.05,
      z: origin.z + Math.cos(angle) * radius,
    };
    const projection = camera.project(point);
    if (projection) {
      points.push(projection);
    }
  }

  if (points.length < 2) {
    return;
  }

  ctx.save();
  ctx.strokeStyle = hexToRgba(color, 0.22);
  ctx.lineWidth = 10;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let index = 1; index < points.length; index += 1) {
    ctx.lineTo(points[index].x, points[index].y);
  }
  ctx.stroke();

  ctx.strokeStyle = hexToRgba("#fffef8", 0.24);
  ctx.lineWidth = 5.8;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let index = 1; index < points.length; index += 1) {
    ctx.lineTo(points[index].x, points[index].y);
  }
  ctx.stroke();

  ctx.strokeStyle = hexToRgba(color, 0.9);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let index = 1; index < points.length; index += 1) {
    ctx.lineTo(points[index].x, points[index].y);
  }
  ctx.stroke();
  ctx.restore();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {CameraLike} camera
 * @param {{ x: number; y: number; z: number }} position
 * @param {number} radius
 * @param {string} color
 * @param {{ tintHex?: string; tintAlpha?: number }} [accent] resplandor interior con color del personaje
 */
export function drawGroundShadow(ctx, camera, position, radius, color, accent) {
  const center = camera.project({
    x: position.x,
    y: 0.03,
    z: position.z,
  });
  if (!center) {
    return;
  }

  const radiusScreen = Math.max(6, radius * center.scale);

  ctx.save();
  const contact = ctx.createRadialGradient(
    center.x,
    center.y - radiusScreen * 0.12,
    radiusScreen * 0.12,
    center.x + radiusScreen * 0.04,
    center.y + radiusScreen * 0.32,
    radiusScreen * 1.15,
  );
  contact.addColorStop(0, color);
  contact.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = contact;
  ctx.beginPath();
  ctx.ellipse(
    center.x + 1.8,
    center.y + 3.6,
    radiusScreen * 1.02,
    radiusScreen * 0.58,
    0,
    0,
    Math.PI * 2,
  );
  ctx.globalAlpha = 1;
  ctx.fill();

  if (accent?.tintHex && (accent.tintAlpha ?? 0) > 0) {
    ctx.globalCompositeOperation = "lighter";
    const inner = ctx.createRadialGradient(
      center.x + 0.6,
      center.y + 2.8,
      radiusScreen * 0.05,
      center.x + 1.2,
      center.y + 3.4,
      radiusScreen * 0.62,
    );
    inner.addColorStop(0, hexToRgba(accent.tintHex, accent.tintAlpha ?? 0.2));
    inner.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = inner;
    ctx.beginPath();
    ctx.ellipse(
      center.x + 1.2,
      center.y + 3.2,
      radiusScreen * 0.62,
      radiusScreen * 0.36,
      0,
      0,
      Math.PI * 2,
    );
    ctx.globalAlpha = 1;
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  }

  ctx.globalAlpha = 0.55;
  ctx.fillStyle = "rgba(10, 12, 22, 0.75)";
  ctx.beginPath();
  ctx.ellipse(
    center.x - 0.5,
    center.y + 2.2,
    radiusScreen * 0.88,
    radiusScreen * 0.5,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.restore();
}

/**
 * Anillo de energía en el suelo (marca corrupta, alma draugr, élite).
 * @param {CanvasRenderingContext2D} ctx
 * @param {CameraLike} camera
 * @param {{ x: number; y: number; z: number }} position
 * @param {number} radiusWorld
 * @param {string} colorHex
 * @param {number} alpha
 * @param {number} [phase]
 */
export function drawGroundEnergyRing(
  ctx,
  camera,
  position,
  radiusWorld,
  colorHex,
  alpha,
  phase = 0,
) {
  const center = camera.project({ x: position.x, y: 0.05, z: position.z });
  if (!center) {
    return;
  }

  const rx = Math.max(8, radiusWorld * center.scale * 1.05);
  const ry = rx * 0.56;
  const pulse = 0.92 + Math.sin(phase * 2.1) * 0.06;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = hexToRgba(colorHex, alpha * 0.55);
  ctx.lineWidth = 2.2;
  ctx.setLineDash([10, 7]);
  ctx.lineDashOffset = phase * 18;
  ctx.beginPath();
  ctx.ellipse(
    center.x + 1.4,
    center.y + 3.2,
    rx * pulse,
    ry * pulse,
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = hexToRgba("#ffffff", alpha * 0.22);
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.ellipse(
    center.x + 1.4,
    center.y + 3.2,
    rx * pulse * 0.86,
    ry * pulse * 0.86,
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();
  ctx.restore();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {CameraLike} camera
 * @param {Array<{ position: { x: number; y: number; z: number }; color: string; radius: number; remaining: number }>} effects
 */
export function drawEffects(ctx, camera, effects) {
  for (const effect of effects) {
    const center = camera.project(effect.position);
    if (!center) {
      continue;
    }

    const radius = effect.radius * center.scale;
    ctx.strokeStyle = hexToRgba(effect.color, effect.remaining / 0.28);
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
}
