import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Coins, ShieldCheck, ArrowRight } from 'lucide-react';
import type { WhitelabelConfig, WhitelabelFeatureKey } from '../types';
import StageChart, { Stage } from '../StageChart';

interface Props {
  config: WhitelabelConfig;
  setCurrentPage: (page: WhitelabelFeatureKey) => void;
}

// Tema Aizon mapeado para os nossos CSS vars multi-tenant (--wl-*)
const T = {
  card: 'color-mix(in srgb, var(--wl-fg) 6%, transparent)',      // bg-card (#ffffff0f)
  surface: 'color-mix(in srgb, var(--wl-fg) 4%, transparent)',   // bg-surface
  track: 'color-mix(in srgb, var(--wl-fg) 10%, transparent)',    // bg-secondary-10
  inputBg: 'color-mix(in srgb, var(--wl-fg) 4%, transparent)',   // bg-secondary-3
  border: '2px solid color-mix(in srgb, var(--wl-fg) 12%, transparent)', // border-secondary-8
  primarySoft: 'color-mix(in srgb, var(--wl-primary) 12%, transparent)', // bg-primary-10
};

export default function HomePage({ config, setCurrentPage }: Props) {
  const presale = config.presale;
  const price = presale?.priceUsd ?? 0.042;
  const nextPrice = presale?.nextPriceUsd ?? 0.05;
  const pct = presale ? Math.min(100, (presale.raisedUsd / presale.goalUsd) * 100) : 0;

  // Rio Calculate
  const [amount, setAmount] = useState('5000');
  const usdAmount = parseFloat(amount || '0') * price;
  const listingValue = parseFloat(amount || '0') * nextPrice;

  const listingDate = presale
    ? new Date(presale.endsAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
    : '';

  // Estágios da pré-venda (gráfico)
  const stages: Stage[] = [
    { label: 'STG 1', price: 0.02 },
    { label: 'STG 2', price: 0.028 },
    { label: 'STG 3', price: 0.035 },
    { label: 'STG 4', price },
    { label: 'STG 5', price: nextPrice },
    { label: 'STG 6', price: 0.065 },
    { label: 'LISTAGEM', price: 0.08 },
  ];
  const currentStageIndex = 3;

  const stats = [
    { icon: TrendingUp, label: 'Preço',        value: `$${price}`, trend: '+12.4%' },
    { icon: Users,      label: 'Holders',      value: '8.421',     trend: '+340 esta semana' },
    { icon: Coins,      label: 'Supply Total', value: `${(config.totalSupply / 1_000_000).toFixed(0)}M`, trend: 'fixo' },
    { icon: ShieldCheck,label: 'Auditoria',    value: 'Certik ✓',  trend: 'Aprovada' },
  ];

  const txs = [
    { usd: '2.54', amount: '585', date: '15/01/2026, 07:56' },
    { usd: '1.54', amount: '657', date: '14/01/2026, 04:12' },
    { usd: '1.30', amount: '485', date: '12/01/2026, 01:34' },
    { usd: '2.54', amount: '585', date: '07/01/2026, 02:40' },
    { usd: '0.40', amount: '85',  date: '06/01/2026, 07:56' },
  ];
  const ranks = [
    { pos: 1, wallet: '0x05D...282C5', total: '858.802' },
    { pos: 2, wallet: '0xF63...8689B', total: '396.056' },
    { pos: 3, wallet: '0x05D...282C5', total: '278.136' },
    { pos: 4, wallet: '0xBF1...57ABF', total: '99.489' },
    { pos: 5, wallet: '0xEF8...B8D06', total: '25.789' },
  ];

  return (
    <div className="space-y-8">
      {/* ════════════ HERO BANNER (Aizon) ════════════ */}
      <section
        className="rounded-2xl overflow-hidden relative px-6 sm:px-10 py-8 sm:py-12 flex flex-col gap-8 lg:flex-row lg:gap-0 justify-between"
        style={{
          background: `linear-gradient(140deg, color-mix(in srgb, var(--wl-primary) 22%, var(--wl-secondary)) 0%, var(--wl-secondary) 70%)`,
          border: `1px solid color-mix(in srgb, var(--wl-primary) 25%, transparent)`,
        }}
      >
        {/* textura de pontos (à esquerda) */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            backgroundImage: `radial-gradient(color-mix(in srgb, var(--wl-fg) 12%, transparent) 1px, transparent 1px)`,
            backgroundSize: '22px 22px',
            maskImage: 'linear-gradient(100deg, #000, transparent 65%)',
            WebkitMaskImage: 'linear-gradient(100deg, #000, transparent 65%)',
          }}
        />

        {/* mascote: anel girando + estrela */}
        <div aria-hidden className="hidden lg:flex absolute right-6 top-1/2 -translate-y-1/2 w-64 h-64 items-center justify-center pointer-events-none">
          <div
            className="absolute inset-0 rounded-full animate-[spin_18s_linear_infinite]"
            style={{ border: `1px dashed color-mix(in srgb, var(--wl-fg) 18%, transparent)` }}
          />
          <div className="absolute inset-6 rounded-full" style={{ background: `radial-gradient(circle, color-mix(in srgb, var(--wl-primary) 14%, transparent), transparent 70%)` }} />
          <img
            src="/wl-star.svg"
            alt=""
            className="w-40 h-40 relative animate-[spin_16s_linear_infinite]"
            style={{ filter: `drop-shadow(0 0 26px var(--wl-primary))` }}
          />
        </div>

        {/* conteúdo */}
        <div className="relative w-full lg:w-[70%]">
          <h2
            className="mb-4 max-w-[440px] uppercase font-bold text-3xl sm:text-4xl md:text-[50px] md:leading-[1.05]"
            style={{ fontFamily: config.theme.fontHeading, color: '#fff' }}
          >
            {config.tagline}
          </h2>
          <p className="max-w-[520px] text-sm sm:text-base sm:leading-8 font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
            {config.description}
          </p>

          <div className="mt-8 sm:mt-10 flex items-center gap-6 xl:gap-12 flex-wrap">
            <button
              onClick={() => setCurrentPage('buy')}
              className="w-[220px] h-[55px] rounded-2xl uppercase font-bold text-base transition-all hover:scale-[1.02] cursor-pointer"
              style={{ background: `var(--wl-primary)`, color: `var(--wl-deep)`, fontFamily: config.theme.fontHeading, boxShadow: `0 0 30px color-mix(in srgb, var(--wl-primary) 40%, transparent)` }}
            >
              Comprar Agora
            </button>

            <div style={{ fontFamily: config.theme.fontHeading }}>
              <h4 className="mb-0.5 uppercase text-sm font-bold" style={{ color: 'rgba(255,255,255,0.8)' }}>Preço de listagem</h4>
              <h3 className="uppercase text-lg sm:text-xl font-bold" style={{ color: '#fff' }}>1 ${config.tokenSymbol} = ${price}</h3>
            </div>
            <div style={{ fontFamily: config.theme.fontHeading }}>
              <h4 className="mb-0.5 uppercase text-sm font-bold" style={{ color: 'rgba(255,255,255,0.8)' }}>Data de listagem</h4>
              <h3 className="uppercase text-lg sm:text-xl font-bold" style={{ color: '#fff' }}>{listingDate}</h3>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ SALE PROGRESS + RIO CALCULATE (Aizon) ════════════ */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* — Sale Progress — */}
        {presale && (
          <div className="lg:col-span-2 rounded-2xl overflow-hidden" style={{ background: T.card }}>
            <div className="px-6 sm:px-8 pt-6 pb-8">
              <div className="mb-6 flex items-center gap-4 flex-wrap justify-between">
                <h2 className="uppercase font-bold text-2xl md:text-3xl" style={{ fontFamily: config.theme.fontHeading, color: `var(--wl-fg)` }}>Progresso da Venda</h2>
                <h4 className="uppercase text-2xl md:text-3xl font-bold" style={{ fontFamily: config.theme.fontHeading, color: `var(--wl-fg)` }}>{pct.toFixed(2)}%</h4>
              </div>

              <div className="mb-4 w-full h-7 rounded-[10px] overflow-hidden" style={{ background: T.track }}>
                <div className="h-full" style={{ width: `${pct}%`, background: `var(--wl-primary)`, boxShadow: `0 0 18px var(--wl-primary)` }} />
              </div>

              <div className="flex items-center gap-4 flex-wrap justify-between font-bold uppercase text-sm" style={{ fontFamily: config.theme.fontHeading, color: `var(--wl-fg)` }}>
                <p><span className="opacity-60">Arrecadado:</span> {presale.raisedUsd.toLocaleString('pt-BR')} USD</p>
                <p><span className="opacity-60">Meta:</span> {presale.goalUsd.toLocaleString('pt-BR')} USD</p>
              </div>
            </div>

            {/* faixa de preço */}
            <div className="px-6 sm:px-8 py-3.5 flex items-center gap-5 flex-wrap" style={{ background: T.surface }}>
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: `var(--wl-primary)` }} />
                <h4 className="uppercase text-sm font-bold" style={{ fontFamily: config.theme.fontHeading, color: `color-mix(in srgb, var(--wl-primary) 80%, var(--wl-fg))` }}>
                  Preço atual: 1 ${config.tokenSymbol} = ${presale.priceUsd}
                </h4>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: `var(--wl-primary-soft)` }} />
                <h4 className="uppercase text-sm font-bold" style={{ fontFamily: config.theme.fontHeading, color: `color-mix(in srgb, var(--wl-primary) 80%, var(--wl-fg))` }}>
                  Próximo: 1 ${config.tokenSymbol} = ${presale.nextPriceUsd}
                </h4>
              </div>
            </div>

            {/* gráfico de estágios (Recharts) */}
            <div className="px-3 sm:px-5 pb-5 pt-2">
              <StageChart stages={stages} currentIndex={currentStageIndex} />
            </div>
          </div>
        )}

        {/* — Rio Calculate — */}
        <div className="rounded-2xl px-6 sm:px-8 pt-6 pb-5" style={{ background: T.card }}>
          <h2 className="mb-5 uppercase font-bold text-2xl" style={{ fontFamily: config.theme.fontHeading, color: `var(--wl-fg)` }}>Calcular Compra</h2>

          <div className="mb-5 uppercase font-bold" style={{ fontFamily: config.theme.fontHeading }}>
            <label className="block mb-1.5 text-sm" style={{ color: `var(--wl-fg)` }}>Quantidade de ${config.tokenSymbol}</label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="Digite o valor"
                className="w-full rounded-xl px-4 py-3.5 text-xl outline-none"
                style={{ border: T.border, background: T.inputBg, color: `var(--wl-fg)` }}
              />
              <span className="absolute top-1/2 right-4 -translate-y-1/2 px-2.5 py-1 rounded-[10px] uppercase text-sm font-bold" style={{ background: T.primarySoft, color: `var(--wl-primary)` }}>
                ${config.tokenSymbol}
              </span>
            </div>
          </div>

          <div className="mb-5 uppercase font-bold" style={{ fontFamily: config.theme.fontHeading }}>
            <label className="block mb-1.5 text-sm" style={{ color: `var(--wl-fg)` }}>Valor em USD</label>
            <input
              type="text"
              disabled
              value={`$ ${usdAmount.toFixed(2)}`}
              className="w-full rounded-xl px-4 py-3.5 text-xl outline-none"
              style={{ border: T.border, background: T.inputBg, color: `var(--wl-fg)` }}
            />
          </div>

          <div className="mb-5 uppercase font-bold" style={{ fontFamily: config.theme.fontHeading }}>
            <label className="block mb-1.5 text-sm" style={{ color: `var(--wl-fg)` }}>Valor na listagem</label>
            <input
              type="text"
              disabled
              value={`$ ${listingValue.toFixed(2)}`}
              className="w-full rounded-xl px-4 py-3.5 text-xl outline-none"
              style={{ border: T.border, background: T.inputBg, color: `var(--wl-primary)` }}
            />
          </div>

          <button
            onClick={() => setCurrentPage('buy')}
            className="w-full py-3.5 rounded-xl uppercase font-bold text-base transition-all hover:scale-[1.01] cursor-pointer"
            style={{ background: `var(--wl-primary)`, color: `var(--wl-deep)`, fontFamily: config.theme.fontHeading }}
          >
            Comprar ${config.tokenSymbol}
          </button>
        </div>
      </div>

      {/* ════════════ ÚLTIMAS TRANSAÇÕES + LEADERBOARD (Aizon) ════════════ */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* transações */}
        <div className="rounded-2xl px-6 sm:px-8 py-6" style={{ background: T.card }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="uppercase font-bold text-xl sm:text-2xl" style={{ fontFamily: config.theme.fontHeading, color: `var(--wl-fg)` }}>Últimas Transações</h2>
            <button className="uppercase text-xs font-bold cursor-pointer" style={{ color: `var(--wl-primary)`, fontFamily: config.theme.fontHeading }}>Ver mais</button>
          </div>
          <div className="grid grid-cols-[1.5fr_1fr_auto] gap-3 text-[10px] font-mono uppercase tracking-wider opacity-40 pb-2">
            <span>Valor</span><span>Data</span><span className="text-right">Detalhes</span>
          </div>
          {txs.map((t, i) => (
            <div key={i} className="grid grid-cols-[1.5fr_1fr_auto] gap-3 items-center py-3 text-sm" style={{ borderTop: `1px solid color-mix(in srgb, var(--wl-fg) 7%, transparent)` }}>
              <span className="font-bold font-mono">{t.usd} USDT <span style={{ color: `var(--wl-primary)` }}>→</span> {t.amount} ${config.tokenSymbol}</span>
              <span className="opacity-60 text-xs font-mono">{t.date}</span>
              <span className="flex justify-end"><Coins className="w-4 h-4" style={{ color: `var(--wl-primary)` }} /></span>
            </div>
          ))}
        </div>

        {/* leaderboard */}
        <div className="rounded-2xl px-6 sm:px-8 py-6 overflow-hidden" style={{ background: T.card }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="uppercase font-bold text-xl sm:text-2xl" style={{ fontFamily: config.theme.fontHeading, color: `var(--wl-fg)` }}>Leaderboard</h2>
            <button onClick={() => setCurrentPage('leaderboard')} className="uppercase text-xs font-bold cursor-pointer" style={{ color: `var(--wl-primary)`, fontFamily: config.theme.fontHeading }}>Ver mais</button>
          </div>
          <div className="grid grid-cols-[auto_1.2fr_1fr] gap-3 text-[10px] font-mono uppercase tracking-wider opacity-40 pb-2">
            <span>#Rank</span><span>Carteira</span><span className="text-right">Total</span>
          </div>
          {ranks.map((r) => (
            <div key={r.pos} className="grid grid-cols-[auto_1.2fr_1fr] gap-3 items-center py-2.5 text-sm" style={{ borderTop: `1px solid color-mix(in srgb, var(--wl-fg) 7%, transparent)` }}>
              <span
                className="w-7 h-7 flex items-center justify-center text-xs font-bold font-mono rounded-md"
                style={{ background: r.pos <= 3 ? `var(--wl-primary)` : `color-mix(in srgb, var(--wl-fg) 8%, transparent)`, color: r.pos <= 3 ? `var(--wl-deep)` : `var(--wl-fg)` }}
              >
                {r.pos}
              </span>
              <span className="font-mono text-xs opacity-80">{r.wallet}</span>
              <span className="text-right font-mono font-bold text-xs">{r.total} ${config.tokenSymbol}</span>
            </div>
          ))}
          <div className="-mx-6 sm:-mx-8 mt-3 px-6 sm:px-8 py-3 flex items-center justify-between text-xs font-mono" style={{ background: `color-mix(in srgb, var(--wl-primary) 12%, transparent)` }}>
            <span className="uppercase">Seu rank <strong style={{ color: `var(--wl-primary)` }}>#256</strong> de <strong style={{ color: `var(--wl-primary)` }}>#87855</strong></span>
            <span className="font-bold">4558 ${config.tokenSymbol}</span>
          </div>
        </div>
      </div>

      {/* ════════════ STATS ════════════ */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="p-5 rounded-2xl" style={{ background: T.card }}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-4 h-4" style={{ color: `var(--wl-primary)` }} />
                <span className="text-[10px] font-mono uppercase tracking-widest opacity-50">{s.label}</span>
              </div>
              <div className="text-2xl font-bold mb-1" style={{ fontFamily: config.theme.fontHeading }}>{s.value}</div>
              <div className="text-[11px] opacity-60 font-mono">{s.trend}</div>
            </div>
          );
        })}
      </section>

      {/* ════════════ FEATURES ════════════ */}
      <section>
        <h2 className="text-2xl font-bold uppercase mb-4" style={{ fontFamily: config.theme.fontHeading }}>O que você pode fazer aqui</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { page: 'swap',         title: 'Swap', desc: 'Troque ${tk} por USDC, USDT ou outros tokens instantaneamente.' },
            { page: 'stake',        title: 'Stake', desc: 'Bloqueie seus tokens e ganhe até 120% APR em rewards.' },
            { page: 'referral',     title: 'Referral', desc: 'Convide amigos e ganhe comissão em 3 níveis.' },
            { page: 'tokenization', title: 'Buy NFT', desc: 'Adquira NFTs exclusivos da coleção do projeto.' },
            { page: 'buy',          title: 'Buy Token', desc: 'Compre ${tk} com USDC direto da carteira.' },
            { page: 'roadmap',      title: 'Roadmap', desc: 'Veja onde o projeto está e pra onde vai.' },
          ].map((f) => (
            <button
              key={f.page}
              onClick={() => setCurrentPage(f.page as WhitelabelFeatureKey)}
              className="text-left p-5 rounded-2xl transition-all hover:scale-[1.02] cursor-pointer group"
              style={{ background: T.card }}
            >
              <h3 className="text-base font-bold mb-1.5" style={{ fontFamily: config.theme.fontHeading }}>{f.title}</h3>
              <p className="text-xs opacity-65 leading-relaxed">{f.desc.replaceAll('${tk}', `$${config.tokenSymbol}`)}</p>
              <div className="mt-3 text-[10px] font-mono uppercase tracking-widest flex items-center gap-1 opacity-70 group-hover:opacity-100" style={{ color: `var(--wl-primary)` }}>
                Acessar <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
