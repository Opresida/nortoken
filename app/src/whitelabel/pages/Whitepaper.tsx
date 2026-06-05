import React, { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import type { WhitelabelConfig } from '../types';

interface Props {
  config: WhitelabelConfig;
}

export default function WhitepaperPage({ config }: Props) {
  const [activeSection, setActiveSection] = useState(config.whitepaperSections[0]?.id ?? '');

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6" style={{ borderBottom: `1px solid color-mix(in srgb, var(--wl-primary) 14%, transparent)` }}>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest opacity-50 mb-1">
            Documentação técnica
          </div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: config.theme.fontHeading }}>
            Whitepaper
          </h2>
        </div>
        <button
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider cursor-pointer transition-all hover:brightness-110"
          style={{
            background: `var(--wl-primary)`,
            color: `var(--wl-deep)`,
          }}
        >
          <Download className="w-3.5 h-3.5" />
          Baixar PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8">
        {/* Sidebar de seções */}
        <aside>
          <div className="text-[10px] font-mono uppercase tracking-widest opacity-50 mb-3 px-2">
            Conteúdo
          </div>
          <nav className="space-y-1 md:sticky md:top-24">
            {config.whitepaperSections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className="w-full text-left px-3 py-2 rounded-md text-sm cursor-pointer transition-all"
                style={{
                  background: activeSection === s.id
                    ? `color-mix(in srgb, var(--wl-primary) 14%, transparent)`
                    : 'transparent',
                  color: activeSection === s.id ? `var(--wl-primary)` : `var(--wl-fg)`,
                  fontWeight: activeSection === s.id ? 600 : 400,
                  opacity: activeSection === s.id ? 1 : 0.7,
                }}
              >
                {s.title}
              </button>
            ))}
          </nav>
        </aside>

        {/* Conteúdo */}
        <article>
          {config.whitepaperSections
            .filter((s) => s.id === activeSection)
            .map((section) => (
              <div key={section.id} className="space-y-4 pb-12">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5" style={{ color: `var(--wl-primary)` }} />
                  <h3 className="text-2xl font-bold" style={{ fontFamily: config.theme.fontHeading }}>
                    {section.title}
                  </h3>
                </div>
                <p className="text-base leading-relaxed opacity-85" style={{ fontFamily: config.theme.fontBody }}>
                  {section.content}
                </p>

                {/* Navegação entre seções */}
                <div className="flex items-center justify-between pt-8 mt-8 border-t" style={{ borderColor: `color-mix(in srgb, var(--wl-primary) 12%, transparent)` }}>
                  {(() => {
                    const idx = config.whitepaperSections.findIndex((x) => x.id === activeSection);
                    const prev = config.whitepaperSections[idx - 1];
                    const next = config.whitepaperSections[idx + 1];
                    return (
                      <>
                        <button
                          onClick={() => prev && setActiveSection(prev.id)}
                          disabled={!prev}
                          className="text-xs font-mono uppercase tracking-widest cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          style={{ color: `var(--wl-primary)` }}
                        >
                          {prev ? `← ${prev.title}` : ''}
                        </button>
                        <button
                          onClick={() => next && setActiveSection(next.id)}
                          disabled={!next}
                          className="text-xs font-mono uppercase tracking-widest cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          style={{ color: `var(--wl-primary)` }}
                        >
                          {next ? `${next.title} →` : ''}
                        </button>
                      </>
                    );
                  })()}
                </div>
              </div>
            ))}
        </article>
      </div>
    </div>
  );
}
