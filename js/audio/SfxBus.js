// @ts-check

/**
 * Golpes/sirenas cortos via osciladores.
 * Se acopla al AudioContext procedural si existe en gameplay.
 */
export class SfxBus {
  /** @type {AudioContext | null} */
  sharedCtx = null;

  /** @type {GainNode | null} */
  sharedGain = null;

  /** @type {AudioContext | null} */
  fallbackCtx = null;

  /** @type {GainNode | null} */
  fallbackGain = null;

  /** @type {number} */
  volumeMultiplier = 0.85;

  /** @type {number | null} */
  closeTimerId = null;

  /**
   * @param {AudioContext | null} ctx
   * @param {GainNode | null} sfxGain debe estar conectado al destino
   */
  attachShared(ctx, sfxGain = null) {
    this.sharedCtx = ctx;
    this.sharedGain = sfxGain;
    this.applyGainVolumes();
    this.invalidateCloseTimer();
  }

  detachShared() {
    this.sharedCtx = null;
    this.sharedGain = null;
  }

  /**
   * @param {number} value 0..1
   */
  setVolumeMultiplier(value) {
    this.volumeMultiplier = Math.min(1, Math.max(0, value));
    this.applyGainVolumes();
  }

  reset() {
    this.invalidateCloseTimer();
    this.detachShared();
    try {
      this.fallbackGain?.disconnect();
    } catch {
      // noop
    }
    this.fallbackGain = null;
    closeAudioContextSilently(this.fallbackCtx);
    this.fallbackCtx = null;
  }

  /**
   * @param {"enemy-hit"|"player-hit"|"dodge"|"spawn"|"victory"|"defeat"|"tick"} preset
   */
  play(preset) {
    const routed = this.resolveSink();
    if (!routed) {
      return;
    }

    const { ctx, gain } = routed;
    resumeAudioContextSilently(ctx);

    const now = ctx.currentTime;

    /** @type {Record<string, { osc: OscillatorType; freq: number; dur: number; peak: number; slide?: number }[]>} */
    const bank = {
      "enemy-hit": [
        {
          osc: "square",
          freq: 640,
          dur: 0.08,
          peak: 0.16,
          slide: -220,
        },
      ],
      "player-hit": [
        {
          osc: "triangle",
          freq: 150,
          dur: 0.18,
          peak: 0.22,
          slide: -105,
        },
      ],
      dodge: [{ osc: "sine", freq: 740, dur: 0.12, peak: 0.12, slide: 150 }],
      spawn: [{ osc: "triangle", freq: 305, dur: 0.1, peak: 0.08 }],
      victory: [{ osc: "sine", freq: 520, dur: 0.22, peak: 0.12 }],
      defeat: [{ osc: "triangle", freq: 170, dur: 0.32, peak: 0.16 }],
      tick: [{ osc: "sine", freq: 860, dur: 0.02, peak: 0.035 }],
    };

    /** @typedef {{ osc: OscillatorType; freq: number; dur: number; peak: number; slide?: number }} SfxVoice */
    /** @type {SfxVoice[]} */
    const voices = bank[preset] ?? [
      { osc: "sine", freq: 520, dur: 0.08, peak: 0.055 },
    ];

    for (const voice of voices) {
      const oscillator = ctx.createOscillator();
      oscillator.type = voice.osc;
      oscillator.frequency.setValueAtTime(voice.freq, now);

      const env = ctx.createGain();
      const peak = scaledPeak(voice.peak * (0.5 + this.volumeMultiplier * 0.5));
      env.gain.setValueAtTime(0.0001, now);
      env.gain.linearRampToValueAtTime(peak, now + 0.012);
      env.gain.exponentialRampToValueAtTime(0.0001, now + voice.dur);

      if (voice.slide) {
        const targetFreq = Math.max(60, voice.freq + voice.slide);
        oscillator.frequency.exponentialRampToValueAtTime(
          targetFreq,
          now + voice.dur,
        );
      }

      oscillator.connect(env);
      env.connect(gain);

      oscillator.onended = () => {
        try {
          env.disconnect();
          oscillator.disconnect();
        } catch {
          // already disconnected or ctx closed
        }
      };

      oscillator.start(now);
      oscillator.stop(now + voice.dur + 0.025);
    }

    if (routed.usesFallback && !this.sharedCtx) {
      this.armFallbackCloseTimer();
    }
  }

  applyGainVolumes() {
    const value = boosted(this.volumeMultiplier);
    const nodes = /** @type {(GainNode | null)[]} */ ([
      this.sharedGain,
      this.fallbackGain,
    ]);
    for (const gain of nodes) {
      if (gain) {
        gain.gain.value = value;
      }
    }
  }

  /** @returns {{ ctx: AudioContext; gain: GainNode; usesFallback: boolean } | null} */
  resolveSink() {
    if (this.sharedCtx && this.sharedGain) {
      return {
        ctx: this.sharedCtx,
        gain: this.sharedGain,
        usesFallback: false,
      };
    }

    const win = globalThis.window;
    const winLegacy =
      /** @type {Window & { webkitAudioContext?: typeof AudioContext }} */ (
        /** @type {Object} */ (win)
      );
    const AC = globalThis.AudioContext || winLegacy?.webkitAudioContext;

    if (!AC) {
      return null;
    }

    if (!this.fallbackCtx) {
      this.fallbackCtx = new AC();
    }

    const ctx = this.fallbackCtx;
    if (!this.fallbackGain) {
      this.fallbackGain = ctx.createGain();
      this.applyGainVolumes();
      this.fallbackGain.connect(ctx.destination);
    }

    return { ctx, gain: this.fallbackGain, usesFallback: true };
  }

  armFallbackCloseTimer() {
    if (this.closeTimerId) {
      globalThis.clearTimeout(this.closeTimerId);
    }

    this.closeTimerId = globalThis.setTimeout(() => {
      if (this.sharedCtx) {
        return;
      }

      try {
        this.fallbackGain?.disconnect();
      } catch {
        // noop
      }
      this.fallbackGain = null;
      closeAudioContextSilently(this.fallbackCtx);
      this.fallbackCtx = null;
      this.closeTimerId = null;
    }, 1200);
  }

  invalidateCloseTimer() {
    if (this.closeTimerId) {
      globalThis.clearTimeout(this.closeTimerId);
      this.closeTimerId = null;
    }
  }
}

/** @param {number} volume */
function boosted(volume) {
  return Math.min(1.2, volume * 1.06 + 0.02);
}

/** @param {number} peak */
function scaledPeak(peak) {
  return Math.min(0.42, peak);
}

/** @param {AudioContext | null} ctx */
function closeAudioContextSilently(ctx) {
  ctx?.close().catch(() => {
    // noop
  });
}

/** @param {AudioContext} ctx */
function resumeAudioContextSilently(ctx) {
  ctx.resume().catch(() => {
    // noop
  });
}
