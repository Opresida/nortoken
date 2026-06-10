/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Switch, Route, Redirect, useLocation } from 'wouter';
import { PrivyProvider } from '@privy-io/react-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { baseSepolia } from 'viem/chains';
import Navigation from './components/Navigation';
import LandingPage from './components/LandingPage';
import OnboardingFlow from './components/OnboardingFlow';
import TokenCreator from './components/TokenCreator';
import Dashboard from './components/Dashboard';
import Marketplace from './components/Marketplace';
import PremiumStore from './components/PremiumStore';
import AdminPanel from './components/AdminPanel';
import WhitelabelApp from './whitelabel/WhitelabelApp';
import { AppProvider, useApp } from './state/AppContext';
import { IS_TESTNET } from './onchain/env';
import { Leaf, Info, UserCheck2 } from 'lucide-react';

/** Whitelabel é fullscreen — não usa Navigation/Footer do Nortoken. */
function WhitelabelRoute() {
  const { navigateTab } = useApp();
  return <WhitelabelApp onExitDemo={() => navigateTab('dashboard')} />;
}

/** Casca padrão: banner + navegação + corpo roteado + rodapé. */
function Shell() {
  const {
    wallet,
    tokens,
    showOnboarding,
    navigateTab,
    connectWallet,
    disconnectWallet,
    handleOnboardingComplete,
    handleOnboardingSkip,
    handleTokenCreated,
    handlePoolCreated,
    handleTokenVerification,
    handleAddDocument,
    handleServicePurchased,
    handleMintMore,
    handleVerifyTokenApproval,
    handleAdminAirdrop,
    handleTradeSimulated,
  } = useApp();

  return (
    <div className="bg-petroleum-dark min-h-screen flex flex-col justify-between font-sans selection:bg-amazon-neon selection:text-petroleum-dark relative">

      {/* Onboarding Dialog Wizard */}
      {showOnboarding && (
        <OnboardingFlow onComplete={handleOnboardingComplete} onSkip={handleOnboardingSkip} />
      )}

      {/* Global simulated network notification */}
      <div className="bg-amazon-green text-xs text-white py-2 px-4 text-center select-all flex items-center justify-center gap-2 border-b border-white/5 relative z-40 font-mono">
        <span className="w-2 h-2 rounded-full bg-amazon-neon animate-ping shrink-0" />
        {IS_TESTNET ? (
          <span><strong>Testnet REAL · Base Sepolia</strong> — carteira Privy e deploy on-chain de verdade. Self-custody, sem fiat.</span>
        ) : (
          <span>Nortoken Sandbox ativo em <strong>rede EVM (testnet)</strong>. Pagamentos em <strong>USDC</strong> simulados — self-custody, sem fiat.</span>
        )}
      </div>

      {/* Navigation menu */}
      <Navigation wallet={wallet} connectWallet={connectWallet} disconnectWallet={disconnectWallet} />

      {/* Primary body switcher (rotas) */}
      <main className="flex-1 pb-16">
        <Switch>
          <Route path="/">
            <LandingPage
              onStartTokenizing={() => navigateTab('tokenize')}
              setTab={navigateTab}
              walletConnected={wallet.connected}
              connectWallet={connectWallet}
            />
          </Route>

          <Route path="/create">
            <TokenCreator
              wallet={wallet}
              connectWallet={connectWallet}
              onTokenCreated={handleTokenCreated}
              onVerificationUpdate={handleTokenVerification}
              setTab={navigateTab}
            />
          </Route>

          <Route path="/app">
            <Dashboard
              tokens={tokens.filter((t) => !!wallet.address && t.creatorWallet === wallet.address)}
              wallet={wallet}
              onAuditRequested={handleServicePurchased}
              onMintMore={handleMintMore}
              onPoolCreated={handlePoolCreated}
              onAddDocument={handleAddDocument}
              setTab={navigateTab}
            />
          </Route>

          <Route path="/market">
            <Marketplace tokens={tokens} wallet={wallet} onTradeSimulated={handleTradeSimulated} />
          </Route>

          <Route path="/premium">
            <PremiumStore
              tokens={tokens.filter((t) => !!wallet.address && t.creatorWallet === wallet.address)}
              wallet={wallet}
              onServicePurchased={handleServicePurchased}
            />
          </Route>

          <Route path="/admin">
            <AdminPanel
              tokens={tokens}
              wallet={wallet}
              onVerifyToken={handleVerifyTokenApproval}
              onAirdropRequested={handleAdminAirdrop}
            />
          </Route>

          {/* Fallback: qualquer rota desconhecida volta para a landing */}
          <Route>
            <Redirect to="/" />
          </Route>
        </Switch>
      </main>

      {/* Persistent floating indicator warning about simulation */}
      <div className="fixed bottom-4 right-4 z-40 max-w-xs p-3 rounded-2xl bg-petroleum-card/90 border border-white/15 backdrop-blur-md shadow-2xl flex items-center gap-2.5 text-xs text-gray-350">
        <Info className="w-5 h-5 text-amazon-neon shrink-0" />
        <p className="leading-tight">
          {IS_TESTNET
            ? 'Testnet real: criar token assina uma transação on-chain (Base Sepolia). Tokens são de teste, sem valor.'
            : 'Nortoken Sandbox: deploys, transações e pagamentos em USDC do MVP são simulados para testes on-chain.'}
        </p>
      </div>

      {/* ── Footer institucional MAZARI CORP ── */}
      <footer className="relative z-30 border-t border-white/10 bg-petroleum-dark/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-gradient-to-tr from-emerald-400 to-cyan-500 flex items-center justify-center shrink-0">
              <svg className="w-3 h-3 text-[#02181a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
            </span>
            <span className="font-mono uppercase tracking-wider">Nortoken</span>
            <span className="text-gray-600">·</span>
            <span>Rampa de lançamento Web3</span>
          </div>

          <div className="flex items-center gap-2">
            <span>Plataforma exclusiva do grupo</span>
            <a
              href="https://mazaricorp.com"
              target="_blank"
              rel="noreferrer"
              className="text-amazon-neon font-semibold hover:text-white transition-colors uppercase tracking-wider"
            >
              MAZARI CORP
            </a>
          </div>

          <div className="flex items-center gap-4 text-gray-500 font-mono text-[10px]">
            {/* Admin / Governança — acesso discreto fora do menu principal */}
            <button
              id="footer-admin-link"
              onClick={() => navigateTab('admin')}
              className="flex items-center gap-1 hover:text-amazon-neon transition-colors uppercase tracking-wider cursor-pointer"
            >
              <UserCheck2 className="w-3.5 h-3.5" />
              Auditores
            </button>
            <span>© {new Date().getFullYear()} — Todos os direitos reservados</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

const queryClient = new QueryClient();
const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID as string | undefined;

export default function App() {
  const inner = (
    <AppProvider>
      <Switch>
        <Route path="/whitelabel" component={WhitelabelRoute} />
        <Route component={Shell} />
      </Switch>
    </AppProvider>
  );

  // Sem App ID configurado → sandbox puro (mock), sem Privy.
  if (!PRIVY_APP_ID) return inner;

  // Com App ID → Privy sempre montado; o modo (mock|testnet) decide se a conexão é real.
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        defaultChain: baseSepolia,
        supportedChains: [baseSepolia],
        embeddedWallets: { ethereum: { createOnLogin: 'users-without-wallets' } },
        appearance: { theme: 'dark', accentColor: '#10b981' },
      }}
    >
      <QueryClientProvider client={queryClient}>{inner}</QueryClientProvider>
    </PrivyProvider>
  );
}
