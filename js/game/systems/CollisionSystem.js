// @ts-check

/**
 * @typedef {{ position: { x: number; z: number }; radius: number; dead?: boolean }} Collidable
 */

/**
 * Separa dos entidades superpuestas empujándolas en direcciones opuestas.
 *
 * @param {Collidable} entity
 * @param {Collidable} other
 * @param {number} [extraPadding]
 */
export function separateOverlappingEntities(entity, other, extraPadding = 0) {
  const deltaX = other.position.x - entity.position.x;
  const deltaZ = other.position.z - entity.position.z;
  const distance = Math.hypot(deltaX, deltaZ) || 0.0001;
  const minDistance = entity.radius + other.radius + extraPadding;

  if (distance >= minDistance) {
    return;
  }

  const overlap = (minDistance - distance) * 0.5;
  const normalX = deltaX / distance;
  const normalZ = deltaZ / distance;

  entity.position.x -= normalX * overlap;
  entity.position.z -= normalZ * overlap;
  other.position.x += normalX * overlap;
  other.position.z += normalZ * overlap;
}

/**
 * Resuelve colisiones circulares entre el jugador y los enemigos, y entre enemigos.
 *
 * @param {Collidable} player
 * @param {Collidable[]} enemies
 */
export function resolveWorldCollisions(player, enemies) {
  // Jugador vs Enemigos
  for (const enemy of enemies) {
    if (enemy.dead) {
      continue;
    }
    separateOverlappingEntities(player, enemy, 0.08);
  }

  // Enemigos vs Enemigos
  for (let i = 0; i < enemies.length; i++) {
    const first = enemies[i];
    if (first.dead) {
      continue;
    }

    for (let j = i + 1; j < enemies.length; j++) {
      const second = enemies[j];
      if (second.dead) {
        continue;
      }
      separateOverlappingEntities(first, second, 0.02);
    }
  }
}
