// @ts-check

/**
 * Servicio centralizado para la carga y caché de imágenes.
 * Desacopla la gestión de recursos de la lógica de renderizado.
 */

/** @type {Map<string, HTMLImageElement>} */
const cache = new Map();

/**
 * Recupera una imagen de la caché si está cargada y lista.
 * @param {string} src URL del recurso.
 * @returns {HTMLImageElement | null}
 */
export function getCachedImage(src) {
  if (!src) {
    return null;
  }
  const img = cache.get(src);
  if (!img?.complete || !img.naturalWidth) {
    return null;
  }
  return img;
}

/**
 * Carga un conjunto de imágenes y las almacena en la caché.
 * @param {Iterable<string>} urls Lista de URLs a precargar.
 * @returns {Promise<{ failed: string[] }>}
 */
export function preloadImageResources(urls) {
  const unique = [...new Set([...urls].filter(Boolean))].map(String);
  return Promise.all(
    unique.map(
      (url) =>
        new Promise((resolve) => {
          if (cache.has(url)) {
            resolve({ ok: /** @type {const} */ (true), url });
            return;
          }
          const img = new Image();
          img.onload = () => {
            cache.set(url, img);
            resolve({ ok: /** @type {const} */ (true), url });
          };
          img.onerror = () => {
            resolve({ ok: /** @type {const} */ (false), url });
          };
          img.src = url;
        }),
    ),
  ).then((results) => {
    const failed = results.filter((r) => !r.ok).map((r) => r.url);
    return { failed };
  });
}

/**
 * Limpia la caché de imágenes para liberar memoria.
 */
export function clearImageCache() {
  cache.clear();
}
