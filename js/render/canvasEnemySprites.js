// @ts-check

import { drawSlimeEnemySprite } from "./enemies/canvasEnemySlime.js";
import { drawDraugrSprite } from "./enemies/canvasEnemyDraugr.js";
import { drawBeastSprite } from "./enemies/canvasEnemyBeast.js";

/**
 * Modelos proyectados de enemigos por tipo (slime, draugr, bestia).
 * Responsabilidad unica: orquestar el renderizado segun el modelo del NPC.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {import("./canvasOrganicBlob.js").CameraLike} camera
 * @param {import("../game/entities/Enemy.js").Enemy} enemy
 * @param {number} [elapsed]
 */
export function drawEnemySprite(ctx, camera, enemy, elapsed = 0) {
  if (enemy.model === "draugr") {
    drawDraugrSprite(ctx, camera, enemy, elapsed);
    return;
  }

  if (enemy.model === "beast") {
    drawBeastSprite(ctx, camera, enemy, elapsed);
    return;
  }

  drawSlimeEnemySprite(ctx, camera, enemy, elapsed);
}
