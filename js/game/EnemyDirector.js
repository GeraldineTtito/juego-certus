// @ts-check

import { randomBetween } from "./Random.js";
import {
  SPAWN_CONFIG,
  DIFFICULTY_AGGRESSION,
  SURVIVAL_PRESSURE,
  PHASE_SCALARS,
} from "../config/spawn.config.js";

export class EnemyDirector {
  /**
   * @param {import("../config/GameplayRuntime.js").ResolvedLevel} level
   */
  constructor(level) {
    this.level = level;
    /** @type {number} */
    const intervalMul = level.runtime?.spawnIntervalMultiplier ?? 1;
    /** @type {number} */
    const aggressionMul = level.runtime?.spawnPhaseAggression ?? 1;

    const baseSpawn = SPAWN_CONFIG.calculateBaseInterval(level.id);
    const difficultyScalar =
      DIFFICULTY_AGGRESSION[level.runtime?.difficulty || "normal"] || 1;

    this.spawnInterval =
      Math.max(
        SPAWN_CONFIG.MIN_SPAWN_INTERVAL,
        baseSpawn * intervalMul * difficultyScalar,
      ) / aggressionMul;

    this.spawnTimer = SPAWN_CONFIG.calculateInitialTimer(
      level.id,
      this.spawnInterval,
    );
    this.spawnedTotal = 0;
  }

  /**
   * @param {number} deltaTime
   * @param {import("./GameWorld.js").GameWorld} world
   */
  update(deltaTime, world) {
    const totalNeeded = this.level.objectiveKills + Math.max(2, this.level.id);
    if (this.spawnedTotal >= totalNeeded) {
      return;
    }

    const phase = inferPhase(world);
    const survivalMul = survivalPressure(world);
    const phaseScalar = resolvePhaseScalar(phase, survivalMul);

    const aliveCount = world.enemies.filter((enemy) => !enemy.dead).length;
    /** @type {number} */
    const baseConcurrent = SPAWN_CONFIG.calculateMaxConcurrent(this.level.id);
    /** @type {number} */
    const bonus = this.level.runtime?.maxConcurrentBonus ?? 0;
    const maxActive = Math.max(3, Math.min(8, baseConcurrent + bonus));

    this.spawnTimer -= deltaTime;
    if (this.spawnTimer > 0) {
      return;
    }

    if (aliveCount >= maxActive) {
      // Ajuste leve si la fase es agresiva pero el cupo está lleno
      this.spawnTimer = 0.45 * (phaseScalar < 1 ? 0.88 : 1);
      return;
    }

    const eliteCadence = this.level.runtime?.eliteEvery ?? 5;

    const [minRand, maxRand] = SPAWN_CONFIG.INTERVAL_RANDOM_RANGE;
    const nextSpawnIncrement = Math.max(
      this.spawnInterval *
        phaseScalar *
        randomBetween(minRand, maxRand, world.randomSource()),
      0.38,
    );
    this.spawnTimer = nextSpawnIncrement;
    const draftEliteSeed = this.spawnedTotal + 1;

    /** @type {boolean} */
    const eliteEligible =
      draftEliteSeed > 3 &&
      draftEliteSeed % eliteCadence === 0 &&
      eliteCadence > 2;

    this.spawnedTotal += 1;

    /** @type {boolean} */
    const eliteSpawn =
      eliteEligible ||
      (phase >= 2 &&
        randomBetween(0, 1, world.randomSource()) >
          SPAWN_CONFIG.ELITE_RANDOM_THRESHOLD);

    world.spawnEnemy({ elite: eliteSpawn });

    this.handleBurstSpawn(
      world,
      phase,
      aliveCount,
      maxActive,
      totalNeeded,
      nextSpawnIncrement,
    );
  }

  /**
   * @private
   * @param {import("./GameWorld.js").GameWorld} world
   * @param {number} phase
   * @param {number} aliveCount
   * @param {number} maxActive
   * @param {number} totalNeeded
   * @param {number} nextSpawnIncrement
   */
  handleBurstSpawn(
    world,
    phase,
    aliveCount,
    maxActive,
    totalNeeded,
    nextSpawnIncrement,
  ) {
    const canBurst =
      phase >= 2 &&
      aliveCount <= maxActive - 2 &&
      randomBetween(0, 1, world.randomSource()) >
        SPAWN_CONFIG.BURST_RANDOM_THRESHOLD &&
      this.spawnedTotal < totalNeeded;

    if (!canBurst) {
      return;
    }

    /** @type {boolean} */
    const echoElite =
      randomBetween(0, 1, world.randomSource()) >
      SPAWN_CONFIG.BURST_ELITE_THRESHOLD;

    this.spawnTimer = Math.min(
      this.spawnTimer,
      Math.max(nextSpawnIncrement * 0.55, 0.32),
    );
    this.spawnedTotal += 1;
    world.spawnEnemy({ elite: echoElite });
  }
}

/** @param {import("./GameWorld.js").GameWorld} world */
function inferPhase(world) {
  const beaten = Math.max(0.1, world.stats.objective);
  const tier = Math.min(2, Math.floor(world.stats.defeated / (beaten * 0.35)));

  const difficulty = world.level.runtime?.difficulty || "normal";
  let difficultyBoost = 0;

  if (difficulty === "hard") {
    difficultyBoost = 1;
  } else if (difficulty === "easy") {
    difficultyBoost = -1;
  }

  return Math.max(0, Math.min(2, tier + difficultyBoost));
}

/**
 * @param {number} phase
 * @param {number} survivalMul
 * @returns {number}
 */
function resolvePhaseScalar(phase, survivalMul) {
  if (phase >= 2) {
    return survivalMul;
  }
  return PHASE_SCALARS[phase] ?? 1;
}

/** @param {import("./GameWorld.js").GameWorld} world */
function survivalPressure(world) {
  const timerShare = world.timeRemaining / Math.max(1, world.level.timeLimit);
  const setting = SURVIVAL_PRESSURE.find((s) => timerShare < s.threshold);
  return setting ? setting.factor : 1;
}
