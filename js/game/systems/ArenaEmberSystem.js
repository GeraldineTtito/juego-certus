import { randomBetween } from "../Random.js";

/**
 * @typedef {Object} ArenaEmber
 * @property {number} angle
 * @property {number} radius
 * @property {number} height
 * @property {number} speed
 * @property {number} wobble
 * @property {number} wobbleSpeed
 * @property {number} size
 * @property {number} phase
 */

/**
 * Inicializa el conjunto de partículas ambientales (brasas) para la arena.
 * @param {import("../../config/GameplayRuntime.js").ResolvedLevel} level
 * @param {() => number} randomSource
 * @returns {ArenaEmber[]}
 */
export function createArenaEmbers(level, randomSource) {
  const heat = level.visual.emberIntensity ?? 0.65;
  const count = Math.round(28 + heat * 56);
  const pool = [];
  const radiusMax = level.arena.radius;

  for (let index = 0; index < count; index += 1) {
    pool.push({
      angle: randomBetween(0, Math.PI * 2, randomSource()),
      radius: radiusMax * randomBetween(0.72, 0.98, randomSource()),
      height: randomBetween(0, 0.25, randomSource()),
      speed: randomBetween(0.42, 1.15, randomSource()),
      wobble: randomBetween(0, Math.PI * 2, randomSource()),
      wobbleSpeed: randomBetween(0.55, 1.35, randomSource()),
      size: randomBetween(0.035, 0.095, randomSource()),
      phase: randomBetween(0, Math.PI * 2, randomSource()),
    });
  }

  return pool;
}

/**
 * Actualiza la posición y estado de las brasas.
 * @param {ArenaEmber[]} embers
 * @param {number} deltaTime
 * @param {number} arenaRadius
 * @param {() => number} randomSource
 */
export function updateArenaEmbers(
  embers,
  deltaTime,
  arenaRadius,
  randomSource,
) {
  for (const ember of embers) {
    ember.height += ember.speed * deltaTime;
    ember.wobble += ember.wobbleSpeed * deltaTime;
    ember.angle += Math.sin(ember.wobble) * deltaTime * 0.07;
    ember.phase += deltaTime * 3.1;

    if (ember.height > 2.35) {
      ember.height = randomBetween(0, 0.12, randomSource());
      ember.radius = arenaRadius * randomBetween(0.7, 0.99, randomSource());
      ember.angle = randomBetween(0, Math.PI * 2, randomSource());
    }
  }
}
