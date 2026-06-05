/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * useMarket — o lado COMPRADOR. Lê o preço real da pool (StateView.slot0) e executa a
 * compra de verdade (swap ETH→token pelo NortokenSwapRouter). Só funciona para tokens que
 * já têm pool. O hook cobra os fees (protocolo + cliente) automaticamente no swap.
 */

import { useCallback } from 'react';
import { useWallets } from '@privy-io/react-auth';
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  keccak256,
  encodeAbiParameters,
  type Address,
  type Hex,
} from 'viem';
import { baseSepolia } from 'viem/chains';
import { SWAP_ROUTER_ABI, STATE_VIEW_ABI } from './abis';
import { BASE_SEPOLIA, ZERO_ADDRESS } from './deployments';

const CHAIN = baseSepolia;
const POOL_FEE = 3000;
const TICK_SPACING = 60;

// cliente público pra leituras (preço) — não precisa de carteira
const publicClient = createPublicClient({ chain: CHAIN, transport: http() });

export interface PoolKeyStruct {
  currency0: Address;
  currency1: Address;
  fee: number;
  tickSpacing: number;
  hooks: Address;
}

/** PoolKey do par token/ETH (ETH 0x0 é sempre currency0). */
export function poolKeyFor(token: Address): PoolKeyStruct {
  return {
    currency0: ZERO_ADDRESS,
    currency1: token,
    fee: POOL_FEE,
    tickSpacing: TICK_SPACING,
    hooks: BASE_SEPOLIA.hook,
  };
}

/** PoolId = keccak256(abi.encode(PoolKey)). */
export function poolIdFor(token: Address): Hex {
  const k = poolKeyFor(token);
  return keccak256(
    encodeAbiParameters(
      [
        {
          type: 'tuple',
          components: [
            { name: 'currency0', type: 'address' },
            { name: 'currency1', type: 'address' },
            { name: 'fee', type: 'uint24' },
            { name: 'tickSpacing', type: 'int24' },
            { name: 'hooks', type: 'address' },
          ],
        },
      ],
      [k],
    ),
  );
}

/** Tokens por 1 ETH no preço atual da pool. null se a pool não existe / sem preço. */
export async function getTokensPerEth(token: Address): Promise<number | null> {
  try {
    const res = (await publicClient.readContract({
      address: BASE_SEPOLIA.stateView,
      abi: STATE_VIEW_ABI,
      functionName: 'getSlot0',
      args: [poolIdFor(token)],
    })) as readonly [bigint, number, number, number];
    const sqrtP = res[0];
    if (sqrtP === 0n) return null;
    const r = Number(sqrtP) / 2 ** 96;
    return r * r; // (sqrtP/2^96)^2 = currency1/currency0 = tokens por ETH (ambos 18 casas)
  } catch {
    return null;
  }
}

export function useMarket() {
  const { wallets } = useWallets();
  const wallet = wallets[0];

  /** Compra exact-input: gasta `ethWei` em ETH e recebe o token. minOut=0 (exact-input). */
  const buy = useCallback(
    async (token: Address, ethWei: bigint): Promise<{ hash: `0x${string}` }> => {
      if (!wallet) throw new Error('Carteira não conectada');
      await wallet.switchChain(CHAIN.id);
      const provider = await wallet.getEthereumProvider();
      const walletClient = createWalletClient({ chain: CHAIN, transport: custom(provider) });
      const account = wallet.address as Address;

      const hash = await walletClient.writeContract({
        address: BASE_SEPOLIA.swapRouter,
        abi: SWAP_ROUTER_ABI,
        functionName: 'swapExactIn',
        args: [poolKeyFor(token), true /* ETH→token */, ethWei, 0n],
        account,
        chain: CHAIN,
        value: ethWei,
      });
      await publicClient.waitForTransactionReceipt({ hash });
      return { hash };
    },
    [wallet],
  );

  return { ready: !!wallet, buy };
}
