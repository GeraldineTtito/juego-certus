// @ts-check

import { moveToward } from "../../Vector3.js";

/** @typedef {import("../Enemy.js").Enemy} Enemy */

/**
 * Integra la velocidad en la posición del enemigo y resuelve límites de la arena.
 * @param {Enemy} enemy
 * @param {number} deltaTime
 * @param {import("../../GameWorld.js").GameWorld} world
 */
export function integrateEnemyPosition(enemy, deltaTime, world) {
  enemy.position.x += enemy.velocity.x * deltaTime;
  enemy.position.z += enemy.velocity.z * deltaTime;
  enemy.position.y = enemy.hover;

  const maxDistance = world.level.arena.radius - enemy.radius - 0.4;
  const distance = Math.hypot(enemy.position.x, enemy.position.z);
  if (distance > maxDistance) {
    const scale = maxDistance / distance;
    enemy.position.x *= scale;
    enemy.position.z *= scale;
    enemy.velocity.x *= 0.68;
    enemy.velocity.z *= 0.68;
  }
}

/**
 * Aplica desaceleración horizontal (fricción) al enemigo.
 * @param {Enemy} enemy
 * @param {number} deltaTime
 * @param {number} friction
 */
export function applyEnemyFriction(enemy, deltaTime, friction) {
  enemy.velocity.x = moveToward(enemy.velocity.x, 0, friction * deltaTime);
  enemy.velocity.z = moveToward(enemy.velocity.z, 0, friction * deltaTime);
}
