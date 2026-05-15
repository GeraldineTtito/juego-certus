// @ts-check

/**
 * @typedef {{
 *   id: number;
 *   realm: string;
 *   subtitle: string;
 *   story: string;
 *   objectiveKills: number;
 *   timeLimit: number;
 *   arena: {
 *     radius: number;
 *     fogHeight: number;
 *     hazardRingStartRatio?: number;
 *     hazardRingDpsPerSec?: number;
 *   };
 *   visual: {
 *     bgImage: string;
 *     skyTop: string;
 *     skyBottom: string;
 *     mist: string;
 *     accent: string;
 *     floorColor: string;
 *     floorGlow: string;
 *     rimColor: string;
 *     particleColor: string;
 *     sunColor: string;
 *     ambientHeat: number;
 *     emberIntensity: number;
 *   };
 *   player: { primary: string; secondary: string; vivid: string; light: string };
 *   enemies: EnemyTemplate[];
 *   runtime?: Record<string, unknown>;
 * }} CampaignLevel
 */

/**
 * @typedef {{
 *   type: string;
 *   label: string;
 *   model: string;
 *   weight: number;
 *   health: number;
 *   speed: number;
 *   damage: number;
 *   radius: number;
 *   attackRange: number;
 *   chaseRange: number;
 *   windupTime: number;
 *   activeTime: number;
 *   recoveryTime: number;
 *   bodyColor: string;
 *   detailColor: string;
 *   shadowColor: string;
 * }} EnemyTemplate
 *
 * @typedef {{
 *   extraPool?: EnemyTemplate[];
 *   [key: string]: Partial<EnemyTemplate> | EnemyTemplate[] | undefined;
 * }} EnemyOverrides
 */

/**
 * Exportación para marcar el archivo como módulo ESM.
 */
export const _ModuleMarker = true;
