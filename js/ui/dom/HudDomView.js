// @ts-check

/**
 * @typedef {import("../GameDomView.js").GameHudRefs} GameHudRefs
 * @typedef {import("../GameDomView.js").HudState} HudState
 */

export class HudDomView {
  /**
   * @param {GameHudRefs} refs
   * @param {HTMLElement} shell
   */
  constructor(refs, shell) {
    this.refs = refs;
    this.shell = shell;
    /** @type {HudState} */
    this.lastState = {};
  }

  /**
   * @param {HudState & { healthPct?: number }} state
   */
  apply(state) {
    const visible = Boolean(state.visible);
    const last = this.lastState;

    if (last.visible !== visible) {
      this.toggleVisibility(visible);
    }

    if (!visible) {
      this.lastState = { visible };
      return;
    }

    this.updateText(state, last);

    if (this.refs.healthFill && last.healthPct !== state.healthPct) {
      this.refs.healthFill.style.width = `${state.healthPct ?? 100}%`;
    }

    if (last.timeCritical !== state.timeCritical) {
      this.refs.timePanel?.classList.toggle(
        "is-time-critical",
        Boolean(state.timeCritical),
      );
    }
    if (last.healthPulse !== state.healthPulse) {
      this.refs.vitalityWrapper?.classList.toggle(
        "is-hurt-pulse",
        Boolean(state.healthPulse),
      );
    }

    this.lastState = { ...state, visible };
  }

  /**
   * @private
   * @param {boolean} visible
   */
  toggleVisibility(visible) {
    this.refs.panel.classList.toggle("is-hidden", !visible);
    this.refs.timePanel?.classList.toggle("is-hidden", !visible);
    this.refs.vitalityWrapper?.classList.toggle("is-hidden", !visible);
    this.shell.classList.toggle("is-gameplay-shell", visible);
  }

  /**
   * @private
   * @param {HudState} state
   * @param {HudState} last
   */
  updateText(state, last) {
    const refs = this.refs;
    const updates = [
      { ref: refs.level, val: state.level, last: last.level },
      { ref: refs.objective, val: state.objective, last: last.objective },
      { ref: refs.health, val: state.health, last: last.health },
      { ref: refs.time, val: state.time, last: last.time },
      { ref: refs.status, val: state.status, last: last.status },
    ];

    for (const { ref, val, last: lVal } of updates) {
      if (ref && val !== lVal) {
        ref.textContent = val ?? "";
      }
    }
  }
}
