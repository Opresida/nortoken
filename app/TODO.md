# TODO — NORTOKEN

Lista detalhada do que está pronto e do que falta para **pleno funcionamento** (do estado sandbox/demo atual até a plataforma rodando em produção com clientes reais).

**Última atualização:** 2026-05-21

> Documento vivo. Marcar `[x]` quando concluir, não remover (histórico preservado).

---

## ✅ Concluído

### Fase 0 — Migração e Setup (2026-05-21)

- [x] Copiar projeto `Desktop/MAZARI HOLDING/NORTHTOKEN/` → `mazari-corp/artifacts/nortoken/`
- [x] Renomear package para `@workspace/nortoken`
- [x] Migrar deps para o catalog do monorepo (`react`, `vite`, `tailwindcss`, `motion`, `lucide-react`, `tsx`, etc.)
- [x] Remover deps não necessárias (`autoprefixer`)
- [x] Manter `@google/genai` (Co-pilot Gemini é core da estratégia)
- [x] Reescrever `tsconfig.json` herdando de `tsconfig.base.json`
- [x] Simplificar `vite.config.ts` (alias `@/` apontando pra src, server na porta 5173 dev)
- [x] Relaxar `noImplicitAny` no nortoken (template original tinha tipos implícitos)
- [x] Reescrever `README.md` com pitch NORTOKEN (sem placeholder AI Studio)
- [x] Reescrever `.env.example` (sem `MY_GEMINI_API_KEY` placeholder, com vars futuras comentadas)
- [x] Reescrever `metadata.json` com descrição do produto
- [x] Adicionar rodapé "Plataforma exclusiva do grupo MAZARI CORP" no `App.tsx`
- [x] `pnpm install` na raiz: +69 pacotes resolvidos
- [x] `pnpm typecheck` passa em todos os 5 workspaces
- [x] Dev server sobe em `http://localhost:3000` (Express + Vite middleware)
- [x] Apagar backup `Desktop/MAZARI HOLDING/NORTHTOKEN/` após validação

### Fase 1 — Pacote Lançamento Enterprise (2026-05-21)

- [x] Tipos `EnterpriseStage` + `EnterpriseSubItem` em `src/types.ts`
- [x] Array `ENTERPRISE_LAUNCH_PACKAGE` em `src/data/mockData.ts` com 5 etapas
- [x] Constante `ENTERPRISE_TOTAL_USD` calculada via `reduce` (atualiza automaticamente)
- [x] Etapa 1 — Plataforma Whitelabel & Contratos (US$ 6.300)
- [x] Etapa 2 — Certificação Certik (US$ 4.200)
- [x] Etapa 3 — Abertura NFTs + mercado + AMA (US$ 1.540)
- [x] Etapa 4 — DEX & Liquidez (US$ 25.200)
- [x] Etapa 5 — Marketing & Listagens (US$ 16.100)
- [x] Total: **US$ 53.340**
- [x] Seção destacada no PremiumStore com timeline horizontal (5 cards coloridos)
- [x] Cards com número da etapa, ícone, título, subtitle, descrição, lista de items, subtotal
- [x] Card grande de total com aviso de pagamento por marco
- [x] CTA "Falar com Especialista MAZARI" → WhatsApp
- [x] Divisor "ou monte seu próprio mix de serviços avulsos abaixo"
- [x] Aviso de transparência sobre milestones e consultoria gratuita

### Fase 2 — Seção NORTOKEN no site MAZARI CORP (2026-05-21)

- [x] Componente `Nortoken.tsx` em `mazari-corp/src/components/sections/`
- [x] DecoratedHeading com tag "06. Produto · Nortoken"
- [x] Heading "Nossa rampa de lançamento *de tokens Web3.*"
- [x] Mockup central simulando a UI do Nortoken:
  - Topbar com domínio + indicador Solana
  - Lista de 3 tokens amazônicos (CACAU/AMACAR/AÇAÍ)
  - Painel Co-pilot Gemini sugerindo $CASTPA com supply 120k
  - Score de sustentabilidade 94/100
  - Footer com taxa "~0.4 SOL + rede"
- [x] 3 pilares com ícones: Bioeconomia Amazônica · Co-pilot Gemini · Lançamento Enterprise
- [x] Stats bar: EVM+Solana · ~0.4 SOL · taxa ultra baixa · self-custody
- [x] CTA "Acessar Nortoken" → abre `nortoken.mazaricorp.com` em nova aba
- [x] Aviso "self-custody · cliente sempre dono do contrato"
- [x] Integrado em `Home.tsx` entre Blockchain (05) e PesquisaDesenvolvimento (07)

