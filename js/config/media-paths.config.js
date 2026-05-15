// @ts-check

/**
 * @file media-paths.config.js
 * @description Centralized asset paths for the "Furia del Slime" project.
 */

export const ASSET_BASE_PATH = "./assets";

export const MEDIA_PATHS = Object.freeze({
  trailer: `${ASSET_BASE_PATH}/videos/trailer.mp4`,
  trailerPoster: `${ASSET_BASE_PATH}/images/posters/trailer-poster.webp`,

  fonts: {
    cormorant: `${ASSET_BASE_PATH}/fonts/cormorant-garamond-latin.woff2`,
    manrope: `${ASSET_BASE_PATH}/fonts/manrope-latin.woff2`,
  },

  backgrounds: {
    midgard: `${ASSET_BASE_PATH}/images/backgrounds/bg_midgard.webp`,
    alfheim: `${ASSET_BASE_PATH}/images/backgrounds/bg_alfheim.webp`,
    helheim: `${ASSET_BASE_PATH}/images/backgrounds/bg_helheim.webp`,
    muspelheim: `${ASSET_BASE_PATH}/images/backgrounds/bg_muspelheim.webp`,
    ragnarok: `${ASSET_BASE_PATH}/images/backgrounds/bg_ragnarok.webp`,
    menu: `${ASSET_BASE_PATH}/images/backgrounds/bg_menu.webp`,
  },
});
