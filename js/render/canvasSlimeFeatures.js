// @ts-check

/**
 * SLIME FEATURES AGGREGATOR
 * -----------------------------------------------------------------------------
 * Punto de entrada para el renderizado de rasgos faciales de slimes (Ojos y Bocas).
 * Delega la lógica en módulos especializados para mantener la cohesión.
 */

export { drawSlimeEyes } from "./sprites/slime/slime-eyes.js";
export { drawHeroMouth, drawFiendMouth } from "./sprites/slime/slime-mouths.js";
