// @ts-check

/**
 * @typedef {import("../../game/entities/Player.js").Player} Player
 *
 * @typedef {{
 *   locomotionWave: number;
 *   locomotionStride: number;
 *   dodgeStretch: number;
 *   hover: number;
 *   idleBreath: number;
 *   bodyPulse: number;
 *   eyeSquint: number;
 * }} HeroMotionState
 */

/**
 * @param {Player} player
 * @param {number} elapsed
 */
export function getHeroMotionState(player, elapsed) {
  const locomotionWave = Math.sin(player.locomotionPhase);
  let locomotionStride = 0.06;
  if (player.state === "run") {
    locomotionStride = 0.2;
  } else if (player.state === "idle") {
    locomotionStride = 0.035;
  }

  const dodgeStretch = player.state === "dodge" ? 0.19 : 0;
  const hover = player.grounded ? 0 : 0.1;
  const idleBreath =
    player.state === "idle" ? Math.sin(elapsed * 2.35) * 0.022 : 0;
  const bodyPulse = locomotionStride * locomotionWave * 0.5 + idleBreath;
  let eyeSquint = 1;
  if (player.attackPhase === "windup") {
    eyeSquint = 0.62;
  } else if (player.state === "dodge") {
    eyeSquint = 0.88;
  }
  if (player.attackPhase === "active") {
    eyeSquint = 1.12;
  }

  return {
    locomotionWave,
    locomotionStride,
    dodgeStretch,
    hover,
    idleBreath,
    bodyPulse,
    eyeSquint,
  };
}

/**
 * @param {Player} player
 * @returns {number}
 */
export function getHeroAlpha(player) {
  if (
    player.invulnerabilityRemaining > 0 &&
    Math.floor(player.invulnerabilityRemaining * 40) % 2 === 0
  ) {
    return 0.46;
  }

  return 1;
}