### Fase 2.5 — Plataforma Whitelabel Demo (2026-05-21)

- [x] Tipos completos em `src/whitelabel/types.ts`:
  - `WhitelabelFeatureKey` (9 features)
  - `WhitelabelTheme` (8 cores + 2 fontes)
  - `WhitelabelConfig` (config completo do tenant)
  - `TokenomicsItem`, `RoadmapPhase`, `StakePool`, `NFTCollectionItem`, `ReferralTier`
- [x] `DEMO_WHITELABEL_CONFIG` em `src/whitelabel/config.ts` com tema NORTOKEN
- [x] `WhitelabelLayout.tsx`:
  - Sidebar responsiva com 9 items (renderiza só features habilitadas)
  - Header com title da página + Connect Wallet
  - Footer com "Powered by Nortoken · MAZARI CORP"
  - Mobile menu com backdrop
  - CSS custom properties injetadas (preparação multi-tenancy)
- [x] `WhitelabelApp.tsx` container com router state-based
- [x] **9 páginas funcionais:**
  - [x] Home (hero + 4 stats + tokenomics com barra de distribuição + features grid 6 cards)
  - [x] Whitepaper (sidebar com 6 seções + nav prev/next + botão Download PDF)
  - [x] Swap (input from/to + dropdown 3 tokens + slippage presets 0.1/0.5/1/3 + preview)
  - [x] Stake (4 pools 18-120% APR + modal de stake + "meu staked"/"rewards")
  - [x] Referral (link copiável + código + 3 stats + 3 tiers + 4 referrals recentes)
  - [x] Tokenization/Buy NFT (4 NFTs com raridade + progress bar de mint + bundle)
  - [x] Buy Token (USDC on-chain, self-custody + presets 50-1000 USDC)
  - [x] Roadmap (timeline 5 fases com status done/running/pending + progress geral)
  - [x] Lending (Coming Soon Q1 2027 + 3 features preview + form Avise-me)
- [x] Aba "Whitelabel Demo" adicionada na Navigation do Nortoken (ícone Globe)
- [x] Roteamento fullscreen no App.tsx (early return quando `currentTab === 'whitelabel'`)
- [x] Botão "Voltar ao Nortoken" na sidebar do whitelabel
- [x] Teaser no Dashboard ajustado para apontar `setTab('whitelabel')` em vez de premium
- [x] Botão secundário "ou contratar agora →" leva pra Premium Store

### Fase 2.6 — Documentação técnica completa (2026-05-21)

- [x] `README.md` refinado com estado atual + comandos + roadmap
- [x] `CONTEXT.md` criado: regras, design system, lógica de negócio, voz, convenções
- [x] `PROJECT_CONTEXT.md` criado: visão consolidada + status + decisões abertas
- [x] `ARCHITECTURE.md` criado: estrutura, fluxos, decisões, schema futuro
- [x] `TODO.md` criado: este arquivo
- [x] `CLAUDE.md` criado: pacote portátil pra IA em qualquer máquina

---

## ❌ Pendente para pleno funcionamento

> "Pleno funcionamento" = plataforma rodando em produção com clientes reais lançando tokens de verdade.

### 🔴 Fase 3 — Backend real (Neon Postgres + Drizzle ORM)

**Por quê:** atualmente tudo é simulado via state + localStorage. Pra ter clientes reais precisamos persistir users, tokens, pedidos, configurações.

- [ ] Criar projeto Neon Postgres dedicado para NORTOKEN
- [ ] Setup Drizzle ORM no monorepo (`lib/db` já existe — verificar se compartilha)
- [ ] Schema inicial (ver `ARCHITECTURE.md` seção Schema):
  - [ ] `users` (id, email, wallet_address, role)
  - [ ] `tokens` (id, owner_user_id, name, symbol, contract_address, network, ...)
  - [ ] `orders` (pedidos de serviços premium/enterprise)
  - [ ] `transactions` (log on-chain)
- [ ] Migrations iniciais (`drizzle-kit generate` + `migrate`)
- [ ] API server (em `artifacts/api-server`) com endpoints REST/tRPC:
  - [ ] `POST /api/users/register`
  - [ ] `POST /api/auth/login`
  - [ ] `GET /api/me`
  - [ ] `POST /api/tokens` (criar token)
  - [ ] `GET /api/tokens` (listar — com filtros)
  - [ ] `GET /api/tokens/:id`
  - [ ] `POST /api/orders` (contratar serviço)
