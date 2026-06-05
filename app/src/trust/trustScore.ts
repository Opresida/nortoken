/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TokenConfig } from '../types';

/**
 * Nortoken Trust Score — índice de confiabilidade do token (0–100).
 *
 * NÃO é teatro: cada fator e peso espelha o que scanners reais de mercado
 * (TokenSniffer, GoPlus, De.Fi Scanner, Honeypot.is) de fato avaliam ao
 * classificar um token. Mede HIGIENE DE CONTRATO — não garante valorização.
 *
 * Pesos (total 100) — segurança de contrato = 90%; presença do projeto = 10%:
 *   23  Liquidez travada      → maior preditor de "não é rug pull"
 *   19  Supply & mintagem     → risco de inflação/diluição
 *   14  Ownership             → contrato imutável vs. mutável
 *   14  Taxa de transferência → fee alto afasta compradores
 *   10  Proteções anti-bot/MEV→ lançamento limpo, sem sniper dominando
 *   10  Honeypot-free         → garantia de que vender SEMPRE funciona
 *    6  Whitepaper            → documento técnico público do projeto
 *    4  Site oficial          → presença/legitimidade verificável
 */

export type TrustBand = 'high' | 'medium' | 'low';

export interface TrustFactor {
  key: string;
  label: string;
  points: number;
  max: number;
  note: string;
}

export interface TrustResult {
  score: number; // 0–100
  band: TrustBand;
  factors: TrustFactor[];
}

export interface TrustInput {
  config: TokenConfig;
  docsCount: number;
}

export function bandOf(score: number): TrustBand {
  if (score >= 80) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
}

export const BAND_META: Record<TrustBand, { label: string; color: string; hex: string }> = {
  high: { label: 'Confiança Alta', color: 'emerald', hex: '#10b981' },
  medium: { label: 'Confiança Média', color: 'amber', hex: '#f59e0b' },
  low: { label: 'Confiança Baixa', color: 'red', hex: '#ef4444' },
};

export function computeTrustScore({ config, docsCount }: TrustInput): TrustResult {
  const factors: TrustFactor[] = [];

  // 1. Liquidez travada (23) — o maior sinal anti-rug do mercado
  let liq = 0;
  let liqNote = 'Liquidez não travada — é o maior alerta de rug pull aos olhos do mercado.';
  if (config.trustSeal.autoLiquidityLock) {
    liq = 13;
    const d = config.trustSeal.liquidityLockDays;
    if (d >= 365) liq += 10;
    else if (d >= 180) liq += 7;
    else if (d >= 90) liq += 4;
    else if (d >= 30) liq += 2;
    liqNote = `Liquidez travada por ${d} dias.${d < 180 ? ' Travar por mais tempo eleva a confiança.' : ''}`;
  }
  factors.push({ key: 'liquidity', label: 'Liquidez travada', points: liq, max: 23, note: liqNote });

  // 2. Supply & mintagem (19) — risco de inflação
  let mint = 0;
  let mintNote = 'Mint ilimitado — o mercado penaliza pelo risco de diluição. Defina um teto ou renuncie o mint.';
  if (config.supply.renounceMintAtLaunch || !config.supply.mintable) {
    mint = 19;
    mintNote = 'Supply fixo — sem risco de inflação surpresa.';
  } else if (config.supply.maxCap != null) {
    mint = 10;
    mintNote = 'Mint habilitado, porém com teto máximo definido.';
  }
  factors.push({ key: 'mint', label: 'Supply & mintagem', points: mint, max: 19, note: mintNote });

  // 3. Ownership (14)
  const ownRenounced = config.trustSeal.renounceOwnership;
  factors.push({
    key: 'ownership',
    label: 'Ownership',
    points: ownRenounced ? 14 : 5,
    max: 14,
    note: ownRenounced
      ? 'Ownership renunciada — contrato imutável.'
      : 'Ownership mantida (Ownable2Step). Renunciar elevaria a confiança ao máximo.',
  });

  // 4. Taxa de transferência (14) — fee alto afasta comprador
  const feeBps = config.taxes.protocolFeeBps + config.taxes.clientTaxBps;
  let feePts = 0;
  let feeNote = 'Fee acima do teto permitido.';
  if (feeBps <= 100) {
    feePts = 14;
    feeNote = `Fee total baixo (${feeBps / 100}%) — atrativo para traders.`;
  } else if (feeBps <= 300) {
    feePts = 9;
    feeNote = `Fee total moderado (${feeBps / 100}%).`;
  } else if (feeBps <= 500) {
    feePts = 5;
    feeNote = `Fee total alto (${feeBps / 100}%) — reduz a atratividade no mercado.`;
  }
  factors.push({ key: 'fee', label: 'Taxa de transferência', points: feePts, max: 14, note: feeNote });

  // 5. Proteções anti-bot/MEV (10)
  const p = config.protections;
  let prot = 0;
  if (p.antiSnipeBlocks > 0) prot += 3;
  if (p.tradeCooldownSec > 0) prot += 2;
  if (p.maxWalletPct != null && p.maxWalletPct >= 1) prot += 3;
  if (p.maxTxPct != null && p.maxTxPct >= 1) prot += 2;
  factors.push({
    key: 'protections',
    label: 'Proteções anti-bot/MEV',
    points: prot,
    max: 10,
    note:
      prot >= 7
        ? 'Lançamento bem protegido contra sniper e sandwich-MEV.'
        : 'Proteções de lançamento parciais — anti-snipe e limites elevam a nota.',
  });

  // 6. Honeypot-free (10) — o item nº1 que o investidor checa
  const hp = config.trustSeal.honeypotFreeAttest ? 10 : 0;
  factors.push({
    key: 'honeypot',
    label: 'Atestado honeypot-free',
    points: hp,
    max: 10,
    note: hp
      ? 'Vendabilidade garantida — sem blacklist, fee dentro do teto.'
      : 'Sem atestado de vendabilidade — o mercado trata como risco de honeypot.',
  });

  // 7. Whitepaper (6) — pontua se tem, se foi gerado/anexado, ou se a Nortoken produzirá
  const wp = config.presence.whitepaper;
  const hasWp = wp.has || wp.viaNortoken || docsCount > 0;
  factors.push({
    key: 'whitepaper',
    label: 'Whitepaper',
    points: hasWp ? 6 : 0,
    max: 6,
    note: wp.viaNortoken
      ? 'Whitepaper profissional produzido pela Nortoken.'
      : wp.has
        ? 'Whitepaper público informado.'
        : docsCount > 0
          ? 'Documento de whitepaper anexado.'
          : 'Sem whitepaper — gere com a IA (grátis), anexe ou contrate a produção.',
  });

  // 8. Site oficial (4)
  const ws = config.presence.website;
  const hasWs = ws.has || ws.viaNortoken;
  factors.push({
    key: 'website',
    label: 'Site oficial',
    points: hasWs ? 4 : 0,
    max: 4,
    note: ws.viaNortoken
      ? 'Site/landing produzido pela Nortoken.'
      : ws.has
        ? 'Site oficial informado.'
        : 'Sem site — informe a URL ou contrate a criação com a Nortoken.',
  });

  const score = factors.reduce((s, f) => s + f.points, 0);
  return { score, band: bandOf(score), factors };
}
