// @ts-check

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {import("./types.js").CameraLike} camera
 * @param {{ x: number; y: number; z: number }} start
 * @param {{ x: number; y: number; z: number }} end
 * @param {number} lineWidth
 * @param {string} color
 */
export function drawProjectedLine(ctx, camera, start, end, lineWidth, color) {
  const startProjection = camera.project(start);
  const endProjection = camera.project(end);
  if (!startProjection || !endProjection) {
    return;
  }

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(startProjection.x, startProjection.y);
  ctx.lineTo(endProjection.x, endProjection.y);
  ctx.stroke();
}
