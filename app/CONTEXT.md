# CONTEXT — NORTOKEN

Regras, stack, design system e lógica de negócio. **Leia antes de fazer qualquer alteração.**

---

## 🟢 Atualização 2026-06-10 (on-chain real + regras novas)

A cópia viva é o repo standalone `Opresida/nortoken` (deploy Vercel) e já opera on-chain na **Base Sepolia** (Privy). Regras que passam a valer:

- **Token e pool são passos separados.** O lançamento (`createToken`) **nunca** cria a pool junto. Pool + lock + renúncia são o **passo 2** no Dashboard. Nunca reacoplar (o lançamento quebra). O lock de LP só existe depois da pool.
- **Lock = compromisso aplicado no passo 2.** Na UI, o toggle do Selo de Confiança é "Compromisso de lock — aplicado ao criar a pool", não "trava no lançamento".
- **Taxa condicional 0,3%:** token sem liquidez travada nasce com fee-on-transfer (capado 5%, honeypot-free); travar a liquidez ao criar a pool **zera** a taxa. Comunicar isso honestamente.
- **Verificação na BaseScan é automática e server-side.** Nunca afirmar "verificado" sem o status real (`Token.verificationStatus`). Chave só no servidor (`ETHERSCAN_API_KEY`); nunca no bundle do cliente.
- **`.env` é gitignored** e a env de prod vive no painel da **Vercel** (não mais Render).

---

## 🎯 Princípios de produto não-negociáveis

### 1. Self-custody sempre
O cliente é **sempre o dono do contrato** do token dele. MAZARI fornece UI, código e suporte, mas nunca custodia. Toda transação de deploy é assinada pela carteira do cliente (MetaMask/WalletConnect).

### 2. Modelo de pricing (fechado 2026-06)

**Fórmula:** `taxa de emissão = máx( PISO , custo_de_rede × (1 + markup) )`
- **PISO = 39 USDC** · **markup = 20%** · **fee de protocolo recorrente = 0,2%** (teto duro 5%).
- Em L2 (Base/Polygon) o custo de rede é centavos → o piso domina e É a margem. Cobramos pela **facilidade** (contrato musculoso, Trust Score, IA), não pelo gás.

**Custo real nosso × preço (deploy de ERC-20 musculoso ~4M gas + infra amortizada ~$2,5/emissão):**

| Rede | Custo real | Cliente paga | Margem |
|---|---|---|---|
| Base | ~$3 | 39 USDC | ~$36 |
| Polygon | ~$2,6 | 39 USDC | ~$36 |
| BNB | ~$10 | 39 USDC | ~$29 |
| Ethereum L1 | ~$190 | ~$229 (×1,2) | ~$38 |

> **O lucro de verdade é o 0,2% recorrente.** Ex: token com $50k de volume/mês → ~$100/mês por token, crescendo com o ecossistema. A taxa de emissão é só a "entrada".

Tudo on-chain em USDC — **sem fiat/PIX**. Receita extra nos **serviços** (site/whitepaper $150/$200, premium $90-450, whitelabel $3.500, enterprise $53.340).

### 3. Posicionamento: launchpad sério, multi-mercado
NORTOKEN não compete em preço com Pump.fun/Bonk. **Diferencial:** contratos **musculosos** (anti-bot, anti-MEV, honeypot-free) + **Trust Score público auditável**. Serve o mercado como um todo (utility, memecoin, RWA, comunidade, gaming, impacto) via `SegmentPreset` — a bioeconomia amazônica é **um nicho/preset**, não a identidade. EVM-first (Base/Polygon); Solana num momento futuro.

### 4. Pagamento por marco no Enterprise
Pacote de US$ 53.340 é dividido em 5 etapas com **pagamento contra entrega validada**. Cliente nunca paga tudo antecipado. Cada etapa tem milestone técnico + relatório.

### 5. Whitelabel como produto, não favor
A Plataforma Whitelabel é o **produto premium de maior margem** (US$ 3.500 setup + recorrente). É o "app dedicado" que dá legitimidade ao projeto do cliente. Multi-tenant: 1 codebase serve N clientes via config no DB.

---

## 🎨 Design System — Paleta NORTOKEN

### Cores principais (Tailwind config + CSS vars do whitelabel)

