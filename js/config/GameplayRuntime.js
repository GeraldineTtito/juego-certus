// @ts-check

import { CAMPAIGN_LEVELS, getLevelById } from "./Levels.js";
import { DIFFICULTY_SCALARS, HAZARD_PROFILES } from "./difficulty.config.js";

/** @import { DifficultyId } from "../services/user-settings.service.js"; */

/**
 * @typedef {import("./difficulty.config.js").HazardProfile} HazardProfile
 */

/**
 * @typedef {Object} LevelRuntime
 * @property {import("../services/user-settings.service.js").DifficultyId} [difficulty]
 * @property {number} [eliteEvery]
 * @property {number} [maxConcurrentBonus]
 * @property {number} [spawnIntervalMultiplier]
 * @property {number} [spawnPhaseAggression]
 */

/**
 * @typedef {import("./Levels.js").CampaignLevel & {
 *   runtime?: LevelRuntime;
 *   arena: import("./Levels.js").CampaignLevel["arena"] & {
 *     hazardRingStartRatio?: number;
 *     hazardRingDpsPerSec?: number;
 *   }
 * }} ResolvedLevel
 */

/**
 * @param {ResolvedLevel} level
 */
export function attachArenaHazardDefaults(level) {
  if (!level) {
    return;
  }
  const tier = HAZARD_PROFILES[level.id] ?? HAZARD_PROFILES.default;
  if (typeof level.arena.hazardRingStartRatio !== "number") {
    level.arena.hazardRingStartRatio = tier.startRatio;
  }
  if (typeof level.arena.hazardRingDpsPerSec !== "number") {
    level.arena.hazardRingDpsPerSec = tier.dpsPerSec;
  }
}

/**
 * Clone profundo de un nivel de campaña para poder mutar valores de carrera sin tocar definiciones fuente.
 * @param {import("./Levels.js").CampaignLevel | null | undefined} level
 * @returns {import("./Levels.js").CampaignLevel}
 */
export function cloneLevel(level) {
  if (!level) {
    return structuredClone(CAMPAIGN_LEVELS[0]);
  }

  try {
    return structuredClone(level);
  } catch {
    return structuredClone(getLevelById(1) || CAMPAIGN_LEVELS[0]);
  }
}

/**
 * Modifica valores de tiempo y objetivos según dificultad.
 * @param {ResolvedLevel} mutableLevel
 * @param {DifficultyId} difficulty
 */
export function applyDifficultyToLevel(mutableLevel, difficulty) {
  const scalars = DIFFICULTY_SCALARS[difficulty] || DIFFICULTY_SCALARS.normal;

  mutableLevel.timeLimit = Math.max(
    12,
    Math.round(mutableLevel.timeLimit * scalars.time),
  );
  mutableLevel.objectiveKills = Math.max(
    1,
    Math.ceil(mutableLevel.objectiveKills * scalars.objective),
  );

  const ringDps = mutableLevel.arena.hazardRingDpsPerSec ?? 0;
  if (ringDps > 0) {
    mutableLevel.arena.hazardRingDpsPerSec = ringDps * scalars.hazard;
  }

  mutableLevel.runtime = mutableLevel.runtime ?? {};
  mutableLevel.runtime.difficulty = difficulty;
  mutableLevel.runtime.eliteEvery = scalars.eliteEvery;

  const runtimeExtras = mutableLevel.runtime;
  runtimeExtras.spawnIntervalMultiplier = scalars.spawnInterval;
  runtimeExtras.spawnPhaseAggression = scalars.aggression;
  runtimeExtras.maxConcurrentBonus = scalars.concurrentBonus;
}

/**
 * Devuelve un nivel nuevo listo para gameplay.
 * @param {number | undefined} levelId
 * @param {DifficultyId} difficulty
 */
export function buildResolvedLevel(levelId, difficulty) {
  const base = /** @type {ResolvedLevel} */ (
    cloneLevel(getLevelById(levelId ?? 1) ?? undefined)
  );
  attachArenaHazardDefaults(base);
  applyDifficultyToLevel(base, difficulty);
  return base;
}
