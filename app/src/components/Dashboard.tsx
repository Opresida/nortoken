/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { isAddress } from 'viem';
import TokenSelect from './TokenSelect';
import { readBalances, fmtTokens } from '../onchain/balances';
import {
  BarChart3,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  FileCheck2,
  HelpCircle,
  TrendingUp,
  Sparkles,
  Percent,
  AlertCircle,
  Coins,
  ArrowUpRight,
  BookmarkCheck,
  Info,
  ArrowRightLeft,
  Lock,
  Ticket,
  Map,
  ShoppingCart,
  FileText,
  DatabaseZap,
  Landmark,
  Copy,
  Check,
  Plus,
  ShieldCheck as ShieldCheckIcon,
} from 'lucide-react';
import { Token, TokenDocument, UserWallet } from '../types';
import TrustBadge from './TrustBadge';
import { IS_TESTNET } from '../onchain/env';
import { useDeployer } from '../onchain/useDeployer';
import { toPoolAndLockArgs, toWei, type Address } from '../onchain/configMapper';
import { ZERO_ADDRESS, BASE_SEPOLIA } from '../onchain/deployments';

interface DashboardProps {
  tokens: Token[];
  wallet: UserWallet;
  onAuditRequested: (tokenId: string, serviceId: string) => void;
  onMintMore: (tokenId: string, extraAmount: number) => void;
  onPoolCreated: (tokenId: string, lockId: string) => void;
  onAddDocument: (tokenId: string, doc: TokenDocument) => void;
  setTab?: (tab: string) => void;
}

// Features que o whitelabel oferece (mostradas como preview no teaser)
const WHITELABEL_FEATURES = [
  { icon: ArrowRightLeft, label: 'Swap' },
  { icon: Lock,           label: 'Stake' },
  { icon: Ticket,         label: 'Referral' },
  { icon: DatabaseZap,    label: 'Buy NFT' },
  { icon: ShoppingCart,   label: 'Buy Token' },
  { icon: Map,            label: 'Roadmap' },
  { icon: FileText,       label: 'Whitepaper' },
  { icon: Landmark,       label: 'Lending', soon: true },
];