- [ ] Sessão (`express-session` + `connect-pg-simple`)
- [ ] Validação de input com `zod` (lib `api-zod` já existe no monorepo)
- [ ] Substituir `INITIAL_TOKENS` (mock) por fetch real da API no frontend
- [ ] Migrar localStorage do onboarding pra DB

**Estimativa:** 3-4 dias

---

### 🔴 Fase 4 — Painel Administrativo MAZARI

**Por quê:** equipe MAZARI precisa gerenciar pedidos, mudar valores das etapas, ver clientes, validar pagamentos, etc.

- [ ] Rota `/admin/login` (separada do AdminPanel atual que é "auditor")
- [ ] Auth admin com email + senha (hash bcrypt)
- [ ] Tabela `admin_users` com role
- [ ] Painel admin com sidebar:
  - [ ] Dashboard (overview: tokens deployados, pedidos pendentes, MRR, etc.)
  - [ ] **Clientes** (lista + busca + perfil individual)
  - [ ] **Pedidos** (lista por status: pending, paid, in_progress, completed, cancelled)
  - [ ] **Valores das etapas** (CRUD — admin pode mudar preço de cada item do Enterprise package sem deploy)
  - [ ] **Serviços avulsos** (CRUD do PREMIUM_SERVICES)
  - [ ] **Tokens** (lista + verificação manual + airdrop simulado)
  - [ ] **Whitelabel projects** (lista de tenants ativos + status)
  - [ ] **Pagamentos** (logs + ação "marcar como pago manualmente")
  - [ ] **Logs do sistema** (auditoria de mudanças)
- [ ] Permissões granulares (super_admin vs operator)
- [ ] Audit log de tudo que admin altera

**Estimativa:** 2-3 dias

---

### 🔴 Fase 5 — Pagamento on-chain em USDC (sem fiat)

**Por quê:** sem isso, nenhum cliente consegue contratar de verdade.

> **Decisão (regulatória):** pagamento **exclusivamente em USDC on-chain**, self-custody. **Sem PIX, Mercado Pago, boleto ou qualquer trilho fiat** — para blindar a Nortoken da regulação de meios de pagamento (Bacen) e de valores mobiliários (CVM). Token próprio "NORTH" foi **descartado** pelo mesmo motivo.

#### USDC (EVM-first: Base/Polygon)
- [ ] Carteiras receptoras (tesouro) MAZARI por rede EVM
- [ ] Endpoint `POST /api/orders/:id/usdc-intent`
  - [ ] Retorna endereço do tesouro + valor em USDC + referência
- [ ] Listener on-chain (Alchemy/dRPC) que monitora transferências de USDC
- [ ] Validação automática quando a tx de USDC confirma o valor esperado
- [ ] Atualizar `orders.status = 'paid'` e disparar email (Resend)

#### UI
- [ ] Checkout do Premium Store já é **USDC-only** (feito no sandbox) — ligar ao recebimento real
- [ ] Status "Aguardando pagamento" no Dashboard com confirmação on-chain
- [ ] Após confirmação: notificação + libera próxima etapa

**Estimativa:** 3-4 dias

---

### 🔴 Fase 6 — Wallet Web3 real + Deploy on-chain

**Por quê:** atualmente a wallet é fake (`NoRtOkEn...`) e o deploy é mockado. Pra plataforma "fazer o que promete" precisa conectar carteira de verdade e deployar tokens reais.

#### Wallet
- [ ] Decidir: Privy vs WalletConnect vs RainbowKit
- [ ] Instalar SDK escolhida
- [ ] Substituir wallet simulada por wallet real:
  - [ ] `connectWallet()` → abre modal Privy/WalletConnect
  - [ ] `wallet.address` vem da carteira real
  - [ ] `wallet.solBalance` lê via RPC Solana ou EVM
- [ ] Persistir wallet em `users.wallet_address`

#### Deploy de token Solana
- [ ] `@solana/web3.js` + `@solana/spl-token`
- [ ] Função `deployTokenSolana(params)`:
  - [ ] Cliente assina transação que cria mint
  - [ ] Set initial supply para wallet do cliente
  - [ ] Salva contract address no DB
- [ ] Validação: confirmar tx on-chain antes de marcar `status = 'completed'`
- [ ] Suporte a metadata Metaplex (logo, descrição on-chain)

#### Deploy de token EVM
- [ ] `viem` + `wagmi`
- [ ] Smart contract ERC-20 padronizado (auditado)
- [ ] Função `deployTokenEvm(network, params)`:
  - [ ] Network: Ethereum, Polygon, BSC, Base
  - [ ] Deploy via cliente (cliente paga gas)
- [ ] Verificar contrato no Etherscan/Polygonscan automaticamente

