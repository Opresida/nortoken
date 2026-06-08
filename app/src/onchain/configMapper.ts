/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * configMapper — a PONTE determinística entre o que a tela coleta (TokenConfig) e o que os
 * contratos aceitam (NortokenFactory.createToken / createPoolAndLock). Funções PURAS e
 * testáveis sem carteira: garantem que CADA campo da UI tem contrapartida real on-chain.
 *
 * Nada aqui assina transação — só traduz. O deployClient (Fase 4) consome estas saídas.
 */

import type { TokenConfig } from '../types';

export type Address = `0x${string}`;

/** Espelha o struct NortokenERC20.InitParams (a ordem/nome batem com o contrato). */
export interface InitParamsArgs {
  name: string;
  symbol: string;
  initialSupply: bigint; // uint256, em wei (18 casas)
  maxCap: bigint; // uint256, 0 = sem teto
  mintable: boolean;
  initialOwner: Address; // a factory força msg.sender, mas mandamos o esperado
  antiSnipeBlocks: bigint; // uint64
  tradeCooldownSec: bigint; // uint64
  maxWalletBps: number; // uint16
  maxTxBps: number; // uint16
  taxBps: number; // uint16 — a factory injeta o padrão do protocolo (app manda 0)
  taxTreasury: Address; // a factory injeta o tesouro (app manda zero)
}

/** Espelha NortokenFactory.LockParams. */
export interface LockParamsArgs {
  tickLower: number;
  tickUpper: number;
  liquidity: bigint; // uint128
  minTick: number;
  maxTick: number;
  lockDuration: bigint; // uint64, segundos
}

/** Args completos do createPoolAndLock (passo 2). */
export interface PoolAndLockArgs {
  anchor: Address; // 0x000...0 = ETH nativo
  fee: number; // uint24 (ex: 3000)
  tickSpacing: number; // int24 (ex: 60)
  sqrtPriceX96: bigint; // uint160
  lp: LockParamsArgs;
  clientFeeBps: number; // uint16 (taxa do projeto do cliente)
  clientTreasury: Address;
}

/** O cliente quer semear a pool com estas quantidades (passo 2). */
export interface PoolSeed {
  tokenAmount: bigint; // wei do token (18 casas)
  anchorAmount: bigint; // wei do âncora (ETH 18 casas / USDC 6 casas)
  anchorIsToken0: boolean; // o âncora é currency0? (endereço do âncora < endereço do token)
}

const TOKEN_DECIMALS = 18n;
const WAD = 10n ** TOKEN_DECIMALS;
const PROTOCOL_FEE_BPS = 20;
const MAX_TOTAL_FEE_BPS = 500;

// ─────────────────────────── helpers de conversão ───────────────────────────

/** Converte uma quantidade "humana" (número de tokens) para wei (18 casas), sem perder precisão. */
export function toWei(amount: number, decimals: bigint = TOKEN_DECIMALS): bigint {
  if (!Number.isFinite(amount) || amount < 0) throw new Error('amount inválido');
  // separa parte inteira e fracionária via string pra evitar erro de ponto flutuante
  const [int, frac = ''] = amount.toString().split('.');
  const fracPadded = (frac + '0'.repeat(Number(decimals))).slice(0, Number(decimals));
  return BigInt(int) * 10n ** decimals + BigInt(fracPadded || '0');
}

/** % (ex: 2 ou 1.5) → basis points (×100). null/0 → 0. */
export function pctToBps(pct: number | null): number {
  if (pct == null) return 0;
  if (pct < 0) throw new Error('pct negativo');
  return Math.round(pct * 100);
}

// ─────────────────────────── validação (espelha configIssues da UI) ───────────────────────────

export function validateConfig(cfg: TokenConfig): string[] {
  const issues: string[] = [];
  const totalFeeBps = cfg.taxes.protocolFeeBps + cfg.taxes.clientTaxBps;
  if (totalFeeBps > MAX_TOTAL_FEE_BPS) {
    issues.push(`Fee total ${(totalFeeBps / 100).toFixed(2)}% acima do teto de 5%.`);
  }
  if (cfg.taxes.clientTaxBps > 0 && !cfg.taxes.clientTreasury.trim()) {
    issues.push('Defina o endereço de tesouro do cliente para a sua taxa.');
  }
  if (cfg.supply.maxCap != null && cfg.supply.maxCap < cfg.supply.initial) {
    issues.push('Teto (cap) não pode ser menor que o supply inicial.');
  }
  if (
    cfg.trustSeal.honeypotFreeAttest &&
    ((cfg.protections.maxTxPct ?? 0) < 1 || (cfg.protections.maxWalletPct ?? 0) < 1)
  ) {
    issues.push('Honeypot-free exige máx/transação e máx/carteira ≥ 1%.');
  }
  return issues;
}

// ─────────────────────────── PASSO 1 — createToken ───────────────────────────

export function toInitParams(cfg: TokenConfig, name: string, symbol: string, owner: Address): InitParamsArgs {
  return {
    name,
    symbol,
    initialSupply: toWei(cfg.supply.initial),
    maxCap: cfg.supply.maxCap == null ? 0n : toWei(cfg.supply.maxCap),
    // "renunciar mint no lançamento" vence o toggle "mintável": se renuncia, nasce não-mintável.
    mintable: cfg.supply.renounceMintAtLaunch ? false : cfg.supply.mintable,
    initialOwner: owner,
    antiSnipeBlocks: BigInt(cfg.protections.antiSnipeBlocks),
    tradeCooldownSec: BigInt(cfg.protections.tradeCooldownSec),
    maxWalletBps: pctToBps(cfg.protections.maxWalletPct),
    maxTxBps: pctToBps(cfg.protections.maxTxPct),
    // A factory injeta a taxa condicional + tesouro (protocolo controla); o app só preenche placeholders.
    taxBps: 0,
    taxTreasury: '0x0000000000000000000000000000000000000000' as Address,
  };
}

