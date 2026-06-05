/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EvmNetwork } from '../types';
import { GasOracle, defaultGasOracle } from './gasOracle';
import {
  PROTOCOL_FEE_BPS,
  NORTOKEN_MARKUP_PCT,
  MIN_DEPLOY_FEE_USD,
  PROTOCOL_TREASURY,
} from './protocolFee';

export interface DeployQuoteInput {
  network: EvmNetwork;
  supply: number;
  /** Taxa do cliente em bps (para compor o fee total recorrente). */
  clientTaxBps?: number;
  /** Volume mensal estimado (USD) para projetar a receita recorrente de protocolo. */
  estMonthlyVolumeUsd?: number;
  /** Overrides opcionais (admin). */
  markupPct?: number;
}

export interface QuoteLine {
  label: string;
  usd: number;
}

export interface DeployQuote {
  network: EvmNetwork;

  // ── Entrada (one-off) ──
  networkCostUsd: number; // custo bruto da rede
  markupPct: number;
  markupUsd: number; // o spread Nortoken
  totalDeployUsd: number; // o que o cliente paga no deploy

  // ── Recorrente (o core do negócio) ──
  protocolFeeBps: number; // 0.2% Nortoken
  clientTaxBps: number;
  totalFeeBps: number; // protocolo + cliente
  protocolTreasury: string;
  estMonthlyProtocolRevenueUsd?: number;

  breakdown: QuoteLine[];
}

/** Função pura: estima custo de rede, aplica o markup e projeta a receita recorrente. */
export function quoteDeploy(
  input: DeployQuoteInput,
  oracle: GasOracle = defaultGasOracle,
): DeployQuote {
  const { network, supply } = input;
  const markupPct = input.markupPct ?? NORTOKEN_MARKUP_PCT;
  const clientTaxBps = input.clientTaxBps ?? 0;

  const networkCostUsd = oracle.estimateDeployUsd(network, supply);
  const withMarkup = networkCostUsd * (1 + markupPct / 100);
  const floorApplied = withMarkup < MIN_DEPLOY_FEE_USD;
  const totalDeployUsd = Math.max(MIN_DEPLOY_FEE_USD, withMarkup);
  const markupUsd = totalDeployUsd - networkCostUsd;
  const serviceLabel = floorApplied
    ? 'Taxa de serviço Nortoken (mínima)'
    : `Facilitação Nortoken (+${markupPct}%)`;

  const protocolFeeBps = PROTOCOL_FEE_BPS;
  const totalFeeBps = protocolFeeBps + clientTaxBps;

  const estMonthlyProtocolRevenueUsd =
    input.estMonthlyVolumeUsd != null
      ? (input.estMonthlyVolumeUsd * protocolFeeBps) / 10_000
      : undefined;

  return {
    network,
    networkCostUsd,
    markupPct,
    markupUsd,
    totalDeployUsd,
    protocolFeeBps,
    clientTaxBps,
    totalFeeBps,
    protocolTreasury: PROTOCOL_TREASURY,
    estMonthlyProtocolRevenueUsd,
    breakdown: [
      { label: 'Custo de rede (gas estimado)', usd: networkCostUsd },
      { label: serviceLabel, usd: markupUsd },
    ],
  };
}

export const usd = (n: number): string =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'USD' });
