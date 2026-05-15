// @ts-check

import { fillRandomFloat32 } from "../utils/SecureRandom.js";

/**
 * Capa ambiental procedural con Web Audio API (sin archivos externos).
 * Se activa tras gesto del usuario al entrar en gameplay para respetar autoplay.
 */
export class ArenaAmbientAudio {
  /** @type {AudioContext | null} */
  ctx = null;

  /** @type {GainNode | null} */
  master = null;

  /** Mezcla de salida solo para SFX rapidos; comparte el mismo AudioContext. */
  /** @type {GainNode | null} */
  sfxOutlet = null;

  /** Base calculada antes de multiplicadores de usuario. */
  /** @type {number} */
  baseAmbientGain = mix(0.028, 0.092, 0.55);

  /** @type {number} */
  ambientUserGain = 1;

  /** @type {(() => void)[]} */
  disposables = [];

  /**
   * @param {{
   *   levelId: number;
   *   ambientHeat: number;
   *   ambientUserVolume?: number;
   * }} profile
   *   ambientHeat en [0,1]: mas brasas/audio calido en reinos tipo Muspelheim.
   */
  async start(profile) {
    await this.stop();

    const win = globalThis.window;
    const winLegacy =
      /** @type {Window & { webkitAudioContext?: typeof AudioContext }} */ (
        /** @type {Object} */ (win)
      );
    const AC = globalThis.AudioContext || winLegacy?.webkitAudioContext;
    if (!AC) {
      return;
    }

    this.ctx = new AC();
    const ctx = this.ctx;

    try {
      await ctx.resume();
    } catch {
      return;
    }

    const heat = clamp01(profile.ambientHeat);
    this.baseAmbientGain = mix(0.028, 0.092, heat);
    this.ambientUserGain = clamp01(profile.ambientUserVolume ?? 1);

    this.sfxOutlet = ctx.createGain();
    this.sfxOutlet.gain.value = 1;
    this.sfxOutlet.connect(ctx.destination);

    this.master = ctx.createGain();
    this.master.gain.value = this.baseAmbientGain * this.ambientUserGain;
    this.master.connect(ctx.destination);

    this._createRumbleLayer(ctx, heat);
    this._createHissLayer(ctx, heat);
  }

  /**
   * @private
   * @param {AudioContext} ctx
   * @param {number} heat
   */
  _createRumbleLayer(ctx, heat) {
    const rumble = ctx.createOscillator();
    rumble.type = "sine";
    rumble.frequency.value = mix(36, 58, heat);
    rumble.detune.value = heat * -6;

    const rumbleGain = ctx.createGain();
    rumbleGain.gain.value = mix(0.45, 0.85, heat);

    const undertone = ctx.createOscillator();
    undertone.type = "triangle";
    undertone.frequency.value = rumble.frequency.value * 2;

    const underGain = ctx.createGain();
    underGain.gain.value = mix(0.08, 0.22, heat);

    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = mix(0.11, 0.24, heat);
    const lfoScale = ctx.createGain();
    lfoScale.gain.value = mix(9, 22, heat);

    lfo.connect(lfoScale);
    lfoScale.connect(rumble.detune);
    rumble.connect(rumbleGain);
    undertone.connect(underGain);

    if (this.master) {
      rumbleGain.connect(this.master);
      underGain.connect(this.master);
    }

    rumble.start();
    undertone.start();
    lfo.start();

    this.disposables.push(() => {
      rumble.stop();
      undertone.stop();
      lfo.stop();
      lfoScale.disconnect();
      rumbleGain.disconnect();
      underGain.disconnect();
      rumble.disconnect();
      undertone.disconnect();
      lfo.disconnect();
    });
  }

  /**
   * @private
   * @param {AudioContext} ctx
   * @param {number} heat
   */
  _createHissLayer(ctx, heat) {
    const hiss = ctx.createGain();
    hiss.gain.value = mix(0.012, 0.036, heat);

    const buffer = ctx.createBuffer(
      1,
      Math.floor(ctx.sampleRate * 4),
      ctx.sampleRate,
    );
    const raw = buffer.getChannelData(0);
    fillRandomFloat32(raw, 0.5);

    const hissSource = ctx.createBufferSource();
    hissSource.buffer = buffer;
    hissSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 0.76;
    filter.frequency.value = mix(1200, 2800, heat);

    hissSource.connect(filter);
    filter.connect(hiss);

    if (this.master) {
      hiss.connect(this.master);
    }

    hissSource.start();

    this.disposables.push(() => {
      hissSource.stop();
      hissSource.disconnect();
      filter.disconnect();
      hiss.disconnect();
    });
  }

  /**
   * @param {number} volume valor 0..1 del usuario para el sintetizado ambient.
   */
  setAmbientVolume(volume) {
    this.ambientUserGain = clamp01(volume);
    if (this.master?.gain) {
      this.master.gain.value = this.baseAmbientGain * this.ambientUserGain;
    }
  }

  /**
   * Punto para acoplar `SfxBus` sin abrir otro AudioContext.
   */
  getAudioBridge() {
    if (!this.ctx || !this.sfxOutlet) {
      return null;
    }

    return {
      context: this.ctx,
      sfxGain: this.sfxOutlet,
    };
  }

  async stop() {
    for (const dispose of this.disposables) {
      try {
        dispose();
      } catch {
        // ignore
      }
    }
    this.disposables = [];

    if (this.master) {
      try {
        this.master.disconnect();
      } catch {
        // ignore
      }
    }
    this.master = null;

    if (this.sfxOutlet) {
      try {
        this.sfxOutlet.disconnect();
      } catch {
        // ignore
      }
    }
    this.sfxOutlet = null;

    if (this.ctx) {
      try {
        await this.ctx.close();
      } catch {
        // ignore
      }
    }
    this.ctx = null;
  }
}

/**
 * @param {number} value
 * @returns {number}
 */
function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

/**
 * @param {number} a
 * @param {number} b
 * @param {number} t
 * @returns {number}
 */
function mix(a, b, t) {
  return a + (b - a) * clamp01(t);
}
