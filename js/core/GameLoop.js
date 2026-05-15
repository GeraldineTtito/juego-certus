// @ts-check

/**
 * @typedef {{
 *   update: (deltaTime: number) => void;
 *   render: () => void;
 *   fixedStepMs?: number;
 * }} GameLoopOptions
 */

export class GameLoop {
  /**
   * @param {GameLoopOptions} options
   */
  constructor({ update, render, fixedStepMs = 1000 / 60 }) {
    this.update = update;
    this.render = render;
    this.fixedStepMs = fixedStepMs;
    this.accumulator = 0;
    this.running = false;
    this.lastTime = 0;
    this.rafId = 0;

    this.tick = this.tick.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);

    document.addEventListener("visibilitychange", this.handleVisibilityChange);
  }

  handleVisibilityChange() {
    if (document.hidden) {
      this.stop();
    } else {
      this.start();
    }
  }

  start() {
    if (this.running) {
      return;
    }

    this.running = true;
    this.lastTime = performance.now();
    this.render();
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop() {
    if (!this.running) {
      return;
    }

    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  destroy() {
    this.stop();
    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange,
    );
  }

  /**
   * @param {DOMHighResTimeStamp} now
   */
  tick(now) {
    if (!this.running) {
      return;
    }

    const deltaMs = Math.min(250, now - this.lastTime);
    this.lastTime = now;
    this.advance(deltaMs);
    this.rafId = requestAnimationFrame(this.tick);
  }

  /**
   * @param {number} deltaMs
   */
  advance(deltaMs) {
    this.accumulator += Math.max(0, deltaMs);

    let safety = 0;
    while (this.accumulator >= this.fixedStepMs && safety < 12) {
      this.update(this.fixedStepMs / 1000);
      this.accumulator -= this.fixedStepMs;
      safety += 1;
    }

    if (safety >= 12) {
      this.accumulator = 0;
    }

    this.render();
  }
}
