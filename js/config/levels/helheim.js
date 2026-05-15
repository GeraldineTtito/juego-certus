// @ts-check
import { MEDIA_PATHS } from "../media-paths.config.js";
import { createEnemyPool } from "./factory.js";

/** @typedef {import("./types.js").CampaignLevel} CampaignLevel */

/** @type {CampaignLevel} */
export const HELHEIM = {
  id: 3,
  realm: "Helheim",
  subtitle: "Patio de los espectros",
  story:
    "Helheim no descansa. Los cuerpos no terminan de caer y la niebla consume la lectura de distancia. Castiga antes de dejarte rodear.",
  objectiveKills: 10,
  timeLimit: 64,
  arena: {
    radius: 20,
    fogHeight: 0.5,
  },
  visual: {
    bgImage: MEDIA_PATHS.backgrounds.helheim,
    skyTop: "#56736c",
    skyBottom: "#071217",
    mist: "rgba(141, 255, 220, 0.12)",
    accent: "#9cffdd",
    floorColor: "#1a2b27",
    floorGlow: "#8ef2c7",
    rimColor: "#dbfff0",
    particleColor: "#aefce0",
    sunColor: "#cffff0",
    ambientHeat: 0.36,
    emberIntensity: 0.62,
  },
  player: {
    primary: "#a4ffe0",
    secondary: "#f6fff9",
    vivid: "#00ff9d",
    light: "#ffffff",
  },
  enemies: createEnemyPool({
    slime: {
      bodyColor: "#57af89",
      detailColor: "#e7fff7",
      damage: 14,
    },
    draugr: {
      bodyColor: "#5a9082",
      detailColor: "#d9fff5",
      health: 90,
      damage: 18,
    },
    beast: {
      bodyColor: "#7f8f80",
      detailColor: "#ecffe8",
      speed: 5.3,
    },
  }),
};
