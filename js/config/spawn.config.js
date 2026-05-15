// @ts-check

/**
 * Configuración del Director de Enemigos (Spawn)
 */
export const SPAWN_CONFIG = {
  /**
   * Intervalo base de spawn inicial: max(0.9, 2.35 - nivel * 0.16)
   * @param {number} levelId
   */
  calculateBaseInterval: (levelId) => Math.max(0.9, 2.35 - levelId * 0.16),

  /** Límite inferior absoluto del intervalo de spawn */
  MIN_SPAWN_INTERVAL: 0.55,

  /**
   * Temporizador inicial de spawn: min(intervalo * 0.6, 1 + nivel * 0.06)
   * @param {number} levelId
   * @param {number} interval
   */
  calculateInitialTimer: (levelId, interval) =>
    Math.min(interval * 0.6, 1 + levelId * 0.06),

  /**
   * Concurrentes base: min(6, 3 + nivel)
   * @param {number} levelId
   */
  calculateMaxConcurrent: (levelId) => Math.min(6, 3 + levelId),

  /** Rango de aleatoriedad en el intervalo de spawn */
  INTERVAL_RANDOM_RANGE: [0.8, 1.15],

  /** Umbral de spawn de élite aleatorio en fase >= 2 */
  ELITE_RANDOM_THRESHOLD: 0.78,

  /** Umbral de ráfaga (burst) */
  BURST_RANDOM_THRESHOLD: 0.68,

  /** Umbral de eco élite en ráfaga */
  BURST_ELITE_THRESHOLD: 0.55,
};

/**
 * Escala de agresión por dificultad para el Director
 * @type {Record<import("../services/user-settings.service.js").DifficultyId, number>}
 */
export const DIFFICULTY_AGGRESSION = {
  easy: 1,
  normal: 1,
  hard: 1.06,
};

/**
 * Factores de presión por tiempo restante
 */
export const SURVIVAL_PRESSURE = [
  { threshold: 0.25, factor: 0.82 },
  { threshold: 0.45, factor: 0.9 },
  { threshold: 1, factor: 0.97 },
];

/**
 * Escala por fase de intensidad (inferPhase)
 * @type {Record<number, number>}
 */
export const PHASE_SCALARS = {
  0: 1,
  1: 0.93,
  // Fase 2 usa survival pressure dinámico
};
