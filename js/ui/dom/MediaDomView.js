// @ts-check

/**
 * @typedef {import("../GameDomView.js").GameMediaRefs} GameMediaRefs
 * @typedef {import("../GameDomView.js").MediaState} MediaState
 */

export class MediaDomView {
  /**
   * @param {GameMediaRefs} refs
   * @param {HTMLElement} shell
   */
  constructor(refs, shell) {
    this.refs = refs;
    this.shell = shell;
    /** @type {MediaState} */
    this.lastState = { visible: false };
  }

  /**
   * @param {MediaState} state
   */
  apply(state) {
    const visible = Boolean(state.visible);
    const last = this.lastState;
    const { layer, video } = this.refs;

    if (last.visible !== visible) {
      layer.classList.toggle("is-hidden", !visible);
      this.shell.classList.toggle("is-trailer-shell", visible);

      if (!visible) {
        video.pause();
        delete layer.dataset.mode;
      }
    }

    if (!visible) {
      this.lastState = { visible };
      return;
    }

    const nextSource = state.src ?? "";

    if (last.src !== nextSource) {
      video.dataset.source = nextSource;
      video.src = nextSource;
      video.load();
    }

    const nextMode = state.mode ?? "media";
    if (last.mode !== nextMode) {
      layer.dataset.mode = nextMode;
    }

    const nextControls = Boolean(state.controls);
    const nextMuted = Boolean(state.muted);
    const nextLoop = Boolean(state.loop);

    if (last.controls !== nextControls) {
      video.controls = nextControls;
    }

    if (last.muted !== nextMuted) {
      video.muted = nextMuted;
    }

    if (last.loop !== nextLoop) {
      video.loop = nextLoop;
    }

    const nextLabel = state.label ?? "Media";
    if (last.label !== nextLabel) {
      video.setAttribute("aria-label", nextLabel);
    }

    video.playsInline = true;

    this.lastState = {
      ...state,
      visible,
      mode: nextMode,
      src: nextSource,
      controls: nextControls,
      muted: nextMuted,
      loop: nextLoop,
      label: nextLabel,
    };
  }
}
