import React from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

export interface Stage {
  label: string;
  price: number;
}

interface Props {
  stages: Stage[];
  currentIndex: number;
}

/** Gráfico de estágios da pré-venda (estilo Aizon): linha sólida até o estágio
 *  atual, tracejada até a listagem, dots com preço e coluna atual destacada. */
export default function StageChart({ stages, currentIndex }: Props) {
  const maxPrice = Math.max(...stages.map((s) => s.price));
  const top = maxPrice * 1.3;

  const data = stages.map((s, i) => ({
    label: s.label,
    realized: i <= currentIndex ? s.price : null,
    projected: i >= currentIndex ? s.price : null,
    highlight: i === currentIndex ? top : 0,
  }));

  const Label = ({ cx, cy, value }: { cx?: number; cy?: number; value?: number }) => {
    if (cx == null || cy == null || value == null) return <g />;
    return (
      <g>
        <rect x={cx - 21} y={cy - 30} width={42} height={18} rx={5} fill="rgba(0,0,0,0.55)" />
        <text x={cx} y={cy - 17} textAnchor="middle" fontSize={10} fontWeight={700} fill="#fff">${value}</text>
      </g>
    );
  };

  const RealizedDot = (props: any) => {
    const { cx, cy, value, index } = props;
    if (cx == null || cy == null || value == null) return <g />;
    const cur = index === currentIndex;
    return (
      <g>
        <Label cx={cx} cy={cy} value={value} />
        <circle cx={cx} cy={cy} r={cur ? 6 : 4} fill="var(--wl-primary)" stroke="#fff" strokeWidth={cur ? 2.5 : 0} />
      </g>
    );
  };

  const ProjectedDot = (props: any) => {
    const { cx, cy, value, index } = props;
    if (cx == null || cy == null || value == null || index <= currentIndex) return <g />;
    const listing = index === stages.length - 1;
    return (
      <g>
        <Label cx={cx} cy={cy} value={value} />
        <circle cx={cx} cy={cy} r={listing ? 6 : 4} fill={listing ? 'var(--wl-primary)' : 'color-mix(in srgb, var(--wl-fg) 45%, transparent)'} stroke={listing ? '#fff' : 'none'} strokeWidth={listing ? 2.5 : 0} />
      </g>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={250}>
      <ComposedChart data={data} margin={{ top: 30, right: 16, left: -6, bottom: 4 }}>
        <CartesianGrid vertical horizontal={false} stroke="color-mix(in srgb, var(--wl-fg) 8%, transparent)" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: 'var(--wl-fg)', opacity: 0.55 }} />
        <YAxis domain={[0, top]} tickFormatter={(v: number) => `$${v}`} tickLine={false} axisLine={false} width={44} tick={{ fontSize: 10, fill: 'var(--wl-fg)', opacity: 0.45 }} />
        <Bar dataKey="highlight" fill="color-mix(in srgb, var(--wl-primary) 12%, transparent)" barSize={48} isAnimationActive={false} />
        <Line type="linear" dataKey="realized" stroke="var(--wl-primary)" strokeWidth={2.5} dot={<RealizedDot />} isAnimationActive={false} connectNulls />
        <Line type="linear" dataKey="projected" stroke="color-mix(in srgb, var(--wl-fg) 35%, transparent)" strokeWidth={2} strokeDasharray="5 5" dot={<ProjectedDot />} isAnimationActive={false} connectNulls />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
