// @ts-check

import { offsetPoint } from "../canvasGeometry.js";

/**
 * @typedef {import("../../game/entities/Player.js").Player} Player
 * @typedef {{ x: number; y: number; z: number }} Vec3
 *
 * @typedef {{
 *   core: Vec3;
 *   crown: Vec3;
 *   leftTentacleBase: Vec3;
 *   rightTentacleBase: Vec3;
 *   leftTentacleTip: Vec3;
 *   rightTentacleTip: Vec3;
 *   spearTip: Vec3;
 *   crestLeft: Vec3;
 *   crestRight: Vec3;
 *   crestTop: Vec3;
 * }} HeroPose
 */

/**
 * @param {Vec3} core
 * @param {Vec3} side
 * @param {Vec3} facing
 * @param {number} phase
 * @param {number} fwdStretch
 * @param {number} bodyPulse
 * @param {number} dodgeStretch
 * @returns {Vec3[]}
 */
export function buildHeroHullWorldPoints(
  core,
  side,
  facing,
  phase,
  fwdStretch,
  bodyPulse,
  dodgeStretch,
) {
  const pts = [];
  const count = 14;
  for (let i = 0; i < count; i += 1) {
    const t = (i / count) * Math.PI * 2;
    const lump =
      1 +
      0.34 * Math.sin(t * 2 + phase * 2) +
      0.17 * Math.sin(t * 3 - phase * 1.15) +
      0.12 * Math.sin(t - phase * 1.65) +
      0.06 * Math.sin(t * 5 + phase * 3);
    const rf =
      (0.58 + bodyPulse + dodgeStretch * 0.12 + fwdStretch * 0.04) *
      lump *
      (1 + 0.4 * Math.cos(t) ** 2);
    const rs = (0.52 + bodyPulse + dodgeStretch * 0.06) * lump;
    const p = offsetPoint(
      core,
      side,
      Math.sin(t) * rs,
      facing,
      Math.cos(t) * rf,
    );
    pts.push({
      x: p.x,
      y:
        core.y +
        Math.sin(t * 2 + phase * 3) * 0.089 +
        Math.sin(t * 4 + phase * 5) * 0.038 +
        bodyPulse * 0.07,
      z: p.z,
    });
  }
  return pts;
}

/**
 * @typedef {import("./hero-motion-logic.js").HeroMotionState} HeroMotionState
 */

/**
 * @private
 * @param {Player} player
 * @param {Vec3} crown
 * @param {Vec3} side
 * @param {Vec3} facing
 * @param {HeroMotionState} motion
 * @returns {{ leftTentacleBase: Vec3, rightTentacleBase: Vec3, leftTentacleTip: Vec3, rightTentacleTip: Vec3, spearTip: Vec3 }}
 */
function buildHeroAppendagePoints(player, crown, side, facing, motion) {
  const leftTentacleBase = offsetPoint(
    { x: player.position.x, y: player.position.y + 0.54, z: player.position.z },
    side,
    -0.22,
    facing,
    0.03,
  );
  const rightTentacleBase = offsetPoint(
    { x: player.position.x, y: player.position.y + 0.56, z: player.position.z },
    side,
    0.22,
    facing,
    0.06,
  );
  const leftTentacleTip = offsetPoint(
    { x: player.position.x, y: player.position.y + 0.34, z: player.position.z },
    side,
    -0.56,
    facing,
    -motion.locomotionStride * motion.locomotionWave,
  );

  let rightTentacleTip = offsetPoint(
    { x: player.position.x, y: player.position.y + 0.36, z: player.position.z },
    side,
    0.54,
    facing,
    motion.locomotionStride * motion.locomotionWave * 0.8,
  );
  let spearTip = offsetPoint(crown, side, 0, facing, 0.42);

  if (player.attackPhase === "windup") {
    rightTentacleTip = offsetPoint(
      {
        x: player.position.x,
        y: player.position.y + 0.48,
        z: player.position.z,
      },
      side,
      0.44,
      facing,
      -0.28,
    );
    spearTip = offsetPoint(crown, side, 0, facing, -0.22);
  } else if (player.attackPhase === "active") {
    rightTentacleTip = offsetPoint(
      {
        x: player.position.x,
        y: player.position.y + 0.68,
        z: player.position.z,
      },
      side,
      0.38,
      facing,
      0.92,
    );
    spearTip = offsetPoint(crown, side, 0, facing, 1.14);
  }

  return {
    leftTentacleBase,
    rightTentacleBase,
    leftTentacleTip,
    rightTentacleTip,
    spearTip,
  };
}

/**
 * @param {Player} player
 * @param {Vec3} side
 * @param {Vec3} facing
 * @param {HeroMotionState} motion
 * @returns {HeroPose}
 */
export function buildHeroPose(player, side, facing, motion) {
  const core = {
    x: player.position.x,
    y:
      player.position.y +
      0.64 +
      motion.hover +
      motion.locomotionWave * 0.02 +
      motion.idleBreath * 0.4,
    z: player.position.z,
  };
  const crown = {
    x: player.position.x,
    y:
      player.position.y +
      1.04 +
      motion.hover +
      motion.locomotionWave * 0.04 +
      motion.idleBreath * 0.55,
    z: player.position.z - 0.02,
  };

  const {
    leftTentacleBase,
    rightTentacleBase,
    leftTentacleTip,
    rightTentacleTip,
    spearTip,
  } = buildHeroAppendagePoints(player, crown, side, facing, motion);

  return {
    core,
    crown,
    leftTentacleBase,
    rightTentacleBase,
    leftTentacleTip,
    rightTentacleTip,
    spearTip,
    crestLeft: offsetPoint(crown, side, -0.18, facing, 0.04),
    crestRight: offsetPoint(crown, side, 0.18, facing, 0.04),
    crestTop: offsetPoint(crown, side, 0, facing, 0.14),
  };
}
