import React from 'react';
import { Sparkles, ShoppingCart, Zap } from 'lucide-react';
import type { WhitelabelConfig, NFTCollectionItem } from '../types';

interface Props {
  config: WhitelabelConfig;
}

const RARITY_STYLE: Record<NFTCollectionItem['rarity'], { label: string; color: string }> = {
  common:    { label: 'Common',    color: '#94a3b8' },
  rare:      { label: 'Rare',      color: '#22d3ee' },
  epic:      { label: 'Epic',      color: '#a78bfa' },
  legendary: { label: 'Legendary', color: '#fbbf24' },
};

export default function TokenizationPage({ config }: Props) {
  const totalMinted = config.nftCollection.reduce((acc, n) => acc + n.minted, 0);
  const totalSupply = config.nftCollection.reduce((acc, n) => acc + n.totalSupply, 0);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: config.theme.fontHeading }}>
          Coleção de NFTs
        </h2>
        <p className="text-sm opacity-60">
          NFTs exclusivos da Amazônia. Cada peça é uma chave de acesso a benefícios na plataforma.
        </p>
      </div>

      {/* Stats da coleção */}
      <div
        className="rounded-2xl p-6 flex flex-col md:flex-row gap-6 md:items-center md:justify-between"
        style={{
          background: `var(--wl-card)`,
          border: `1px solid color-mix(in srgb, var(--wl-primary) 14%, transparent)`,
        }}
      >
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest opacity-50 mb-1">
            Progresso de mintagem
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono" style={{ color: `var(--wl-primary)` }}>
              {totalMinted.toLocaleString('en-US')}
            </span>
            <span className="text-sm opacity-50 font-mono">/ {totalSupply.toLocaleString('en-US')}</span>
          </div>
          <div className="mt-3 w-full md:w-64 h-2 rounded-full overflow-hidden" style={{ background: `color-mix(in srgb, var(--wl-fg) 10%, transparent)` }}>
            <div
              className="h-full transition-all"
              style={{
                width: `${(totalMinted / totalSupply) * 100}%`,
                background: `var(--wl-primary)`,
              }}
            />
          </div>
        </div>

        <div className="flex gap-4 text-center text-xs">
          <div>
            <div className="text-[10px] font-mono uppercase opacity-50">Holders únicos</div>
            <div className="font-bold font-mono text-lg">3.847</div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase opacity-50">Volume Total</div>
            <div className="font-bold font-mono text-lg">$ 1.24M</div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase opacity-50">Floor Price</div>
            <div className="font-bold font-mono text-lg">$ 25</div>
          </div>
        </div>
      </div>

      {/* Grid de NFTs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {config.nftCollection.map((nft) => {
          const rarity = RARITY_STYLE[nft.rarity];
          const soldOut = nft.minted >= nft.totalSupply;
          return (
            <div
              key={nft.id}
              className="rounded-xl overflow-hidden transition-all hover:scale-[1.02] cursor-pointer group"
              style={{
                background: `var(--wl-card)`,
                border: `1px solid color-mix(in srgb, var(--wl-primary) 12%, transparent)`,
              }}
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={nft.image}
                  alt={nft.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.6))' }}
                />
                {/* Rarity badge */}
                <span
                  className="absolute top-3 left-3 text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded font-mono"
                  style={{
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: rarity.color,
                    border: `1px solid ${rarity.color}40`,
                  }}
                >
                  {rarity.label}
                </span>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <h3 className="font-bold text-base" style={{ fontFamily: config.theme.fontHeading }}>
                  {nft.name}
                </h3>

                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-[10px] font-mono uppercase opacity-50">Preço</div>
                    <div className="font-bold font-mono" style={{ color: `var(--wl-primary)` }}>
                      ${nft.priceUsd}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-mono uppercase opacity-50">Disponível</div>
                    <div className="text-xs font-mono">
                      {(nft.totalSupply - nft.minted).toLocaleString('en-US')} / {nft.totalSupply.toLocaleString('en-US')}
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="h-1 rounded-full overflow-hidden" style={{ background: `color-mix(in srgb, var(--wl-fg) 10%, transparent)` }}>
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${(nft.minted / nft.totalSupply) * 100}%`,
                      background: rarity.color,
                    }}
                  />
                </div>

                <button
                  disabled={soldOut}
                  className="w-full mt-2 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: soldOut ? 'transparent' : `var(--wl-primary)`,
                    color: soldOut ? `var(--wl-fg)` : `var(--wl-deep)`,
                    border: soldOut ? `1px solid color-mix(in srgb, var(--wl-fg) 20%, transparent)` : 'none',
                  }}
                >
                  {soldOut ? 'Esgotado' : (<><Sparkles className="w-3 h-3" /> Mint</>)}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA — pacote completo */}
      <div
        className="rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4"
        style={{
          background: `linear-gradient(90deg, color-mix(in srgb, var(--wl-primary) 14%, var(--wl-card)), var(--wl-card))`,
          border: `1px solid var(--wl-primary)`,
        }}
      >
        <div className="flex-1 text-center md:text-left">
          <div className="text-[10px] font-mono uppercase tracking-widest mb-1" style={{ color: `var(--wl-primary)` }}>
            Bundle Completo
          </div>
          <h3 className="text-xl font-bold" style={{ fontFamily: config.theme.fontHeading }}>
            Adquira 1 de cada raridade
          </h3>
          <p className="text-xs opacity-60 mt-1">Bundle exclusivo · 20% de desconto · acesso vitalício a recompensas premium</p>
        </div>
        <button
          className="px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all hover:brightness-110"
          style={{
            background: `var(--wl-primary)`,
            color: `var(--wl-deep)`,
          }}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          Comprar Bundle por $ 360
          <Zap className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
