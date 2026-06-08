/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EnterpriseStage, PremiumService, Token } from '../types';

export const BR_REGIONAL_CATEGORIES = [
  { id: 'all', name: 'Todos os Ativos' },
  { id: 'bioeconomia', name: 'Bioeconomia (Óleos, Cacau, Açaí)' },
  { id: 'carbono', name: 'Créditos de Carbono Amazônico' },
  { id: 'madeira', name: 'Manejo Sustentável & Madeira Legal' },
  { id: 'cooperativa', name: 'Cooperativas & Produtores Locais' },
  { id: 'rwa', name: 'RWA (Ativos Reais / Imóveis Verdes)' },
  { id: 'meme', name: 'Meme Tokens Regionais' },
  { id: 'comunidade', name: 'Projetos Sociais & Culturais' }
];

// ─── Pacote Lançamento Enterprise ───
// 5 etapas sequenciais com pagamento por marco. Valores totais ~54.040 USDC.
// Negociáveis via consultoria especializada com a MAZARI CORP.
export const ENTERPRISE_LAUNCH_PACKAGE: EnterpriseStage[] = [
  {
    id: 'stage-1-whitelabel',
    number: 1,
    title: 'Plataforma Whitelabel & Contratos',
    subtitle: 'App customizado + contratos sob medida',
    description: 'App próprio do projeto em domínio personalizado, com sidebar, swap, stake, referral, roadmap, whitepaper e mais — totalmente customizável. O deploy do token e a visualização básica de portfólio já são funções core gratuitas da Nortoken.',
    totalUsd: 6300,
    iconName: 'Code2',
    accent: 'cyan',
    items: [
      { label: 'Plataforma Whitelabel completa', priceUsd: 3500, detail: 'Cliente escolhe funções: swap, stake, referral, buy NFT, roadmap, whitepaper, lending' },
      { label: 'Site institucional / landing page', priceUsd: 700, detail: 'Página de apresentação dedicada' },
      { label: 'Contratos de NFTs custom', priceUsd: 700 },
      { label: 'Contrato de stake', priceUsd: 1400, detail: 'Recompensas configuráveis' },
    ],
  },
  {
    id: 'stage-2-cert',
    number: 2,
    title: 'Certificação',
    subtitle: 'Auditoria de segurança',
    description: 'Auditoria externa pela Certik — selo de confiança internacional indispensável para listagem em corretoras sérias.',
    totalUsd: 4200,
    iconName: 'ShieldCheck',
    accent: 'amber',
    items: [
      { label: 'Auditoria Certik', priceUsd: 4200, detail: 'Relatório público de segurança' },
    ],
  },
  {
    id: 'stage-3-nfts',
    number: 3,
    title: 'Abertura de NFTs',
    subtitle: 'Vendas, mercado, comunidade',
    description: 'Operação de venda dos NFTs do projeto, integração com marketplaces e ativação da comunidade via AMA.',
    totalUsd: 1540,
    iconName: 'Image',
    accent: 'emerald',
    items: [
      { label: 'Apoio operacional · checklist de venda dos NFTs', priceUsd: 700 },
      { label: 'Listagem em marketplace de NFT', priceUsd: 280 },
      { label: 'AMA (organização e execução)', priceUsd: 560 },
    ],
  },
  {
    id: 'stage-4-dex',
    number: 4,
    title: 'DEX & Pré-venda',
    subtitle: 'Liquidez inicial + bot 24/7',
    description: 'Lançamento na DEX com liquidez inicial robusta e bot de market making operando 24/7 nos primeiros dias críticos.',
    totalUsd: 25200,
    iconName: 'TrendingUp',
    accent: 'purple',
    items: [
      { label: 'Bot de liquidez 24/7', priceUsd: 4200, detail: 'Configuração + manutenção inicial' },
      { label: 'Liquidez indicada', priceUsd: 21000, detail: 'Capital inicial no pool' },
    ],
  },
  {
    id: 'stage-5-marketing',
    number: 5,
    title: 'Marketing & Listagens',
    subtitle: 'Tração, autoridade, descoberta',
    description: 'Campanha de divulgação coordenada para gerar tração inicial — YouTubers, blogs, listagens em agregadores de dados cripto.',
    totalUsd: 16100,
    iconName: 'Megaphone',
    accent: 'rose',
    items: [
      { label: 'Pack 33 YouTubers', priceUsd: 3500, detail: 'Campanha de divulgação coordenada' },
      { label: 'Marketing + autoridade', priceUsd: 5600, detail: 'Blogs / páginas influentes' },
      { label: 'Marketing extra', priceUsd: 4200, detail: 'Campanhas complementares' },
      { label: 'Listagem CoinGecko + metadados', priceUsd: 2800 },
    ],
  },
];

