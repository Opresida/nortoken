import React, { useState } from 'react';
import { Copy, Check, Wallet, CreditCard, CheckCircle2 } from 'lucide-react';
import type { WhitelabelConfig, WhitelabelFeatureKey } from '../types';

interface Props {
  config: WhitelabelConfig;
  setCurrentPage: (page: WhitelabelFeatureKey) => void;
}

// Tema Aizon → CSS vars multi-tenant (mesmo padrão de Home/Stake/Referral)
const T = {
  card: 'color-mix(in srgb, var(--wl-fg) 6%, transparent)',
  surface: 'color-mix(in srgb, var(--wl-fg) 4%, transparent)',
  track: 'color-mix(in srgb, var(--wl-fg) 10%, transparent)',
  inputBg: 'color-mix(in srgb, var(--wl-fg) 4%, transparent)',
  border: '2px solid color-mix(in srgb, var(--wl-fg) 12%, transparent)',
  divider: 'color-mix(in srgb, var(--wl-fg) 12%, transparent)',
};

// Tokens de pagamento (demo) — TODO: rede/preços reais
const PAY_TOKENS = [
  { sym: 'ETH', usd: 3000, balance: 2 },
  { sym: 'USDC', usd: 1, balance: 23500 },
  { sym: 'USDT', usd: 1, balance: 5000 },
];

