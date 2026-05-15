// @ts-check
import { hexToRgba } from "../canvasColor.js";
import { polarPoint, getProjectedRing } from "../canvasGeometry.js";
import {
  traceClosedPath,
  drawArenaHazardBands,
} from "./arena-helpers.js";

/**
 * @typedef {import("./arena-helpers.js").ArenaVisual} ArenaVisual
 */

/**
 * @typedef {Object} ArenaMetrics
 * @property {number} centroidX
 * @property {number} centroidY
 * @property {number} rimSpan
 */

/**
 * @typedef {Object} ArenaRenderState
 * @property {ArenaVisual} visual
 * @property {number} elapsed
 * @property {number} heatPulse
 * @property {import("../../core/Camera.js").CameraLike} camera
 * @property {number} radius
 * @property {number} levelId
 */

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {import("../../core/Camera.js").CameraLike} camera
 * @param {number} radius
 * @param {number} elapsed
 * @param {number} seed
 * @param {ArenaVisual} visual
 */
export function drawArenaCracks(ctx, camera, radius, elapsed, seed, visual) {
  const ambient = visual?.ambientHeat ?? 0.55;
  let crackCount = 8;
  if (ambient > 0.85) {
    crackCount = 11;
  } else if (ambient < 0.32) {
    crackCount = 6;
  }

  for (let index = 0; index < crackCount; index += 1) {
    const angle = seed * 0.28 + index * Math.PI * 0.618;
    let previous = null;

    ctx.beginPath();
    for (let step = 8; step <= 70; step += 2) {
      const along = step / 70;
      const rr = radius * (0.1 + along * 0.9);
      const twist =
        Math.sin(elapsed * 1.95 + angle * 12 + step * 0.21) *
        along *
        along *
        (visual?.ambientHeat ?? 0.52) *
        0.14;
      const worldPoint = polarPoint(
        rr * (1 + twist),
        angle + twist * 6,
        -0.01 * along,
      );

      const projection = camera.project(worldPoint);
      if (!projection) {
        previous = null;
        continue;
      }

      if (previous) {
        ctx.lineTo(projection.x, projection.y);
      } else {
        ctx.moveTo(projection.x, projection.y);
      }
      previous = { x: projection.x, y: projection.y };
    }

    ctx.strokeStyle = hexToRgba(
      "#040203",
      0.22 + (visual?.emberIntensity ?? 0.5) * 0.16,
    );
    ctx.lineWidth = 1.6;
    ctx.stroke();

    ctx.strokeStyle = hexToRgba(
      visual.floorGlow,
      0.16 + (visual?.emberIntensity ?? 0.5) * 0.18,
    );
    ctx.lineWidth = 1.1;
    ctx.stroke();
  }
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {{x: number, y: number}[]} fillPoints
 * @returns {boolean}
 */

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ width: number; height: number }} canvasState
 * @param {ArenaRenderState} renderState
 * @param {ArenaMetrics} metrics
 */
