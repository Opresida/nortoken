/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  ShieldCheck,
  ExternalLink,
  HelpCircle,
  FolderOpen,
  Lock,
  Zap,
} from 'lucide-react';
import TrustBadge from './TrustBadge';
import { Token, UserWallet } from '../types';
import { IS_TESTNET } from '../onchain/env';
import { useMarket, getTokensPerEth } from '../onchain/useMarket';
import { toWei, type Address } from '../onchain/configMapper';
import { BASE_SEPOLIA } from '../onchain/deployments';

interface MarketplaceProps {
  tokens: Token[];
  wallet: UserWallet;
  onTradeSimulated: (tokenId: string, amountPurchased: number) => void;
}

export default function Marketplace({ tokens, wallet, onTradeSimulated }: MarketplaceProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeInvestToken, setActiveInvestToken] = useState<Token | null>(null);
  const [purchaseAmount, setPurchaseAmount] = useState(1); // frações (modo demo)

  // ── lado comprador real ──
  const market = useMarket();
  const [prices, setPrices] = useState<Record<string, number | null>>({}); // tokenId → tokens por ETH
  const [buyEth, setBuyEth] = useState(0.005);
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState('');

  // token real comprável = tem pool on-chain
  const isReal = (t: Token) => IS_TESTNET && !!t.onChainChainId && !!t.poolLockId && !!t.contractAddress;

  // Categorias derivadas dos tokens presentes (corrige o filtro antigo amazônico)
  const categories = useMemo(() => ['all', ...Array.from(new Set(tokens.map(t => t.category)))], [tokens]);

  // Busca o preço real das pools (tokens com liquidez)
  useEffect(() => {
    let alive = true;
    const real = tokens.filter(isReal);
    Promise.all(
      real.map(async t => [t.id, await getTokensPerEth(t.contractAddress as Address)] as const),
    ).then(entries => {
      if (alive) setPrices(Object.fromEntries(entries));
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokens.map(t => t.id + (t.poolLockId ?? '')).join(',')]);

  // Filter tokens based on category and search query
  const filteredTokens = tokens.filter(token => {
    const matchesCategory = selectedCategory === 'all' || token.category === selectedCategory;
    const matchesSearch = token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          token.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleInvestSubmit = () => {
    if (!activeInvestToken) return;
    // modo demo (token de exemplo, sem pool real) — compra simulada
    onTradeSimulated(activeInvestToken.id, purchaseAmount);
    setActiveInvestToken(null);
    alert(`(Demo) Compra simulada de ${purchaseAmount} frações de ${activeInvestToken.name}.`);
  };

  // Compra REAL: swap ETH→token na pool
  const handleRealBuy = async () => {
    if (!activeInvestToken?.contractAddress) return;
    setBuying(true);
    setBuyError('');
    try {
      await market.buy(activeInvestToken.contractAddress as Address, toWei(buyEth));
      onTradeSimulated(activeInvestToken.id, 1); // atualiza holders/volume no painel
      setActiveInvestToken(null);
      alert(`Compra on-chain concluída! Você gastou ${buyEth} ETH em ${activeInvestToken.symbol}.`);
    } catch (e: unknown) {
      setBuyError(e instanceof Error ? e.message : String(e));
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-white relative">
      
      {/* Top section */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 border-b border-white/10 pb-6">
        <div>
          <span className="text-[10px] font-black tracking-widest text-[#10b981] uppercase font-mono">MARKETPLACE & ESCALA</span>
          <h1 className="text-2xl sm:text-4xl font-black italic uppercase tracking-tight mt-1 text-white">Mercado de Tokens</h1>
          <p className="text-xs text-gray-400 mt-1">
            Compre frações de tokens lançados na Nortoken — todos com Trust Score e selo de confiança auditável.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            id="marketplace-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por nome ou ticker..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs glass-input"
          />
        </div>
      </div>

      {/* Category Horizontal list */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 pr-1 scrollbar-thin">
        {categories.map((cat) => (
          <button
            id={`category-filter-btn-${cat}`}
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap capitalize transition-all border cursor-pointer ${
              selectedCategory === cat
                ? 'bg-amazon-light/10 text-amazon-neon border-amazon-light/40 shadow-sm shadow-amazon-green/10'
                : 'border-white/5 hover:border-white/10 text-gray-400'
            }`}
          >
            {cat === 'all' ? 'Todos' : cat}
          </button>
        ))}
      </div>

      {/* Grid of Tokens */}
      {filteredTokens.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 space-y-4">
          <FolderOpen className="w-12 h-12 text-gray-400 mx-auto opacity-70" />
          <h3 className="font-semibold text-lg text-white">Nenhum Ativo Encontrado</h3>
          <p className="text-xs text-gray-405 max-w-md mx-auto">
            Experimente mudar a categoria ou limpar a busca. Se você é um produtor, crie seu próprio token agora na aba "Tokenizar Ativo"!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTokens.map((token) => (
            <div
              id={`market-token-card-${token.id}`}
              key={token.id}
              className="glass-panel rounded-3xl overflow-hidden border border-white/5 flex flex-col justify-between group transition-all"
            >
              
              {/* Product header landscape image */}
              <div className="relative h-44 overflow-hidden">
                <img 
                  src={token.image} 
                  alt={token.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 bg-accent/40" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-petroleum-dark to-transparent"></div>
                
                {/* Symbol float Badge */}
                <div className="absolute top-4 right-4 bg-petroleum-dark/80 text-amazon-neon px-3 py-1 rounded-xl font-mono text-xs font-bold border border-white/10 uppercase">
                  ${token.symbol}
                </div>

                {/* Nortoken Trust Score (selo público) */}
                {token.trustScore != null && (
                  <div className="absolute top-4 left-4 bg-petroleum-dark/80 backdrop-blur-sm rounded-xl p-0.5 border border-white/10">
                    <TrustBadge score={token.trustScore} variant="full" />
                  </div>
                )}

                <div className="absolute bottom-4 left-4 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold font-mono uppercase">
                    {token.category}
                  </div>
                  <h3 className="font-display font-bold text-white text-base truncate max-w-[220px]">
                    {token.name}
                  </h3>
                </div>
              </div>

              {/* Description Body */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <p className="text-xs text-gray-300 leading-relaxed line-clamp-3">
                  {token.description}
                </p>

                {/* Technical data table */}
                <div className="grid grid-cols-2 gap-3.5 border-y border-white/5 py-4 text-xs font-mono">
                  <div>
                    <span className="text-gray-450 text-[10px] block">SUPPLY TOTAL</span>
                    <span className="text-white font-bold">{token.supply.toLocaleString('pt-BR')}</span>
                  </div>
                  <div>
                    <span className="text-gray-450 text-[10px] block">HOLDERS</span>
                    <span className="text-white font-bold">{token.holderCount}</span>
                  </div>
                  <div>
                    <span className="text-gray-450 text-[10px] block">RWA STATUS</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      EVM Ativo
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-450 text-[10px] block">AUDITORIA</span>
                    {token.verified ? (
                      <span className="text-amazon-neon font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-amazon-neon" />
                        Selo Verde
                      </span>
                    ) : (
                      <span className="text-yellow-500 font-bold">Pendente</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-left font-mono">
                    <span className="text-[9px] text-gray-400 block uppercase">Preço atual</span>
                    {isReal(token) ? (
                      prices[token.id] ? (
                        <span className="text-sm font-bold text-emerald-400">
                          1 ETH ≈ {Math.round(prices[token.id]!).toLocaleString('pt-BR')} {token.symbol}
                        </span>
                      ) : (
                        <span className="text-sm font-bold text-gray-500">lendo pool…</span>
                      )
                    ) : (
                      <span className="text-sm font-bold text-gray-500">— sem pool —</span>
                    )}
                  </div>

                  {isReal(token) ? (
                    <button
                      id={`buy-fraction-btn-${token.id}`}
                      onClick={() => { setBuyError(''); setActiveInvestToken(token); }}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-amazon-neon text-petroleum-dark hover:shadow-lg hover:shadow-amazon-neon/20 font-extrabold text-xs font-mono uppercase transition-all cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Comprar
                    </button>
                  ) : IS_TESTNET ? (
                    <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-500 text-xs font-mono">
                      <Lock className="w-3.5 h-3.5" />
                      Sem liquidez
                    </span>
                  ) : (
                    <button
                      id={`buy-fraction-btn-${token.id}`}
                      onClick={() => setActiveInvestToken(token)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amazon-green to-amazon-light font-bold text-xs font-mono uppercase transition-all cursor-pointer text-white"
                    >
                      Adquirir (demo)
                    </button>
                  )}
                </div>

              </div>

            </div>
          ))}
        </div>
      )}

      {/* PURCHASE SIMULATOR MODAL */}
      {activeInvestToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-petroleum-dark/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#04111d] border border-amazon-light/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
            
            <div className="flex justify-between items-start border-b border-white/5 pb-3">
              <div>
                <span className="text-[10px] text-amazon-neon font-mono uppercase">Liquidação DeFi RWA</span>
                <h3 className="font-display font-bold text-lg text-white mt-1">Simular Compra de Satiete</h3>
              </div>
              <button
                id="close-marketplace-invest-modal"
                onClick={() => setActiveInvestToken(null)}
                className="bg-white/5 hover:bg-white/10 text-xs px-3 py-1 rounded-lg"
              >
                [X]
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono text-gray-300">
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-1">
                <span className="text-gray-405 text-[10px]">ATIVO ESCOLHIDO:</span>
                <span className="text-sm font-bold text-white block">{activeInvestToken.name}</span>
                <span className="text-amazon-neon block font-bold mt-1">${activeInvestToken.symbol}</span>
              </div>

              {isReal(activeInvestToken) ? (
                /* ── COMPRA REAL (swap ETH→token na pool) ── */
                <>
                  <label className="space-y-1.5 block pt-1">
                    <span className="text-gray-400 text-[10px] uppercase">Quanto de ETH gastar</span>
                    <input
                      type="number"
                      step="0.001"
                      value={buyEth}
                      onChange={e => setBuyEth(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border glass-input font-mono"
                    />
                  </label>

                  <div className="space-y-1.5 border-t border-white/5 pt-3 text-[11px]">
                    <div className="flex justify-between text-cyan-400 font-bold">
                      <span>Você recebe (estimado):</span>
                      <span>
                        {prices[activeInvestToken.id]
                          ? `~ ${Math.round(buyEth * prices[activeInvestToken.id]!).toLocaleString('pt-BR')} ${activeInvestToken.symbol}`
                          : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>Taxa do projeto + protocolo</span>
                      <span>{((activeInvestToken.config?.taxes.clientTaxBps ?? 0) / 100 + 0.2).toFixed(2)}% no swap</span>
                    </div>
                  </div>

                  {buyError && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-[10px] p-2.5 rounded-xl break-all">{buyError}</div>
                  )}

                  <button
                    id="confirm-marketplace-invest-btn"
                    disabled={buying}
                    onClick={handleRealBuy}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-amazon-neon text-petroleum-dark font-extrabold rounded-xl text-center cursor-pointer disabled:opacity-50"
                  >
                    {buying ? 'Comprando on-chain…' : `Comprar ${activeInvestToken.symbol} com ETH`}
                  </button>
                  <p className="text-[9px] text-gray-600 text-center">{BASE_SEPOLIA.name} · swap real · sua carteira paga o gás</p>
                </>
              ) : (
                /* ── DEMO (token de exemplo, sem pool real) ── */
                <>
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-gray-400 text-xs font-mono">
                      <span>Quantidade a adquirir:</span>
                      <span className="text-white font-bold">{purchaseAmount.toLocaleString('pt-BR')} frações</span>
                    </div>
                    <input
                      id="trade-amount-slider"
                      type="range"
                      min="1"
                      max="1000"
                      value={purchaseAmount}
                      onChange={(e) => setPurchaseAmount(Number(e.target.value))}
                      className="w-full accent-amazon-neon h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="p-3 bg-amazon-forest/15 rounded-xl border border-amazon-light/5 text-[10px] text-gray-350 flex gap-2">
                    <HelpCircle className="w-4 h-4 text-amazon-neon shrink-0" />
                    <span>Token de demonstração — compra simulada para você navegar a experiência.</span>
                  </div>

                  <button
                    id="confirm-marketplace-invest-btn"
                    onClick={handleInvestSubmit}
                    className="w-full py-3 bg-gradient-to-r from-amazon-green to-amazon-light text-white font-extrabold rounded-xl text-center cursor-pointer"
                  >
                    Simular Compra (demo)
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
