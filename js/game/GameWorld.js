// @ts-check

import { Camera } from "../core/Camera.js";
import { EnemyDirector } from "./EnemyDirector.js";
import { createSeededRandom } from "./Random.js";
import { Player } from "./entities/Player.js";
import { resolveCombat } from "./systems/CombatSystem.js";
import { resolveWorldCollisions } from "./systems/CollisionSystem.js";
import { createWorldEnemy } from "./systems/SpawnSystem.js";
import { applyEnvironmentalHazard } from "./systems/HazardSystem.js";
import { addWorldEffect, updateWorldEffects } from "./systems/EffectSystem.js";
import {
  createArenaEmbers,
  updateArenaEmbers,
} from "./systems/ArenaEmberSystem.js";
import { updateCameraFollow } from "./systems/CameraSystem.js";

export class GameWorld {
  /**
   * @param {import("../config/GameplayRuntime.js").ResolvedLevel} level
   * @param {{ width: number; height: number }} viewport
   * @param {number} [initialKills]
   * @param {Partial<{
   *   mouseSensitivity: number;
   *   lookInvertY: boolean;
   *   shakeScale: number;
   *   reducedShake: boolean;
   *   sfx: import("../audio/SfxBus.js").SfxBus | null;
   * }>} [presentation]
   */
  constructor(level, viewport, initialKills = 0, presentation = {}) {
    this.level = level;
    this.viewport = viewport;
    this.presentation = typeof presentation === "object" ? presentation : {};
    this.lookSensitivity =
      typeof this.presentation.mouseSensitivity === "number"
        ? this.presentation.mouseSensitivity
        : 1;
    this.lookInvertY = Boolean(this.presentation.lookInvertY);
    this.shakeScale =
      typeof this.presentation.shakeScale === "number"
        ? this.presentation.shakeScale
        : 1;
    /** @type {import("../audio/SfxBus.js").SfxBus | null} */
    this.sfx = this.presentation.sfx ?? null;

    this.camera = new Camera(viewport.width, viewport.height);
    this.player = new Player({ palette: level.player });
    this.enemyDirector = new EnemyDirector(level);
    /** @type {import("./entities/Enemy.js").Enemy[]} */
    this.enemies = [];
    /** @type {{ position: { x: number; y: number; z: number }; color: string; radius: number; maxRadius: number; remaining: number }[]} */
    this.effects = [];
    this.effectSoftCap = 96;
    this.elapsed = 0;
    this.timeRemaining = level.timeLimit;
    this.result = "running";
    this.failureReason = null;
    this.spawnCounter = 0;
    this.hazardDebt = 0;
    /** @type {number} tiempo restante de pulso HUD */
    this.hudPainPulse = 0;

    this.stats = {
      defeated: initialKills,
      objective: level.objectiveKills,
      damageTaken: 0,
      damageDealt: 0,
    };

    this.randomSource = createSeededRandom(level.id * 4099 + 97);
    this.camera.snapTo(this.player.lookAnchor);
    this.arenaEmbers = createArenaEmbers(this.level, this.randomSource);
  }

  /**
   * @param {number} deltaTime
   * @param {import("../core/InputManager.js").InputManager} input
   * @param {{ width: number; height: number }} viewport
   */
  update(deltaTime, input, viewport) {
    if (this.result !== "running") {
      return;
    }

    this.viewport = viewport;
    this.camera.resize(viewport.width, viewport.height);
    this.elapsed += deltaTime;
    this.timeRemaining = Math.max(0, this.timeRemaining - deltaTime);

    if (this.hudPainPulse > 0) {
      this.hudPainPulse = Math.max(0, this.hudPainPulse - deltaTime);
    }

    this.player.update(deltaTime, input, this);
    this.enemyDirector.update(deltaTime, this);

    for (const enemy of this.enemies) {
      enemy.update(deltaTime, this.player, this);
    }

    resolveWorldCollisions(this.player, this.enemies);

    const shakeMul = Math.max(
      0,
      Math.min(
        this.shakeScale ?? 1,
        this.presentation.reducedShake ? 0.22 : 1.85,
      ),
    );

    const events = resolveCombat(this.player, this.enemies);
    for (const event of events) {
      if (event.type === "enemy-hit") {
        this.stats.damageTaken += event.amount;
        this.camera.applyShake(0.11, shakeMul);
        this.hudPainPulse = Math.max(this.hudPainPulse, 0.34);
        this.sfx?.play("player-hit");
      } else {
        this.stats.damageDealt += event.amount;
        this.camera.applyShake(0.042, shakeMul);
        this.sfx?.play("enemy-hit");
      }

      this.addEffect(event.position, event.color);
    }

    const hazardResult = applyEnvironmentalHazard({
      deltaTime,
      player: this.player,
      level: this.level,
      hazardDebt: this.hazardDebt,
      sfx: this.sfx,
    });

    this.stats.damageTaken += hazardResult.damageTaken;
    this.hudPainPulse = Math.max(this.hudPainPulse, hazardResult.hudPainPulse);
    this.hazardDebt = hazardResult.hazardDebt;

    this.cleanupEntities();
    this.effects = updateWorldEffects(this.effects, deltaTime);
    updateArenaEmbers(
      this.arenaEmbers,
      deltaTime,
      this.level.arena.radius,
      this.randomSource,
    );
    updateCameraFollow(this.camera, this.player, deltaTime);

    if (this.stats.defeated >= this.stats.objective) {
      this.result = "won";
      return;
    }

    if (this.player.dead) {
      this.result = "lost";
      this.failureReason = "health";
      return;
    }

    if (this.timeRemaining <= 0) {
      this.result = "lost";
      this.failureReason = "time";
    }
  }