export function renderArenaFloor(ctx, canvasState, renderState, metrics) {
  const { visual, elapsed, heatPulse, camera, radius, levelId } = renderState;
  const { centroidX, centroidY, rimSpan } = metrics;

  ctx.save();
  const fillPoints = getProjectedRing(camera, radius, 52, 0);
  if (!traceClosedPath(ctx, fillPoints)) {
    ctx.restore();
    return;
  }
  ctx.clip();

  ctx.fillStyle = hexToRgba(visual.floorColor, 1);
  ctx.fillRect(0, 0, canvasState.width, canvasState.height);

  const emberIntensity = visual?.emberIntensity ?? 0.5;
  const magmaBreath =
    rimSpan *
    (0.03 * Math.sin(elapsed * 1.55) + emberIntensity * 0.035 * heatPulse);
  const floorGradient = ctx.createRadialGradient(
    centroidX - rimSpan * 0.06,
    centroidY - rimSpan * 0.12,
    rimSpan * 0.045,
    centroidX + rimSpan * 0.06,
    centroidY + rimSpan * 0.14,
    rimSpan * 1.12 + magmaBreath,
  );
  floorGradient.addColorStop(0, hexToRgba(visual.floorColor, 1));
  floorGradient.addColorStop(
    0.34,
    hexToRgba(visual.floorGlow, 0.3 + emberIntensity * 0.18),
  );
  floorGradient.addColorStop(
    0.72,
    hexToRgba(visual.floorGlow, 0.24 + emberIntensity * 0.2),
  );
  floorGradient.addColorStop(1, hexToRgba(visual.rimColor, 0.45));

  ctx.fillStyle = floorGradient;
  ctx.fillRect(0, 0, canvasState.width, canvasState.height);

  drawArenaHazardBands(ctx, canvasState, visual, centroidX, centroidY, rimSpan);

  ctx.globalCompositeOperation = "lighter";
  for (let index = 0; index < 6; index += 1) {
    const halo = ctx.createRadialGradient(
      centroidX + Math.cos(index * 1.72 + elapsed * 0.3) * rimSpan * 0.58,
      centroidY + Math.sin(index * 1.33 + elapsed * 0.26) * rimSpan * 0.62,
      rimSpan * 0.06,
      centroidX,
      centroidY,
      rimSpan,
    );
    halo.addColorStop(0, "rgba(0, 0, 0, 0)");
    halo.addColorStop(
      1,
      hexToRgba(
        visual.accent,
        (0.04 + heatPulse * 0.026) * (visual?.ambientHeat ?? 0.65),
      ),
    );
    ctx.fillStyle = halo;
    if (traceClosedPath(ctx, fillPoints)) {
      ctx.fill();
    }
  }
  ctx.globalCompositeOperation = "source-over";

  ctx.strokeStyle = hexToRgba(visual.floorGlow, 0.1);
  for (let ringIndex = 1; ringIndex <= 3; ringIndex += 1) {
    const ring = getProjectedRing(
      camera,
      radius * (0.2 * ringIndex + 0.18),
      36,
      0.01 + Math.sin(elapsed * (0.5 + ringIndex * 0.12)) * 0.004,
    );
    if (ring.length < 3) {
      continue;
    }
    ctx.lineWidth =
      ringIndex === 3 ? 1.6 + (visual?.emberIntensity ?? 0.5) * 0.5 : 1.2;
    if (traceClosedPath(ctx, ring)) {
      ctx.stroke();
    }
  }

  drawArenaCracks(ctx, camera, radius, elapsed, levelId, visual);
  ctx.restore();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {ArenaRenderState} renderState
 * @param {ArenaMetrics} metrics
 */
export function renderArenaRim(ctx, renderState, metrics) {
  const { camera, radius, visual, elapsed, heatPulse } = renderState;
  const { centroidX, centroidY, rimSpan } = metrics;
  ctx.save();
  const rimGlow = ctx.createRadialGradient(
    centroidX,
    centroidY + rimSpan * 0.2,
    rimSpan * 0.78,
    centroidX,
    centroidY + rimSpan * 0.2,
    rimSpan * 1.06,
  );
  rimGlow.addColorStop(0, hexToRgba(visual.rimColor, 0));
  rimGlow.addColorStop(0.92, hexToRgba(visual.floorGlow, 0));
  rimGlow.addColorStop(1, hexToRgba("#020203", 0.55));

  ctx.fillStyle = rimGlow;
  ctx.beginPath();
  ctx.arc(centroidX, centroidY, rimSpan * 1.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalCompositeOperation = "lighter";
  for (let tier = 0; tier < 3; tier += 1) {
    const rim = getProjectedRing(
      camera,
      radius + tier * 0.02 + Math.sin(elapsed * 3.1 + tier) * 0.022,
      52,
      0.04 + tier * 0.024,
    );
    if (rim.length < 3) {
      continue;
    }
    ctx.strokeStyle = hexToRgba(
      tier === 2 ? visual.rimColor : visual.floorGlow,
      (0.7 - tier * 0.2) *
        (0.55 + heatPulse * 0.2 * (visual?.ambientHeat ?? 0.58)),
    );
    let lineWidth = 1.5;
    if (tier === 0) {
      lineWidth = 3.9;
    } else if (tier === 1) {
      lineWidth = 2.6 + (visual?.emberIntensity ?? 0.5) * 0.4;
    }
    ctx.lineWidth = lineWidth;
    if (traceClosedPath(ctx, rim)) {
      ctx.stroke();
    }
  }

  const innerGlow = getProjectedRing(camera, radius * 0.92, 48, 0.024);
  ctx.globalCompositeOperation = "source-over";
  ctx.strokeStyle = hexToRgba(visual.floorGlow, 0.36);
  ctx.lineWidth = 2.9;
  if (traceClosedPath(ctx, innerGlow)) {
    ctx.stroke();
  }
  ctx.restore();
}
