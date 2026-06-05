# CLAUDE.md — NORTOKEN

Pacote de contexto portátil para Claude Code. Este arquivo é carregado automaticamente em qualquer máquina onde o repo for clonado, então funciona independentemente da memória local.

---

## 👤 Quem é o usuário

**Humberto** (humbertodeassuncao@gmail.com) — fundador da MAZARI CORP. Product/strategy do NORTOKEN. Plano Claude Max. Usa **Antigravity IDE** no Windows.

### Preferências fortes
- **Nunca abrir VS Code Simple Browser nem qualquer browser embutido** — apenas informar a URL `http://localhost:3000` quando o app subir
- **PT-BR direto**, vocativo "meu amigo" no chat é OK
- **Respostas curtas e objetivas**, sem floreio
- **Se for explicar decisão técnica**, mostrar trade-off — não decidir por ele
- **Honestidade > otimismo cego**: se algo é vibe code do Gemini, dizer claramente

---

## 🎯 O que é o NORTOKEN

**Rampa de lançamento Web3 da MAZARI CORP** com foco em **bioeconomia amazônica**.

Camadas de oferta:
1. **Core (taxa baixa):** deploy do token + dashboard de portfólio
2. **Premium avulso:** 6 serviços modulares (US$ 90-450)
3. **Whitelabel** ⭐: app dedicado em `<slug>.nortoken.mazaricorp.com` (US$ 3.500 setup)
4. **Enterprise:** pacote completo 5 etapas (US$ 53.340 total)

> Plataforma exclusiva do grupo MAZARI CORP.

---

## 🧱 Stack

- **React 19** + **Vite 7** (via catalog do monorepo)
- **TypeScript** estrito (herda de `../../tsconfig.base.json`)
- **TailwindCSS 4** com plugin Vite (sem PostCSS)
- **Motion** (sucessor Framer Motion) para animações
- **Lucide React** para ícones
- **Express 4** + **tsx** (dev) / **esbuild** (prod) no server
- **@google/genai** (Gemini Flash) — Co-pilot de tokenomics
- **localStorage** (MVP) → migrar pra **Neon Postgres + Drizzle** na Fase 3

### Importante: **pnpm-only**

O monorepo MAZARI tem `preinstall` hook que **bloqueia `npm install`**. Sempre usar `pnpm`. Pra adicionar dep, sempre via `catalog:` se já existe no `pnpm-workspace.yaml`.

---

## 🎨 Paleta NORTOKEN

```
--petroleum-dark: #050e18    ← background principal
--petroleum-deep: #040912    ← gradientes mais escuros
--petroleum-card: #0a1d2e    ← cards e elevações
--amazon-neon:    #10b981    ← accent primário (botões, destaques)
--amazon-light:   #34d399    ← hover, brilho
--amazon-green:   #065f46    ← secundário escuro
```

### Whitelabel multi-tenant
O whitelabel usa **CSS custom properties** injetadas pelo `WhitelabelLayout` baseadas em `config.theme`:
- `var(--wl-primary)`, `var(--wl-bg)`, `var(--wl-card)`, `var(--wl-deep)`, `var(--wl-fg)`, etc.

**Quando trabalhar no whitelabel, NUNCA hardcodar cores — sempre via `var(--wl-*)`.**

---

## 🚀 Como rodar localmente

⚠️ Projeto vive dentro do monorepo `mazari-corp`. Sempre rodar da raiz.

```bash
# Setup (uma vez)
cd /c/Users/user/mazari-corp
pnpm install

# Subir só o nortoken
pnpm --filter @workspace/nortoken dev
# → http://localhost:3000
```

Server sobe em `http://localhost:3000` (Express + Vite middleware). **Não abrir Simple Browser** — apenas avisar a URL ao Humberto.

### Subir junto com o site MAZARI

```bash
# Em terminais separados:
pnpm --filter @workspace/mazari-corp dev   # http://localhost:5000
pnpm --filter @workspace/nortoken dev      # http://localhost:3000
```

### Adicionando dependências

```bash
pnpm --filter @workspace/nortoken add <pacote>
pnpm --filter @workspace/nortoken add -D <pacote-dev>
```

Depois do add, commitar **`package.json` E `pnpm-lock.yaml`** no mesmo commit.

---

## 📁 Estrutura

