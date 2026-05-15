// @ts-check

/**
 * @typedef {{ x: number; y: number; z: number }} Vec3
 */

/**
 * @param {number} [x]
 * @param {number} [y]
 * @param {number} [z]
 * @returns {Vec3}
 */
export function vec3(x = 0, y = 0, z = 0) {
  return { x, y, z };
}

/**
 * @param {Vec3} target
 * @param {Vec3} source
 * @returns {Vec3}
 */
export function copyVec3(target, source) {
  target.x = source.x;
  target.y = source.y;
  target.z = source.z;
  return target;
}

/**
 * @param {Vec3} target
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @returns {Vec3}
 */
export function setVec3(target, x, y, z) {
  target.x = x;
  target.y = y;
  target.z = z;
  return target;
}

/**
 * @param {Vec3} target
 * @param {Vec3} left
 * @param {Vec3} right
 * @returns {Vec3}
 */
export function subtractVec3(target, left, right) {
  target.x = left.x - right.x;
  target.y = left.y - right.y;
  target.z = left.z - right.z;
  return target;
}

/**
 * @param {Vec3} target
 * @param {number} scalar
 * @returns {Vec3}
 */
export function scaleVec3(target, scalar) {
  target.x *= scalar;
  target.y *= scalar;
  target.z *= scalar;
  return target;
}

/**
 * @param {Vec3} source
 * @returns {number}
 */
export function lengthVec3(source) {
  return Math.hypot(source.x, source.y, source.z);
}

/**
 * @param {number} x
 * @param {number} z
 * @returns {number}
 */
export function lengthXZ(x, z) {
  return Math.hypot(x, z);
}

/**
 * @param {Vec3} target
 * @returns {Vec3}
 */
export function normalizeVec3(target) {
  const length = lengthVec3(target);
  if (length <= 0.0001) {
    return target;
  }

  return scaleVec3(target, 1 / length);
}

/**
 * @param {Vec3} left
 * @param {Vec3} right
 * @returns {number}
 */
export function dotVec3(left, right) {
  return left.x * right.x + left.y * right.y + left.z * right.z;
}

/**
 * @param {Vec3} target
 * @param {Vec3} left
 * @param {Vec3} right
 * @returns {Vec3}
 */
export function crossVec3(target, left, right) {
  const x = left.y * right.z - left.z * right.y;
  const y = left.z * right.x - left.x * right.z;
  const z = left.x * right.y - left.y * right.x;
  target.x = x;
  target.y = y;
  target.z = z;
  return target;
}

/**
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * @param {number} current
 * @param {number} target
 * @param {number} maxDelta
 * @returns {number}
 */
export function moveToward(current, target, maxDelta) {
  if (Math.abs(target - current) <= maxDelta) {
    return target;
  }

  return current + Math.sign(target - current) * maxDelta;
}

/**
 * @param {number} angle
 * @returns {number}
 */
export function normalizeAngle(angle) {
  let normalized = angle;
  while (normalized <= -Math.PI) {
    normalized += Math.PI * 2;
  }

  while (normalized > Math.PI) {
    normalized -= Math.PI * 2;
  }

  return normalized;
}

/**
 * @param {number} from
 * @param {number} to
 * @returns {number}
 */
export function angleDifference(from, to) {
  return normalizeAngle(to - from);
}

/**
 * @param {number} current
 * @param {number} target
 * @param {number} maxDelta
 * @returns {number}
 */
export function moveAngleToward(current, target, maxDelta) {
  const difference = angleDifference(current, target);
  if (Math.abs(difference) <= maxDelta) {
    return normalizeAngle(target);
  }

  return normalizeAngle(current + Math.sign(difference) * maxDelta);
}

/**
 * @param {number} yaw
 * @returns {Vec3}
 */
export function directionFromYaw(yaw) {
  return {
    x: Math.sin(yaw),
    y: 0,
    z: Math.cos(yaw),
  };
}
