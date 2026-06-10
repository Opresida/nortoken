/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Verificação automática do source na BaseScan — disparada logo após o deploy do token.
 * A chave do explorer fica no SERVIDOR (/api/verify-token); aqui só montamos os args de
 * construtor EXATOS e acionamos o endpoint. A factory injeta `taxBps`/`taxTreasury` no
 * deploy, então lemos esses dois valores do token recém-criado pra reconstruir a tupla.
 */

import { createPublicClient, http, encodeAbiParameters, type Address } from 'viem';
import { baseSepolia } from 'viem/chains';
import { TOKEN_ABI, INIT_PARAMS_TUPLE } from './abis';
import type { InitParamsArgs } from './configMapper';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type VerifyStatus = 'verified' | 'pending' | 'failed';

/**
 * Submete a verificação e faz polling curto até a BaseScan confirmar. Nunca lança —
 * retorna o status final ('pending' se ainda em fila depois do polling).
 */
export async function submitTokenVerification(
  tokenAddress: Address,
  initParams: InitParamsArgs,
  owner: Address,
): Promise<VerifyStatus> {
  try {
    const publicClient = createPublicClient({ chain: baseSepolia, transport: http() });
    const [taxBps, taxTreasury] = await Promise.all([
      publicClient.readContract({ address: tokenAddress, abi: TOKEN_ABI, functionName: 'taxBps' }),
      publicClient.readContract({ address: tokenAddress, abi: TOKEN_ABI, functionName: 'taxTreasury' }),
    ]);

    // Args de construtor = a tupla InitParams como o contrato a recebeu (owner e taxa já injetados).
    const constructorArgs = encodeAbiParameters(
      [INIT_PARAMS_TUPLE],
      [
        {
          name: initParams.name,
          symbol: initParams.symbol,
          initialSupply: initParams.initialSupply,
          maxCap: initParams.maxCap,
          mintable: initParams.mintable,
          initialOwner: owner,
          antiSnipeBlocks: initParams.antiSnipeBlocks,
          tradeCooldownSec: initParams.tradeCooldownSec,
          maxWalletBps: initParams.maxWalletBps,
          maxTxBps: initParams.maxTxBps,
          taxBps: taxBps as number,
          taxTreasury: taxTreasury as Address,
        },
      ],
    );

    const post = (body: Record<string, unknown>) =>
      fetch('/api/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).then((r) => r.json() as Promise<{ status?: VerifyStatus; guid?: string; message?: string }>);

    let res = await post({ tokenAddress, constructorArgs });
    let guid = res?.guid;
    for (let i = 0; i < 10 && res?.status === 'pending' && guid; i++) {
      await sleep(5000);
      res = await post({ guid });
    }
    return res?.status === 'verified' ? 'verified' : res?.status === 'pending' ? 'pending' : 'failed';
  } catch {
    return 'failed';
  }
}
