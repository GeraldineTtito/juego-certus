// @ts-check

import { Enemy } from "../entities/Enemy.js";

/**
 * @typedef {import("../../config/Levels.js").EnemyTemplate} EnemyTemplate
 */

/**
 * Elige un arquetipo de enemigo basado en su peso (probabilidad).
 *
 * @param {EnemyTemplate[]} templates
 * @param {() => number} randomSource
 * @returns {EnemyTemplate}
 */
export function pickEnemyArchetype(templates, randomSource) {
  const totalWeight = templates.reduce((sum, t) => sum + t.weight, 0);
  let threshold = randomSource() * totalWeight;

  for (const template of templates) {
    threshold -= template.weight;
    if (threshold <= 0) {
      return template;
    }
  }

  return templates.at(-1) ?? templates[0];
}

/**
 * Genera una nueva instancia de enemigo en una posición aleatoria dentro de la arena.
 *
 * @param {Object} params
 * @param {import("../../config/GameplayRuntime.js").ResolvedLevel} params.level
 * @param {number} params.spawnIndex
 * @param {() => number} params.randomSource
 * @param {boolean} [params.elite]
 * @returns {Enemy}
 */
export function createWorldEnemy({
  level,
  spawnIndex,
  randomSource,
  elite = false,
}) {
  const archetype = pickEnemyArchetype(level.enemies, randomSource);
  const angle = randomSource() * Math.PI * 2;
  const radius = level.arena.radius - (1.3 + randomSource() * 0.9);

  const x = Math.sin(angle) * radius;
  const z = Math.cos(angle) * radius;

  const enemy = new Enemy({
    id: `enemy-${level.id}-${spawnIndex}`,
    archetype,
    x,
    z,
    orbitBias: randomSource() > 0.5 ? 1 : -1,
    elite,
  });

  enemy.motionPhase = randomSource() * Math.PI * 2;
  return enemy;
}
