// @ts-check
import { MEDIA_PATHS } from "../media-paths.config.js";
import { createEnemyPool } from "./factory.js";

/** @typedef {import("./types.js").CampaignLevel} CampaignLevel */

/** @type {CampaignLevel} */
export const MIDGARD = {
  id: 1,
  realm: "Midgard",
  subtitle: "Ruinas del hielo",
  story:
    "La primera arena de guerra queda medio enterrada bajo nieve, hierro y runas fracturadas. Asegura el paso antes de que los reinos interiores caigan.",
  objectiveKills: 6,
  timeLimit: 75,
  arena: {
    radius: 17,
    fogHeight: 0.4,
  },
  visual: {
    bgImage: MEDIA_PATHS.backgrounds.midgard,
    skyTop: "#7da0c4",
    skyBottom: "#111c2e",
    mist: "rgba(180, 218, 255, 0.18)",
    accent: "#d8f2ff",
    floorColor: "#243d44",
    floorGlow: "#8dd6ea",
    rimColor: "#e7fbff",
    particleColor: "#d9f6ff",
    sunColor: "#f3fbff",
    ambientHeat: 0.22,
    emberIntensity: 0.45,
  },
  player: {
    primary: "#81e6bf",
    secondary: "#eafff9",
    vivid: "#4fffbb",
    light: "#ffffff",
  },
  enemies: createEnemyPool(),
};
