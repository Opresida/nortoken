/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EvmNetwork } from '../types';

export interface NetworkInfo {
  id: EvmNetwork;
  label: string;
  nativeSymbol: string;
  /** Custo base de deploy em USD (mock; substituído por leitura de gas real na Fase 6). */
  baseDeployUsd: number;
}

// Custo de gás estimado para deployar o ERC-20 musculoso (~4M gas: contrato + setup).
// Valores de mock; o RpcGasOracle lerá o gás real na Fase 6.
export const NETWORKS: NetworkInfo[] = [
  { id: 'base', label: 'Base', nativeSymbol: 'ETH', baseDeployUsd: 0.45 },
  { id: 'polygon', label: 'Polygon', nativeSymbol: 'POL', baseDeployUsd: 0.06 },
  { id: 'bsc', label: 'BNB Chain', nativeSymbol: 'BNB', baseDeployUsd: 7.2 },
  { id: 'ethereum', label: 'Ethereum', nativeSymbol: 'ETH', baseDeployUsd: 180.0 },
];

export const getNetworkInfo = (id: EvmNetwork): NetworkInfo =>
  NETWORKS.find(n => n.id === id) ?? NETWORKS[0];

export interface GasOracle {
  /** Estima o custo bruto de rede (USD) para deployar um token com dado supply. */
  estimateDeployUsd(network: EvmNetwork, supply: number): number;
}

/**
 * Oráculo simulado. O custo cresce levemente com o supply (mais metadata/escrita).
 * Determinístico — sem Math.random — para a revisão ser estável.
 */
export class MockGasOracle implements GasOracle {
  estimateDeployUsd(network: EvmNetwork, supply: number): number {
    const info = getNetworkInfo(network);
    // pequeno acréscimo logarítmico pelo tamanho do supply
    const supplyFactor = 1 + Math.log10(Math.max(10, supply)) / 100;
    return info.baseDeployUsd * supplyFactor;
  }
}

export const defaultGasOracle: GasOracle = new MockGasOracle();