export default function BuyPage({ config, setCurrentPage }: Props) {
  const sym = config.tokenSymbol;
  const heading = config.theme.fontHeading;
  const presale = config.presale;
  const price = presale?.priceUsd ?? 0.042;
  const nextPrice = presale?.nextPriceUsd ?? 0.05;
  const pct = presale ? Math.min(100, (presale.raisedUsd / presale.goalUsd) * 100) : 0;

  const [payId, setPayId] = useState(1); // default USDC
  const [amount, setAmount] = useState('100');
  const [copied, setCopied] = useState(false);

  const pay = PAY_TOKENS[payId];
  const usd = (parseFloat(amount) || 0) * pay.usd;
  const received = usd / price;

  const copyAddr = async () => {
    try {
      await navigator.clipboard.writeText(config.contractAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 4000);
    } catch {}
  };

  const shortAddr = `${config.contractAddress.slice(0, 6)}...${config.contractAddress.slice(-4)}`;

  const tokenInfo = [
    { label: 'Nome do token', value: config.projectName },
    { label: 'Símbolo', value: `$${sym}` },
    { label: 'Supply total', value: config.totalSupply.toLocaleString('pt-BR') },
    { label: 'Rede', value: config.network },
  ];

  const steps = [
    { n: '01', icon: Wallet, title: 'Conecte sua carteira', desc: 'Conecte com MetaMask ou Trust Wallet de forma segura para iniciar a compra.' },
    { n: '02', icon: CreditCard, title: 'Escolha o pagamento', desc: 'Selecione a moeda: ETH, USDC ou USDT — o que preferir.' },
    { n: '03', icon: CheckCircle2, title: 'Confirme a transação', desc: 'Revise os detalhes, confirme a compra e receba seu token na hora.' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* ════════════ ESQUERDA — WIDGET DE COMPRA ════════════ */}
      <div className="lg:col-span-8 rounded-2xl overflow-hidden" style={{ background: T.card }}>
        {/* faixa de preço */}
        <div className="px-6 sm:px-8 py-4 flex items-center gap-5 flex-wrap" style={{ background: T.surface }}>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: `var(--wl-primary)` }} />
            <h4 className="uppercase text-sm font-bold" style={{ fontFamily: heading, color: `color-mix(in srgb, var(--wl-primary) 80%, var(--wl-fg))` }}>Preço atual: 1 ${sym} = ${price}</h4>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: `var(--wl-primary-soft)` }} />
            <h4 className="uppercase text-sm font-bold" style={{ fontFamily: heading, color: `color-mix(in srgb, var(--wl-primary) 80%, var(--wl-fg))` }}>Próximo: 1 ${sym} = ${nextPrice}</h4>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {/* sale progress */}
          {presale && (
            <>
              <div className="mb-5 flex items-center gap-4 flex-wrap justify-between">
                <h2 className="uppercase font-bold text-xl md:text-2xl" style={{ fontFamily: heading, color: `var(--wl-fg)` }}>Progresso da Venda</h2>
                <h4 className="uppercase text-xl md:text-2xl font-bold" style={{ fontFamily: heading, color: `var(--wl-fg)` }}>{pct.toFixed(2)}%</h4>
              </div>
              <div className="mb-3 w-full h-7 rounded-[10px] overflow-hidden" style={{ background: T.track }}>
                <div className="h-full" style={{ width: `${pct}%`, background: `var(--wl-primary)`, boxShadow: `0 0 18px var(--wl-primary)` }} />
              </div>
              <div className="mb-8 flex items-center gap-4 flex-wrap justify-between font-bold uppercase text-sm" style={{ fontFamily: heading, color: `var(--wl-fg)` }}>
                <p><span className="opacity-60">Arrecadado:</span> {presale.raisedUsd.toLocaleString('pt-BR')} USD</p>
                <p><span className="opacity-60">Meta:</span> {presale.goalUsd.toLocaleString('pt-BR')} USD</p>
              </div>
            </>
          )}

          {/* seletor de pagamento */}
          <h4 className="mb-3 uppercase text-sm font-bold" style={{ fontFamily: heading, color: `var(--wl-fg)` }}>Pagar com</h4>
          <div className="mb-7 grid grid-cols-3 gap-3">
            {PAY_TOKENS.map((t, i) => {
              const sel = i === payId;
              return (
                <button
                  key={t.sym}
                  onClick={() => setPayId(i)}
                  className="relative rounded-2xl px-3 py-4 flex items-center justify-center gap-2 uppercase text-sm sm:text-base font-bold cursor-pointer transition-all"
                  style={{ background: T.inputBg, border: sel ? `2px solid var(--wl-primary)` : T.border, color: `var(--wl-fg)`, fontFamily: heading }}
                >
                  {sel && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ background: `var(--wl-fg)` }}>
                      <span className="w-2 h-2 rounded-full" style={{ background: `var(--wl-primary)` }} />
                    </span>
                  )}
                  {t.sym}
                </button>
              );
            })}
          </div>

          {/* form */}
          <div className="grid md:grid-cols-2 gap-5 mb-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="uppercase text-sm font-bold" style={{ fontFamily: heading, color: `var(--wl-fg)` }}>Você paga</label>
                <button onClick={() => setAmount(String(pay.balance))} className="text-[11px] font-mono opacity-60 hover:opacity-100 cursor-pointer">Saldo: {pay.balance.toLocaleString('pt-BR')} · Max</button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="0"
                  className="w-full rounded-2xl px-4 py-4 pr-20 text-lg sm:text-2xl font-bold outline-none transition"
                  style={{ border: T.border, background: T.inputBg, color: `var(--wl-fg)`, fontFamily: heading }}
                />
                <span className="absolute top-1/2 right-4 -translate-y-1/2 px-2.5 py-1 rounded-[10px] uppercase text-sm font-bold" style={{ background: T.track, color: `var(--wl-fg)`, fontFamily: heading }}>{pay.sym}</span>
              </div>
            </div>
            <div>
              <label className="block mb-2 uppercase text-sm font-bold" style={{ fontFamily: heading, color: `var(--wl-fg)` }}>Valor em USD</label>
              <div className="relative">
                <input
                  type="text"
                  disabled
                  value={usd.toFixed(2)}
                  className="w-full rounded-2xl px-4 py-4 pr-20 text-lg sm:text-2xl font-bold outline-none"
                  style={{ border: T.border, background: T.inputBg, color: `var(--wl-fg)`, fontFamily: heading }}
                />
                <span className="absolute top-1/2 right-4 -translate-y-1/2 px-2.5 py-1 rounded-[10px] uppercase text-sm font-bold" style={{ background: T.track, color: `var(--wl-fg)`, fontFamily: heading }}>USD</span>
              </div>
            </div>
          </div>

          <div className="mb-7">
            <label className="block mb-2 uppercase text-sm font-bold" style={{ fontFamily: heading, color: `var(--wl-fg)` }}>Você recebe</label>
            <div className="relative rounded-2xl px-4 py-4 flex items-center justify-between" style={{ border: T.border, background: T.inputBg }}>
              <span className="text-lg sm:text-2xl font-bold" style={{ fontFamily: heading, color: `var(--wl-primary)` }}>{received.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
              <span className="px-2.5 py-1 rounded-[10px] uppercase text-sm font-bold" style={{ background: T.track, color: `var(--wl-fg)`, fontFamily: heading }}>${sym}</span>
            </div>
          </div>

          {/* botões */}
          <div className="space-y-3">
            <button className="wl-btn w-full rounded-2xl py-5 uppercase text-base font-bold" style={{ background: `var(--wl-primary)`, color: `var(--wl-deep)`, fontFamily: heading, boxShadow: `0 0 30px color-mix(in srgb, var(--wl-primary) 30%, transparent)` }}>
              <span className="btn-inner">
                <span className="btn-normal-text">Comprar Agora</span>
                <span className="btn-hover-text">Comprar Agora</span>
              </span>
            </button>
            <button onClick={() => setCurrentPage('stake')} className="wl-btn w-full rounded-2xl py-5 uppercase text-base font-bold" style={{ background: `color-mix(in srgb, var(--wl-primary) 15%, transparent)`, color: `var(--wl-primary)`, fontFamily: heading }}>
              <span className="btn-inner">
                <span className="btn-normal-text">Comprar &amp; fazer Stake</span>
                <span className="btn-hover-text">Comprar &amp; fazer Stake</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ════════════ DIREITA ════════════ */}
      <div className="lg:col-span-4 grid gap-6 content-start">
        {/* Token Info */}
        <div className="rounded-2xl px-6 sm:px-8 py-6" style={{ background: T.card }}>
          <h2 className="mb-5 uppercase font-bold text-xl md:text-2xl" style={{ fontFamily: heading, color: `var(--wl-fg)` }}>Informações do Token</h2>
          <ul>
            {tokenInfo.map((it) => (
              <li key={it.label} className="py-3.5 border-b flex items-center gap-3 justify-between" style={{ borderColor: T.divider }}>
                <span className="text-sm font-medium opacity-70">{it.label}</span>
                <span className="text-right text-sm font-semibold" style={{ color: `var(--wl-fg)` }}>{it.value}</span>
              </li>
            ))}
            <li className="py-3.5 border-b flex items-center gap-3 justify-between" style={{ borderColor: T.divider }}>
              <span className="text-sm font-medium opacity-70">Endereço</span>
              <div className="flex items-center gap-1.5">
                <button onClick={copyAddr} className="cursor-pointer" style={{ color: `var(--wl-primary)` }} title="Copiar endereço">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                <span className="text-sm font-semibold font-mono" style={{ color: `var(--wl-fg)` }}>{shortAddr}</span>
              </div>
            </li>
            <li className="pt-3.5 text-right">
              <p className="text-xs font-medium opacity-60">Não pague diretamente neste endereço*</p>
            </li>
          </ul>
        </div>

        {/* Como comprar */}
        <div className="rounded-2xl px-6 sm:px-8 py-6" style={{ background: T.card }}>
          <h2 className="mb-6 uppercase font-bold text-xl md:text-2xl" style={{ fontFamily: heading, color: `var(--wl-fg)` }}>Como comprar</h2>
          <div className="grid gap-7">
            {steps.map((s, i) => (
              <div key={s.n} className="flex gap-4 relative">
                {i < steps.length - 1 && (
                  <div className="absolute top-11 left-5 h-[calc(100%+0.5rem)] w-0 border-l-2 border-dashed -translate-x-1/2" style={{ borderColor: T.divider }} />
                )}
                <div className="shrink-0 w-10 h-10 rounded-full border-2 border-dashed flex items-center justify-center" style={{ borderColor: `color-mix(in srgb, var(--wl-primary) 40%, transparent)` }}>
                  <span className="uppercase text-base font-bold" style={{ fontFamily: heading, color: `var(--wl-fg)` }}>{s.n}</span>
                </div>
                <div>
                  <h4 className="mb-1.5 uppercase text-sm font-bold" style={{ fontFamily: heading, color: `var(--wl-fg)` }}>{s.title}</h4>
                  <p className="text-[13px] leading-snug font-medium opacity-70">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
