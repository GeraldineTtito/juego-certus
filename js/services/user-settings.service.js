// @ts-check

/**
 * @typedef {Object | string | number | boolean | null} JSONValue
 */

/** @typedef {"easy" | "normal" | "hard"} DifficultyId */

const STORAGE_KEY = "furia_slime_settings_v1";

/** @typedef {ReturnType<typeof createDefaultSettings>} UserSettingsPayload */

export function createDefaultSettings() {
  return {
    /** @type {DifficultyId} */
    difficulty: "normal",
    mouseSensitivity: 1,
    invertLookY: false,
    ambientVolume: 0.92,
    sfxVolume: 0.85,
    /** Mezcla sobre el sintetizado ambient (no sustituye pistas musicales). */
    musicVolume: 0.82,
    highContrastHud: false,
    /** Override explícito; null = usar prefers-reduced-motion del SO. */
    reducedMotionOverride: /** @type {boolean | null} */ (null),
  };
}

/** @returns {boolean} */
export function systemPrefersReducedMotion() {
  const matchMedia = globalThis.window?.matchMedia;
  if (matchMedia === undefined) {
    return false;
  }
  return matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** @param {JSONValue} value */
export function normalizeReducedMotionOverride(value) {
  if (value === true) {
    return true;
  }

  if (value === false) {
    return false;
  }

  return null;
}

/** @param {JSONValue} value */
export function reducedMotionOverrideToFormValue(value) {
  const normalized = normalizeReducedMotionOverride(value);
  if (normalized === true) {
    return "on";
  }

  if (normalized === false) {
    return "off";
  }

  return "auto";
}

/** @param {JSONValue} value */
export function parseReducedMotionOverrideValue(value) {
  if (value === "on") {
    return true;
  }

  if (value === "off") {
    return false;
  }

  return null;
}

/** @returns {boolean} */
export function isReducedMotionActive(settings = loadUserSettings()) {
  const override = normalizeReducedMotionOverride(
    settings.reducedMotionOverride,
  );
  if (override !== null) {
    return override;
  }
  return systemPrefersReducedMotion();
}

/** @returns {UserSettingsPayload} */
export function loadUserSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createDefaultSettings();
    }
    const parsed = JSON.parse(raw);
    return sanitizeSettings(parsed);
  } catch {
    return createDefaultSettings();
  }
}

/** @param {JSONValue} parsed */
export function sanitizeSettings(parsed) {
  const base = createDefaultSettings();
  if (!parsed || typeof parsed !== "object") {
    return base;
  }

  const d = /** @type {Record<string, JSONValue>} */ (parsed);

  const difficultyRaw = d.difficulty;
  const difficulty = /** @type {DifficultyId} */ (
    difficultyRaw === "easy" ||
    difficultyRaw === "normal" ||
    difficultyRaw === "hard"
      ? difficultyRaw
      : base.difficulty
  );

  return {
    difficulty,
    mouseSensitivity: clampNumber(
      d.mouseSensitivity,
      0.45,
      2.2,
      base.mouseSensitivity,
    ),
    invertLookY: Boolean(d.invertLookY),
    ambientVolume: clampNumber(d.ambientVolume, 0, 1, base.ambientVolume),
    sfxVolume: clampNumber(d.sfxVolume, 0, 1, base.sfxVolume),
    musicVolume: clampNumber(d.musicVolume, 0, 1, base.musicVolume),
    highContrastHud: Boolean(d.highContrastHud),
    reducedMotionOverride: normalizeReducedMotionOverride(
      d.reducedMotionOverride,
    ),
  };
}

/** @param {UserSettingsPayload} payload */
export function saveUserSettings(payload) {
  const sanitized = sanitizeSettings(payload);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  } catch {
    /* ignore quota */
  }
  return sanitized;
}

/**
 * @param {JSONValue} value
 * @param {number} min
 * @param {number} max
 * @param {number} fallback
 */
function clampNumber(value, min, max, fallback) {
  const n =
    typeof value === "number" && Number.isFinite(value) ? value : fallback;
  return Math.min(max, Math.max(min, n));
}
