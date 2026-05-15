// @ts-check

import { MIDGARD } from "./levels/midgard.js";
import { ALFHEIM } from "./levels/alfheim.js";
import { HELHEIM } from "./levels/helheim.js";
import { MUSPELHEIM } from "./levels/muspelheim.js";
import { RAGNAROK } from "./levels/ragnarok.js";

/** @typedef {import("./levels/types.js").CampaignLevel} CampaignLevel */
/** @typedef {import("./levels/types.js").EnemyTemplate} EnemyTemplate */

/**
 * AGREGADOR DE NIVELES DE CAMPAÑA
 * -----------------------------------------------------------------------------
 * Consolida la configuración de todos los reinos para facilitar su acceso.
 */

export const CAMPAIGN_LEVELS = [
  MIDGARD,
  ALFHEIM,
  HELHEIM,
  MUSPELHEIM,
  RAGNAROK,
];

const LEVEL_BY_ID = new Map(CAMPAIGN_LEVELS.map((level) => [level.id, level]));

/**
 * @param {number} levelId
 * @returns {CampaignLevel | null}
 */
export function getLevelById(levelId) {
  return /** @type {CampaignLevel | null} */ (LEVEL_BY_ID.get(levelId) ?? null);
}

/**
 * @param {number} levelId
 * @returns {number | null}
 */
export function getNextLevelId(levelId) {
  const currentIndex = CAMPAIGN_LEVELS.findIndex(
    (level) => level.id === levelId,
  );
  if (currentIndex < 0 || currentIndex === CAMPAIGN_LEVELS.length - 1) {
    return null;
  }

  return CAMPAIGN_LEVELS[currentIndex + 1].id;
}
