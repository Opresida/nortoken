# PROJECT_CONTEXT — NORTOKEN

Visão consolidada do projeto. Atualizado a cada feature aprovada.

---

## 🎯 O que é

NORTOKEN é a **rampa de lançamento Web3 da MAZARI CORP** com foco em bioeconomia amazônica. Plataforma multi-camada:

1. **Site marketing público** em `nortoken.mazaricorp.com` (futuro)
2. **App simulado sandbox** com 7 tabs (Landing, Tokenize, Dashboard, Marketplace, Premium, Whitelabel, Admin)
3. **Plataforma Whitelabel multi-tenant** com 9 páginas customizáveis por cliente
4. **Pacote Enterprise** em 5 etapas (US$ 53.340 total) vendido via consultoria
5. **Seção promocional** dentro do site MAZARI CORP linkando pra cá

**Domínio de produção:** `nortoken.mazaricorp.com` *(a configurar — DNS CNAME apontando pro Render)*
**Path do projeto:** `mazari-corp/artifacts/nortoken/`
**Workspace package:** `@workspace/nortoken`

---

## 🧱 Stack consolidada

| Camada | Tecnologia | Por quê |
|---|---|---|
| Linguagem | TypeScript 5.8+ | Type safety + alinhamento com monorepo |
| Framework | React 19 | Versão mais recente, hook-first |
| Build | Vite 7 (catalog do monorepo) | HMR rápido, esbuild interno |
| Estilo | TailwindCSS 4 + plugin Vite | Sem PostCSS, build mais rápido |
| Animação | Motion (sucessor Framer Motion) | API limpa, performance |
| Ícones | Lucide React | Consistência com MAZARI CORP |
| Server | Express 4 + tsx (dev) + esbuild bundle (prod) | Server-side Gemini sem expor API key |
| IA | `@google/genai` (Gemini Flash) | Co-pilot de tokenomics |
| Persistência atual | localStorage (sandbox) | MVP rápido sem backend |
| Persistência futura | Neon Postgres + Drizzle ORM | Padrão MAZARI (IDASAM, HCARE, CVI) |

---

## 🏗️ Arquitetura e padrões

- **Tab-based router:** sem React Router. `App.tsx` tem state `currentTab` e renderiza condicionalmente
- **Whitelabel é fullscreen:** quando `currentTab === 'whitelabel'`, retorna `<WhitelabelApp />` sem o resto da estrutura do Nortoken
- **Sem backend ainda:** tudo simulado via state + localStorage. Backend (Fase 3) vai usar Neon + Drizzle igual outros projetos MAZARI
- **Multi-tenancy planejada:** `WhitelabelConfig` é a fonte única de verdade — quando vier do DB, será persistida por projeto/slug
- **Server-side IA:** chave Gemini fica no `.env` do servidor, nunca exposta ao cliente
- **Padrão monorepo:** `package.json` usa `catalog:` pras deps versionadas. Tsconfig herda do `tsconfig.base.json` da raiz

### Estrutura de pastas (resumo)

```
src/
├── App.tsx              # State global + tab router
├── components/          # 8 componentes principais do Nortoken
├── data/mockData.ts     # Tokens, premium services, enterprise package
├── types.ts             # Token, UserWallet, EnterpriseStage etc.
└── whitelabel/          # Plataforma whitelabel multi-tenant
    ├── WhitelabelApp.tsx
    ├── WhitelabelLayout.tsx
    ├── config.ts        # DEMO_WHITELABEL_CONFIG
    ├── types.ts         # WhitelabelConfig, theme, features
    └── pages/           # 9 páginas (Home, Whitepaper, Swap, Stake, etc.)
```

