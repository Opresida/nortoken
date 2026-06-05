# ARCHITECTURE — NORTOKEN

Estrutura de pastas, fluxo de dados e decisões arquiteturais.

---

## 🧭 Visão geral

```
┌──────────────────────────────────────────────────────────────┐
│                  MONOREPO MAZARI CORP                         │
│                  (pnpm workspaces)                            │
└──────────────────────────────────────────────────────────────┘
              │                            │
              ▼                            ▼
┌─────────────────────────┐    ┌──────────────────────────────┐
│  artifacts/mazari-corp  │    │  artifacts/nortoken          │
│  Site institucional     │    │  Plataforma + Whitelabel     │
│  (5000)                 │    │  (3000)                      │
│                         │    │                              │
│  Tem seção <Nortoken/>  │───►│  Linka pra cá via            │
│  na Home apontando      │    │  nortoken.mazaricorp.com     │
│  pra nortoken.maz...    │    │                              │
└─────────────────────────┘    └──────────────────────────────┘

artifacts/api-server      lib/db, lib/api-zod...
(backend futuro)          (compartilhado entre artifacts)
```

---

## 📁 Estrutura completa de pastas

```
mazari-corp/artifacts/nortoken/
│
├── 📄 README.md                # Pitch, comandos, roadmap
├── 📄 CONTEXT.md               # Regras, design system, voz
├── 📄 PROJECT_CONTEXT.md       # Visão consolidada + status
├── 📄 ARCHITECTURE.md          # ← este arquivo
├── 📄 TODO.md                  # Tudo feito + pendente
├── 📄 CLAUDE.md                # Pacote de contexto pra IA
│
├── 📄 package.json             # @workspace/nortoken — usa catalog
├── 📄 tsconfig.json            # extends ../../tsconfig.base.json
├── 📄 vite.config.ts           # React + Tailwind + alias @/
├── 📄 server.ts                # Express + /api/copilot (Gemini)
├── 📄 index.html               # Vite entry point
├── 📄 .env.example             # Variáveis (Gemini, DB futuro)
├── 📄 metadata.json            # Nome + descrição do produto
│
└── src/
    ├── main.tsx                # ReactDOM root
    ├── App.tsx                 # State global + tab-based router
    ├── index.css               # Tailwind imports + custom colors
    ├── types.ts                # Token, UserWallet, EnterpriseStage etc.
    │
    ├── data/
    │   └── mockData.ts         # PREMIUM_SERVICES + ENTERPRISE_LAUNCH_PACKAGE + INITIAL_TOKENS
    │
    ├── components/             # Componentes do NORTOKEN base
    │   ├── Navigation.tsx      # Top nav fixa com 7 abas
    │   ├── LandingPage.tsx     # Página inicial (tab "landing")
    │   ├── OnboardingFlow.tsx  # Wizard 3 steps (1ª visita)
    │   ├── TokenCreator.tsx    # Form para criar token (tab "tokenize")
    │   ├── Dashboard.tsx       # Portfólio + teaser Whitelabel (tab "dashboard")
    │   ├── Marketplace.tsx     # Lista todos os tokens (tab "marketplace")
    │   ├── PremiumStore.tsx    # 5 etapas Enterprise + 6 serviços (tab "premium")
    │   └── AdminPanel.tsx      # Auditor faucet + verify (tab "admin")
    │
    └── whitelabel/             # 🎨 PLATAFORMA WHITELABEL MULTI-TENANT
        ├── types.ts            # WhitelabelConfig, theme, features, pools, NFTs etc.
        ├── config.ts           # DEMO_WHITELABEL_CONFIG + NORTOKEN_THEME
        ├── WhitelabelApp.tsx   # Container + router state-based + 9 páginas
        ├── WhitelabelLayout.tsx# Sidebar (9 items) + header (wallet) + footer (MAZARI)
        │
        └── pages/
            ├── Home.tsx        # Hero + tokenomics chart + features grid
            ├── Whitepaper.tsx  # 6 seções com sidebar de navegação
            ├── Swap.tsx        # Input from/to + slippage + rate preview
            ├── Stake.tsx       # 4 pools cards + modal de stake
            ├── Referral.tsx    # Link copiável + 3 tiers + indicações recentes
            ├── Tokenization.tsx# Grid 4 NFTs com raridade + bundle
            ├── Buy.tsx         # Compra em USDC (on-chain, self-custody)
            ├── Roadmap.tsx     # Timeline vertical 5 fases
            └── Lending.tsx     # Coming Soon Q1 2027 + email signup
```

