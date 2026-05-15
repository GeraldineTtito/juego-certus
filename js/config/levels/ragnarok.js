// @ts-check
import { MEDIA_PATHS } from "../media-paths.config.js";
import { createEnemyPool } from "./factory.js";

/** @typedef {import("./types.js").CampaignLevel} CampaignLevel */

/** @type {CampaignLevel} */
export const RAGNAROK = {
  id: 5,
  realm: "Ragnarok",
  subtitle: "Anillo del quiebre",
  story:
    "No queda aire limpio ni margen. La tormenta final exige lectura espacial, agresion controlada y una ultima purga sin errores graves.",
  objectiveKills: 14,
  timeLimit: 54,
  arena: {
    radius: 22,
    fogHeight: 0.42,
  },
  visual: {
    bgImage: MEDIA_PATHS.backgrounds.ragnarok,
    skyTop: "#514f78",
    skyBottom: "#0c0a17",
    mist: "rgba(214, 218, 255, 0.12)",
    accent: "#dddfff",
    floorColor: "#1d1831",
    floorGlow: "#cfd2ff",
    rimColor: "#f2f4ff",
    particleColor: "#e2e3ff",
    sunColor: "#eef0ff",
    ambientHeat: 0.55,
    emberIntensity: 0.74,
  },
  player: {
    primary: "#e6c0ff",
    secondary: "#fff5ff",
    vivid: "#d167ff",
    light: "#ffffff",
  },
  enemies: createEnemyPool({
    slime: {
      bodyColor: "#8f79df",
      detailColor: "#f7ecff",
      damage: 17,
      health: 64,
    },
    draugr: {
      bodyColor: "#868ee3",
      detailColor: "#f1f4ff",
      health: 102,
      damage: 22,
      speed: 3.7,
    },
    beast: {
      bodyColor: "#8a74bb",
      detailColor: "#f6ebff",
      speed: 5.6,
      damage: 20,
    },
  }),
};
