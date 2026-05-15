// @ts-check

import {
  createDefaultSettings,
  loadUserSettings,
  parseReducedMotionOverrideValue,
  reducedMotionOverrideToFormValue,
  saveUserSettings,
} from "../services/user-settings.service.js";
import { Storage } from "../services/storage.service.js";

/**
 * Actualiza selects/checkbox del panel de preferencias desde un snapshot guardado en memoria.
 *
 * @param {import("./GameDomView.js").GameSettingsRefs} refs
 * @param {ReturnType<import("../services/user-settings.service.js").createDefaultSettings>} current
 */
export function applyUserSettingsToFormFields(refs, current) {
  if (refs.difficulty) {
    refs.difficulty.value = current.difficulty;
  }
  if (refs.mouseSensitivity) {
    refs.mouseSensitivity.value = String(current.mouseSensitivity);
  }
  if (refs.invertLookY) {
    refs.invertLookY.checked = current.invertLookY;
  }
  if (refs.ambientVolume) {
    refs.ambientVolume.value = String(current.ambientVolume);
  }
  if (refs.sfxVolume) {
    refs.sfxVolume.value = String(current.sfxVolume);
  }
  if (refs.musicVolume) {
    refs.musicVolume.value = String(current.musicVolume);
  }
  if (refs.highContrastHud) {
    refs.highContrastHud.checked = current.highContrastHud;
  }
  if (refs.reducedMotion) {
    refs.reducedMotion.value = reducedMotionOverrideToFormValue(
      current.reducedMotionOverride,
    );
  }
}

/**
 * Vincula eventos del formulario de ajustes (guardar, import/export, navegación).
 */
export class SettingsFormBinder {
  /**
   * @param {{
   *   ingestUserSettings: (snapshot: ReturnType<
   *     import("../services/user-settings.service.js").createDefaultSettings
   *   >) => void;
   *   navigateToMenu: () => void;
   * }} deps
   */
  constructor(deps) {
    this.ingestUserSettings = deps.ingestUserSettings;
    this.navigateToMenu = deps.navigateToMenu;
    /** @type {boolean} */
    this.bound = false;
    /** @type {Map<HTMLElement, { type: string, listener: EventListenerOrEventListenerObject }[]>} */
    this.handlers = new Map();
  }

  /**
   * @param {import("./GameDomView.js").GameSettingsRefs | undefined} refs
   */
  attachIfNeeded(refs) {
    if (!refs?.panel) {
      return;
    }

    if (this.bound) {
      applyUserSettingsToFormFields(refs, loadUserSettings());
      return;
    }

    applyUserSettingsToFormFields(refs, loadUserSettings());

    const persist = () => {
      if (
        !refs.difficulty ||
        !refs.mouseSensitivity ||
        !refs.ambientVolume ||
        !refs.sfxVolume
      ) {
        return;
      }

      const next = saveUserSettings({
        difficulty: /** @type {"easy"|"normal"|"hard"} */ (
          refs.difficulty.value
        ),
        mouseSensitivity: Number(refs.mouseSensitivity.value) || 1,
        invertLookY: Boolean(refs.invertLookY?.checked),
        ambientVolume: Number(refs.ambientVolume.value),
        sfxVolume: Number(refs.sfxVolume.value),
        musicVolume: refs.musicVolume ? Number(refs.musicVolume.value) : 0.75,
        highContrastHud: Boolean(refs.highContrastHud?.checked),
        reducedMotionOverride: parseReducedMotionOverrideValue(
          refs.reducedMotion?.value ?? "auto",
        ),
      });

      this.ingestUserSettings(next);

      if (refs.statusLine) {
        refs.statusLine.textContent = "Preferencias guardadas";
        globalThis.window.setTimeout(() => {
          if (refs.statusLine?.textContent === "Preferencias guardadas") {
            refs.statusLine.textContent = "";
          }
        }, 1600);
      }
    };

    this.setupEventListeners(refs, persist);

    this.bound = true;
  }

  /**
   * @private
   * @param {HTMLElement | null | undefined} element
   * @param {string} type
   * @param {EventListenerOrEventListenerObject} listener
   */
  addListener(element, type, listener) {
    if (!element) {
      return;
    }
    element.addEventListener(type, listener);
    if (!this.handlers.has(element)) {
      this.handlers.set(element, []);
    }
    this.handlers.get(element)?.push({ type, listener });
  }

  /**
   * @private
   * @param {import("./GameDomView.js").GameSettingsRefs} refs
   * @param {() => void} persist
   */
  setupEventListeners(refs, persist) {
    const {
      saveButton,
      resetButton,
      closeButton,
      exportButton,
      importField,
      importButton,
      statusLine,
    } = refs;

    this.addListener(saveButton, "click", () => persist());

    this.addListener(resetButton, "click", () => {
      const defaults = saveUserSettings(createDefaultSettings());
      this.ingestUserSettings(defaults);
      applyUserSettingsToFormFields(refs, defaults);
      if (statusLine) {
        statusLine.textContent = "Valores restaurados";
      }
    });

    this.addListener(closeButton, "click", () => this.navigateToMenu());

    this.addListener(exportButton, "click", () => {
      const payload = Storage.exportSaveString();
      if (importField) {
        importField.value = payload;
      }
      if (statusLine) {
        statusLine.textContent = "Copia generada en el campo de importación";
      }
    });

    this.addListener(importButton, "click", () => {
      if (!importField) {
        return;
      }

      const outcome = Storage.importSerializedSave(importField.value);
      if (statusLine) {
        statusLine.textContent = outcome.ok
          ? "Progreso importado"
          : "No se pudo importar";
      }
    });
  }

  /**
   * Libera todos los listeners vinculados.
   */
  detach() {
    for (const [element, listeners] of this.handlers.entries()) {
      for (const { type, listener } of listeners) {
        element.removeEventListener(type, listener);
      }
    }
    this.handlers.clear();
    this.bound = false;
  }

  /**
   * @param {import("./GameDomView.js").GameSettingsRefs | undefined} refs
   */
  refreshControls(refs) {
    if (!refs?.panel || !this.bound) {
      return;
    }

    applyUserSettingsToFormFields(refs, loadUserSettings());
  }
}