// ─────────────────────────── PASSO 2 — createPoolAndLock ───────────────────────────

/** Maior tick utilizável alinhado ao tickSpacing (full-range). */
export function fullRangeTicks(tickSpacing: number): { tickLower: number; tickUpper: number } {
  const MAX_TICK = 887272;
  const usable = Math.floor(MAX_TICK / tickSpacing) * tickSpacing;
  return { tickLower: -usable, tickUpper: usable };
}

/** Raiz inteira de um bigint (Newton). */
export function bigintSqrt(value: bigint): bigint {
  if (value < 0n) throw new Error('sqrt de negativo');
  if (value < 2n) return value;
  let x = value;
  let y = (x + 1n) / 2n;
  while (y < x) {
    x = y;
    y = (x + value / x) / 2n;
  }
  return x;
}

/**
 * Preço inicial da pool no formato Uniswap: sqrt(amount1/amount0) * 2^96.
 * amount0/amount1 seguem a ordenação real de currencies (currency0 < currency1).
 */
export function encodeSqrtPriceX96(amount0: bigint, amount1: bigint): bigint {
  if (amount0 <= 0n || amount1 <= 0n) throw new Error('amounts da pool devem ser > 0');
  const Q96 = 2n ** 96n;
  // sqrt(a1/a0)*2^96 = sqrt(a1 * 2^192 / a0)
  return bigintSqrt((amount1 * Q96 * Q96) / amount0);
}

// Limites de preço do Uniswap V4 (sqrtPriceX96 nos ticks mín/máx). Usados como bounds
// de range "cheio" — ligeiramente mais largos que os ticks reais → liquidez conservadora
// (nunca puxa MAIS do que o cliente informou; no pior caso puxa um fio a menos).
const MIN_SQRT_PRICE = 4295128739n;
const MAX_SQRT_PRICE = 1461446703485210103287273052203988822378723970342n;
const Q96 = 2n ** 96n;

function liqForAmount0(sqrtA: bigint, sqrtB: bigint, amount0: bigint): bigint {
  const intermediate = (sqrtA * sqrtB) / Q96;
  return (amount0 * intermediate) / (sqrtB - sqrtA);
}
function liqForAmount1(sqrtA: bigint, sqrtB: bigint, amount1: bigint): bigint {
  return (amount1 * Q96) / (sqrtB - sqrtA);
}

/**
 * Liquidez (uint128) para um par de amounts a um preço, no range [sqrtA, sqrtB].
 * Pega o MÍNIMO dos dois lados → garante que nenhum amount é excedido (seguro).
 */
export function getLiquidityForAmounts(
  sqrtP: bigint,
  sqrtA: bigint,
  sqrtB: bigint,
  amount0: bigint,
  amount1: bigint,
): bigint {
  if (sqrtA > sqrtB) [sqrtA, sqrtB] = [sqrtB, sqrtA];
  if (sqrtP <= sqrtA) return liqForAmount0(sqrtA, sqrtB, amount0);
  if (sqrtP < sqrtB) {
    const l0 = liqForAmount0(sqrtP, sqrtB, amount0);
    const l1 = liqForAmount1(sqrtA, sqrtP, amount1);
    return l0 < l1 ? l0 : l1;
  }
  return liqForAmount1(sqrtA, sqrtB, amount1);
}

/**
 * Monta os args do passo 2 a partir da config + da semeadura escolhida pelo cliente.
 * O preço inicial é a RAZÃO entre os amounts (token × âncora), então ambos são consumidos
 * proporcionalmente; usa range full. A liquidez é o mínimo seguro dos dois lados.
 */
export function toPoolAndLockArgs(
  cfg: TokenConfig,
  anchor: Address,
  seed: PoolSeed,
  opts: { fee?: number; tickSpacing?: number } = {},
): PoolAndLockArgs {
  const fee = opts.fee ?? 3000;
  const tickSpacing = opts.tickSpacing ?? 60;
  const { tickLower, tickUpper } = fullRangeTicks(tickSpacing);

  // ordena os amounts conforme currency0/currency1
  const [amount0, amount1] = seed.anchorIsToken0
    ? [seed.anchorAmount, seed.tokenAmount]
    : [seed.tokenAmount, seed.anchorAmount];
  const sqrtPriceX96 = encodeSqrtPriceX96(amount0, amount1);
  const liquidity = getLiquidityForAmounts(sqrtPriceX96, MIN_SQRT_PRICE, MAX_SQRT_PRICE, amount0, amount1);

  return {
    anchor,
    fee,
    tickSpacing,
    sqrtPriceX96,
    lp: {
      tickLower,
      tickUpper,
      liquidity,
      minTick: tickLower,
      maxTick: tickUpper,
      lockDuration: BigInt(Math.max(0, Math.floor(cfg.trustSeal.liquidityLockDays)) * 86400),
    },
    clientFeeBps: cfg.taxes.clientTaxBps,
    clientTreasury: (cfg.taxes.clientTreasury || '0x0000000000000000000000000000000000000000') as Address,
  };
}

/** renounceOwnership é o ÚLTIMO passo — só depois da pool, senão trava setExempt/enableTrading. */
export function needsRenounceAfterPool(cfg: TokenConfig): boolean {
  return cfg.trustSeal.renounceOwnership;
}
