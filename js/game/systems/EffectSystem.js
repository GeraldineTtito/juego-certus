// @ts-check

/**
 * @typedef {{ position: { x: number; y: number; z: number }; color: string; radius: number; maxRadius: number; remaining: number }} WorldEffect
 */

/**
 * Crea un nuevo efecto visual en el mundo.
 *
 * @param {Object} params
 * @param {import("../Vector3.js").Vec3} params.position
 * @param {string} params.color
 * @param {WorldEffect[]} params.effects
 * @param {number} params.softCap
 */
export function addWorldEffect({ position, color, effects, softCap }) {
  if (effects.length >= softCap) {
    effects.shift();
  }

  effects.push({
    position: {
      x: position.x,
      y: position.y,
      z: position.z,
    },
    color,
    radius: 0.34,
    maxRadius: 1.12,
    remaining: 0.28,
  });
}

/**
 * Actualiza los efectos visuales existentes.
 *
 * @param {WorldEffect[]} effects
 * @param {number} deltaTime
 * @returns {WorldEffect[]}
 */
export function updateWorldEffects(effects, deltaTime) {
  for (const effect of effects) {
    effect.remaining = Math.max(0, effect.remaining - deltaTime);
    const progress = 1 - effect.remaining / 0.28;
    effect.radius = 0.34 + (effect.maxRadius - 0.34) * progress;
  }

  return effects.filter((effect) => effect.remaining > 0);
}
