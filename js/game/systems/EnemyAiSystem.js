// @ts-check

import { moveAngleToward, moveToward } from "../Vector3.js";

/**
 * Sistema centralizado de Inteligencia Artificial para los enemigos.
 * Maneja la toma de decisiones, estados de ataque y navegación.
 */

/**
 * Actualiza el comportamiento de IA de un enemigo.
 * @param {import("../entities/Enemy.js").Enemy} enemy
 * @param {import("../entities/Player.js").Player} player
 * @param {number} deltaTime
 */
export function updateEnemyAi(enemy, player, deltaTime) {
  if (enemy.dead || enemy.hitStunRemaining > 0) {
    return;
  }

  const toPlayerX = player.position.x - enemy.position.x;
  const toPlayerZ = player.position.z - enemy.position.z;
  const distance = Math.hypot(toPlayerX, toPlayerZ);
  const targetYaw = Math.atan2(toPlayerX, toPlayerZ);

  // Giro suavizado hacia el jugador
  enemy.facingYaw = moveAngleToward(
    enemy.facingYaw,
    targetYaw,
    enemy.turnRate * deltaTime,
  );

  updateAttackFSM(enemy, deltaTime);

  if (enemy.attackPhase) {
    updateAttackMovement(enemy, deltaTime);
  } else if (distance <= enemy.attackRange + 0.35) {
    enemy.attackPhase = "windup";
    enemy.attackPhaseRemaining = enemy.windupTime;
    enemy.attackConnected = false;
  } else {
    updateChaseMovement(enemy, deltaTime, distance, targetYaw);
  }

  refreshEnemyState(enemy, distance);
}

/**
 * @param {import("../entities/Enemy.js").Enemy} enemy
 * @param {number} deltaTime
 */
function updateAttackFSM(enemy, deltaTime) {
  if (!enemy.attackPhase) {
    return;
  }

  enemy.attackPhaseRemaining -= deltaTime;
  if (enemy.attackPhaseRemaining > 0) {
    return;
  }

  if (enemy.attackPhase === "windup") {
    enemy.attackPhase = "active";
    enemy.attackPhaseRemaining = enemy.activeTime;
    return;
  }

  if (enemy.attackPhase === "active") {
    enemy.attackPhase = "recovery";
    enemy.attackPhaseRemaining = enemy.recoveryTime;
    return;
  }

  enemy.attackPhase = null;
  enemy.attackPhaseRemaining = 0;
  enemy.attackConnected = false;
}

/**
 * @param {import("../entities/Enemy.js").Enemy} enemy
 * @param {number} deltaTime
 */
function updateAttackMovement(enemy, deltaTime) {
  if (enemy.attackPhase === "active") {
    enemy.velocity.x = Math.sin(enemy.facingYaw) * enemy.lungeSpeed;
    enemy.velocity.z = Math.cos(enemy.facingYaw) * enemy.lungeSpeed;
    return;
  }

  enemy.velocity.x = moveToward(enemy.velocity.x, 0, 14 * deltaTime);
  enemy.velocity.z = moveToward(enemy.velocity.z, 0, 14 * deltaTime);
}

/**
 * @param {import("../entities/Enemy.js").Enemy} enemy
 * @param {number} deltaTime
 * @param {number} distance
 * @param {number} targetYaw
 */
function updateChaseMovement(enemy, deltaTime, distance, targetYaw) {
  const orbitAngle =
    targetYaw + enemy.orbitBias * (distance < 4.8 ? 0.85 : 0.42);
  const forwardBias = distance > 6 ? 1 : 0.45;
  const targetX = Math.sin(orbitAngle) * enemy.speed * forwardBias;
  const targetZ = Math.cos(orbitAngle) * enemy.speed * forwardBias;
  const chaseX = Math.sin(targetYaw) * enemy.speed;
  const chaseZ = Math.cos(targetYaw) * enemy.speed;

  enemy.velocity.x = moveToward(
    enemy.velocity.x,
    targetX + chaseX * 0.45,
    10 * deltaTime,
  );
  enemy.velocity.z = moveToward(
    enemy.velocity.z,
    targetZ + chaseZ * 0.45,
    10 * deltaTime,
  );

  if (distance > enemy.chaseRange) {
    enemy.velocity.x = moveToward(
      enemy.velocity.x,
      chaseX * 1.2,
      12 * deltaTime,
    );
    enemy.velocity.z = moveToward(
      enemy.velocity.z,
      chaseZ * 1.2,
      12 * deltaTime,
    );
  }
}

/**
 * @param {import("../entities/Enemy.js").Enemy} enemy
 * @param {number} distance
 */
function refreshEnemyState(enemy, distance) {
  if (enemy.dead) {
    enemy.state = "dead";
    return;
  }

  if (enemy.hitStunRemaining > 0) {
    enemy.state = "hit";
    return;
  }

  if (enemy.attackPhase) {
    enemy.state = enemy.attackPhase === "active" ? "attack-active" : "attack";
    return;
  }

  if (distance < 3.2) {
    enemy.state = "stalk";
    return;
  }

  enemy.state =
    Math.hypot(enemy.velocity.x, enemy.velocity.z) > 1 ? "run" : "idle";
}
