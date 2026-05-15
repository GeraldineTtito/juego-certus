// @ts-check
import { MEDIA_PATHS } from "../media-paths.config.js";
import { createEnemyPool } from "./factory.js";

/** @typedef {import("./types.js").CampaignLevel} CampaignLevel */

/** @type {CampaignLevel} */
export const ALFHEIM = {
  id: 2,
  realm: "Alfheim",
  subtitle: "Camara de la luz rota",
  story:
    "Los puentes del lago de luz cayeron hace siglos. Quedan restos marmoreos, reflejos violentos y enemigos que castigan cualquier pausa.",
  objectiveKills: 8,
  timeLimit: 70,
  arena: {
    radius: 18.5,
    fogHeight: 0.34,
  },
  visual: {
    bgImage: MEDIA_PATHS.backgrounds.alfheim,
    skyTop: "#b8d4ff",
    skyBottom: "#1a366b",
    mist: "rgba(244, 247, 197, 0.16)",
    accent: "#fff1bb",
    floorColor: "#223f37",
    floorGlow: "#fbf1a3",
    rimColor: "#fffee0",
    particleColor: "#fff9ce",
    sunColor: "#fff8dd",
    ambientHeat: 0.3,
    emberIntensity: 0.52,
  },
  player: {
    primary: "#9aeed5",
    secondary: "#ffffff",
    vivid: "#67ffcc",
    light: "#ffffff",
  },
  enemies: createEnemyPool({
    slime: {
      bodyColor: "#79d7b5",
      detailColor: "#f7fff9",
      speed: 4.25,
    },
    draugr: {
      bodyColor: "#c8b76c",
      detailColor: "#fff5cb",
      damage: 17,
    },
    beast: {
      bodyColor: "#b79c6a",
      detailColor: "#fff0c4",
    },
  }),
};
