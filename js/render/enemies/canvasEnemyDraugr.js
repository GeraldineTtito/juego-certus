// @ts-check

import { drawGroundEnergyRing, drawSlashArc } from "../canvasWorldVfx.js";
import { buildDraugrPose } from "../sprites/enemies/draugr/draugrPose.js";
import {
  drawDraugrLegsAndBelt,
  drawDraugrTorso,
  drawDraugrCloak,
} from "../sprites/enemies/draugr/draugrBody.js";
import {
  drawDraugrShouldersAndArms,
  drawDraugrHead,
} from "../sprites/enemies/draugr/draugrFeatures.js";
import { drawDraugrWeapon } from "../sprites/enemies/draugr/draugrWeapon.js";

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {import("../../core/Camera.js").CameraLike} camera
 * @param {import("../../game/entities/Enemy.js").Enemy} enemy
 * @param {number} [elapsed]
 */
export function drawDraugrSprite(ctx, camera, enemy, elapsed = 0) {
  const pose = buildDraugrPose(enemy, elapsed);

  drawGroundEnergyRing(
    ctx,
    camera,
    enemy.position,
    enemy.radius * (enemy.elite ? 2.6 : 2.15),
    "#d4a046",
    pose.alpha * (enemy.elite ? 0.48 : 0.3),
    elapsed * 1.25 + enemy.motionPhase,
  );

  drawDraugrLegsAndBelt(ctx, camera, pose, enemy);
  drawDraugrTorso(ctx, camera, pose, enemy);
  drawDraugrCloak(ctx, camera, pose, enemy, elapsed);
  drawDraugrShouldersAndArms(ctx, camera, pose, enemy);
  drawDraugrHead(ctx, camera, pose, enemy);
  drawDraugrWeapon(ctx, camera, pose, enemy);

  if (enemy.attackPhase === "active") {
    drawSlashArc(
      ctx,
      camera,
      enemy.position,
      enemy.facingYaw,
      1.52,
      enemy.detailColor,
    );
  }
}
