import React, { useState } from 'react';
import { Lock, TrendingUp, Clock, Gift, Wallet } from 'lucide-react';
import type { WhitelabelConfig } from '../types';

interface Props {
  config: WhitelabelConfig;
}

export default function StakePage({ config }: Props) {
  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const selectedPool = config.stakePools.find((p) => p.id === selectedPoolId);

  const totalStakedNetwork = config.stakePools.reduce((acc, p) => acc + p.totalStaked, 0);
  const totalMyStaked = config.stakePools.reduce((acc, p) => acc + (p.myStaked ?? 0), 0);
  const totalMyRewards = config.stakePools.reduce((acc, p) => acc + (p.myReward ?? 0), 0);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: config.theme.fontHeading }}>
          Stake ${config.tokenSymbol}
        </h2>
        <p className="text-sm opacity-60">Bloqueie seus tokens e ganhe recompensas em tempo real.</p>
      </div>

      {/* My stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Wallet,     label: 'Total da Rede',    value: `${(totalStakedNetwork / 1_000_000).toFixed(2)}M $${config.tokenSymbol}` },
          { icon: Lock,       label: 'Meu Staked',       value: totalMyStaked > 0 ? `${totalMyStaked.toLocaleString('en-US')} $${config.tokenSymbol}` : '—' },
          { icon: Gift,       label: 'Rewards Pendentes', value: totalMyRewards > 0 ? `${totalMyRewards.toFixed(2)} $${config.tokenSymbol}` : '—' },
        ].map((s) => {
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
              <div className="text-lg font-bold font-mono">{s.value}</div>
            </div>
          );
        })}
      </div>

      {/* Pools */}
      <div>
        <h3 className="text-lg font-bold mb-4" style={{ fontFamily: config.theme.fontHeading }}>
          Pools disponíveis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {config.stakePools.map((pool) => {
            const isActive = (pool.myStaked ?? 0) > 0;
            return (
              <div
                key={pool.id}
                className="p-5 rounded-xl relative"
                style={{
                  background: `var(--wl-card)`,
                  border: `1px solid ${isActive ? 'var(--wl-primary)' : 'color-mix(in srgb, var(--wl-primary) 14%, transparent)'}`,
                  boxShadow: isActive ? `0 0 40px color-mix(in srgb, var(--wl-primary) 14%, transparent)` : 'none',
                }}
              >
                {isActive && (
                  <span
                    className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded font-mono"
                    style={{
                      background: `color-mix(in srgb, var(--wl-primary) 20%, transparent)`,
                      color: `var(--wl-primary)`,
                    }}
                  >
                    Ativo
                  </span>
                )}

                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4" style={{ color: `var(--wl-primary)` }} />
                  <span className="font-bold text-base" style={{ fontFamily: config.theme.fontHeading }}>
                    {pool.duration}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-extrabold font-mono" style={{ color: `var(--wl-primary)` }}>
                    {pool.apr}%
                  </span>
                  <span className="text-[10px] font-mono opacity-50 uppercase tracking-widest">APR</span>
                </div>

                <div className="text-xs space-y-1.5 opacity-70 mb-4">
                  <div className="flex justify-between">
                    <span>Mínimo</span>
                    <span className="font-mono">{pool.minStake.toLocaleString('en-US')} ${config.tokenSymbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total no Pool</span>
                    <span className="font-mono">{(pool.totalStaked / 1000).toFixed(0)}k ${config.tokenSymbol}</span>
                  </div>
                  {isActive && (
                    <>
                      <div className="flex justify-between font-bold" style={{ color: `var(--wl-primary)` }}>
                        <span>Meu Stake</span>
                        <span className="font-mono">{pool.myStaked!.toLocaleString('en-US')} ${config.tokenSymbol}</span>
                      </div>
                      <div className="flex justify-between font-bold" style={{ color: `var(--wl-primary)` }}>
                        <span>Rewards</span>
                        <span className="font-mono">+{pool.myReward!.toFixed(2)} ${config.tokenSymbol}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedPoolId(pool.id)}
                    className="flex-1 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider cursor-pointer transition-all"
                    style={{
                      background: `var(--wl-primary)`,
                      color: `var(--wl-deep)`,
                    }}
                  >
                    {isActive ? 'Adicionar' : 'Stake'}
                  </button>
                  {isActive && (
                    <button
                      className="flex-1 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider cursor-pointer"
                      style={{
                        background: 'transparent',
                        color: `var(--wl-primary)`,
                        border: `1px solid var(--wl-primary)`,
                      }}
                    >
                      Claim
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stake modal-ish */}
      {selectedPool && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
          style={{ background: 'rgba(0, 0, 0, 0.7)' }}
          onClick={() => setSelectedPoolId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl p-6 space-y-5"
            style={{
              background: `var(--wl-card)`,
              border: `1px solid color-mix(in srgb, var(--wl-primary) 30%, transparent)`,
            }}
          >
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest opacity-50 mb-1">
                Stake no pool
              </div>
              <h3 className="text-xl font-bold" style={{ fontFamily: config.theme.fontHeading }}>
                {selectedPool.duration} · {selectedPool.apr}% APR
              </h3>
            </div>

            <div
              className="rounded-xl p-4"
              style={{ background: `color-mix(in srgb, var(--wl-fg) 4%, transparent)` }}
            >
              <div className="text-[10px] font-mono uppercase opacity-50 mb-2">Quantidade</div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="0"
                  className="flex-1 bg-transparent border-0 outline-none text-2xl font-bold font-mono"
                />
                <span className="font-bold" style={{ color: `var(--wl-primary)` }}>
                  ${config.tokenSymbol}
                </span>
              </div>
              <div className="mt-2 text-[11px] font-mono opacity-50">
                Mínimo: {selectedPool.minStake.toLocaleString('en-US')} ${config.tokenSymbol}
              </div>
            </div>

            <div className="text-xs space-y-1.5 opacity-80">
              <div className="flex justify-between">
                <span>Bloqueio</span>
                <span className="font-mono">{selectedPool.duration}</span>
              </div>
              <div className="flex justify-between">
                <span>Reward estimado</span>
                <span className="font-mono" style={{ color: `var(--wl-primary)` }}>
                  +{((parseFloat(stakeAmount) || 0) * selectedPool.apr / 100).toFixed(2)} ${config.tokenSymbol}/ano
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedPoolId(null)}
                className="flex-1 py-3 rounded-lg font-bold text-xs uppercase cursor-pointer"
                style={{
                  background: 'transparent',
                  color: `var(--wl-fg)`,
                  border: `1px solid color-mix(in srgb, var(--wl-fg) 20%, transparent)`,
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => { setSelectedPoolId(null); setStakeAmount(''); }}
                className="flex-1 py-3 rounded-lg font-bold text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
                style={{
                  background: `var(--wl-primary)`,
                  color: `var(--wl-deep)`,
                }}
              >
                <TrendingUp className="w-4 h-4" />
                Confirmar Stake
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
