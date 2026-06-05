/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';
import { bandOf, BAND_META } from '../trust/trustScore';

interface TrustBadgeProps {
  score: number;
  /** 'chip' = compacto p/ cards; 'full' = pílula maior com rótulo. */
  variant?: 'chip' | 'full';
}

const STYLES: Record<string, { wrap: string; icon: React.ReactNode }> = {
  high: {
    wrap: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    icon: <ShieldCheck className="w-3.5 h-3.5" />,
  },
  medium: {
    wrap: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    icon: <Shield className="w-3.5 h-3.5" />,
  },
  low: {
    wrap: 'bg-red-500/10 border-red-500/30 text-red-300',
    icon: <ShieldAlert className="w-3.5 h-3.5" />,
  },
};

/** Selo público do Nortoken Trust Score — usado em Marketplace e Dashboard. */
export default function TrustBadge({ score, variant = 'chip' }: TrustBadgeProps) {
  const band = bandOf(score);
  const s = STYLES[band];
  const meta = BAND_META[band];

  if (variant === 'full') {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${s.wrap}`}
        title={`Nortoken Trust Score: ${meta.label}`}
      >
        {s.icon}
        <span className="font-mono">{score}/100</span>
        <span className="opacity-80">· {meta.label}</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold ${s.wrap}`}
      title={`Nortoken Trust Score: ${score}/100 — ${meta.label}`}
    >
      {s.icon}
      <span className="font-mono">{score}</span>
    </div>
  );
}
