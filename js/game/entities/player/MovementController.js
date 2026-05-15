// @ts-check

import {
  moveAngleToward,
  moveToward,
  normalizeAngle,
  vec3,
} from "../../Vector3.js";

/**
 * @typedef {import("../Player.js").Player} Player
 */

/**
 * Calcula la dirección deseada basada en el input y la cámara.
 *
 * @param {{ x: number; y: number }} moveAxes
 * @param {import("../../../core/Camera.js").Camera} camera
 * @returns {import("../../Vector3.js").Vec3}
 */
export function getDesiredDirection(moveAxes, camera) {
  const forward = camera.getPlanarForward();
  const right = camera.getPlanarRight();
  const direction = vec3(
    right.x * moveAxes.x + forward.x * moveAxes.y,
    0,
    right.z * moveAxes.x + forward.z * moveAxes.y,
  );

  const magnitude = Math.hypot(direction.x, direction.z);
  if (magnitude > 0.001) {
    direction.x /= magnitude;
    direction.z /= magnitude;
  }

  return direction;
}

/**
 * Actualiza la orientación del jugador.
 *
 * @param {Player} player
 * @param {import("../../Vector3.js").Vec3} desiredDirection
 * @param {number} desiredMagnitude
 * @param {number} deltaTime
 * @param {import("../../../core/Camera.js").Camera} camera
 */
export function updatePlayerFacing(
  player,
  desiredDirection,
  desiredMagnitude,
  deltaTime,
  camera,
) {
  if (
    player.attackPhase ||
    player.dodgeRemaining > 0 ||
    player.hitStunRemaining > 0
  ) {
    return;
  }

  const targetYaw =
    desiredMagnitude > 0.001
      ? Math.atan2(desiredDirection.x, desiredDirection.z)
      : normalizeAngle(camera.yaw);

  player.facingYaw = moveAngleToward(
    player.facingYaw,
    targetYaw,
    player.turnRate * deltaTime,
  );
}

/**
 * Actualiza la velocidad horizontal (correr, esquivar, fricción).
 *
 * @param {Player} player
 * @param {import("../../Vector3.js").Vec3} desiredDirection
 * @param {number} desiredMagnitude
 * @param {number} deltaTime
 */
export function updatePlayerHorizontalVelocity(
  player,
  desiredDirection,
  desiredMagnitude,
  deltaTime,
) {
  if (player.hitStunRemaining > 0) {
    player.velocity.x = moveToward(player.velocity.x, 0, 14 * deltaTime);
    player.velocity.z = moveToward(player.velocity.z, 0, 14 * deltaTime);
    return;
  }

  if (player.dodgeRemaining > 0) {
    player.velocity.x = player.dodgeDirection.x * 10.8;
    player.velocity.z = player.dodgeDirection.z * 10.8;
    player.velocity.y = Math.max(player.velocity.y, 0);
    return;
  }

  const speed = player.grounded ? player.moveSpeed : player.airSpeed;
  const acceleration = player.grounded
    ? player.groundAcceleration
    : player.airAcceleration;
  const attackMultiplier = player.attackPhase ? 0.42 : 1;
  const targetX = desiredDirection.x * speed * attackMultiplier;
  const targetZ = desiredDirection.z * speed * attackMultiplier;

  player.velocity.x = moveToward(
    player.velocity.x,
    targetX,
    acceleration * deltaTime,
  );
  player.velocity.z = moveToward(
    player.velocity.z,
    targetZ,
    acceleration * deltaTime,
  );

  if (desiredMagnitude <= 0.001) {
    const friction = player.grounded ? 20 : 5;
    player.velocity.x = moveToward(player.velocity.x, 0, friction * deltaTime);
    player.velocity.z = moveToward(player.velocity.z, 0, friction * deltaTime);
  }
}
