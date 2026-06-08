/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Leitura de saldos ERC20 on-chain (Base Sepolia) — usado pra verificação pública
 * da distribuição do supply nas carteiras do tokenomics.
 */

import { createPublicClient, http, type Address } from 'viem';
import { baseSepolia } from 'viem/chains';

const ERC20_BALANCE_ABI = [
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
] as const;

const publicClient = createPublicClient({ chain: baseSepolia, transport: http() });

/** Lê o saldo (em wei, 18 casas) de várias carteiras de um token. Falha → 0n. */
export async function readBalances(token: Address, addrs: Address[]): Promise<bigint[]> {
  return Promise.all(
    addrs.map((a) =>
      publicClient
        .readContract({ address: token, abi: ERC20_BALANCE_ABI, functionName: 'balanceOf', args: [a] })
        .catch(() => 0n),
    ),
  );
}

/** Formata wei (18 casas) em número legível abreviado (ex.: 1.2M, 340K). */
export function fmtTokens(wei: bigint): string {
  const n = Number(wei / 10n ** 14n) / 10_000; // 4 casas de precisão
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
}
