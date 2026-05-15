// @ts-check

import { Storage } from "./storage.service.js";

/**
 * @typedef {ReturnType<typeof Storage.getCampaignState>} CampaignState
 */

/**
 * Partida con avance real (más allá del nivel 1 inicial) y campaña no cerrada.
 * @param {CampaignState} state
 */
export function hasMeaningfulProgress(state) {
  return state.unlockedLevel > 1 && !state.finishedCampaign;
}

export function getCampaignState() {
  return Storage.getCampaignState();
}

/** Nivel de campaña persistido como “cursor” actual. */
export function getCurrentProgressLevelId() {
  return Storage.getProgress();
}

/**
 * @param {{ levelId?: number }} [payload]
 */
export function resolveLevelIdFromPayloadOrProgress(payload) {
  const raw = payload?.levelId;
  if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) {
    return raw;
  }
  return getCurrentProgressLevelId();
}

/** Reinicia progreso de reinos/misiones conservando estadísticas de lifetime en `Storage`. */
export function resetCampaignProgress() {
  Storage.resetProgress();
}

/**
 * @param {number} levelId
 */
export function setCurrentCampaignLevel(levelId) {
  Storage.setCurrentLevel(levelId);
}

/**
 * @param {number} levelId
 */
export function unlockCampaignLevel(levelId) {
  Storage.unlockLevel(levelId);
}

/**
 * @param {number} levelId
 */
export function getAccumulatedKills(levelId) {
  return Storage.getAccumulatedKills(levelId);
}

/**
 * @param {number} levelId
 * @param {number} count
 */
export function setAccumulatedKills(levelId, count) {
  Storage.setAccumulatedKills(levelId, count);
}

export function recordRunStarted() {
  Storage.recordLifecycleStart();
}

/**
 * @param {number} levelId
 * @param {Record<string, Object | string | number | boolean | null>} summary
 */
export function markLevelCompleted(levelId, summary) {
  Storage.markLevelCompleted(levelId, summary);
}

export function markCampaignFinished() {
  Storage.markCampaignFinished();
}

/**
 * @param {{
 *   outcome: "win" | "defeat" | "timeout";
 *   flawless: boolean;
 *   summary: Record<string, Object | string | number | boolean | null>;
 * }} evt
 */
export function recordRunOutcome(evt) {
  Storage.recordRunOutcome({
    outcome: evt.outcome,
    flawless: evt.flawless,
    damageTaken: Number(evt.summary.damageTaken) || 0,
    damageDealt: Number(evt.summary.damageDealt) || 0,
  });
}
