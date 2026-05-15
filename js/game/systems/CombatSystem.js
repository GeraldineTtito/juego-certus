// @ts-check
import { angleDifference } from "../Vector3.js";
import { COMBAT_EVENT_TYPES, COMBAT_COLORS } from "./CombatEvents.js";

/**
 * @typedef {{ position: { x: number; y: number; z: number }; radius: number; height: number }} CombatEntity
 * @typedef {{ type: string; position: { x: number; y: number; z: number }; color: string; amount: number }} HitEvent
 */

/**
 * @param {CombatEntity} origin
 * @param {CombatEntity} target
 * @param {number} facingYaw
 * @param {number} range
 * @param {number} arc
 * @returns {boolean}
 */
function isTargetInsideArc(origin, target, facingYaw, range, arc) {
  const offsetX = target.position.x - origin.position.x;
  const offsetZ = target.position.z - origin.position.z;
  const distance = Math.hypot(offsetX, offsetZ);
  if (distance > range + target.radius) {
    return false;
  }

  const targetYaw = Math.atan2(offsetX, offsetZ);
  const deltaYaw = Math.abs(angleDifference(facingYaw, targetYaw));
  return deltaYaw <= arc * 0.5;
}

/**
 * @param {CombatEntity} origin
 * @param {CombatEntity} target
 * @returns {number}
 */
function getTargetYaw(origin, target) {
  return Math.atan2(
    target.position.x - origin.position.x,
    target.position.z - origin.position.z,
  );
}

/**
 * @param {string} type
 * @param {CombatEntity} target
 * @param {number} heightFactor
 * @param {string} color
 * @param {number} amount
 * @returns {HitEvent}
 */
function createHitEvent(type, target, heightFactor, color, amount) {
  return {
    type,
    position: {
      x: target.position.x,
      y: target.position.y + target.height * heightFactor,
      z: target.position.z,
    },
    color,
    amount,
  };
}

/**
 * @param {import("../entities/Player.js").Player} player
 * @param {import("../entities/Enemy.js").Enemy} enemy
 * @param {{ facingYaw: number; range: number; arc: number; damage: number; knockback: number }} attack
 * @returns {boolean}
 */
function canPlayerHitTarget(player, enemy, attack) {
  if (enemy.dead || player.hasRegisteredHit(enemy.id)) {
    return false;
  }

  return isTargetInsideArc(
    player,
    enemy,
    attack.facingYaw,
    attack.range,
    attack.arc,
  );
}

/**
 * @param {import("../entities/Player.js").Player} player
 * @param {import("../entities/Enemy.js").Enemy[]} enemies
 * @param {HitEvent[]} events
 */
function applyPlayerAttacks(player, enemies, events) {
  const attack = player.getAttackProfile();
  if (!attack) {
    return;
  }

  for (const enemy of enemies) {
    if (!canPlayerHitTarget(player, enemy, attack)) {
      continue;
    }

    const targetYaw = getTargetYaw(player, enemy);
    const wasDamaged = enemy.takeDamage(
      attack.damage,
      targetYaw,
      attack.knockback,
    );
    if (!wasDamaged) {
      continue;
    }

    player.registerHit(enemy.id);
    events.push(
      createHitEvent(
        COMBAT_EVENT_TYPES.PLAYER_HIT,
        enemy,
        0.7,
        COMBAT_COLORS.PLAYER_HIT,
        attack.damage,
      ),
    );
  }
}

/**
 * @param {import("../entities/Player.js").Player} player
 * @param {import("../entities/Enemy.js").Enemy} enemy
 * @param {HitEvent[]} events
 */
function applyEnemyAttack(player, enemy, events) {
  if (enemy.dead) {
    return;
  }

  const attack = enemy.getAttackProfile();
  if (!attack || enemy.hasRegisteredAttackHit()) {
    return;
  }

  if (
    !isTargetInsideArc(
      enemy,
      player,
      attack.facingYaw,
      attack.range,
      attack.arc,
    )
  ) {
    return;
  }

  const targetYaw = getTargetYaw(enemy, player);
  const wasDamaged = player.takeDamage(
    attack.damage,
    targetYaw,
    attack.knockback,
  );
  if (!wasDamaged) {
    return;
  }

  enemy.registerAttackHit();
  events.push(
    createHitEvent(
      COMBAT_EVENT_TYPES.ENEMY_HIT,
      player,
      0.78,
      COMBAT_COLORS.ENEMY_HIT,
      attack.damage,
    ),
  );
}

/**
 * @param {import("../entities/Player.js").Player} player
 * @param {import("../entities/Enemy.js").Enemy[]} enemies
 * @param {HitEvent[]} events
 */
function applyEnemyAttacks(player, enemies, events) {
  for (const enemy of enemies) {
    applyEnemyAttack(player, enemy, events);
  }
}

/**
 * @param {import("../entities/Player.js").Player} player
 * @param {import("../entities/Enemy.js").Enemy[]} enemies
 * @returns {HitEvent[]}
 */
export function resolveCombat(player, enemies) {
  const events = /** @type {HitEvent[]} */ ([]);
  applyPlayerAttacks(player, enemies, events);
  applyEnemyAttacks(player, enemies, events);
  return events;
}
