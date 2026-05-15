// @ts-check

import { hexToRgba } from "./canvasColor.js";

const DODGE_CROSSHAIR_TONE = "#7fe6ff";
/** @typedef {{ isWindup: boolean; isActive: boolean; isDodge: boolean; isInvulnerable: boolean }} CrosshairState */

/**
 * @param {import("../game/entities/Player.js").Player} player
 * @returns {CrosshairState}
 */
function getCrosshairState(player) {
  return {
    isWindup: player.attackPhase === "windup",
    isActive: player.attackPhase === "active",
    isDodge: typeof player.state === "string" && player.state === "dodge",
    isInvulnerable: player.invulnerabilityRemaining > 0,
  };
}

/**
 * @param {import("../game/entities/Player.js").Player} player
 * @param {CrosshairState} state
 * @returns {string}
 */
function getCrosshairStrokeHue(player, state) {
  if (state.isInvulnerable || state.isDodge) {
    return DODGE_CROSSHAIR_TONE;
  }

  if (state.isActive) {
    return player.palette.secondary;
  }

  return player.palette.primary;
}

/**
 * @param {CrosshairState} state
 * @returns {number}
 */
function getCrosshairArmLength(state) {
  let armLength = 9;
  if (state.isWindup) {
    armLength = 11;
  }
  if (state.isActive) {
    armLength = 13;
  }
  if (state.isDodge || state.isInvulnerable) {
    armLength += 2;
  }
  return armLength;
}

/**
 * @param {CrosshairState} state
 * @returns {number}
 */
function getCrosshairGap(state) {
  if (state.isActive) {
    return 4;
  }

  if (state.isDodge) {
    return 5;
  }

  return 3;
}

/**
 * @param {CrosshairState} state
 * @returns {number}
 */
function getCrosshairAlpha(state) {
  if (state.isActive) {
    return 1;
  }

  if (state.isWindup) {
    return 0.8;
  }

  if (state.isInvulnerable) {
    return 0.85;
  }

  if (state.isDodge) {
    return 0.7;
  }

  return 0.55;
}

/**
 * @param {CrosshairState} state
 * @returns {number}
 */
function getCrosshairLineWidth(state) {
  if (state.isActive) {
    return 1.8;
  }

  if (state.isInvulnerable) {
    return 1.85;
  }

  if (state.isDodge) {
    return 1.6;
  }

  return 1.4;
}

/**
 * @param {CrosshairState} state
 * @returns {number}
 */
function getCrosshairCoreRadius(state) {
  if (state.isActive) {
    return 2.85;
  }

  if (state.isDodge || state.isInvulnerable) {
    return 2.4;
  }

  return 1.82;
}

/**
 * @param {import("../game/entities/Player.js").Player} player
 * @param {CrosshairState} state
 * @param {string} strokeHue
 * @returns {string}
 */
function getCrosshairCoreTone(player, state, strokeHue) {
  if (state.isActive) {
    return player.palette.secondary;
  }

  return strokeHue;
}

/**
 * @param {import("../game/entities/Player.js").Player} player
 */
function getCrosshairVisual(player) {
  const state = getCrosshairState(player);
  const strokeHue = getCrosshairStrokeHue(player, state);

  return {
    armLength: getCrosshairArmLength(state),
    gap: getCrosshairGap(state),
    alpha: getCrosshairAlpha(state),
    lineWidth: getCrosshairLineWidth(state),
    coreRadius: getCrosshairCoreRadius(state),
    strokeHue,
    coreTone: getCrosshairCoreTone(player, state, strokeHue),
  };
}

/**
 * @param {number} cx
 * @param {number} cy
 * @param {number} armLength
 * @param {number} gap
 * @returns {number[][]}
 */
function buildCrosshairArms(cx, cy, armLength, gap) {
  return [
    [cx - armLength, cy, cx - gap, cy],
    [cx + gap, cy, cx + armLength, cy],
    [cx, cy - armLength, cx, cy - gap],
    [cx, cy + gap, cx, cy + armLength],
  ];
}

/**
 * HUD de gameplay centrado en el canvas (crosshair).
 * Responsabilidad única: feedback visual de puntería sobre el mundo.
 */

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} canvasWidth
 * @param {number} canvasHeight
 * @param {import("../game/entities/Player.js").Player} player
 */
export function drawGameplayCrosshair(ctx, canvasWidth, canvasHeight, player) {
  const cx = canvasWidth * 0.5;
  const cy = canvasHeight * 0.5;
  const visual = getCrosshairVisual(player);

  ctx.save();
  ctx.strokeStyle = hexToRgba(visual.strokeHue, visual.alpha);
  ctx.lineWidth = visual.lineWidth;
  ctx.lineCap = "round";

  for (const [x1, y1, x2, y2] of buildCrosshairArms(
    cx,
    cy,
    visual.armLength,
    visual.gap,
  )) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  ctx.fillStyle = hexToRgba(visual.coreTone, visual.alpha * 0.94);
  ctx.beginPath();
  ctx.arc(cx, cy, visual.coreRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width
 * @param {number} height
 */
export function drawPausedShadeOverlay(ctx, width, height) {
  ctx.fillStyle = "rgba(2, 6, 10, 0.54)";
  ctx.fillRect(0, 0, width, height);
}
