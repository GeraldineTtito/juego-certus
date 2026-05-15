// @ts-check

import { CAMPAIGN_LEVELS } from "../config/Levels.js";

/** @typedef {import("./storage.service.js").CampaignState} CampaignState */
/** @typedef {import("./storage.service.js").LifetimeStats} LifetimeStats */

/**
 * @param {unknown} rawState
 * @param {CampaignState} fallback
 * @returns {CampaignState}
 */
export function sanitizeState(rawState, fallback) {
  if (!rawState || typeof rawState !== "object") {
    return fallback;
  }

  // Cast para facilitar acceso interno después de validar que es objeto
  const blob = /** @type {Record<string, unknown>} */ (rawState);

  const currentLevel =
    typeof blob.currentLevel === "number" && isValidLevelId(blob.currentLevel)
      ? blob.currentLevel
      : fallback.currentLevel;

  const unlockedLevel =
    typeof blob.unlockedLevel === "number" &&
    isValidLevelId(blob.unlockedLevel) &&
    blob.unlockedLevel >= currentLevel
      ? blob.unlockedLevel
      : Math.max(currentLevel, fallback.unlockedLevel);

  return {
    currentLevel,
    unlockedLevel,
    completedLevels: sanitizeCompletedLevels(blob.completedLevels),
    accumulatedKills: sanitizeAccumulatedKills(blob.accumulatedKills),
    finishedCampaign: Boolean(blob.finishedCampaign),
    lifetime: sanitizeLifetime(blob.lifetime, fallback.lifetime),
  };
}

/**
 * @param {number} levelId
 * @returns {boolean}
 */
function isValidLevelId(levelId) {
  if (!Number.isInteger(levelId) || levelId <= 0) {
    return false;
  }
  // Validar contra la lista real de niveles de la campaña
  return CAMPAIGN_LEVELS.some((l) => l.id === levelId);
}

/**
 * @param {unknown} raw
 * @returns {Record<number, { completedAt: number }>}
 */
function sanitizeCompletedLevels(raw) {
  /** @type {Record<number, { completedAt: number }>} */
  const results = {};
  if (!raw || typeof raw !== "object") {
    return results;
  }

  for (const [key, value] of Object.entries(raw)) {
    const k = Number.parseInt(key, 10);
    if (isValidLevelId(k) && value && typeof value === "object") {
      const vBlob = /** @type {Record<string, unknown>} */ (value);
      results[k] = {
        completedAt: Number(vBlob.completedAt) || Date.now(),
      };
    }
  }
  return results;
}

/**
 * @param {unknown} raw
 * @returns {Record<number, number>}
 */
function sanitizeAccumulatedKills(raw) {
  /** @type {Record<number, number>} */
  const results = {};
  if (!raw || typeof raw !== "object") {
    return results;
  }

  for (const [key, value] of Object.entries(raw)) {
    const k = Number.parseInt(key, 10);
    const v = Number(value);

    if (isValidLevelId(k) && Number.isFinite(v) && v >= 0) {
      results[k] = Math.floor(v);
    }
  }
  return results;
}

/**
 * @param {unknown} blob
 * @param {LifetimeStats} fallback
 * @returns {LifetimeStats}
 */
function sanitizeLifetime(blob, fallback) {
  if (!blob || typeof blob !== "object") {
    return fallback;
  }

  const input = /** @type {Record<string, unknown>} */ (blob);
  /** @type {Record<string, number>} */
  const out = {};

  for (const key of Object.keys(fallback)) {
    const value = input[key];
    const n =
      typeof value === "number" && Number.isFinite(value)
        ? Math.max(0, value)
        : 0;
    out[key] = n;
  }
  return /** @type {LifetimeStats} */ (/** @type {Object} */ (out));
}
