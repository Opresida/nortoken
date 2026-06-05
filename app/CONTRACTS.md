# CONTRACTS — NORTOKEN

Especificação de todos os smart contracts (EVM e Solana) que o NORTOKEN deployará para cada cliente. Inclui padrões usados, checklist de segurança, audit pipeline e limites de confiança da IA assistente.

---

## 🧭 Visão geral

O NORTOKEN não escreve contratos do zero. **Base = OpenZeppelin / ERC721A / Metaplex** (já auditados e battle-tested). Customizamos parâmetros e adicionamos hooks específicos do projeto.

### Matriz de contratos por plano

| Contrato | Core (deploy básico) | Whitelabel | Enterprise |
|---|---|---|---|
| Token ERC-20 / SPL | ✅ | ✅ | ✅ |
| NFT Collection | ❌ | ✅ (opcional via toggle) | ✅ |
| Stake | ❌ | ✅ (opcional via toggle) | ✅ |
| Referral | ❌ | ✅ (opcional via toggle) | ✅ |
| Vesting | ❌ | ❌ | ✅ (sob demanda) |
| Lending (Q1 2027) | ❌ | 🔮 | 🔮 |

---

## ⛓️ Camada EVM (Ethereum, Polygon, BSC, Base)

### 1. NortokenERC20

**Propósito:** Token fungível do projeto.

**Base:** OpenZeppelin `ERC20` + extensões opcionais por plano.

**Extensões padrão (todos os planos):**
- `Ownable2Step` — propriedade transferível com confirmação (segurança vs Ownable direto)
- `Pausable` — circuit breaker em caso de emergência
- `ERC20Burnable` — holders podem queimar seus próprios tokens

**Extensões opcionais (Whitelabel/Enterprise):**
- `ERC20Permit` (EIP-2612) — gasless approvals via assinatura off-chain
- `ERC20Votes` — para projetos com governança DAO
- `ERC20Capped` — supply máximo imutável após deploy

**Parâmetros configuráveis no deploy:**
```solidity
constructor(
    string memory name,           // "Nortoken Demo"
    string memory symbol,         // "NORTKN"
    uint256 initialSupply,        // 100_000_000 * 1e18
    uint256 maxSupply,            // 0 = unlimited, else cap
    bool mintableAfterDeploy,     // owner pode mintar depois?
    bool burnable,                // holders podem queimar?
    address initialOwner          // cliente
)
```

**Funções principais:**
- `mint(address to, uint256 amount)` — só owner, só se `mintableAfterDeploy = true`
- `burn(uint256 amount)` — qualquer holder
- `pause() / unpause()` — só owner (emergência)
- `transferOwnership(address newOwner)` — 2-step

**Segurança:**
- ✅ Reentrancy: ERC20 transfers não são reentrant por design (sem callback externo)
- ✅ Integer overflow: Solidity 0.8.27+ tem checks nativos
- ✅ Access control: Ownable2Step previne perda acidental de ownership
- ✅ Frontrunning approve: usar `increaseAllowance` / `decreaseAllowance` ou Permit

---

### 2. NortokenERC721A (NFT Collection)

**Propósito:** Coleção de NFTs (avatars, badges, lifetime access, etc.) com mint em batch ultra-eficiente.

