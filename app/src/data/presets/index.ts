/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SegmentPreset } from '../../types';
import { UNIVERSAL_PRESET } from './universal';
import { AMAZON_PRESET } from './amazon';

export const PRESETS: Record<string, SegmentPreset> = {
  universal: UNIVERSAL_PRESET,
  amazon: AMAZON_PRESET,
};

export const PRESET_LIST: SegmentPreset[] = [UNIVERSAL_PRESET, AMAZON_PRESET];

/** Preset ativo por padrão. Universal = mercado como um todo. */
export const ACTIVE_PRESET: SegmentPreset = UNIVERSAL_PRESET;

export function getPreset(id?: string): SegmentPreset {
  if (id && PRESETS[id]) return PRESETS[id];
  return ACTIVE_PRESET;
}

export { UNIVERSAL_PRESET, AMAZON_PRESET };
