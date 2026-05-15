// @ts-check

/**
 * Mapeo de acciones lógicas a códigos de teclas (KeyboardEvent.code).
 * Permite centralizar la configuración de controles sin modificar el núcleo del InputManager.
 */
export const ACTION_BINDINGS = {
  moveLeft: ["ArrowLeft", "KeyA"],
  moveRight: ["ArrowRight", "KeyD"],
  moveForward: ["ArrowUp", "KeyW"],
  moveBackward: ["ArrowDown", "KeyS"],
  jump: ["Space"],
  attack: ["KeyJ", "KeyX"],
  dodge: ["KeyB", "ShiftLeft", "ShiftRight"],
  confirm: ["Enter"],
  pause: ["Escape", "KeyP"],
  fullscreen: ["KeyF"],
};