**Base:** [Azuki ERC721A](https://www.erc721a.org/) — gas ~70% menor que ERC721 padrão pra mint múltiplo.

**Extensões:**
- `ERC721ABurnable`
- `ERC2981` — Royalty padrão (cliente define %)
- `Ownable2Step`
- `Pausable`

**Modos de venda configuráveis:**
```solidity
enum SaleMode {
    Closed,           // ninguém mint
    AllowlistOnly,    // só endereços em merkle proof
    Public,           // todos podem
    Free              // mint sem custo (só gas)
}
```

**Parâmetros:**
```solidity
struct CollectionConfig {
    string name;
    string symbol;
    string baseURI;              // IPFS metadata
    uint256 maxSupply;
    uint256 maxPerWallet;
    uint256 pricePublic;         // wei
    uint256 priceAllowlist;      // wei
    bytes32 merkleRoot;          // allowlist root
    uint96 royaltyBps;           // ex: 500 = 5%
    address royaltyReceiver;
    SaleMode saleMode;
}
```

**Funções principais:**
- `mintPublic(uint256 quantity)` — `payable`
- `mintAllowlist(uint256 quantity, bytes32[] calldata proof)` — `payable`
- `mintReserve(address to, uint256 quantity)` — só owner (reservar pra team/giveaway)
- `setSaleMode(SaleMode mode)` — só owner
- `setBaseURI(string calldata newURI)` — só owner
- `withdraw()` — só owner

**Segurança:**
- ✅ Reentrancy: `ReentrancyGuard` em mints públicos (já que aceita ETH)
- ✅ Merkle proof: previne replay com `mintedAllowlist[address] += quantity`
- ✅ Supply cap: enforced no `_mint`
- ⚠️ **Token URI revealed/unrevealed:** opcional pra prevenir rarity sniping

---

### 3. StakingPool

**Propósito:** Lock de tokens com APR fixo por duração, recompensas em ${TOKEN} ou em token separado.

**Base:** Inspiração em [Synthetix StakingRewards](https://github.com/Synthetixio/synthetix/blob/master/contracts/StakingRewards.sol) (battle-tested) + lock period.

**Modelos suportados:**

#### a) Pool com lock period fixo (mais simples — usado no Whitelabel demo)

```solidity
struct Pool {
    uint256 lockDuration;        // 30, 90, 180, 365 dias em segundos
    uint256 aprBps;              // 1800 = 18% APR
    uint256 minStake;
    uint256 totalStaked;
    bool active;
}

struct Position {
    uint256 amount;
    uint256 stakedAt;
    uint256 lastClaim;
    uint256 poolId;
}
```

**Funções:**
- `stake(uint256 poolId, uint256 amount)`
- `unstake(uint256 positionId)` — só após `lockDuration`
- `claimRewards(uint256 positionId)`
- `pendingRewards(uint256 positionId)` — view

#### b) Pool variável APR (rewards rate em tempo real — mais complexo, Enterprise only)

Baseado em `StakingRewards` clássico: `rewardPerToken = totalRewards / totalStaked` recalculado a cada interação.

**Segurança:**
- ✅ `ReentrancyGuard` em todas as funções state-changing
- ✅ Checks-effects-interactions pattern
- ⚠️ **Reward source:** owner deposita upfront ou contrato mint próprio (depende do plano do cliente)
- ⚠️ **Slashing/early unstake:** decidir penalty (default: bloqueado até unlock, alternative: 50% slash com claim parcial)
- ⚠️ **Reward math overflow:** usar SafeMath ou Solidity 0.8.27+ checked arithmetic

---

### 4. ReferralTracker

**Propósito:** Tracking de indicações em 3 níveis com claim de comissão em ${TOKEN}.

**Estrutura:**

```solidity
struct Referrer {
    address referredBy;          // quem indicou esse usuário
    uint256 totalEarned;
    uint256 unclaimed;
    uint256 directReferrals;     // contagem nível 1
    uint256 indirectReferrals;   // contagem nível 2-3
}

mapping(address => Referrer) public referrers;

// Comissões em bps (basis points)
uint256[3] public commissionTiers; // [1000, 500, 200] = 10%, 5%, 2%
```

**Funções principais:**
- `registerReferral(address newUser, address referrer)` — só callable pelo contrato Buy/Stake
- `recordPurchase(address buyer, uint256 amount)` — distribui comissão pros 3 níveis acima
- `claim()` — saca comissão acumulada
- `setCommissionTiers(uint256[3] calldata tiers)` — só owner

**Segurança:**
- ✅ Loop limitado a 3 níveis (sem risco de gas explosion)
- ✅ `nonReentrant` no `claim()`
- ⚠️ **Sybil attack:** sem KYC, usuários podem criar wallets fake — mitigar via cooldown ou min compra
- ⚠️ **Circular reference:** impedir A indica B indica A — check `referredBy != newUser`

---

### 5. Vesting (Enterprise, sob demanda)

**Propósito:** Liberação gradual de tokens pra time, investors ou advisors.

**Base:** OpenZeppelin `VestingWallet`.

**Tipos:**
- **Linear** — libera proporcional ao tempo
- **Cliff + Linear** — período morto inicial, depois libera linear
- **Step** — libera em "marcos" (ex: 25% a cada 6 meses)

**Parâmetros:**
```solidity
struct VestingSchedule {
    address beneficiary;
    uint64 startTimestamp;
    uint64 cliffDuration;
    uint64 vestingDuration;
    uint256 totalAmount;
    uint256 released;
    bool revocable;
}
```

**Funções:**
- `release()` — beneficiary saca o que está vested
- `revoke(uint256 scheduleId)` — owner cancela schedule revogável (recupera tokens unvested)

**Segurança:**
- ✅ Cálculo de released vs vested usa math segura
- ⚠️ **Revoke pode ser perigoso politicamente** — desabilitar pra schedules de team

---

## 🌐 Camada Solana

### 1. Token Mint (SPL Token)

**Propósito:** Token fungível padrão Solana.

**Não é Solidity** — usa o programa SPL Token nativo (já deployado e auditado pela Solana Foundation).

**Criação via TS:**
```typescript
import { createMint, mintTo } from '@solana/spl-token';

const mint = await createMint(
  connection,
  payer,                    // cliente paga
  mintAuthority.publicKey,  // quem pode mintar
  freezeAuthority.publicKey,// quem pode congelar (geralmente null pra descentralizar)
  9                          // decimals
);
```

**Metadata via Metaplex:**
```typescript
import { createMetadataAccountV3 } from '@metaplex-foundation/mpl-token-metadata';
// associa name, symbol, URI da imagem, atributos
```

**Segurança:**
- ✅ SPL Token program é o padrão (auditado, usado por bilhões em TVL)
- ⚠️ **Authorities:** decidir se `mintAuthority` fica com cliente ou é setada pra `null` (supply fixo permanente)
- ⚠️ **Freeze authority:** geralmente desligar pra evitar centralização

---

### 2. NFT Collection (Metaplex Core / Token Metadata)

**Propósito:** Coleção de NFTs Solana.

**Base:** [Metaplex Core](https://developers.metaplex.com/core) (mais novo, ~85% menos gas que Token Metadata legacy).

**Estrutura:**
- 1 Collection NFT (representa a coleção)
- N NFTs individuais linkados à collection

**Vantagens vs EVM:**
- Custo de mint: ~$0.001 por NFT (vs ~$5-20 em ERC721A)
- Sem aprovação necessária pra transferir (mais UX-friendly)

**Segurança:**
- ✅ Metaplex é o padrão da Solana
- ⚠️ **Metadata mutável vs imutável:** decidir no deploy (imutável = mais confiável, mutável = mais flexível)

---

### 3. Stake Program (Anchor)

**Propósito:** Equivalente Solana do StakingPool EVM.

**Base:** Escrito em Rust com Anchor framework. Não há "template OpenZeppelin" oficial pra Solana — geralmente forka programas conhecidos.

**Forks de referência:**
- [Jupiter Locked Voter](https://github.com/jup-ag/jup-lock) — stake com lock period
- [Saber Tribeca](https://github.com/TribecaProtocol/tribeca) — staking com governance

**Estrutura típica:**

```rust
#[account]
pub struct Pool {
    pub authority: Pubkey,
    pub mint: Pubkey,
    pub lock_duration: i64,
    pub apr_bps: u64,
    pub total_staked: u64,
    pub bump: u8,
}

#[account]
pub struct Position {
    pub owner: Pubkey,
    pub pool: Pubkey,
    pub amount: u64,
    pub staked_at: i64,
    pub bump: u8,
}
```

**Funções (instructions Anchor):**
- `initialize_pool(lock_duration, apr_bps)`
- `stake(amount)`
- `unstake(position_id)`
- `claim_rewards(position_id)`

**Segurança Solana-específica:**
- ✅ PDA (Program Derived Address) ao invés de mapping — mais seguro
- ✅ Anchor faz validações de owner/signer automaticamente
- ⚠️ **Rent exemption** — accounts devem ter SOL pra existir
- ⚠️ **Compute budget** — 200k CU default, pode precisar aumentar

---

### 4. Referral Program (Anchor)

**Propósito:** Mesmo conceito do EVM, adaptado pra Solana.

**Diferenças vs EVM:**
- Cada referral é uma PDA própria (não mapping)
- Comissão distribuída via CPI (Cross-Program Invocation) pro Token Program

---

## 🛡️ Audit Pipeline

### Pre-deploy (sempre)
1. **Static analysis:**
   - Slither (Solidity) — detecta reentrancy, uninitialized storage, etc.
   - Mythril (Solidity) — simbólica execution
   - cargo-clippy + cargo-audit (Solana Rust)
2. **Unit tests + fuzzing:**
   - Foundry com 100k+ runs (`forge test --fuzz-runs 100000`)
   - Echidna property-based testing (Solidity)
   - Anchor testing framework (Solana)
3. **Manual review interna:**
   - Code walkthrough seguindo [Trail of Bits Smart Contract Audit Checklist](https://secure-contracts.com/)
   - SWC Registry (Smart Contract Weakness Classification) — verificar SWC-100 a SWC-136

### Pre-mainnet (Enterprise mandatório, Whitelabel recomendado)
4. **Testnet 2-4 semanas:**
   - Sepolia (Ethereum), Mumbai (Polygon), Solana Devnet
   - Monitorar via Tenderly / Hellomoon
5. **External audit profissional:**
   - **Certik** (já incluso na Etapa 2 do Enterprise, US$ 4.200)
   - Alternativas: Trail of Bits, OpenZeppelin Defender, Halborn, Hacken
6. **Bug bounty:**
   - Immunefi com US$ 5-10k pool por 30 dias
   - Scope: contracts + frontend signing logic

### Pós-deploy
7. **Monitoring contínuo:**
   - Tenderly alerts pra eventos anormais
   - Forta Network (free) pra detectar comportamento suspeito
   - OpenZeppelin Defender Sentinel (paid)

---

## 🚀 Deploy Pipeline

### Testnet
```bash
# EVM
forge script DeployToken.s.sol --rpc-url $SEPOLIA_RPC --broadcast --verify

# Solana
anchor deploy --provider.cluster devnet
```

### Mainnet (com governance)
1. **Multisig setup:**
   - Safe (EVM) com 3-de-5 signers
   - Squads (Solana) equivalente
2. **Timelock:**
   - Mudanças críticas (mint authority, treasury) passam por delay de 48h
3. **Verificação automática:**
   - `forge script ... --verify` envia source pro Etherscan
   - `anchor verify` envia pra Solana Explorer

### Checklist final pré-mainnet
- [ ] Audit externo aprovado
- [ ] Testnet rodando há ≥ 2 semanas sem incidentes
- [ ] Multisig configurado e testado
- [ ] Documentação pública (whitepaper, docs)
- [ ] Bug bounty ativo no Immunefi
- [ ] Monitoring + alertas configurados
- [ ] Plano de incident response documentado
- [ ] Insurance protocol opcional (Nexus Mutual, InsurAce)

---

## 🧠 Knowledge Limits da IA (Claude)

Transparência sobre onde eu sou confiável vs onde preciso de revisão humana:

| Área | Nível de confiança | Mitigation |
|---|---|---|
| **ERC-20 padrão com extensões OpenZeppelin** | 🟢 Alto | Posso entregar direto |
| **ERC-721A com merkle allowlist + EIP-2981** | 🟢 Alto | Posso entregar direto |
| **Staking com lock period fixo** | 🟢 Alto | Posso entregar, recomendo testar extensivamente |
| **Stake com APR variável (Synthetix-style)** | 🟡 Médio | Posso entregar mas precisa review de matemática por humano |
| **Referral 3-tier** | 🟢 Alto | Posso entregar direto |
| **Vesting OpenZeppelin** | 🟢 Alto | Posso entregar direto |
| **SPL Token + Metaplex** | 🟢 Alto | Posso entregar (parte mais simples do Solana) |
| **Anchor Stake program** | 🟡 Médio | Posso entregar mas com mais iteração que EVM |
| **Cross-chain bridge** | 🔴 Baixo | **Recomendo evitar** ou usar LayerZero/Wormhole apenas como cliente |
| **MEV-resistant patterns** | 🟡 Médio | Conheço conceitos, recomendo padrões prontos (CoW Swap, Flashbots) |
| **Gas optimization extremo (Yul/assembly)** | 🔴 Baixo | Use templates já otimizados (Seaport, Uniswap V3) |
| **Auditoria como serviço** | 🔴 Não substitui | Sempre audit externo antes de mainnet com valor |
| **Detecção de exploits zero-day** | 🔴 Não fazemos | Bug bounty + monitoring contínuo |

### Como expandir minhas capacidades nas áreas 🟡 🔴

Salvar em `nortoken/docs/refs/`:
- `gas-optimization.md` — Yul cheatsheet, comparações de contratos otimizados
- `mev.md` — Flashbots/MEV-Share docs + post-mortems
- `cross-chain.md` — LayerZero V2 + post-mortems Ronin/Wormhole/Nomad
- `audit-mindset.md` — Trail of Bits checklists + Code4rena top findings
- `solana-deep.md` — Programas Solana avançados (Saber, Jupiter, Marinade)

Após criar esses MDs, atualizar `CLAUDE.md` com:
> "Ao trabalhar em smart contracts, ler primeiro `docs/refs/*.md`"

---

## 📂 Arquivos relacionados

- [README.md](./README.md) — pitch, comandos, roadmap
- [ARCHITECTURE.md](./ARCHITECTURE.md) — estrutura técnica, schema DB futuro
- [TODO.md](./TODO.md) — Fase 6 (Smart contracts + Web3) detalhada
- [CLAUDE.md](./CLAUDE.md) — pacote de contexto pra IA
