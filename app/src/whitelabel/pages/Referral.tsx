import React, { useState } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';
import type { WhitelabelConfig } from '../types';

interface Props {
  config: WhitelabelConfig;
}

// Tema Aizon → CSS vars multi-tenant (mesmo padrão de Home/Stake)
const T = {
  card: 'color-mix(in srgb, var(--wl-fg) 6%, transparent)',
  surface: 'color-mix(in srgb, var(--wl-fg) 4%, transparent)',
  border: '2px solid color-mix(in srgb, var(--wl-fg) 12%, transparent)',
  divider: 'color-mix(in srgb, var(--wl-fg) 10%, transparent)',
};

export default function ReferralPage({ config }: Props) {
  const sym = config.tokenSymbol;
  const heading = config.theme.fontHeading;
  const tiers = config.referralTiers;
  const totalCommission = tiers.reduce((a, t) => a + t.commission, 0);

  const slug = config.projectName.toLowerCase().replace(/\s+/g, '-');
  // TODO: vem do backend com o ref real do usuário
  const referralLink = `https://${slug}.nortoken.app/?ref=${config.contractAddress.slice(2, 10)}`;

  const [copied, setCopied] = useState(false);
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 4000);
    } catch {}
  };
  const share = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Entre na pré-venda do ${config.projectName} 🚀`)}&url=${encodeURIComponent(referralLink)}`;
    window.open(url, '_blank', 'noreferrer');
  };

  const steps = [
    { n: '01', title: 'Compartilhe seu link único de indicação' },
    { n: '02', title: 'Seu indicado entra na pré-venda' },
    { n: '03', title: 'Ganhe sua comissão na hora' },
  ];

  const recent = [
    { wallet: '0xA1B2...C3D4', level: 1, amount: 120 },
    { wallet: '0xE5F6...7890', level: 1, amount: 48 },
    { wallet: '0x1234...5678', level: 2, amount: 24 },
    { wallet: '0x9ABC...DEF0', level: 1, amount: 200 },
    { wallet: '0x5678...1234', level: 3, amount: 12 },
  ];

  return (
    <div className="space-y-6">
      {/* ════════════ HERO: comissão + link + breakdown ════════════ */}
      <div className="rounded-2xl p-6 sm:p-8" style={{ background: T.card }}>
        <div className="flex flex-col xl:flex-row items-start justify-between gap-6">
          {/* esquerda */}
          <div className="w-full xl:w-auto xl:flex-1">
            <h2 className="mb-6 max-w-md uppercase font-bold text-2xl md:text-3xl leading-tight" style={{ fontFamily: heading, color: `var(--wl-fg)` }}>
              Ganhe até <span style={{ color: `var(--wl-primary)` }}>{totalCommission}%</span> de comissão em cada indicação!
            </h2>

            <label className="block mb-2 uppercase text-sm font-bold" style={{ fontFamily: heading, color: `var(--wl-fg)` }}>Seu link de indicação</label>
            <div className="flex items-center gap-2 pl-4 pr-2 py-2 rounded-2xl max-w-xl" style={{ border: T.border, background: T.surface }}>
              <span className="flex-1 truncate font-semibold text-sm sm:text-base" style={{ fontFamily: heading, color: `var(--wl-fg)` }}>{referralLink}</span>
              <button
                onClick={copyLink}
                className="shrink-0 rounded-xl px-4 py-3 flex items-center gap-2 uppercase text-sm font-bold cursor-pointer transition-all"
                style={{ background: `linear-gradient(90deg, transparent, var(--wl-primary))`, color: `var(--wl-deep)`, fontFamily: heading }}
              >
                {copied ? <><Check className="w-4 h-4" /> Copiado</> : <><Copy className="w-4 h-4" /> Copiar</>}
              </button>
            </div>

            <button
              onClick={share}
              className="wl-btn mt-3 rounded-xl px-5 py-3 uppercase text-sm font-bold"
              style={{ background: T.surface, color: `var(--wl-primary)`, fontFamily: heading }}
            >
              <span className="btn-inner">
                <span className="btn-normal-text inline-flex items-center gap-2"><Share2 className="w-4 h-4" /> Compartilhar</span>
                <span className="btn-hover-text inline-flex items-center gap-2"><Share2 className="w-4 h-4" /> Compartilhar</span>
              </span>
            </button>
          </div>

          {/* direita: breakdown por nível */}
          <div className="w-full xl:w-auto grid grid-cols-1 sm:grid-cols-3 rounded-2xl overflow-hidden" style={{ border: `1px solid ${T.divider}` }}>
            {tiers.map((t, i) => (
              <div
                key={t.level}
                className="px-5 py-5 min-w-[150px]"
                style={{ background: T.card, borderLeft: i > 0 ? `1px solid ${T.divider}` : 'none' }}
              >
                <div className="mb-1 text-2xl md:text-3xl font-bold" style={{ fontFamily: heading, color: `var(--wl-primary)` }}>{t.commission}%</div>
                <div className="text-[11px] uppercase tracking-widest font-bold opacity-60 mb-1" style={{ fontFamily: heading }}>Nível {t.level}</div>
                <p className="text-[11px] leading-snug opacity-60">{t.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════ PASSOS 01/02/03 ════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {steps.map((s) => (
          <div key={s.n} className="rounded-2xl px-6 py-6 flex flex-col justify-between gap-7" style={{ background: T.surface }}>
            <h4 className="uppercase text-base font-bold leading-snug" style={{ fontFamily: heading, color: `var(--wl-fg)` }}>{s.title}</h4>
            <span
              className="uppercase text-4xl md:text-[50px] leading-none font-bold"
              style={{ fontFamily: heading, background: `linear-gradient(to bottom, var(--wl-fg), transparent)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}
            >
              {s.n}
            </span>
          </div>
        ))}
      </div>

      {/* ════════════ MINHAS RECOMPENSAS ════════════ */}
      <div className="rounded-2xl p-6 sm:p-8" style={{ background: T.card }}>
        <h2 className="mb-6 uppercase font-bold text-2xl md:text-3xl" style={{ fontFamily: heading, color: `var(--wl-fg)` }}>Minhas Recompensas</h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* stats */}
          <div className="lg:col-span-4 grid gap-5 content-start">
            <div className="rounded-2xl px-6 py-6" style={{ background: T.surface }}>
              <div className="mb-1.5 text-2xl md:text-3xl font-bold" style={{ fontFamily: heading, color: `var(--wl-fg)` }}>$ 485,30</div>
              <div className="text-sm font-medium opacity-70">Ganhos totais de indicação</div>
            </div>
            <div className="rounded-2xl px-6 py-6" style={{ background: T.surface }}>
              <div className="mb-1.5 text-2xl md:text-3xl font-bold" style={{ fontFamily: heading, color: `var(--wl-fg)` }}>1.240 ${sym}</div>
              <div className="text-sm font-medium opacity-70">Ganhos em ${sym}</div>
            </div>
          </div>

          {/* lista de indicados (referrel-list) */}
          <div className="lg:col-span-8 rounded-2xl overflow-hidden px-6" style={{ background: T.surface }}>
            {recent.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 py-5 border-b last:border-b-0"
                style={{ borderColor: T.divider }}
              >
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: `color-mix(in srgb, var(--wl-primary) 18%, transparent)`, color: `var(--wl-primary)` }}>
                    {r.wallet.slice(2, 4).toUpperCase()}
                  </span>
                  <div>
                    <div className="font-mono text-sm" style={{ color: `var(--wl-fg)` }}>{r.wallet}</div>
                    <div className="text-[10px] uppercase tracking-widest opacity-50 font-mono">Nível {r.level}</div>
                  </div>
                </div>
                <div className="font-bold font-mono" style={{ color: `var(--wl-primary)` }}>+{r.amount} ${sym}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