```
artifacts/nortoken/
├── server.ts                # Express + /api/copilot (Gemini)
├── vite.config.ts
├── tsconfig.json            # extends ../../tsconfig.base.json
├── package.json             # @workspace/nortoken
└── src/
    ├── App.tsx              # State global + tab-based router
    ├── components/          # 8 componentes (Navigation, Dashboard, PremiumStore...)
    ├── data/mockData.ts     # PREMIUM_SERVICES + ENTERPRISE_LAUNCH_PACKAGE + INITIAL_TOKENS
    ├── types.ts             # Token, UserWallet, EnterpriseStage...
    └── whitelabel/          # Plataforma whitelabel multi-tenant
        ├── WhitelabelApp.tsx
        ├── WhitelabelLayout.tsx
        ├── config.ts        # DEMO_WHITELABEL_CONFIG
        ├── types.ts         # WhitelabelConfig
        └── pages/           # Home, Whitepaper, Swap, Stake, Referral,
                             # Tokenization, Buy, Roadmap, Lending
```

---

## ✅ Princípios não-negociáveis

### Produto
1. **Self-custody sempre.** Cliente é dono do contrato. MAZARI nunca custodia fundos.
2. **Foco amazônico.** Não competir com Pump.fun genérico. Bioeconomia, cooperativas, RWA verde.
3. **Pagamento por marco no Enterprise.** Cliente nunca paga US$ 53k antecipado — etapa por etapa contra entrega.
4. **Whitelabel é produto premium.** Multi-tenant: 1 codebase, N clientes via config no DB.

### Código
1. **`pnpm typecheck` deve passar** antes de qualquer "concluído"
2. **Sempre `catalog:`** pra deps já existentes no monorepo
3. **CSS vars no whitelabel** — nunca hardcodar cores
4. **Server-side IA** — `GEMINI_API_KEY` no `.env` do servidor, nunca exposta ao cliente
5. **Atualizar `WhitelabelConfig.features`** em `config.ts` se adicionar/remover página

### Voz
- **PT-BR direto**, sem hype crypto-bro
- **Honestidade sobre sandbox** — sempre indicar quando é simulado
- **Bioeconomia em primeiro plano** — Amazônia, sustentabilidade, comunidades
- **MAZARI CORP como assinatura** — rodapé sempre presente

---

## 🔒 Regras invioláveis (não fazer)

- ❌ **Nunca** `npm install` neste projeto (preinstall hook bloqueia + cria conflito de lockfile)
- ❌ **Nunca** hardcodar cores no whitelabel — usar `var(--wl-*)`
- ❌ **Nunca** custodiar fundos do cliente
- ❌ **Nunca** prometer deploy on-chain real antes da Fase 6 (hoje é tudo sandbox)
- ❌ **Nunca** commitar `.env` ou secrets — usar Render Secrets em prod
- ❌ **Nunca** abrir Simple Browser / browser embutido — apenas informar URL
- ❌ **Nunca** quebrar `pnpm typecheck` — válido em todos os 5 workspaces
- ❌ **Nunca** instalar dep fora do `catalog:` se ela já existe no `pnpm-workspace.yaml`

---

## 🗺️ Estado atual do projeto (snapshot 2026-05-21)

### ✅ Pronto
- **Fase 0:** Migração pro monorepo, setup TypeScript + Vite + Tailwind 4
- **Fase 1:** Pacote Enterprise (5 etapas, US$ 53.340) no PremiumStore com timeline visual
- **Fase 2:** Seção `<Nortoken />` integrada na Home do site MAZARI CORP
- **Fase 2.5:** Plataforma Whitelabel demo com **9 páginas funcionais** (Home, Whitepaper, Swap, Stake, Referral, Tokenization, Buy, Roadmap, Lending) — paleta NORTOKEN, sidebar responsiva, CSS vars preparadas pra multi-tenancy
- **Fase 2.6:** Documentação completa (README, CONTEXT, PROJECT_CONTEXT, ARCHITECTURE, TODO, CLAUDE)