---

## 🌊 Fluxos de dados

### Aplicação principal — NORTOKEN (App.tsx)

```
index.html
  └── main.tsx (ReactDOM.createRoot)
        └── App.tsx
              ├── State global:
              │   ├── currentTab: string  ← controla qual tab renderizar
              │   ├── showOnboarding: boolean  ← localStorage controlled
              │   ├── wallet: UserWallet   ← carteira simulada
              │   ├── tokens: Token[]      ← inicializado com INITIAL_TOKENS
              │   └── transactions: Transaction[]
              │
              ├── Onboarding (1ª visita):
              │   localStorage.getItem('nortoken_onboarding_completed') === null
              │   → renderiza <OnboardingFlow />
              │
              ├── EARLY RETURN: if (currentTab === 'whitelabel')
              │   → renderiza <WhitelabelApp /> fullscreen, ignora resto
              │
              └── Render principal (tabs):
                    <Navigation /> ← top bar com 7 abas
                    <main>
                      currentTab === 'landing'      → <LandingPage />
                      currentTab === 'tokenize'    → <TokenCreator onTokenCreated={...} />
                      currentTab === 'dashboard'   → <Dashboard tokens={...} setTab={...} />
                      currentTab === 'marketplace' → <Marketplace />
                      currentTab === 'premium'     → <PremiumStore />
                      currentTab === 'admin'       → <AdminPanel />
                    </main>
                    <footer>MAZARI CORP</footer>
```

### Fluxo: criar token

```
TokenCreator.tsx
  └── form com: name, symbol, supply, description, category, image
  └── opcional: chama /api/copilot (Gemini) pra sugerir tokenomics
        └── POST /api/copilot → server.ts → Gemini Flash → JSON estruturado
  └── handleTokenCreated(newToken) (callback do App.tsx)
        └── setTokens([newToken, ...tokens])
        └── setWallet({ solBalance: prev - deployCost })
        └── adiciona Transaction de tipo 'deploy'
        └── setTab('dashboard')
```

### Fluxo: contratar serviço Premium

```
PremiumStore.tsx
  ├── ENTERPRISE_LAUNCH_PACKAGE (5 etapas, US$ 53.340)
  │   └── CTA "Falar com Especialista MAZARI" → wa.me/?text=...
  │   └── Sem checkout in-app — venda consultiva via WhatsApp
  │
  └── PREMIUM_SERVICES (6 serviços avulsos US$ 90-450)
      └── click "Adquirir" → setActiveCheckoutService(serv)
      └── Modal checkout (USDC apenas):
            ├── verifica wallet.usdcBalance ≥ priceUsd (1 USDC = 1 USD)
            ├── self-custody — cliente assina; sem fiat/PIX
            └── handleServiceBuySubmit():
                  └── onServicePurchased(tokenId, serviceId) → App.tsx
                  └── setTokens(prev.map(t => t.id === selectedToken.id
                        ? { ...t, premiumServices: [...t.premiumServices, serviceId] }
                        : t))
```

### Fluxo: Whitelabel Demo (fullscreen)

```
App.tsx (early return)
  └── <WhitelabelApp config={DEMO_WHITELABEL_CONFIG} onExitDemo={() => setTab('dashboard')} />
        │
        └── WhitelabelApp.tsx
              ├── State: currentPage: WhitelabelFeatureKey
              │   ('home' | 'whitepaper' | 'swap' | 'stake' | 'referral' |
              │    'tokenization' | 'buy' | 'roadmap' | 'lending')
              │
              └── <WhitelabelLayout config setCurrentPage onExitDemo>
                    ├── Injeta CSS vars do theme:
                    │   style.setProperty('--wl-primary', config.theme.primary)
                    │   style.setProperty('--wl-bg', config.theme.background)
                    │   etc.
                    │
                    ├── <aside> Sidebar:
                    │   ├── Logo + tokenSymbol
                    │   ├── Menu items (filtra por config.features[key])
                    │   ├── Botão Connect Wallet (state local walletConnected)
                    │   └── Botão "Voltar ao Nortoken" → onExitDemo()
                    │
                    ├── <header> com page title + Connect Wallet
                    │
                    ├── <main> renderiza a página atual:
                    │   currentPage === 'home'         → <HomePage config setCurrentPage />
                    │   currentPage === 'whitepaper'   → <WhitepaperPage config />
                    │   ... (9 páginas total)
                    │
                    └── <footer> com MAZARI CORP branding
```

