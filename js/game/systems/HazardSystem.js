// @ts-check

/**
 * @typedef {import("../entities/Player.js").Player} Player
 * @typedef {import("../../config/GameplayRuntime.js").ResolvedLevel} ResolvedLevel
 */

/**
 * Aplica daño ambiental al jugador si se encuentra fuera de los límites seguros de la arena.
 *
 * @param {Object} params
 * @param {number} params.deltaTime
 * @param {Player} params.player
 * @param {ResolvedLevel} params.level
 * @param {number} params.hazardDebt
 * @param {import("../../audio/SfxBus.js").SfxBus | null} params.sfx
 * @returns {{ damageTaken: number; hudPainPulse: number; hazardDebt: number }}
 */
export function applyEnvironmentalHazard({
  deltaTime,
  player,
  level,
  hazardDebt,
  sfx,
}) {
  const { arena } = level;
  const startRatio = arena.hazardRingStartRatio ?? 0.934;
  const dpsRaw = arena.hazardRingDpsPerSec ?? 0;

  let totalDamageTaken = 0;
  let hudPainPulse = 0;
  let newHazardDebt = hazardDebt;

  if (!Number.isFinite(dpsRaw) || dpsRaw <= 0) {
    return { damageTaken: 0, hudPainPulse: 0, hazardDebt: 0 };
  }

  const distance = Math.hypot(player.position.x, player.position.z);
  const thresh = arena.radius * startRatio;
  const outside = distance > thresh - player.radius * 0.2;

  if (!outside) {
    return { damageTaken: 0, hudPainPulse: 0, hazardDebt: 0 };
  }

  /** @type {number} */
  const pressure =
    typeof level.visual.ambientHeat === "number"
      ? 0.6 + Math.min(level.visual.ambientHeat * 0.56, 0.94)
      : 1;

  newHazardDebt += deltaTime * dpsRaw * pressure;
  if (newHazardDebt < 0.52) {
    return { damageTaken: 0, hudPainPulse: 0, hazardDebt: newHazardDebt };
  }

  const pulses = Math.min(5, Math.floor(newHazardDebt));
  if (pulses <= 0) {
    return { damageTaken: 0, hudPainPulse: 0, hazardDebt: newHazardDebt };
  }

  newHazardDebt -= pulses;
  if (player.invulnerabilityRemaining > 0 || player.dead) {
    return { damageTaken: 0, hudPainPulse: 0, hazardDebt: newHazardDebt };
  }

  if (player.applyAuraDamage(pulses)) {
    totalDamageTaken = pulses;
    hudPainPulse = 0.26;
    sfx?.play("tick");
  }

  return {
    damageTaken: totalDamageTaken,
    hudPainPulse,
    hazardDebt: newHazardDebt,
  };
}
