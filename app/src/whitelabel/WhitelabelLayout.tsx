import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  ArrowRightLeft,
  Lock,
  Ticket,
  DatabaseZap,
  ShoppingCart,
  Map,
  Landmark,
  Wallet,
  Menu,
  X,
  ArrowLeft,
} from 'lucide-react';
import type { WhitelabelConfig, WhitelabelFeatureKey } from './types';

interface MenuItem {
  key: WhitelabelFeatureKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  soon?: boolean;
}

const FULL_MENU: MenuItem[] = [
  { key: 'home',         label: 'Home',         icon: LayoutDashboard },
  { key: 'whitepaper',   label: 'Whitepaper',   icon: FileText },
  { key: 'swap',         label: 'Swap',         icon: ArrowRightLeft },
  { key: 'stake',        label: 'Stake',        icon: Lock },
  { key: 'referral',     label: 'Referral',     icon: Ticket },
  { key: 'tokenization', label: 'Buy NFT',      icon: DatabaseZap },
  { key: 'buy',          label: 'Buy Token',    icon: ShoppingCart },
  { key: 'roadmap',      label: 'Roadmap',      icon: Map },
  { key: 'lending',      label: 'Lending',      icon: Landmark, soon: true },
];

interface Props {
  config: WhitelabelConfig;
  currentPage: WhitelabelFeatureKey;
  setCurrentPage: (page: WhitelabelFeatureKey) => void;
  onExitDemo?: () => void;
  children: React.ReactNode;
}

export default function WhitelabelLayout({
  config,
  currentPage,
  setCurrentPage,
  onExitDemo,
  children,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);

  const enabledItems = FULL_MENU.filter((m) => config.features[m.key]);

  // CSS custom props injetadas a partir do theme do config (preparado pra multi-tenant)
  const themeStyle: React.CSSProperties = {
    // @ts-expect-error custom CSS vars
    '--wl-primary': config.theme.primary,
    '--wl-primary-soft': config.theme.primarySoft,
    '--wl-secondary': config.theme.secondary,
    '--wl-bg': config.theme.background,
    '--wl-card': config.theme.card,
    '--wl-deep': config.theme.deep,
    '--wl-fg': config.theme.foreground,
    fontFamily: config.theme.fontBody,
  };

  return (
    <div
      className="min-h-screen w-full flex"
      style={{ ...themeStyle, background: `var(--wl-bg)`, color: `var(--wl-fg)` }}
    >
      {/* ════════ SIDEBAR ════════ */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          background: `linear-gradient(180deg, var(--wl-card), var(--wl-deep))`,
          borderRight: `1px solid color-mix(in srgb, var(--wl-primary) 18%, transparent)`,
        }}
      >
        <div className="flex flex-col h-full p-4">
          {/* Header da sidebar — logo + nome do projeto */}
          <div className="flex items-center gap-3 px-2 pb-4 mb-4 border-b" style={{ borderColor: 'color-mix(in srgb, var(--wl-primary) 12%, transparent)' }}>
            {config.logoUrl ? (
              <img src={config.logoUrl} alt={config.projectName} className="w-9 h-9 rounded-lg object-cover" />
            ) : (
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm"
                style={{
                  background: `linear-gradient(135deg, var(--wl-primary), var(--wl-primary-soft))`,
                  color: 'var(--wl-deep)',
                }}
              >
                {config.tokenSymbol.slice(0, 2)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm leading-tight truncate" style={{ fontFamily: config.theme.fontHeading }}>
                {config.projectName}
              </div>
              <div className="text-[10px] font-mono uppercase tracking-widest opacity-50 truncate">
                ${config.tokenSymbol} · {config.network}
              </div>
            </div>
          </div>

          {/* Menu items */}
          <nav className="flex-1 overflow-y-auto -mx-2 px-2">
            <ul className="flex flex-col gap-1">
              {enabledItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.key;
                return (
                  <li key={item.key}>
                    <button
                      onClick={() => {
                        setCurrentPage(item.key);
                        setMobileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all relative cursor-pointer"
                      style={{
                        background: isActive
                          ? `color-mix(in srgb, var(--wl-primary) 14%, transparent)`
                          : 'transparent',
                        color: isActive ? 'var(--wl-primary)' : 'var(--wl-fg)',
                        fontWeight: isActive ? 600 : 400,
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = `color-mix(in srgb, var(--wl-primary) 6%, transparent)`;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.soon && (
                        <span
                          className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                          style={{
                            background: `color-mix(in srgb, var(--wl-primary) 20%, transparent)`,
                            color: 'var(--wl-primary)',
                          }}
                        >
                          Soon
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer da sidebar — socials + GitHub */}
          <div className="pt-4 mt-4 border-t flex flex-col gap-2" style={{ borderColor: 'color-mix(in srgb, var(--wl-primary) 12%, transparent)' }}>
            {config.socials.slice(0, 1).map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs transition-all opacity-70 hover:opacity-100"
                style={{ background: 'color-mix(in srgb, var(--wl-fg) 4%, transparent)' }}
              >
                {s.name}
              </a>
            ))}

            {onExitDemo && (
              <button
                onClick={onExitDemo}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-md text-[10px] font-mono uppercase tracking-widest cursor-pointer"
                style={{
                  background: 'color-mix(in srgb, var(--wl-primary) 8%, transparent)',
                  color: 'var(--wl-primary)',
                }}
              >
                <ArrowLeft className="w-3 h-3" />
                Voltar ao Nortoken
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ════════ MAIN ════════ */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header
          className="sticky top-0 z-20 flex items-center gap-4 px-4 sm:px-8 py-4 backdrop-blur-md"
          style={{
            background: `color-mix(in srgb, var(--wl-bg) 85%, transparent)`,
            borderBottom: `1px solid color-mix(in srgb, var(--wl-primary) 10%, transparent)`,
          }}
        >
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="lg:hidden p-2 rounded-md hover:bg-white/5 cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <h1
            className="text-xl sm:text-2xl font-bold tracking-tight"
            style={{ fontFamily: config.theme.fontHeading }}
          >
            {FULL_MENU.find((m) => m.key === currentPage)?.label ?? 'Dashboard'}
          </h1>

          <div className="ml-auto">
            <button
              onClick={() => setWalletConnected((c) => !c)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer"
              style={{
                background: walletConnected
                  ? `color-mix(in srgb, var(--wl-primary) 14%, transparent)`
                  : `var(--wl-primary)`,
                color: walletConnected ? 'var(--wl-primary)' : 'var(--wl-deep)',
                border: walletConnected ? `1px solid var(--wl-primary)` : 'none',
              }}
            >
              <Wallet className="w-3.5 h-3.5" />
              {walletConnected ? '7XqJc9X4...T6bK' : 'Connect Wallet'}
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-4 sm:p-8">{children}</div>

        {/* Footer */}
        <footer
          className="px-4 sm:px-8 py-6 text-center text-xs opacity-50"
          style={{ borderTop: `1px solid color-mix(in srgb, var(--wl-primary) 10%, transparent)` }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            <span>© {new Date().getFullYear()} {config.projectName}</span>
            <span>·</span>
            <span>Powered by <strong style={{ color: 'var(--wl-primary)' }}>Nortoken</strong> · MAZARI CORP</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
