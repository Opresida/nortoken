/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useLocation } from 'wouter';
import {
  Wallet,
  Menu,
  X,
  Plus,
  Workflow,
  Sparkles,
  Layers,
  LayoutDashboard,
} from 'lucide-react';
import { UserWallet } from '../types';

interface NavigationProps {
  wallet: UserWallet;
  connectWallet: () => void;
  disconnectWallet: () => void;
}

/** Hierarquia primária: a jornada principal em 4 destinos. */
const menuItems = [
  { path: '/create', label: 'Criar Token', icon: Workflow },
  { path: '/app', label: 'Meus Tokens', icon: LayoutDashboard },
  { path: '/market', label: 'Mercado', icon: Layers },
  { path: '/premium', label: 'Premium', icon: Sparkles },
];

export default function Navigation({ wallet, connectWallet, disconnectWallet }: NavigationProps) {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const go = (path: string) => {
    setLocation(path);
    setMobileMenuOpen(false);
  };

  // Links de navegação do centro (a ação primária "Criar Token" é tratada à parte, como botão)
  const navLinks = menuItems.filter((item) => item.path !== '/create');

  return (
    <nav className="sticky top-4 z-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 px-6 sm:px-8 py-2 sm:py-4 rounded-[28px] shadow-lg">
        <div className="flex items-center justify-between gap-4 lg:gap-8 h-14 sm:h-16">

          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => go('/')}>
            <div className="w-10 h-10 bg-gradient-to-tr from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] shrink-0">
              <svg className="w-6 h-6 text-[#02181a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black italic tracking-tighter uppercase text-white leading-none">
                Nortoken
              </span>
              <span className="text-[8px] font-mono tracking-[0.2em] text-emerald-400 font-bold uppercase mt-0.5 hidden sm:block">
                LAUNCHPAD ON-CHAIN
              </span>
            </div>
          </div>

          {/* Desktop Navigation (centro) */}
          <div className="hidden md:flex items-center gap-6 lg:gap-9 mx-auto text-[11px] uppercase tracking-[0.18em] font-bold">
            {navLinks.map((item) => {
              const isActive = location === item.path;
              return (
                <button
                  id={`nav-tab-${item.path.slice(1)}`}
                  key={item.path}
                  onClick={() => go(item.path)}
                  className={`pb-1 transition-colors border-b-2 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'text-cyan-400 border-cyan-400'
                      : 'text-gray-400 border-transparent hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Ações à direita: Criar Token (CTA) + Wallet */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <button
              id="nav-cta-create"
              onClick={() => go('/create')}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                location === '/create'
                  ? 'bg-cyan-400 text-[#02181a] shadow-[0_0_20px_rgba(34,211,238,0.4)]'
                  : 'bg-gradient-to-tr from-emerald-400 to-cyan-500 text-[#02181a] hover:scale-105 shadow-[0_0_20px_rgba(16,185,129,0.35)]'
              }`}
            >
              <Plus className="w-4 h-4" strokeWidth={3} />
              Criar Token
            </button>

            <div className="h-8 w-[1px] bg-white/10 mx-0.5"></div>
            {wallet.connected ? (
              <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-1.5 pl-3.5 border border-white/5">
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-emerald-400">{wallet.usdcBalance.toLocaleString('en-US', { maximumFractionDigits: 0 })} USDC</div>
                  <div className="text-[9px] text-gray-400 font-bold tracking-widest uppercase">Simulado</div>
                </div>

                <button
                  id="wallet-disconnect-btn"
                  onClick={disconnectWallet}
                  className="px-4 py-2 bg-red-950/40 text-red-400 hover:bg-red-900/60 font-mono text-xs font-bold uppercase tracking-wider rounded-full border border-red-500/20 transition-all cursor-pointer"
                >
                  {wallet.address.substring(0, 4)}...{wallet.address.substring(wallet.address.length - 4)}
                </button>
              </div>
            ) : (
              <button
                id="wallet-connect-btn"
                onClick={connectWallet}
                className="px-6 py-2.5 bg-white text-[#02181a] rounded-full text-xs font-black uppercase tracking-wider shadow-lg hover:scale-105 transition-all outline-none cursor-pointer"
              >
                Conectar Wallet
              </button>
            )}
          </div>

          {/* Mobile hamburger icon */}
          <div className="flex md:hidden">
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 focus:outline-none cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div id="mobile-nav-menu" className="md:hidden border-t border-white/5 bg-petroleum-deep/95 backdrop-blur-lg px-2 pt-2 pb-4 space-y-1 mt-2 rounded-2xl">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <button
                id={`mobile-nav-tab-${item.path.slice(1)}`}
                key={item.path}
                onClick={() => go(item.path)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amazon-light/10 text-amazon-neon border-l-4 border-amazon-neon'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}

          <div className="pt-4 border-t border-white/5 px-4">
            {wallet.connected ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Saldo (simulado):</span>
                  <span className="text-sm font-mono text-emerald-400 font-bold">{wallet.usdcBalance.toLocaleString('en-US', { maximumFractionDigits: 0 })} USDC</span>
                </div>
                <button
                  id="mobile-wallet-disconnect-btn"
                  onClick={disconnectWallet}
                  className="w-full flex items-center justify-center gap-2 bg-red-950/50 text-red-400 py-2.5 rounded-xl border border-red-500/20 text-sm font-mono cursor-pointer"
                >
                  Desconectar ({wallet.address.substring(0, 6)}...)
                </button>
              </div>
            ) : (
              <button
                id="mobile-wallet-connect-btn"
                onClick={() => {
                  connectWallet();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amazon-green to-amazon-light py-2.5 rounded-xl text-white font-medium text-sm cursor-pointer"
              >
                <Wallet className="w-4 h-4" />
                Conectar Wallet
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