  /**
   * @param {{ elite?: boolean }} [extras]
   */
  spawnEnemy(extras = {}) {
    this.spawnCounter += 1;
    const enemy = createWorldEnemy({
      level: this.level,
      spawnIndex: this.spawnCounter,
      randomSource: this.randomSource,
      elite: Boolean(extras.elite),
    });

    this.enemies.push(enemy);

    const spawnRoll = this.randomSource();
    if (
      (enemy.elite && spawnRoll > 0.45) ||
      (!enemy.elite && spawnRoll > 0.73)
    ) {
      this.sfx?.play("spawn");
    }
  }

  cleanupEntities() {
    for (const enemy of this.enemies) {
      if (enemy.dead && !enemy.countedDefeat) {
        enemy.countedDefeat = true;
        this.stats.defeated += 1;
        this.addEffect(
          {
            x: enemy.position.x,
            y: enemy.position.y + enemy.height * 0.65,
            z: enemy.position.z,
          },
          "#fff3ba",
        );
      }
    }

    this.enemies = this.enemies.filter((enemy) => !enemy.remove);
  }

  /**
   * @param {{ x: number; y: number; z: number }} position
   * @param {string} color
   */
  addEffect(position, color) {
    addWorldEffect({
      position,
      color,
      effects: this.effects,
      softCap: this.effectSoftCap,
    });
  }

  getSummary() {
    return {
      levelId: this.level.id,
      realm: this.level.realm,
      defeated: this.stats.defeated,
      objective: this.stats.objective,
      timeRemaining: Number(this.timeRemaining.toFixed(1)),
      damageTaken: this.stats.damageTaken,
      damageDealt: this.stats.damageDealt,
      flawlessRun: this.stats.damageTaken <= 0,
      difficulty:
        typeof this.level.runtime?.difficulty === "string"
          ? this.level.runtime.difficulty
          : "normal",
    };
  }

  describeState() {
    return {
      mode: "gameplay",
      coordinateSystem: "x runs left-right, z runs forward-back, y is vertical",
      level: {
        id: this.level.id,
        realm: this.level.realm,
      },
      result: this.result,
      player: {
        x: Number(this.player.position.x.toFixed(2)),
        y: Number(this.player.position.y.toFixed(2)),
        z: Number(this.player.position.z.toFixed(2)),
        vx: Number(this.player.velocity.x.toFixed(2)),
        vy: Number(this.player.velocity.y.toFixed(2)),
        vz: Number(this.player.velocity.z.toFixed(2)),
        hp: this.player.health,
        state: this.player.state,
        facingYaw: Number(this.player.facingYaw.toFixed(2)),
      },
      enemies: this.enemies
        .filter((enemy) => !enemy.dead)
        .slice(0, 6)
        .map((enemy) => ({
          id: enemy.id,
          type: enemy.label,
          x: Number(enemy.position.x.toFixed(2)),
          y: Number(enemy.position.y.toFixed(2)),
          z: Number(enemy.position.z.toFixed(2)),
          hp: enemy.health,
          state: enemy.state,
        })),
      stats: {
        defeated: this.stats.defeated,
        objective: this.stats.objective,
        timeRemaining: Number(this.timeRemaining.toFixed(1)),
        damageTaken: this.stats.damageTaken,
      },
      camera: {
        yaw: Number(this.camera.yaw.toFixed(2)),
        pitch: Number(this.camera.pitch.toFixed(2)),
        distance: Number(this.camera.distance.toFixed(2)),
      },
    };
  }
}
