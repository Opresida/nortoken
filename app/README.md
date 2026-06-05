# NORTOKEN — Rampa de Lançamento Web3 da MAZARI CORP

<p align="center">
  <strong>Da ideia ao deploy on-chain — democratizando a tokenização amazônica.</strong><br>
  <em>Plataforma exclusiva do grupo MAZARI CORP.</em>
</p>

**Workspace:** `@workspace/nortoken` (dentro do monorepo `mazari-corp`)
**Domínio de produção:** `https://nortoken.mazaricorp.com` *(a configurar — multi-tenant via `/p/<slug>`)*
**Ambiente de dev:** `http://localhost:3000`

---

## 🎯 Visão de produto

NORTOKEN é uma **rampa de lançamento de tokens Web3** com foco em **bioeconomia amazônica** (cacau, açaí, créditos de carbono, RWA verde, madeira sustentável, cooperativas, projetos sociais e meme tokens regionais). Cobramos uma taxa baixa pelo deploy do token e oferecemos serviços premium opcionais que ampliam o ecossistema do cliente.

### Camadas de oferta

| Camada | Entregas | Cobrança |
|---|---|---|
| **Core (taxa baixa)** | Deploy do token (EVM-first) + dashboard básico de portfólio + lista pública no marketplace | **39 USDC** (piso) ou custo de rede × 1,2 — o que for maior + fee de protocolo 0,2% por transferência |
| **Premium avulso (à la carte)** | 6 serviços modulares: jurídico RWA, tokenomics, branding, auditoria física, comunidade/bots, whitepaper | US$ 90–450 por serviço |
| **Plataforma Whitelabel** ⭐ | App próprio em domínio `<slug>.nortoken.mazaricorp.com` com sidebar, swap, stake, referral, buy NFT, buy token, roadmap, whitepaper, lending (soon) — cliente escolhe quais funções ativar | Setup US$ 3.500 |
| **Lançamento Enterprise** | Pacote completo em 5 etapas: Whitelabel → Certik → NFTs → DEX/Liquidez → Marketing/Listagens | US$ 53.340 total (negociável, pago em USDC) |

---

## 🚀 Como rodar

### Pré-requisitos
- Node.js 22+
- pnpm 10+ (monorepo é pnpm-only — `npm install` é bloqueado por `preinstall` hook)
- Acesso à raiz do monorepo `mazari-corp`

### Setup

```bash
# Na raiz do monorepo mazari-corp
cd /c/Users/user/mazari-corp
pnpm install

# Subir só o nortoken
pnpm --filter @workspace/nortoken dev
# → http://localhost:3000
```

O `server.ts` é um Express que serve o Vite em modo middleware (dev) ou os assets buildados (prod) + expõe o endpoint `/api/copilot` (Gemini).

### Build de produção

```bash
pnpm --filter @workspace/nortoken build
pnpm --filter @workspace/nortoken start  # roda dist/server.cjs
```

### Variáveis de ambiente

Ver `.env.example`. A principal é `GEMINI_API_KEY` (opcional — sem ela, o Co-pilot roda em modo simulação determinística).

---

## 🧱 Stack

| Camada | Tecnologia |
|---|---|
| **UI** | React 19 + TypeScript |
| **Build** | Vite 7 (via catalog do monorepo) |
| **Estilo** | TailwindCSS 4 + plugin Vite (sem PostCSS) |
| **Animações** | Motion (sucessor do Framer Motion) |
| **Ícones** | Lucide React |
| **Server** | Express 4 + tsx (dev) + esbuild bundler (prod) |
| **IA** | `@google/genai` (Gemini Flash) — Co-pilot de tokenomics |
| **Persistência atual** | localStorage (MVP/sandbox) |
| **Persistência futura** | Neon Postgres + Drizzle ORM (Fase 3+) |
| **Auth futura** | Privy ou WalletConnect (Fase 6+) |

---

## 📁 Estrutura