```css
/* Petroleum (background) */
--petroleum-dark:   #050e18    /* fundo principal */
--petroleum-deep:   #040912    /* mais escuro ainda — gradientes */
--petroleum-card:   #0a1d2e    /* cards e elevações */

/* Amazon Green (accent neon) */
--amazon-neon:      #10b981    /* accent primário — botões, destaques */
--amazon-light:     #34d399    /* hover, brilho */
--amazon-green:     #065f46    /* secundário escuro */
--amazon-forest:    #064e3b    /* tons de fundo verde-escuro */

/* Auxiliares */
--white:            #e5f4ee    /* texto principal sobre fundo escuro */
--accent-yellow:    #fbbf24    /* alertas, "running" status */
--accent-cyan:      #22d3ee    /* info, dados secundários */
--accent-purple:    #a78bfa    /* DEX, financial highlights */
--accent-rose:      #fb7185    /* marketing, alerts */
```

### Whitelabel theme (multi-tenant)

O whitelabel usa **CSS custom properties** injetadas pelo `WhitelabelLayout` baseadas em `config.theme`:

```css
--wl-primary       /* equivalente ao --amazon-neon do tenant */
--wl-primary-soft  /* hover */
--wl-secondary     /* secundário escuro */
--wl-bg            /* background do app */
--wl-card          /* cards */
--wl-deep          /* fundo mais escuro */
--wl-fg            /* texto */
```

Quando um cliente customizar, basta gerar um `WhitelabelConfig.theme` com cores dele — o mesmo código renderiza com a identidade dele. **Nunca hardcodar cores no whitelabel** — sempre via `var(--wl-*)`.

### Tipografia

- **Headings:** `Space Grotesk` (display) ou `Playfair Display` (Nortoken só)
- **Body:** `Inter` (UI), `Lora` (textos longos opcional)
- **Mono:** sistema (`font-mono`) — usado em valores, endereços, badges

### Animações
- Padrão: `motion/react` com `whileInView` + `viewport={{ once: true }}` pra performance
- Easing: `ease-out` ou `cubic-bezier(0.19,1,0.22,1)` (clássico institucional MAZARI)

---

## 📐 Convenções de código

### Estrutura de imports
```ts
// 1. React e libs externas
import { useState } from 'react';
import { motion } from 'motion/react';

// 2. Lucide icons (agrupados)
import { Coins, Sparkles, ArrowRight } from 'lucide-react';

// 3. Imports internos (../, ./, @/)
import { Token } from '../types';
import { DEMO_CONFIG } from './config';
```

### Naming
- **PascalCase** para componentes (`<Dashboard />`)
- **camelCase** para funções, variáveis, hooks
- **SCREAMING_SNAKE_CASE** para constantes module-level (`PREMIUM_SERVICES`, `ENTERPRISE_LAUNCH_PACKAGE`)
- **kebab-case** para IDs de elementos DOM (`#service-card-legal`)

### TypeScript
- Tipos em `src/types.ts` (Nortoken) e `src/whitelabel/types.ts` (Whitelabel)
- Props sempre tipadas via `interface` (não `type` pra props — mais fácil de estender)
- `WhitelabelConfig` é a fonte única de verdade pra customização do tenant

### Tailwind
- Preferir classes utility direto no JSX
- Usar `style={{ }}` para CSS vars dinâmicos (`var(--wl-primary)`)
- **Nunca** instalar plugins novos sem aprovação — TailwindCSS 4 já cobre tudo via plugin Vite

### Server (server.ts)
- Single Express app
- Endpoint `/api/copilot` é o único de produção atual
- Em dev: Vite middleware. Em prod: serve `dist/`
- Porta padrão: `3000` (hardcoded — ajustar via env quando deployar)

---

## 🧠 Lógica de negócio

### Tipos de Token (categoria)
```ts
type TokenCategory =
  | 'bioeconomia'  // óleos, cacau, açaí
  | 'carbono'      // créditos de carbono
  | 'madeira'      // manejo sustentável
  | 'comunidade'   // projetos sociais
  | 'cooperativa'  // produtores locais
  | 'meme'         // meme tokens regionais
  | 'rwa'          // imóveis verdes, ativos reais
  | 'outro';
```

### Fluxo de cliente (atual MVP simulado)

