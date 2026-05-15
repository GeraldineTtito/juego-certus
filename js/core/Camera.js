// @ts-check

/**
 * @typedef {Object} CameraLike
 * @property {(worldPos: { x: number; y: number; z: number }) => { x: number; y: number; scale: number; depth?: number } | null} project
 */

import {
  clamp,
  copyVec3,
  crossVec3,
  dotVec3,
  lengthXZ,
  normalizeVec3,
  setVec3,
  subtractVec3,
  vec3,
} from "../game/Vector3.js";
import { randomCentered } from "../utils/SecureRandom.js";

const WORLD_UP = Object.freeze(vec3(0, 1, 0));

export class Camera {
  /**
   * @param {number} viewportWidth
   * @param {number} viewportHeight
   */
  constructor(viewportWidth, viewportHeight) {
    this.width = viewportWidth;
    this.height = viewportHeight;
    this.yaw = 0;
    this.pitch = 0.44;
    this.distance = 8.2;
    this.nearPlane = 0.2;
    this.fieldOfView = Math.PI / 3.1;
    this.focus = 1;

    this.target = vec3(0, 1.15, 0);
    this.position = vec3(0, 4.71, -7.38);
    /** Sacudida de camara en pixeles; se remuestrea una vez por frame. */
    this.shakeMagnitude = 0;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
    this.forward = vec3(0, 0, 1);
    this.right = vec3(1, 0, 0);
    this.up = vec3(0, 1, 0);

    this.relative = vec3();
    this.lookTarget = vec3();
    this.horizontalForward = vec3(0, 0, 1);
    this.horizontalRight = vec3(1, 0, 0);

    this.resize(viewportWidth, viewportHeight);
    this.rebuildBasis();
  }

  /**
   * @param {number} viewportWidth
   * @param {number} viewportHeight
   */
  resize(viewportWidth, viewportHeight) {
    this.width = viewportWidth;
    this.height = viewportHeight;
    this.focus = (this.height * 0.5) / Math.tan(this.fieldOfView * 0.5);
  }

  /**
   * @param {number} deltaX
   * @param {number} deltaY
   */
  applyLook(deltaX, deltaY) {
    this.yaw -= deltaX * 0.0032;
    this.pitch = clamp(this.pitch - deltaY * 0.0022, 0.4, 0.72);
  }

  /**
   * @param {number} amount
   * @param {number} [multiplier] escala opcional (<1 reduce efecto).
   */
  applyShake(amount, multiplier = 1) {
    const scaled = Math.max(0, amount) * Math.max(0, multiplier || 1);
    const next = this.shakeMagnitude + scaled;
    this.shakeMagnitude = Math.min(next, 22);
  }

  /**
   * @param {import("../game/entities/Player.js").Vec3} target
   */
  snapTo(target) {
    copyVec3(this.target, target);
    this.updateTransform(1);
  }

  /**
   * @param {import("../game/entities/Player.js").Vec3} target
   * @param {number} deltaTime
   */
  follow(target, deltaTime) {
    const followStrength = 1 - Math.exp(-7 * deltaTime);
    this.target.x += (target.x - this.target.x) * followStrength;
    this.target.y += (target.y - this.target.y) * followStrength;
    this.target.z += (target.z - this.target.z) * followStrength;
    this.updateTransform(deltaTime);
  }

  /**
   * @param {number} deltaTime
   */
  updateTransform(deltaTime) {
    const horizontalDistance = Math.cos(this.pitch) * this.distance;
    const verticalDistance = Math.sin(this.pitch) * this.distance;

    const desiredPosition = vec3(
      this.target.x - Math.sin(this.yaw) * horizontalDistance,
      this.target.y + verticalDistance,
      this.target.z - Math.cos(this.yaw) * horizontalDistance,
    );

    const positionStrength =
      deltaTime >= 1 ? 1 : 1 - Math.exp(-10 * Math.max(deltaTime, 0.0001));

    this.position.x += (desiredPosition.x - this.position.x) * positionStrength;
    this.position.y += (desiredPosition.y - this.position.y) * positionStrength;
    this.position.z += (desiredPosition.z - this.position.z) * positionStrength;

    const shakeDecay = Math.exp(-12 * Math.max(deltaTime, 0.0001));
    this.shakeMagnitude *= shakeDecay;
    const shake = this.shakeMagnitude;
    this.shakeOffsetX = randomCentered(shake);
    this.shakeOffsetY = randomCentered(shake * 0.86);

    this.rebuildBasis();
  }

  rebuildBasis() {
    setVec3(this.lookTarget, this.target.x, this.target.y + 0.6, this.target.z);
    subtractVec3(this.forward, this.lookTarget, this.position);
    normalizeVec3(this.forward);

    crossVec3(this.right, WORLD_UP, this.forward);
    normalizeVec3(this.right);

    crossVec3(this.up, this.forward, this.right);
    normalizeVec3(this.up);

    this.horizontalForward.x = this.forward.x;
    this.horizontalForward.y = 0;
    this.horizontalForward.z = this.forward.z;
    if (lengthXZ(this.horizontalForward.x, this.horizontalForward.z) <= 0.001) {
      this.horizontalForward.x = Math.sin(this.yaw);
      this.horizontalForward.z = Math.cos(this.yaw);
    }
    normalizeVec3(this.horizontalForward);

    this.horizontalRight.x = this.right.x;
    this.horizontalRight.y = 0;
    this.horizontalRight.z = this.right.z;
    normalizeVec3(this.horizontalRight);
  }

  getPlanarForward() {
    return this.horizontalForward;
  }

  getPlanarRight() {
    return this.horizontalRight;
  }

  /**
   * @param {import("../game/entities/Player.js").Vec3} point
   * @returns {{ x: number, y: number, depth: number, scale: number } | null}
   */
  project(point) {
    subtractVec3(this.relative, point, this.position);
    const cameraX = dotVec3(this.relative, this.right);
    const cameraY = dotVec3(this.relative, this.up);
    const cameraZ = dotVec3(this.relative, this.forward);

    if (cameraZ <= this.nearPlane) {
      return null;
    }

    const scale = this.focus / cameraZ;
    return {
      x: this.width * 0.5 + cameraX * scale + this.shakeOffsetX,
      y: this.height * 0.57 - cameraY * scale + this.shakeOffsetY,
      depth: cameraZ,
      scale,
    };
  }
}
