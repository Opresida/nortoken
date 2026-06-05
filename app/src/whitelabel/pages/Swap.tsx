import React, { useState } from 'react';
import { ArrowDown, Settings, Info, Zap } from 'lucide-react';
import type { WhitelabelConfig } from '../types';

interface Props {
  config: WhitelabelConfig;
}

const AVAILABLE_TOKENS = [
  { symbol: 'USDC', name: 'USD Coin',  balance: 1240.0 },
  { symbol: 'USDT', name: 'Tether',    balance: 580.0 },
  { symbol: 'WETH', name: 'Wrapped ETH', balance: 0.8 },
];

export default function SwapPage({ config }: Props) {
  const [fromAmount, setFromAmount] = useState('1');
  const [fromToken, setFromToken] = useState('USDC');
  const [slippage, setSlippage] = useState(0.5);
  const rate = 4231.5;
  const toAmount = (parseFloat(fromAmount) || 0) * rate;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold" style={{ fontFamily: config.theme.fontHeading }}>
          Troque tokens em segundos
        </h2>
        <p className="text-sm opacity-60 mt-1">Powered by Jupiter aggregator · zero KYC</p>
      </div>

      <div
        className="rounded-2xl p-6 space-y-1"
        style={{
          background: `var(--wl-card)`,
          border: `1px solid color-mix(in srgb, var(--wl-primary) 14%, transparent)`,
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="text-[10px] font-mono uppercase tracking-widest opacity-50">Swap</div>
          <button className="p-2 rounded-md hover:bg-white/5 cursor-pointer">
            <Settings className="w-4 h-4 opacity-60" />
          </button>
        </div>

        {/* From */}
        <div
          className="rounded-xl p-4"
          style={{ background: `color-mix(in srgb, var(--wl-fg) 4%, transparent)` }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest opacity-50">De</span>
            <span className="text-[10px] font-mono opacity-50">
              Balance: {AVAILABLE_TOKENS.find((t) => t.symbol === fromToken)?.balance.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="flex-1 bg-transparent border-0 outline-none text-2xl font-bold font-mono"
              placeholder="0.0"
            />
            <select
              value={fromToken}
              onChange={(e) => setFromToken(e.target.value)}
              className="px-3 py-2 rounded-lg font-bold text-sm cursor-pointer outline-none"
              style={{
                background: `color-mix(in srgb, var(--wl-primary) 14%, transparent)`,
                color: `var(--wl-primary)`,
              }}
            >
              {AVAILABLE_TOKENS.map((t) => (
                <option key={t.symbol} value={t.symbol} className="bg-black">
                  {t.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center py-1">
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:rotate-180"
            style={{
              background: `var(--wl-deep)`,
              border: `1px solid color-mix(in srgb, var(--wl-primary) 30%, transparent)`,
              color: `var(--wl-primary)`,
            }}
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>

        {/* To */}
        <div
          className="rounded-xl p-4"
          style={{ background: `color-mix(in srgb, var(--wl-fg) 4%, transparent)` }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest opacity-50">Para</span>
            <span className="text-[10px] font-mono opacity-50">Estimado</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 text-2xl font-bold font-mono">
              {toAmount.toFixed(2)}
            </div>
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-sm"
              style={{
                background: `color-mix(in srgb, var(--wl-primary) 14%, transparent)`,
                color: `var(--wl-primary)`,
              }}
            >
              <span>${config.tokenSymbol}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="pt-4 mt-4 border-t space-y-2 text-xs" style={{ borderColor: `color-mix(in srgb, var(--wl-primary) 10%, transparent)` }}>
          <div className="flex justify-between opacity-70">
            <span>Taxa de Conversão</span>
            <span className="font-mono">1 {fromToken} ≈ {rate.toLocaleString('en-US')} ${config.tokenSymbol}</span>
          </div>
          <div className="flex justify-between opacity-70">
            <span>Slippage Tolerada</span>
            <span className="font-mono" style={{ color: `var(--wl-primary)` }}>{slippage}%</span>
          </div>
          <div className="flex justify-between opacity-70">
            <span>Taxa de Rede</span>
            <span className="font-mono">~0.01 USDC</span>
          </div>
          <div className="flex justify-between opacity-70">
            <span>Mínimo Recebido</span>
            <span className="font-mono">{(toAmount * (1 - slippage / 100)).toFixed(2)} ${config.tokenSymbol}</span>
          </div>
        </div>

        {/* Slippage presets */}
        <div className="flex gap-2 pt-2">
          {[0.1, 0.5, 1, 3].map((s) => (
            <button
              key={s}
              onClick={() => setSlippage(s)}
              className="flex-1 py-1.5 rounded-md text-xs font-mono font-bold cursor-pointer transition-all"
              style={{
                background: slippage === s
                  ? `color-mix(in srgb, var(--wl-primary) 18%, transparent)`
                  : `color-mix(in srgb, var(--wl-fg) 4%, transparent)`,
                color: slippage === s ? `var(--wl-primary)` : `var(--wl-fg)`,
                border: `1px solid ${slippage === s ? 'color-mix(in srgb, var(--wl-primary) 30%, transparent)' : 'transparent'}`,
              }}
            >
              {s}%
            </button>
          ))}
        </div>

        {/* Botão swap */}
        <button
          className="w-full mt-4 py-4 rounded-xl font-extrabold text-sm uppercase tracking-wider transition-all hover:brightness-110 cursor-pointer flex items-center justify-center gap-2"
          style={{
            background: `linear-gradient(90deg, var(--wl-primary), var(--wl-primary-soft))`,
            color: `var(--wl-deep)`,
          }}
        >
          <Zap className="w-4 h-4" />
          Confirmar Swap
        </button>
      </div>

      {/* Info card */}
      <div
        className="rounded-xl p-4 flex items-start gap-3 text-xs"
        style={{
          background: `color-mix(in srgb, var(--wl-primary) 6%, transparent)`,
          border: `1px solid color-mix(in srgb, var(--wl-primary) 14%, transparent)`,
        }}
      >
        <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: `var(--wl-primary)` }} />
        <p className="opacity-80 leading-relaxed">
          Suas trades são roteadas pelo melhor pool disponível na rede EVM. Sem custódia — você sempre mantém o controle dos seus fundos.
          Demo em modo sandbox: nenhuma transação real é executada.
        </p>
      </div>
    </div>
  );
}