```
1. Visita landing → LandingPage.tsx
2. Onboarding wizard (3 steps) → OnboardingFlow.tsx (apenas 1 vez, salva em localStorage)
3. Conecta wallet simulada → connectWallet() gera endereço fake "NoRtOkEn..."
4. Tokenize → TokenCreator.tsx → handleTokenCreated() salva em state global
5. Vê portfólio → Dashboard.tsx + teaser do Whitelabel
6. Premium Store → contrata serviços ou pacote Enterprise
7. Marketplace → compara com outros tokens, simula trade
8. Whitelabel Demo → navega como se fosse o app dedicado dele
9. Admin (gov) → AdminPanel.tsx pra auditores verificarem tokens
```

### Co-pilot IA (`/api/copilot`)
- Input: `assetName`, `assetCategory`, `draftDescription?`, `location?`, `environmentalGoal?`
- Output: `recommendedSymbol`, `recommendedSupply`, `refinedDescription`, `mathematicalExplanation`, `mockWhitepaperSummary`, `sustainabilityScore`
- Modo simulação ativo se `GEMINI_API_KEY` não definida (resposta determinística para demos)
- Modo real usa `gemini-3.5-flash` com `responseMimeType: 'application/json'` e schema validado

### Whitelabel multi-tenant (planejado)
- URL: `nortoken.mazaricorp.com/p/<slug>` (path-based) ou `<slug>.nortoken.mazaricorp.com` (subdomain wildcard — futuro)
- DB schema:
  - `projects(id, slug, token_id, owner_user_id, plan_tier)`
  - `project_branding(logo_url, primary_color, secondary_color, font, hero_video_url)`
  - `project_features(project_id, feature_name, enabled, config_jsonb)`
  - `project_content(project_id, whitepaper_md, roadmap_jsonb, faq_jsonb)`
- Render dinâmico: `<WhitelabelApp config={dbConfig}>` busca config no DB e injeta no `WhitelabelLayout`

---

## 🚫 Coisas proibidas

- ❌ **Hardcodar cores no whitelabel** — sempre via `var(--wl-*)`. Quebra multi-tenancy.
- ❌ **Custodiar fundos do cliente** — viola princípio #1. Cliente assina sempre.
- ❌ **Mostrar valor "from US$ 54k"** sem contexto de pagamento por etapa
- ❌ **Promete deploy real on-chain** antes da Fase 6 — atualmente é tudo sandbox/simulado
- ❌ **`npm install`** no monorepo — bloqueado por preinstall hook. Sempre `pnpm`
- ❌ **Instalar dep nova sem usar `catalog:`** quando ela já existe no `pnpm-workspace.yaml`
- ❌ **Commitar `.env`** ou qualquer secret — `.env.example` é referência, real vai em Render Secrets
- ❌ **Quebrar typecheck** — `pnpm typecheck` deve passar em todos os 5 workspaces antes de commitar

---

## 🎙️ Voz e copywriting

- **PT-BR direto.** Vocativo "meu amigo" no chat com o Humberto é OK.
- **Sem hype crypto-bro.** "Pode ter edge", não "vai 100x".
- **Honestidade sobre sandbox:** sempre indicar quando é simulado (badge "Demo Sandbox" no app)
- **Bioeconomia em primeiro plano:** sempre mencionar Amazônia, sustentabilidade, comunidades
- **MAZARI CORP como assinatura:** rodapé sempre presente reforçando origem institucional

---

## 📝 Convenções de commit

Padrão Conventional Commits em PT-BR:

```
feat(whitelabel): adiciona pagina de stake com 4 pools
fix(swap): corrige calculo de slippage minimo
refactor(types): extrai EnterpriseStage para arquivo separado
docs(readme): atualiza roadmap com fase 6
chore(deps): bump motion para 12.24
```

Tipos válidos: `feat`, `fix`, `refactor`, `docs`, `chore`, `style`, `test`, `perf`.

---

## 🤖 Regras para IA assistente (Claude)

- **Sempre** rodar `pnpm typecheck` antes de declarar "concluído"
- **Sempre** atualizar `WhitelabelConfig.features` no `config.ts` se adicionar/remover página do whitelabel
- **Nunca** mexer em `pnpm-workspace.yaml` ou `tsconfig.base.json` sem aprovação
- **Nunca** hardcodar URL de produção no código — usar env var `APP_URL`
- **Em dúvida** sobre escopo (avulso vs Enterprise vs Whitelabel), perguntar antes de implementar
- **Quando criar arquivo novo**, garantir que segue convenção de pasta (`components/`, `whitelabel/pages/`, etc.)
