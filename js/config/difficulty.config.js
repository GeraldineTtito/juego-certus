// @ts-check

/**
 * @typedef {Object} HazardProfile
 * @property {number} startRatio
 * @property {number} dpsPerSec
 */

/**
 * @typedef {Object} DifficultyScalar
 * @property {number} time
 * @property {number} objective
 * @property {number} hazard
 * @property {number} eliteEvery
 * @property {number} spawnInterval
 * @property {number} aggression
 * @property {number} concurrentBonus
 */

/** @type {Record<number | "default", HazardProfile>} */
export const HAZARD_PROFILES = {
  default: { startRatio: 0.934, dpsPerSec: 3.6 },
  1: { startRatio: 0.94, dpsPerSec: 2.6 },
  2: { startRatio: 0.936, dpsPerSec: 3.2 },
  3: { startRatio: 0.93, dpsPerSec: 5.6 },
  4: { startRatio: 0.914, dpsPerSec: 11.2 },
  5: { startRatio: 0.92, dpsPerSec: 9.8 },
};

/** @type {Record<import("../services/user-settings.service.js").DifficultyId, DifficultyScalar>} */
export const DIFFICULTY_SCALARS = {
  easy: {
    time: 1.28,
    objective: 0.88,
    hazard: 0.58,
    eliteEvery: 6,
    spawnInterval: 1.12,
    aggression: 1,
    concurrentBonus: -1,
  },
  normal: {
    time: 1,
    objective: 1,
    hazard: 1,
    eliteEvery: 5,
    spawnInterval: 1,
    aggression: 1,
    concurrentBonus: 0,
  },
  hard: {
    time: 0.82,
    objective: 1.1,
    hazard: 1.42,
    eliteEvery: 4,
    spawnInterval: 0.88,
    aggression: 1.15,
    concurrentBonus: 1,
  },
};