export default function Dashboard({
  tokens,
  wallet,
  onAuditRequested,
  onMintMore,
  onPoolCreated,
  onAddDocument,
  setTab,
}: DashboardProps) {

  const [selectedTokenId, setSelectedTokenId] = useState<string>(tokens[0]?.id || '');
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [mintOpen, setMintOpen] = useState(false);
  const [extraMintAmount, setExtraMintAmount] = useState(50000);

  // Passo 2 — "Crie sua pool"
  const deployer = useDeployer();
  const [poolOpen, setPoolOpen] = useState(false);
  const [seedTokens, setSeedTokens] = useState(100000);
  const [seedEth, setSeedEth] = useState(0.01);
  const [poolBusy, setPoolBusy] = useState(false);
  const [poolError, setPoolError] = useState('');

  const selectedToken = tokens.find(t => t.id === selectedTokenId) || tokens[0];

  // Token real on-chain, sem pool ainda? → pode criar a pool (passo 2)
  const canCreatePool =
    IS_TESTNET && !!selectedToken?.onChainChainId && !!selectedToken?.contractAddress && !selectedToken?.poolLockId;

  const handleCreatePool = async () => {
    if (!selectedToken?.config || !selectedToken.contractAddress) return;
    setPoolBusy(true);
    setPoolError('');
    try {
      const seed = {
        tokenAmount: toWei(seedTokens),
        anchorAmount: toWei(seedEth), // ETH = 18 casas
        anchorIsToken0: true, // ETH (0x0) é sempre currency0
      };
      const args = toPoolAndLockArgs(selectedToken.config, ZERO_ADDRESS as Address, seed);
      const { lockId } = await deployer.createPoolAndLock(
        selectedToken.contractAddress as Address,
        args,
        seed.anchorAmount, // ETH enviado (sobra é devolvida pelo lock)
      );
      // renúncia de posse SÓ depois da pool (se o cliente marcou)
      if (selectedToken.config.trustSeal.renounceOwnership) {
        await deployer.renounceOwnership(selectedToken.contractAddress as Address);
      }
      onPoolCreated(selectedToken.id, lockId.toString());
      setPoolOpen(false);
      alert('Pool criada! Liquidez travada (keeper = Mazari) e sua taxa de projeto ativa nos swaps.');
    } catch (e: unknown) {
      setPoolError(e instanceof Error ? e.message : String(e));
    } finally {
      setPoolBusy(false);
    }
  };

  // DMINT só aparece se o token for mintável (respeita a escolha do cliente no deploy).
  const showMint =
    !selectedToken?.config ||
    (selectedToken.config.supply.mintable && !selectedToken.config.supply.renounceMintAtLaunch);

  // Token real on-chain → temos link de explorer e o contrato vem verificado por bytecode.
  const isOnChain = !!selectedToken?.onChainChainId;
  const explorerUrl = isOnChain ? `${BASE_SEPOLIA.explorer}/address/${selectedToken?.contractAddress}` : '';

  const [copied, setCopied] = useState(false);
  const copyText = (t: string) => {
    navigator.clipboard?.writeText(t);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Upload posterior de documento oficial (registra metadados, como no wizard)
  const handleDocPicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !selectedToken) return;
    onAddDocument(selectedToken.id, {
      id: 'doc-' + f.name + '-' + f.size,
      name: f.name,
      type: 'Documento oficial',
      uploadedAt: new Date().toISOString(),
      fileSize: (f.size / 1024).toFixed(0) + ' KB',
    });
    e.target.value = '';
  };

  const handleMintAction = () => {
    if (!selectedToken) return;
    onMintMore(selectedToken.id, extraMintAmount);
    setMintOpen(false);
    alert(`Sucesso! Mint suplementar de ${extraMintAmount.toLocaleString('pt-BR')} ${selectedToken.symbol} finalizado on-chain (simulado).`);
  };

  const getCategoryTheme = (cat: Token['category']) => {
    switch (cat) {
      case 'carbono':
        return { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', emoji: '🌳' };
      case 'bioeconomia':
        return { bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20', emoji: '🍇' };
      case 'madeira':
        return { bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20', emoji: '🪵' };
      case 'cooperativa':
        return { bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', emoji: '🤝' };
      case 'meme':
        return { bg: 'bg-indigo-505/10 text-indigo-400 border-indigo-500/20', emoji: '🦖' };
      default:
        return { bg: 'bg-gray-500/10 text-gray-400 border-gray-500/20', emoji: '⚙️' };
    }
  };

  if (!selectedToken) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto" />
        <h2 className="font-display font-bold text-xl text-white">Nenhum Ativo Registrado</h2>
        <p className="text-sm text-gray-300">
          Você ainda não lançou nenhum token. Vá para "Criar Token" para começar.
        </p>
      </div>
    );
  }

  const categoryTheme = getCategoryTheme(selectedToken.category);

  // Hardcoded holders simulation based on selected token
  // Distribuição: usa o tokenomics REAL definido na criação; cai no mock só pros tokens demo antigos.
  const hasTokenomics = !!selectedToken.tokenomics && selectedToken.tokenomics.length > 0;
  const simulatedHolders = hasTokenomics
    ? selectedToken.tokenomics!.map((t) => ({
        name: t.label,
        address: t.toPool ? '→ Pool de liquidez' : t.wallet ? '' : 'Alocação definida no lançamento',
        percentage: `${t.percent}%`,
        role: t.toPool ? 'Pool' : 'Alocação',
        color: t.color,
        wallet: t.toPool ? undefined : t.wallet,
        toPool: !!t.toPool,
      }))
    : [
        { name: 'Carteira do Emissor (Você)', address: wallet.address || 'NoRtOkEn...7X9k', percentage: '80%', role: 'Fundador', color: '#10b981', wallet: undefined as string | undefined, toPool: false },
        { name: 'Fundo de Manejo Ecológico', address: 'EcoRes98uX...bN7y', percentage: '12%', role: 'Reserva', color: '#34d399', wallet: undefined as string | undefined, toPool: false },
        { name: 'Cooperativa Ribeirinha Local', address: 'CoopAmAzOn...wT5b', percentage: '6%', role: 'Comunidade', color: '#22d3ee', wallet: undefined as string | undefined, toPool: false },
        { name: 'Pool de Liquidez Nortoken DEX', address: 'PoolNorTok...9xW1', percentage: '2%', role: 'Market Maker', color: '#a78bfa', wallet: undefined as string | undefined, toPool: false },
      ];

  // Saldos ao vivo das carteiras de distribuição (verificação pública on-chain).
  const [liveBalances, setLiveBalances] = useState<Record<string, bigint>>({});
  React.useEffect(() => {
    const addrs = (selectedToken.tokenomics ?? [])
      .filter((t) => !t.toPool && t.wallet && isAddress(t.wallet))
      .map((t) => t.wallet as Address);
    if (!selectedToken.onChainChainId || !selectedToken.contractAddress || addrs.length === 0) {
      setLiveBalances({});
      return;
    }
    let cancelled = false;
    readBalances(selectedToken.contractAddress as Address, addrs).then((bals) => {
      if (cancelled) return;
      const map: Record<string, bigint> = {};
      addrs.forEach((a, i) => { map[a.toLowerCase()] = bals[i]; });
      setLiveBalances(map);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedToken.id, isOnChain]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-white">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-white/10 pb-5">
        <div>
          <span className="text-[10px] font-black tracking-widest text-[#10b981] uppercase font-mono">PORTFOLIO INSIGHTS</span>
          <h1 className="text-2xl sm:text-4xl font-black italic uppercase tracking-tight text-white">Painel de Portfólio</h1>
          <p className="text-xs text-gray-400 mt-1">
            Administre seus contratos, simule minerações e acompanhe holders auditados on-chain.
          </p>
        </div>

        {/* Token selector (dropdown customizado) */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 font-mono">Filtrar Ativo:</span>
          <TokenSelect tokens={tokens} value={selectedTokenId} onChange={setSelectedTokenId} />
        </div>
      </div>

      {/* ═══════════ TEASER WHITELABEL ═══════════ */}
      <div className="relative rounded-3xl border border-amazon-neon/30 bg-gradient-to-br from-amazon-forest/40 via-petroleum-deep/80 to-amazon-green/15 overflow-hidden">
        {/* Decorative blur dots */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-amazon-neon/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-amazon-green/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 p-6 sm:p-8">
          {/* Left: pitch */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[9px] font-black tracking-widest text-amazon-neon uppercase bg-amazon-neon/10 border border-amazon-neon/30 px-2.5 py-1 rounded-full font-mono">
                <Sparkles className="w-3 h-3" />
                Upgrade Premium · Whitelabel
              </span>
              <span className="text-[10px] font-mono text-gray-500">disponível para todos os tokens</span>
            </div>

            <h3 className="font-display font-extrabold text-xl sm:text-2xl leading-tight text-white">
              Eleve seu projeto: <span className="italic font-serif font-medium text-amazon-neon">app dedicado</span> com a sua marca.
            </h3>

            <p className="text-sm text-gray-400 leading-relaxed max-w-xl">
              Aqui no painel você acompanha o portfólio básico do seu token. Quer ir além? Ative o
              <strong className="text-white"> Whitelabel</strong>: um app completo em domínio próprio
              com sidebar, swap, stake, referral, roadmap e mais — você sobe a logo, escolhe as cores e
              decide quais funções ativar.
            </p>

            {/* Features grid */}
            <div className="flex flex-wrap gap-2 pt-1">
              {WHITELABEL_FEATURES.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.label}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] text-[11px] font-mono"
                  >
                    <Icon className="w-3 h-3 text-amazon-neon" />
                    <span className="text-gray-300">{f.label}</span>
                    {f.soon && (
                      <span className="text-[8px] uppercase text-yellow-400 font-bold tracking-wider ml-0.5">soon</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: price + CTA */}
          <div className="lg:w-72 flex flex-col gap-3 lg:border-l lg:border-white/10 lg:pl-6 justify-center">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1">Setup único</div>
              <div className="flex items-baseline gap-2">
                <span className="flex items-center gap-1.5 text-2xl font-black text-white font-mono">
                  <img src="/usdc.svg" alt="USDC" className="w-6 h-6" />1.500 USDC
                </span>
                <span className="text-[10px] text-gray-500 font-mono">on-chain</span>
              </div>
              <div className="text-[10px] text-gray-500 mt-1">
                inclui hospedagem em <span className="text-amazon-neon font-mono">nortoken.mazaricorp.com/p/&lt;seu-slug&gt;</span>
              </div>
            </div>

            <button
              onClick={() => setTab?.('whitelabel')}
              className="group flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amazon-green via-amazon-light to-amazon-neon text-petroleum-dark font-extrabold text-xs uppercase tracking-widest transition-all hover:shadow-[0_0_28px_rgba(56,189,108,0.45)] hover:scale-[1.02] cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Ver Demo do Whitelabel
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>

            <button
              onClick={() => setTab?.('premium')}
              className="text-[10px] font-mono uppercase tracking-widest text-gray-400 hover:text-amazon-neon transition-colors cursor-pointer"
            >
              ou contratar agora →
            </button>
          </div>
        </div>
      </div>

      {/* DASHBOARD GRIDS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Key Metrics & Analytics */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Main detailed card */}
          <div className="bg-gradient-to-tr from-petroleum-card to-petroleum-deep border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden group">
            
            {/* Top Row branding */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <span className="text-3xl leading-none">{categoryTheme.emoji}</span>
                <div>
                  <h2 className="font-display font-extrabold text-xl">{selectedToken.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs font-mono font-semibold text-amazon-neon uppercase">${selectedToken.symbol}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                    <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${categoryTheme.bg}`}>
                      {selectedToken.category}
                    </span>
                    {selectedToken.trustScore != null && <TrustBadge score={selectedToken.trustScore} variant="full" />}
                  </div>
                </div>
              </div>

              {/* Verified Badge */}
              {selectedToken.verified ? (
                <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-3.5 py-1.5 rounded-xl">
                  <ShieldCheck className="w-4 h-4" />
                  Auditado & Verificado RWA
                </div>
              ) : (
                <button
                  id="request-audit-btn-inline"
                  onClick={() => {
                    onAuditRequested(selectedToken.id, 'rwa_audit');
                    alert('Solicitação de Auditoria enviada aos Fiscais parceiros! Em breve o status será avaliado no painel Administrativo.');
                  }}
                  className="inline-flex items-center gap-1.5 bg-yellow-500/15 border border-yellow-500/30 text-yellow-500 text-xs font-semibold px-3.5 py-1.5 rounded-xl hover:bg-yellow-500/25 transition-all cursor-pointer"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Não Auditado (Solicitar Visita)
                </button>
              )}
            </div>

            {/* Description and metadata */}
            <div className="space-y-2 text-sm">
              <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">História de Impacto do Ativo:</span>
              <p className="text-gray-300 leading-relaxed text-sm">
                {selectedToken.description}
              </p>
            </div>

            {/* Blockchain Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-4 rounded-2xl bg-amazon-dark/40 border border-white/5 text-xs font-mono">
              <div className="space-y-1 min-w-0">
                <span className="text-gray-400 text-[10px] uppercase block">Contrato do Token:</span>
                <div className="flex items-center gap-2">
                  <span className="text-white text-[11px] truncate select-all">{selectedToken.contractAddress || 'deploying_on_evm'}</span>
                  {selectedToken.contractAddress && (
                    <button
                      onClick={() => copyText(selectedToken.contractAddress!)}
                      title="Copiar endereço do contrato"
                      className="text-gray-400 hover:text-amazon-neon shrink-0 cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
                {isOnChain && (
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 cursor-pointer"
                  >
                    <ExternalLink className="w-3 h-3" /> ver no BaseScan
                  </a>
                )}
              </div>
              <div className="space-y-1">
                <span className="text-gray-400 text-[10px] uppercase block">Criado em:</span>
                <span className="text-white text-[11px] block">{new Date(selectedToken.createdAt).toLocaleDateString('pt-BR')}</span>
                {isOnChain && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
                    <ShieldCheckIcon className="w-3 h-3" /> contrato verificado
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <span className="text-gray-400 text-[10px] uppercase block">Rede Blockchain:</span>
                <span className="text-emerald-400 text-[11px] block flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {isOnChain ? BASE_SEPOLIA.name : 'Rede EVM (Ativa)'}
                </span>
              </div>
            </div>

            {/* Simulated Balance charts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-1">
                <span className="text-[10px] text-gray-400 uppercase tracking-tight block">Circulação</span>
                <span className="text-base sm:text-lg font-bold text-white font-mono">{selectedToken.supply.toLocaleString('pt-BR')}</span>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-1">
                <span className="text-[10px] text-gray-400 uppercase tracking-tight block">Holders</span>
                <span className="text-base sm:text-lg font-bold text-white font-mono">{selectedToken.holderCount} carteiras</span>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-1">
                <span className="text-[10px] text-gray-400 uppercase tracking-tight block">Carga Ecológica</span>
                <span className="text-base sm:text-lg font-bold text-emerald-400 font-mono">{(selectedToken.supply * 0.05).toFixed(1)} tCO2</span>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-1">
                <span className="text-[10px] text-gray-400 uppercase tracking-tight block">Valor de Referência</span>
                <span className="text-base sm:text-lg font-bold text-cyan-400 font-mono">~ 1.12 USDC / t</span>
              </div>
            </div>

            {/* Interactive Actions CTAs */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-white/5">
              
              {showMint && (
                <button
                  id="mint-action-trigger-btn"
                  onClick={() => setMintOpen(true)}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-amazon-green to-amazon-light px-5 py-2.5 rounded-xl font-bold text-xs font-mono uppercase transition-all cursor-pointer"
                >
                  <Coins className="w-4 h-4 text-amazon-neon" />
                  Mint Suplementar (Gerar Tokens)
                </button>
              )}

              <button
                id="explorer-modal-btn"
                onClick={() => setExplorerOpen(true)}
                className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 hover:text-amazon-neon px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                Ver no Explorer (EVM)
              </button>

              {/* Passo 2 — Crie sua pool (só para tokens reais on-chain sem pool) */}
              {canCreatePool && (
                <button
                  id="create-pool-btn"
                  onClick={() => setPoolOpen(true)}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-amazon-neon text-petroleum-dark px-5 py-2.5 rounded-xl font-extrabold text-xs font-mono uppercase transition-all hover:shadow-[0_0_24px_rgba(56,189,108,0.45)] cursor-pointer"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  Crie sua pool · ganhe passivo
                </button>
              )}
              {selectedToken.poolLockId && (
                <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2.5 rounded-xl text-xs font-semibold font-mono">
                  <Lock className="w-4 h-4" />
                  Pool ativa · lock #{selectedToken.poolLockId} · keeper Mazari
                </span>
              )}
              {/* Token de demonstração (sem deploy real) → explica por que não há pool */}
              {IS_TESTNET && !selectedToken.onChainChainId && !selectedToken.poolLockId && (
                <span
                  title="A pool é criada para tokens reais que você lança on-chain. Este é um token de exemplo."
                  className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 text-gray-500 px-4 py-2.5 rounded-xl text-xs font-mono cursor-help"
                >
                  <Info className="w-4 h-4" />
                  Crie um token real para liberar a pool
                </span>
              )}

            </div>

          </div>

          {/* Graphical Analytics card with simple pure CSS bars representation */}
          <div className="bg-petroleum-card border border-white/5 rounded-3xl p-6 sm:p-8 space-y-5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amazon-neon" />
                <h3 className="font-display font-extrabold text-base">Impacto & Volume Comercial (Últimos 4 Períodos)</h3>
              </div>
              <span className="text-[11px] font-mono text-gray-400 uppercase bg-white/5 px-2 py-0.5 rounded">Ressurgência Mensal</span>
            </div>

            <div className="grid grid-cols-4 gap-4 h-[180px] items-end pt-8 relative">
              
              {/* Ground guide lines */}
              <div className="absolute inset-0 border-b border-white/5 pointer-events-none" />
              <div className="absolute inset-0 top-1/2 border-b border-white/5 border-dashed pointer-events-none" />
              <div className="absolute inset-0 top-1/4 border-b border-white/5 border-dashed pointer-events-none" />

              {selectedToken.analytics.map((day, idx) => {
                const heightPercentage = Math.min(100, Math.max(20, (day.volume / 6000) * 100));
                return (
                  <div key={idx} className="flex flex-col items-center gap-3 relative h-full justify-end group cursor-pointer z-10">
                    
                    {/* Tooltip on hover */}
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 bg-amazon-forest text-white border border-amazon-light px-2.5 py-1.5 rounded-lg text-[10px] text-center font-mono pointer-events-none transition-all duration-200 shadow-xl min-w-[100px]">
                      <div>Vol: {day.volume} USDC</div>
                      <div className="text-emerald-300">Preço: {day.price.toFixed(2)} USDC</div>
                    </div>

                    <div 
                      className="w-12 sm:w-16 bg-gradient-to-t from-amazon-forest via-amazon-green to-amazon-neon rounded-t-xl group-hover:brightness-125 transition-all"
                      style={{ height: `${heightPercentage}%` }}
                    />
                    <div className="text-[10px] font-mono text-gray-400 uppercase">{day.date}</div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/5 text-xs text-gray-400">
              <div className="flex gap-2 items-center">
                <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Evolução média do preço de fomento: <strong className="text-white">+8.2% este trimestre</strong></span>
              </div>
              <div className="flex gap-2 items-center">
                <Percent className="w-4 h-4 text-amazon-neon shrink-0" />
                <span>Percentual de retenção de capital no território nativo: <strong className="text-white">82.5% garantido</strong></span>
              </div>
            </div>

          </div>

        </div>

        {/* Right column: Holder Distribution & Digital Documents */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Holder distribution module */}
          <div className="bg-petroleum-card border border-white/5 rounded-3xl p-6 space-y-5">
            <h3 className="font-display font-bold text-sm text-white border-b border-white/5 pb-3 uppercase tracking-wider">
              {`${hasTokenomics ? 'Tokenomics · Alocação' : 'Distribuição de Holders'} ($${selectedToken.symbol})`}
            </h3>

            <div className="space-y-4">
              {simulatedHolders.map((holder, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs p-2.5 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all font-mono">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: holder.color }} />
                      <span className="text-[11px] font-semibold text-white truncate max-w-[125px] block">{holder.name}</span>
                    </div>
                    {holder.wallet ? (
                      <a
                        href={`https://sepolia.basescan.org/address/${holder.wallet}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] text-amazon-neon hover:underline flex items-center gap-1 mt-0.5"
                        title={holder.wallet}
                      >
                        {holder.wallet.slice(0, 8)}…{holder.wallet.slice(-6)}
                        <ExternalLink className="w-2.5 h-2.5" />
                        {liveBalances[holder.wallet.toLowerCase()] !== undefined && (
                          <span className="text-gray-400">· {fmtTokens(liveBalances[holder.wallet.toLowerCase()])}</span>
                        )}
                      </a>
                    ) : (
                      <span className="text-[9px] text-gray-400 block mt-0.5">{holder.address}</span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-amazon-neon font-bold text-xs">{holder.percentage}</span>
                    <span className="text-[8px] bg-white/5 px-1.5 py-0.5 rounded text-gray-400 block mt-0.5 text-center uppercase">{holder.role}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-amazon-forest/10 rounded-xl border border-amazon-light/5 text-[10px] text-gray-350 flex gap-2">
              <Sparkles className="w-4 h-4 text-amazon-neon shrink-0 animate-pulse" />
              <span>
                Para distribuir os tokens aos seus parceiros/consumidores, copie o Link Público gerado ou compartilhe o endereço do contrato.
              </span>
            </div>
          </div>

          {/* Documents indexer */}
          <div className="bg-petroleum-card border border-white/5 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
                Documentos de Respaldo RWA
              </h3>
              <label
                title="Adicionar documento oficial"
                className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-amazon-neon hover:text-white cursor-pointer bg-amazon-neon/10 border border-amazon-neon/30 px-2.5 py-1 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar
                <input type="file" className="hidden" onChange={handleDocPicked} />
              </label>
            </div>

            {selectedToken.documents.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">
                Nenhum documento legal anexado a este token. Clique em "Acelerar" para contatar assessores regulatórios.
              </p>
            ) : (
              <div className="space-y-2.5">
                {selectedToken.documents.map((doc) => (
                  <div key={doc.id} className="p-3 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-amazon-light" />
                      <div>
                        <span className="font-semibold text-white truncate block max-w-[120px]">{doc.name}</span>
                        <span className="text-[9px] text-gray-400 block">{doc.type}</span>
                      </div>
                    </div>
                    <span className="text-[9px] text-emerald-400 font-mono font-bold">VINCULADO</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* MODAL 1: SOLANA ACCESSIBLE EXPLORER SIMULATION (SOLSCAN STYLE) */}
      {explorerOpen && (
        <div id="explorer-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-petroleum-dark/80 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-[#030912] border border-amazon-neon/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
            
            <div className="flex justify-between items-start border-b border-white/5 pb-4">
              <div>
                <span className="text-[10px] bg-amazon-light/10 text-amazon-neon px-2.5 py-1 rounded-full font-mono uppercase font-bold">Nortoken Block Observer</span>
                <h3 className="font-display font-extrabold text-lg text-white mt-1.5 flex items-center gap-1.5">
                  <BookmarkCheck className="w-5 h-5 text-amazon-neon" />
                  Registro de Bloco (EVM)
                </h3>
              </div>
              <button
                id="close-explorer-modal-btn"
                onClick={() => setExplorerOpen(false)}
                className="p-1 px-3 bg-white/5 hover:bg-white/10 rounded-lg text-xs"
              >
                Fechar [X]
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                <div>
                  <span className="text-gray-450 text-[10px]">SIGNATURE (ASSINATURA):</span>
                  <span className="text-emerald-400 block text-[11px] break-all select-all">5SigN{selectedToken.id.toUpperCase().substring(0,6)}7Y9kRp9sL2XwTnM</span>
                </div>
                <div>
                  <span className="text-gray-450 text-[10px]">BLOCK SLOT HEIGHT (SLOT):</span>
                  <span className="text-white block"># 28,495,124 (Confirmado)</span>
                </div>
                <div className="pt-2 sm:pt-0">
                  <span className="text-gray-450 text-[10px]">TIME TO FINALIZE (LATÊNCIA):</span>
                  <span className="text-white block">~2 s (EVM L2)</span>
                </div>
                <div className="pt-2 sm:pt-0">
                  <span className="text-gray-450 text-[10px]">GÁS SPENT (CUSTO DE GÁS):</span>
                  <span className="text-amazon-neon block">~0.002 USDC (gas EVM)</span>
                </div>
              </div>

              {/* Raw metadata indexer JSON */}
              <div className="space-y-1">
                <span className="text-gray-400 text-[10px] block">METADADOS JSON DE PROTOCOLO RWA (ON-CHAIN):</span>
                <pre className="bg-black/60 text-emerald-400/90 p-4 rounded-xl border border-white/5 overflow-x-auto text-[10px] leading-relaxed max-h-[140px]">
{`{
  "name": "${selectedToken.name}",
  "symbol": "${selectedToken.symbol.toUpperCase()}",
  "blockchain": "base",
  "decimals": 9,
  "category": "${selectedToken.category}",
  "location": "${location || 'Regiões Verdes, Amazônia'}",
  "registry": "Nortoken-RWA-v1",
  "impact_metrics": {
    "carbon_mitigation": "proven",
    "territorial_integrity": "verified"
  },
  "docs_digest_sha256": "8f3c7...a20"
}`}
                </pre>
              </div>

              <div className="bg-amazon-forest/20 p-3 rounded-lg border border-amazon-light/10 text-[10px] text-gray-300">
                Qualquer auditor internacional pode usar a assinatura acima em qualquer explorer EVM (Basescan/Polygonscan) para consultar a prova de proveniência de forma imutável e transparente.
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: SUPPLEMENTAL MINT */}
      {mintOpen && (
        <div id="mint-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-petroleum-dark/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#04111d] border border-amazon-light/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
            
            <div className="flex justify-between items-start border-b border-white/5 pb-3">
              <h3 className="font-display font-medium text-white flex items-center gap-1.5">
                <Coins className="w-5 h-5 text-amazon-neon" />
                Dmint Suplementar
              </h3>
              <button
                id="close-mint-modal"
                onClick={() => setMintOpen(false)}
                className="bg-white/5 hover:bg-white/10 p-1 px-3 rounded-lg text-xs"
              >
                [X]
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <p className="text-gray-300">
                Você é o detentor da chave de mint de <strong>{selectedToken.name}</strong>. Insira a quantidade complementar para ser gerada de forma instantânea diretamente em sua carteira do Simulador.
              </p>

              <div className="space-y-1.5 pt-2">
                <label className="text-gray-400 select-all font-mono">Quantidade Suplementar:</label>
                <input
                  id="mint-amount-input"
                  type="number"
                  value={extraMintAmount}
                  onChange={(e) => setExtraMintAmount(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border glass-input font-mono"
                />
              </div>

              <div className="bg-amazon-forest/15 p-3 rounded-xl border border-amazon-light/5 text-[10px] text-emerald-300 flex gap-2">
                <Info className="w-4 h-4 text-amazon-neon shrink-0" />
                <span>
                  O custo por emitir suplementar é somente a taxa de gás da rede (~0.01 USDC), pois você já realizou o deploy do contrato principal anteriormente.
                </span>
              </div>

              <button
                id="btn-confirm-mint-suplementar"
                onClick={handleMintAction}
                className="w-full py-3 bg-gradient-to-r from-amazon-green to-amazon-light text-white font-extrabold rounded-xl text-center cursor-pointer"
              >
                Gerar & Finalizar Mint on-chain
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 3: CRIE SUA POOL (passo 2 — taxa do cliente + lock maleável) */}
      {poolOpen && selectedToken.config && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-petroleum-dark/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#04111d] border border-cyan-400/30 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex justify-between items-start border-b border-white/5 pb-3">
              <h3 className="font-display font-bold text-white flex items-center gap-1.5">
                <ArrowRightLeft className="w-5 h-5 text-cyan-400" />
                Crie sua pool — {selectedToken.symbol}
              </h3>
              <button onClick={() => setPoolOpen(false)} className="bg-white/5 hover:bg-white/10 p-1 px-3 rounded-lg text-xs">[X]</button>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Você semeia a liquidez inicial do par <strong>{selectedToken.symbol}/ETH</strong>. A liquidez fica
              <strong className="text-cyan-300"> travada</strong> (anti-rug) e a Mazari otimiza o range —
              você ganha um <strong className="text-amazon-neon">passivo</strong> acompanhável aqui. Cada swap paga
              sua taxa de projeto direto pro seu tesouro.
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <label className="space-y-1">
                <span className="text-gray-400 text-[10px] uppercase block">{selectedToken.symbol} na liquidez</span>
                <input
                  type="number"
                  value={seedTokens}
                  onChange={e => setSeedTokens(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border glass-input font-mono"
                />
              </label>
              <label className="space-y-1">
                <span className="text-gray-400 text-[10px] uppercase block">ETH no par</span>
                <input
                  type="number"
                  step="0.001"
                  value={seedEth}
                  onChange={e => setSeedEth(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border glass-input font-mono"
                />
              </label>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
              <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                <span className="text-gray-400 block">Sua taxa</span>
                <span className="text-amazon-neon font-bold">{(selectedToken.config.taxes.clientTaxBps / 100).toFixed(2)}%</span>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                <span className="text-gray-400 block">Lock</span>
                <span className={`font-bold ${selectedToken.config.trustSeal.autoLiquidityLock ? 'text-white' : 'text-gray-500'}`}>
                  {selectedToken.config.trustSeal.autoLiquidityLock ? `${selectedToken.config.trustSeal.liquidityLockDays}d` : 'Não travada'}
                </span>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                <span className="text-gray-400 block">Keeper</span>
                <span className={`font-bold ${selectedToken.config.trustSeal.autoLiquidityLock ? 'text-cyan-300' : 'text-gray-500'}`}>
                  {selectedToken.config.trustSeal.autoLiquidityLock ? 'Mazari' : '—'}
                </span>
              </div>
            </div>

            {selectedToken.config.taxes.clientTaxBps > 0 && (
              <div className="bg-amazon-forest/15 p-2.5 rounded-xl border border-amazon-light/10 text-[10px] text-emerald-300 flex gap-2">
                <Info className="w-4 h-4 text-amazon-neon shrink-0" />
                <span>Sua taxa cai em: <span className="break-all select-all">{selectedToken.config.taxes.clientTreasury}</span> (precisa receber ETH).</span>
              </div>
            )}

            {poolError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-[10px] p-2.5 rounded-xl break-all">{poolError}</div>
            )}

            <p className="text-[10px] text-gray-500">
              São algumas assinaturas: isentar o cofre, aprovar e criar a pool{selectedToken.config.trustSeal.renounceOwnership ? ' (+ renunciar a posse no fim)' : ''}.
            </p>

            <button
              disabled={poolBusy}
              onClick={handleCreatePool}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-amazon-neon text-petroleum-dark font-extrabold rounded-xl text-center cursor-pointer disabled:opacity-50"
            >
              {poolBusy ? 'Criando pool on-chain…' : 'Criar pool & travar liquidez'}
            </button>
            <p className="text-[9px] text-gray-600 text-center font-mono">{BASE_SEPOLIA.name} · keeper = Mazari Fi</p>
          </div>
        </div>
      )}

    </div>
  );
}
