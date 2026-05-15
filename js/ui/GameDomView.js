// @ts-check

import { HudDomView } from "./dom/HudDomView.js";
import { OverlayDomView } from "./dom/OverlayDomView.js";
import { MediaDomView } from "./dom/MediaDomView.js";

/**
 * Sincroniza el shell DOM (HUD, overlay, capa media, panel de ajustes) con el estado
 * expuesto por las escenas. Mantiene GameApp delgado en la orquestación.
 *
 * @typedef {{
 *   panel: HTMLElement;
 *   vitalityWrapper: HTMLElement | null;
 *   healthFill: HTMLElement | null;
 *   level: HTMLElement | null;
 *   objective: HTMLElement | null;
 *   health: HTMLElement | null;
 *   time: HTMLElement | null;
 *   timePanel: HTMLElement | null;
 *   status: HTMLElement | null;
 * }} GameHudRefs
 *
 * @typedef {{
 *   panel: HTMLElement;
 *   kicker: HTMLElement | null;
 *   title: HTMLElement | null;
 *   body: HTMLElement | null;
 *   list: HTMLElement | null;
 *   primaryButton: HTMLElement | null;
 *   secondaryButton: HTMLElement | null;
 *   tertiaryButton: HTMLElement | null;
 * }} GameOverlayRefs
 *
 * @typedef {{
 *   layer: HTMLElement;
 *   video: HTMLVideoElement;
 * }} GameMediaRefs
 *
 * @typedef {{
 *   panel: HTMLElement | null;
 *   difficulty: HTMLSelectElement | null;
 *   mouseSensitivity: HTMLInputElement | null;
 *   invertLookY: HTMLInputElement | null;
 *   ambientVolume: HTMLInputElement | null;
 *   sfxVolume: HTMLInputElement | null;
 *   musicVolume: HTMLInputElement | null;
 *   highContrastHud: HTMLInputElement | null;
 *   reducedMotion: HTMLSelectElement | null;
 *   saveButton: HTMLElement | null;
 *   resetButton: HTMLElement | null;
 *   closeButton: HTMLElement | null;
 *   exportButton: HTMLElement | null;
 *   importField: HTMLTextAreaElement | null;
 *   importButton: HTMLElement | null;
 *   statusLine: HTMLElement | null;
 * }} GameSettingsRefs
 */

/**
 * @typedef {Object} HudState
 * @property {boolean} [visible]
 * @property {string} [level]
 * @property {string} [objective]
 * @property {string} [health]
 * @property {string} [time]
 * @property {string} [status]
 * @property {number} [healthPct]
 * @property {boolean} [timeCritical]
 * @property {boolean} [healthPulse]
 */

/**
 * @typedef {Object} OverlayState
 * @property {boolean} visible
 * @property {string} [kicker]
 * @property {string} [title]
 * @property {string} [body]
 * @property {string[]} [details]
 * @property {string} [primaryLabel]
 * @property {string} [secondaryLabel]
 * @property {string} [tertiaryLabel]
 * @property {boolean} [showSecondary]
 * @property {boolean} [showTertiary]
 */

/**
 * @typedef {Object} MediaState
 * @property {boolean} visible
 * @property {string} [mode]
 * @property {string} [src]
 * @property {boolean} [controls]
 * @property {boolean} [muted]
 * @property {boolean} [loop]
 * @property {string} [label]
 */

export class GameDomView {
  /**
   * @param {{
   *   hudRefs: GameHudRefs;
   *   overlayRefs: GameOverlayRefs;
   *   mediaRefs: GameMediaRefs;
   *   shellElement: HTMLElement;
   *   settingsRefs: GameSettingsRefs | undefined;
   *   getCurrentSceneName: () => string | undefined;
   * }} bundle
   */
  constructor({
    hudRefs,
    overlayRefs,
    mediaRefs,
    shellElement,
    settingsRefs,
    getCurrentSceneName,
  }) {
    this.hud = new HudDomView(hudRefs, shellElement);
    this.overlay = new OverlayDomView(overlayRefs, getCurrentSceneName);
    this.media = new MediaDomView(mediaRefs, shellElement);

    this.settingsRefs = settingsRefs;
    this.getCurrentSceneName = getCurrentSceneName;
  }

  /**
   * @param {HudState & { healthPct?: number }} state
   */
  applyHudState(state) {
    this.hud.apply(state);
  }

  /**
   * @param {OverlayState} state
   */
  applyOverlayState(state) {
    this.overlay.apply(state);
  }

  /**
   * @param {MediaState} state
   */
  applyMediaState(state) {
    this.media.apply(state);
  }

  /** @param {{ visible?: boolean; showTertiary?: boolean; tertiaryLabel?: string }} [state] */
  refreshShellLayout(state) {
    const settingsOpen = this.getCurrentSceneName() === "settings";

    if (this.settingsRefs?.panel) {
      this.settingsRefs.panel.classList.toggle("is-hidden", !settingsOpen);
    }

    const { tertiaryButton } = this.overlay.refs;
    if (tertiaryButton) {
      const showTertiary = Boolean(state?.showTertiary) && !settingsOpen;
      tertiaryButton.hidden = !showTertiary;
      if (state?.tertiaryLabel) {
        tertiaryButton.textContent = state.tertiaryLabel;
      }
    }
  }
}
