// @ts-check

import { preloadImageResources } from "./image-cache.service.js";

/**
 * @param {string[]} urls
 * @returns {Promise<{ failed: string[] }>}
 */
export function preloadImages(urls) {
  const uniqueUrls = [...new Set(urls.filter(Boolean))];

  if (uniqueUrls.length === 0) {
    return Promise.resolve({ failed: [] });
  }

  return preloadImageResources(uniqueUrls);
}

/**
 * Precarga mínima para no bloquear el primer render.
 * @param {string} firstBackground
 */
export function preloadInitialBackground(firstBackground) {
  return preloadImages([firstBackground]);
}

/**
 * Precarga diferida del resto.
 * @param {string[]} backgrounds
 */
export function preloadRemainingBackgrounds(backgrounds) {
  // @ts-ignore - requestIdleCallback is not in all lib versions
  const ric = globalThis.requestIdleCallback;

  if (typeof ric === "function") {
    ric(() => {
      void preloadImages(backgrounds);
    });
  } else {
    globalThis.setTimeout(() => {
      void preloadImages(backgrounds);
    }, 300);
  }
}
