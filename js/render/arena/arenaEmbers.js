// @ts-check
import { hexToRgba } from "../canvasColor.js";

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {import("../../game/GameWorld.js").GameWorld} world
 */
export function drawArenaEmbers(ctx, world) {
  const { camera, level, elapsed } = world;
  const visual = level.visual;
  const heat = visual?.emberIntensity ?? 0.65;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  for (const ember of world.arenaEmbers) {
    const radialWobble = Math.sin(ember.wobble) * 0.18;
    const position = {
      x: Math.sin(ember.angle + radialWobble) * ember.radius,
      y: ember.height * 0.65,
      z: Math.cos(ember.angle + radialWobble) * ember.radius,
    };

    const projection = camera.project(position);
    if (!projection) {
      continue;
    }

    const flicker = 0.45 + Math.sin(ember.phase * 18 + elapsed * 26) * 0.34;
    const radiusScreen = Math.max(
      1.2,
      projection.scale * ember.size * (1 + heat * 0.45) * flicker,
    );

    const halo = ctx.createRadialGradient(
      projection.x - radiusScreen * 0.4,
      projection.y - radiusScreen * 0.6,
      radiusScreen * 0.06,
      projection.x,
      projection.y - radiusScreen * 0.1,
      radiusScreen * (1 + heat),
    );

    halo.addColorStop(
      0,
      hexToRgba("#fff8e9", Math.min(0.95 * flicker + heat * 0.06, 0.98)),
    );
    halo.addColorStop(0.4, hexToRgba(visual.rimColor, 0.5 * flicker));
    halo.addColorStop(0.78, hexToRgba(visual.floorGlow, 0.28 * flicker));
    halo.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(projection.x, projection.y, radiusScreen, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
