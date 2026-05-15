// @ts-check

/** @typedef {import("../Player.js").Player} Player */

/**
 * Aplica la gravedad al jugador.
 * @param {Player} player
 * @param {number} deltaTime
 */
export function applyPlayerGravity(player, deltaTime) {
  if (player.grounded && player.velocity.y <= 0) {
    player.velocity.y = 0;
    return;
  }

  player.velocity.y -= player.gravity * deltaTime;
}

/**
 * Integra la velocidad en la posición y resuelve colisiones con la arena.
 * @param {Player} player
 * @param {number} deltaTime
 * @param {import("../../GameWorld.js").GameWorld} world
 */
export function integratePlayerPosition(player, deltaTime, world) {
  player.position.x += player.velocity.x * deltaTime;
  player.position.y += player.velocity.y * deltaTime;
  player.position.z += player.velocity.z * deltaTime;

  if (player.position.y <= 0) {
    player.position.y = 0;
    player.velocity.y = 0;
    player.grounded = true;
  } else {
    player.grounded = false;
  }

  const maxDistance = world.level.arena.radius - player.radius - 0.8;
  const distance = Math.hypot(player.position.x, player.position.z);
  if (distance > maxDistance) {
    const scale = maxDistance / distance;
    player.position.x *= scale;
    player.position.z *= scale;
    player.velocity.x *= 0.76;
    player.velocity.z *= 0.76;
  }

  player.lookAnchor.x = player.position.x;
  player.lookAnchor.y = player.position.y + 1.05;
  player.lookAnchor.z = player.position.z;

  const horizontalSpeed = Math.hypot(player.velocity.x, player.velocity.z);
  player.locomotionPhase += horizontalSpeed * deltaTime * 1.6;
}
