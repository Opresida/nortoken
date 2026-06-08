import React, { useState, useEffect } from 'react';
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
  Settings,
  Send,
  MessageCircle,
  Twitter,
  Github,
  Trophy,
  PieChart,
} from 'lucide-react';
import type { WhitelabelConfig, WhitelabelFeatureKey } from './types';

const SOCIAL_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  Twitter,
  Telegram: Send,
  Discord: MessageCircle,
  GitHub: Github,
};

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
  { key: 'leaderboard',  label: 'Leaderboard',  icon: Trophy },
  { key: 'tokenomics',   label: 'Tokenomics',   icon: PieChart },
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

  // Contador da fase (estilo Aizon)
  const [nowTs, setNowTs] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = config.presale ? Math.max(0, new Date(config.presale.endsAt).getTime() - nowTs) : 0;
  const cd = {
    d: Math.floor(diff / 86_400_000),
    h: Math.floor((diff % 86_400_000) / 3_600_000),
    m: Math.floor((diff % 3_600_000) / 60_000),
    s: Math.floor((diff % 60_000) / 1_000),
  };

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
      className="relative min-h-screen w-full flex"
      style={{ ...themeStyle, background: `var(--wl-bg)`, color: `var(--wl-fg)` }}
    >
      {/* ════════ FUNDO ESTRELADO + BRILHO (vibe Aizon) ════════ */}
      <div
        aria-hidden
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 75% 50% at 50% -8%, color-mix(in srgb, var(--wl-primary) 16%, transparent), transparent 60%)`,
        }}
      />
      <div
        aria-hidden
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.55]"
        style={{
          backgroundImage: `radial-gradient(color-mix(in srgb, var(--wl-fg) 14%, transparent) 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
          maskImage: 'radial-gradient(ellipse 90% 70% at 50% 0%, #000 35%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 0%, #000 35%, transparent 80%)',
        }}
      />

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
                      className="w-full flex items-center gap-2 cursor-pointer"
                    >
                      <span
                        className="w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 transition-all"
                        style={{
                          background: isActive ? `var(--wl-primary)` : `color-mix(in srgb, var(--wl-fg) 5%, transparent)`,
                          color: isActive ? `var(--wl-deep)` : `var(--wl-fg)`,
                        }}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? '' : 'opacity-80'}`} />
                      </span>
                      <span
                        className="flex-1 flex items-center gap-2 h-10 px-3 rounded-[14px] text-sm transition-all"
                        style={{
                          background: isActive
                            ? `linear-gradient(90deg, color-mix(in srgb, var(--wl-primary) 30%, transparent), transparent)`
                            : 'transparent',
                          color: isActive ? `var(--wl-fg)` : `color-mix(in srgb, var(--wl-fg) 80%, transparent)`,
                          fontWeight: isActive ? 600 : 500,
                        }}
                      >
                        <span className="flex-1 text-left capitalize">{item.label}</span>
                        {item.soon && (
                          <span
                            className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                            style={{ background: `color-mix(in srgb, var(--wl-primary) 20%, transparent)`, color: `var(--wl-primary)` }}
                          >
                            Soon
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer da sidebar */}
          <div className="mt-4 flex flex-col gap-3">
            {onExitDemo && (
              <button
                onClick={onExitDemo}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[10px] font-mono uppercase tracking-widest cursor-pointer"
                style={{ background: `color-mix(in srgb, var(--wl-fg) 5%, transparent)`, color: `var(--wl-fg)` }}
              >
                <ArrowLeft className="w-3 h-3" />
                Voltar ao Nortoken
              </button>
            )}

            {/* Seu saldo (estilo Aizon) */}
            <div className="relative -mx-4 -mb-4 px-5 py-4 overflow-hidden" style={{ background: `color-mix(in srgb, var(--wl-primary) 9%, transparent)` }}>
              <div className="absolute top-0 left-0 w-32 h-0.5" style={{ background: `linear-gradient(90deg, var(--wl-primary), transparent)` }} />
              <p className="pb-1 uppercase text-[10px] font-semibold tracking-widest opacity-60" style={{ fontFamily: config.theme.fontHeading }}>Seu saldo</p>
              <h4 className="uppercase text-base font-bold" style={{ fontFamily: config.theme.fontHeading, color: `var(--wl-fg)` }}>
                2.569 ${config.tokenSymbol}
              </h4>
            </div>
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
      <main className="relative z-10 flex-1 min-w-0 flex flex-col">
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

          {/* Fase + contador (estilo Aizon) */}
          <div className="hidden sm:flex items-center gap-5">
            <div className="leading-none whitespace-nowrap">
              <span className="text-lg font-extrabold uppercase tracking-tight" style={{ fontFamily: config.theme.fontHeading }}>Fase 2</span>
              <span className="text-xs font-mono opacity-40"> / 12</span>
            </div>
            {config.presale && (
              <div className="hidden md:block pl-5" style={{ borderLeft: `1px solid color-mix(in srgb, var(--wl-fg) 12%, transparent)` }}>
                <div className="text-[9px] font-mono uppercase tracking-widest opacity-40 mb-0.5">Próxima fase em</div>
                <div className="font-mono text-sm font-bold tabular-nums" style={{ color: `var(--wl-primary)` }}>
                  {String(cd.d).padStart(2, '0')}D : {String(cd.h).padStart(2, '0')}H : {String(cd.m).padStart(2, '0')}M : {String(cd.s).padStart(2, '0')}S
                </div>
              </div>
            )}
          </div>

          {/* Página atual (mobile) */}
          <h1 className="sm:hidden text-base font-bold tracking-tight" style={{ fontFamily: config.theme.fontHeading }}>
            {FULL_MENU.find((m) => m.key === currentPage)?.label ?? 'Dashboard'}
          </h1>

          <div className="ml-auto flex items-center gap-2">
            {/* Sociais */}
            <div className="hidden sm:flex items-center gap-1.5">
              {config.socials.slice(0, 3).map((s) => {
                const Ico = SOCIAL_ICON[s.name] ?? Send;
                return (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105"
                    style={{ background: `color-mix(in srgb, var(--wl-fg) 6%, transparent)`, border: `1px solid color-mix(in srgb, var(--wl-fg) 8%, transparent)` }}
                  >
                    <Ico className="w-4 h-4 opacity-80" />
                  </a>
                );
              })}
            </div>

            <button
              onClick={() => setWalletConnected((c) => !c)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              style={{
                background: walletConnected ? `color-mix(in srgb, var(--wl-primary) 14%, transparent)` : `var(--wl-primary)`,
                color: walletConnected ? 'var(--wl-primary)' : 'var(--wl-deep)',
                border: walletConnected ? `1px solid var(--wl-primary)` : 'none',
              }}
            >
              <Wallet className="w-3.5 h-3.5" />
              {walletConnected ? '7XqJc9X4...T6bK' : 'Connect Wallet'}
            </button>

            <button
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
              style={{ background: `color-mix(in srgb, var(--wl-fg) 6%, transparent)`, border: `1px solid color-mix(in srgb, var(--wl-fg) 8%, transparent)` }}
            >
              <Settings className="w-4 h-4 opacity-70" />
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
