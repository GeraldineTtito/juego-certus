// @ts-check

/**
 * @typedef {import("../Player.js").Player} Player
 */

/**
 * Actualiza los temporizadores de estado del jugador (stun, flash, invulnerabilidad).
 *
 * @param {Player} player
 * @param {number} deltaTime
 */
export function updatePlayerTimers(player, deltaTime) {
  player.dodgeRemaining = Math.max(0, player.dodgeRemaining - deltaTime);
  player.dodgeCooldownRemaining = Math.max(
    0,
    player.dodgeCooldownRemaining - deltaTime,
  );
  player.hitStunRemaining = Math.max(0, player.hitStunRemaining - deltaTime);
  player.invulnerabilityRemaining = Math.max(
    0,
    player.invulnerabilityRemaining - deltaTime,
  );
  player.hitFlashRemaining = Math.max(0, player.hitFlashRemaining - deltaTime);
}

/**
 * Determina el estado visual/lógico actual del jugador (idle, run, jump, fall, etc.).
 *
 * @param {Player} player
 * @param {number} desiredMagnitude
 */
export function refreshPlayerState(player, desiredMagnitude) {
  if (player.dead) {
    player.state = "dead";
    return;
  }

  if (player.hitStunRemaining > 0) {
    player.state = "hit";
    return;
  }

  if (player.dodgeRemaining > 0) {
    player.state = "dodge";
    return;
  }

  if (player.attackPhase) {
    player.state = player.attackPhase === "active" ? "attack-active" : "attack";
    return;
  }

  if (!player.grounded) {
    player.state = player.velocity.y >= 0 ? "jump" : "fall";
    return;
  }

  player.state =
    desiredMagnitude > 0.001 ||
    Math.hypot(player.velocity.x, player.velocity.z) > 0.8
      ? "run"
      : "idle";
}
