import React from 'react';
import { TrendingUp, Users, Coins, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import type { WhitelabelConfig, WhitelabelFeatureKey } from '../types';

interface Props {
  config: WhitelabelConfig;
  setCurrentPage: (page: WhitelabelFeatureKey) => void;
}

export default function HomePage({ config, setCurrentPage }: Props) {
  const stats = [
    { icon: TrendingUp, label: 'Preço',          value: '$0.042',     trend: '+12.4%', positive: true },
    { icon: Users,      label: 'Holders',        value: '8.421',      trend: '+340 esta semana', positive: true },
    { icon: Coins,      label: 'Supply Total',   value: `${(config.totalSupply / 1_000_000).toFixed(0)}M`, trend: 'fixo' },
    { icon: ShieldCheck,label: 'Auditoria',      value: 'Certik ✓',   trend: 'Aprovada' },
  ];

  return (
    <div className="space-y-8">
      {/* ════════ HERO ════════ */}
      <section
        className="relative h-[420px] w-full overflow-hidden rounded-2xl"
        style={{ background: `linear-gradient(135deg, var(--wl-secondary), var(--wl-deep))` }}
      >
        <img
          src={config.heroFallbackImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, transparent 30%, var(--wl-bg) 100%)`,
          }}
        />
        {/* Glow neon */}
        <div
          className="absolute top-1/2 left-1/2 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl pointer-events-none opacity-30"
          style={{ background: `var(--wl-primary)` }}
        />

        <div className="relative h-full flex flex-col items-center justify-center text-center p-8">
          <span
            className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-widest uppercase font-mono px-3 py-1.5 rounded-full mb-5"
            style={{
              background: `color-mix(in srgb, var(--wl-primary) 18%, transparent)`,
              color: `var(--wl-primary)`,
              border: `1px solid color-mix(in srgb, var(--wl-primary) 30%, transparent)`,
            }}
          >
            <Sparkles className="w-3 h-3" />
            A nova era da tokenização amazônica
          </span>

          <h1
            className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tighter max-w-3xl drop-shadow-lg leading-tight"
            style={{ fontFamily: config.theme.fontHeading }}
          >
            {config.projectName}
            <br />
            <span style={{ color: `var(--wl-primary)`, fontStyle: 'italic', fontWeight: 500 }}>
              está aqui.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-base sm:text-lg opacity-80 leading-relaxed drop-shadow">
            {config.description}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setCurrentPage('buy')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-all hover:scale-[1.02] cursor-pointer"
              style={{
                background: `var(--wl-primary)`,
                color: `var(--wl-deep)`,
              }}
            >
              Comprar ${config.tokenSymbol}
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage('whitepaper')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-all cursor-pointer"
              style={{
                background: `color-mix(in srgb, var(--wl-fg) 8%, transparent)`,
                color: `var(--wl-fg)`,
                border: `1px solid color-mix(in srgb, var(--wl-primary) 25%, transparent)`,
              }}
            >
              Ler Whitepaper
            </button>
          </div>
        </div>
      </section>

      {/* ════════ STATS ════════ */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="p-5 rounded-xl"
              style={{
                background: `var(--wl-card)`,
                border: `1px solid color-mix(in srgb, var(--wl-primary) 12%, transparent)`,
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-4 h-4" style={{ color: `var(--wl-primary)` }} />
                <span className="text-[10px] font-mono uppercase tracking-widest opacity-50">
                  {s.label}
                </span>
              </div>
              <div className="text-2xl font-bold mb-1" style={{ fontFamily: config.theme.fontHeading }}>
                {s.value}
              </div>
              <div className="text-[11px] opacity-60 font-mono">{s.trend}</div>
            </div>
          );
        })}
      </section>

      {/* ════════ TOKENOMICS ════════ */}
      <section
        className="p-6 sm:p-8 rounded-2xl"
        style={{
          background: `var(--wl-card)`,
          border: `1px solid color-mix(in srgb, var(--wl-primary) 14%, transparent)`,
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest opacity-50 mb-1">
              Distribuição
            </div>
            <h2 className="text-xl sm:text-2xl font-bold" style={{ fontFamily: config.theme.fontHeading }}>
              Tokenomics
            </h2>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono uppercase tracking-widest opacity-50">Supply</div>
            <div className="font-mono font-bold" style={{ color: `var(--wl-primary)` }}>
              {config.totalSupply.toLocaleString('en-US')} ${config.tokenSymbol}
            </div>
          </div>
        </div>

        {/* Barra de distribuição visual */}
        <div className="flex h-3 rounded-full overflow-hidden mb-6">
          {config.tokenomics.map((t) => (
            <div
              key={t.label}
              title={`${t.label}: ${t.percent}%`}
              style={{ width: `${t.percent}%`, background: t.color }}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {config.tokenomics.map((t) => (
            <div
              key={t.label}
              className="flex items-center gap-3 px-4 py-3 rounded-lg"
              style={{ background: `color-mix(in srgb, var(--wl-fg) 3%, transparent)` }}
            >
              <span className="w-3 h-3 rounded-full shrink-0" style={{ background: t.color }} />
              <span className="text-sm flex-1 truncate">{t.label}</span>
              <span className="text-sm font-mono font-bold" style={{ color: t.color }}>
                {t.percent}%
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ════════ FEATURES GRID ════════ */}
      <section>
        <h2 className="text-xl font-bold mb-4" style={{ fontFamily: config.theme.fontHeading }}>
          O que você pode fazer aqui
        </h2>
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
              className="text-left p-5 rounded-xl transition-all hover:scale-[1.02] cursor-pointer group"
              style={{
                background: `var(--wl-card)`,
                border: `1px solid color-mix(in srgb, var(--wl-primary) 12%, transparent)`,
              }}
            >
              <h3 className="text-base font-bold mb-1.5" style={{ fontFamily: config.theme.fontHeading }}>
                {f.title}
              </h3>
              <p className="text-xs opacity-65 leading-relaxed">
                {f.desc.replaceAll('${tk}', `$${config.tokenSymbol}`)}
              </p>
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
