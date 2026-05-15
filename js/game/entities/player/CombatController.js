// @ts-check

import { directionFromYaw } from "../../Vector3.js";

/**
 * @typedef {import("../Player.js").Player} Player
 * @typedef {import("../../Vector3.js").Vec3} Vec3
 */

/**
 * Intenta iniciar una esquiva.
 *
 * @param {Player} player
 * @param {Vec3} desiredDirection
 * @param {number} desiredMagnitude
 */
export function tryStartPlayerDodge(
  player,
  desiredDirection,
  desiredMagnitude,
) {
  if (
    player.dodgeRemaining > 0 ||
    player.dodgeCooldownRemaining > 0 ||
    player.attackPhase ||
    player.hitStunRemaining > 0
  ) {
    return;
  }

  if (desiredMagnitude > 0.001) {
    player.dodgeDirection.x = desiredDirection.x;
    player.dodgeDirection.z = desiredDirection.z;
  } else {
    const facingDirection = directionFromYaw(player.facingYaw);
    player.dodgeDirection.x = facingDirection.x;
    player.dodgeDirection.z = facingDirection.z;
  }

  player.dodgeRemaining = 0.22;
  player.dodgeCooldownRemaining = 0.72;
  player.invulnerabilityRemaining = Math.max(
    player.invulnerabilityRemaining,
    0.2,
  );
}

/**
 * Intenta iniciar un ataque.
 *
 * @param {Player} player
 * @param {Vec3} desiredDirection
 * @param {number} desiredMagnitude
 */
export function tryStartPlayerAttack(
  player,
  desiredDirection,
  desiredMagnitude,
) {
  if (
    player.attackPhase ||
    player.dodgeRemaining > 0 ||
    player.hitStunRemaining > 0
  ) {
    return;
  }

  if (desiredMagnitude > 0.001) {
    player.facingYaw = Math.atan2(desiredDirection.x, desiredDirection.z);
  }

  player.attackPhase = "windup";
  player.attackPhaseRemaining = 0.1;
  player.attackRegistry.clear();
}

/**
 * Actualiza el estado del ataque (windup -> active -> recovery).
 *
 * @param {Player} player
 * @param {number} deltaTime
 */
export function updatePlayerAttackState(player, deltaTime) {
  if (!player.attackPhase) {
    return;
  }

  player.attackPhaseRemaining -= deltaTime;
  if (player.attackPhaseRemaining > 0) {
    return;
  }

  if (player.attackPhase === "windup") {
    player.attackPhase = "active";
    player.attackPhaseRemaining = 0.12;
    return;
  }

  if (player.attackPhase === "active") {
    player.attackPhase = "recovery";
    player.attackPhaseRemaining = 0.2;
    return;
  }

  player.attackPhase = null;
  player.attackPhaseRemaining = 0;
  player.attackRegistry.clear();
}
