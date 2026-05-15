// @ts-check

import { ACTION_BINDINGS } from "../config/input.config.js";

export class InputManager {
  /**
   * @param {HTMLElement} targetElement
   */
  constructor(targetElement) {
    this.targetElement = targetElement;
    this.pressedActions = new Set();
    this.justPressedActions = new Set();
    this.codeToActions = new Map();
    this.lookDeltaX = 0;
    this.lookDeltaY = 0;
    this.lastPointerX = null;
    this.lastPointerY = null;
    this.attached = false;
    this.pointerLocked = false;

    for (const [action, codes] of Object.entries(ACTION_BINDINGS)) {
      for (const code of codes) {
        const actions = this.codeToActions.get(code) ?? [];
        actions.push(action);
        this.codeToActions.set(code, actions);
      }
    }

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerLockChange = this.handlePointerLockChange.bind(this);
  }

  attach() {
    if (this.attached) {
      return;
    }

    this.attached = true;

    globalThis.window.addEventListener("keydown", this.handleKeyDown);
    globalThis.window.addEventListener("keyup", this.handleKeyUp);
    globalThis.window.addEventListener("blur", this.handleBlur);
    this.targetElement.addEventListener("pointerdown", this.handlePointerDown);
    this.targetElement.addEventListener("pointermove", this.handlePointerMove);
    globalThis.window.addEventListener("pointerup", this.handlePointerUp);
    document.addEventListener(
      "pointerlockchange",
      this.handlePointerLockChange,
    );
  }

  detach() {
    if (!this.attached) {
      return;
    }

    this.attached = false;

    globalThis.window.removeEventListener("keydown", this.handleKeyDown);
    globalThis.window.removeEventListener("keyup", this.handleKeyUp);
    globalThis.window.removeEventListener("blur", this.handleBlur);
    this.targetElement.removeEventListener(
      "pointerdown",
      this.handlePointerDown,
    );
    this.targetElement.removeEventListener(
      "pointermove",
      this.handlePointerMove,
    );
    globalThis.window.removeEventListener("pointerup", this.handlePointerUp);
    document.removeEventListener(
      "pointerlockchange",
      this.handlePointerLockChange,
    );

    this.handleBlur();
  }

  /**
   * @param {KeyboardEvent} event
   */
  handleKeyDown(event) {
    const mappedActions = this.codeToActions.get(event.code);
    if (!mappedActions) {
      return;
    }

    event.preventDefault();
    for (const action of mappedActions) {
      if (!this.pressedActions.has(action)) {
        this.justPressedActions.add(action);
      }
      this.pressedActions.add(action);
    }
  }

  /**
   * @param {KeyboardEvent} event
   */

  handleKeyUp(event) {
    const mappedActions = this.codeToActions.get(event.code);
    if (!mappedActions) {
      return;
    }

    event.preventDefault();
    for (const action of mappedActions) {
      this.pressedActions.delete(action);
    }
  }

  /**
   * @param {PointerEvent} event
   */

  handlePointerDown(event) {
    if (event.button === 0) {
      if (!this.pressedActions.has("attack")) {
        this.justPressedActions.add("attack");
      }
      this.pressedActions.add("attack");
    }

    this.lastPointerX = event.clientX;
    this.lastPointerY = event.clientY;

    if (
      this.targetElement.requestPointerLock &&
      document.pointerLockElement !== this.targetElement
    ) {
      this.targetElement.requestPointerLock();
    }
  }

  /**
   * @param {PointerEvent} event
   */
  handlePointerUp(event) {
    if (event.button === 0) {
      this.pressedActions.delete("attack");
    }

    if (document.pointerLockElement !== this.targetElement) {
      this.lastPointerX = null;
      this.lastPointerY = null;
    }
  }

  /**
   * @param {PointerEvent} event
   */
  handlePointerMove(event) {
    if (document.pointerLockElement === this.targetElement) {
      this.lookDeltaX += event.movementX;
      this.lookDeltaY += event.movementY;
      return;
    }

    if (this.lastPointerX !== null && this.lastPointerY !== null) {
      this.lookDeltaX += event.clientX - this.lastPointerX;
      this.lookDeltaY += event.clientY - this.lastPointerY;
    }

    this.lastPointerX = event.clientX;
    this.lastPointerY = event.clientY;
  }

  handleBlur() {
    this.pressedActions.clear();
    this.justPressedActions.clear();
    this.lookDeltaX = 0;
    this.lookDeltaY = 0;
    this.lastPointerX = null;
    this.lastPointerY = null;
  }

  handlePointerLockChange() {
    this.pointerLocked = document.pointerLockElement === this.targetElement;
    if (!this.pointerLocked) {
      this.pressedActions.clear();
      this.justPressedActions.clear();
      this.lookDeltaX = 0;
      this.lookDeltaY = 0;
      this.lastPointerX = null;
      this.lastPointerY = null;
    }
  }

  releasePointerLock() {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }

  /**
   * @param {string} action
   * @returns {boolean}
   */
  isDown(action) {
    return this.pressedActions.has(action);
  }

  /**
   * @param {string} action
   * @returns {boolean}
   */
  consumePress(action) {
    const hasPressed = this.justPressedActions.has(action);
    if (hasPressed) {
      this.justPressedActions.delete(action);
    }
    return hasPressed;
  }

  getMoveAxes() {
    const x =
      (this.isDown("moveRight") ? 1 : 0) - (this.isDown("moveLeft") ? 1 : 0);
    const y =
      (this.isDown("moveForward") ? 1 : 0) -
      (this.isDown("moveBackward") ? 1 : 0);
    return { x, y };
  }

  consumeLookDelta() {
    const delta = {
      x: this.lookDeltaX,
      y: this.lookDeltaY,
    };

    this.lookDeltaX = 0;
    this.lookDeltaY = 0;
    return delta;
  }

  endFrame() {
    this.justPressedActions.clear();
  }
}
