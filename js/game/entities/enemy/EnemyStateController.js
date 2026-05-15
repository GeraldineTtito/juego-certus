// @ts-check

/** @typedef {import("../Enemy.js").Enemy} Enemy */

/**
 * Actualiza los temporizadores de estado del enemigo (hit stun, flash, etc).
 * @param {Enemy} enemy
 * @param {number} deltaTime
 */
export function updateEnemyTimers(enemy, deltaTime) {
  enemy.hitStunRemaining = Math.max(0, enemy.hitStunRemaining - deltaTime);
  enemy.hitFlashRemaining = Math.max(0, enemy.hitFlashRemaining - deltaTime);
}

/**
 * Procesa el daño recibido por el enemigo.
 * @param {Enemy} enemy
 * @param {number} amount
 * @param {number} impulseYaw
 * @param {number} impulseStrength
 * @returns {boolean}
 */
export function applyEnemyDamage(enemy, amount, impulseYaw, impulseStrength) {
  if (enemy.dead) {
    return false;
  }

  enemy.health = Math.max(0, enemy.health - amount);
  enemy.hitStunRemaining = 0.2;
  enemy.hitFlashRemaining = 0.15;
  enemy.attackPhase = null;
  enemy.attackPhaseRemaining = 0;
  enemy.attackConnected = false;
  enemy.velocity.x = Math.sin(impulseYaw) * impulseStrength;
  enemy.velocity.z = Math.cos(impulseYaw) * impulseStrength;

  if (enemy.health <= 0) {
    enemy.dead = true;
  }

  return true;
}
