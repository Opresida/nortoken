# Nortoken Contracts — a "mina" do Verso Mazari

Contratos Solidity (Foundry) da fundação real do Verso Mazari. **Testnet-first (Base Sepolia).**

> Nortoken **alimenta** · Swap **hospeda** · Fi **otimiza** · Wallet **acessa**.

## O que vive aqui

| Contrato | Papel |
|---|---|
| `src/token/NortokenERC20.sol` | Token musculoso: OZ v5 + LaunchGuard (anti-snipe/cooldown temporários) + AntiWhale. **Sem fee-on-transfer** (o fee de protocolo é capturado no hook). Invariante de *sellability* fuzzada = honeypot-free verificável. |
| `src/hook/MazariSwapHook.sol` | **O Mazari Swap.** Hook na Uniswap V4 (`beforeSwap` KYC opcional + `afterSwap` captura 0,2% de protocolo + eventos de volume). Não é DEX. |
| `src/lock/MalleableLiquidityLock.sol` | **A mina.** Lock maleável sobre a posição V4: principal travado (anti-rug) + range ajustável por keeper de permissão restrita (nunca saca). |
| `src/factory/NortokenFactory.sol` | Deploy atômico token + pool V4 + lock. |

## Comandos

```bash
pnpm --filter @workspace/nortoken-contracts build        # forge build
pnpm --filter @workspace/nortoken-contracts build:sizes  # checar EIP-170 (<24KB)
pnpm --filter @workspace/nortoken-contracts test         # forge test
pnpm --filter @workspace/nortoken-contracts test:fuzz    # 100k runs (perfil ci)
```

## Toolchain
Solidity **0.8.26** (constraint do v4-core) · EVM **cancun** (V4 exige transient storage) · OpenZeppelin v5 · Uniswap v4-core/v4-periphery · Permit2.

## ⚠️ Endereços V4
Os endereços canônicos da V4 em Base Sepolia estão em `addresses.json` — **status UNVERIFIED**. Confirmar on-chain (BaseScan) antes da Fase 2 (deploy do hook/pool). V4 confirmada como presente em Base Sepolia.

## Gate pré-mainnet
Auditoria externa · parecer jurídico do keeper (CVM "ferramenta vs gestor") · multisig Safe 3-de-5 + timelock 48h · bug bounty · 2-4 semanas de testnet limpa. **Nada disso é necessário em testnet.**
