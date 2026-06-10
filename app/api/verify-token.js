/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Função serverless da Vercel — verificação do source do token na BaseScan via API V2
 * unificada da Etherscan. A chave NUNCA vai ao cliente. JS puro (ESM), igual ao copilot.js.
 *
 * Dois modos no MESMO endpoint (respeita o limite de duração da serverless):
 *   • body { tokenAddress, constructorArgs } → SUBMETE e faz 1 checagem rápida.
 *   • body { guid }                          → só CHECA o status de uma submissão anterior.
 *
 * O Standard JSON Input é gerado a partir do MESMO source que a factory deploya
 * (api/_verify/NortokenERC20.standard.json) — bytecode bate, então a verificação passa.
 */
import STANDARD_JSON from './_verify/NortokenERC20.standard.json';

const ETHERSCAN_V2 = 'https://api.etherscan.io/v2/api';
const COMPILER_VERSION = 'v0.8.26+commit.8a97fa7a';
const CONTRACT_NAME = 'src/token/NortokenERC20.sol:NortokenERC20';
const DEFAULT_CHAIN_ID = 84532; // Base Sepolia

const apiKey = () => process.env.ETHERSCAN_API_KEY || process.env.BASESCAN_API_KEY || '';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function checkStatus(chainId, guid, key) {
  const url = `${ETHERSCAN_V2}?chainid=${chainId}&module=contract&action=checkverifystatus&guid=${encodeURIComponent(
    guid,
  )}&apikey=${key}`;
  const r = await fetch(url).then((x) => x.json());
  const result = String(r?.result ?? '');
  if (/pass\s*-\s*verified/i.test(result) || /already verified/i.test(result)) return { status: 'verified', message: result };
  if (/fail/i.test(result)) return { status: 'failed', message: result };
  return { status: 'pending', message: result || 'Em fila na BaseScan.' };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const key = apiKey();
  if (!key) {
    // Não derruba o lançamento — só sinaliza que falta configurar a chave no servidor.
    res.status(200).json({ status: 'failed', message: 'ETHERSCAN_API_KEY/BASESCAN_API_KEY não configurada no servidor.' });
    return;
  }

  const { tokenAddress, constructorArgs, guid, chainId = DEFAULT_CHAIN_ID } = req.body || {};

  try {
    // Modo 2 — só checar o status de uma submissão anterior.
    if (guid) {
      res.status(200).json({ ...(await checkStatus(chainId, guid, key)), guid });
      return;
    }

    // Modo 1 — submeter a verificação.
    if (!tokenAddress) {
      res.status(400).json({ status: 'failed', message: 'tokenAddress é obrigatório.' });
      return;
    }

    const body = new URLSearchParams();
    body.set('apikey', key);
    body.set('module', 'contract');
    body.set('action', 'verifysourcecode');
    body.set('codeformat', 'solidity-standard-json-input');
    body.set('contractaddress', tokenAddress);
    body.set('contractname', CONTRACT_NAME);
    body.set('compilerversion', COMPILER_VERSION);
    body.set('sourceCode', JSON.stringify(STANDARD_JSON));
    body.set('constructorArguements', String(constructorArgs || '').replace(/^0x/, ''));

    const sub = await fetch(`${ETHERSCAN_V2}?chainid=${chainId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    }).then((x) => x.json());

    if (String(sub?.status) !== '1') {
      const msg = String(sub?.result ?? sub?.message ?? 'Falha ao submeter.');
      // "Smart-contract already verified" → trata como sucesso.
      const already = /already verified/i.test(msg);
      res.status(200).json({ status: already ? 'verified' : 'failed', message: msg });
      return;
    }

    const newGuid = sub.result;
    // Uma checagem rápida dentro do limite da serverless; se ainda em fila, devolve o guid
    // pro cliente continuar o polling via Modo 2.
    await sleep(4000);
    res.status(200).json({ ...(await checkStatus(chainId, newGuid, key)), guid: newGuid });
  } catch (e) {
    res.status(200).json({ status: 'failed', message: e?.message || String(e) });
  }
}
