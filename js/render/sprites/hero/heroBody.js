// @ts-check

/**
 * AGREGADOR DE CUERPO DEL HÉROE
 * -----------------------------------------------------------------------------
 * Consolida los módulos de renderizado del cuerpo (hull, ornamentos, efectos).
 */

export { drawHeroBodyWithHull } from "./hero-hull.js";
export { drawHeroOrnaments, drawHeroCrest } from "./hero-ornaments.js";
export {
  drawHeroBubbles,
  drawHeroCrownDrips,
  drawHeroOrbitalDrone,
} from "./hero-effects.js";
