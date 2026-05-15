// @ts-check

/**
 * @param {number} seed
 * @returns {() => number}
 */
export function createSeededRandom(seed) {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let value = Math.imul(state ^ (state >>> 15), state | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * @param {number} min
 * @param {number} max
 * @param {number} roll
 * @returns {number}
 */
export function randomBetween(min, max, roll) {
  return min + (max - min) * roll;
}
