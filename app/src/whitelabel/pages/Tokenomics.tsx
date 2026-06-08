import React, { useState } from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import type { WhitelabelConfig } from '../types';

interface Props {
  config: WhitelabelConfig;
}

const T = {
  card: 'color-mix(in srgb, var(--wl-fg) 6%, transparent)',
  surface: 'color-mix(in srgb, var(--wl-fg) 4%, transparent)',
  divider: 'color-mix(in srgb, var(--wl-fg) 12%, transparent)',
};

// Tons monocromáticos de verde derivados do primary (igual à Aizon).
// HTML (dots): color-mix funciona. SVG (donut): usar fill=var + fillOpacity (color-mix NÃO vale em fill SVG).
const segColor = (i: number, n: number) =>
  `color-mix(in srgb, var(--wl-primary) ${Math.round(100 - (i * 62) / Math.max(1, n - 1))}%, transparent)`;
const segOpacity = (i: number, n: number) => 1 - (i * 0.62) / Math.max(1, n - 1);

export default function TokenomicsPage({ config }: Props) {
  const sym = config.tokenSymbol;
  const heading = config.theme.fontHeading;
  const items = config.tokenomics;
  const n = items.length;

  const [active, setActive] = useState<number | undefined>(undefined);

  const data = items.map((t) => ({ label: t.label, value: t.percent }));
  const left = items.slice(0, Math.ceil(n / 2));
  const right = items.slice(Math.ceil(n / 2));

  // Vesting demo — TODO: dados reais
  const vesting = [
    { tge: '—', cliff: '6 meses', vesting: '18 meses' },
    { tge: '5%', cliff: '3 meses', vesting: '12 meses' },
    { tge: '4%', cliff: '6 meses', vesting: '18 meses' },
    { tge: '3%', cliff: '1 mês', vesting: '24 meses' },
    { tge: '6%', cliff: '2 meses', vesting: '30 meses' },
    { tge: '6%', cliff: '2 meses', vesting: '30 meses' },
  ];

  const allocCard = (label: string, percent: number, idx: number, dir: 'r' | 'l') => (
    <div
      key={label}
      className="rounded-2xl p-4 sm:p-5 flex items-center gap-3 justify-between transition-transform hover:scale-[1.01]"
      style={{ background: `linear-gradient(to ${dir === 'r' ? 'right' : 'left'}, color-mix(in srgb, var(--wl-fg) 8%, transparent), transparent)` }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="w-3 h-3 rounded-full shrink-0" style={{ background: segColor(idx, n) }} />
        <h4 className="capitalize font-bold text-sm sm:text-base truncate" style={{ fontFamily: heading, color: `var(--wl-fg)` }}>{label}</h4>
      </div>
      <h2 className="text-lg sm:text-xl font-bold shrink-0" style={{ fontFamily: heading, color: `var(--wl-fg)` }}>{percent}%</h2>
    </div>
  );

  return (
    <div className="rounded-2xl pb-2" style={{ background: T.card }}>
      <div className="px-5 sm:px-8 pt-6">
        <h2 className="uppercase font-bold text-2xl md:text-3xl" style={{ fontFamily: heading, color: `var(--wl-fg)` }}>Tokenomics</h2>
      </div>

      {/* grid 3 colunas: cards / donut / cards */}
      <div className="px-5 sm:px-8 pt-5 pb-6 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-10 items-center">
        <div className="lg:col-span-4 flex flex-col gap-5">
          {left.map((t, i) => allocCard(t.label, t.percent, i, 'r'))}
        </div>

        <div className="lg:col-span-4 flex items-center justify-center">
          <PieChart width={280} height={280}>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={78}
              outerRadius={124}
              paddingAngle={1}
              stroke="var(--wl-deep)"
              strokeWidth={3}
              onMouseEnter={(_, i) => setActive(i)}
              onMouseLeave={() => setActive(undefined)}
            >
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill="var(--wl-primary)"
                  fillOpacity={active !== undefined && active !== i ? segOpacity(i, n) * 0.3 : segOpacity(i, n)}
                />
              ))}
            </Pie>
          </PieChart>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-5">
          {right.map((t, i) => allocCard(t.label, t.percent, Math.ceil(n / 2) + i, 'l'))}
        </div>
      </div>

      {/* barra supply total */}
      <div
        className="mb-8 py-3 text-center"
        style={{ background: `linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--wl-fg) 7%, transparent) 50%, transparent 100%)` }}
      >
        <h2 className="uppercase font-bold text-sm md:text-base flex items-center justify-center gap-1.5 flex-wrap" style={{ fontFamily: heading, color: `var(--wl-fg)` }}>
          Supply total: <span style={{ color: `var(--wl-primary)` }}>{config.totalSupply.toLocaleString('pt-BR')}</span> ${sym}
        </h2>
      </div>

      {/* tabela de vesting */}
      <div className="px-5 sm:px-8 overflow-x-auto">
        <table className="w-full text-nowrap">
          <thead>
            <tr className="uppercase text-xs sm:text-sm font-bold opacity-60" style={{ fontFamily: heading }}>
              <th className="py-2.5 text-left">Categoria</th>
              <th className="py-2.5 px-4 text-left">Alocação</th>
              <th className="py-2.5 px-4 text-left">Qtd. de tokens</th>
              <th className="py-2.5 px-4 text-left">Unlock no TGE</th>
              <th className="py-2.5 px-4 text-left">Cliff</th>
              <th className="py-2.5 text-right">Vesting</th>
            </tr>
          </thead>
          <tbody>
            {items.map((t, i) => {
              const amount = Math.round((t.percent / 100) * config.totalSupply);
              const v = vesting[i] ?? { tge: '—', cliff: '—', vesting: '—' };
              return (
                <tr key={t.label} className="border-t text-sm sm:text-base font-medium" style={{ borderColor: T.divider, color: `var(--wl-fg)` }}>
                  <td className="py-4 flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ background: segColor(i, n) }} />
                    <div className="min-w-0">
                      <span className="capitalize">{t.label}</span>
                      {t.toPool ? (
                        <span className="block text-[11px] opacity-70" style={{ color: `var(--wl-primary)` }}>→ Pool de liquidez</span>
                      ) : t.wallet ? (
                        <a
                          href={`https://sepolia.basescan.org/address/${t.wallet}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-[11px] font-mono opacity-70 hover:opacity-100 hover:underline"
                          style={{ color: `var(--wl-primary)` }}
                          title={t.wallet}
                        >
                          {t.wallet.slice(0, 8)}…{t.wallet.slice(-6)} ↗
                        </a>
                      ) : null}
                    </div>
                  </td>
                  <td className="py-4 px-4" style={{ color: `var(--wl-primary)` }}>{t.percent}%</td>
                  <td className="py-4 px-4 font-mono">{amount.toLocaleString('pt-BR')}</td>
                  <td className="py-4 px-4 opacity-80">{v.tge}</td>
                  <td className="py-4 px-4 opacity-80">{v.cliff}</td>
                  <td className="py-4 text-right opacity-80">{v.vesting}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
