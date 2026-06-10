/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'wouter';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { INITIAL_TOKENS, PREMIUM_SERVICES } from '../data/mockData';
import { Token, TokenDocument, UserWallet, Transaction } from '../types';
import { IS_TESTNET } from '../onchain/env';

/**
 * Ponte Privy → estado da carteira. Só é montada quando há Privy (testnet), então os
 * hooks do Privy nunca são chamados fora do provider. Registra login/logout num ref que
 * o connectWallet do contexto aciona, e sincroniza o endereço conectado.
 */
function PrivyWalletBridge({
  actionsRef,
  onWallet,
}: {
  actionsRef: React.MutableRefObject<{ login: () => void; logout: () => void }>;
  onWallet: (w: UserWallet) => void;
}) {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();

  useEffect(() => {
    actionsRef.current = { login, logout };
  }, [login, logout, actionsRef]);

  useEffect(() => {
    if (!ready) return;
    const addr = wallets[0]?.address;
    if (authenticated && addr) {
      onWallet({ address: addr, connected: true, usdcBalance: 0 });
    } else {
      onWallet({ address: '', connected: false, usdcBalance: 0 });
    }
  }, [ready, authenticated, wallets, onWallet]);

  return null;
}

/**
 * Mapeia os ids de aba legados (usados pelos componentes filhos via prop `setTab`)
 * para as rotas wouter. Permite migrar o roteamento sem reescrever cada filho.
 */
export const TAB_TO_PATH: Record<string, string> = {
  landing: '/',
  tokenize: '/create',
  dashboard: '/app',
  marketplace: '/market',
  premium: '/premium',
  whitelabel: '/whitelabel',
  admin: '/admin',
};

interface AppContextValue {
  // Estado global
  wallet: UserWallet;
  tokens: Token[];
  transactions: Transaction[];
  showOnboarding: boolean;

  // Navegação (shim compatível com a antiga prop setTab)
  navigateTab: (tab: string) => void;

  // Wallet
  connectWallet: () => void;
  disconnectWallet: () => void;

  // Onboarding
  handleOnboardingComplete: (simAddress: string) => void;
  handleOnboardingSkip: () => void;

  // Mutações de tokens / wallet
  handleTokenCreated: (newToken: Token) => void;
  handlePoolCreated: (tokenId: string, lockId: string) => void;
  handleTokenVerification: (tokenId: string, status: 'pending' | 'verified' | 'failed') => void;
  handleAddDocument: (tokenId: string, doc: TokenDocument) => void;
  handleServicePurchased: (tokenId: string, serviceId: string) => void;
  handleMintMore: (tokenId: string, extraAmount: number) => void;
  handleVerifyTokenApproval: (tokenId: string, approved: boolean) => void;
  handleAdminAirdrop: (usdc: number) => void;
  handleTradeSimulated: (tokenId: string, amountPurchased: number) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp deve ser usado dentro de <AppProvider>');
  return ctx;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();

  const [showOnboarding, setShowOnboarding] = useState<boolean>(true);

  // Carteira simulada — saldo em USDC (stablecoin)
  const [wallet, setWallet] = useState<UserWallet>({
    address: '',
    connected: false,
    usdcBalance: 0,
  });

  // Global tokens list initialized with mock region assets
  const [tokens, setTokens] = useState<Token[]>(INITIAL_TOKENS);

  // Transaction logs state to give RWA accounting feel
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Ações do Privy (preenchidas pela ponte quando em modo testnet)
  const privyActions = useRef<{ login: () => void; logout: () => void }>({
    login: () => {},
    logout: () => {},
  });
  const syncWallet = useCallback((w: UserWallet) => setWallet(w), []);

  const navigateTab = useCallback(
    (tab: string) => setLocation(TAB_TO_PATH[tab] ?? '/'),
    [setLocation],
  );

  // Check if onboarding was completed before in localStorage
  useEffect(() => {
    const isCompleted = localStorage.getItem('nortoken_onboarding_completed');
    if (isCompleted === 'true') {
      setShowOnboarding(false);

      // Auto reconnect simulated wallet — só no modo mock (no testnet quem manda é o Privy)
      if (!IS_TESTNET) {
        const savedAddress = localStorage.getItem('nortoken_wallet_address');
        if (savedAddress) {
          setWallet({ address: savedAddress, connected: true, usdcBalance: 5000 });
        }
      }
    }
  }, []);

  const handleOnboardingComplete = (simAddress: string) => {
    localStorage.setItem('nortoken_onboarding_completed', 'true');
    localStorage.setItem('nortoken_wallet_address', simAddress);
    setWallet({ address: simAddress, connected: true, usdcBalance: 1000 }); // USDC de cortesia no sandbox
    setShowOnboarding(false);
    navigateTab('dashboard'); // take them instantly to see dashboards
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem('nortoken_onboarding_completed', 'true');
    setShowOnboarding(false);
    navigateTab('landing');
  };

