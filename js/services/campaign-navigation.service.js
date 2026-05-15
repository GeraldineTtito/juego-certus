// @ts-check

import {
  hasMeaningfulProgress,
  resetCampaignProgress,
  setCurrentCampaignLevel,
} from "../services/CampaignProgress.js";

/**
 * @typedef {import("../services/CampaignProgress.js").CampaignState} CampaignState
 */

/**
 * Resuelve la navegación desde el menú principal (progreso, trailer vs historia, ajustes).
 * Centraliza mutaciones de `Storage` para no duplicar reglas en la escena.
 *
 * @param {string} action p.ej. "primary" | "secondary" | "tertiary"
 * @param {CampaignState} state
 * @returns {{
 *   kind: "navigate";
 *   scene: string;
 *   payload: Record<string, unknown>;
 *   syncStateFromStorage: boolean;
 * }}
 */
export function resolveMenuNavigation(action, state) {
  const hasProgress = hasMeaningfulProgress(state);

  if (action === "tertiary") {
    return {
      kind: "navigate",
      scene: "settings",
      payload: {},
      syncStateFromStorage: false,
    };
  }

  if (action === "secondary" && hasProgress) {
    resetCampaignProgress();
    setCurrentCampaignLevel(1);
    return {
      kind: "navigate",
      scene: "trailer",
      payload: { levelId: 1 },
      syncStateFromStorage: true,
    };
  }

  const targetLevel = hasProgress ? state.currentLevel : 1;
  if (!hasProgress) {
    resetCampaignProgress();
  }
  setCurrentCampaignLevel(targetLevel);
  const nextScene = hasProgress ? "story" : "trailer";
  return {
    kind: "navigate",
    scene: nextScene,
    payload: { levelId: targetLevel },
    syncStateFromStorage: false,
  };
}
