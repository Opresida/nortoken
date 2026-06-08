import React, { useState } from 'react';
import WhitelabelLayout from './WhitelabelLayout';
import HomePage from './pages/Home';
import WhitepaperPage from './pages/Whitepaper';
import SwapPage from './pages/Swap';
import StakePage from './pages/Stake';
import ReferralPage from './pages/Referral';
import TokenizationPage from './pages/Tokenization';
import BuyPage from './pages/Buy';
import RoadmapPage from './pages/Roadmap';
import LendingPage from './pages/Lending';
import LeaderboardPage from './pages/Leaderboard';
import TokenomicsPage from './pages/Tokenomics';
import type { WhitelabelConfig, WhitelabelFeatureKey } from './types';
import { DEMO_WHITELABEL_CONFIG } from './config';

interface Props {
  config?: WhitelabelConfig;
  onExitDemo?: () => void;
}

export default function WhitelabelApp({ config = DEMO_WHITELABEL_CONFIG, onExitDemo }: Props) {
  const [currentPage, setCurrentPage] = useState<WhitelabelFeatureKey>('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':         return <HomePage config={config} setCurrentPage={setCurrentPage} />;
      case 'whitepaper':   return <WhitepaperPage config={config} />;
      case 'swap':         return <SwapPage config={config} />;
      case 'stake':        return <StakePage config={config} setCurrentPage={setCurrentPage} />;
      case 'referral':     return <ReferralPage config={config} />;
      case 'tokenization': return <TokenizationPage config={config} />;
      case 'buy':          return <BuyPage config={config} setCurrentPage={setCurrentPage} />;
      case 'roadmap':      return <RoadmapPage config={config} />;
      case 'lending':      return <LendingPage config={config} />;
      case 'leaderboard':  return <LeaderboardPage config={config} />;
      case 'tokenomics':   return <TokenomicsPage config={config} />;
    }
  };

  return (
    <WhitelabelLayout
      config={config}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      onExitDemo={onExitDemo}
    >
      {renderPage()}
    </WhitelabelLayout>
  );
}