#### NFT Collection
- [ ] Padrão ERC-721 (EVM) ou Metaplex NFT (Solana)
- [ ] Função de deploy + mint em batches
- [ ] IPFS para storage de metadata e imagens (Pinata ou web3.storage)

#### Stake e Referral on-chain
- [ ] Contratos Stake (audited templates)
- [ ] Contrato de Referral com tracking de níveis
- [ ] Deploy opcional por cliente (Enterprise)

**Estimativa:** 1-2 semanas

---

### 🔴 Fase 7 — Configurador Whitelabel + Multi-tenant real

**Por quê:** hoje o whitelabel só roda com `DEMO_WHITELABEL_CONFIG`. Pra cliente ter SEU whitelabel próprio precisa:
1. Configurar via painel
2. Persistir no DB
3. Renderizar dinamicamente por URL/slug

#### Configurador (painel do cliente)
- [ ] Nova aba "Meu Whitelabel" no Nortoken (visível só pra quem comprou)
- [ ] Form com seções:
  - [ ] **Branding:** upload de logo (R2/Cloudinary), color picker (primary/secondary), seletor de fonte
  - [ ] **Features:** 9 toggles ON/OFF (Home sempre ON, outras opcionais)
  - [ ] **Conteúdo:**
    - Tokenomics (drag-and-drop pra reordenar, edição de % e cores)
    - Roadmap (CRUD de fases e items)
    - Whitepaper (editor markdown)
    - Stake pools (CRUD)
    - NFT collection (CRUD com upload de imagens)
    - Referral tiers (% por nível)
    - Socials (links)
  - [ ] **Token:** seleção do token deployado
  - [ ] **Slug:** define `<slug>` da URL `/p/<slug>`
- [ ] Preview live (renderiza `<WhitelabelApp config={preview}>` em iframe ou em side panel)
- [ ] Botão "Publicar" → salva no DB → URL pública fica ativa

#### Backend multi-tenant
- [ ] Tabelas: `projects`, `project_branding`, `project_features`, `project_content`, `stake_positions`, `referrals` (ver `ARCHITECTURE.md`)
- [ ] Endpoint `GET /api/projects/:slug` retornando `WhitelabelConfig` completo
- [ ] Storage de imagens (logo, NFTs, hero video):
  - [ ] Decidir: Cloudinary, Supabase Storage, R2, ou outra
  - [ ] Endpoint `POST /api/projects/:slug/upload`
- [ ] Validação de slug (não conflitar com paths internos do Nortoken)

#### Rota dinâmica
- [ ] Adicionar **React Router** pro Nortoken (apenas pra rota `/p/:slug`)
- [ ] `nortoken.mazaricorp.com/p/<slug>` → busca config no DB → renderiza `<WhitelabelApp config={dbConfig}>`
- [ ] Loading state enquanto config carrega
- [ ] 404 se slug não existir

#### Subdomain wildcard (futuro)
- [ ] DNS wildcard `*.nortoken.mazaricorp.com` (Render Pro plan ou CloudFront)
- [ ] Middleware no Express que detecta subdomain e roteia
- [ ] Cliente pode escolher subdomain ou path-based

**Estimativa:** 1-2 semanas

---

### 🔴 Fase 8 — Deploy produção

**Por quê:** sem isso, ninguém acessa.

- [ ] Decidir tipo de service no Render (Web Service vs Static)
- [ ] **Web Service** (recomendado): permite endpoint `/api/copilot` no mesmo deploy
- [ ] Adicionar `nortoken` no `render.yaml`:
  ```yaml
  - type: web
    name: nortoken
    runtime: node
    buildCommand: corepack enable && pnpm install --frozen-lockfile && pnpm --filter @workspace/nortoken run build
    startCommand: pnpm --filter @workspace/nortoken run start
    envVars:
      - GEMINI_API_KEY (sync from group)
      - DATABASE_URL
      - SESSION_SECRET
      - APP_URL=https://nortoken.mazaricorp.com
  ```
- [ ] Configurar DNS CNAME `nortoken.mazaricorp.com` → `<service>.onrender.com`
- [ ] SSL automático (Render padrão)
- [ ] Adicionar headers de segurança (CSP, HSTS, etc.)
- [ ] Health check endpoint
- [ ] Sentry ou similar pra error tracking
- [ ] Backup automático do Neon (built-in plan Launch+)

**Estimativa:** 1 dia

---

### 🟡 Melhorias técnicas (em paralelo / pós-Fase 8)

#### Performance
- [ ] Code splitting do Whitelabel (carregamento sob demanda)
- [ ] Lazy loading dos componentes pesados
- [ ] Image optimization (Vite plugin ou Sharp no build)
- [ ] Bundle analysis (vite-plugin-visualizer)

