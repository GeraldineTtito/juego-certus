// @ts-check

import {
  randomBetween,
  randomBoolean,
  randomInt,
} from "../utils/SecureRandom.js";

const CONFETTI_COLORS = [
  "#bfe8ff",
  "#f3fbff",
  "#ffd700",
  "#ffb347",
  "#a8e6cf",
  "#dfe6e9",
  "#74b9ff",
  "#fdcb6e",
  "#ffffff",
];

export class CongratsModal {
  /**
   * @param {HTMLDialogElement} dialogEl
   * @param {HTMLElement} canvasHostEl
   * @param {HTMLElement} titleEl
   * @param {HTMLElement} realmEl
   * @param {HTMLButtonElement} nextBtnEl
   */
  constructor(dialogEl, canvasHostEl, titleEl, realmEl, nextBtnEl) {
    this.dialog = dialogEl;
    this.canvasHost = canvasHostEl;
    this.titleEl = titleEl;
    this.realmEl = realmEl;
    this.nextBtn = nextBtnEl;
    this.canvas = document.createElement("canvas");
    this.canvasHost.replaceChildren(this.canvas);
    this.ctx = /** @type {CanvasRenderingContext2D} */ (
      this.canvas.getContext("2d")
    );
    /** @type {Array<{x:number,y:number,size:number,color:string,speed:number,drift:number,rotation:number,rotSpeed:number,isRect:boolean}>} */
    this.particles = [];
    /** @type {number|null} */
    this.rafId = null;
  }

  /**
   * @param {number} levelId
   * @param {string} realm
   * @param {() => void} onNext
   */
  show(levelId, realm, onNext) {
    this.titleEl.textContent = `¡Felicidades por completar el nivel ${levelId}!`;
    this.realmEl.textContent = realm;

    this.#resizeCanvas();
    this.#spawnParticles();
    this.#startAnimation();

    this.dialog.showModal();

    this.nextBtn.addEventListener(
      "click",
      () => {
        this.#close();
        onNext();
      },
      { once: true },
    );

    this.nextBtn.focus();
  }

  #close() {
    this.dialog.close();
    this.#stopAnimation();
  }

  #resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  #spawnParticles() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.particles = Array.from({ length: 150 }, () => ({
      x: randomBetween(0, w),
      y: randomBetween(-0.4 * h, 0.6 * h),
      size: randomBetween(4, 14),
      color: CONFETTI_COLORS[randomInt(CONFETTI_COLORS.length)],
      speed: randomBetween(1.2, 4.2),
      drift: randomBetween(-1.1, 1.1),
      rotation: randomBetween(0, Math.PI * 2),
      rotSpeed: randomBetween(-0.1, 0.1),
      isRect: randomBoolean(0.58),
    }));
  }

  #startAnimation() {
    const tick = () => {
      const { width, height } = this.canvas;
      this.ctx.clearRect(0, 0, width, height);

      for (const p of this.particles) {
        p.y += p.speed;
        p.x += p.drift;
        p.rotation += p.rotSpeed;

        if (p.y > height + 16) {
          p.y = -16;
          p.x = randomBetween(0, width);
        }

        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rotation);
        this.ctx.globalAlpha = 0.9;
        this.ctx.fillStyle = p.color;

        if (p.isRect) {
          this.ctx.fillRect(
            -p.size * 0.5,
            -p.size * 0.28,
            p.size,
            p.size * 0.56,
          );
        } else {
          this.ctx.beginPath();
          this.ctx.arc(0, 0, p.size * 0.44, 0, Math.PI * 2);
          this.ctx.fill();
        }

        this.ctx.restore();
      }

      this.rafId = requestAnimationFrame(tick);
    };

    this.rafId = requestAnimationFrame(tick);
  }

  #stopAnimation() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
