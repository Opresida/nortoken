/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Trash2,
  Sparkles,
  Upload,
  Cpu,
  ChevronRight,
  ChevronLeft,
  Info,
  AlertCircle,
  CheckCircle,
  FileText,
  RefreshCw,
  Coins,
  ShieldCheck,
  Lock,
  Bot,
  Percent,
  Flame,
  Globe,
} from 'lucide-react';
import { Token, TokenDocument, UserWallet, TokenConfig, EvmNetwork, ProjectAssetStatus } from '../types';
import { ACTIVE_PRESET } from '../data/presets';
import { NETWORKS } from '../pricing/gasOracle';
import { quoteDeploy } from '../pricing/pricingEngine';
import { PROTOCOL_FEE_BPS, MAX_TOTAL_FEE_BPS, bpsToPct } from '../pricing/protocolFee';
import { computeTrustScore, BAND_META } from '../trust/trustScore';
import { ChevronDown } from 'lucide-react';
import TrustBadge from './TrustBadge';
import { IS_TESTNET } from '../onchain/env';
import { useDeployer } from '../onchain/useDeployer';
import { toInitParams, type Address } from '../onchain/configMapper';
import { BASE_SEPOLIA, NETWORK_LIVE } from '../onchain/deployments';

interface TokenCreatorProps {
  wallet: UserWallet;
  connectWallet: () => void;
  onTokenCreated: (newToken: Token) => void;
  setTab: (tab: string) => void;
}

const usd = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

// Serviços contratáveis no criador (reaproveitam o catálogo Premium existente).
const SERVICE_PRICE_USD = { website: 150, whitepaper: 200 };
const SERVICE_IDS = { website: 'brand_landing_page', whitepaper: 'whitepaper_draft' };

function makeDefaultConfig(initialSupply: number): TokenConfig {
  return {
    supply: { initial: initialSupply, maxCap: null, mintable: true, renounceMintAtLaunch: false },
    protections: { antiSnipeBlocks: 2, tradeCooldownSec: 30, maxWalletPct: 2, maxTxPct: 1 },
    trustSeal: {
      autoLiquidityLock: true,
      liquidityLockDays: 180,
      renounceOwnership: false,
      honeypotFreeAttest: true,
    },
    taxes: { protocolFeeBps: PROTOCOL_FEE_BPS, clientTaxBps: 0, clientTreasury: '' },
    presence: {
      website: { has: false, viaNortoken: false },
      whitepaper: { has: false, viaNortoken: false },
    },
  };
}

/** Pequeno toggle reutilizável. */
function Toggle({
  on,
  onChange,
  label,
  hint,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className="flex items-start justify-between gap-3 w-full text-left p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all cursor-pointer"
    >
      <div className="space-y-0.5">
        <span className="text-xs font-semibold text-white block">{label}</span>
        {hint && <span className="text-[10px] text-gray-400 leading-snug block">{hint}</span>}
      </div>
      <div
        className={`mt-0.5 w-9 h-5 rounded-full shrink-0 transition-all relative ${
          on ? 'bg-emerald-500' : 'bg-white/15'
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
            on ? 'left-4' : 'left-0.5'
          }`}
        />
      </div>
    </button>
  );
}

