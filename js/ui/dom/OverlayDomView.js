// @ts-check

/**
 * @typedef {import("../GameDomView.js").GameOverlayRefs} GameOverlayRefs
 * @typedef {import("../GameDomView.js").OverlayState} OverlayState
 */

export class OverlayDomView {
  /**
   * @param {GameOverlayRefs} refs
   * @param {() => string | undefined} getCurrentSceneName
   */
  constructor(refs, getCurrentSceneName) {
    this.refs = refs;
    this.getCurrentSceneName = getCurrentSceneName;
    /** @type {OverlayState} */
    this.lastState = { visible: false };
  }

  /**
   * @param {OverlayState} state
   */
  apply(state) {
    const settingsOpen = this.getCurrentSceneName() === "settings";
    const visible = Boolean(state.visible);
    const last = this.lastState;

    if (settingsOpen) {
      return;
    }

    if (last.visible !== visible) {
      this.refs.panel.classList.toggle("is-hidden", !visible);
    }

    if (!visible) {
      this.lastState = { visible };
      return;
    }

    this.updateText(state, last);
    this.updateList(state.details || [], last.details || []);
    this.updateButtons(state, last);

    this.lastState = {
      ...state,
      visible,
      details: Array.isArray(state.details) ? [...state.details] : [],
    };
  }

  /**
   * @private
   * @param {OverlayState} state
   * @param {OverlayState} last
   */
  updateText(state, last) {
    const refs = this.refs;
    const updates = [
      { ref: refs.kicker, val: state.kicker, last: last.kicker },
      { ref: refs.title, val: state.title, last: last.title },
      { ref: refs.body, val: state.body, last: last.body },
      {
        ref: refs.primaryButton,
        val: state.primaryLabel,
        last: last.primaryLabel,
        def: "Continuar",
      },
    ];

    for (const { ref, val, last: lVal, def } of updates) {
      if (ref && val !== lVal) {
        ref.textContent = val ?? (def || "");
      }
    }
  }

  /**
   * @private
   * @param {string[]} details
   * @param {string[]} lastDetails
   */
  updateList(details, lastDetails) {
    const listRef = this.refs.list;
    if (!listRef) {
      return;
    }

    const current = Array.isArray(details) ? details : [];
    const last = Array.isArray(lastDetails) ? lastDetails : [];

    const changed =
      current.length !== last.length || current.some((d, i) => d !== last[i]);
    if (changed) {
      listRef.replaceChildren(
        ...current.map((detail) => {
          const item = document.createElement("li");
          item.textContent = detail;
          return item;
        }),
      );
    }
  }

  /**
   * @private
   * @param {OverlayState} state
   * @param {OverlayState} last
   */
  updateButtons(state, last) {
    const { secondaryButton, tertiaryButton } = this.refs;

    if (
      secondaryButton &&
      (last.showSecondary !== state.showSecondary ||
        last.secondaryLabel !== state.secondaryLabel)
    ) {
      secondaryButton.hidden = !state.showSecondary;
      secondaryButton.textContent = state.secondaryLabel ?? "";
    }

    if (
      tertiaryButton &&
      (last.showTertiary !== state.showTertiary ||
        last.tertiaryLabel !== state.tertiaryLabel)
    ) {
      tertiaryButton.hidden = !state.showTertiary;
      tertiaryButton.textContent = state.tertiaryLabel ?? "";
    }
  }
}
