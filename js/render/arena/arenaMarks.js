// @ts-check
import { hexToRgba } from "../canvasColor.js";
import { polarPoint } from "../canvasGeometry.js";
import { drawProjectedLine } from "../canvasProjectedPrimitives.js";

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {import("../../game/GameWorld.js").GameWorld} world
 */
export function drawArenaMarks(ctx, world) {
  const ringRadius = world.level.arena.radius * 0.62;
  const marks = 12;
  const visual = world.level.visual;
  const pulse = Math.sin(world.elapsed * 2.2) * 0.5 + 0.5;

  for (let index = 0; index < marks; index += 1) {
    const angle = (index / marks) * Math.PI * 2 + world.elapsed * 0.04;
    const start = polarPoint(ringRadius - 0.55, angle, 0.02);
    const end = polarPoint(ringRadius + 0.55, angle, 0.02);

    ctx.save();
    ctx.shadowColor = hexToRgba(
      visual.accent,
      0.42 + pulse * 0.28 * (visual?.emberIntensity ?? 0.65),
    );
    ctx.shadowBlur =
      14 + (visual?.ambientHeat ?? 0.5) * 10 + (index % 3 === 0 ? 4 : 0);
    drawProjectedLine(
      ctx,
      world.camera,
      start,
      end,
      2.8,
      hexToRgba(visual.accent, 0.32 + pulse * 0.12),
    );
    ctx.restore();
  }

  const center = world.camera.project({ x: 0, y: 0.03, z: 0 });
  if (!center) {
    return;
  }

  const coreGlow = ctx.createRadialGradient(
    center.x,
    center.y,
    4,
    center.x,
    center.y,
    12 + pulse * 4,
  );
  coreGlow.addColorStop(0, hexToRgba(visual.rimColor, 0.82));
  coreGlow.addColorStop(0.45, hexToRgba(visual.floorGlow, 0.52 + pulse * 0.22));
  coreGlow.addColorStop(1, hexToRgba(visual.accent, 0));

  ctx.fillStyle = coreGlow;
  ctx.beginPath();
  ctx.arc(center.x, center.y, 12 + pulse * 3.5, 0, Math.PI * 2);
  ctx.fill();
}