export const ENTERPRISE_TOTAL_USD = ENTERPRISE_LAUNCH_PACKAGE.reduce(
  (sum, stage) => sum + stage.totalUsd,
  0
);

export const PREMIUM_SERVICES: PremiumService[] = [
  {
    id: 'tokenomics_coaching',
    title: 'Estratégia e Tokenomics',
    priceUsd: 250,
    description: 'Mentoria com especialistas de Web3 para definir curvas de emissão, governança, estratégias de liquidez e sustentabilidade econômica do token.',
    category: 'assessoria',
    iconName: 'Compass'
  },
  {
    id: 'brand_landing_page',
    title: 'Branding e Landing Page',
    priceUsd: 350,
    description: 'Design e desenvolvimento de uma Landing Page ultra-rápida no subdomínio da Nortoken para divulgar o seu ativo digital, com integração de buy-button.',
    category: 'branding',
    iconName: 'LayoutTemplate'
  },
  {
    id: 'community_setup',
    title: 'Criação de Comunidade & Bots',
    priceUsd: 250,
    description: 'Configuração profissional de servidores Discord, canais Telegram e automação de alertas de transações on-chain de sua comunidade.',
    category: 'branding',
    iconName: 'Users'
  },
  {
    id: 'whitepaper_draft',
    title: 'Redação de Whitepaper Profissional',
    priceUsd: 200,
    description: 'Transformação do escopo do seu projeto em um Whitepaper limpo, objetivo, bilíngue (Português/Inglês) para atração de grants internacionais.',
    category: 'legal',
    iconName: 'FileText'
  },
  {
    id: 'volume_bot',
    title: 'Bot de Volume de Trade',
    priceUsd: 300,
    description: 'Bot que gera volume de negociação real e saudável na pool do seu token — dá vida ao gráfico, melhora a descoberta e atrai investidores.',
    category: 'tech',
    iconName: 'TrendingUp'
  },
  {
    id: 'holders_bot',
    title: 'Bot Wallet Holders',
    priceUsd: 200,
    description: 'Distribui seu token em múltiplas carteiras reais, elevando o número de holders e a descentralização aparente do projeto.',
    category: 'tech',
    iconName: 'Wallet'
  },
  {
    id: 'rwa_audit',
    title: 'Auditoria e Verificação Física',
    priceUsd: 0,
    description: 'Parceiros locais realizam a checagem física da terra, mata, ou estoque físico e emitem um selo "Norte-Verify" auditável on-chain.',
    category: 'legal',
    iconName: 'ShieldCheck',
    comingSoon: true
  },
  {
    id: 'legal_structure',
    title: 'Estrutura Jurídica RWA',
    priceUsd: 0,
    description: 'Assessoria jurídica para estruturação de ativos físicos (RWA) na blockchain, incluindo atas, termos de garantia e conformidade regulatória brasileira.',
    category: 'legal',
    iconName: 'Scale',
    comingSoon: true
  }
];

