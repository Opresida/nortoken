import React from 'react';
import { Check, Clock, Circle } from 'lucide-react';
import type { WhitelabelConfig, RoadmapPhase } from '../types';

interface Props {
  config: WhitelabelConfig;
}

const STATUS_STYLES: Record<RoadmapPhase['status'], { icon: typeof Check; label: string; color: string; opacity: number }> = {
  done:    { icon: Check,  label: 'Concluído',     color: 'var(--wl-primary)', opacity: 1 },
  running: { icon: Clock,  label: 'Em andamento',  color: '#fbbf24',           opacity: 1 },
  pending: { icon: Circle, label: 'Planejado',     color: 'rgba(255,255,255,0.4)', opacity: 0.65 },
};

export default function RoadmapPage({ config }: Props) {
  const totalPhases = config.roadmap.length;
  const donePhases = config.roadmap.filter((p) => p.status === 'done').length;
  const runningPhases = config.roadmap.filter((p) => p.status === 'running').length;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: config.theme.fontHeading }}>
          Roadmap do Projeto
        </h2>
        <p className="text-sm opacity-60">
          Cinco fases do nascimento até a plataforma de lending. Cada etapa é validada publicamente antes de avançar.
        </p>
      </div>

      {/* Progress overview */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: `var(--wl-card)`,
          border: `1px solid color-mix(in srgb, var(--wl-primary) 14%, transparent)`,
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest opacity-50 mb-1">Progresso</div>
            <div className="text-2xl font-bold font-mono">
              <span style={{ color: `var(--wl-primary)` }}>{donePhases}</span>
              <span className="opacity-50"> / {totalPhases} fases</span>
            </div>
          </div>
          <div className="text-right text-xs opacity-70 font-mono">
            {runningPhases > 0 && (
              <div className="mb-1">
                <span style={{ color: '#fbbf24' }}>● </span>
                {runningPhases} fase{runningPhases > 1 ? 's' : ''} em andamento
              </div>
            )}
            <div>
              <span style={{ color: `var(--wl-primary)` }}>● </span>
              {donePhases} concluída{donePhases > 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div className="h-2 rounded-full overflow-hidden" style={{ background: `color-mix(in srgb, var(--wl-fg) 10%, transparent)` }}>
          <div
            className="h-full transition-all"
            style={{
              width: `${(donePhases / totalPhases) * 100}%`,
              background: `var(--wl-primary)`,
            }}
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* linha vertical da timeline */}
        <div
          className="absolute left-5 top-2 bottom-2 w-0.5 z-0 hidden md:block"
          style={{ background: `color-mix(in srgb, var(--wl-primary) 20%, transparent)` }}
        />

        <div className="space-y-6">
          {config.roadmap.map((phase, idx) => {
            const status = STATUS_STYLES[phase.status];
            const Icon = status.icon;
            return (
              <div key={phase.id} className="relative flex flex-col md:flex-row gap-4 md:gap-6" style={{ opacity: status.opacity }}>
                {/* Node */}
                <div className="relative z-10 shrink-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      background: `var(--wl-card)`,
                      border: `2px solid ${status.color}`,
                      boxShadow: phase.status !== 'pending' ? `0 0 20px color-mix(in srgb, ${status.color} 50%, transparent)` : 'none',
                    }}
                  >
                    <Icon className="w-4 h-4" style={{ color: status.color }} />
                  </div>
                </div>

                {/* Card */}
                <div
                  className="flex-1 p-5 rounded-xl"
                  style={{
                    background: `var(--wl-card)`,
                    border: `1px solid color-mix(in srgb, ${status.color} 22%, transparent)`,
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-3">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-widest opacity-60 mb-0.5">
                        {phase.phase}
                      </div>
                      <h3 className="text-lg font-bold" style={{ fontFamily: config.theme.fontHeading }}>
                        {phase.title}
                      </h3>
                    </div>
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded font-mono shrink-0"
                      style={{
                        background: `color-mix(in srgb, ${status.color} 18%, transparent)`,
                        color: status.color,
                      }}
                    >
                      {status.label}
                    </span>
                  </div>

                  <ul className="space-y-1.5">
                    {phase.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <span
                          className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                          style={{ background: status.color }}
                        />
                        <span className="opacity-80">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
