import React, { useState } from 'react';
import { Wallet, Check } from 'lucide-react';
import type { WhitelabelConfig } from '../types';

interface Props {
  config: WhitelabelConfig;
}

const PRICE_USD = 0.042;

export default function BuyPage({ config }: Props) {
  const [amount, setAmount] = useState('100');

  const amountNum = parseFloat(amount) || 0;
  const tokensReceived = amountNum / PRICE_USD;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold" style={{ fontFamily: config.theme.fontHeading }}>
          Comprar ${config.tokenSymbol}
        </h2>
        <p className="text-sm opacity-60 mt-1">Pague com USDC direto da sua carteira · liquidação instantânea</p>
      </div>

      <div
        className="rounded-2xl p-6 space-y-5"
        style={{
          background: `var(--wl-card)`,
          border: `1px solid color-mix(in srgb, var(--wl-primary) 14%, transparent)`,
        }}
      >
        {/* Pagamento em USDC (self-custody, sem fiat) */}
        <div
          className="rounded-xl p-4 flex items-center gap-3"
          style={{
            background: `color-mix(in srgb, var(--wl-primary) 10%, transparent)`,
            border: `1px solid color-mix(in srgb, var(--wl-primary) 25%, transparent)`,
          }}
        >
          <Wallet className="w-5 h-5" style={{ color: `var(--wl-primary)` }} />
          <div>
            <div className="text-sm font-bold" style={{ color: `var(--wl-primary)` }}>
              Pagamento em USDC
            </div>
            <div className="text-[10px] opacity-60 font-mono uppercase tracking-widest">
              On-chain · self-custody · sem fiat
            </div>
          </div>
        </div>

        {/* Input amount */}
        <div
          className="rounded-xl p-5"
          style={{ background: `color-mix(in srgb, var(--wl-fg) 4%, transparent)` }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest opacity-50">Você paga (USDC)</span>
            <div className="flex gap-1.5">
              {[50, 100, 500, 1000].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset.toString())}
                  className="text-[10px] font-mono px-2 py-0.5 rounded cursor-pointer transition-all"
                  style={{
                    background: amount === preset.toString()
                      ? `color-mix(in srgb, var(--wl-primary) 18%, transparent)`
                      : 'transparent',
                    color: amount === preset.toString() ? `var(--wl-primary)` : `var(--wl-fg)`,
                    border: `1px solid color-mix(in srgb, var(--wl-fg) 12%, transparent)`,
                  }}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold opacity-50 font-mono">USDC</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-transparent border-0 outline-none text-3xl font-bold font-mono"
              placeholder="0"
            />
          </div>
        </div>

        {/* Recebimento */}
        <div
          className="rounded-xl p-5 border-2 border-dashed"
          style={{
            borderColor: `color-mix(in srgb, var(--wl-primary) 30%, transparent)`,
            background: `color-mix(in srgb, var(--wl-primary) 5%, transparent)`,
          }}
        >
          <div className="text-[10px] font-mono uppercase tracking-widest opacity-50 mb-2">Você recebe</div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold font-mono" style={{ color: `var(--wl-primary)` }}>
              {tokensReceived.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </span>
            <span className="font-bold opacity-70">${config.tokenSymbol}</span>
          </div>
          <div className="text-[11px] opacity-60 mt-2 font-mono">
            Cotação: 1 ${config.tokenSymbol} = {PRICE_USD.toFixed(4)} USDC
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-2 text-xs pt-2 border-t" style={{ borderColor: `color-mix(in srgb, var(--wl-primary) 10%, transparent)` }}>
          <div className="flex justify-between opacity-70">
            <span>Taxa da plataforma</span>
            <span className="font-mono">2.5%</span>
          </div>
          <div className="flex justify-between opacity-70">
            <span>Taxa de rede</span>
            <span className="font-mono">~0.01 USDC</span>
          </div>
          <div className="flex justify-between opacity-70">
            <span>Liquidação</span>
            <span className="font-mono">Instantânea</span>
          </div>
          <div className="flex justify-between opacity-70">
            <span>Custódia</span>
            <span className="font-mono" style={{ color: `var(--wl-primary)` }}>Sua carteira</span>
          </div>
        </div>

        <button
          className="w-full py-4 rounded-xl font-extrabold text-sm uppercase tracking-wider cursor-pointer transition-all hover:brightness-110 flex items-center justify-center gap-2"
          style={{
            background: `linear-gradient(90deg, var(--wl-primary), var(--wl-primary-soft))`,
            color: `var(--wl-deep)`,
          }}
        >
          <Check className="w-4 h-4" />
          Confirmar Compra de {tokensReceived.toLocaleString('en-US', { maximumFractionDigits: 0 })} ${config.tokenSymbol}
        </button>
      </div>
    </div>
  );
}