### Multi-tenant futuro (Fase 7)

```
URL: nortoken.mazaricorp.com/p/<slug>
                    │
                    ▼
Backend (api-server)
  └── GET /api/projects/:slug
        └── SELECT * FROM projects WHERE slug = $1
        └── SELECT * FROM project_branding WHERE project_id = $1
        └── SELECT * FROM project_features WHERE project_id = $1
        └── Retorna WhitelabelConfig completo
                    │
                    ▼
Frontend
  └── <WhitelabelApp config={configFromDb} />
        └── Renderiza com a identidade do tenant (logo, paleta, features ativas)
```

---

## 🧩 Decisões arquiteturais

### Por quê tab-based router em vez de React Router

- Nortoken tem menos de 10 telas
- Não precisa de deep linking compartilhável (`#tokenize` ainda funciona via hash se quisermos)
- Tab-state é mais simples e legível
- React Router adicionaria 50KB pro bundle sem necessidade no MVP

### Por quê Whitelabel fullscreen separado

- Whitelabel **simula um app diferente** do Nortoken — não faz sentido manter Navigation/Footer do Nortoken
- Early return em `App.tsx` mantém código limpo
- Quando virar multi-tenant real, a rota `/p/<slug>` ficará separada via React Router

### Por quê Express + Vite middleware

- Quero o **endpoint /api/copilot** server-side (não expor `GEMINI_API_KEY` no cliente)
- Express é simples e familiar
- Em dev: `createViteServer({ middlewareMode: true })` permite HMR sem 2 processos
- Em prod: serve `dist/` como assets estáticos + mantém o endpoint API

### Por quê pnpm workspaces (não Nx, Turborepo, Lerna)

- Padrão MAZARI já usa pnpm-workspaces puro
- `catalog:` resolve versões compartilhadas sem ferramenta extra
- Suficiente pro tamanho do projeto

### Por quê CSS custom properties no Whitelabel

- Multi-tenancy precisa de **theme dinâmico em runtime** — Tailwind config é build-time
- `var(--wl-primary)` permite trocar tema sem rebuild
- `style.setProperty` no `WhitelabelLayout` injeta a paleta do tenant atual
- Componentes filhos consumem via `style={{ background: 'var(--wl-primary)' }}`

### Por quê localStorage no MVP

- Sandbox didático — usuário pode "testar" deploys sem custo
- Sem precisar de auth/backend pra demo
- Quando virar real (Fase 3), substituímos por API → Neon

---

## 🔌 Dependências externas

### Atuais (em uso)
| Lib | Função | Versão |
|---|---|---|
| `react` | UI | 19.x (catalog) |
| `vite` | Build | 7.x (catalog) |
| `tailwindcss` + `@tailwindcss/vite` | Estilo | 4.x (catalog) |
| `motion` | Animações | 12.23.x |
| `lucide-react` | Ícones | catalog |
| `express` | HTTP server | 4.21.x |
| `@google/genai` | Co-pilot IA | 1.x |
| `dotenv` | Env loading | 17.x |
| `tsx` | TS execution em dev | catalog |
| `esbuild` | Bundle server prod | 0.27.x (catalog) |

### Planejadas (Fase 3+)
| Lib | Função | Quando |
|---|---|---|
| `drizzle-orm` + `@neondatabase/serverless` | DB | Fase 3 |
| `bcryptjs` | Hash senha admin | Fase 3 |
| `passport` + `passport-local` | Auth admin | Fase 3 |
| Pagamento em **USDC** via transferência on-chain (`viem`/`wagmi`, sem PSP fiat) | Pagamento | Fase 5 |
| `@privy-io/react-auth` ou `@walletconnect/react-native` | Web3 wallet | Fase 6 |
| `@solana/web3.js` + `@solana/spl-token` | Deploy Solana | Fase 6 |
| `ethers` ou `viem` + `wagmi` | Deploy EVM | Fase 6 |

