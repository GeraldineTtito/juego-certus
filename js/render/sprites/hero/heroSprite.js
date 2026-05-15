// @ts-check

import { directionFromYaw } from "../../../game/Vector3.js";
import { drawSoftBloom } from "../../canvasProjectedPrimitives.js";
import { buildHeroPose } from "../../hero/hero-pose-builder.js";
import {
  getHeroMotionState,
  getHeroAlpha,
} from "../../hero/hero-motion-logic.js";
import {
  drawHeroBodyWithHull,
  drawHeroBubbles,
  drawHeroCrownDrips,
  drawHeroCrest,
  drawHeroOrbitalDrone,
  drawHeroOrnaments,
} from "./heroBody.js";
import { drawHeroFace, drawHeroExpression } from "./heroFace.js";
import { drawHeroAppendages } from "./heroWeapon.js";
import { drawHeroReactiveEffects } from "./heroEffects.js";
import { prepareHeroPalette } from "./heroPalette.js";

/**
 * @typedef {import("./heroTypes.js").HeroRenderState} HeroRenderState
 */

/**
 * Silueta gel organica (capa hull) + brazos/baston gelatinosos.
 * Responsabilidad unica: modelo visual del slime heroe.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {import("../../canvasOrganicBlob.js").CameraLike} camera
 * @param {import("../../../game/entities/Player.js").Player} player
 * @param {number} [elapsed]
 */
export function drawHeroSprite(ctx, camera, player, elapsed = 0) {
  const facing = directionFromYaw(player.facingYaw);
  const side = {
    x: Math.cos(player.facingYaw),
    y: 0,
    z: -Math.sin(player.facingYaw),
  };
  const motion = getHeroMotionState(player, elapsed);
  const alpha = getHeroAlpha(player);
  const pose = buildHeroPose(player, side, facing, motion);
  const { slimeVivid, slimeHighlight, slimeDeep, slimeGlow } =
    prepareHeroPalette(player);

  /** @type {HeroRenderState} */
  const heroRenderState = {
    alpha,
    attackPhase: player.attackPhase ?? null,
    dodgeStretch: player.state === "dodge" ? 0.19 : 0,
    elapsed,
    facing,
    gelPhase: elapsed * 2.08,
    motion,
    pose,
    side,
    slimeDeep,
    slimeHighlight,
    slimeVivid,
  };

  // 1. Blooms de fondo
  drawSoftBloom(
    ctx,
    camera,
    { x: pose.core.x, y: pose.core.y - 0.35, z: pose.core.z },
    1.15,
    slimeHighlight,
    alpha * 0.32,
  );
  drawSoftBloom(
    ctx,
    camera,
    { x: pose.crown.x, y: pose.crown.y + 0.05, z: pose.crown.z },
    0.48,
    slimeVivid,
    alpha * 0.26,
  );

  // 2. Cuerpo y Hull
  drawHeroBodyWithHull(ctx, camera, heroRenderState, slimeGlow);
  drawHeroBubbles(ctx, camera, heroRenderState);
  drawHeroCrownDrips(ctx, camera, heroRenderState);
  drawHeroCrest(ctx, camera, pose, slimeVivid, alpha);
  drawHeroOrbitalDrone(ctx, camera, heroRenderState);

  // 3. Cara y detalles estéticos
  drawHeroFace(ctx, camera, heroRenderState);
  drawHeroOrnaments(ctx, camera, heroRenderState);

  // 5. Apéndices y efectos
  drawHeroAppendages(ctx, camera, heroRenderState);
  drawHeroExpression(ctx, camera, heroRenderState);
  drawHeroReactiveEffects(ctx, camera, player, pose.core, slimeHighlight);
}
