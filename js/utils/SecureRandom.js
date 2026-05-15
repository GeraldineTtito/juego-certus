// @ts-check

const UINT32_RANGE = 2 ** 32;
const MAX_RANDOM_BYTES = 65_536;
const UINT32S_PER_CHUNK = MAX_RANDOM_BYTES / Uint32Array.BYTES_PER_ELEMENT;

function getCryptoApi() {
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi?.getRandomValues) {
    throw new Error("Secure random source is unavailable.");
  }

  return cryptoApi;
}

/**
 * @param {Uint32Array} target
 * @returns {Uint32Array}
 */
function fillRandomUint32(target) {
  const cryptoApi = getCryptoApi();
  for (let offset = 0; offset < target.length; offset += UINT32S_PER_CHUNK) {
    const chunk = target.subarray(
      offset,
      Math.min(offset + UINT32S_PER_CHUNK, target.length),
    );
    cryptoApi.getRandomValues(chunk);
  }

  return target;
}

export function randomUnit() {
  const values = new Uint32Array(1);
  fillRandomUint32(values);
  return values[0] / UINT32_RANGE;
}

/**
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function randomBetween(min, max) {
  return min + (max - min) * randomUnit();
}

/**
 * @param {number} [scale]
 * @returns {number}
 */
export function randomCentered(scale = 1) {
  return (randomUnit() - 0.5) * 2 * scale;
}

/**
 * @param {number} maxExclusive
 * @returns {number}
 */
export function randomInt(maxExclusive) {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
    throw new RangeError("maxExclusive must be a positive integer.");
  }

  return Math.floor(randomUnit() * maxExclusive);
}

/**
 * @param {number} [probability]
 * @returns {boolean}
 */
export function randomBoolean(probability = 0.5) {
  return randomUnit() < probability;
}

/**
 * @param {Float32Array} target
 * @param {number} [amplitude]
 */
export function fillRandomFloat32(target, amplitude = 1) {
  const values = new Uint32Array(
    Math.min(UINT32S_PER_CHUNK, Math.max(1, target.length)),
  );
  let offset = 0;

  while (offset < target.length) {
    const chunkLength = Math.min(values.length, target.length - offset);
    const chunk = values.subarray(0, chunkLength);
    fillRandomUint32(chunk);

    for (let index = 0; index < chunkLength; index += 1) {
      target[offset + index] =
        ((chunk[index] / UINT32_RANGE) * 2 - 1) * amplitude;
    }

    offset += chunkLength;
  }

  return target;
}
