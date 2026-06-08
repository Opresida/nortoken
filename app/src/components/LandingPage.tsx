/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Coins,
  Leaf,
  ShieldCheck,
  Zap,
  TrendingUp,
  Layers,
  Check,
  Globe,
  Building2,
  HelpCircle,
  Sprout,
  HandCoins,
  BadgeCheck
} from 'lucide-react';
import { BASE_SEPOLIA } from '../onchain/deployments';

interface LandingPageProps {
  onStartTokenizing: () => void;
  setTab: (tab: string) => void;
  walletConnected: boolean;
  connectWallet: () => void;
}

export default function LandingPage({ 
  onStartTokenizing, 
  setTab, 
  walletConnected, 
  connectWallet 
}: LandingPageProps) {
  
  // States for the interactive calculator
  const [assetType, setAssetType] = useState('cacau');
  const [assetQuantity, setAssetQuantity] = useState(100);
  
  // Calculations based on asset type
  const getCalculationResult = () => {
    let tokenName = 'Cupuaçu Credits';
    let baseMultiplier = 10;
    let ticker = 'CUPU';
    let unit = 'sacos';

    switch (assetType) {
      case 'cacau':
        tokenName = 'Utility Token';
        baseMultiplier = 50; // 50 tokens por saca
        ticker = 'CACAU';
        unit = 'sacos (60kg)';
        break;
      case 'carbono':
        tokenName = 'Carbono Sustentável Jari';
        baseMultiplier = 1; // 1 token por tonelada
        ticker = 'AMACAR';
        unit = 'toneladas de CO2';
        break;
      case 'acai':
        tokenName = 'Açaí Orgânico Tapajós';
        baseMultiplier = 30;
        ticker = 'TAPACA';
        unit = 'latas (14kg)';
        break;
      case 'terra':
        tokenName = 'Hectares Verdes';
        baseMultiplier = 1000; // 1000 tokens por hectare
        ticker = 'AMAZON';
        unit = 'hectares preservados';
        break;
      case 'meme':
        tokenName = 'Curupira Coin';
        baseMultiplier = 100000;
        ticker = 'CURUPA';
        unit = 'seguidores da comunidade';
        break;
    }

    const estimatedTokens = assetQuantity * baseMultiplier;
    const usdcFee = Math.max(39, 1 + estimatedTokens * 0.0000005); // taxa de lançamento em USDC (piso 39)

    return {
      tokenName,
      ticker,
      estimatedTokens,
      usdcFee,
      unit
    };
  };

  const calc = getCalculationResult();

  // Contratos REAIS já deployados e verificados on-chain (lastro real, não promessa)
  const contracts = [
    { name: 'MazariSwapHook', role: 'Motor de fee — captura 0,2% de protocolo + a taxa do projeto, sempre no lado-âncora.', addr: BASE_SEPOLIA.hook },
    { name: 'NortokenFactory', role: 'A linha de montagem — cria o token e a pool de liquidez em um fluxo só.', addr: BASE_SEPOLIA.factory },
    { name: 'MalleableLiquidityLock', role: 'O cofre maleável — liquidez travada (anti-rug), range otimizável, nunca sacável.', addr: BASE_SEPOLIA.lock },
    { name: 'NortokenSwapRouter', role: 'O roteador — compra e venda on-chain com fee transparente.', addr: BASE_SEPOLIA.swapRouter },
  ];

  return (
    <div className="relative overflow-hidden text-white min-h-screen">
      
      {/* Immersive Futuristic Grid & Glow Elements */}
      <div className="absolute top-0 left-0 w-full h-[800px] pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[15%] w-[450px] h-[450px] rounded-full bg-amazon-medium opacity-30 blur-[130px] animate-pulse-slow"></div>
        <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full bg-petroleum-accent opacity-25 blur-[150px] animate-pulse-slow-reverse"></div>
        
        {/* SVG Flowing River/Data Waves lines */}
        <div className="absolute inset-0 opacity-15">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <path d="M-100 200 C300 100, 400 350, 900 150 C1300 50, 1500 400, 2000 250" fill="none" stroke="url(#riverGradient)" strokeWidth="2" />
            <path d="M-100 400 C400 300, 500 550, 1000 350 C1400 250, 1600 600, 2000 450" fill="none" stroke="url(#riverGradient)" strokeWidth="1" strokeDasharray="5,15" />
            <defs>
              <linearGradient id="riverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00f2fe" />
                <stop offset="50%" stopColor="#14795b" />
                <stop offset="100%" stopColor="#00d4b2" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amazon-forest/30 border border-amazon-light/20 text-amazon-neon text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-amazon-neon animate-ping"></span>
              REVOLUÇÃO DE CRÉDITO E RWA NA AMAZÔNIA
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-[100px] font-black leading-[0.82] tracking-tighter mb-6 italic uppercase text-white">
              Tokenização <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                para todos.
              </span>
            </h1>

            <p className="text-gray-300 text-lg sm:text-xl max-w-2xl font-light leading-relaxed">
              Lance seu token com proteções de nível institucional — anti-bot, anti-MEV e selo de confiança auditável — em <strong className="text-white font-bold">redes EVM</strong> (Base/Polygon), pagando em USDC.
            </p>

            <blockquote className="border-l-4 border-emerald-400 pl-4 py-1 text-xs font-mono text-cyan-400 bg-white/5 rounded-r-xl max-w-xl uppercase tracking-wider">
              &ldquo;Escala e agilidade: crie ou invista dezenas de vezes mais rápido, sem elitização corporativa.&rdquo;
            </blockquote>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                id="hero-tokenize-btn"
                onClick={onStartTokenizing}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-[#02181a] px-8 py-4 rounded-full sm:rounded-2xl font-black uppercase tracking-widest text-xs hover:shadow-[0_0_30px_rgba(45,212,191,0.4)] hover:scale-[1.03] transition-all cursor-pointer"
              >
                Tokenizar Ativo Agora
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                id="hero-explore-btn"
                onClick={() => setTab('marketplace')}
                className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-wider text-xs px-8 py-4 rounded-full sm:rounded-2xl border border-white/15 hover:border-white/30 transition-all cursor-pointer"
              >
                Explorar Mercado RWA
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/5">
              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-display font-extrabold text-amazon-neon">39 USDC</div>
                <div className="text-xs text-gray-400 font-medium">Custo de emissão (a partir de)</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-display font-extrabold text-white">0,2%</div>
                <div className="text-xs text-gray-400 font-medium">Fee de protocolo (teto 5%)</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-display font-extrabold text-white">&lt; 5 min</div>
                <div className="text-xs text-gray-400 font-medium">Do projeto ao token on-chain</div>
              </div>
            </div>

          </div>

          {/* Interactive Hero Token Creator Widget */}
          <div className="lg:col-span-5 relative">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-amazon-neon/30 to-amazon-green/10 blur-xl opacity-80 pointer-events-none"></div>
            
            <div className="relative glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amazon-neon" />
                  <span className="text-xs font-mono uppercase tracking-wider text-gray-400">Deploy Instantâneo</span>
                </div>
                <div className="flex items-center gap-1.5 bg-green-500/10 text-green-400 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                  Rede EVM: Ativa
                </div>
              </div>

              {/* Holographic Token Card Dynamic View */}
              <div className="bg-gradient-to-br from-amazon-deep to-petroleum-deep rounded-2xl p-5 border border-white/5 relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-amazon-neon/10 blur-xl group-hover:bg-amazon-neon/20 transition-all"></div>
                
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-400 font-mono">EVM TOKEN</span>
                    <h3 className="font-display font-bold text-lg text-white mt-1">{calc.tokenName}</h3>
                    <p className="text-[11px] font-mono text-amazon-neon tracking-wide">${calc.ticker}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amazon-forest/50 border border-amazon-light/40 flex items-center justify-center text-amazon-neon font-display font-extrabold">
                    {calc.ticker.substring(0, 2)}
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-2 border-t border-white/5 pt-3">
                  <div>
                    <span className="text-[10px] text-gray-450 uppercase block font-mono">SUPPLY RECOMENDADO</span>
                    <span className="text-base font-bold text-white font-mono">{calc.estimatedTokens.toLocaleString('pt-BR')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-450 uppercase block font-mono">VALOR DO DEPLOY</span>
                    <span className="text-base font-bold text-emerald-400 font-mono">~{calc.usdcFee.toFixed(2)} USDC</span>
                  </div>
                </div>

                {/* Progress simulator */}
                <div className="mt-4 bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-amazon-green to-amazon-neon h-full w-[85%]"></div>
                </div>
              </div>

              {/* Fast Calculator Inputs */}
              <div className="space-y-3.5">
                <label className="block text-xs font-semibold text-gray-300">Escolha o segmento do token:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setAssetType('cacau'); setAssetQuantity(250); }}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl text-left border transition-all cursor-pointer ${
                      assetType === 'cacau'
                        ? 'border-amazon-light bg-amazon-light/10 text-amazon-neon'
                        : 'border-white/5 hover:border-white/10 hover:bg-white/5 text-gray-400'
                    }`}
                  >
                    🍫 Cacau Orgânico
                  </button>
                  <button
                    onClick={() => { setAssetType('carbono'); setAssetQuantity(500); }}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl text-left border transition-all cursor-pointer ${
                      assetType === 'carbono'
                        ? 'border-amazon-light bg-amazon-light/10 text-amazon-neon'
                        : 'border-white/5 hover:border-white/10 hover:bg-white/5 text-gray-400'
                    }`}
                  >
                    🌳 Crédito Carbono
                  </button>
                  <button
                    onClick={() => { setAssetType('acai'); setAssetQuantity(1200); }}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl text-left border transition-all cursor-pointer ${
                      assetType === 'acai'
                        ? 'border-amazon-light bg-amazon-light/10 text-amazon-neon'
                        : 'border-white/5 hover:border-white/10 hover:bg-white/5 text-gray-400'
                    }`}
                  >
                    🍇 Açaí Ribeirinho
                  </button>
                  <button
                    onClick={() => { setAssetType('terra'); setAssetQuantity(15); }}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl text-left border transition-all cursor-pointer ${
                      assetType === 'terra'
                        ? 'border-amazon-light bg-amazon-light/10 text-amazon-neon'
                        : 'border-white/5 hover:border-white/10 hover:bg-white/5 text-gray-400'
                    }`}
                  >
                    🗺️ Hectares Mata
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-300">
                    <span>Quantidade de Ativo:</span>
                    <span className="font-mono text-white font-bold">{assetQuantity} {calc.unit}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max={assetType === 'meme' ? 10000 : assetType === 'terra' ? 150 : 2500}
                    value={assetQuantity}
                    onChange={(e) => setAssetQuantity(Number(e.target.value))}
                    className="w-full accent-amazon-neon h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Summary with Deploy estimates */}
              <div className="p-3 bg-amazon-dark/40 rounded-xl border border-white/5 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-450 font-medium">Estimativa de lançamento:</span>
                  <span className="font-mono text-white">{calc.usdcFee.toFixed(2)} USDC</span>
                </div>
                <div className="flex justify-between items-center text-emerald-400 pt-1 border-t border-white/5 font-semibold">
                  <span>Pago on-chain (stablecoin):</span>
                  <span className="font-mono">~{calc.usdcFee.toFixed(2)} USDC</span>
                </div>
              </div>

              <button
                id="calc-tokenizar-referral"
                onClick={onStartTokenizing}
                className="w-full py-3 px-4 bg-white/5 hover:bg-amazon-neon/10 hover:text-amazon-neon hover:border-amazon-neon rounded-xl border border-white/10 font-bold text-center text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Configurar este Token no MVP
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          </div>

        </div>
      </section>

      {/* ═══════════ FILOSOFIA AMAZÔNICA · IMPACTO REGENERATIVO ON-CHAIN ═══════════ */}
      <section className="relative py-24 border-y border-white/5 overflow-hidden bg-gradient-to-b from-[#02140f] via-petroleum-deep to-[#02140f]">
        {/* glows orgânicos */}
        <div className="absolute top-[-10%] left-[-5%] w-[420px] h-[420px] rounded-full bg-amazon-green/20 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[480px] h-[480px] rounded-full bg-emerald-500/10 blur-[150px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Cabeçalho */}
          <div className="max-w-3xl mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[10px] font-mono uppercase tracking-[0.2em] mb-6">
              <Leaf className="w-3.5 h-3.5" /> Impacto Regenerativo · On-Chain
            </div>
            <h2 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter leading-[0.9] text-white">
              Investir na Nortoken<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amazon-neon">é investir na floresta.</span>
            </h2>
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed mt-6 font-light">
              Cada lançamento, cada transação no nosso protocolo devolve uma fração à origem.
              Não é marketing — é um compromisso <strong className="text-white">programado, automático e auditável on-chain</strong>.
              O capital que circula aqui regenera a maior floresta do planeta.
            </p>
          </div>

          {/* 3 pilares */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 10% da receita */}
            <div className="glass-panel rounded-3xl p-7 border border-white/10 relative overflow-hidden group">
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20 transition-all" />
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 mb-5">
                <HandCoins className="w-6 h-6" />
              </div>
              <div className="font-display font-black text-5xl text-white leading-none">5%</div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-300 mt-2">da receita líquida → floresta</div>
              <p className="text-sm text-gray-350 leading-relaxed mt-4">
                A cada <strong className="text-white">1 USDC</strong> que a Nortoken ganha, <strong className="text-emerald-300">5 centavos</strong> vão
                automaticamente para instituições verificadas que protegem a Amazônia.
              </p>
            </div>

            {/* árvores */}
            <div className="glass-panel rounded-3xl p-7 border border-white/10 relative overflow-hidden group">
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-amazon-neon/10 blur-2xl group-hover:bg-amazon-neon/20 transition-all" />
              <div className="w-12 h-12 rounded-2xl bg-amazon-neon/10 border border-amazon-neon/25 flex items-center justify-center text-amazon-neon mb-5">
                <Sprout className="w-6 h-6" />
              </div>
              <div className="font-display font-black text-5xl text-white leading-none">1.000<span className="text-xl text-gray-500 font-mono"> USDC</span></div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-300 mt-2">= novas árvores nativas</div>
              <p className="text-sm text-gray-350 leading-relaxed mt-4">
                A cada <strong className="text-white">1.000 USDC</strong> de lucro líquido do protocolo, financiamos o plantio de
                <strong className="text-emerald-300"> árvores nativas</strong> em áreas de restauração florestal.
              </p>
            </div>

            {/* auditável */}
            <div className="glass-panel rounded-3xl p-7 border border-white/10 relative overflow-hidden group">
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-cyan-500/10 blur-2xl group-hover:bg-cyan-500/20 transition-all" />
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 mb-5">
                <BadgeCheck className="w-6 h-6" />
              </div>
              <div className="font-display font-black text-5xl text-white leading-none">100%</div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-300 mt-2">verificável on-chain</div>
              <p className="text-sm text-gray-350 leading-relaxed mt-4">
                Cada doação tem <strong className="text-white">hash público</strong>. Qualquer investidor — ou auditor europeu — confere o
                impacto em tempo real, <strong className="text-cyan-300">sem confiar na nossa palavra</strong>.
              </p>
            </div>
          </div>

          {/* fluxo do impacto */}
          <div className="mt-10 glass-panel rounded-3xl p-6 sm:p-8 border border-white/10">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-300 mb-6">
              <ShieldCheck className="w-3.5 h-3.5" /> O caminho do impacto — transparente do início ao fim
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {[
                { n: '01', t: 'Transação on-chain', d: 'Você lança ou negocia na Nortoken' },
                { n: '02', t: 'Fração da receita', d: '5% do lucro do protocolo é separado' },
                { n: '03', t: 'Fundo Verde Nortoken', d: 'Carteira pública e rastreável' },
                { n: '04', t: 'Instituições verificadas', d: 'Impacto real, com hash auditável' },
              ].map((s, i) => (
                <div key={i} className="relative">
                  <div className="text-amazon-neon/40 font-mono text-xs font-bold">{s.n}</div>
                  <div className="text-white font-semibold text-sm mt-1">{s.t}</div>
                  <div className="text-[11px] text-gray-400 mt-1 leading-snug">{s.d}</div>
                  {i < 3 && <ArrowRight className="hidden sm:block absolute top-0 -right-3 w-4 h-4 text-white/15" />}
                </div>
              ))}
            </div>
          </div>

          {/* contador de impacto + posicionamento ESG europeu */}
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            <div className="lg:col-span-2 rounded-3xl bg-gradient-to-tr from-[#02140f] to-petroleum-card border border-emerald-500/20 p-7">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-300">Instituições parceiras</span>
                <span className="text-[10px] font-mono text-gray-500">números de impacto em tempo real assim que o Fundo Verde for ativado on-chain</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { logo: '/partners/idasam.png', name: 'IDASAM', desc: 'Instituto de Desenvolvimento Ambiental e Social da Amazônia', href: 'https://www.idasam.org' },
                  { logo: '/partners/i2ta.svg', name: 'i2TA', desc: 'Instituto de Inteligência e Tecnologia Aplicada da Amazônia', href: 'https://i2ta.org.br/' },
                ].map((p) => (
                  <a
                    key={p.name}
                    href={p.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group rounded-2xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/40 p-5 flex flex-col gap-3 transition-all cursor-pointer"
                  >
                    <img src={p.logo} alt={p.name} className="h-9 w-auto max-w-[150px] object-contain self-start opacity-90" />
                    <p className="text-[11px] text-gray-400 leading-snug flex-1">{p.desc}</p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-emerald-400 group-hover:gap-2 transition-all">
                      Visitar site <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </a>
                ))}
              </div>
            </div>
            <div className="rounded-3xl bg-emerald-500/[0.06] border border-emerald-500/20 p-7 flex flex-col justify-center">
              <Globe className="w-6 h-6 text-emerald-400 mb-3" />
              <p className="text-sm text-gray-200 leading-relaxed">
                O capital ESG europeu exige impacto <strong className="text-white">mensurável e verificável</strong>.
                A Nortoken entrega os dois — <strong className="text-emerald-300">on-chain, auditável, sem greenwashing</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing comparison section: "Escala vs. Elitização" */}
      <section className="bg-white/5 backdrop-blur-xl py-20 border-y border-white/10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black tracking-[0.25em] text-emerald-400 uppercase font-mono">Democratização Real</span>
            <h2 className="text-3xl sm:text-5xl font-black italic uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Escala Vence Elitização</h2>
            <p className="text-gray-300 leading-relaxed text-base">
              Entrar no ecossistema Web3 de ativos de impacto não deveria custar dezenas de milhares de dólares que asfixiam o produtor local. Nós eliminamos intermediários burocráticos e unificamos a emissão RWA.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* Traditional alternative */}
            <div className="bg-white/5 rounded-[32px] border border-white/10 p-8 opacity-60 space-y-6 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black tracking-wider text-gray-400 block mb-1 uppercase">PROCESSO TRADICIONAL CORPORATIVO</span>
                <h3 className="text-xl font-black italic uppercase text-gray-200">Emissoras RWA Clássicas</h3>
                <p className="text-xs text-gray-400 mt-2">Focado em grandes imobiliárias e fundos milionários em São Paulo/Nova York.</p>
                
                <ul className="mt-6 space-y-3.5 text-xs text-gray-400">
                  <li className="flex items-center gap-2 text-red-400/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                    Custo de setup inicial: 15.000 a 40.000 USDC
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                    Tempo médio de setup: 2 a 4 meses
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                    Infraestrutura Ethereum cara (taxas de gás proibitivas)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                    Alheia à comunidade e sem conhecimento bioeconômico
                  </li>
                </ul>
              </div>

              <div className="border-t border-white/5 pt-4 text-center">
                <span className="text-xs text-gray-400 block">Investimento Médio Mínimo:</span>
                <span className="font-mono text-red-400/80 text-lg font-bold">25.000+ USDC</span>
              </div>
            </div>

            {/* Nortoken Alternative */}
            <div className="relative rounded-[32px] bg-gradient-to-tr from-emerald-450/10 via-[#02181a] to-cyan-450/10 p-8 border-2 border-emerald-500/30 shadow-2xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 bg-emerald-500 text-[#02181a] text-[9px] font-mono font-black tracking-widest px-4 py-1.5 rounded-bl-xl uppercase">
                Inovação do Norte
              </div>

              <div>
                <span className="text-[10px] font-black tracking-[0.2em] text-emerald-400 block mb-1 uppercase">MODELO NORTOKEN DEMOCRÁTICO</span>
                <h3 className="text-xl font-black italic uppercase text-white">Nortoken Acessível</h3>
                <p className="text-xs text-gray-300 mt-2">Feito para qualquer projeto sério — de utility e memecoin a RWA e comunidade.</p>

                <ul className="mt-6 space-y-3.5 text-xs">
                  <li className="flex items-center gap-2.5 text-emerald-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    Custo de Deploy básico: a partir de 39 USDC
                  </li>
                  <li className="flex items-center gap-2.5 text-emerald-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    Tempo para deploy: Menos de 5 minutos
                  </li>
                  <li className="flex items-center gap-2.5 text-emerald-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    Redes EVM (Base/Polygon): velocidade e custo de centavos por transação
                  </li>
                  <li className="flex items-center gap-2.5 text-emerald-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    Serviços jurídicos e branding modulares ("pague pelo que usar")
                  </li>
                </ul>
              </div>

              <div className="border-t border-white/10 pt-4 text-center mt-6">
                <span className="text-xs text-gray-300 block">Custo Base de Deploy On-Chain:</span>
                <span className="font-mono text-emerald-400 text-2xl font-black">Grátis para rascunhar / 39 USDC deploy</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Explaining the process: "Como funciona" */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono tracking-widest text-amazon-neon uppercase font-bold">Simplicidade Extrema</span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl">4 Passos para a Tokenização</h2>
          <p className="text-gray-300 text-base leading-relaxed">
            Nós removemos a complicação do Web3. Você cuida do seu projeto e da sua comunidade; nós cuidamos da infraestrutura EVM e da segurança do contrato.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amazon-forest/50 border border-amazon-light/20 flex items-center justify-center text-amazon-neon font-display font-extrabold">
              01
            </div>
            <h4 className="font-semibold text-white">Registre sua Atividade</h4>
            <p className="text-xs text-gray-400">
              Escolha o segmento (utility, memecoin, RWA, comunidade, gaming ou impacto) e insira os dados iniciais.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amazon-forest/50 border border-amazon-light/20 flex items-center justify-center text-amazon-neon font-display font-extrabold">
              02
            </div>
            <h4 className="font-semibold text-white">Refine com o Co-Pilot IA</h4>
            <p className="text-xs text-gray-400">
              Nossa inteligência artificial analisa o projeto, sugere o fornecimento econômico ideal, ticker e estrutura uma história de impacto.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amazon-forest/50 border border-amazon-light/20 flex items-center justify-center text-amazon-neon font-display font-extrabold">
              03
            </div>
            <h4 className="font-semibold text-white">Anexe Comprovações</h4>
            <p className="text-xs text-gray-400">
              Configure as proteções (anti-bot, anti-MEV, lock de liquidez) e, se quiser, anexe whitepaper e documentos para subir o Trust Score.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-amazon-green to-amazon-neon flex items-center justify-center text-petroleum-dark font-display font-extrabold">
              04
            </div>
            <h4 className="font-semibold text-amazon-neon">Deploy & Distribuição</h4>
            <p className="text-xs text-emerald-100">
              Crie o contrato on-chain do token de forma automatizada. Obtenha o painel de holders, links públicos e QR Codes de compra.
            </p>
          </div>

        </div>
      </section>

      {/* Why Amazon + Web3 is a synergy: "Por que Amazônia + Web3?" */}
      <section className="py-20 bg-gradient-to-tr from-petroleum-deep via-[#071913] to-petroleum-card border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-12 xl:col-span-5 space-y-6">
              <span className="text-xs font-mono tracking-widest text-amazon-neon uppercase font-bold">Visão Exclusiva</span>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl leading-snug">Por que lançar na Nortoken?</h2>

              <p className="text-gray-300 leading-relaxed text-sm">
                90% das rampas de token entregam contratos frágeis — vulneráveis a sniper, sandwich-MEV e honeypot. O investidor não confia, e o projeto morre no lançamento.
              </p>

              <p className="text-gray-300 leading-relaxed text-sm">
                A Nortoken nasce diferente: cada token sai com um contrato <strong>musculoso</strong> (anti-bot, anti-MEV, lock de liquidez) e um <strong>Trust Score público</strong> e auditável — o investidor bate o olho e confia.
              </p>

              <div className="p-4 bg-amazon-forest/20 rounded-xl border border-amazon-light/10 space-y-2">
                <span className="text-xs font-bold text-amazon-neon flex items-center gap-1.5">
                  <Globe className="w-4 h-4 shrink-0" />
                  Selo de confiança verificável
                </span>
                <p className="text-[11px] text-gray-300">
                  O Trust Score é calculado por critérios reais de mercado (liquidez, mint, ownership, fee, honeypot) — os mesmos que TokenSniffer e GoPlus avaliam — e viaja com o token no explorer.
                </p>
              </div>
            </div>

            <div className="lg:col-span-12 xl:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                  <Leaf className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-white">Receita Recorrente Justa</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Fee de protocolo de apenas 0,2% por transferência, transparente e com teto duro de 5% — sem nunca travar a venda do investidor. O projeto cresce, o ecossistema cresce junto.
                </p>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-white">Rastreabilidade Inviolável</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Histórico on-chain completo na rede EVM. Qualquer investidor pode escanear o token no explorer (Basescan/Polygonscan) e verificar o Trust Score, o lock de liquidez e o selo honeypot-free.
                </p>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
                <div className="w-10 h-10 rounded-lg bg-amazon-neon/10 border border-amazon-neon/25 flex items-center justify-center text-amazon-neon">
                  <Zap className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-white">Transações Instantâneas</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Sem taxas de centenas de dólares em taxas bancárias ou câmbios internacionais lentos. Liquidação em instantes on-chain com taxas inferiores a 0,01 USDC.
                </p>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
                <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/25 flex items-center justify-center text-teal-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-white">Escalabilidade de Micro-Ativos</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Não importa o tamanho do seu projeto. As redes EVM (Base/Polygon) capacitam micro e nano-comunidades a unirem seus capitais com taxas de centavos e sem barreiras de acesso.
                </p>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Lastro real — contratos verificados on-chain */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-14">
          <span className="text-xs font-mono tracking-widest text-amazon-neon uppercase font-bold">Lastro Real · Verificável Agora</span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl">Não é promessa. Está on-chain.</h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            Enquanto a maioria dos projetos vende futuro, o motor da Nortoken já está <strong className="text-white">deployado, verificado e auditável</strong> na rede Base.
            Não confie na nossa palavra — clique e confira o código de cada contrato no explorer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto">
          {contracts.map((c) => (
            <a
              key={c.name}
              href={`${BASE_SEPOLIA.explorer}/address/${c.addr}#code`}
              target="_blank"
              rel="noreferrer"
              className="group glass-panel rounded-2xl p-6 border border-white/5 hover:border-emerald-500/40 transition-all flex flex-col gap-3 cursor-pointer"
            >
              <div className="flex items-center justify-between gap-3">
                <h4 className="font-display font-bold text-white text-base">{c.name}</h4>
                <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full uppercase shrink-0">
                  <BadgeCheck className="w-3 h-3" /> Verificado
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed flex-1">{c.role}</p>
              <div className="flex items-center justify-between border-t border-white/5 pt-3">
                <span className="text-[10px] font-mono text-gray-500">{c.addr.slice(0, 10)}…{c.addr.slice(-6)}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-emerald-400 group-hover:gap-2 transition-all">
                  Ver no BaseScan <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* selos de prova real */}
        <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto mt-8">
          {[
            { icon: ShieldCheck, t: 'Honeypot-free provado (100k fuzz)' },
            { icon: BadgeCheck, t: 'Trust Score público 0–100' },
            { icon: Leaf, t: 'Base · testnet ativa' },
            { icon: Check, t: 'Self-custody — você é o dono' },
          ].map((b, i) => {
            const Icon = b.icon;
            return (
              <div key={i} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/[0.03] border border-white/10 text-[11px] font-mono text-gray-300">
                <Icon className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {b.t}
              </div>
            );
          })}
        </div>

        {/* Big Bottom Action Box */}
        <div className="mt-20 bg-gradient-to-tr from-amazon-deep to-petroleum-card rounded-3xl p-8 sm:p-12 text-center border border-white/5 relative overflow-hidden">
          <div className="absolute top-[-50%] left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-amazon-light/10 blur-[100px] pointer-events-none"></div>
          
          <div className="space-y-6 max-w-2xl mx-auto relative z-10">
            <h3 className="font-display font-bold text-2xl sm:text-3xl tracking-tight text-white">
              Pronto para lançar seu token com segurança de nível institucional?
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Você não precisa saber programar, nem ter conhecimentos aprofundados sobre carteiras cripto ou taxas on-chain. Nosso MVP guia você ao deploy instantâneo em rede EVM.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <button
                id="cta-tokenize-btn"
                onClick={onStartTokenizing}
                className="bg-gradient-to-r from-amazon-green via-amazon-light to-amazon-neon hover:from-amazon-neon hover:to-amazon-light text-petroleum-dark font-extrabold text-sm px-8 py-3.5 rounded-xl shadow-lg transition-all cursor-pointer"
              >
                Criar Meu Token On-Chain
              </button>
              
              <button
                id="cta-services-btn"
                onClick={() => setTab('premium')}
                className="bg-white/5 hover:bg-white/10 text-white font-semibold text-sm px-6 py-3.5 rounded-xl border border-white/10 transition-all cursor-pointer"
              >
                Conhecer Serviços Premium
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Minimalist */}
      <footer className="border-t border-white/5 bg-petroleum-dark/90 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-6 text-gray-400 text-xs">
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-emerald-400 to-cyan-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-[#02181a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
            </div>
            <span className="font-display font-semibold text-sm tracking-tight text-white">
              NORTOKEN
            </span>
          </div>

          <div className="text-center sm:text-left text-gray-400">
            &copy; 2026 Nortoken. Launchpad de tokens EVM com Trust Score e contratos musculosos. Plataforma exclusiva do grupo MAZARI CORP.
          </div>

          <div className="flex gap-4 font-mono text-[10px] uppercase text-amazon-neon">
            <span className="cursor-pointer hover:underline" onClick={() => setTab('landing')}>INÍCIO</span>
            <span className="cursor-pointer hover:underline" onClick={() => setTab('marketplace')}>TERRA DIGITAL</span>
            <span className="cursor-pointer hover:underline" onClick={() => setTab('tokenize')}>DEPLOYS</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
