import React, { useState } from 'react';
import { Copy, Check, Users, Award, TrendingUp, Share2 } from 'lucide-react';
import type { WhitelabelConfig } from '../types';

interface Props {
  config: WhitelabelConfig;
}

export default function ReferralPage({ config }: Props) {
  const [copied, setCopied] = useState(false);
  const referralLink = `https://nortoken.mazaricorp.com/p/${config.projectName.toLowerCase().replace(/\s/g, '-')}/ref/u7Xqj`;
  const referralCode = 'u7Xqj';

  const stats = [
    { icon: Users,      label: 'Indicados',     value: '12',     trend: '+3 esta semana' },
    { icon: Award,      label: 'Ganho Total',   value: '485 $' + config.tokenSymbol, trend: '$ 24,30 em USD' },
    { icon: TrendingUp, label: 'Pendentes',     value: '38 $' + config.tokenSymbol, trend: 'Próxima liberação 30/dias' },
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: config.theme.fontHeading }}>
          Programa de Indicação
        </h2>
        <p className="text-sm opacity-60">
          Convide amigos, ganhe comissão em 3 níveis. Sem limite, paga em ${config.tokenSymbol}.
        </p>
      </div>

      {/* Link box */}
      <div
        className="rounded-2xl p-6 sm:p-8"
        style={{
          background: `linear-gradient(135deg, color-mix(in srgb, var(--wl-primary) 14%, var(--wl-card)), var(--wl-card))`,
          border: `1px solid var(--wl-primary)`,
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Share2 className="w-4 h-4" style={{ color: `var(--wl-primary)` }} />
          <span className="text-[10px] font-mono uppercase tracking-widest opacity-70">
            Seu link de indicação
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div
            className="flex-1 px-4 py-3 rounded-lg font-mono text-xs truncate"
            style={{
              background: `color-mix(in srgb, var(--wl-deep) 60%, transparent)`,
              border: `1px solid color-mix(in srgb, var(--wl-primary) 20%, transparent)`,
            }}
          >
            {referralLink}
          </div>
          <button
            onClick={copyLink}
            className="px-5 py-3 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
            style={{
              background: copied ? `color-mix(in srgb, var(--wl-primary) 30%, transparent)` : `var(--wl-primary)`,
              color: copied ? `var(--wl-primary)` : `var(--wl-deep)`,
            }}
          >
            {copied ? <><Check className="w-3.5 h-3.5" /> Copiado!</> : <><Copy className="w-3.5 h-3.5" /> Copiar</>}
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs">
          <span className="opacity-60">Seu código:</span>
          <code
            className="px-2 py-1 rounded font-mono font-bold"
            style={{
              background: `color-mix(in srgb, var(--wl-primary) 14%, transparent)`,
              color: `var(--wl-primary)`,
            }}
          >
            {referralCode}
          </code>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4" style={{ color: `var(--wl-primary)` }} />
                <span className="text-[10px] font-mono uppercase tracking-widest opacity-50">{s.label}</span>
              </div>
              <div className="text-xl font-bold mb-1 font-mono">{s.value}</div>
              <div className="text-[11px] opacity-50">{s.trend}</div>
            </div>
          );
        })}
      </div>

      {/* Tiers */}
      <div>
        <h3 className="text-lg font-bold mb-4" style={{ fontFamily: config.theme.fontHeading }}>
          Estrutura de Comissões
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {config.referralTiers.map((tier) => (
            <div
              key={tier.level}
              className="p-5 rounded-xl"
              style={{
                background: `var(--wl-card)`,
                border: `1px solid color-mix(in srgb, var(--wl-primary) 12%, transparent)`,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded font-mono"
                  style={{
                    background: `color-mix(in srgb, var(--wl-primary) 14%, transparent)`,
                    color: `var(--wl-primary)`,
                  }}
                >
                  Nível {tier.level}
                </span>
                <span className="text-3xl font-extrabold font-mono" style={{ color: `var(--wl-primary)` }}>
                  {tier.commission}%
                </span>
              </div>
              <p className="text-sm opacity-70 leading-relaxed">{tier.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent referrals */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: `var(--wl-card)`,
          border: `1px solid color-mix(in srgb, var(--wl-primary) 12%, transparent)`,
        }}
      >
        <h3 className="text-base font-bold mb-4" style={{ fontFamily: config.theme.fontHeading }}>
          Indicações recentes
        </h3>
        <div className="space-y-2">
          {[
            { user: 'maria.base', level: 1, amount: 120, time: 'há 2 horas' },
            { user: 'joão.eth',  level: 1, amount: 48,  time: 'há 1 dia' },
            { user: 'ana.bnb',   level: 2, amount: 24,  time: 'há 3 dias' },
            { user: 'carlos.x',  level: 1, amount: 200, time: 'há 1 semana' },
          ].map((r, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-3 rounded-lg text-sm"
              style={{ background: `color-mix(in srgb, var(--wl-fg) 3%, transparent)` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
                  style={{
                    background: `color-mix(in srgb, var(--wl-primary) 18%, transparent)`,
                    color: `var(--wl-primary)`,
                  }}
                >
                  {r.user.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-mono">{r.user}</div>
                  <div className="text-[10px] opacity-50 font-mono uppercase tracking-widest">
                    Nível {r.level} · {r.time}
                  </div>
                </div>
              </div>
              <div className="font-mono font-bold" style={{ color: `var(--wl-primary)` }}>
                +{r.amount} ${config.tokenSymbol}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
