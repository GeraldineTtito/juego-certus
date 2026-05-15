// @ts-check

/**
 * Conversión de color y utilidades hex para el renderer 2D.
 * Responsabilidad única: transformaciones de color (sin dibujo).
 */

/**
 * @param {string} hex
 * @param {number} alpha
 */
export function hexToRgba(hex, alpha) {
  const { r, g, b } = parseRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** @param {number} value */
export function clampChannel(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

/**
 * @param {string} hex
 * @returns {{ r: number; g: number; b: number }}
 */
function parseRgb(hex) {
  const normalized = hex.replace("#", "");
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;
  const num = Number.parseInt(expanded, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Interpola RGB entre dos hex (#rrggbb). t=0 devuelve a, t=1 devuelve b.
 * Sirve para empujar el verde/azul del slime hacia tonos vivo sin depender solo del nivel.
 *
 * @param {string} hexA
 * @param {string} hexB
 * @param {number} t01
 */
export function blendHex(hexA, hexB, t01) {
  const clampT = Math.max(0, Math.min(1, t01));
  const a = parseRgb(hexA);
  const b = parseRgb(hexB);
  const r = clampChannel(a.r + (b.r - a.r) * clampT);
  const g = clampChannel(a.g + (b.g - a.g) * clampT);
  const bCh = clampChannel(a.b + (b.b - a.b) * clampT);
  return `#${((1 << 24) + (r << 16) + (g << 8) + bCh).toString(16).slice(1)}`;
}

/**
 * Oscurece o aclara un hex (#rrggbb) para sombras y capas de material.
 * @param {string} hex
 * @param {number} factor
 */
export function adjustHexBrightness(hex, factor) {
  const { r, g, b } = parseRgb(hex);
  const red = clampChannel(r * factor);
  const green = clampChannel(g * factor);
  const blue = clampChannel(b * factor);
  return `#${((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1)}`;
}
