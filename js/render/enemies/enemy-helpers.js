// @ts-check

import { directionFromYaw } from "../../game/Vector3.js";

/**
 * @param {number} yaw
 */
export function getFacingAxes(yaw) {
  return {
    facing: directionFromYaw(yaw),
    side: {
      x: Math.cos(yaw),
      y: 0,
      z: -Math.sin(yaw),
    },
  };
}
