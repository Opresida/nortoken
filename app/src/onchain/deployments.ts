/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Mapa de endereços por chainId — fonte única consumida pela UI (e espelha o
 * addresses.json dos contratos). `v4: true` significa que dá pra criar pool (passo 2);
 * onde V4 não existe, só o passo 1 (criar token) funciona.
 */

import type { EvmNetwork } from '../types';
import type { Address } from './configMapper';

export interface ChainDeployment {
  chainId: number;
  network: EvmNetwork;
  name: string;
  v4: boolean; // Uniswap V4 disponível? (passo 2 / pool)
  live: boolean; // o trio já está deployado nesta rede?
  poolManager: Address;
  usdc: Address;
  hook: Address;
  lock: Address;
  factory: Address;
  swapRouter: Address; // router de compra/venda nas pools Nortoken
  stateView: Address; // leitura de preço (slot0) das pools V4
  disperse: Address; // distribuidor opcional de supply no lançamento (NortokenDisperse)
  explorer: string;
}

const ZERO = '0x0000000000000000000000000000000000000000' as Address;

/** Base Sepolia — trio v3 ATIVO (deployado + verificado). */
export const BASE_SEPOLIA: ChainDeployment = {
  chainId: 84532,
  network: 'base',
  name: 'Base Sepolia',
  v4: true,
  live: true,
  poolManager: '0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408',
  usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  // Trio v4 (com TAXA CONDICIONAL 0,3% no token não-travado). Substitui o v3.
  hook: '0xA39cb2daE62F788195CCdB147155eae9915580CC',
  lock: '0x82644C1BCA7dB9707C77f6eA8A4984624d350f45',
  factory: '0x08De01b7A9a31357f85411Cc526A972E3b1B9917',
  swapRouter: '0xC97b1bc7Bc1D14b6AEfd6BeDa3580564E092BCDa',
  stateView: '0x571291b572ed32cE6751a2cb2486EbEe8DEfB9B4',
  disperse: '0x8D4bF383051AF366ba76b1ce770B05b28AD6E11e',
  explorer: 'https://sepolia.basescan.org',
};

/** Demais redes — placeholders até o deploy multi-testnet (precisa V4 + gas + verify). */
export const DEPLOYMENTS: Record<number, ChainDeployment> = {
  84532: BASE_SEPOLIA,
};

/** Quais EvmNetwork da UI já têm o trio no ar (pra filtrar o seletor de rede). */
export const NETWORK_LIVE: Record<EvmNetwork, boolean> = {
  base: true,
  polygon: false,
  bsc: false,
  ethereum: false,
};

export function getDeploymentByNetwork(net: EvmNetwork): ChainDeployment | null {
  return Object.values(DEPLOYMENTS).find((d) => d.network === net) ?? null;
}

export function getDeploymentByChainId(chainId: number): ChainDeployment | null {
  return DEPLOYMENTS[chainId] ?? null;
}

export { ZERO as ZERO_ADDRESS };
