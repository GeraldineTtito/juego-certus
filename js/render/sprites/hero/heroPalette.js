// @ts-check

import { adjustHexBrightness, blendHex } from "../../canvasColor.js";

/**
 * @param {import("../../../game/entities/Player.js").Player} player
 * @returns {{ slimeVivid: string; slimeHighlight: string; slimeDeep: string; slimeGlow: string }}
 */
export function prepareHeroPalette(player) {
  const palette = player.palette;
  const slimeVivid = blendHex(palette.primary, "#18ffc8", 0.52);
  const slimeHighlight = blendHex(palette.secondary, "#f0fff8", 0.45);
  const slimeDeep = adjustHexBrightness(slimeVivid, 0.52);
  const slimeGlow = blendHex(slimeHighlight, slimeVivid, 0.35);

  return { slimeVivid, slimeHighlight, slimeDeep, slimeGlow };
}