Detalhamento em [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## 🤖 Instruções para a IA (vibe coding)

- Sempre respeitar a paleta NORTOKEN: petroleum/amazon-neon (detalhes em [CONTEXT.md](./CONTEXT.md#design-system))
- Whitelabel usa CSS vars (`var(--wl-primary)`) — nunca hardcodar cores
- Nunca criar backend real até a Fase 3 — manter tudo simulado por enquanto
- `pnpm typecheck` deve passar antes de qualquer "concluído"
- Ao adicionar/remover página do whitelabel, atualizar `WhitelabelConfig.features` em `config.ts`
- Ao adicionar dep, sempre via `catalog:` se já existe no `pnpm-workspace.yaml`
- Ao tocar em UI, testar responsividade em 768px, 540px, 360px
- Atualizar este arquivo após cada feature aprovada

---

## 📊 Status Atual

### ✅ Concluído (2026-05-20 a 2026-05-21)

**Fase 0 — Migração e Setup**
- Migrado de `Desktop/MAZARI HOLDING/NORTHTOKEN` para `mazari-corp/artifacts/nortoken/`
- Package renomeado para `@workspace/nortoken` com deps via catalog
- tsconfig herdando de `tsconfig.base.json`
- Vite config simplificado e alinhado com monorepo
- README, .env.example, metadata.json reescritos com pitch NORTOKEN
- Rodapé "Plataforma exclusiva do grupo MAZARI CORP" no App.tsx
- Backup do Desktop apagado após validação
- `pnpm typecheck` passa em todos os 5 workspaces

**Fase 1 — Pacote Lançamento Enterprise**
- 5 etapas com timeline visual (cyan/amber/emerald/purple/rose)
- Etapa 1 refinada como "Plataforma Whitelabel & Contratos" (US$ 6.300)
- Etapa 2 — Certificação Certik (US$ 4.200)
- Etapa 3 — Abertura NFTs / mercado / AMA (US$ 1.540)
- Etapa 4 — DEX & Liquidez (US$ 25.200)
- Etapa 5 — Marketing & Listagens (US$ 16.100)
- Total: **US$ 53.340** (calculado automaticamente via reduce)
- CTA "Falar com Especialista MAZARI" → WhatsApp
- Aviso de transparência sobre pagamento por marco

**Fase 2 — Seção NORTOKEN no site MAZARI CORP**
- Componente `Nortoken.tsx` em `mazari-corp/src/components/sections/`
- Mockup central simulando UI do app (lista tokens + Co-pilot Gemini)
- 3 pilares: Bioeconomia Amazônica · Co-pilot Gemini · Lançamento Enterprise
- Stats bar: EVM-first · USDC · taxa baixa · self-custody
- CTA "Acessar Nortoken" → abre `nortoken.mazaricorp.com` em nova aba
- Integrado em `Home.tsx` entre Blockchain e PesquisaDesenvolvimento (posição 06)

**Fase 2.5 — Plataforma Whitelabel Demo**
- `WhitelabelConfig` + tema NORTOKEN default em `whitelabel/config.ts`
- `WhitelabelLayout` com sidebar responsiva (9 itens), header com Connect Wallet, footer MAZARI CORP
- `WhitelabelApp` container com router interno state-based
- **9 páginas funcionais:**
  - Home (hero + tokenomics + features grid)
  - Whitepaper (6 seções com sidebar de navegação)
  - Swap (interface Jupiter-style com slippage)
  - Stake (4 pools 18-120% APR + modal de stake)
  - Referral (link copiável + 3 tiers + indicações recentes)
  - Tokenization/Buy NFT (4 NFTs com raridade + bundle)
  - Buy Token (USDC on-chain, self-custody)
  - Roadmap (timeline 5 fases com status)
  - Lending (Coming Soon Q1 2027 com email signup)
- Aba "Whitelabel Demo" adicionada na Navigation do Nortoken
- Roteamento fullscreen no `App.tsx` (early return quando `currentTab === 'whitelabel'`)
- Teaser no Dashboard apontando para Whitelabel Demo com fallback "ou contratar agora →" pra Premium Store
- CSS custom properties (`--wl-*`) preparam multi-tenancy

### 🟡 Em andamento / Aguardando decisão
- Documentação técnica completa do projeto (este arquivo + irmãos)

### ❌ Pendente para pleno funcionamento
Lista completa e priorizada em [TODO.md](./TODO.md). Resumo macro:

| Fase | Entrega | Estimativa |
|---|---|---|
| 3 | Backend Neon + auth real | 3-4 dias |
| 4 | Painel admin com CRUD de valores | 2-3 dias |
| 5 | Pagamento on-chain em USDC (self-custody, sem fiat) | 3-4 dias |
| 6 | Wallet Web3 real (Privy) + deploy on-chain | 1-2 semanas |
| 7 | Configurador Whitelabel + rota `/p/<slug>` | 1-2 semanas |
| 8 | Deploy Render + DNS | 1 dia |

---

## 🔑 Decisões já tomadas

- ✅ Stack TypeScript + React 19 + Vite 7 + Tailwind 4
- ✅ Monorepo pnpm da MAZARI CORP (artifacts/nortoken)
- ✅ Neon Postgres + Drizzle (padrão MAZARI) para Fase 3+
- ✅ Pagamento: **USDC on-chain apenas** (self-custody). **Sem PIX/fiat/Mercado Pago/Stripe** — blindagem CVM/Bacen. Token próprio "NORTH" descartado (risco de valor mobiliário).
- ✅ Custódia: cliente assina sempre com própria carteira (self-custody)
- ✅ Co-pilot Gemini mantido (foco amazônico)
- ✅ Pitch híbrido: bioeconomia amazônica + 5 etapas Enterprise como upsell
- ✅ Whitelabel multi-tenant em `nortoken.mazaricorp.com/p/<slug>`
- ✅ Identidade visual: petroleum/amazon-neon (NORTOKEN), com rodapé MAZARI CORP

## 🤔 Decisões abertas

- ❓ Provider de auth Web3: Privy vs WalletConnect vs ambos
- ❓ Quem cria o app no Meta for Developers (cliente vs MAZARI) — relevante quando integrar Instagram
- ❓ Estratégia de gerenciamento de upload de logos: Cloudinary, Supabase Storage, R2, ou Neon row blob
- ❓ Subdomain wildcard (`<slug>.nortoken.mazaricorp.com`) é Fase 7 ou só futuro?
- ❓ WhatsApp Business para CTA "Falar com Especialista MAZARI" — número definido?

---

## 📂 Arquivos de Documentação

| Arquivo | Propósito |
|---|---|
| `README.md` | Pitch, instalação, comandos, roadmap resumido |
| `CONTEXT.md` | Regras, design system, lógica de negócio, voz |
| `PROJECT_CONTEXT.md` | Este arquivo — visão consolidada e status |
| `ARCHITECTURE.md` | Estrutura de pastas, fluxos de dados, decisões técnicas |
| `TODO.md` | Concluído + pendente detalhado por fase |
| `CLAUDE.md` | Pacote de contexto portátil para Claude Code em qualquer máquina |

---

## 👥 Time

- **Humberto** — product, strategy, decisões executivas, plano Claude Max
- **Claude (Anthropic Sonnet/Opus)** — engineering, implementação, validação
- **Danton** — engineering externo do MAZARI (Solana focus) *(não envolvido diretamente no NORTOKEN hoje)*

Comunicação: direta, iterativa, decisões compartilhadas. PT-BR.
