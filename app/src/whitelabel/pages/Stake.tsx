import React, { useState } from 'react';
import type { WhitelabelConfig, WhitelabelFeatureKey } from '../types';

interface Props {
  config: WhitelabelConfig;
  setCurrentPage: (page: WhitelabelFeatureKey) => void;
}

// Tema Aizon → CSS vars multi-tenant (mesmo padrão da Home)
const T = {
  card: 'color-mix(in srgb, var(--wl-fg) 6%, transparent)',
  surface: 'color-mix(in srgb, var(--wl-fg) 4%, transparent)',
  track: 'color-mix(in srgb, var(--wl-fg) 10%, transparent)',
  inputBg: 'color-mix(in srgb, var(--wl-fg) 4%, transparent)',
  border: '2px solid color-mix(in srgb, var(--wl-fg) 12%, transparent)',
  primarySoft: 'color-mix(in srgb, var(--wl-primary) 12%, transparent)',
};

export default function StakePage({ config, setCurrentPage }: Props) {
  const pools = config.stakePools;
  const sym = config.tokenSymbol;
  const heading = config.theme.fontHeading;

  const [selectedPoolId, setSelectedPoolId] = useState<string>(pools[0]?.id ?? '');
  const [amount, setAmount] = useState('');
  const [modal, setModal] = useState<null | 'stake' | 'unstake' | 'claim'>(null);

  const selected = pools.find((p) => p.id === selectedPoolId) ?? pools[0];
  const maxApr = Math.max(...pools.map((p) => p.apr));

  const totalStakedNetwork = pools.reduce((a, p) => a + p.totalStaked, 0);
  const totalMyStaked = pools.reduce((a, p) => a + (p.myStaked ?? 0), 0);
  const totalMyRewards = pools.reduce((a, p) => a + (p.myReward ?? 0), 0);

  // Demo — virá da chain/config futuramente
  const walletBalance = 2569;
  const availableToStake = 23500;

  const estReward = ((parseFloat(amount) || 0) * selected.apr) / 100;

  const handleStake = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Digite uma quantidade para fazer stake.');
      return;
    }
    setModal('stake');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* ════════════ COLUNA ESQUERDA ════════════ */}
      <div className="lg:col-span-7 space-y-6">
        {/* Hero */}
        <div
          className="relative overflow-hidden rounded-2xl px-6 sm:px-9 pt-7 pb-9"
          style={{ background: `linear-gradient(180deg, color-mix(in srgb, var(--wl-primary) 10%, var(--wl-card)), var(--wl-card))`, border: `1px solid color-mix(in srgb, var(--wl-primary) 18%, transparent)` }}
        >
          <h2 className="mb-3 max-w-lg uppercase font-bold text-3xl sm:text-4xl lg:text-[42px] lg:leading-[1.1]" style={{ fontFamily: heading, color: `var(--wl-fg)` }}>
            Ganhe até <span style={{ color: `var(--wl-primary)` }}>{maxApr}%</span> ao ano com staking
          </h2>
          <p className="max-w-md text-sm sm:text-base leading-7 font-medium opacity-80">
            Ao fazer stake do seu ${sym}, você ganha um rendimento anual impressionante de até {maxApr}% (APY).
          </p>
        </div>

        {/* Form de stake */}
        <div className="rounded-2xl p-6 sm:p-8" style={{ background: T.card }}>
          <h3 className="mb-6 uppercase font-bold text-xl sm:text-2xl md:text-3xl" style={{ fontFamily: heading, color: `var(--wl-fg)` }}>
            Participe do stake
          </h3>

          <h4 className="mb-4 uppercase text-sm font-bold" style={{ fontFamily: heading, color: `var(--wl-fg)` }}>Duração do bloqueio</h4>
          <div className="mb-9 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {pools.map((p) => {
              const sel = p.id === selectedPoolId;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPoolId(p.id)}
                  className="relative rounded-2xl px-3 py-4 flex items-center justify-center uppercase text-sm sm:text-base font-bold cursor-pointer transition-all"
                  style={{
                    background: T.inputBg,
                    border: sel ? `2px solid var(--wl-primary)` : T.border,
                    color: `var(--wl-fg)`,
                    fontFamily: heading,
                  }}
                >
                  {sel && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ background: `var(--wl-fg)` }}>
                      <span className="w-2 h-2 rounded-full" style={{ background: `var(--wl-primary)` }} />
                    </span>
                  )}
                  {p.duration}
                </button>
              );
            })}
          </div>

          <h3 className="mb-5 uppercase text-2xl md:text-3xl font-bold" style={{ fontFamily: heading, color: `var(--wl-fg)` }}>
            APY: <span style={{ color: `var(--wl-primary)` }}>{selected.apr}%</span>
          </h3>

          <label className="block mb-2 uppercase text-sm font-bold" style={{ fontFamily: heading, color: `var(--wl-fg)` }}>Quantidade para stake</label>
          <div className="relative mb-2">
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="Digite a quantidade"
              className="w-full rounded-2xl px-4 sm:px-5 py-4 sm:py-5 text-lg sm:text-2xl font-bold outline-none"
              style={{ border: T.border, background: T.inputBg, color: `var(--wl-fg)`, fontFamily: heading }}
            />
            <button
              onClick={() => setAmount(String(availableToStake))}
              className="absolute top-1/2 right-3 sm:right-5 -translate-y-1/2 px-2.5 py-1 rounded-[10px] uppercase text-base font-bold cursor-pointer"
              style={{ background: `color-mix(in srgb, var(--wl-fg) 12%, transparent)`, color: `var(--wl-fg)`, fontFamily: heading }}
            >
              Max
            </button>
          </div>
          <div className="mb-6 text-xs font-mono opacity-50">Disponível: {availableToStake.toLocaleString('pt-BR')} ${sym} · mínimo {selected.minStake.toLocaleString('pt-BR')} ${sym}</div>

          <button
            onClick={handleStake}
            className="w-full rounded-2xl py-5 uppercase text-base font-bold cursor-pointer transition-all hover:scale-[1.01]"
            style={{ background: `var(--wl-primary)`, color: `var(--wl-deep)`, fontFamily: heading, boxShadow: `0 0 30px color-mix(in srgb, var(--wl-primary) 30%, transparent)` }}
          >
            Fazer Stake
          </button>
        </div>
      </div>

      {/* ════════════ COLUNA DIREITA ════════════ */}
      <div className="lg:col-span-5 grid gap-6 content-start">
        {/* Carteira + Recompensas */}
        <div className="rounded-2xl overflow-hidden" style={{ background: T.card }}>
          <div className="px-6 sm:px-8 pt-6 pb-5 flex items-end justify-between gap-4 flex-wrap" style={{ background: `linear-gradient(180deg, color-mix(in srgb, var(--wl-primary) 8%, transparent), transparent)` }}>
            <div>
              <h4 className="mb-3 capitalize text-sm font-bold opacity-80" style={{ fontFamily: heading }}>Minha Carteira</h4>
              <h2 className="capitalize text-2xl md:text-3xl font-bold" style={{ fontFamily: heading, color: `var(--wl-fg)` }}>{walletBalance.toLocaleString('pt-BR')} ${sym}</h2>
            </div>
            <button
              onClick={() => setCurrentPage('buy')}
              className="rounded-lg px-4 pt-2 pb-1.5 uppercase text-base font-bold cursor-pointer"
              style={{ background: T.track, color: `var(--wl-primary)`, fontFamily: heading }}
            >
              Comprar
            </button>
          </div>
          <div className="px-6 sm:px-8 py-5 flex items-center justify-between gap-4 flex-wrap" style={{ borderTop: `1px solid color-mix(in srgb, var(--wl-fg) 7%, transparent)` }}>
            <div>
              <h4 className="mb-3 capitalize text-sm font-bold opacity-80" style={{ fontFamily: heading }}>Recompensas Totais</h4>
              <h2 className="capitalize text-2xl md:text-3xl font-bold" style={{ fontFamily: heading, color: `var(--wl-fg)` }}>{totalMyRewards.toFixed(2)} ${sym}</h2>
            </div>
            <button
              onClick={() => setModal('claim')}
              className="wl-btn rounded-2xl px-5 py-3 uppercase text-base font-bold"
              style={{ background: T.track, color: `var(--wl-primary)`, fontFamily: heading }}
            >
              <span className="btn-inner">
                <span className="btn-normal-text">Resgatar</span>
                <span className="btn-hover-text">Resgatar</span>
              </span>
            </button>
          </div>
        </div>

        {/* Seu staked */}
        <div className="rounded-2xl px-6 sm:px-8 py-6 flex items-center justify-between gap-4 flex-wrap" style={{ background: T.card }}>
          <div>
            <h4 className="mb-3 capitalize text-sm font-bold opacity-80" style={{ fontFamily: heading }}>Seus tokens em stake</h4>
            <h2 className="capitalize text-2xl md:text-3xl font-bold" style={{ fontFamily: heading, color: `var(--wl-fg)` }}>{totalMyStaked.toLocaleString('pt-BR')} ${sym}</h2>
          </div>
          <button
            onClick={() => setModal('unstake')}
            className="wl-btn rounded-2xl px-5 py-3 uppercase text-base font-bold"
            style={{ background: T.track, color: `var(--wl-fg)`, fontFamily: heading }}
          >
            <span className="btn-inner">
              <span className="btn-normal-text">Retirar</span>
              <span className="btn-hover-text">Retirar</span>
            </span>
          </button>
        </div>

        {/* Disponível */}
        <div className="rounded-2xl px-6 sm:px-8 py-6" style={{ background: T.card }}>
          <h4 className="mb-3 capitalize text-sm font-bold opacity-80" style={{ fontFamily: heading }}>Disponível para stake</h4>
          <h2 className="capitalize text-2xl md:text-3xl font-bold" style={{ fontFamily: heading, color: `var(--wl-fg)` }}>{availableToStake.toLocaleString('pt-BR')} ${sym}</h2>
        </div>

        {/* Total em stake */}
        <div className="rounded-2xl px-6 sm:px-8 py-6" style={{ background: T.card }}>
          <h4 className="mb-3 capitalize text-sm font-bold opacity-80" style={{ fontFamily: heading }}>Total em stake</h4>
          <h2 className="capitalize text-2xl md:text-3xl font-bold" style={{ fontFamily: heading, color: `var(--wl-fg)` }}>{totalStakedNetwork.toLocaleString('pt-BR')} ${sym}</h2>
        </div>
      </div>

      {/* ════════════ MODAL ════════════ */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setModal(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl p-6 space-y-5" style={{ background: `var(--wl-card)`, border: `1px solid color-mix(in srgb, var(--wl-primary) 30%, transparent)` }}>
            <div className="flex items-center justify-between">
              <h3 className="uppercase text-2xl font-bold" style={{ fontFamily: heading, color: `var(--wl-fg)` }}>
                {modal === 'stake' ? 'Fazer Stake' : modal === 'unstake' ? 'Retirar' : 'Resgatar'}
              </h3>
              <button onClick={() => setModal(null)} className="text-sm px-3 py-1 rounded-lg cursor-pointer" style={{ background: T.surface }}>[X]</button>
            </div>

            {modal === 'stake' ? (
              <div className="rounded-xl p-4 text-sm space-y-2" style={{ background: T.surface }}>
                <div className="flex justify-between"><span className="opacity-60">Quantidade</span><span className="font-mono font-bold">{Number(amount).toLocaleString('pt-BR')} ${sym}</span></div>
                <div className="flex justify-between"><span className="opacity-60">Bloqueio</span><span className="font-mono">{selected.duration} · {selected.apr}% APY</span></div>
                <div className="flex justify-between"><span className="opacity-60">Reward estimado</span><span className="font-mono font-bold" style={{ color: `var(--wl-primary)` }}>+{estReward.toFixed(2)} ${sym}/ano</span></div>
              </div>
            ) : (
              <p className="text-sm opacity-80">
                {modal === 'unstake'
                  ? `Retirar ${totalMyStaked.toLocaleString('pt-BR')} $${sym} em stake? Os tokens ficam disponíveis após o período de bloqueio.`
                  : `Resgatar ${totalMyRewards.toFixed(2)} $${sym} de recompensas acumuladas para a sua carteira?`}
              </p>
            )}

            <div className="flex gap-3">
              <button onClick={() => setModal(null)} className="flex-1 py-3 rounded-xl uppercase text-xs font-bold cursor-pointer" style={{ background: 'transparent', color: `var(--wl-fg)`, border: `1px solid color-mix(in srgb, var(--wl-fg) 20%, transparent)`, fontFamily: heading }}>
                Cancelar
              </button>
              <button onClick={() => { setModal(null); if (modal === 'stake') setAmount(''); }} className="flex-1 py-3 rounded-xl uppercase text-xs font-bold cursor-pointer" style={{ background: `var(--wl-primary)`, color: `var(--wl-deep)`, fontFamily: heading }}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