### ❌ Pendente pra pleno funcionamento
- **Fase 3:** Backend Neon Postgres + Drizzle + Auth real (3-4 dias)
- **Fase 4:** Painel admin com CRUD de valores e clientes (2-3 dias)
- **Fase 5:** Pagamento on-chain em **USDC** (stablecoin), self-custody — **sem fiat/PIX** (3-4 dias)
- **Fase 6:** Wallet Web3 real (Privy/WalletConnect) + deploy on-chain **EVM-first** (Base/Polygon) (1-2 semanas)
- **Fase 7:** Configurador Whitelabel + rota multi-tenant `/p/<slug>` (1-2 semanas)
- **Fase 8:** Deploy produção Render + DNS `nortoken.mazaricorp.com` (1 dia)

### ⏸️ Aguardando decisão do Humberto
- Provider de wallet Web3 (Privy / WalletConnect / RainbowKit)
- Storage de imagens (R2 / Cloudinary / Supabase Storage)
- Número WhatsApp Business para CTA "Falar com Especialista"

**Detalhes completos em [TODO.md](./TODO.md).**

---

## 🔑 Decisões já tomadas (não revisitar sem motivo)

- ✅ Stack: TypeScript + React 19 + Vite 7 + Tailwind 4
- ✅ Monorepo MAZARI (pnpm-only, `artifacts/nortoken`)
- ✅ Neon Postgres + Drizzle para Fase 3+
- ✅ Pagamento: **USDC on-chain apenas** (self-custody). **Sem PIX/fiat/Mercado Pago** — blindagem regulatória CVM/Bacen. Token próprio "NORTH" foi **descartado** (risco de ser enquadrado como valor mobiliário).
- ✅ Custódia: cliente sempre assina (self-custody)
- ✅ Pitch híbrido: bioeconomia amazônica + Enterprise como upsell
- ✅ Whitelabel multi-tenant em `nortoken.mazaricorp.com/p/<slug>` (path-based primeiro, subdomain wildcard depois)
- ✅ Tab-based router (sem React Router por enquanto, except quando precisarmos pra `/p/<slug>` na Fase 7)
- ✅ Identidade: petroleum/amazon-neon (Nortoken), rodapé MAZARI CORP

---

## 🤖 Padrão de trabalho com o Humberto

- **Mapear features existentes ANTES de criar do zero** — sempre buscar reutilizar
- **Em decisão importante, perguntar antes** via `AskUserQuestion` com tradeoffs claros
- **Atualizar os 6 docs canônicos** (README, CONTEXT, PROJECT_CONTEXT, ARCHITECTURE, TODO, CLAUDE) após cada feature aprovada
- **`pnpm typecheck` + visual check** antes de declarar "concluído"
- **Não inventar números** (ex: estimativa de fase) — usar os já documentados em TODO.md
- **Commits descritivos em PT-BR**, Conventional Commits opcional mas mensagem clara obrigatória

---

## 🔧 Comandos úteis

```bash
# Typecheck (deve passar em todos os 5 workspaces)
pnpm typecheck

# Dev nortoken
pnpm --filter @workspace/nortoken dev

# Dev mazari-corp (site institucional)
pnpm --filter @workspace/mazari-corp dev

# Build nortoken
pnpm --filter @workspace/nortoken build

# Adicionar dep
pnpm --filter @workspace/nortoken add <pkg>

# Ver workspaces
pnpm list -r --depth 0
```

### RTK (Rust Token Killer) — economia de tokens

O Humberto usa `rtk` como prefixo padrão pra reduzir output em saída de comandos. Sempre que possível:

```bash
rtk git status        # em vez de git status
rtk git diff          # em vez de git diff
rtk pnpm install      # em vez de pnpm install (90% redução)
rtk grep <pattern>    # em vez de grep
rtk ls <path>         # em vez de ls
```

Se `rtk` não estiver instalado, usar comandos normais e mencionar.

---

## 📂 Documentação relacionada

| Arquivo | Quando consultar |
|---|---|
| `README.md` | Setup inicial, comandos, roadmap resumido |
| `CONTEXT.md` | Regras de código, design system, voz, convenções |
| `PROJECT_CONTEXT.md` | Status atual, decisões abertas, time |
| `ARCHITECTURE.md` | Como o código está estruturado, fluxos de dados, schema de DB |
| `TODO.md` | O que falta pra cada fase — lista priorizada |
| `CLAUDE.md` | Este arquivo — contexto portátil pra IA |

Quando voltar a este projeto numa próxima sessão (mesmo em outra máquina, sem memória local), ler estes 6 arquivos é suficiente pra chegar pleno em produtividade.