export const INITIAL_TOKENS: Token[] = [
  {
    id: 'jari-carbon',
    name: 'Jari Carbon Units',
    symbol: 'JCARB',
    supply: 500000,
    description: 'Tokens lastreados em créditos de carbono auditados no Vale do Jari, divisa do Pará e Amapá. Focado na conservação da biodiversidade e retenção do desmatamento ilegal.',
    image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=256&auto=format&fit=crop',
    category: 'carbono',
    status: 'completed',
    contractAddress: '7XqJc9X4N7y1Xg9R7Xk2N8y6R4g7Nz8Y9xW1mHnT6bK',
    documents: [
      { id: 'jari-carbon-car', name: 'CAR_VALE_DO_JARI_9242.pdf', type: 'CAR (Cadastro Ambiental Rural)', uploadedAt: '2026-05-18T09:00:00Z', fileSize: '4.8 MB' },
      { id: 'jari-carbon-audit', name: 'LAUDO_INDEPENDENTE_REFI_VALE.pdf', type: 'Laudo de Auditoria Física', uploadedAt: '2026-04-18T09:15:00Z', fileSize: '12.4 MB' }
    ],
    deployCostUsd: 12.5,
    holderCount: 142,
    createdAt: '2026-05-18T10:00:00Z',
    creatorWallet: 'HN7cE25Az7...TkLp',
    verified: true,
    trustScore: 92,
    premiumServices: ['rwa_audit', 'legal_structure'],
    analytics: [
      { date: '18 Mai', volume: 1200, price: 1.0, holders: 100 },
      { date: '19 Mai', volume: 2400, price: 1.05, holders: 120 },
      { date: '20 Mai', volume: 1800, price: 1.12, holders: 135 },
      { date: '21 Mai', volume: 4500, price: 1.15, holders: 142 }
    ]
  },
  {
    id: 'acai-tapajos',
    name: 'Açaí Orgânico do Tapajós',
    symbol: 'TAPACA',
    supply: 1000000,
    description: 'Utility token e rastreabilidade da produção artesanal da Cooperativa de Produtores de Açaí do Médio Tapajós. Permite compra antecipada da safra com 20% de desconto.',
    image: 'https://images.unsplash.com/photo-1511113556071-7071cd9d91f8?q=80&w=256&auto=format&fit=crop',
    category: 'bioeconomia',
    status: 'completed',
    contractAddress: 'B2Xp8N7uX7yK9R6G4hK3N2y9R5B7Xw8K9xW2mHnT5bL',
    documents: [
      { id: 'acai-tapajos-ata', name: 'ATA_SUBMISSAO_COOP_TAPAJOS.pdf', type: 'Ata da Cooperativa / Estatuto', uploadedAt: '2026-04-12T13:00:00Z', fileSize: '2.1 MB' }
    ],
    deployCostUsd: 9.9,
    holderCount: 89,
    createdAt: '2026-04-12T14:30:00Z',
    creatorWallet: 'Cp8NuX7yW...T2bL',
    verified: false,
    trustScore: 68,
    premiumServices: ['brand_landing_page'],
    analytics: [
      { date: '12 Abr', volume: 800, price: 0.5, holders: 30 },
      { date: '15 Abr', volume: 1500, price: 0.52, holders: 45 },
      { date: '01 Mai', volume: 3400, price: 0.58, holders: 72 },
      { date: '21 Mai', volume: 5900, price: 0.65, holders: 89 }
    ]
  },
  {
    id: 'castanha-amapa',
    name: 'Sementes de Ouro Laranjal',
    symbol: 'CASTAN',
    supply: 250000,
    description: 'Ativo real representando a cota de refino e distribuição de castanhas de alta qualidade coletadas por comunidades tradicionais em Laranjal do Jari, Amapá.',
    image: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?q=80&w=256&auto=format&fit=crop',
    category: 'cooperativa',
    status: 'completed',
    contractAddress: 'F8Hp9N9uX8yL8R5G3hM2N4y8R6C7Xv9K8xW1mHnT4bN',
    documents: [
      { id: 'castanha-amapa-cert', name: 'PROVA_ORIGEM_REVENDA_LARANJAL.pdf', type: 'Laudo de Origem Extrativista', uploadedAt: '2026-05-01T08:00:00Z', fileSize: '1.7 MB' }
    ],
    deployCostUsd: 14.2,
    holderCount: 64,
    createdAt: '2026-05-01T09:15:00Z',
    creatorWallet: 'Ap9NuW3yW...T4bN',
    verified: true,
    trustScore: 85,
    premiumServices: ['rwa_audit'],
    analytics: [
      { date: '01 Mai', volume: 500, price: 2.0, holders: 20 },
      { date: '08 Mai', volume: 1200, price: 2.1, holders: 42 },
      { date: '15 Mai', volume: 1800, price: 2.15, holders: 55 },
      { date: '21 Mai', volume: 2200, price: 2.25, holders: 64 }
    ]
  },
  {
    id: 'curupira-coin',
    name: 'Curupira Meme Regional',
    symbol: 'CURUPA',
    supply: 100000000,
    description: 'Meme token 100% focado no folclore amazônico e conscientização divertida sobre a proteção das matas. 10% de todas as taxas transacionais são enviadas a brigadas locais contra incêndio.',
    image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=256&auto=format&fit=crop',
    category: 'meme',
    status: 'completed',
    contractAddress: '9Xp2R7N8uX4yG3hL2k1N3y7R5B5Xw2K9xW5mHnT6bL',
    documents: [],
    deployCostUsd: 4.8,
    holderCount: 1420,
    createdAt: '2026-05-15T22:00:00Z',
    creatorWallet: 'Xp2NuW7yY...T6bL',
    verified: false,
    trustScore: 41,
    premiumServices: [],
    analytics: [
      { date: '15 Mai', volume: 25000, price: 0.0001, holders: 300 },
      { date: '17 Mai', volume: 84000, price: 0.00035, holders: 820 },
      { date: '19 Mai', volume: 132000, price: 0.00084, holders: 1100 },
      { date: '21 Mai', volume: 247000, price: 0.0012, holders: 1420 }
    ]
  }
];