---

## 🚢 Deploy

### Ambiente atual
- **Dev local:** `pnpm --filter @workspace/nortoken dev` → `http://localhost:3000`

### Ambiente futuro
- **Render Web Service** (igual padrão mazari-corp)
- Build: `corepack enable && pnpm install --frozen-lockfile && pnpm --filter @workspace/nortoken run build`
- Start: `pnpm --filter @workspace/nortoken run start` (serve dist/server.cjs)
- DNS: CNAME `nortoken.mazaricorp.com` → `<service>.onrender.com`
- Env vars no Render Secrets: `GEMINI_API_KEY`, `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_EMAIL`, etc.

---

## 🧪 Testes

### Atual
- ❌ Sem testes automatizados (MVP — validação manual)

### Planejado (Fase 8)
- **Vitest** para units (utils, types)
- **Playwright** para E2E (fluxos críticos: criar token, contratar serviço, navegar whitelabel)
- **TypeScript strict** já cobre a maioria dos erros estruturais

---

## 🗄️ Schema de banco (planejado Fase 3)

```sql
-- Usuários
users (
  id uuid primary key,
  email text unique,
  wallet_address text,
  role enum('client', 'admin'),
  created_at timestamp
)

-- Projetos / tokens deployados
tokens (
  id uuid primary key,
  owner_user_id uuid references users,
  name text,
  symbol text,
  contract_address text,
  network enum('solana', 'ethereum', 'bsc', 'polygon'),
  category text,
  status enum('pending_payment', 'deploying', 'completed', 'failed'),
  deploy_cost_usd numeric,
  created_at timestamp,
  metadata jsonb
)

-- Whitelabel multi-tenant
projects (
  id uuid primary key,
  token_id uuid references tokens,
  slug text unique,
  owner_user_id uuid references users,
  plan_tier enum('starter', 'enterprise'),
  created_at timestamp
)

project_branding (
  project_id uuid primary key references projects,
  logo_url text,
  primary_color text,
  secondary_color text,
  hero_video_url text,
  font_heading text,
  font_body text
)

project_features (
  project_id uuid references projects,
  feature_name text,
  enabled boolean,
  config_jsonb jsonb,
  primary key (project_id, feature_name)
)

project_content (
  project_id uuid primary key references projects,
  whitepaper_md text,
  roadmap_jsonb jsonb,
  faq_jsonb jsonb
)

-- Pedidos de serviços premium / enterprise
orders (
  id uuid primary key,
  user_id uuid references users,
  token_id uuid references tokens nullable,
  service_id text,           -- 'enterprise_stage_2', 'legal_structure', etc.
  amount_usd numeric,
  status enum('pending', 'paid', 'in_progress', 'completed', 'cancelled'),
  payment_method enum('usdc'),   -- USDC on-chain apenas (sem fiat)
  payment_tx_hash text nullable, -- hash da transferência de USDC
  created_at timestamp,
  paid_at timestamp nullable
)

-- Stakes (Whitelabel)
stake_positions (
  id uuid primary key,
  user_wallet text,
  token_id uuid references tokens,
  pool_id text,
  amount numeric,
  staked_at timestamp,
  unlock_at timestamp,
  rewards_claimed numeric default 0
)

-- Referrals
referrals (
  id uuid primary key,
  referrer_wallet text,
  referred_wallet text,
  level integer,
  commission_earned numeric default 0,
  created_at timestamp
)
```

Adaptações finais virão na implementação real da Fase 3.

---

## 📂 Arquivos relacionados

- [README.md](./README.md) — pitch, comandos, roadmap
- [CONTEXT.md](./CONTEXT.md) — regras de código, design system
- [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) — visão consolidada
- [TODO.md](./TODO.md) — concluído + pendente
- [CLAUDE.md](./CLAUDE.md) — pacote portátil pra IA
