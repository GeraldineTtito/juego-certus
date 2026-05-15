// @ts-check
import { hexToRgba } from "../canvasColor.js";
import { polarPoint } from "../canvasGeometry.js";
import { drawCapsule, drawOrb } from "../canvasProjectedPrimitives.js";
import { drawGroundShadow } from "../canvasWorldVfx.js";

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {import("../../game/GameWorld.js").GameWorld} world
 */
export function drawArenaProps(ctx, world) {
  const props = [];
  const count = 10;
  for (let index = 0; index < count; index += 1) {
    const angle = (index / count) * Math.PI * 2 + world.level.id * 0.17;
    const base = polarPoint(world.level.arena.radius - 0.8, angle, 0);
    const projection = world.camera.project({ x: base.x, y: 1.4, z: base.z });

    props.push({ base, depth: projection?.depth ?? 0 });
  }

  props.sort((left, right) => right.depth - left.depth);
  for (const prop of props) {
    drawPillar(ctx, world.camera, prop.base, world.level.visual, world.elapsed);
  }
}

/**
 * @typedef {import("../arena/arena-helpers.js").ArenaVisual} ArenaVisual
 * @typedef {import("../../core/Camera.js").CameraLike} CameraLike
 */

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {CameraLike} camera
 * @param {{ x: number; y: number; z: number }} base
 * @param {ArenaVisual} visual
 * @param {number} [elapsed]
 */
export function drawPillar(ctx, camera, base, visual, elapsed = 0) {
  const shaftTop = { x: base.x, y: 2.4, z: base.z };
  drawGroundShadow(ctx, camera, base, 0.72, "rgba(0, 0, 0, 0.26)");
  drawCapsule(
    ctx,
    camera,
    base,
    shaftTop,
    0.24,
    hexToRgba(visual.rimColor, 0.68),
    0.92,
  );
  const heatValue = visual?.ambientHeat ?? 0;
  const pulse =
    heatValue > 0.75
      ? 0.12 + Math.sin(elapsed * 4.8 + base.x + base.z) * 0.08
      : 0;

  drawOrb(
    ctx,
    camera,
    { x: base.x, y: 2.62, z: base.z },
    0.32 + pulse * 0.15,
    visual.accent,
    visual.rimColor,
    0.74 + pulse * 0.9,
  );
}
