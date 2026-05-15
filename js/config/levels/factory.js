// @ts-check

/** @typedef {import("./types.js").EnemyTemplate} EnemyTemplate */
/** @typedef {import("./types.js").EnemyOverrides} EnemyOverrides */

/**
 * @param {EnemyOverrides} overrides
 * @returns {EnemyTemplate[]}
 */
export function createEnemyPool(overrides = {}) {
  return [
    {
      type: "slime",
      label: "Abyss Slime",
      model: "slime",
      weight: 2,
      health: 56,
      speed: 4.1,
      damage: 12,
      radius: 0.72,
      attackRange: 1.75,
      chaseRange: 14,
      windupTime: 0.28,
      activeTime: 0.2,
      recoveryTime: 0.26,
      bodyColor: "#1e4f55",
      detailColor: "#6effb8",
      shadowColor: "rgba(22, 60, 45, 0.58)",
    },
    {
      type: "draugr",
      label: "Draugr Reaver",
      model: "draugr",
      weight: 1.35,
      health: 84,
      speed: 3.5,
      damage: 16,
      radius: 0.58,
      attackRange: 1.9,
      chaseRange: 16,
      windupTime: 0.28,
      activeTime: 0.16,
      recoveryTime: 0.26,
      bodyColor: "#7d8f9f",
      detailColor: "#e8f4ff",
      shadowColor: "rgba(27, 34, 40, 0.55)",
    },
    {
      type: "beast",
      label: "Rift Beast",
      model: "beast",
      weight: 0.9,
      health: 66,
      speed: 5,
      damage: 14,
      radius: 0.52,
      attackRange: 1.65,
      chaseRange: 18,
      windupTime: 0.2,
      activeTime: 0.16,
      recoveryTime: 0.26,
      bodyColor: "#9f6f57",
      detailColor: "#ffdfc4",
      shadowColor: "rgba(62, 33, 25, 0.55)",
    },
    ...(overrides.extraPool ?? []),
  ].map((enemy) => ({
    ...enemy,
    .../** @type {Partial<EnemyTemplate>} */ (overrides[enemy.type]),
  }));
}
