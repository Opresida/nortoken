/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * useDeployer — liga a carteira real (Privy) aos contratos via viem. Expõe os 2 passos
 * da linha de montagem (criar token / criar pool) + a renúncia (sempre por último).
 * A ORDEM das assinaturas do passo 2 é crítica: setExempt(lock) → approve(lock) →
 * createPoolAndLock. renounceOwnership só DEPOIS da pool (senão trava setExempt).
 */

import { useCallback, useMemo } from 'react';
import { useWallets } from '@privy-io/react-auth';
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  maxUint256,
  parseEventLogs,
  type Address,
} from 'viem';
import { baseSepolia } from 'viem/chains';
import { FACTORY_ABI, TOKEN_ABI } from './abis';
import { BASE_SEPOLIA, ZERO_ADDRESS } from './deployments';
import type { InitParamsArgs, PoolAndLockArgs } from './configMapper';

const CHAIN = baseSepolia; // Base Sepolia (84532) — única rede ativa por ora

export interface CreateTokenResult {
  hash: `0x${string}`;
  token: Address;
}
export interface CreatePoolResult {
  hash: `0x${string}`;
  lockId: bigint;
}

export function useDeployer() {
  const { wallets } = useWallets();
  const wallet = wallets[0];
  const account = wallet?.address as Address | undefined;

  const getClients = useCallback(async () => {
    if (!wallet) throw new Error('Carteira não conectada');
    await wallet.switchChain(CHAIN.id); // garante Base Sepolia
    const provider = await wallet.getEthereumProvider();
    const walletClient = createWalletClient({ chain: CHAIN, transport: custom(provider) });
    const publicClient = createPublicClient({ chain: CHAIN, transport: http() });
    return { walletClient, publicClient, account: wallet.address as Address };
  }, [wallet]);

  /** PASSO 1 — cria o token (cliente vira owner). Retorna o endereço do token. */
  const createToken = useCallback(
    async (params: InitParamsArgs): Promise<CreateTokenResult> => {
      const { walletClient, publicClient, account: acc } = await getClients();
      const hash = await walletClient.writeContract({
        address: BASE_SEPOLIA.factory,
        abi: FACTORY_ABI,
        functionName: 'createToken',
        args: [{ ...params, initialOwner: acc }],
        account: acc,
        chain: CHAIN,
      });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      const events = parseEventLogs({ abi: FACTORY_ABI, eventName: 'TokenCreated', logs: receipt.logs });
      const token = (events[0]?.args as { token?: Address } | undefined)?.token;
      if (!token) throw new Error('TokenCreated não encontrado no recibo');
      return { hash, token };
    },
    [getClients],
  );

  /**
   * PASSO 2 — "Crie sua pool": isenta o lock, aprova o lock e cria a pool+lock.
   * `anchorValueWei` = ETH a enviar (0 se âncora USDC).
   */
  const createPoolAndLock = useCallback(
    async (token: Address, args: PoolAndLockArgs, anchorValueWei: bigint): Promise<CreatePoolResult> => {
      const { walletClient, publicClient, account: acc } = await getClients();
      const lock = BASE_SEPOLIA.lock;

      // 1) isenta o lock das travas de lançamento (pré-condição mecânica)
      const exemptHash = await walletClient.writeContract({
        address: token,
        abi: TOKEN_ABI,
        functionName: 'setExempt',
        args: [lock, true],
        account: acc,
        chain: CHAIN,
      });
      await publicClient.waitForTransactionReceipt({ hash: exemptHash });

      // 2) aprova O LOCK (não a factory) para puxar o token na liquidez
      const approveHash = await walletClient.writeContract({
        address: token,
        abi: TOKEN_ABI,
        functionName: 'approve',
        args: [lock, maxUint256],
        account: acc,
        chain: CHAIN,
      });
      await publicClient.waitForTransactionReceipt({ hash: approveHash });

      // 3) cria a pool + tranca a liquidez (keeper = Mazari) + registra a taxa do cliente
      const hash = await walletClient.writeContract({
        address: BASE_SEPOLIA.factory,
        abi: FACTORY_ABI,
        functionName: 'createPoolAndLock',
        args: [
          token,
          args.anchor,
          args.fee,
          args.tickSpacing,
          args.sqrtPriceX96,
          args.lp,
          args.clientFeeBps,
          args.clientTreasury,
        ],
        account: acc,
        chain: CHAIN,
        value: anchorValueWei,
      });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      const events = parseEventLogs({ abi: FACTORY_ABI, eventName: 'PoolAndLockCreated', logs: receipt.logs });
      const lockId = (events[0]?.args as { lockId?: bigint } | undefined)?.lockId ?? 0n;
      return { hash, lockId };
    },
    [getClients],
  );

  /** Renúncia de posse — SEMPRE por último (depois da pool). */
  const renounceOwnership = useCallback(
    async (token: Address): Promise<`0x${string}`> => {
      const { walletClient, publicClient, account: acc } = await getClients();
      const hash = await walletClient.writeContract({
        address: token,
        abi: TOKEN_ABI,
        functionName: 'renounceOwnership',
        args: [],
        account: acc,
        chain: CHAIN,
      });
      await publicClient.waitForTransactionReceipt({ hash });
      return hash;
    },
    [getClients],
  );

  return useMemo(
    () => ({
      ready: !!wallet,
      account,
      isEthAnchor: (anchor: Address) => anchor === ZERO_ADDRESS,
      createToken,
      createPoolAndLock,
      renounceOwnership,
    }),
    [wallet, account, createToken, createPoolAndLock, renounceOwnership],
  );
}