```
artifacts/nortoken/
├── README.md                   # Este arquivo
├── CONTEXT.md                  # Regras, design system, lógica de negócio
├── PROJECT_CONTEXT.md          # Visão consolidada e status
├── ARCHITECTURE.md             # Estrutura, fluxos, decisões técnicas
├── TODO.md                     # Concluído + pendente detalhado
├── CLAUDE.md                   # Pacote de contexto portátil pra IA
├── package.json                # @workspace/nortoken
├── tsconfig.json               # herda tsconfig.base.json do monorepo
├── vite.config.ts
├── server.ts                   # Express + /api/copilot
├── index.html
├── .env.example
├── metadata.json
└── src/
    ├── main.tsx
    ├── App.tsx                 # State global + tab-based router
    ├── index.css               # Paleta petroleum/amazon-neon
    ├── types.ts                # Token, UserWallet, EnterpriseStage etc.
    │
    ├── data/
    │   └── mockData.ts         # PREMIUM_SERVICES + ENTERPRISE_LAUNCH_PACKAGE + INITIAL_TOKENS
    │
    ├── components/
    │   ├── Navigation.tsx
    │   ├── LandingPage.tsx
    │   ├── OnboardingFlow.tsx
    │   ├── TokenCreator.tsx
    │   ├── Dashboard.tsx       # Painel de portfólio + teaser Whitelabel
    │   ├── Marketplace.tsx
    │   ├── PremiumStore.tsx    # 5 etapas Enterprise + 6 serviços avulsos
    │   └── AdminPanel.tsx
    │
    └── whitelabel/             # Plataforma Whitelabel multi-tenant
        ├── types.ts            # WhitelabelConfig, theme, features...
        ├── config.ts           # DEMO_WHITELABEL_CONFIG (padrão Nortoken)
        ├── WhitelabelApp.tsx   # Container + router interno
        ├── WhitelabelLayout.tsx # Sidebar + header + footer
        └── pages/
            ├── Home.tsx        # Hero + tokenomics + features grid
            ├── Whitepaper.tsx  # 6 seções + nav
            ├── Swap.tsx        # Interface Jupiter-style
            ├── Stake.tsx       # 4 pools 18-120% APR + modal
            ├── Referral.tsx    # Link + 3 tiers + indicações recentes
            ├── Tokenization.tsx# 4 NFTs com raridade + bundle
            ├── Buy.tsx         # Compra em USDC (on-chain, self-custody)
            ├── Roadmap.tsx     # Timeline 5 fases
            └── Lending.tsx     # Coming soon Q1 2027
```

---

## 🗺️ Status do roadmap (resumo)

Detalhes completos em [TODO.md](./TODO.md).

| Fase | Entrega | Status |
|---|---|---|
| **0** | Migração para monorepo MAZARI + setup | ✅ Concluído |
| **1** | 5 etapas Enterprise no PremiumStore | ✅ Concluído |
| **2** | Seção NORTOKEN apresentada no site MAZARI CORP | ✅ Concluído |
| **2.5** | Plataforma Whitelabel demo (9 páginas funcionais) | ✅ Concluído |
| **3** | Backend real (Neon Postgres + Drizzle) + auth | ❌ Pendente |
| **4** | Painel admin com CRUD de valores e clientes | ❌ Pendente |
| **5** | Pagamento on-chain em USDC (self-custody, sem fiat/PIX) | ❌ Pendente |
| **6** | Wallet Web3 real (Privy/WalletConnect) + deploy on-chain | ❌ Pendente |
| **7** | Configurador de Whitelabel multi-tenant + rota dinâmica `/p/<slug>` | ❌ Pendente |
| **8** | Deploy produção Render + DNS `nortoken.mazaricorp.com` | ❌ Pendente |

---

## 👥 Time

- **Humberto** — product, strategy, decisões executivas
- **Claude (Anthropic)** — engineering, implementação, validação

Plataforma exclusiva do grupo MAZARI CORP.

---

## 📜 Licença

Proprietária. Todos os direitos reservados a MAZARI CORP.
