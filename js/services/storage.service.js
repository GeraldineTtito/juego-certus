import { sanitizeState as externalSanitize } from "./storage-sanitizer.service.js";

/**
 * @typedef {Object | string | number | boolean | null} JSONValue
 */

/**
 * @typedef {Object} LifetimeStats
 * @property {number} runsStarted
 * @property {number} defeats
 * @property {number} timeouts
 * @property {number} completions
 * @property {number} flawlessWins
 * @property {number} totalDamageTaken
 * @property {number} totalEnemyDamageDealt
 */

/**
 * @typedef {Object} CampaignState
 * @property {number} currentLevel
 * @property {number} unlockedLevel
 * @property {Record<number, { completedAt: number }>} completedLevels
 * @property {Record<number, number>} accumulatedKills
 * @property {boolean} finishedCampaign
 * @property {LifetimeStats} lifetime
 */

const STORAGE_KEY = "furia_slime_campaign_v2";

/** @returns {CampaignState} */
function createDefaultState() {
  return {
    currentLevel: 1,
    unlockedLevel: 1,
    completedLevels: {},
    accumulatedKills: {},
    finishedCampaign: false,
    lifetime: createDefaultLifetime(),
  };
}

function createDefaultLifetime() {
  return {
    runsStarted: 0,
    defeats: 0,
    timeouts: 0,
    completions: 0,
    flawlessWins: 0,
    totalDamageTaken: 0,
    totalEnemyDamageDealt: 0,
  };
}

/**
 * @param {unknown} rawState
 * @returns {CampaignState}
 */
function sanitizeState(rawState) {
  return externalSanitize(rawState, createDefaultState());
}

function readState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? sanitizeState(JSON.parse(raw)) : createDefaultState();
  } catch {
    return createDefaultState();
  }
}

/**
 * @param {ReturnType<typeof createDefaultState>} state
 */
function writeState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Fallback silencioso
  }
}

const MAX_SAVE_IMPORT_CHARS = 50_000;

export class Storage {
  static getCampaignState() {
    return readState();
  }

  static getProgress() {
    return readState().currentLevel;
  }

  /**
   * @param {number} levelId
   */
  static setCurrentLevel(levelId) {
    const state = readState();
    writeState(
      sanitizeState({
        ...state,
        currentLevel: levelId,
        unlockedLevel: Math.max(state.unlockedLevel, levelId),
      }),
    );
  }

  /**
   * @param {number} levelId
   */
  static unlockLevel(levelId) {
    const state = readState();
    writeState(
      sanitizeState({
        ...state,
        unlockedLevel: Math.max(state.unlockedLevel, levelId),
      }),
    );
  }

  /**
   * @param {number} levelId
   * @param {Record<string, JSONValue>} summary
   */
  static markLevelCompleted(levelId, summary = {}) {
    const state = readState();
    const completedLevels = {
      ...state.completedLevels,
      [levelId]: {
        ...summary,
        completedAt: Date.now(),
      },
    };

    // Clear accumulated kills when a level is actually completed
    const accumulatedKills = { ...state.accumulatedKills };
    delete accumulatedKills[levelId];

    writeState(
      sanitizeState({
        ...state,
        completedLevels,
        accumulatedKills,
      }),
    );
  }

  /**
   * @param {number} levelId
   * @returns {number}
   */
  static getAccumulatedKills(levelId) {
    const state = readState();
    return state.accumulatedKills[levelId] || 0;
  }

  /**
   * @param {number} levelId
   * @param {number} count
   */
  static setAccumulatedKills(levelId, count) {
    const state = readState();
    writeState(
      sanitizeState({
        ...state,
        accumulatedKills: {
          ...state.accumulatedKills,
          [levelId]: count,
        },
      }),
    );
  }

  static markCampaignFinished() {
    const state = readState();
    writeState(
      sanitizeState({
        ...state,
        finishedCampaign: true,
        currentLevel: 1,
        unlockedLevel: 1,
      }),
    );
  }

  static resetProgress() {
    const prior = readState();
    writeState({
      ...createDefaultState(),
      lifetime: prior.lifetime ?? createDefaultLifetime(),
    });
  }

  static recordLifecycleStart() {
    const state = readState();
    const lifetime = state.lifetime ?? createDefaultLifetime();
    lifetime.runsStarted += 1;
    writeState(sanitizeState({ ...state, lifetime }));
  }

  /**
   * @param {Object} evt
   * @param {string} evt.outcome
   * @param {number} evt.damageTaken
   * @param {number} evt.damageDealt
   * @param {boolean} [evt.flawless]
   */
  static recordRunOutcome(evt) {
    const state = readState();
    const lifetime = { ...state.lifetime };

    const damageTaken = Number(evt.damageTaken) || 0;
    const damageDealt = Number(evt.damageDealt) || 0;

    lifetime.totalDamageTaken += damageTaken;
    lifetime.totalEnemyDamageDealt += damageDealt;

    if (evt.outcome === "defeat") {
      lifetime.defeats += 1;
    }
    if (evt.outcome === "timeout") {
      lifetime.timeouts += 1;
    }
    if (evt.outcome === "win") {
      lifetime.completions += 1;
      if (evt.flawless && damageTaken <= 0) {
        lifetime.flawlessWins += 1;
      }
    }

    writeState(sanitizeState({ ...state, lifetime }));
  }

  /** @returns {ReturnType<typeof createDefaultLifetime>} */
  static getLifetimeStats() {
    const state = readState();
    return state.lifetime ?? createDefaultLifetime();
  }

  /**
   * @returns {{
   *   version: number;
   *   exportedAt: string;
   *   campaign: Record<string, JSONValue>;
   * }}
   */
  static exportSavePayload() {
    return {
      version: 2,
      exportedAt: new Date().toISOString(),
      campaign: readState(),
    };
  }

  /** @param {string} serialized */
  static importSerializedSave(serialized) {
    try {
      if (typeof serialized !== "string") {
        return { ok: false, reason: "invalid_input" };
      }

      if (serialized.length > MAX_SAVE_IMPORT_CHARS) {
        return { ok: false, reason: "payload_too_large" };
      }

      const decoded = JSON.parse(serialized);

      if (!decoded || typeof decoded !== "object") {
        return { ok: false, reason: "invalid_json" };
      }

      let campaign = decoded.campaign;

      if (
        decoded.currentLevel !== undefined &&
        decoded.completedLevels !== undefined &&
        decoded.unlockedLevel !== undefined &&
        decoded.accumulatedKills !== undefined
      ) {
        campaign = decoded;
      }

      if (!campaign || typeof campaign !== "object") {
        return { ok: false, reason: "missing_campaign_blob" };
      }

      writeState(
        sanitizeState(/** @type {Record<string, JSONValue>} */ (campaign)),
      );

      return { ok: true };
    } catch {
      return { ok: false, reason: "parse_error" };
    }
  }

  /** @returns {string} */
  static exportSaveString() {
    return JSON.stringify(Storage.exportSavePayload(), null, 2);
  }
}
