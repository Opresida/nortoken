# NORTOKEN

Launchpad de tokens EVM da **MAZARI** — emissão de tokens "musculosos", pools com taxa do
projeto + fee de protocolo (0,2%), liquidez travada com keeper gerenciado (o "passivo") e
marketplace com compra on-chain real. USDC-only, self-custody, sem fiat.

> Monorepo: contratos (Foundry) + dapp (React + Privy + viem). Privado.

## Estrutura

```
nortoken/
├── contracts/   # Foundry — hook (fee duplo), factory (linha de montagem), lock maleável, swap router
└── app/         # React 19 + Vite + Privy + viem — wizard, dashboard, marketplace
```

## Contratos (Base Sepolia, testnet — verificados na BaseScan)

Trio v4 ATIVO (com **taxa condicional 0,3%** que zera ao travar a liquidez). Fonte viva: [`app/src/onchain/deployments.ts`](app/src/onchain/deployments.ts).

| Contrato | Endereço | Papel |
|---|---|---|
| MazariSwapHookV3 | `0xA39cb2daE62F788195CCdB147155eae9915580CC` | fee 0,2% protocolo + taxa do cliente por-pool |
| MalleableLiquidityLock | `0x82644C1BCA7dB9707C77f6eA8A4984624d350f45` | principal travado + range ajustável por keeper (nunca saca) |
| NortokenFactory | `0x08De01b7A9a31357f85411Cc526A972E3b1B9917` | createToken (passo 1) + createPoolAndLock (passo 2) |
| NortokenSwapRouter | `0xC97b1bc7Bc1D14b6AEfd6BeDa3580564E092BCDa` | compra/venda nas pools (lado comprador) |
| NortokenDisperse | `0x8D4bF383051AF366ba76b1ce770B05b28AD6E11e` | distribuição opcional do supply no lançamento |

Endereços canônicos V4 + detalhes em `contracts/addresses.json`.

> **Fluxo em 2 passos (separado):** o cliente **lança o token primeiro** (`createToken`) e **cria a pool depois** (`createPoolAndLock`, no Dashboard) — o lock de liquidez se efetiva na criação da pool. Todo token lançado é **verificado automaticamente na BaseScan** (Etherscan V2, `app/api/verify-token`).

## Rodar

### Contratos
```bash
cd contracts
cp .env.example .env   # preencher RPC, DEPLOYER_PK (de TESTE), keys
forge test             # 45 testes
forge build --sizes
```

### App
```bash
cd app
cp .env.example .env   # VITE_PRIVY_APP_ID, VITE_WALLET_MODE=testnet|mock
pnpm install
pnpm dev               # http://localhost:3000
```

## Segurança
- **NUNCA** commitar `.env` (chave privada do deployer/tesouro). O `.gitignore` bloqueia; use `.env.example`.
- `contracts/lib/` é **vendorizado** (build reprodutível). Pode virar git submodule depois.
- Contratos ainda **não auditados** — testnet. Gate mainnet: auditoria + parecer jurídico do keeper + multisig/timelock.

## Modelo de receita
- **Recorrente:** 0,2% de todo swap, de todos os tokens → tesouro Mazari (escala com o volume).
- **Emissão:** 39 USDC por token (flag OFF em testnet).
- **Serviços:** whitelabel, premium, e (futuro) distribuidor de tokens + bot de volume.

---
Produto do grupo **MAZARI**.
