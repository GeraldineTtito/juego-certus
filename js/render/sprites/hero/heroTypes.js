// @ts-check

/**
 * @typedef {import("../../hero/hero-motion-logic.js").HeroMotionState} HeroMotionState
 * @typedef {import("../../hero/hero-pose-builder.js").HeroPose} HeroPose
 */

/**
 * @typedef {{
 *   alpha: number;
 *   attackPhase: string | null;
 *   elapsed: number;
 *   facing: { x: number; y: number; z: number };
 *   gelPhase: number;
 *   motion: HeroMotionState;
 *   pose: HeroPose;
 *   side: { x: number; y: number; z: number };
 *   slimeDeep: string;
 *   slimeHighlight: string;
 *   slimeVivid: string;
 *   dodgeStretch: number;
 * }} HeroRenderState
 */

/** @type {void} */
export const HeroTypes = undefined;
