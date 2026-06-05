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

## Contratos (Base Sepolia, testnet — verificados)

| Contrato | Endereço | Papel |
|---|---|---|
| MazariSwapHookV3 | `0xDA4e860FFD739F8A63851E19Be1AafA5D8B480CC` | fee 0,2% protocolo + taxa do cliente por-pool, no âncora |
| MalleableLiquidityLock | `0x10ee52ad60b5b8a0d6bec6F31D49a466e423e9c2` | principal travado + range ajustável por keeper (nunca saca) |
| NortokenFactory | `0xB6BcE4CaCF4285e64de79Bcbf5Aee69cC65c9C78` | createToken (passo 1) + createPoolAndLock (passo 2) |
| NortokenSwapRouter | `0xC97b1bc7Bc1D14b6AEfd6BeDa3580564E092BCDa` | compra/venda nas pools (lado comprador) |

Endereços canônicos V4 + detalhes em `contracts/addresses.json`.

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
