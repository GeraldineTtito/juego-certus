// @ts-check
import { MEDIA_PATHS } from "../media-paths.config.js";
import { createEnemyPool } from "./factory.js";

/** @typedef {import("./types.js").CampaignLevel} CampaignLevel */

/** @type {CampaignLevel} */
export const MUSPELHEIM = {
  id: 4,
  realm: "Muspelheim",
  subtitle: "Foso de magma",
  story:
    "La piedra ya no absorbe golpes, solo devuelve fuego. El ritmo es brutal: camara estable, castigo corto y reposicion inmediata.",
  objectiveKills: 12,
  timeLimit: 58,
  arena: {
    radius: 21,
    fogHeight: 0.28,
  },
  visual: {
    bgImage: MEDIA_PATHS.backgrounds.muspelheim,
    skyTop: "#8c4928",
    skyBottom: "#190704",
    mist: "rgba(255, 166, 111, 0.16)",
    accent: "#ffc48d",
    floorColor: "#3b1810",
    floorGlow: "#ffb26f",
    rimColor: "#ffe1bc",
    particleColor: "#ffcf95",
    sunColor: "#ffd3a5",
    ambientHeat: 1,
    emberIntensity: 1,
  },
  player: {
    primary: "#ffd37d",
    secondary: "#fff9de",
    vivid: "#ffac47",
    light: "#ffffff",
  },
  enemies: createEnemyPool({
    slime: {
      bodyColor: "#f08f58",
      detailColor: "#ffe4cc",
      damage: 16,
      health: 60,
    },
    draugr: {
      bodyColor: "#a1563d",
      detailColor: "#ffd4b5",
      health: 96,
      damage: 20,
    },
    beast: {
      bodyColor: "#d3704a",
      detailColor: "#ffd1a8",
      speed: 5.45,
      damage: 18,
    },
  }),
};
