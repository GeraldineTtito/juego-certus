// @ts-check

import { vec3 } from "../Vector3.js";
import { updateEnemyAi } from "../systems/EnemyAiSystem.js";
import {
  updateEnemyTimers,
  applyEnemyDamage,
} from "./enemy/EnemyStateController.js";
import {
  integrateEnemyPosition,
  applyEnemyFriction,
} from "./enemy/EnemyPhysicsController.js";

/**
 * @param {string} model
 * @returns {{height: number; hover: number; lungeSpeed: number}}
 */
function getModelMetrics(model) {
  if (model === "draugr") {
    return {
      height: 1.95,
      hover: 0,
      lungeSpeed: 7.5,
    };
  }

  if (model === "beast") {
    return {
      height: 1.25,
      hover: 0,
      lungeSpeed: 8.2,
    };
  }

  return {
    height: 1.4,
    hover: 0.14,
    lungeSpeed: 6.8,
  };
}

export class Enemy {
  /**
   * @param {{ id: string; archetype: {
    model: string;
    label: string;
    health: number;
    radius: number;
    speed: number;
    damage: number;
    attackRange: number;
    chaseRange: number;
    windupTime: number;
    activeTime: number;
    recoveryTime: number;
    bodyColor: string;
    detailColor: string;
    shadowColor: string;
  }; x: number; z: number; orbitBias: number; elite?: boolean }} bundle
   */
  constructor({ id, archetype, x, z, orbitBias, elite = false }) {
    const metrics = getModelMetrics(archetype.model);
    /** @type {boolean} */
    this.elite = Boolean(elite);
    /** @type {number} */
    this.eliteScale = this.elite ? 1.32 : 1;

    this.id = id;
    const baseLabel = archetype.label;
    this.label = this.elite ? `${baseLabel} de élite` : baseLabel;
    this.model = archetype.model;
    this.position = vec3(x, metrics.hover, z);
    this.velocity = vec3(0, 0, 0);

    this.maxHealth = Math.round(archetype.health * (this.elite ? 1.45 : 1));
    this.health = this.maxHealth;
    this.radius = archetype.radius * (this.elite ? 1.08 : 1);
    this.height = metrics.height;
    this.hover = metrics.hover;
    this.speed = archetype.speed * (this.elite ? 0.92 : 1);
    this.damage = Math.round(archetype.damage * (this.elite ? 1.12 : 1));
    this.attackRange = archetype.attackRange;
    this.chaseRange = archetype.chaseRange;
    this.lungeSpeed = metrics.lungeSpeed;
    this.bodyColor = archetype.bodyColor;
    this.detailColor = archetype.detailColor;
    this.shadowColor = archetype.shadowColor;

    this.facingYaw = 0;
    this.state = "spawn";
    this.dead = false;
    this.remove = false;
    this.countedDefeat = false;
    this.deathTimer = 0.8;

    this.hitStunRemaining = 0;
    this.hitFlashRemaining = 0;
    /** @type {string | null} */
    this.attackPhase = null;
    this.attackPhaseRemaining = 0;
    this.attackConnected = false;

    this.turnRate = 6.5;
    this.orbitBias = orbitBias;
    this.motionPhase = 0;
    this.windupTime = archetype.windupTime ?? 0.28;
    this.activeTime = archetype.activeTime ?? 0.16;
    this.recoveryTime = archetype.recoveryTime ?? 0.26;
  }

  /**
   * @param {number} deltaTime
   * @param {import("./Player.js").Player} player
   * @param {import("../GameWorld.js").GameWorld} world
   */
  update(deltaTime, player, world) {
    updateEnemyTimers(this, deltaTime);

    if (this.dead) {
      this.deathTimer = Math.max(0, this.deathTimer - deltaTime);
      applyEnemyFriction(this, deltaTime, 4.6);
      integrateEnemyPosition(this, deltaTime, world);
      this.state = "dead";
      this.remove = this.deathTimer <= 0;
      return;
    }

    if (this.hitStunRemaining > 0) {
      applyEnemyFriction(this, deltaTime, 11);
    } else {
      updateEnemyAi(this, player, deltaTime);
    }

    integrateEnemyPosition(this, deltaTime, world);
    this.motionPhase +=
      Math.hypot(this.velocity.x, this.velocity.z) * deltaTime * 1.5;
  }

  getAttackProfile() {
    if (this.attackPhase !== "active" || this.dead || this.attackConnected) {
      return null;
    }

    return {
      range: this.attackRange + 0.48,
      arc: this.model === "beast" ? 1.2 : 1,
      damage: this.damage,
      knockback: 5.8,
      origin: this.position,
      facingYaw: this.facingYaw,
    };
  }

  hasRegisteredAttackHit() {
    return this.attackConnected;
  }

  registerAttackHit() {
    this.attackConnected = true;
  }

  /**
   * @param {number} amount
   * @param {number} impulseYaw
   * @param {number} impulseStrength
   * @returns {boolean}
   */
  takeDamage(amount, impulseYaw, impulseStrength) {
    return applyEnemyDamage(this, amount, impulseYaw, impulseStrength);
  }
}
