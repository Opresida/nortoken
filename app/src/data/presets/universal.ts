/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SegmentPreset } from '../../types';

/**
 * Preset UNIVERSAL — o launchpad para o mercado como um todo.
 * Categorias amplas; a vertente de impacto/bioeconomia é apenas UMA delas.
 */
export const UNIVERSAL_PRESET: SegmentPreset = {
  id: 'universal',
  name: 'Universal',
  badge: 'MULTI-MERCADO',
  headerTitle: 'Rampa de Lançamento de Tokens',
  headerSubtitle:
    'Crie, configure e lance seu token com proteções de nível institucional — contra sniper, MEV e honeypot — em poucos minutos.',
  step1Title: 'Selecione o segmento do seu token',
  step1Hint:
    'A Nortoken otimiza os metadados, a tokenômica sugerida e as proteções de contrato para cada classe de ativo.',
  namePlaceholder: 'Ex: Helix Protocol ou Lunar Doge',
  symbolPlaceholder: 'Ex: HLX',
  descriptionPlaceholder: 'Descreva brevemente o propósito do seu token e sua comunidade...',
  categories: [
    {
      id: 'utility',
      label: 'Utility / DeFi',
      desc: 'Token de utilidade para protocolos, dApps, governança ou acesso a serviços on-chain.',
      icon: '⚙️',
      defaultSupply: 100_000_000,
      supplyRationale:
        'Supply amplo (100M) típico de tokens de utilidade para garantir liquidez e granularidade de uso.',
    },
    {
      id: 'meme',
      label: 'Memecoin / Cultura',
      desc: 'Moeda comunitária, cultural ou viral com foco em engajamento e tração social.',
      icon: '🐶',
      defaultSupply: 1_000_000_000,
      supplyRationale:
        'Supply de escala meme (1B) para preços unitários baixos e forte apelo de comunidade.',
    },
    {
      id: 'rwa',
      label: 'RWA / Ativos Reais',
      desc: 'Tokenização de ativos do mundo real: imóveis, recebíveis, commodities, direitos.',
      icon: '🏛️',
      defaultSupply: 1_000_000,
      supplyRationale:
        'Supply enxuto (1M) ligado ao lastro físico — cada token representa uma fração do ativo real.',
    },
    {
      id: 'community',
      label: 'Comunidade / Social',
      desc: 'Token de clube, creator, DAO ou programa de fidelidade com recompensas a holders.',
      icon: '🤝',
      defaultSupply: 10_000_000,
      supplyRationale:
        'Supply moderado (10M) para distribuir entre membros sem inflacionar nem concentrar.',
    },
    {
      id: 'gaming',
      label: 'Gaming / Web3',
      desc: 'Moeda de economia de jogo, recompensas play-to-earn ou ativos de metaverso.',
      icon: '🎮',
      defaultSupply: 500_000_000,
      supplyRationale:
        'Supply alto (500M) para suportar micro-transações intensas dentro da economia do jogo.',
    },
    {
      id: 'impact',
      label: 'Impacto / Bioeconomia',
      desc: 'Crédito de carbono, bioeconomia, projetos sociais e ativos verdes com lastro.',
      icon: '🌱',
      defaultSupply: 250_000,
      supplyRationale:
        'Supply baixo (250k) atrelado a impacto verificável — ex: 1 token = 1 tonelada de CO₂.',
    },
  ],
  copilotFields: [
    {
      key: 'useCase',
      label: 'Caso de Uso Principal',
      placeholder: 'Ex: governança do protocolo, recompensas da comunidade...',
      optional: true,
    },
    {
      key: 'targetAudience',
      label: 'Público / Mercado-Alvo',
      placeholder: 'Ex: traders DeFi, gamers, investidores de RWA...',
      optional: true,
    },
  ],
  copilotPersona:
    'Você é o Co-Pilot de Tokenização da Nortoken, um launchpad Web3 multi-mercado e premium. ' +
    'Sua função é transformar qualquer ideia de token (utility/DeFi, memecoin, RWA, comunidade, gaming ou impacto) ' +
    'em um ativo estruturado, seguro e competitivo em redes EVM (Base/Polygon). ' +
    'Pense em tokenômica sólida, distribuição saudável e proteções contra bots e MEV. Escreva em português elegante do Brasil.',
  docTypes: [
    {
      id: 'pitch',
      label: 'Pitch Deck / Whitepaper',
      hint: 'Documento que apresenta a visão, o produto e a tokenômica do projeto.',
    },
    {
      id: 'legal',
      label: 'Estrutura Legal / Tokenomics',
      hint: 'Contrato social, parecer jurídico ou planilha de distribuição (opcional).',
    },
  ],
};
