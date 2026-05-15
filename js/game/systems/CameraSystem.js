// @ts-check

import { directionFromYaw } from "../Vector3.js";

/**
 * Sistema que maneja la lógica de seguimiento y comportamiento de la cámara.
 */

/**
 * Actualiza la posición de la cámara para que siga al jugador con un ligero adelanto en la dirección que mira.
 * @param {import("../../core/Camera.js").Camera} camera Instancia de la cámara.
 * @param {import("../entities/Player.js").Player} player Instancia del jugador.
 * @param {number} deltaTime Tiempo transcurrido desde el último frame.
 */
export function updateCameraFollow(camera, player, deltaTime) {
  const forward = directionFromYaw(player.facingYaw);

  camera.follow(
    {
      x: player.lookAnchor.x + forward.x * 0.7,
      y: player.lookAnchor.y,
      z: player.lookAnchor.z + forward.z * 0.7,
    },
    deltaTime,
  );
}
