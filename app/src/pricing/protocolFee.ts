/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Constantes do modelo de receita da Nortoken.
 *
 * Dois níveis:
 *  1. Entrada (one-off): markup percentual sobre o custo real de rede no deploy.
 *  2. Recorrente (o core): fee de protocolo embutido em cada transferência do
 *     token do cliente, roteado ao tesouro Nortoken.
 */

/** Fee de protocolo Nortoken — 0,2% sobre toda transferência. IMUTÁVEL. */
export const PROTOCOL_FEE_BPS = 20; // 20 bps = 0.20%

/** Teto duro de fee total (protocolo + cliente). Acima disso, contratos viram honeypot suspeito. */
export const MAX_TOTAL_FEE_BPS = 500; // 5.00%

/** Endereço de tesouro Nortoken (mock no sandbox; real via env na Fase 6). */
export const PROTOCOL_TREASURY = '0xN0RT0KEN0000000000000000000000000000FEE';

/** Markup de entrada sobre o custo de rede (one-off no deploy). Importa só em redes caras (Ethereum L1). */
export const NORTOKEN_MARKUP_PCT = 20; // 20% acima do custo real da rede

/**
 * Piso da taxa de emissão em USDC. Em L2 (Base/Polygon) o custo de rede é centavos,
 * então o piso domina e É a margem — cobramos pela facilidade, não pelo gás.
 */
export const MIN_DEPLOY_FEE_USD = 39;

export const bpsToPct = (bps: number): number => bps / 100;
