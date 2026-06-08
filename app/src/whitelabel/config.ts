/**
 * Configuração DEMO do whitelabel (padrão Nortoken).
 * Quando o cliente comprar e configurar seu próprio whitelabel, este objeto
 * vem do banco populado com as escolhas dele (logo, paleta, features ativas, conteúdo).
 */

import type { WhitelabelConfig, TokenomicsItem } from './types';
import type { Token } from '../types';

export const NORTOKEN_THEME = {
  primary: '#12ff80',        // neon green (vibe Aizon)
  primarySoft: '#5bffab',    // neon green claro
  secondary: '#032e15',      // verde profundo
  background: '#050806',     // quase-preto (leve tom verde)
  card: '#0a130d',           // card verde-escuro
  deep: '#020403',           // mais profundo
  foreground: '#e9fff4',
  accent: '#12ff80',
  fontHeading: '"Chakra Petch", sans-serif',
  fontBody: '"Onest", system-ui, sans-serif',
};

export const DEMO_WHITELABEL_CONFIG: WhitelabelConfig = {
  projectName: 'Nortoken Demo',
  tokenSymbol: 'NORTKN',
  tagline: 'A nova era da tokenização amazônica',
  description: 'Swap, stake, NFTs e a próxima geração de DeFi com identidade da Amazônia. Sua plataforma whitelabel ao vivo.',
  heroFallbackImage: 'https://images.unsplash.com/photo-1641140313922-bd58c0560a76?q=80&w=1080&auto=format&fit=crop',
  theme: NORTOKEN_THEME,

  features: {
    home: true,
    whitepaper: true,
    swap: true,
    stake: true,
    referral: true,
    tokenization: true,
    buy: true,
    roadmap: true,
    lending: true,  // exibe como "coming soon" mas no menu
    leaderboard: true,
    tokenomics: true,
  },

  presale: {
    raisedUsd: 412_000,
    goalUsd: 750_000,
    priceUsd: 0.042,
    nextPriceUsd: 0.05,
    endsAt: '2026-07-20T00:00:00Z',
  },

  tokenomics: [
    { label: 'Pré-venda Pública',      percent: 40, color: '#10b981' },
    { label: 'Liquidez DEX',           percent: 20, color: '#34d399' },
    { label: 'Stake & Rewards',        percent: 15, color: '#22d3ee' },
    { label: 'Tesouraria & Devs',      percent: 12, color: '#a78bfa' },
    { label: 'Marketing & Parcerias',  percent: 8,  color: '#fb923c' },
    { label: 'Reserva Comunitária',    percent: 5,  color: '#fb7185' },
  ],

  stakePools: [
    { id: 'p30',  duration: '30 dias',  apr: 18, minStake: 100,   totalStaked: 1_240_000, myStaked: 0, myReward: 0 },
    { id: 'p90',  duration: '90 dias',  apr: 36, minStake: 500,   totalStaked: 3_580_000, myStaked: 2500, myReward: 92 },
    { id: 'p180', duration: '180 dias', apr: 64, minStake: 1000,  totalStaked: 7_120_000, myStaked: 0, myReward: 0 },
    { id: 'p365', duration: '365 dias', apr: 120, minStake: 5000, totalStaked: 9_840_000, myStaked: 0, myReward: 0 },
  ],

  nftCollection: [
    { id: 'nft-1', name: 'Curupira Guardian',  image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=512&auto=format&fit=crop', priceUsd: 250,  totalSupply: 100, minted: 73,  rarity: 'legendary' },
    { id: 'nft-2', name: 'Boto Cor-de-Rosa',   image: 'https://images.unsplash.com/photo-1591382386627-349b692688ff?q=80&w=512&auto=format&fit=crop', priceUsd: 120,  totalSupply: 500, minted: 412, rarity: 'epic' },
    { id: 'nft-3', name: 'Açaí Spirit',        image: 'https://images.unsplash.com/photo-1638176067000-9e7c5f8d5e89?q=80&w=512&auto=format&fit=crop', priceUsd: 60,   totalSupply: 2000, minted: 1547, rarity: 'rare' },
    { id: 'nft-4', name: 'Caboclo do Vento',   image: 'https://images.unsplash.com/photo-1635322966219-b75ed372eb01?q=80&w=512&auto=format&fit=crop', priceUsd: 25,   totalSupply: 10000, minted: 6890, rarity: 'common' },
  ],

  referralTiers: [
    { level: 1, commission: 10, description: 'Comissão direta de indicados diretos' },
    { level: 2, commission: 5,  description: 'Comissão de quem seus indicados trouxeram' },
    { level: 3, commission: 2,  description: 'Terceiro nível da rede de indicações' },
  ],

  roadmap: [
    { id: 'r1', phase: 'Fase 01 · Q1 2026', title: 'Fundação', status: 'done', items: ['Whitepaper publicado', 'Deploy do contrato em Base (EVM)', 'Auditoria Certik aprovada'] },
    { id: 'r2', phase: 'Fase 02 · Q2 2026', title: 'Lançamento Público', status: 'done', items: ['Abertura de pré-venda dos NFTs', 'Pagamentos em USDC on-chain', 'AMA com a comunidade'] },
    { id: 'r3', phase: 'Fase 03 · Q3 2026', title: 'DEX & Liquidez', status: 'running', items: ['Listagem em DEX', 'Bot de liquidez 24/7 ativo', 'Pool de stake disponível'] },
    { id: 'r4', phase: 'Fase 04 · Q4 2026', title: 'Expansão', status: 'pending', items: ['Listagem CoinGecko e CMC', 'Campanha com 33 YouTubers', 'Parcerias internacionais'] },
    { id: 'r5', phase: 'Fase 05 · Q1 2027', title: 'Lending', status: 'pending', items: ['Plataforma de empréstimos descentralizada', 'Colaterização cross-chain', 'Yield aggregator'] },
  ],

  whitepaperSections: [
    { id: 'intro',     title: '1. Introdução',         content: 'Em um mundo onde 70% da Amazônia ainda permanece intocada, a maior fronteira da economia digital não está em silicon valley — está aqui. O Nortoken nasce como infraestrutura para que cooperativas, produtores, projetos sociais e ativos da bioeconomia possam tokenizar com segurança institucional e custo ultra-baixo.' },
    { id: 'problem',   title: '2. O Problema',         content: 'A tokenização hoje exige times técnicos, auditoria cara, marketing global e liquidez inicial. O custo de entrada elimina 99% dos projetos amazônicos. Resultado: a maior bacia de ativos reais do planeta fica fora da economia tokenizada.' },
    { id: 'solution',  title: '3. A Solução',          content: 'Nortoken oferece uma rampa de lançamento end-to-end. Em modo básico, o cliente faz deploy do token e tem dashboard de portfólio gratuito. Em modo premium (whitelabel), ele tem um app dedicado com swap, stake, NFTs, referral e roadmap — totalmente customizável com a marca dele.' },
    { id: 'tokenomics', title: '4. Tokenomics',        content: 'Distribuição inicial: 40% pré-venda, 20% liquidez, 15% stake rewards, 12% tesouraria, 8% marketing, 5% reserva. Supply total fixo (sem mint pós-deploy). Mecanismo de burn trimestral baseado em volume de swap.' },
    { id: 'roadmap',   title: '5. Roadmap',            content: 'Q1: Fundação e auditoria. Q2: Pré-venda e AMA. Q3: DEX e stake. Q4: Listagens e expansão. 2027: Plataforma de lending integrada.' },
    { id: 'team',      title: '6. Equipe & Parceiros', content: 'MAZARI CORP como infraestrutura técnica. Parceiros: OpenZeppelin (contratos), Certik (auditoria), DexScreener (data), Privy (auth Web3), Base/Polygon (redes EVM).' },
  ],

  socials: [
    { name: 'Twitter',  url: 'https://twitter.com/nortoken' },
    { name: 'Telegram', url: 'https://t.me/nortoken' },
    { name: 'Discord',  url: 'https://discord.gg/nortoken' },
    { name: 'GitHub',   url: 'https://github.com/nortoken' },
  ],

  contractAddress: '0x7a3c9f4e1b2d8a6c5e0f9b7d2a4c6e8f0a1b3c5d',
  totalSupply: 100_000_000,
  network: 'Base',
};

/**
 * Mapeia o tokenomics definido na criação do token → tokenomics do whitelabel.
 * Mesmo shape (label/percent/color). Cai no demo se o token não tiver alocação.
 * TODO: ligar no checkout de compra do whitelabel (gerar WhitelabelConfig a partir do Token criado).
 */
export function tokenomicsFromToken(token: Token): TokenomicsItem[] {
  if (token.tokenomics && token.tokenomics.length > 0) {
    return token.tokenomics.map((t) => ({
      label: t.label,
      percent: t.percent,
      color: t.color,
      wallet: t.wallet,
      toPool: t.toPool,
    }));
  }
  return DEMO_WHITELABEL_CONFIG.tokenomics;
}
