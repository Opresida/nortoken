import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import type { Token } from '../types';

interface Props {
  tokens: Token[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}

/** Dropdown customizado de seleção de token (substitui o <select> nativo, que tinha
 *  bug de cor — opção branca em fundo branco). Paleta Nortoken, fundo sólido = legível. */
export default function TokenSelect({ tokens, value, onChange, className = '' }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = tokens.find((t) => t.id === value) ?? tokens[0];

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!tokens.length || !selected) {
    return <span className="text-xs text-red-400 font-mono">Nenhum token</span>;
  }

  const Avatar = ({ t, size = 'w-6 h-6 text-[10px]' }: { t: Token; size?: string }) => (
    <span className={`${size} rounded-md flex items-center justify-center font-black shrink-0 bg-amazon-neon/15 text-amazon-neon border border-amazon-neon/20`}>
      {t.symbol.slice(0, 2).toUpperCase()}
    </span>
  );

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2.5 pl-2.5 pr-3 py-2 rounded-xl bg-petroleum-card border border-white/10 hover:border-amazon-neon/40 text-sm font-semibold text-white transition-all cursor-pointer min-w-[210px]"
      >
        <Avatar t={selected} />
        <span className="flex-1 text-left truncate">{selected.name}</span>
        <span className="text-[11px] font-mono text-amazon-neon shrink-0">${selected.symbol}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute z-50 top-[calc(100%+6px)] left-0 right-0 min-w-[250px] rounded-xl border border-white/10 overflow-hidden shadow-2xl"
          style={{ background: '#041018' }}
        >
          <div className="max-h-72 overflow-y-auto p-1.5 space-y-0.5">
            {tokens.map((t) => {
              const active = t.id === value;
              return (
                <button
                  key={t.id}
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(t.id);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-left transition-colors cursor-pointer"
                  style={{ background: active ? 'rgba(16,185,129,0.14)' : 'transparent' }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.background = 'rgba(16,185,129,0.07)';
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Avatar t={t} />
                  <span className={`flex-1 truncate font-medium ${active ? 'text-amazon-neon' : 'text-white'}`}>{t.name}</span>
                  <span className="text-[11px] font-mono text-gray-400 shrink-0">${t.symbol}</span>
                  {active && <Check className="w-4 h-4 text-amazon-neon shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