#### Qualidade
- [ ] **Testes E2E** com Playwright para fluxos críticos:
  - [ ] Cadastro de cliente
  - [ ] Criação de token (sandbox)
  - [ ] Contratação de serviço premium
  - [ ] Configuração de whitelabel
  - [ ] Pagamento em USDC (mock da confirmação on-chain)
- [ ] **Testes de componente** com Vitest pra utils
- [ ] **CI/CD** no GitHub Actions:
  - [ ] Lint + typecheck em PR
  - [ ] Testes automáticos
  - [ ] Deploy automático pro Render em push na main

#### Observabilidade
- [ ] **Logs estruturados** (winston ou pino)
- [ ] **Métricas:** tempo de resposta da API, taxa de erro, conversão
- [ ] **Analytics:** Posthog ou Plausible (sem cookies invasivos)

#### Segurança
- [ ] Rate limiting (express-rate-limit já no monorepo)
- [ ] CORS configurado por ambiente
- [ ] Validação de entrada em todos os endpoints
- [ ] Sanitização de markdown (DOMPurify) no whitepaper
- [ ] CSP headers
- [ ] Audit de deps (`pnpm audit` mensal)

#### UX
- [ ] **Tema claro** opcional (atualmente só dark)
- [ ] **Internacionalização** (PT-BR / EN / ES) — i18next
- [ ] **Acessibilidade** WCAG AA (a11y) — atualmente não testado
- [ ] **Onboarding melhorado** com tooltips

---

### 🟢 Pequenos itens / polimento

- [ ] Limpar imports não usados (alguns hints do TypeScript)
- [ ] Migrar `import React` legados para new JSX transform (Vite suporta)
- [ ] Adicionar favicon do NORTOKEN (atualmente herda padrão)
- [ ] Meta tags OG para compartilhamento social
- [ ] Robots.txt + sitemap
- [ ] Página 404 customizada
- [ ] Loading skeletons em vez de spinners genéricos
- [ ] Toast notifications (sonner já no monorepo)

---

## 🔄 Em andamento

- [ ] Documentação completa (este conjunto de docs — quase pronto)

---

## ⏸️ Pausado / aguardando decisão do Humberto

- [ ] Definir provider de wallet (Privy / WalletConnect / RainbowKit)
- [ ] Definir storage de imagens (R2 / Cloudinary / Supabase Storage)
- [ ] Confirmar número WhatsApp Business pra CTA "Falar com Especialista"
- [ ] Confirmar fluxo de admin: 1 conta global MAZARI ou múltiplos operadores?

---

## 🐛 Bugs conhecidos

- [ ] Imports legados não usados gerando hints no TypeScript (`React`, `TokenDocument`, `RefreshCw`, etc.) — cosmético
- [ ] `OnboardingFlow` aparece sempre na primeira visita (talvez seja desejável tornar opcional)
- [ ] Sem persistência de `tokens` deployados (só durante a sessão atual) — esperado no MVP, resolvido na Fase 3

---

## 📈 Métricas de sucesso (planejado)

Quando estiver em produção, monitorar:

- **Tokens deployados/mês** (norte: 50+ no primeiro trimestre)
- **Conversão landing → token criado** (norte: > 5%)
- **Conversão Premium Store → contratação** (norte: > 2%)
- **Whitelabels ativos** (norte: 5+ no primeiro semestre)
- **MRR Whitelabel** (US$ 17.5k+ com 5 clientes a US$ 3.5k setup)
- **Receita Enterprise/trimestre** (norte: 2 contratos × US$ 53k = US$ 106k)

---

## 📝 Histórico de mudanças

| Data | Mudança principal |
|---|---|
| 2026-05-21 | Documentação completa criada (README, CONTEXT, PROJECT_CONTEXT, ARCHITECTURE, TODO, CLAUDE) |
| 2026-05-21 | Plataforma Whitelabel demo com 9 páginas (Home, Whitepaper, Swap, Stake, Referral, Tokenization, Buy, Roadmap, Lending) |
| 2026-05-21 | Etapa 1 do Enterprise refinada: "Plataforma Whitelabel & Contratos" (US$ 6.300, total package US$ 53.340) |
| 2026-05-21 | Seção `<Nortoken />` integrada na Home do site MAZARI CORP |
| 2026-05-21 | Pacote Enterprise (5 etapas) adicionado no PremiumStore |
| 2026-05-21 | Migração de `Desktop/NORTHTOKEN` para `artifacts/nortoken/` no monorepo MAZARI |
