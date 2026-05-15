// @ts-check

/** @typedef {{ x: number; y: number; z: number }} Vec3 */
/** @typedef {import("../Vector3.js").Vec3} Vec3T */
/** @typedef {{ primary: string; secondary: string; vivid: string; light: string }} Palette */

import { vec3 } from "../Vector3.js";
import {
  getDesiredDirection,
  updatePlayerFacing,
  updatePlayerHorizontalVelocity,
} from "./player/MovementController.js";
import {
  tryStartPlayerDodge,
  tryStartPlayerAttack,
  updatePlayerAttackState,
} from "./player/CombatController.js";
import {
  updatePlayerTimers,
  refreshPlayerState,
} from "./player/StateController.js";
import {
  applyPlayerGravity,
  integratePlayerPosition,
} from "./player/PhysicsController.js";
import {
  handlePlayerLookInput,
  getPlayerMoveAxes,
  consumePlayerAction,
} from "./player/InputAdapter.js";

export class Player {
  /**
   * @param {{ palette: Palette }} bundle
   */
  constructor({ palette }) {
    this.position = vec3(0, 0, 0);
    this.velocity = vec3(0, 0, 0);
    this.lookAnchor = vec3(0, 1.05, 0);
    this.palette = palette;

    this.radius = 0.62;
    this.height = 1.82;
    this.maxHealth = 180;
    this.health = this.maxHealth;
    this.state = "idle";
    this.dead = false;

    this.moveSpeed = 5.2;
    this.airSpeed = 3.7;
    this.groundAcceleration = 18;
    this.airAcceleration = 9.5;
    this.turnRate = 7.6;
    this.jumpVelocity = 7.2;
    this.gravity = 19;
    this.grounded = true;

    this.facingYaw = 0;
    this.locomotionPhase = 0;

    this.dodgeRemaining = 0;
    this.dodgeCooldownRemaining = 0;
    this.dodgeDirection = vec3(0, 0, 1);

    /** @type {"windup" | "active" | "recovery" | null} */
    this.attackPhase = null;
    this.attackPhaseRemaining = 0;
    this.attackDamage = 36;
    this.attackRegistry = new Set();

    this.hitStunRemaining = 0;
    this.invulnerabilityRemaining = 0;
    this.hitFlashRemaining = 0;
  }

  /**
   * @param {number} deltaTime
   * @param {import("../../core/InputManager.js").InputManager} input
   * @param {import("../GameWorld.js").GameWorld} world
   */
  update(deltaTime, input, world) {
    handlePlayerLookInput(input, world);
    this.updateTimers(deltaTime);

    if (this.dead) {
      applyPlayerGravity(this, deltaTime);
      integratePlayerPosition(this, deltaTime, world);
      this.state = "dead";
      return;
    }

    const moveAxes = getPlayerMoveAxes(input);
    const desiredDirection = this.getDesiredDirection(moveAxes, world.camera);
    const desiredMagnitude = Math.hypot(desiredDirection.x, desiredDirection.z);

    if (consumePlayerAction(input, "dodge")) {
      this.tryStartDodge(desiredDirection, desiredMagnitude);
    }

    if (consumePlayerAction(input, "attack")) {
      this.tryStartAttack(desiredDirection, desiredMagnitude);
    }

    if (
      consumePlayerAction(input, "jump") &&
      this.grounded &&
      !this.attackPhase &&
      this.dodgeRemaining <= 0
    ) {
      this.velocity.y = this.jumpVelocity;
      this.grounded = false;
    }

    updatePlayerAttackState(this, deltaTime);
    updatePlayerFacing(
      this,
      desiredDirection,
      desiredMagnitude,
      deltaTime,
      world.camera,
    );
    updatePlayerHorizontalVelocity(
      this,
      desiredDirection,
      desiredMagnitude,
      deltaTime,
    );
    applyPlayerGravity(this, deltaTime);
    integratePlayerPosition(this, deltaTime, world);
    refreshPlayerState(this, desiredMagnitude);
  }

  /** @param {number} deltaTime */
  updateTimers(deltaTime) {
    updatePlayerTimers(this, deltaTime);
  }

  /**
   * @param {{ x: number; y: number }} moveAxes
   * @param {import("../GameWorld.js").GameWorld["camera"]} camera
   */
  getDesiredDirection(moveAxes, camera) {
    return getDesiredDirection(moveAxes, camera);
  }

  /**
   * @param {import("../Vector3.js").Vec3} desiredDirection
   * @param {number} desiredMagnitude
   */
  tryStartDodge(desiredDirection, desiredMagnitude) {
    tryStartPlayerDodge(this, desiredDirection, desiredMagnitude);
  }

  /**
   * @param {import("../Vector3.js").Vec3} desiredDirection
   * @param {number} desiredMagnitude
   */
  tryStartAttack(desiredDirection, desiredMagnitude) {
    tryStartPlayerAttack(this, desiredDirection, desiredMagnitude);
  }

  getAttackProfile() {
    if (this.attackPhase !== "active" || this.dead) {
      return null;
    }

    return {
      range: 2.7,
      arc: 1.2,
      damage: this.attackDamage,
      knockback: 7.2,
      origin: this.position,
      facingYaw: this.facingYaw,
    };
  }

  /**
   * @param {string} targetId
   * @returns {boolean}
   */
  hasRegisteredHit(targetId) {
    return this.attackRegistry.has(targetId);
  }

  /**
   * @param {string} targetId
   */
  registerHit(targetId) {
    this.attackRegistry.add(targetId);
  }

  /**
   * @param {number} amount
   * @param {number} impulseYaw
   * @param {number} impulseStrength
   * @returns {boolean}
   */
  takeDamage(amount, impulseYaw, impulseStrength) {
    if (this.dead || this.invulnerabilityRemaining > 0) {
      return false;
    }

    this.health = Math.max(0, this.health - amount);
    this.hitStunRemaining = 0.26;
    this.invulnerabilityRemaining = 0.42;
    this.hitFlashRemaining = 0.16;
    this.attackPhase = null;
    this.attackPhaseRemaining = 0;
    this.attackRegistry.clear();
    this.velocity.x = Math.sin(impulseYaw) * impulseStrength;
    this.velocity.z = Math.cos(impulseYaw) * impulseStrength;
    this.velocity.y = 3.4;

    if (this.health <= 0) {
      this.dead = true;
    }

    return true;
  }

  /** Daño ambiental ligero sin volar física del combate cuerpo a cuerpo.
   * @param {number} points
   * @returns {boolean}
   */
  applyAuraDamage(points) {
    if (this.dead || points <= 0) {
      return false;
    }

    if (this.invulnerabilityRemaining > 0) {
      return false;
    }

    const damage = Math.max(1, Math.round(points));
    this.health = Math.max(0, this.health - damage);
    this.hitFlashRemaining = Math.max(this.hitFlashRemaining, 0.12);

    if (this.health <= 0) {
      this.dead = true;
      this.velocity.x *= 0.4;
      this.velocity.z *= 0.4;
    }

    return true;
  }
}
