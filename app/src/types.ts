/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TokenDocument {
  id: string;
  name: string;
  type: string;
  url?: string;
  fileSize?: string;
  uploadedAt: string;
}

export interface TokenAnalyticsItem {
  date: string;
  volume: number;
  price: number;
  holders: number;
}

/** Item de alocação de supply (tokenomics) — mesmo shape do whitelabel. */
export interface TokenomicsItem {
  label: string;
  percent: number;
  color: string;
  /** Carteira de destino (só usada se a distribuição automática estiver ligada). */
  wallet?: string;
  /** Esta fatia vai pro POOL de liquidez (não é uma carteira comum). */
  toPool?: boolean;
}

/** Categoria do token — parametrizada por segmento (não mais um union fixo amazônico). */
export type CategoryId = string;

export interface Token {
  id: string;
  name: string;
  symbol: string;
  supply: number;
  description: string;
  image: string; // Base64 or URL placeholder
  category: CategoryId;
  status: 'pending_payment' | 'deploying' | 'completed' | 'failed';
  contractAddress?: string;
  documents: TokenDocument[];
  deployCostUsd: number;
  holderCount: number;
  createdAt: string;
  creatorWallet: string;
  analytics: TokenAnalyticsItem[];
  verified: boolean;
  premiumServices: string[]; // List of IDs of premium services purchased
  /** Configuração on-chain escolhida no criador (serializa direto para o deploy real na Fase 6). */
  config?: TokenConfig;
  /** Rede EVM de destino. */
  network?: EvmNetwork;
  /** Segmento de mercado sob o qual o token foi criado. */
  presetId?: string;
  /** Nortoken Trust Score (0–100) calculado a partir da config no deploy. */
  trustScore?: number;
  /** chainId on-chain real (definido só no deploy de verdade; ausente = mock). */
  onChainChainId?: number;
  /** lockId da pool criada (passo 2). Ausente = ainda sem pool. */
  poolLockId?: string;
  /** Alocação de supply definida na criação (passo Tokenomics). Off-chain. */
  tokenomics?: TokenomicsItem[];
}

// ─────────────────────────────────────────────────────────────
// Segment presets — tornam o launchpad agnóstico de mercado.
// Mesmo padrão do WhitelabelConfig: 1 codebase, N configurações.
// ─────────────────────────────────────────────────────────────

export interface CategoryDef {
  id: string;
  label: string;
  desc: string;
  icon: string; // emoji
  defaultSupply?: number;
  supplyRationale?: string;
}

/** Campo extra do formulário do criador, definido por segmento (ex: localização, caso de uso). */
export interface CopilotFieldDef {
  key: string;
  label: string;
  placeholder: string;
  optional?: boolean;
}

export interface SegmentPreset {
  id: string;
  name: string;
  badge: string;
  headerTitle: string;
  headerSubtitle: string;
  step1Title: string;
  step1Hint: string;
  namePlaceholder: string;
  symbolPlaceholder: string;
  descriptionPlaceholder: string;
  categories: CategoryDef[];
  /** Campos extras (além de name/symbol/supply/image) renderizados dinamicamente. */
  copilotFields: CopilotFieldDef[];
  /** Persona injetada no system prompt do Gemini (server-side). */
  copilotPersona: string;
  docTypes: { id: string; label: string; hint: string }[];
}

// ─────────────────────────────────────────────────────────────
// TokenConfig — as 4 alavancas que o cliente controla no criador.
// Desenhado para serializar direto em constructor args do contrato.
// ─────────────────────────────────────────────────────────────

export type EvmNetwork = 'base' | 'polygon' | 'ethereum' | 'bsc';

export interface SupplyConfig {
  initial: number;
  maxCap: number | null; // null = sem teto
  mintable: boolean; // owner pode mintar depois do deploy
  renounceMintAtLaunch: boolean; // renuncia o mint authority no lançamento
}

export interface ProtectionConfig {
  antiSnipeBlocks: number; // bloqueia bots nos N primeiros blocos (0 = off)
  tradeCooldownSec: number; // cooldown entre trades por carteira (0 = off)
  maxWalletPct: number | null; // % máx do supply por carteira (null = off)
  maxTxPct: number | null; // % máx do supply por transação (null = off)
}

export interface TrustSealConfig {
  autoLiquidityLock: boolean;
  liquidityLockDays: number;
  renounceOwnership: boolean;
  honeypotFreeAttest: boolean; // exige sellability garantida + sem blacklist
}

export interface TaxConfig {
  protocolFeeBps: number; // FIXO 20 = 0.2% Nortoken (imutável)
  clientTaxBps: number; // taxa do projeto do cliente
  clientTreasury: string;
}

/** Status de um material do projeto (site, whitepaper). */
export interface ProjectAssetStatus {
  has: boolean; // o cliente já possui
  url?: string; // link, se já existe
  viaNortoken: boolean; // será produzido pela Nortoken (entrega garantida)
}

export interface PresenceConfig {
  website: ProjectAssetStatus;
  whitepaper: ProjectAssetStatus;
}

export interface TokenConfig {
  supply: SupplyConfig;
  protections: ProtectionConfig;
  trustSeal: TrustSealConfig;
  taxes: TaxConfig;
  tokenomics?: TokenomicsItem[];
  /** Distribuir automaticamente o supply pras carteiras do tokenomics no lançamento (custa gás). */
  autoDistribute?: boolean;
  presence: PresenceConfig;
}

export interface PremiumService {
  id: string;
  title: string;
  priceUsd: number;
  description: string;
  category: 'assessoria' | 'branding' | 'tech' | 'legal';
  iconName: string;
  badge?: string;
  /** Serviço ainda não disponível — exibe "Em Breve" e não permite contratar. */
  comingSoon?: boolean;
}

/** Solicitação de serviço enviada pelo cliente (vai para o futuro dashboard ADMIN). */
export interface ServiceRequest {
  id: string;
  serviceId: string;
  serviceTitle: string;
  tokenId: string;
  tokenName: string;
  wallet: string;
  discord: string;
  whatsapp: string;
  createdAt: string;
}

export interface UserWallet {
  address: string;
  connected: boolean;
  /** Saldo em USDC (stablecoin) — único meio de pagamento da plataforma. */
  usdcBalance: number;
}

export interface Transaction {
  signature: string;
  type: 'deploy' | 'buy_premium' | 'mint' | 'transfer';
  tokenName?: string;
  tokenSymbol?: string;
  amountSol?: number;
  amountUsd?: number;
  timestamp: string;
  status: 'confirmed' | 'processing' | 'failed';
}

export interface SearchQuery {
  text: string;
  category: string;
}

// ─── Pacote Lançamento Enterprise (5 etapas) ───
export interface EnterpriseSubItem {
  label: string;
  priceUsd: number;
  detail?: string;
}

export interface EnterpriseStage {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  totalUsd: number;
  items: EnterpriseSubItem[];
  iconName: 'Code2' | 'ShieldCheck' | 'Image' | 'TrendingUp' | 'Megaphone';
  accent: 'cyan' | 'amber' | 'emerald' | 'purple' | 'rose';
}
