/**
 * Tipos da plataforma Whitelabel do Nortoken.
 * O `WhitelabelConfig` é o que cada cliente configura — logo, paleta,
 * features habilitadas, conteúdo de cada página.
 */

export type WhitelabelFeatureKey =
  | 'home'
  | 'whitepaper'
  | 'swap'
  | 'stake'
  | 'referral'
  | 'tokenization'
  | 'buy'
  | 'roadmap'
  | 'lending'
  | 'leaderboard'
  | 'tokenomics';

export interface WhitelabelTheme {
  primary: string;        // ex: '#10b981'  (amazon-neon)
  primarySoft: string;    // ex: '#34d399'  (amazon-light)
  secondary: string;      // ex: '#065f46'  (amazon-green)
  background: string;     // ex: '#050e18'  (petroleum-dark)
  card: string;           // ex: '#0a1d2e'  (petroleum-card)
  deep: string;           // ex: '#040912'  (petroleum-deep)
  foreground: string;     // texto principal
  accent: string;         // accent para hovers
  fontHeading: string;    // ex: 'Space Grotesk, sans-serif'
  fontBody: string;       // ex: 'Inter, sans-serif'
}

export interface TokenomicsItem {
  label: string;
  percent: number;
  color: string;
  /** Carteira de destino (verificação pública da distribuição). */
  wallet?: string;
  /** Fatia que foi pro pool de liquidez (não é carteira). */
  toPool?: boolean;
}

export interface RoadmapPhase {
  id: string;
  phase: string;       // 'Fase 01 — Q1 2026'
  title: string;
  status: 'done' | 'running' | 'pending';
  items: string[];
}

export interface StakePool {
  id: string;
  duration: string;     // '30 dias'
  apr: number;          // 28
  minStake: number;
  totalStaked: number;
  myStaked?: number;
  myReward?: number;
}

export interface NFTCollectionItem {
  id: string;
  name: string;
  image: string;
  priceUsd: number;
  totalSupply: number;
  minted: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface ReferralTier {
  level: number;
  commission: number;   // % comissão
  description: string;
}

export interface PresaleInfo {
  raisedUsd: number;    // já arrecadado
  goalUsd: number;      // meta da rodada
  priceUsd: number;     // preço atual do token
  nextPriceUsd: number; // preço da próxima rodada (cria urgência)
  endsAt: string;       // ISO — fim da rodada (contador regressivo)
}

export interface WhitelabelConfig {
  projectName: string;        // 'Nortoken'
  tokenSymbol: string;        // 'NORTKN'
  tagline: string;            // 'A evolução chegou'
  description: string;
  logoUrl?: string;
  heroVideoUrl?: string;
  heroFallbackImage: string;
  theme: WhitelabelTheme;
  features: Record<WhitelabelFeatureKey, boolean>;

  // dados das páginas
  presale?: PresaleInfo;
  tokenomics: TokenomicsItem[];
  stakePools: StakePool[];
  nftCollection: NFTCollectionItem[];
  referralTiers: ReferralTier[];
  roadmap: RoadmapPhase[];
  whitepaperSections: { id: string; title: string; content: string }[];
  socials: { name: string; url: string }[];
  contractAddress: string;
  totalSupply: number;
  network: 'Base' | 'Polygon' | 'BSC' | 'Ethereum';
}
