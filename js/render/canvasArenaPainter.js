// @ts-check

/**
 * Orquestador de la arena: delega el dibujado de suelo, marcas, brasas y props
 * a sus respectivos módulos especializados en la carpeta ./arena/
 */

import { getProjectedRing } from "./canvasGeometry.js";
import { renderArenaFloor, renderArenaRim } from "./arena/arenaFloor.js";
export { drawArenaEmbers } from "./arena/arenaEmbers.js";
export { drawArenaMarks } from "./arena/arenaMarks.js";
export { drawArenaProps, drawPillar } from "./arena/arenaProps.js";

/**
 * @param {{ ctx: CanvasRenderingContext2D; width: number; height: number }} canvasState
 * @param {import("../game/GameWorld.js").GameWorld} world
 */
export function drawArena(canvasState, world) {
  const { camera, level, elapsed } = world;
  const radius = level.arena.radius;
  const visual = level.visual;

  const fillPoints = getProjectedRing(camera, radius, 52, 0);
  if (fillPoints.length < 3) {
    return;
  }

  // Calcular métricas básicas una vez
  let centroidX = 0,
    centroidY = 0;
  for (const p of fillPoints) {
    centroidX += p.x;
    centroidY += p.y;
  }
  centroidX /= fillPoints.length;
  centroidY /= fillPoints.length;

  let rimSpan = 0;
  for (const p of fillPoints) {
    rimSpan = Math.max(rimSpan, Math.hypot(p.x - centroidX, p.y - centroidY));
  }

  const metrics = { centroidX, centroidY, rimSpan };
  const renderState = {
    camera,
    elapsed,
    heatPulse: Math.sin(elapsed * 2.05) * 0.5 + 0.5,
    levelId: level.id,
    radius,
    visual,
  };

  renderArenaFloor(canvasState.ctx, canvasState, renderState, metrics);
  renderArenaRim(canvasState.ctx, renderState, metrics);
}
