/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SegmentPreset } from '../../types';

/**
 * Preset AMAZÔNIA — vertical temático de bioeconomia (preserva a identidade original).
 * Ativável por whitelabel/campanha sem reescrever o produto.
 */
export const AMAZON_PRESET: SegmentPreset = {
  id: 'amazon',
  name: 'Bioeconomia Amazônica',
  badge: 'AMAZÔNIA ON-CHAIN',
  headerTitle: 'Rampa de Lançamento de Tokens',
  headerSubtitle:
    'Crie, customize e implante suas frações digitais de Crédito de Carbono, safras de Açaí/Cacau ou ativos de terra (RWA) com proteções de contrato de nível institucional.',
  step1Title: 'Selecione o tipo do seu ativo amazônico',
  step1Hint:
    'A Nortoken possui regras otimizadas de metadados e proteções focadas em cada classe de ativo verde ou regional.',
  namePlaceholder: 'Ex: Cacau Orgânico de Altamira ou Vale do Jari Carbono',
  symbolPlaceholder: 'Ex: CACAU',
  descriptionPlaceholder: 'Fale brevemente do seu ativo amazônico...',
  categories: [
    {
      id: 'bioeconomia',
      label: 'Bioeconomia Sustentável',
      desc: 'Açaí, cacau nativo, óleos medicinais, produtos agrícolas de cooperativas sem desmatamento.',
      icon: '🍇',
      defaultSupply: 1_000_000,
      supplyRationale: 'Supply ligado à produção física regional anual estimada por saca/hectare.',
    },
    {
      id: 'carbono',
      label: 'Créditos de Carbono',
      desc: 'Preservação de territórios de selva fechada, compensação voluntária e retenção certificada de CO2.',
      icon: '🌳',
      defaultSupply: 250_000,
      supplyRationale: 'Cada token equivale a 1 tonelada de CO₂ evitado por preservação georreferenciada.',
    },
    {
      id: 'madeira',
      label: 'Manejo Florestal Legal',
      desc: 'Rastreabilidade de cadeias produtivas de madeira legal seladas por georreferenciamento on-chain.',
      icon: '🪵',
      defaultSupply: 500_000,
    },
    {
      id: 'cooperativa',
      label: 'Cooperativas Produtoras',
      desc: 'Associações de extrativistas tradicionais, ribeirinhos, indígenas e pequenos agricultores regionais.',
      icon: '🤝',
      defaultSupply: 250_000,
    },
    {
      id: 'rwa',
      label: 'Ativos Reais (RWA)',
      desc: 'Imóveis verdes, hectares de reflorestamento produtivo, direitos de exploração sustentável de solo.',
      icon: '🏘️',
      defaultSupply: 1_000_000,
    },
    {
      id: 'meme',
      label: 'Meme Token Regional',
      desc: 'Moedas culturais e memes folclóricos para ativação turística e engajamento da comunidade.',
      icon: '🦖',
      defaultSupply: 100_000_000,
    },
  ],
  copilotFields: [
    {
      key: 'location',
      label: 'Localização Física',
      placeholder: 'Ex: Altamira, Pará',
      optional: true,
    },
    {
      key: 'environmentalGoal',
      label: 'Foco Ambiental / Sustentável',
      placeholder: 'Ex: Reflorestação nativa ou mitigação cooperativista',
      optional: true,
    },
  ],
  copilotPersona:
    'Você é o Co-Pilot Inteligente de Tokenização da plataforma Nortoken, especializado em bioeconomia amazônica. ' +
    'Sua função é transformar ideias de ativos amazônicos (açaí, cacau, sementes, créditos de carbono, turismo sustentável, ' +
    'projetos de ONGs ou memes folclóricos) em tokens Web3 estruturados e seguros. ' +
    'Enfatize sustentabilidade, rastreabilidade e impacto socioambiental. Escreva em português elegante do Brasil.',
  docTypes: [
    {
      id: 'car',
      label: 'CAR / Licença Ambiental',
      hint: 'Cadastro Ambiental Rural ou licença que embasa legalmente o RWA.',
    },
    {
      id: 'coop',
      label: 'Ata / Estatuto da Cooperativa',
      hint: 'Essencial para projetos com produção agrícola regional.',
    },
  ],
};
