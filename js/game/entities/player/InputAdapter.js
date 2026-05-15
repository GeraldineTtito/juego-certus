// @ts-check

/** @typedef {import("../Player.js").Player} Player */

/**
 * Procesa el input de la cámara (look delta).
 * @param {import("../../../core/InputManager.js").InputManager} input
 * @param {import("../../GameWorld.js").GameWorld} world
 */
export function handlePlayerLookInput(input, world) {
  const lookDelta = input.consumeLookDelta();
  const sensitivity = world.lookSensitivity ?? 1;
  const invertY = Boolean(world.lookInvertY);

  world.camera.applyLook(
    lookDelta.x * sensitivity,
    lookDelta.y * sensitivity * (invertY ? -1 : 1),
  );
}

/**
 * Obtiene los ejes de movimiento del input.
 * @param {import("../../../core/InputManager.js").InputManager} input
 * @returns {{ x: number; y: number }}
 */
export function getPlayerMoveAxes(input) {
  return input.getMoveAxes();
}

/**
 * Verifica si se ha presionado una acción específica.
 * @param {import("../../../core/InputManager.js").InputManager} input
 * @param {string} action
 * @returns {boolean}
 */
export function consumePlayerAction(input, action) {
  return input.consumePress(action);
}