  // Conexão de carteira: testnet usa Privy (login real); mock gera endereço simulado.
  const connectWallet = () => {
    if (IS_TESTNET) {
      privyActions.current.login();
      return;
    }
    const randomAddress = '0x' + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);
    localStorage.setItem('nortoken_wallet_address', randomAddress);
    setWallet({ address: randomAddress, connected: true, usdcBalance: 5000 }); // saldo de teste em USDC
  };

  const disconnectWallet = () => {
    if (IS_TESTNET) {
      privyActions.current.logout();
      setWallet({ address: '', connected: false, usdcBalance: 0 });
      return;
    }
    localStorage.removeItem('nortoken_wallet_address');
    setWallet({ address: '', connected: false, usdcBalance: 0 });
  };

  // Callback após criar a pool de um token (passo 2)
  const handlePoolCreated = (tokenId: string, lockId: string) => {
    setTokens(prev => prev.map(t => (t.id === tokenId ? { ...t, poolLockId: lockId } : t)));
  };

  // Atualiza o status da verificação do source na BaseScan (disparada pós-deploy).
  const handleTokenVerification = (tokenId: string, status: 'pending' | 'verified' | 'failed') => {
    setTokens(prev =>
      prev.map(t => (t.id === tokenId ? { ...t, verificationStatus: status, verified: status === 'verified' ? true : t.verified } : t)),
    );
  };

  // Adiciona um documento a um token já criado (upload posterior)
  const handleAddDocument = (tokenId: string, doc: TokenDocument) => {
    setTokens(prev => prev.map(t => (t.id === tokenId ? { ...t, documents: [...t.documents, doc] } : t)));
  };

  // Callback after creating a token
  const handleTokenCreated = (newToken: Token) => {
    setTokens(prev => [newToken, ...prev]);

    // Debita a taxa de deploy em USDC (1 USDC = 1 USD)
    setWallet(prev => ({
      ...prev,
      usdcBalance: Math.max(0, prev.usdcBalance - newToken.deployCostUsd),
    }));

    // Append to transactions array
    const tx: Transaction = {
      signature: '0xDeploy' + Math.random().toString(16).substring(2, 8),
      type: 'deploy',
      tokenName: newToken.name,
      tokenSymbol: newToken.symbol,
      amountUsd: newToken.deployCostUsd,
      timestamp: new Date().toISOString(),
      status: 'confirmed',
    };
    setTransactions(prev => [tx, ...prev]);
  };

  // Callback to obtain / buy premium packages
  const handleServicePurchased = (tokenId: string, serviceId: string) => {
    setTokens(prev =>
      prev.map(t =>
        t.id === tokenId
          ? { ...t, premiumServices: [...t.premiumServices.filter(s => s !== serviceId), serviceId] }
          : t,
      ),
    );

    // Debita o preço do serviço em USDC
    const price = PREMIUM_SERVICES.find(s => s.id === serviceId)?.priceUsd ?? 0;
    setWallet(prev => ({ ...prev, usdcBalance: Math.max(0, prev.usdcBalance - price) }));
  };

  // Mint supplementation mechanism action updates
  const handleMintMore = (tokenId: string, extraAmount: number) => {
    setTokens(prev =>
      prev.map(t => (t.id === tokenId ? { ...t, supply: t.supply + extraAmount } : t)),
    );
  };

  // Admin section: toggle verification selo verde approval
  const handleVerifyTokenApproval = (tokenId: string, approved: boolean) => {
    setTokens(prev => prev.map(t => (t.id === tokenId ? { ...t, verified: approved } : t)));
  };

  // Admin section: faucet de USDC simulado
  const handleAdminAirdrop = (usdc: number) => {
    setWallet(prev => ({
      ...prev,
      connected: true,
      address: prev.address || '0xFaUcE700000000000000000000000000000000Aa',
      usdcBalance: prev.usdcBalance + usdc,
    }));
  };

  // Trading simulation fractional purchase updates
  const handleTradeSimulated = (tokenId: string, amountPurchased: number) => {
    setTokens(prev =>
      prev.map(t => {
        if (t.id === tokenId) {
          return {
            ...t,
            holderCount: t.holderCount + 1,
            supply: t.supply,
            analytics: t.analytics.map((day, idx) =>
              idx === t.analytics.length - 1
                ? { ...day, volume: day.volume + amountPurchased * 5, holders: day.holders + 1 }
                : day,
            ),
          };
        }
        return t;
      }),
    );
  };

  const value: AppContextValue = {
    wallet,
    tokens,
    transactions,
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
  };

  return (
    <AppContext.Provider value={value}>
      {IS_TESTNET && <PrivyWalletBridge actionsRef={privyActions} onWallet={syncWallet} />}
      {children}
    </AppContext.Provider>
  );
}