export default function TokenCreator({ wallet, connectWallet, onTokenCreated, setTab }: TokenCreatorProps) {
  const preset = ACTIVE_PRESET;

  // Steps: 1 Segmento · 2 Identidade+IA · 3 Configuração · 4 Documentos · 5 Revisão/Deploy
  const [step, setStep] = useState(1);

  const [category, setCategory] = useState<string>(preset.categories[0].id);
  const currentCat = preset.categories.find(c => c.id === category) ?? preset.categories[0];

  // Identidade
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [extra, setExtra] = useState<Record<string, string>>({});

  // Configuração on-chain (4 alavancas)
  const [config, setConfig] = useState<TokenConfig>(() =>
    makeDefaultConfig(currentCat.defaultSupply ?? 100000),
  );
  const [network, setNetwork] = useState<EvmNetwork>('base');
  const [estMonthlyVolumeUsd, setEstMonthlyVolumeUsd] = useState(50000);

  // Co-Pilot
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotError, setCopilotError] = useState('');
  const [copilotData, setCopilotData] = useState<any>(null);

  // Documentos
  const [documents, setDocuments] = useState<TokenDocument[]>([]);

  // Deploy
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState(0);
  const deployer = useDeployer(); // carteira real (Privy + viem) — usado só no modo testnet

  // Pré-preenche o tesouro do cliente com a carteira conectada (editável) quando há taxa.
  useEffect(() => {
    if (config.taxes.clientTaxBps > 0 && !config.taxes.clientTreasury && wallet.address) {
      setTax({ clientTreasury: wallet.address });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.taxes.clientTaxBps, wallet.address]);

  // helpers de update do config
  const setSupplyCfg = (patch: Partial<TokenConfig['supply']>) =>
    setConfig(c => ({ ...c, supply: { ...c.supply, ...patch } }));
  const setProtect = (patch: Partial<TokenConfig['protections']>) =>
    setConfig(c => ({ ...c, protections: { ...c.protections, ...patch } }));
  const setSeal = (patch: Partial<TokenConfig['trustSeal']>) =>
    setConfig(c => ({ ...c, trustSeal: { ...c.trustSeal, ...patch } }));
  const setTax = (patch: Partial<TokenConfig['taxes']>) =>
    setConfig(c => ({ ...c, taxes: { ...c.taxes, ...patch } }));
  const setWebsite = (patch: Partial<TokenConfig['presence']['website']>) =>
    setConfig(c => ({ ...c, presence: { ...c.presence, website: { ...c.presence.website, ...patch } } }));
  const setWhitepaper = (patch: Partial<TokenConfig['presence']['whitepaper']>) =>
    setConfig(c => ({ ...c, presence: { ...c.presence, whitepaper: { ...c.presence.whitepaper, ...patch } } }));

  // Add-ons contratados (receita extra) + serviços a registrar no token
  const addonsUsd =
    (config.presence.website.viaNortoken ? SERVICE_PRICE_USD.website : 0) +
    (config.presence.whitepaper.viaNortoken ? SERVICE_PRICE_USD.whitepaper : 0);
  const contractedServices = [
    config.presence.website.viaNortoken ? SERVICE_IDS.website : null,
    config.presence.whitepaper.viaNortoken ? SERVICE_IDS.whitepaper : null,
  ].filter(Boolean) as string[];

  // ao trocar de categoria, ajusta o supply default sugerido
  const pickCategory = (id: string) => {
    setCategory(id);
    const cat = preset.categories.find(c => c.id === id);
    if (cat?.defaultSupply) setSupplyCfg({ initial: cat.defaultSupply });
  };

  const totalFeeBps = config.taxes.protocolFeeBps + config.taxes.clientTaxBps;

  // invariantes que espelham o contrato
  const configIssues = useMemo(() => {
    const issues: string[] = [];
    if (totalFeeBps > MAX_TOTAL_FEE_BPS)
      issues.push(`Fee total ${bpsToPct(totalFeeBps)}% acima do teto de ${bpsToPct(MAX_TOTAL_FEE_BPS)}%.`);
    if (config.supply.maxCap != null && config.supply.maxCap < config.supply.initial)
      issues.push('O teto máximo (cap) não pode ser menor que o supply inicial.');
    if (config.trustSeal.honeypotFreeAttest) {
      if (config.protections.maxTxPct != null && config.protections.maxTxPct < 1)
        issues.push('Selo honeypot-free exige máx. por transação ≥ 1% (venda sempre possível).');
      if (config.protections.maxWalletPct != null && config.protections.maxWalletPct < 1)
        issues.push('Selo honeypot-free exige máx. por carteira ≥ 1%.');
    }
    if (config.taxes.clientTaxBps > 0 && !config.taxes.clientTreasury.trim())
      issues.push('Defina o endereço de tesouro do cliente para a sua taxa.');
    return issues;
  }, [config, totalFeeBps]);

  const quote = useMemo(
    () =>
      quoteDeploy({
        network,
        supply: config.supply.initial,
        clientTaxBps: config.taxes.clientTaxBps,
        estMonthlyVolumeUsd,
      }),
    [network, config.supply.initial, config.taxes.clientTaxBps, estMonthlyVolumeUsd],
  );

  // Nortoken Trust Score — recalculado ao vivo conforme o usuário ajusta a config.
  const trust = useMemo(
    () => computeTrustScore({ config, docsCount: documents.length }),
    [config, documents.length],
  );
  const [showBreakdown, setShowBreakdown] = useState(false);

  // ── Co-Pilot ──
  const triggerAiCopilot = async () => {
    if (!name) {
      setCopilotError('Forneça um Nome para o Token antes de chamar o Co-Pilot.');
      return;
    }
    setCopilotLoading(true);
    setCopilotError('');
    setCopilotData(null);

    const fieldCtx = preset.copilotFields
      .map(f => (extra[f.key] ? `${f.label}: ${extra[f.key]}` : ''))
      .filter(Boolean)
      .join(' · ');

    try {
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetName: name,
          assetCategory: category,
          draftDescription: description,
          location: extra['location'] || '',
          environmentalGoal: extra['environmentalGoal'] || '',
          extraContext: fieldCtx,
          copilotPersona: preset.copilotPersona,
          fallbackSupply: currentCat.defaultSupply,
        }),
      });
      if (!response.ok) throw new Error('Falha na resposta do servidor.');
      setCopilotData(await response.json());
    } catch (err) {
      console.error(err);
      setCopilotError('Servidor ocupado. Usando rascunhador local alternativo.');
      const simulatedSymbol = name.substring(0, 4).toUpperCase() + 'X';
      setCopilotData({
        recommendedSymbol: simulatedSymbol,
        recommendedSupply: currentCat.defaultSupply ?? 250000,
        refinedDescription: `${name} — token do segmento "${currentCat.label}" estruturado pela Nortoken para lançamento seguro em rede EVM, com proteção anti-sniper e tokenômica equilibrada.`,
        mathematicalExplanation:
          currentCat.supplyRationale ?? 'Supply sugerido equilibrando liquidez e distribuição saudável.',
        sustainabilityScore: 88,
        mockWhitepaperSummary: {
          introduction: `Visão geral do projeto ${name} e sua proposta de valor.`,
          architecture: 'Token EVM com fee-on-transfer transparente, proteções de lançamento e supply controlado.',
          impact: 'Tração esperada dentro do segmento e da comunidade.',
          governance: 'Holders participam das decisões e da destinação de recursos.',
        },
        mode: 'Simulador Local (Fallback)',
      });
    } finally {
      setCopilotLoading(false);
    }
  };

  const applyCopilotSuggestions = () => {
    if (!copilotData) return;
    setSymbol(copilotData.recommendedSymbol || '');
    setSupplyCfg({ initial: Number(copilotData.recommendedSupply) || config.supply.initial });
    setDescription(copilotData.refinedDescription || '');
    if (copilotData.mockWhitepaperSummary) {
      const docName = `WHITEPAPER_${name.toUpperCase().replace(/\s+/g, '_')}.md`;
      const simulatedDoc: TokenDocument = {
        id: 'whitepaper-draft-id',
        name: docName,
        type: 'Whitepaper (IA)',
        uploadedAt: new Date().toISOString(),
        fileSize: '3.4 KB',
      };
      setDocuments(prev => [...prev.filter(d => d.id !== 'whitepaper-draft-id'), simulatedDoc]);
    }
    setCopilotData(null);
  };

  const handleDocumentSimulation = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const newDoc: TokenDocument = {
        id: Math.random().toString(36).substring(4),
        name: file.name,
        type,
        uploadedAt: new Date().toISOString(),
        fileSize: (file.size / 1024).toFixed(1) + ' KB',
      };
      setDocuments(prev => [...prev, newDoc]);
    }
  };

  const removeDoc = (id: string) => setDocuments(prev => prev.filter(d => d.id !== id));

  // ── Deploy REAL (passo 1: criar o token on-chain via Privy + viem) ──
  const startRealDeploy = async () => {
    setIsDeploying(true);
    setDeployStep(1);
    try {
      const initParams = toInitParams(config, name, symbol.toUpperCase() || 'NOR', wallet.address as Address);
      setDeployStep(2);
      const { token, hash } = await deployer.createToken(initParams);
      setDeployStep(4);
      const newToken: Token = {
        id: name.toLowerCase().replace(/\s+/g, '-') + '-' + token.slice(2, 6),
        name,
        symbol: symbol.toUpperCase() || 'NOR',
        supply: config.supply.initial,
        description: description || `Token do segmento ${currentCat.label} lançado via Nortoken.`,
        image:
          image ||
          'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?q=80&w=256&auto=format&fit=crop',
        category,
        status: 'completed',
        contractAddress: token, // ENDEREÇO REAL on-chain
        documents,
        deployCostUsd: 0, // taxa de emissão OFF em testnet
        holderCount: 1,
        createdAt: new Date().toISOString(),
        creatorWallet: wallet.address,
        verified: false,
        premiumServices: contractedServices,
        analytics: [{ date: 'Hoje', volume: 0, price: 1.0, holders: 1 }],
        config,
        network: 'base',
        presetId: preset.id,
        trustScore: trust.score,
        onChainChainId: BASE_SEPOLIA.chainId, // marca como token REAL on-chain
      };
      onTokenCreated(newToken);
      console.log(`[Nortoken] token real: ${BASE_SEPOLIA.explorer}/address/${token} (tx ${hash})`);
      setIsDeploying(false);
      setStep(1);
      setTab('dashboard');
    } catch (e: unknown) {
      setIsDeploying(false);
      setDeployStep(0);
      const msg = e instanceof Error ? e.message : String(e);
      alert('Falha no deploy on-chain: ' + msg);
    }
  };

  // ── Deploy (real em testnet, simulado em mock) ──
  const startTokenizationDeploy = () => {
    if (!wallet.connected) {
      alert('Conecte sua carteira no menu superior antes do Deploy.');
      return;
    }
    if (configIssues.length > 0) {
      alert('Resolva as pendências de configuração antes do deploy.');
      return;
    }
    if (IS_TESTNET) {
      void startRealDeploy();
      return;
    }
    setIsDeploying(true);
    setDeployStep(1);
    setTimeout(() => {
      setDeployStep(2);
      setTimeout(() => {
        setDeployStep(3);
        setTimeout(() => {
          setDeployStep(4);
          setTimeout(() => {
            const tokenAddr =
              '0x' + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);
            const newToken: Token = {
              id: name.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 5),
              name,
              symbol: symbol.toUpperCase() || 'NOR',
              supply: config.supply.initial,
              description: description || `Token do segmento ${currentCat.label} lançado via Nortoken.`,
              image:
                image ||
                'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?q=80&w=256&auto=format&fit=crop',
              category,
              status: 'completed',
              contractAddress: tokenAddr,
              documents,
              deployCostUsd: quote.totalDeployUsd + addonsUsd,
              holderCount: 1,
              createdAt: new Date().toISOString(),
              creatorWallet: wallet.address,
              verified: false,
              premiumServices: contractedServices,
              analytics: [{ date: 'Hoje', volume: quote.totalDeployUsd, price: 1.0, holders: 1 }],
              config,
              network,
              presetId: preset.id,
              trustScore: trust.score,
            };
            onTokenCreated(newToken);
            setIsDeploying(false);
            setStep(1);
            setTab('dashboard');
          }, 1200);
        }, 1200);
      }, 1200);
    }, 1200);
  };

  const STEP_LABELS = ['Segmento', 'Identidade', 'Configuração', 'Documentos', 'Revisão'];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-white relative">
      <div className="absolute top-[20%] left-[-20%] w-[250px] h-[250px] rounded-full bg-amazon-medium opacity-20 blur-[100px] pointer-events-none"></div>

      {/* HEADER */}
      <div className="text-center space-y-3 mb-10">
        <h1 className="text-3xl sm:text-5xl font-black italic uppercase tracking-tight">
          {preset.headerTitle.replace(/Tokens?$/i, '')}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Tokens</span>
        </h1>
        <p className="text-gray-300 text-sm max-w-2xl mx-auto font-light leading-relaxed">
          {preset.headerSubtitle}
        </p>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 pt-4">
          {STEP_LABELS.map((label, idx) => {
            const i = idx + 1;
            return (
              <div key={i} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div
                    id={`creator-step-dot-${i}`}
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-black transition-all border ${
                      step === i
                        ? 'bg-gradient-to-tr from-emerald-500 to-cyan-500 text-[#02181a] border-emerald-400 shadow-md shadow-emerald-500/20 scale-110'
                        : step > i
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-white/5 text-gray-400 border-white/5'
                    }`}
                  >
                    {i}
                  </div>
                  <span className={`text-[8px] uppercase tracking-wider font-bold hidden sm:block ${step === i ? 'text-cyan-400' : 'text-gray-500'}`}>
                    {label}
                  </span>
                </div>
                {i < STEP_LABELS.length && (
                  <div className={`h-[2px] w-5 sm:w-12 mx-0.5 mb-4 ${step > i ? 'bg-emerald-500' : 'bg-white/10'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* MAIN FRAME */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">

        {/* STEP 1 — SEGMENTO */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-xl font-black italic uppercase tracking-tight">{preset.step1Title}</h2>
              <p className="text-xs text-gray-400 mt-1">{preset.step1Hint}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {preset.categories.map(cat => (
                <div
                  id={`cat-select-card-${cat.id}`}
                  key={cat.id}
                  onClick={() => pickCategory(cat.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex gap-4 ${
                    category === cat.id
                      ? 'border-amazon-light bg-amazon-light/5 shadow-md shadow-amazon-green/10'
                      : 'border-white/5 hover:border-white/10 hover:bg-white/5'
                  }`}
                >
                  <div className="text-3xl p-2.5 rounded-xl bg-white/5 h-fit flex items-center justify-center">
                    {cat.icon}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-white text-base">{cat.label}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">{cat.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              <span className="text-xs text-emerald-400 font-mono tracking-wider">EVM • BASE / POLYGON / BNB</span>
              <button
                id="btn-category-next"
                onClick={() => setStep(2)}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-[#02181a] px-6 py-3 rounded-full font-black uppercase tracking-widest text-xs hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
              >
                Prosseguir
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — IDENTIDADE & CO-PILOT */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h2 className="text-xl font-black italic uppercase tracking-tight">Identidade & Co-Pilot IA</h2>
                <p className="text-xs text-gray-400 mt-1">
                  Defina a identidade do token e chame nossa IA para desenhar a narrativa e a tokenômica.
                </p>
              </div>
              <div className="text-[10px] font-black tracking-widest font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full h-fit w-fit uppercase">
                {currentCat.label}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-300">Nome do Token / Projeto:</label>
                  <input
                    id="input-token-name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder={preset.namePlaceholder}
                    className="w-full px-4 py-3 rounded-xl border glass-input text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-300">Símbolo (Ticker):</label>
                    <input
                      id="input-token-symbol"
                      type="text"
                      value={symbol}
                      onChange={e => setSymbol(e.target.value)}
                      placeholder={preset.symbolPlaceholder}
                      className="w-full px-4 py-3 rounded-xl border glass-input text-sm font-mono uppercase"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-300">Supply Inicial:</label>
                    <input
                      id="input-token-supply"
                      type="number"
                      value={config.supply.initial}
                      onChange={e => setSupplyCfg({ initial: Number(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border glass-input text-sm font-mono"
                    />
                  </div>
                </div>

                {/* Campos dinâmicos do preset */}
                {preset.copilotFields.map(f => (
                  <div className="space-y-1.5" key={f.key}>
                    <label className="block text-xs font-semibold text-gray-300">{f.label}:</label>
                    <input
                      id={`input-extra-${f.key}`}
                      type="text"
                      value={extra[f.key] || ''}
                      onChange={e => setExtra(prev => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full px-4 py-3 rounded-xl border glass-input text-sm"
                    />
                  </div>
                ))}

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-300">Imagem Representativa (URL):</label>
                  <input
                    id="input-token-image"
                    type="text"
                    value={image}
                    onChange={e => setImage(e.target.value)}
                    placeholder="Deixe em branco para ícone automático"
                    className="w-full px-4 py-3 rounded-xl border glass-input text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-300">Descrição do Projeto:</label>
                  <textarea
                    id="input-token-desc"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={3}
                    placeholder={preset.descriptionPlaceholder}
                    className="w-full px-4 py-3 rounded-xl border glass-input text-sm leading-relaxed"
                  />
                </div>
              </div>

              {/* Co-Pilot */}
              <div className="rounded-2xl bg-amazon-deep/40 border border-white/5 p-5 relative overflow-hidden flex flex-col justify-between h-full min-h-[350px]">
                <div className="absolute top-[-50px] right-[-50px] w-28 h-28 rounded-full bg-amazon-light/10 blur-xl pointer-events-none"></div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                    <Sparkles className="w-5 h-5 text-amazon-neon shrink-0" />
                    <h3 className="font-display font-bold text-sm text-white">Assistente de Tokenômica IA</h3>
                  </div>

                  {copilotLoading ? (
                    <div className="flex flex-col items-center justify-center py-10 space-y-3">
                      <RefreshCw className="w-8 h-8 text-amazon-neon animate-spin" />
                      <p className="text-xs text-gray-400 font-mono text-center">
                        Gemini estruturando tokenômica e narrativa...
                      </p>
                    </div>
                  ) : copilotError ? (
                    <div className="p-4 bg-red-950/20 rounded-xl border border-red-500/10 text-xs text-red-300 flex gap-2">
                      <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
                      <div>
                        <span>{copilotError}</span>
                        <button onClick={triggerAiCopilot} className="block underline mt-1.5 hover:text-white">
                          Tentar novamente
                        </button>
                      </div>
                    </div>
                  ) : copilotData ? (
                    <div className="space-y-4 text-xs">
                      <div className="bg-amazon-forest/20 p-3 rounded-xl border border-amazon-light/10 space-y-2">
                        <div className="flex justify-between font-mono">
                          <span className="text-gray-450 uppercase">Ticker Recomendado:</span>
                          <span className="text-amazon-neon font-bold">${copilotData.recommendedSymbol}</span>
                        </div>
                        <div className="flex justify-between font-mono">
                          <span className="text-gray-450 uppercase">Supply Recomendado:</span>
                          <span className="text-white font-bold">
                            {Number(copilotData.recommendedSupply).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-450">Score do Projeto:</span>
                          <span className="text-emerald-400 font-bold">{copilotData.sustainabilityScore}/100</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-400 font-semibold block uppercase">Justificativa:</span>
                        <p className="text-[11px] text-gray-300 leading-relaxed font-mono">
                          {copilotData.mathematicalExplanation}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-400 font-semibold block uppercase">Narrativa Refinada:</span>
                        <p className="text-[11px] text-gray-300 leading-relaxed max-h-[110px] overflow-y-auto pr-1">
                          {copilotData.refinedDescription}
                        </p>
                      </div>
                      <div className="bg-emerald-500/5 p-2 rounded border border-emerald-500/10 text-[10px] text-emerald-300 text-center font-mono">
                        Modo: {copilotData.mode}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3.5 text-center py-6">
                      <Cpu className="w-10 h-10 text-gray-400 mx-auto opacity-60" />
                      <p className="text-xs text-gray-400 max-w-xs mx-auto">
                        Insira ao menos um <strong>Nome</strong> e clique abaixo para a IA gerar ticker, supply,
                        narrativa e um rascunho de whitepaper.
                      </p>
                    </div>
                  )}
                </div>

                {copilotData ? (
                  <div className="flex gap-2 pt-2 border-t border-white/5 mt-4">
                    <button
                      id="copilot-apply-btn"
                      onClick={applyCopilotSuggestions}
                      className="flex-1 py-2 px-3 bg-amazon-neon text-petroleum-dark hover:bg-white text-xs font-bold rounded-xl transition-all font-mono uppercase text-center"
                    >
                      Aplicar Sugestões
                    </button>
                    <button
                      onClick={() => setCopilotData(null)}
                      className="py-2 px-3 bg-white/5 hover:bg-white/10 text-xs rounded-xl"
                    >
                      Descartar
                    </button>
                  </div>
                ) : (
                  <button
                    id="copilot-call-btn"
                    disabled={copilotLoading}
                    onClick={triggerAiCopilot}
                    className="w-full mt-4 flex items-center justify-center gap-2 bg-white/5 hover:bg-amazon-neon/10 hover:text-amazon-neon border border-white/10 hover:border-amazon-neon/20 py-3 rounded-xl font-bold text-xs font-mono tracking-wide uppercase transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amazon-neon animate-pulse" />
                    Acionar Co-Pilot IA
                  </button>
                )}
              </div>
            </div>

            <StepNav
              onBack={() => setStep(1)}
              onNext={() => {
                if (!name || !symbol) {
                  alert('Defina ao menos Nome e Símbolo do token.');
                  return;
                }
                setStep(3);
              }}
            />
          </div>
        )}

        {/* STEP 3 — CONFIGURAÇÃO (4 alavancas) */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-xl font-black italic uppercase tracking-tight">Configuração do Contrato</h2>
              <p className="text-xs text-gray-400 mt-1">
                As alavancas que tornam seu token <strong>musculoso</strong>: supply, proteções anti-bot/MEV, selo de
                confiança e taxas.
              </p>
            </div>

            {/* ── NORTOKEN TRUST SCORE (ao vivo) ── */}
            <div
              className="rounded-2xl p-5 border space-y-3"
              style={{
                borderColor: `${BAND_META[trust.band].hex}55`,
                background: `${BAND_META[trust.band].hex}0f`,
              }}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5" style={{ color: BAND_META[trust.band].hex }} />
                    <span className="text-sm font-black uppercase tracking-wide">Nortoken Trust Score</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Critérios reais de mercado (liquidez, mint, ownership, fee, honeypot). Mede segurança do contrato —
                    não garante valorização.
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono font-black text-3xl leading-none" style={{ color: BAND_META[trust.band].hex }}>
                    {trust.score}
                    <span className="text-sm text-gray-500">/100</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: BAND_META[trust.band].hex }}>
                    {BAND_META[trust.band].label}
                  </span>
                </div>
              </div>

              {/* barra */}
              <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${trust.score}%`, background: BAND_META[trust.band].hex }}
                />
              </div>

              {/* toggle breakdown */}
              <button
                onClick={() => setShowBreakdown(v => !v)}
                className="flex items-center gap-1 text-[11px] font-bold text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showBreakdown ? 'rotate-180' : ''}`} />
                {showBreakdown ? 'Ocultar' : 'Ver'} como o mercado calcula
              </button>

              {showBreakdown && (
                <div className="space-y-2 pt-1">
                  {trust.factors.map(f => {
                    const pct = f.max ? f.points / f.max : 0;
                    const col = pct >= 0.75 ? '#10b981' : pct >= 0.4 ? '#f59e0b' : '#ef4444';
                    return (
                      <div key={f.key} className="text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-200 font-semibold">{f.label}</span>
                          <span className="font-mono font-bold" style={{ color: col }}>
                            +{f.points}
                            <span className="text-gray-500">/{f.max}</span>
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 leading-snug">{f.note}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Rede */}
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-wider font-bold text-gray-400">Rede de Deploy</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {NETWORKS.map(n => {
                  // No testnet real, só as redes com o trio no ar são selecionáveis.
                  const disabled = IS_TESTNET && !NETWORK_LIVE[n.id];
                  return (
                    <button
                      key={n.id}
                      onClick={() => !disabled && setNetwork(n.id)}
                      disabled={disabled}
                      title={disabled ? 'Em breve nesta rede' : undefined}
                      className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all relative ${
                        disabled
                          ? 'border-white/5 bg-white/[0.02] text-gray-600 cursor-not-allowed'
                          : network === n.id
                            ? 'border-cyan-400 bg-cyan-400/10 text-cyan-300 cursor-pointer'
                            : 'border-white/5 bg-white/5 text-gray-400 hover:text-white cursor-pointer'
                      }`}
                    >
                      {n.label}
                      {disabled && <span className="block text-[8px] font-normal text-gray-600">em breve</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* (a) SUPPLY */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <Coins className="w-4 h-4 text-amazon-neon" /> Supply & Mintagem
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="space-y-1 block">
                    <span className="text-[10px] uppercase text-gray-400">Supply Inicial</span>
                    <input
                      type="number"
                      value={config.supply.initial}
                      onChange={e => setSupplyCfg({ initial: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border glass-input text-xs font-mono"
                    />
                  </label>
                  <label className="space-y-1 block">
                    <span className="text-[10px] uppercase text-gray-400">Teto Máx. (cap)</span>
                    <input
                      type="number"
                      value={config.supply.maxCap ?? ''}
                      placeholder="∞ sem teto"
                      onChange={e =>
                        setSupplyCfg({ maxCap: e.target.value ? Number(e.target.value) : null })
                      }
                      className="w-full px-3 py-2 rounded-lg border glass-input text-xs font-mono"
                    />
                  </label>
                </div>
                <Toggle
                  label="Mintável após o deploy"
                  hint="Permite emitir mais tokens no futuro (owner)."
                  on={config.supply.mintable}
                  onChange={v => setSupplyCfg({ mintable: v })}
                />
                <Toggle
                  label="Renunciar mint no lançamento"
                  hint="Supply fixo permanente — sinal forte de confiança."
                  on={config.supply.renounceMintAtLaunch}
                  onChange={v => setSupplyCfg({ renounceMintAtLaunch: v })}
                />
              </div>

              {/* (b) PROTEÇÕES */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <Bot className="w-4 h-4 text-cyan-400" /> Proteções de Lançamento
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="space-y-1 block">
                    <span className="text-[10px] uppercase text-gray-400">Anti-snipe (blocos)</span>
                    <input
                      type="number"
                      value={config.protections.antiSnipeBlocks}
                      onChange={e => setProtect({ antiSnipeBlocks: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border glass-input text-xs font-mono"
                    />
                  </label>
                  <label className="space-y-1 block">
                    <span className="text-[10px] uppercase text-gray-400">Cooldown (seg)</span>
                    <input
                      type="number"
                      value={config.protections.tradeCooldownSec}
                      onChange={e => setProtect({ tradeCooldownSec: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border glass-input text-xs font-mono"
                    />
                  </label>
                  <label className="space-y-1 block">
                    <span className="text-[10px] uppercase text-gray-400">Máx/carteira (%)</span>
                    <input
                      type="number"
                      value={config.protections.maxWalletPct ?? ''}
                      placeholder="off"
                      onChange={e =>
                        setProtect({ maxWalletPct: e.target.value ? Number(e.target.value) : null })
                      }
                      className="w-full px-3 py-2 rounded-lg border glass-input text-xs font-mono"
                    />
                  </label>
                  <label className="space-y-1 block">
                    <span className="text-[10px] uppercase text-gray-400">Máx/transação (%)</span>
                    <input
                      type="number"
                      value={config.protections.maxTxPct ?? ''}
                      placeholder="off"
                      onChange={e =>
                        setProtect({ maxTxPct: e.target.value ? Number(e.target.value) : null })
                      }
                      className="w-full px-3 py-2 rounded-lg border glass-input text-xs font-mono"
                    />
                  </label>
                </div>
                <p className="text-[10px] text-gray-500 leading-snug">
                  Anti-snipe e cooldown são <strong>temporários</strong> (expiram após o lançamento) — protegem sem
                  prender o investidor.
                </p>
              </div>

              {/* (c) SELO DE CONFIANÇA */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Selo de Confiança
                </div>
                <Toggle
                  label="Lock automático de liquidez"
                  hint="Trava a liquidez por um período — impede rug pull."
                  on={config.trustSeal.autoLiquidityLock}
                  onChange={v => setSeal({ autoLiquidityLock: v })}
                />
                {config.trustSeal.autoLiquidityLock && (
                  <label className="space-y-1 block">
                    <span className="text-[10px] uppercase text-gray-400">Dias de lock</span>
                    <input
                      type="number"
                      value={config.trustSeal.liquidityLockDays}
                      onChange={e => setSeal({ liquidityLockDays: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border glass-input text-xs font-mono"
                    />
                  </label>
                )}
                <Toggle
                  label="Renunciar ownership"
                  hint="Ninguém pode alterar o contrato depois."
                  on={config.trustSeal.renounceOwnership}
                  onChange={v => setSeal({ renounceOwnership: v })}
                />
                <Toggle
                  label="Atestado honeypot-free"
                  hint="Garante que vender sempre funciona (sem blacklist, fee ≤ teto)."
                  on={config.trustSeal.honeypotFreeAttest}
                  onChange={v => setSeal({ honeypotFreeAttest: v })}
                />
              </div>

              {/* (d) TAXAS */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <Percent className="w-4 h-4 text-amber-400" /> Taxas de Transferência
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                  <div>
                    <span className="text-xs font-semibold text-emerald-300 block">Fee de Protocolo Nortoken</span>
                    <span className="text-[10px] text-gray-400">Fixo, imutável, em toda transferência</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-400">0,20%</span>
                </div>
                <label className="space-y-1 block">
                  <span className="text-[10px] uppercase text-gray-400">
                    Sua taxa de projeto (%) — vai pro seu tesouro
                  </span>
                  <input
                    type="number"
                    step="0.1"
                    value={config.taxes.clientTaxBps / 100}
                    onChange={e => setTax({ clientTaxBps: Math.round(Number(e.target.value) * 100) })}
                    className="w-full px-3 py-2 rounded-lg border glass-input text-xs font-mono"
                  />
                </label>
                {config.taxes.clientTaxBps > 0 && (
                  <label className="space-y-1 block">
                    <span className="text-[10px] uppercase text-gray-400">Endereço do seu tesouro</span>
                    <input
                      type="text"
                      value={config.taxes.clientTreasury}
                      onChange={e => setTax({ clientTreasury: e.target.value })}
                      placeholder="0x..."
                      className="w-full px-3 py-2 rounded-lg border glass-input text-xs font-mono"
                    />
                  </label>
                )}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                  <span className="text-gray-400">Fee total por transferência</span>
                  <span
                    className={`font-mono font-bold ${
                      totalFeeBps > MAX_TOTAL_FEE_BPS ? 'text-red-400' : 'text-white'
                    }`}
                  >
                    {bpsToPct(totalFeeBps)}%
                  </span>
                </div>
                <p className="text-[10px] text-gray-500">Teto duro: {bpsToPct(MAX_TOTAL_FEE_BPS)}% (anti-honeypot).</p>
              </div>
            </div>

            {/* ── PRESENÇA & MATERIAIS ── */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold">
                <Globe className="w-4 h-4 text-cyan-400" /> Presença & Materiais do Projeto
                <span className="text-[10px] font-normal text-gray-400">— elevam a confiança do ativo</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PresenceCard
                  label="Site oficial"
                  icon={<Globe className="w-4 h-4 text-cyan-400" />}
                  status={config.presence.website}
                  priceUsd={SERVICE_PRICE_USD.website}
                  onSelect={m =>
                    setWebsite({ has: m === 'have', viaNortoken: m === 'nortoken' })
                  }
                  onUrl={u => setWebsite({ url: u })}
                />
                <PresenceCard
                  label="Whitepaper"
                  icon={<FileText className="w-4 h-4 text-amazon-neon" />}
                  status={config.presence.whitepaper}
                  priceUsd={SERVICE_PRICE_USD.whitepaper}
                  freeHint="Dica: você também pode gerar um rascunho grátis com a IA no passo anterior."
                  onSelect={m =>
                    setWhitepaper({ has: m === 'have', viaNortoken: m === 'nortoken' })
                  }
                  onUrl={u => setWhitepaper({ url: u })}
                />
              </div>
              {addonsUsd > 0 && (
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="text-gray-400">Serviços Nortoken contratados</span>
                  <span className="font-mono font-bold text-amber-300">+ {usd(addonsUsd)}</span>
                </div>
              )}
            </div>

            {/* Issues */}
            {configIssues.length > 0 && (
              <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 space-y-1">
                {configIssues.map((iss, k) => (
                  <div key={k} className="flex items-center gap-2 text-xs text-red-300">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {iss}
                  </div>
                ))}
              </div>
            )}

            <StepNav
              onBack={() => setStep(2)}
              onNext={() => {
                if (configIssues.length > 0) {
                  alert('Resolva as pendências destacadas antes de prosseguir.');
                  return;
                }
                setStep(4);
              }}
            />
          </div>
        )}

        {/* STEP 4 — DOCUMENTOS */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-xl font-black italic uppercase tracking-tight">Documentação de Suporte (Opcional)</h2>
              <p className="text-xs text-gray-400 mt-1">
                Anexos que reforçam a legitimidade do projeto perante investidores e auditores.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {preset.docTypes.map((dt, idx) => (
                  <div
                    key={dt.id}
                    className={`border-2 border-dashed border-white/10 rounded-2xl p-6 transition-all text-center relative ${
                      idx === 0 ? 'hover:border-amazon-neon/40 hover:bg-amazon-green/5' : 'hover:border-cyan-400/40 hover:bg-cyan-500/5'
                    }`}
                  >
                    <input
                      id={`doc-upload-${dt.id}`}
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={e => handleDocumentSimulation(e, dt.label)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className={`w-8 h-8 mx-auto mb-3 ${idx === 0 ? 'text-amazon-neon' : 'text-cyan-400'}`} />
                    <h4 className="font-semibold text-xs text-white">{dt.label}</h4>
                    <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">{dt.hint}</p>
                  </div>
                ))}
              </div>

              <div className="p-5 bg-amazon-dark/40 rounded-2xl border border-white/5 space-y-4 flex flex-col justify-between h-full">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                    <FileText className="w-4 h-4 text-amazon-neon" />
                    <h3 className="text-xs font-mono uppercase text-gray-300">Documentos Anexados</h3>
                  </div>
                  {documents.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-xs text-gray-400">Nenhum documento anexado ainda.</p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        Projetos sem documentos lançam normalmente, mas ficam "Não Verificados".
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                      {documents.map(doc => (
                        <div key={doc.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                          <div className="flex items-center gap-2">
                            <div className="p-1 rounded bg-amazon-light/10 text-amazon-neon">
                              <CheckCircle className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="text-[11px] font-semibold text-white truncate max-w-[150px]">{doc.name}</div>
                              <div className="text-[9px] text-gray-400">{doc.type} • {doc.fileSize}</div>
                            </div>
                          </div>
                          <button
                            id={`remove-doc-btn-${doc.id}`}
                            onClick={() => removeDoc(doc.id)}
                            className="bg-transparent text-gray-450 hover:text-red-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-3 bg-amazon-forest/10 rounded-xl border border-amazon-light/5 text-[10px] text-gray-350 flex gap-2">
                  <Info className="w-4 h-4 text-amazon-neon shrink-0" />
                  <span>Metadados dos documentos são referenciados on-chain de forma indexada.</span>
                </div>
              </div>
            </div>

            <StepNav onBack={() => setStep(3)} onNext={() => setStep(5)} nextLabel="Revisar & Lançar" />
          </div>
        )}

        {/* STEP 5 — REVISÃO + PRICING + DEPLOY */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-xl font-black italic uppercase tracking-tight">Revisão & Lançamento</h2>
              <p className="text-xs text-gray-400 mt-1">
                Confira a ficha, o custo de lançamento e o modelo de receita recorrente antes do deploy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Ficha */}
              <div className="md:col-span-7 bg-white/5 p-5 rounded-2xl border border-white/5 space-y-4">
                <h3 className="font-semibold text-sm text-gray-300">Ficha Técnica</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <Field label="Nome" value={name} />
                  <Field label="Segmento" value={currentCat.label} accent />
                  <Field label="Símbolo" value={`$${symbol.toUpperCase()}`} mono />
                  <Field label="Supply inicial" value={config.supply.initial.toLocaleString('pt-BR')} mono />
                  <Field label="Rede" value={NETWORKS.find(n => n.id === network)?.label ?? network} />
                  <Field label="Documentos" value={`${documents.length} anexo(s)`} />
                </div>

                {/* badges de proteção */}
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/5">
                  <TrustBadge score={trust.score} variant="full" />
                  {config.supply.renounceMintAtLaunch && <Badge icon={<Flame className="w-3 h-3" />} text="Supply fixo" />}
                  {(config.protections.antiSnipeBlocks > 0 || config.protections.maxWalletPct) && (
                    <Badge icon={<Bot className="w-3 h-3" />} text="Anti-bot/MEV" />
                  )}
                  {config.trustSeal.autoLiquidityLock && (
                    <Badge icon={<Lock className="w-3 h-3" />} text={`Liquidez ${config.trustSeal.liquidityLockDays}d`} />
                  )}
                  {config.trustSeal.honeypotFreeAttest && (
                    <Badge icon={<ShieldCheck className="w-3 h-3" />} text="Honeypot-free" />
                  )}
                </div>

                <div className="pt-3 border-t border-white/5 text-xs">
                  <span className="text-gray-400 block uppercase text-[10px]">Descrição</span>
                  <p className="text-gray-300 mt-1 leading-relaxed max-h-[80px] overflow-y-auto">
                    {description || 'Sem descrição cadastrada.'}
                  </p>
                </div>
              </div>

              {/* Pricing */}
              <div className="md:col-span-5 flex flex-col justify-between h-full bg-amazon-forest/10 p-5 rounded-2xl border border-amazon-light/10 space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-gray-300">
                    <Coins className="w-4 h-4 text-amazon-neon" />
                    <span>Custo de Lançamento</span>
                  </div>

                  <div className="space-y-2 pb-3 border-b border-white/5 text-xs">
                    {quote.breakdown.map((line, k) => (
                      <div className="flex justify-between" key={k}>
                        <span className="text-gray-450 text-[11px]">{line.label}</span>
                        <span className="font-mono text-white">{usd(line.usd)}</span>
                      </div>
                    ))}
                    {config.presence.website.viaNortoken && (
                      <div className="flex justify-between">
                        <span className="text-gray-450 text-[11px]">Site oficial (Nortoken)</span>
                        <span className="font-mono text-amber-300">{usd(SERVICE_PRICE_USD.website)}</span>
                      </div>
                    )}
                    {config.presence.whitepaper.viaNortoken && (
                      <div className="flex justify-between">
                        <span className="text-gray-450 text-[11px]">Whitepaper (Nortoken)</span>
                        <span className="font-mono text-amber-300">{usd(SERVICE_PRICE_USD.whitepaper)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-300 uppercase">Total no deploy</span>
                    <span className="text-lg font-bold text-amazon-neon font-mono">
                      {usd(quote.totalDeployUsd + addonsUsd)}
                    </span>
                  </div>

                  {/* Receita recorrente */}
                  <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-300 uppercase">
                      <Percent className="w-3.5 h-3.5" /> Receita recorrente Nortoken
                    </div>
                    <p className="text-[10px] text-gray-400 leading-snug">
                      0,2% de cada transferência (compra e venda) vai para a infraestrutura Nortoken — sem nunca
                      travar a venda do investidor.
                    </p>
                    <label className="block space-y-1">
                      <span className="text-[10px] text-gray-400">Volume mensal estimado (US$)</span>
                      <input
                        type="number"
                        value={estMonthlyVolumeUsd}
                        onChange={e => setEstMonthlyVolumeUsd(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border glass-input text-xs font-mono"
                      />
                    </label>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-400">Receita estimada/mês</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {usd(quote.estMonthlyProtocolRevenueUsd ?? 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {isDeploying ? (
                  <div className="bg-amazon-dark/80 p-4 rounded-xl border border-white/5 space-y-3.5 pt-4">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-amazon-neon animate-pulse font-bold">Deploying...</span>
                      <span className="text-gray-400">{deployStep * 25}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amazon-green to-amazon-neon h-full transition-all duration-500"
                        style={{ width: `${deployStep * 25}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-gray-300 font-mono text-left space-y-1">
                      {deployStep >= 1 && <div className="text-emerald-400">✓ Compilando contrato musculoso...</div>}
                      {deployStep >= 2 && <div className="text-emerald-400">✓ Injetando proteções anti-bot/MEV...</div>}
                      {deployStep >= 3 && <div className="text-emerald-300">✓ Publicando na rede EVM...</div>}
                      {deployStep >= 4 && <div className="text-amazon-neon">⚡ Registrando fee de protocolo 0,2%...</div>}
                    </div>
                  </div>
                ) : wallet.connected ? (
                  <button
                    id="token-creator-deploy-btn"
                    onClick={startTokenizationDeploy}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-[#02181a] font-black uppercase tracking-widest text-xs hover:shadow-[0_0_30px_rgba(45,212,191,0.4)] hover:scale-[1.02] rounded-xl text-center shadow-xl transition-all cursor-pointer"
                  >
                    Pagar & Lançar Token
                  </button>
                ) : (
                  <button
                    id="token-creator-connect-wallet-inline"
                    onClick={connectWallet}
                    className="w-full py-3.5 px-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl text-xs text-center border border-white/10 transition-all cursor-pointer"
                  >
                    Conectar Carteira para Lançar
                  </button>
                )}
              </div>
            </div>

            {!isDeploying && (
              <div className="flex justify-between items-center pt-5 border-t border-white/5">
                <button
                  onClick={() => setStep(4)}
                  className="flex items-center gap-1 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Voltar
                </button>
                <span className="text-[10px] text-gray-500">Nortoken Launchpad • Sandbox EVM</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Subcomponentes auxiliares ──

function StepNav({
  onBack,
  onNext,
  nextLabel = 'Prosseguir',
}: {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
}) {
  return (
    <div className="flex justify-between items-center pt-5 border-t border-white/5">
      <button
        onClick={onBack}
        className="flex items-center gap-1 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        Voltar
      </button>
      <button
        onClick={onNext}
        className="flex items-center gap-2 bg-gradient-to-r from-amazon-green to-amazon-light px-6 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer"
      >
        {nextLabel}
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function Field({ label, value, mono, accent }: { label: string; value: string; mono?: boolean; accent?: boolean }) {
  return (
    <div>
      <span className="text-gray-400 block uppercase text-[10px]">{label}:</span>
      <span
        className={`font-semibold ${mono ? 'font-mono' : ''} ${accent ? 'text-emerald-400' : 'text-white'}`}
      >
        {value}
      </span>
    </div>
  );
}

function Badge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-bold">
      {icon}
      {text}
    </span>
  );
}

type PresenceMode = 'have' | 'nortoken' | 'none';

function PresenceCard({
  label,
  icon,
  status,
  priceUsd,
  freeHint,
  onSelect,
  onUrl,
}: {
  label: string;
  icon: React.ReactNode;
  status: ProjectAssetStatus;
  priceUsd: number;
  freeHint?: string;
  onSelect: (mode: PresenceMode) => void;
  onUrl: (url: string) => void;
}) {
  const mode: PresenceMode = status.has ? 'have' : status.viaNortoken ? 'nortoken' : 'none';
  const pick = (m: PresenceMode) => onSelect(mode === m ? 'none' : m);

  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2.5">
      <div className="flex items-center gap-2 text-xs font-bold text-white">{icon} {label}</div>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => pick('have')}
          className={`px-3 py-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
            mode === 'have'
              ? 'border-emerald-400 bg-emerald-400/10 text-emerald-300'
              : 'border-white/5 bg-white/5 text-gray-400 hover:text-white'
          }`}
        >
          Já tenho
        </button>
        <button
          onClick={() => pick('nortoken')}
          className={`px-3 py-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
            mode === 'nortoken'
              ? 'border-amber-400 bg-amber-400/10 text-amber-300'
              : 'border-white/5 bg-white/5 text-gray-400 hover:text-white'
          }`}
        >
          Criar c/ Nortoken · ${priceUsd}
        </button>
      </div>

      {mode === 'have' && (
        <input
          type="text"
          value={status.url || ''}
          onChange={e => onUrl(e.target.value)}
          placeholder="https://..."
          className="w-full px-3 py-2 rounded-lg border glass-input text-xs font-mono"
        />
      )}
      {mode === 'nortoken' && (
        <div className="flex items-center gap-1.5 text-[10px] text-amber-300 bg-amber-400/5 border border-amber-400/15 rounded-lg px-2.5 py-1.5">
          <CheckCircle className="w-3.5 h-3.5 shrink-0" />
          Produzido pela Nortoken — entrega garantida (+${priceUsd} no total).
        </div>
      )}
      {mode === 'none' && (
        <p className="text-[10px] text-gray-500 leading-snug">
          {freeHint ? freeHint + ' ' : ''}Sem este material, o Trust Score não pontua aqui.
        </p>
      )}
    </div>
  );
}
