// @ts-check

import { hexToRgba } from "../../canvasColor.js";
import {
  drawOrb,
  drawGelOrb,
  drawSoftBloom,
} from "../../canvasProjectedPrimitives.js";
import { offsetPoint } from "../../canvasGeometry.js";

/** @typedef {{ x: number; y: number; z: number }} WorldPoint */
/** @typedef {{ side: WorldPoint; facing: WorldPoint; alpha: number; variant: "hero" | "fiend" | "beast"; eyeScale: number; elapsed?: number }} SlimeEyesVisual */

const EYE_PALETTES = {
  hero: {
    baseRadius: 0.09,
    pupilTint: "#024636",
    scleraTone: "#caffef",
    scleraHighlight: "#effff8",
    gelHighlight: "#96ffd9",
    auraFill: "#04402c",
    auraRim: "#021810",
    auraAlpha: 0.38,
    bloomColor: "#40ffd0",
    bloomAlpha: 0.16,
    lidColor: "#070b14",
  },
  fiend: {
    baseRadius: 0.074,
    pupilTint: "#3d040a",
    scleraTone: "#ffe0e8",
    scleraHighlight: "#fff5f8",
    gelHighlight: "#ffeef1",
    auraFill: "#4a0810",
    auraRim: "#1c0408",
    auraAlpha: 0.55,
    bloomColor: "#ff3d62",
    bloomAlpha: 0.18,
    lidColor: "#1a0709",
  },
  beast: {
    baseRadius: 0.098,
    pupilTint: "#3d2a04",
    scleraTone: "#ffffd0",
    scleraHighlight: "#ffffef",
    gelHighlight: "#ffff96",
    auraFill: "#403204",
    auraRim: "#1c1404",
    auraAlpha: 0.55,
    bloomColor: "#ffd040",
    bloomAlpha: 0.18,
    lidColor: "#1a1407",
  },
};

/**
 * @param {"hero" | "fiend" | "beast"} variant
 * @param {number} eyeScale
 */
function getSlimeEyePalette(variant, eyeScale) {
  const p = EYE_PALETTES[variant];
  return {
    scleraRadius: p.baseRadius * eyeScale,
    pupilTint: p.pupilTint,
    scleraTone: p.scleraTone,
    scleraHighlight: p.scleraHighlight,
    gelHighlight: p.gelHighlight,
    auraFill: p.auraFill,
    auraRim: p.auraRim,
    auraAlpha: p.auraAlpha,
    bloomColor: p.bloomColor,
    bloomAlpha: p.bloomAlpha,
    lidColor: p.lidColor,
  };
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number; y: number }} eyeProjection
 * @param {number} radiusScreen
 * @param {string} lidColor
 * @param {number} alpha
 */
function drawSlimeEyeLid(ctx, eyeProjection, radiusScreen, lidColor, alpha) {
  ctx.save();
  ctx.strokeStyle = hexToRgba(lidColor, alpha * 0.54);
  ctx.lineWidth = Math.max(1.2, radiusScreen * 0.12);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(
    eyeProjection.x,
    eyeProjection.y + radiusScreen * 0.05,
    radiusScreen * 0.76,
    Math.PI * 1.04,
    Math.PI * 1.96,
  );
  ctx.stroke();
  ctx.restore();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {import("../../../core/Camera.js").CameraLike} camera
 * @param {WorldPoint} anchor
 * @param {WorldPoint} facing
 * @param {number} alpha
 * @param {ReturnType<getSlimeEyePalette>} eyePalette
 * @param {number} elapsed
 */
function drawSingleSlimeEye(
  ctx,
  camera,
  anchor,
  facing,
  alpha,
  eyePalette,
  elapsed,
) {
  const eyePhase = elapsed * 2.6 + anchor.x * 5.37 + anchor.z * 5.91;
  drawOrb(
    ctx,
    camera,
    anchor,
    eyePalette.scleraRadius * (eyePalette.bloomAlpha > 0.17 ? 1.22 : 1.14),
    eyePalette.auraFill,
    eyePalette.auraRim,
    alpha * eyePalette.auraAlpha,
  );
  drawSoftBloom(
    ctx,
    camera,
    anchor,
    eyePalette.scleraRadius * (eyePalette.bloomAlpha > 0.17 ? 1.35 : 1.32),
    eyePalette.bloomColor,
    alpha * eyePalette.bloomAlpha,
  );
  drawOrb(
    ctx,
    camera,
    anchor,
    eyePalette.scleraRadius * 1.12,
    "#04060f",
    "#02040a",
    alpha * 0.28,
  );
  drawGelOrb(ctx, camera, anchor, eyePalette.scleraRadius, {
    color: eyePalette.scleraTone,
    highlight: eyePalette.gelHighlight,
    alpha: alpha * 0.94,
    phase: eyePhase,
  });

  const eyeProjection = camera.project(anchor);
  if (eyeProjection) {
    const radiusScreen = Math.max(
      3,
      eyePalette.scleraRadius * eyeProjection.scale,
    );
    drawSlimeEyeLid(
      ctx,
      eyeProjection,
      radiusScreen,
      eyePalette.lidColor,
      alpha,
    );
  }

  drawOrb(
    ctx,
    camera,
    anchor,
    eyePalette.scleraRadius * 0.36,
    eyePalette.pupilTint,
    "#000814",
    alpha * 0.97,
  );
  const glint = {
    x: anchor.x - facing.x * 0.024,
    y: anchor.y + 0.028,
    z: anchor.z - facing.z * 0.024,
  };
  drawOrb(
    ctx,
    camera,
    glint,
    eyePalette.scleraRadius * 0.22,
    eyePalette.scleraHighlight,
    "#ffffff",
    alpha * 0.62,
  );
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {import("../../../core/Camera.js").CameraLike} camera
 * @param {WorldPoint} crown
 * @param {SlimeEyesVisual} visual
 */
export function drawSlimeEyes(ctx, camera, crown, visual) {
  const { side, facing, alpha, variant, eyeScale, elapsed = 0 } = visual;
  const spread = variant === "hero" ? 0.1 : 0.088;
  const forward = variant === "hero" ? 0.15 : 0.11;
  const drop = variant === "hero" ? 0.05 : 0.035;
  const anchors = [
    offsetPoint(crown, side, -spread, facing, forward),
    offsetPoint(crown, side, spread, facing, forward),
  ];
  anchors[0].y -= drop;
  anchors[1].y -= drop;

  const eyePalette = getSlimeEyePalette(variant, eyeScale);
  for (const anchor of anchors) {
    drawSingleSlimeEye(ctx, camera, anchor, facing, alpha, eyePalette, elapsed);
  }
}
