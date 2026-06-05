/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * ABIs mínimas (só o que a UI chama) dos contratos do trio v3. `as const` é essencial
 * para o viem inferir os tipos dos args a partir da ABI.
 */

export const FACTORY_ABI = [
  {
    type: 'function',
    name: 'createToken',
    stateMutability: 'nonpayable',
    inputs: [
      {
        name: 'params',
        type: 'tuple',
        components: [
          { name: 'name', type: 'string' },
          { name: 'symbol', type: 'string' },
          { name: 'initialSupply', type: 'uint256' },
          { name: 'maxCap', type: 'uint256' },
          { name: 'mintable', type: 'bool' },
          { name: 'initialOwner', type: 'address' },
          { name: 'antiSnipeBlocks', type: 'uint64' },
          { name: 'tradeCooldownSec', type: 'uint64' },
          { name: 'maxWalletBps', type: 'uint16' },
          { name: 'maxTxBps', type: 'uint16' },
        ],
      },
    ],
    outputs: [{ name: 'token', type: 'address' }],
  },
  {
    type: 'function',
    name: 'createPoolAndLock',
    stateMutability: 'payable',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'anchor', type: 'address' },
      { name: 'fee', type: 'uint24' },
      { name: 'tickSpacing', type: 'int24' },
      { name: 'sqrtPriceX96', type: 'uint160' },
      {
        name: 'lp',
        type: 'tuple',
        components: [
          { name: 'tickLower', type: 'int24' },
          { name: 'tickUpper', type: 'int24' },
          { name: 'liquidity', type: 'uint128' },
          { name: 'minTick', type: 'int24' },
          { name: 'maxTick', type: 'int24' },
          { name: 'lockDuration', type: 'uint64' },
        ],
      },
      { name: 'clientFeeBps', type: 'uint16' },
      { name: 'clientTreasury', type: 'address' },
    ],
    outputs: [
      {
        name: 'key',
        type: 'tuple',
        components: [
          { name: 'currency0', type: 'address' },
          { name: 'currency1', type: 'address' },
          { name: 'fee', type: 'uint24' },
          { name: 'tickSpacing', type: 'int24' },
          { name: 'hooks', type: 'address' },
        ],
      },
      { name: 'lockId', type: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'TokenCreated',
    inputs: [
      { name: 'creator', type: 'address', indexed: true },
      { name: 'token', type: 'address', indexed: true },
      { name: 'name', type: 'string', indexed: false },
      { name: 'symbol', type: 'string', indexed: false },
      { name: 'initialSupply', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'PoolAndLockCreated',
    inputs: [
      { name: 'creator', type: 'address', indexed: true },
      { name: 'token', type: 'address', indexed: true },
      { name: 'lockId', type: 'uint256', indexed: true },
      { name: 'lock', type: 'address', indexed: false },
      { name: 'keeper', type: 'address', indexed: false },
      { name: 'fee', type: 'uint24', indexed: false },
    ],
  },
] as const;

/** NortokenERC20 — só o que o passo 2 e a renúncia precisam. */
export const TOKEN_ABI = [
  {
    type: 'function',
    name: 'setExempt',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'exempt', type: 'bool' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'enableTrading',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    type: 'function',
    name: 'renounceOwnership',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

/** NortokenSwapRouter — compra/venda exact-input nas pools. */
export const SWAP_ROUTER_ABI = [
  {
    type: 'function',
    name: 'swapExactIn',
    stateMutability: 'payable',
    inputs: [
      {
        name: 'key',
        type: 'tuple',
        components: [
          { name: 'currency0', type: 'address' },
          { name: 'currency1', type: 'address' },
          { name: 'fee', type: 'uint24' },
          { name: 'tickSpacing', type: 'int24' },
          { name: 'hooks', type: 'address' },
        ],
      },
      { name: 'zeroForOne', type: 'bool' },
      { name: 'amountIn', type: 'uint256' },
      { name: 'minAmountOut', type: 'uint256' },
    ],
    outputs: [{ name: 'amountOut', type: 'uint256' }],
  },
] as const;

/** StateView — leitura do preço atual (slot0) de uma pool V4. */
export const STATE_VIEW_ABI = [
  {
    type: 'function',
    name: 'getSlot0',
    stateMutability: 'view',
    inputs: [{ name: 'poolId', type: 'bytes32' }],
    outputs: [
      { name: 'sqrtPriceX96', type: 'uint160' },
      { name: 'tick', type: 'int24' },
      { name: 'protocolFee', type: 'uint24' },
      { name: 'lpFee', type: 'uint24' },
    ],
  },
] as const;

/** ERC20 padrão (USDC) — só balanceOf, pra mostrar saldo. */
export const ERC20_ABI = [
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'decimals',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
] as const;
