# 🛫 Relatório de Teste de Voo — Nortoken

**Data:** 2026-06-08 · **Meta:** criar token na Base Sepolia em vários níveis de confiabilidade e verificar se o **contrato** pega as particularidades de lançamento.
**Abordagem:** híbrida — Playwright dirige a UI (Track 1) + fork test forge contra a factory real (Track 2).

---

## ✅ Resumo executivo

| Área | Status |
|---|---|
| **Contrato pega as particularidades de confiabilidade** | ✅ **100% — provado on-chain** (3 perfis, todas as flags conferem) |
| **Wizard de criação (UI, 5 passos)** | ✅ Funciona ponta-a-ponta até o portão de deploy |
| **Trust Score ao vivo (3 bandas)** | ✅ Reage corretamente: 59 Média → 87 Alta → 29 Baixa |
| **Erros de JS no fluxo** | ✅ Nenhum (só um 404 cosmético de favicon) |
| **Deploy persistente na Sepolia pública (BaseScan)** | ⚠️ Não executado — falta `DEPLOYER_PK` funded (ver Gaps) |

**Veredito:** o motor está sólido. O contrato **realmente** aplica cada nível de confiabilidade, e o app guia o usuário do segmento ao deploy sem quebrar.

---

## 🔗 Track 2 — Verificação on-chain (fork da Base Sepolia real)

Fork test (`contracts/test/FlightTest.t.sol`) chamou `createToken` na **factory real deployada** `0xB6BcE4Ca…5c9C78` com 3 perfis e **leu de volta** as variáveis públicas do token. Rodado com:
`forge test --match-path test/FlightTest.t.sol --fork-url https://sepolia.base.org -vv` → **1 passed, 0 failed**.

| Particularidade | Perfil A (Alta) intenc./lido | Perfil B (Média) | Perfil C (Baixa) | Contrato pegou? |
|---|---|---|---|---|
| `mintable` | false / **false** | true / true | true / true | ✅ |
| `cap()` | =supply / **=supply** | 2× / 2× | 0 / 0 | ✅ |
| `antiSnipeBlocks` | 3 / **3** | 1 / 1 | 0 / 0 | ✅ |
| `tradeCooldownSec` | 30 / **30** | 0 / 0 | 0 / 0 | ✅ |
| `maxWalletBps` | 200 / **200** | 500 / 500 | 0 / 0 | ✅ |
| `maxTxBps` | 100 / **100** | 200 / 200 | 0 / 0 | ✅ |
| `totalSupply` | 1M / **1M** | 1M / 1M | 1M / 1M | ✅ |
| `owner` = criador | ✅ | ✅ | ✅ | ✅ |
| `factory.isNortoken` | true / **true** | true / true | true / true | ✅ |

**Provas comportamentais extras:**
- **Perfil A:** `renounceOwnership()` → `owner` vira `address(0)` (imutável). ✅
- **Perfil C:** `mint()` pós-deploy funciona (mintable=true) → +123 tokens. ✅
- **Perfil A:** `mint()` **REVERTE** como esperado (mintable=false). ✅

> **Conclusão:** todas as "particularidades de lançamento" que vão pro contrato (`InitParams`) são **gravadas e aplicadas corretamente**. O contrato é a fonte de verdade.

---

## 🖥️ Track 1 — UI dirigida por Playwright (app em testnet, localhost:3000)

Fluxo completo, perfil "ALTA" como base, variando o Trust Score para cobrir as 3 bandas.

| Passo | Resultado | Evidência |
|---|---|---|
| Onboarding (3 passos, pulando carteira) | ✅ | `flight-01-welcome.png` |
| Wizard P1 — Segmento (6 categorias) | ✅ | `flight-02-wizard-step1.png` |
| Wizard P2 — Identidade (nome/símbolo/supply/desc) | ✅ | `flight-03-step2-identity.png` |
| Wizard P3 — Configuração + **Trust Score ao vivo** | ✅ | `flight-04-step3-trust-default.png` |
| Wizard P4 — Documentos | ✅ | — |
| Wizard P5 — Revisão + **portão de deploy** | ✅ | `flight-07-step5-review.png` |

### Trust Score reage aos "vários níveis" (provado ao vivo)
| Config | Score | Banda | Print |
|---|---|---|---|
| Padrão (mint on, lock 180d, honeypot on) | **59/100** | Confiança Média | `flight-04-...png` |
| + renunciar mint + renunciar ownership | **87/100** | **Confiança Alta** | `flight-05-step3-high.png` |
| − honeypot − lock − renúncias | **29/100** | **Confiança Baixa** | `flight-06-step3-low.png` |

- **Portão de deploy:** no passo 5, sem carteira conectada, aparece **"Conectar Carteira para Lançar"** — comportamento correto (o deploy real exige assinatura via Privy).
- **Console:** **0 erros de JavaScript** no fluxo inteiro. Único erro: `GET /favicon.ico 404` (cosmético).

> Screenshots salvos na pasta de output do Playwright MCP (`.playwright-mcp/`).

---

## 🚩 Gaps, bugs e recomendações

1. **[Bloqueio do deploy persistente] Não há `contracts/.env` com `DEPLOYER_PK` funded.**
   - Por isso o Track 2 foi **fork** (prova o contrato, mas os tokens não ficam na Sepolia pública / BaseScan).
   - **Para tokens persistentes no BaseScan:** me passar uma **chave de teste funded** (Base Sepolia ETH) em `contracts/.env` (`DEPLOYER_PK` + `BASE_SEPOLIA_RPC`) que eu rodo o mesmo deploy via `forge script --broadcast`.

2. **[Esperado, não é bug] Privy não é automatizável headless.** O deploy real **pela UI** precisa de login Privy (email/Google), fora do alcance do Playwright. Por isso a abordagem híbrida.

3. **[Cosmético] `favicon.ico` 404** — adicionar um `favicon` em `app/public/` mata o único erro de console.

4. **[Off-chain por design] Trust Score, honeypot-free, descrição, presença, docs** vivem só na UI/futuro banco — **não** no contrato. Honeypot-free é uma *validação* (força máx/tx e máx/carteira ≥ 1%), não uma flag on-chain. Liquidez travada + renúncia de ownership são **passo 2/3** (pool + renounce), não o `createToken` básico.

5. **[Dívida de doc] `app/CLAUDE.md` está desatualizado** (diz "tudo sandbox / Fase 6 pendente / monorepo") — o app já tem testnet real + deploy. Atualizar (já está nos TODOs).

---

## 📁 Artefatos
- Fork test: `contracts/test/FlightTest.t.sol` (reutilizável; roda em ~6s).
- Screenshots: `.playwright-mcp/flight-01..07-*.png`.
- Factory real (verificada): https://sepolia.basescan.org/address/0xB6BcE4CaCF4285e64de79Bcbf5Aee69cC65c9C78
