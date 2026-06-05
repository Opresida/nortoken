import React, { useState } from 'react';
import { Landmark, Bell, Mail } from 'lucide-react';
import type { WhitelabelConfig } from '../types';

interface Props {
  config: WhitelabelConfig;
}

export default function LendingPage({ config }: Props) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="max-w-3xl mx-auto">
      <div
        className="rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, var(--wl-card), var(--wl-deep))`,
          border: `1px solid color-mix(in srgb, var(--wl-primary) 18%, transparent)`,
        }}
      >
        {/* Glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: `var(--wl-primary)` }}
        />

        <div className="relative">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
            style={{
              background: `color-mix(in srgb, var(--wl-primary) 18%, transparent)`,
              border: `1px solid color-mix(in srgb, var(--wl-primary) 30%, transparent)`,
            }}
          >
            <Landmark className="w-7 h-7" style={{ color: `var(--wl-primary)` }} />
          </div>

          <span
            className="inline-block text-[10px] font-black tracking-widest uppercase font-mono px-3 py-1 rounded-full mb-4"
            style={{
              background: `color-mix(in srgb, var(--wl-primary) 14%, transparent)`,
              color: `var(--wl-primary)`,
            }}
          >
            Q1 2027
          </span>

          <h2
            className="text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight"
            style={{ fontFamily: config.theme.fontHeading }}
          >
            Lending está chegando.
          </h2>

          <p className="max-w-xl mx-auto text-base opacity-70 leading-relaxed mb-8">
            Empréstimos descentralizados com colateral em ${config.tokenSymbol}. Use seu token como garantia,
            tome USDC ou USDT sem vender sua posição. Yield-aggregator integrado para maximizar APY.
          </p>

          {/* Features preview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto mb-8">
            {[
              { label: 'LTV até 70%',       desc: 'Loan-to-Value competitivo' },
              { label: 'Sem KYC',            desc: 'Permissionless, on-chain' },
              { label: 'APR dinâmico',       desc: 'Ajustado por demanda' },
            ].map((f) => (
              <div
                key={f.label}
                className="p-4 rounded-xl text-left"
                style={{
                  background: `color-mix(in srgb, var(--wl-fg) 4%, transparent)`,
                  border: `1px solid color-mix(in srgb, var(--wl-primary) 12%, transparent)`,
                }}
              >
                <div className="font-bold text-sm mb-1" style={{ color: `var(--wl-primary)` }}>
                  {f.label}
                </div>
                <div className="text-[11px] opacity-60">{f.desc}</div>
              </div>
            ))}
          </div>

          {/* Notify form */}
          {!submitted ? (
            <form
              onSubmit={(e) => { e.preventDefault(); if (email) setSubmitted(true); }}
              className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
            >
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-9 pr-3 py-3 rounded-lg bg-transparent outline-none text-sm"
                  style={{
                    background: `color-mix(in srgb, var(--wl-fg) 4%, transparent)`,
                    border: `1px solid color-mix(in srgb, var(--wl-primary) 18%, transparent)`,
                  }}
                />
              </div>
              <button
                type="submit"
                className="px-5 py-3 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all hover:brightness-110"
                style={{
                  background: `var(--wl-primary)`,
                  color: `var(--wl-deep)`,
                }}
              >
                <Bell className="w-3.5 h-3.5" />
                Avise-me
              </button>
            </form>
          ) : (
            <div
              className="inline-flex items-center gap-2 px-4 py-3 rounded-lg text-sm"
              style={{
                background: `color-mix(in srgb, var(--wl-primary) 14%, transparent)`,
                color: `var(--wl-primary)`,
                border: `1px solid color-mix(in srgb, var(--wl-primary) 30%, transparent)`,
              }}
            >
              <Bell className="w-4 h-4" />
              Você receberá um email quando o Lending lançar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
