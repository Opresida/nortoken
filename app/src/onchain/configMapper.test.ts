/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Testes do configMapper — rodam com `tsx src/onchain/configMapper.test.ts` (sem vitest).
 * Garantem que a tradução TokenConfig → args do contrato é fiel (a promessa front=back).
 */

import assert from 'node:assert/strict';
import type { TokenConfig } from '../types';
import {
  toWei,
  pctToBps,
  toInitParams,
  toPoolAndLockArgs,
  validateConfig,
  needsRenounceAfterPool,
  encodeSqrtPriceX96,
  fullRangeTicks,
  getLiquidityForAmounts,
  type Address,
  type PoolSeed,
} from './configMapper';

const MIN_SQRT = 4295128739n;
const MAX_SQRT = 1461446703485210103287273052203988822378723970342n;

const OWNER = '0x1111111111111111111111111111111111111111' as Address;
const TREASURY = '0x2222222222222222222222222222222222222222' as Address;

function baseConfig(): TokenConfig {
  return {
    supply: { initial: 1_000_000, maxCap: null, mintable: true, renounceMintAtLaunch: false },
    protections: { antiSnipeBlocks: 2, tradeCooldownSec: 30, maxWalletPct: 2, maxTxPct: 1 },
    trustSeal: { autoLiquidityLock: true, liquidityLockDays: 180, renounceOwnership: false, honeypotFreeAttest: true },
    taxes: { protocolFeeBps: 20, clientTaxBps: 0, clientTreasury: '' },
    presence: { website: { has: false, viaNortoken: false }, whitepaper: { has: false, viaNortoken: false } },
  };
}

let passed = 0;
function ok(label: string, fn: () => void) {
  fn();
  passed++;
  console.log(`  ✓ ${label}`);
}

// ── conversões ──
ok('toWei inteiro', () => assert.equal(toWei(100), 100n * 10n ** 18n));
ok('toWei fracionário', () => assert.equal(toWei(1.5), 1_500_000_000_000_000_000n));
ok('toWei USDC 6 casas', () => assert.equal(toWei(39, 6n), 39_000_000n));
ok('pctToBps 2% → 200', () => assert.equal(pctToBps(2), 200));
ok('pctToBps 0.2% → 20', () => assert.equal(pctToBps(0.2), 20));
ok('pctToBps null → 0', () => assert.equal(pctToBps(null), 0));

// ── toInitParams ──
ok('initParams mapeia supply/proteções', () => {
  const p = toInitParams(baseConfig(), 'Meu Token', 'MTK', OWNER);
  assert.equal(p.name, 'Meu Token');
  assert.equal(p.symbol, 'MTK');
  assert.equal(p.initialSupply, 1_000_000n * 10n ** 18n);
  assert.equal(p.maxCap, 0n); // null → 0
  assert.equal(p.mintable, true);
  assert.equal(p.antiSnipeBlocks, 2n);
  assert.equal(p.tradeCooldownSec, 30n);
  assert.equal(p.maxWalletBps, 200); // 2% → 200 bps
  assert.equal(p.maxTxBps, 100); // 1% → 100 bps
  assert.equal(p.initialOwner, OWNER);
});
ok('renounceMintAtLaunch vence mintable', () => {
  const c = baseConfig();
  c.supply.mintable = true;
  c.supply.renounceMintAtLaunch = true;
  assert.equal(toInitParams(c, 'X', 'X', OWNER).mintable, false);
});
ok('maxCap definido vira wei', () => {
  const c = baseConfig();
  c.supply.maxCap = 2_000_000;
  assert.equal(toInitParams(c, 'X', 'X', OWNER).maxCap, 2_000_000n * 10n ** 18n);
});

// ── validação (espelha configIssues) ──
ok('valida config boa sem issues', () => assert.deepEqual(validateConfig(baseConfig()), []));
ok('cap < initial gera issue', () => {
  const c = baseConfig();
  c.supply.maxCap = 500_000; // < initial 1M
  assert.ok(validateConfig(c).some((i) => i.includes('cap')));
});
ok('fee total > 5% gera issue', () => {
  const c = baseConfig();
  c.taxes.clientTaxBps = 500; // 20 + 500 = 520 > 500
  assert.ok(validateConfig(c).some((i) => i.includes('teto')));
});
ok('taxa do cliente sem tesouro gera issue', () => {
  const c = baseConfig();
  c.taxes.clientTaxBps = 200;
  c.taxes.clientTreasury = '';
  assert.ok(validateConfig(c).some((i) => i.includes('tesouro')));
});
ok('honeypot com maxTx < 1% gera issue', () => {
  const c = baseConfig();
  c.protections.maxTxPct = 0;
  assert.ok(validateConfig(c).some((i) => i.includes('Honeypot')));
});

// ── passo 2 / preço / ticks ──
ok('encodeSqrtPriceX96 1:1 = 2^96', () => assert.equal(encodeSqrtPriceX96(10n ** 18n, 10n ** 18n), 2n ** 96n));
ok('fullRangeTicks(60) = ±887220', () => {
  const t = fullRangeTicks(60);
  assert.equal(t.tickLower, -887220);
  assert.equal(t.tickUpper, 887220);
});
ok('toPoolAndLockArgs: lock dias→seg + clientFee', () => {
  const c = baseConfig();
  c.taxes.clientTaxBps = 200;
  c.taxes.clientTreasury = TREASURY;
  c.trustSeal.liquidityLockDays = 180;
  const seed: PoolSeed = { tokenAmount: 1000n * 10n ** 18n, anchorAmount: 1n * 10n ** 18n, anchorIsToken0: true };
  const a = toPoolAndLockArgs(c, '0x0000000000000000000000000000000000000000' as Address, seed);
  assert.equal(a.lp.lockDuration, 180n * 86400n); // 15552000
  assert.equal(a.clientFeeBps, 200);
  assert.equal(a.clientTreasury, TREASURY);
  assert.equal(a.lp.tickLower, -887220);
  assert.ok(a.sqrtPriceX96 > 0n);
});

// ── liquidez (passo 2) ──
ok('getLiquidityForAmounts no preço casado ≈ √(a0·a1), conservador', () => {
  const a0 = 4n * 10n ** 18n;
  const a1 = 1n * 10n ** 18n;
  const sqrtP = encodeSqrtPriceX96(a0, a1); // preço = razão dos amounts
  const L = getLiquidityForAmounts(sqrtP, MIN_SQRT, MAX_SQRT, a0, a1);
  const expected = 2n * 10n ** 18n; // √(4e18 · 1e18) = 2e18
  assert.ok(L > 0n, 'liquidez > 0');
  assert.ok(L <= expected, 'nunca excede (seguro)');
  assert.ok(L > (expected * 999n) / 1000n, 'dentro de 0,1% do ideal');
});

// ── renounce ──
ok('needsRenounceAfterPool reflete a flag', () => {
  const c = baseConfig();
  assert.equal(needsRenounceAfterPool(c), false);
  c.trustSeal.renounceOwnership = true;
  assert.equal(needsRenounceAfterPool(c), true);
});

console.log(`\n✅ configMapper: ${passed} testes passaram`);
