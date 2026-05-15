// @ts-check

/**
 * Punto polar en XZ y offset en espacio mundo para sprites proyectados.
 * Responsabilidad única: geometría 3D mínima usada solo por canvas.
 */

/** @param {number} radius @param {number} angle @param {number} [y] */
export function polarPoint(radius, angle, y = 0) {
  return {
    x: Math.sin(angle) * radius,
    y,
    z: Math.cos(angle) * radius,
  };
}

/** @typedef {{ x: number; y: number; z: number }} Vec3 */

/**
 * @param {Vec3} origin
 * @param {{ x: number; y: number; z: number }} side
 * @param {number} sideDistance
 * @param {{ x: number; y: number; z: number }} forward
 * @param {number} forwardDistance
 */
export function offsetPoint(
  origin,
  side,
  sideDistance,
  forward,
  forwardDistance,
) {
  return {
    x: origin.x + side.x * sideDistance + forward.x * forwardDistance,
    y: origin.y,
    z: origin.z + side.z * sideDistance + forward.z * forwardDistance,
  };
}

/** @typedef {{ project: (p: { x: number; y: number; z: number }) => { x: number; y: number; depth?: number; scale?: number } | null }} CameraProjectionSource */
/** @typedef {{ depth?: number; scale?: number; x?: number; y?: number }} CameraProjection */

/**
 * @param {CameraProjectionSource} camera
 * @param {number} radius
 * @param {number} samples
 * @param {number} [y]
 */
export function getProjectedRing(camera, radius, samples, y = 0) {
  /** @type {Array<{ x: number; y: number; depth?: number; scale?: number }>} */
  const points = [];
  for (let index = 0; index <= samples; index += 1) {
    const angle = (index / samples) * Math.PI * 2;
    const projection = camera.project(polarPoint(radius, angle, y));
    if (projection) {
      points.push(projection);
    }
  }

  return points;
}
