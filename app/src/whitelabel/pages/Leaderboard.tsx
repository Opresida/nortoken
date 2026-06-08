import React from 'react';
import type { WhitelabelConfig } from '../types';

interface Props {
  config: WhitelabelConfig;
}

const T = {
  card: 'color-mix(in srgb, var(--wl-fg) 6%, transparent)',
  surface: 'color-mix(in srgb, var(--wl-fg) 4%, transparent)',
  track: 'color-mix(in srgb, var(--wl-fg) 10%, transparent)',
  divider: 'color-mix(in srgb, var(--wl-fg) 12%, transparent)',
};

export default function LeaderboardPage({ config }: Props) {
  const sym = config.tokenSymbol;
  const heading = config.theme.fontHeading;

  // TODO: dados reais
  const ranks = [
    { pos: 1,  wallet: '0x05D1a9...282C5', total: '858.802' },
    { pos: 2,  wallet: '0xF631b7...8689B', total: '396.056' },
    { pos: 3,  wallet: '0x05D1a9...4A8C5', total: '278.136' },
    { pos: 4,  wallet: '0xBF1c7a...57ABF', total: '99.489' },
    { pos: 5,  wallet: '0xEF8a6c...B8D06', total: '25.789' },
    { pos: 6,  wallet: '0x79a4d1...4B7F4', total: '18.402' },
    { pos: 7,  wallet: '0x3C5e0f...9B7D2', total: '12.130' },
    { pos: 8,  wallet: '0xA12bC3...6E8F0', total: '9.845' },
    { pos: 9,  wallet: '0x6c20e6...1F5A9', total: '7.220' },
    { pos: 10, wallet: '0xDe4F12...0aB3c', total: '5.118' },
  ];

  // Pódio: ordem visual [2º, 1º, 3º]
  const podium = [
    { r: ranks[1], h: 150, clip: 'polygon(18% 0, 82% 0, 100% 100%, 0 100%)' },
    { r: ranks[0], h: 200, clip: 'polygon(18% 0, 100% 0, 100% 100%, 0 100%)' },
    { r: ranks[2], h: 112, clip: 'polygon(0 0, 82% 0, 100% 100%, 0 100%)' },
  ];

  const rankBadge = (pos: number): React.CSSProperties => {
    if (pos === 1) return { background: 'var(--wl-primary)', color: 'var(--wl-deep)' };
    if (pos === 2) return { background: 'color-mix(in srgb, var(--wl-primary) 70%, var(--wl-deep))', color: 'var(--wl-deep)' };
    if (pos === 3) return { background: 'color-mix(in srgb, var(--wl-primary) 45%, var(--wl-deep))', color: 'var(--wl-deep)' };
    return { background: T.track, color: 'var(--wl-fg)' };
  };
  const rowHighlight = (pos: number): string =>
    pos === 1 ? 'linear-gradient(90deg, color-mix(in srgb, var(--wl-primary) 12%, transparent), transparent 55%)'
    : pos === 2 ? 'linear-gradient(90deg, color-mix(in srgb, var(--wl-primary) 7%, transparent), transparent 55%)'
    : pos === 3 ? 'linear-gradient(90deg, color-mix(in srgb, var(--wl-primary) 4%, transparent), transparent 55%)'
    : 'transparent';

  return (
    <div className="space-y-6">
      {/* ════════════ HERO: header + pódio + banner (fundo de raios girando — vibe Aizon) ════════════ */}
      <div className="relative overflow-hidden rounded-2xl" style={{ background: T.card }}>
        {/* raios verdes girando (animate-spin-slow2 ≈ 15s) */}
        <div
          aria-hidden
          className="absolute left-1/2 -top-44 -translate-x-1/2 w-[660px] h-[660px] pointer-events-none opacity-[0.13] animate-[spin_15s_linear_infinite]"
          style={{
            background: `repeating-conic-gradient(from 0deg, color-mix(in srgb, var(--wl-primary) 55%, transparent) 0deg 3deg, transparent 3deg 24deg)`,
            maskImage: 'radial-gradient(circle, #000 0%, transparent 62%)',
            WebkitMaskImage: 'radial-gradient(circle, #000 0%, transparent 62%)',
          }}
        />
        {/* brilho estático no topo */}
        <div
          aria-hidden
          className="absolute left-1/2 top-0 -translate-x-1/2 w-[520px] h-[360px] pointer-events-none"
          style={{ background: `radial-gradient(ellipse at center top, color-mix(in srgb, var(--wl-primary) 16%, transparent), transparent 70%)` }}
        />

        <div className="relative z-10 p-5 sm:p-8">
          <h2 className="mb-8 uppercase font-bold text-2xl md:text-3xl" style={{ fontFamily: heading, color: `var(--wl-fg)` }}>Leaderboard</h2>

          {/* pódio top-3 */}
          <div className="flex items-end justify-center gap-2 sm:gap-5">
            {podium.map((p) => (
              <div key={p.r.pos} className="flex flex-col items-center gap-4 w-1/3 max-w-[210px]">
                <div className="text-center">
                  <p className="mb-2 font-bold text-xs sm:text-lg" style={{ fontFamily: heading, color: `var(--wl-fg)` }}>{p.r.wallet}</p>
                  <span className="inline-flex items-center gap-1 rounded-[10px] py-1.5 px-3 text-xs sm:text-sm font-bold" style={{ background: T.track, fontFamily: heading, color: `var(--wl-fg)` }}>
                    <span style={{ color: `var(--wl-primary)` }}>{p.r.total}</span> ${sym}
                  </span>
                </div>
                <div className="w-full">
                  <div className="w-full h-6" style={{ background: `color-mix(in srgb, var(--wl-primary) 80%, transparent)`, clipPath: p.clip }} />
                  <div
                    className="w-full flex items-start justify-center font-bold text-[40px] sm:text-[64px] lg:text-[88px] leading-none pt-3"
                    style={{ height: p.h, fontFamily: heading, color: '#fff', background: `linear-gradient(to bottom, var(--wl-primary), var(--wl-deep))` }}
                  >
                    {p.r.pos}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* banner seu rank */}
          <div
            className="mt-8 -mx-5 sm:-mx-8 -mb-5 sm:-mb-8 py-3 text-center"
            style={{ background: `linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--wl-fg) 7%, transparent) 50%, transparent 100%)` }}
          >
            <h2 className="uppercase font-bold text-sm md:text-base" style={{ fontFamily: heading, color: `var(--wl-fg)` }}>
              Seu rank <span style={{ color: `var(--wl-primary)` }}>#256</span> de <span style={{ color: `var(--wl-primary)` }}>#87.855</span> · <span style={{ color: `var(--wl-primary)` }}>4.558</span> ${sym}
            </h2>
          </div>
        </div>
      </div>

      {/* ════════════ TABELA ════════════ */}
      <div className="rounded-2xl overflow-hidden" style={{ background: T.card }}>
        <div className="grid grid-cols-[auto_1fr_auto] gap-4 px-5 sm:px-8 py-3 text-xs uppercase tracking-wider font-bold opacity-50" style={{ fontFamily: heading }}>
          <span>#Rank</span>
          <span>Carteira</span>
          <span className="text-right">Total</span>
        </div>
        {ranks.map((r) => (
          <div
            key={r.pos}
            className={`grid grid-cols-[auto_1fr_auto] gap-4 items-center px-5 sm:px-8 py-4 border-t transition-colors ${r.pos > 3 ? 'hover:bg-white/[0.04]' : ''}`}
            style={{ borderColor: T.divider, background: rowHighlight(r.pos) }}
          >
            <span className="w-8 h-8 flex items-center justify-center text-sm font-bold rounded-full shrink-0" style={{ ...rankBadge(r.pos), fontFamily: heading }}>
              {r.pos}
            </span>
            <span className="uppercase text-sm sm:text-base font-medium opacity-80" style={{ color: `var(--wl-fg)` }}>{r.wallet}</span>
            <span className="text-right text-sm sm:text-base font-medium">
              <span style={{ color: `var(--wl-fg)` }}>{r.total}</span> <span className="opacity-60">${sym}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
