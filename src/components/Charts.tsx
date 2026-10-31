import React, { useId, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  YAxis,
} from 'recharts';
import { FeatureImportanceItem, ModelReport, ResidualBin, ScatterPoint } from '../types';

type GlassTone = 'pink' | 'lavender' | 'periwinkle' | 'blush';

/**
 * Shared SVG Definitions for Smoked Olive-Green + Soft Light-Pink Glass Columns & Charts
 */
const GlassSvgDefs: React.FC<{ prefix: string }> = ({ prefix }) => (
  <defs>
    {/* Soft Light-Pink Rim Glow */}
    <filter id={`${prefix}_pink_glow`} x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2.5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    {/* 1. Primary Frosted Rose-Pink -> Smoked Olive Glass Body */}
    <linearGradient id={`${prefix}_body_pink`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#F5A6CC" stopOpacity="0.88" />
      <stop offset="44%" stopColor="#9B5979" stopOpacity="0.86" />
      <stop offset="100%" stopColor="#1D2618" stopOpacity="0.96" />
    </linearGradient>

    {/* 2. Hovered / Peak Luminous Baby-Pink -> Blush Glass Body */}
    <linearGradient id={`${prefix}_body_blush`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#FAD3E7" stopOpacity="0.94" />
      <stop offset="42%" stopColor="#C9739D" stopOpacity="0.88" />
      <stop offset="100%" stopColor="#263220" stopOpacity="0.96" />
    </linearGradient>

    {/* 3. Botanical Sage-Olive Smoked Glass Body */}
    <linearGradient id={`${prefix}_body_lavender`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#6D8956" stopOpacity="0.94" />
      <stop offset="45%" stopColor="#2E3E24" stopOpacity="0.95" />
      <stop offset="100%" stopColor="#121B0F" stopOpacity="0.98" />
    </linearGradient>

    {/* 4. Rose-Kissed Cypress-Olive Glass Body */}
    <linearGradient id={`${prefix}_body_periwinkle`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#A6768A" stopOpacity="0.90" />
      <stop offset="48%" stopColor="#35472B" stopOpacity="0.94" />
      <stop offset="100%" stopColor="#131B10" stopOpacity="0.98" />
    </linearGradient>

    {/* Diagonal Baby-Pink Specular Glass Sheen */}
    <linearGradient id={`${prefix}_sheen`} x1="0" y1="0" x2="1" y2="0.88">
      <stop offset="0%" stopColor="#FFE6F3" stopOpacity="0.28" />
      <stop offset="34%" stopColor="#FFFFFF" stopOpacity="0.06" />
      <stop offset="68%" stopColor="#FFFFFF" stopOpacity="0.0" />
    </linearGradient>

    {/* Precision Rose-Pink & Botanical Sage Specular Rim Gradients */}
    <linearGradient id={`${prefix}_rim_pink`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#FFE6F3" stopOpacity="0.95" />
      <stop offset="48%" stopColor="#F5A6CC" stopOpacity="0.52" />
      <stop offset="100%" stopColor="#A4C288" stopOpacity="0.18" />
    </linearGradient>

    <linearGradient id={`${prefix}_rim_lavender`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#DCF0C5" stopOpacity="0.80" />
      <stop offset="48%" stopColor="#A4C288" stopOpacity="0.34" />
      <stop offset="100%" stopColor="#F5A6CC" stopOpacity="0.14" />
    </linearGradient>

    <linearGradient id={`${prefix}_rim_periwinkle`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#FAD3E7" stopOpacity="0.84" />
      <stop offset="48%" stopColor="#9AB87E" stopOpacity="0.32" />
      <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.10" />
    </linearGradient>
  </defs>
);

/**
 * Reusable Smoked Olive-Green + Rose-Pink Glass Column Primitive
 */
const GlassColumn: React.FC<{
  prefix: string;
  x: number;
  y: number;
  width: number;
  height: number;
  trackTop?: number;
  trackHeight?: number;
  rx?: number;
  tone?: GlassTone;
  dimmed?: boolean;
  hovered?: boolean;
}> = ({
  prefix,
  x,
  y,
  width,
  height,
  trackTop,
  trackHeight,
  rx = 8,
  tone = 'pink',
  dimmed = false,
  hovered = false,
}) => {
  const safeR = Math.min(rx, width / 2, Math.max(2, height / 2));
  const rimId =
    tone === 'lavender'
      ? `${prefix}_rim_lavender`
      : tone === 'periwinkle'
      ? `${prefix}_rim_periwinkle`
      : `${prefix}_rim_pink`;
  const topCapColor =
    tone === 'lavender'
      ? 'rgba(220, 240, 197, 0.90)'
      : tone === 'periwinkle'
      ? 'rgba(250, 211, 231, 0.90)'
      : 'rgba(255, 234, 245, 0.98)';

  return (
    <g opacity={dimmed ? 0.42 : 1} style={{ transition: 'opacity 160ms ease' }}>
      {/* Deep olive recessed slot track */}
      {trackTop !== undefined && trackHeight !== undefined && (
        <rect
          x={x}
          y={trackTop}
          width={width}
          height={trackHeight}
          rx={safeR}
          fill="#0E150C"
          stroke="rgba(250,217,234,0.08)"
          strokeWidth={0.8}
        />
      )}

      {/* Smoked olive-moss glass body */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={safeR}
        fill={`url(#${prefix}_body_${hovered ? 'blush' : tone})`}
      />

      {/* Diagonal light-pink specular sheen */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={safeR}
        fill={`url(#${prefix}_sheen)`}
      />

      {/* Fine specular border */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={safeR}
        fill="none"
        stroke={hovered ? '#FAD9EA' : `url(#${rimId})`}
        strokeWidth={hovered ? 1.45 : 1.05}
      />

      {/* Crisp top light-pink meniscus light edge */}
      {width > 10 && (
        <line
          x1={x + safeR * 0.75}
          y1={y + 0.85}
          x2={x + width - safeR * 0.75}
          y2={y + 0.85}
          stroke={hovered ? '#FFFFFF' : topCapColor}
          strokeWidth={1.45}
          strokeLinecap="round"
        />
      )}
    </g>
  );
};

/**
 * Helper to compute SVG Pie Sector Wedge Path (center -> arc -> center)
 */
function describePieWedge(
  cx: number,
  cy: number,
  r: number,
  startAngleDeg: number,
  endAngleDeg: number
): string {
  const span = Math.min(359.99, Math.max(0.01, endAngleDeg - startAngleDeg));
  const startRad = ((startAngleDeg - 90) * Math.PI) / 180;
  const endRad = ((startAngleDeg + span - 90) * Math.PI) / 180;
  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy + r * Math.sin(endRad);
  const largeArc = span > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
}

export interface KpiSparkPoint {
  label: string;
  value: number;
  formatted?: string;
}

/**
 * Responsive Obsidian-Glass KPI Sparkline powered by Recharts
 * Uses 'pink-primary' (var(--pink-primary) / #F5A6CC) to visualize cohort trend trajectories.
 */
export const RoseSparkline: React.FC<{
  id: string;
  data?: KpiSparkPoint[];
  values?: number[];
  variant?: 'area' | 'bar';
}> = ({ id, data, values, variant = 'area' }) => {
  const uid = useId().replace(/:/g, '');
  const gradId = `recharts_spark_${id}_${uid}`;
  const glowId = `recharts_glow_${id}_${uid}`;
  const pinkPrimary = 'var(--pink-primary, #F5A6CC)';

  const chartData: KpiSparkPoint[] = useMemo(() => {
    if (data && data.length >= 2) {
      return data;
    }
    const fallback = values && values.length >= 2 ? values : [4, 6, 5, 8, 7, 10];
    return fallback.map((v, idx) => ({
      label: `#${idx + 1}`,
      value: Number(v),
      formatted: String(v),
    }));
  }, [data, values]);

  const { domainMin, domainMax, peakIdx } = useMemo(() => {
    const nums = chartData.map((d) => d.value);
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    const span = max - min || Math.max(1, max * 0.2);
    let bestIdx = nums.length - 1;
    for (let i = 0; i < nums.length; i++) {
      if (nums[i] >= nums[bestIdx]) bestIdx = i;
    }
    return {
      domainMin: variant === 'bar' ? 0 : Math.max(0, min - span * 0.25),
      domainMax: max + span * 0.2,
      peakIdx: bestIdx,
    };
  }, [chartData, variant]);

  const lastIdx = chartData.length - 1;

  const renderTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: readonly any[];
  }) => {
    if (!active || !payload || !payload.length) return null;
    const pt = payload[0]?.payload as KpiSparkPoint | undefined;
    if (!pt) return null;
    return (
      <div className="glass-tooltip px-2.5 py-1 rounded-lg text-[10px] leading-tight font-mono tabular-nums whitespace-nowrap pointer-events-none">
        <span className="text-[#BDB4C3]">{pt.label}: </span>
        <span className="font-semibold text-pink-primary">
          {pt.formatted ?? pt.value}
        </span>
      </div>
    );
  };

  const renderTerminalDot = (props: any) => {
    const { cx, cy, index } = props;
    if (index !== lastIdx || typeof cx !== 'number' || typeof cy !== 'number') {
      return <g key={`dot_empty_${index}`} />;
    }
    return (
      <g key={`dot_end_${index}`}>
        <circle cx={cx} cy={cy} r={4.2} fill="#F5A6CC" fillOpacity={0.28} />
        <circle
          cx={cx}
          cy={cy}
          r={2.3}
          fill="#FDF8FC"
          stroke={pinkPrimary}
          strokeWidth={1.4}
        />
      </g>
    );
  };

  return (
    <div className="w-full min-w-[88px] max-w-[136px] h-11 flex-1 rounded-xl bg-[#11190E]/90 border border-pink-primary/35 px-1.5 py-1 shadow-[inset_0_1px_8px_rgba(6,10,5,0.65),0_0_14px_rgba(245,166,204,0.08)]">
      <ResponsiveContainer width="100%" height="100%" minWidth={80}>
        {variant === 'bar' ? (
          <BarChart data={chartData} margin={{ top: 3, right: 3, bottom: 1, left: 3 }} barCategoryGap="22%">
            <defs>
              <linearGradient id={`${gradId}_bar`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#698553" stopOpacity={0.96} />
                <stop offset="100%" stopColor="#1A2615" stopOpacity={0.95} />
              </linearGradient>
              <linearGradient id={`${gradId}_bar_peak`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FAD3E7" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#9B5979" stopOpacity={0.92} />
              </linearGradient>
            </defs>
            <YAxis hide domain={[domainMin, domainMax]} />
            <RechartsTooltip
              content={renderTooltip}
              cursor={{ fill: 'rgba(245, 166, 204, 0.14)' }}
              position={{ y: -32 }}
              allowEscapeViewBox={{ x: true, y: true }}
            />
            <Bar dataKey="value" radius={[3, 3, 1, 1]} isAnimationActive={false}>
              {chartData.map((entry, idx) => (
                <Cell
                  key={`${entry.label}_${idx}`}
                  fill={idx === peakIdx ? `url(#${gradId}_bar_peak)` : `url(#${gradId}_bar)`}
                  stroke={idx === peakIdx ? '#FFFFFF' : pinkPrimary}
                  strokeOpacity={idx === peakIdx ? 0.92 : 0.62}
                  strokeWidth={0.95}
                />
              ))}
            </Bar>
          </BarChart>
        ) : (
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 2, left: 3 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F5A6CC" stopOpacity={0.55} />
                <stop offset="56%" stopColor="#E88DBB" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#11190E" stopOpacity={0.0} />
              </linearGradient>
              <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <YAxis hide domain={[domainMin, domainMax]} />
            <RechartsTooltip
              content={renderTooltip}
              cursor={{ stroke: 'rgba(245, 166, 204, 0.35)', strokeWidth: 1, strokeDasharray: '2 2' }}
              position={{ y: -32 }}
              allowEscapeViewBox={{ x: true, y: true }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={pinkPrimary}
              strokeWidth={1.9}
              fill={`url(#${gradId})`}
              filter={`url(#${glowId})`}
              isAnimationActive={false}
              dot={renderTerminalDot}
              activeDot={{
                r: 3.4,
                fill: '#FDF8FC',
                stroke: pinkPrimary,
                strokeWidth: 1.7,
              }}
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

/**
 * 1. Final Grade Distribution (Obsidian Black Glass Columns on Pitch-Black Plot Well)
 */
export const GradeRangeDistributionChart: React.FC<{
  rows: Record<string, any>[];
  gradeCol: 'G3' | 'G2' | 'G1';
}> = ({ rows, gradeCol }) => {
  const uid = useId().replace(/:/g, '');
  const [hovered, setHovered] = useState<number | null>(null);

  const buckets = useMemo(() => {
    const defs = [
      { label: '0–4', min: 0, max: 4 },
      { label: '5–9', min: 5, max: 9 },
      { label: '10–14', min: 10, max: 14 },
      { label: '15–20', min: 15, max: 20 },
    ];
    return defs.map((b) => {
      const count = rows.filter((r) => {
        const g = Math.round(Number(r[gradeCol] ?? r.G3 ?? 0));
        return g >= b.min && g <= b.max;
      }).length;
      const pct = rows.length ? ((count * 100) / rows.length).toFixed(1) : '0.0';
      return { ...b, count, pct };
    });
  }, [rows, gradeCol]);

  const rawMax = Math.max(...buckets.map((b) => b.count), 10);
  const niceMax = Math.ceil(rawMax / 40) * 40;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(niceMax * f));

  const w = 460;
  const h = 218;
  const padL = 44;
  const padR = 18;
  const padT = 22;
  const padB = 42;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  return (
    <div className="relative select-none chart-obsidian-well rounded-2xl p-2">
      <svg className="w-full h-[214px] overflow-visible" viewBox={`0 0 ${w} ${h}`}>
        <GlassSvgDefs prefix={uid} />

        {/* Subtle dark gridlines */}
        {ticks.map((t, idx) => {
          const y = padT + plotH * (1 - t / niceMax);
          return (
            <g key={idx}>
              <line
                x1={padL}
                x2={w - padR}
                y1={y}
                y2={y}
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth={1}
              />
              <text
                x={padL - 10}
                y={y + 3.5}
                textAnchor="end"
                className="fill-[#9C92A4] text-[10px] font-mono tabular-nums"
              >
                {t}
              </text>
            </g>
          );
        })}

        <line x1={padL} x2={padL} y1={padT} y2={padT + plotH} stroke="rgba(255,255,255,0.10)" />
        <line
          x1={padL}
          x2={w - padR}
          y1={padT + plotH}
          y2={padT + plotH}
          stroke="rgba(245,166,204,0.22)"
        />

        <text
          x={13}
          y={padT + plotH / 2}
          textAnchor="middle"
          transform={`rotate(-90 13 ${padT + plotH / 2})`}
          className="fill-[#7D7485] text-[9.5px]"
        >
          Number of Students
        </text>

        {buckets.map((b, idx) => {
          const slotW = plotW / buckets.length;
          const barW = Math.min(62, slotW * 0.58);
          const x = padL + idx * slotW + (slotW - barW) / 2;
          const barH = b.count === 0 ? 4 : Math.max(10, (b.count / niceMax) * plotH);
          const y = padT + (plotH - barH);
          const isHov = hovered === idx;

          return (
            <g
              key={b.label}
              onMouseEnter={() => setHovered(idx)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer"
            >
              <GlassColumn
                prefix={uid}
                x={x}
                y={y}
                width={barW}
                height={barH}
                trackTop={padT}
                trackHeight={plotH}
                rx={7}
                tone={idx >= 2 ? 'pink' : 'lavender'}
                dimmed={hovered !== null && !isHov}
                hovered={isHov}
              />

              <text
                x={x + barW / 2}
                y={y - 7}
                textAnchor="middle"
                className="fill-[#FDF8FC] text-[11px] font-mono tabular-nums font-semibold"
              >
                {b.count}
              </text>

              <text
                x={x + barW / 2}
                y={padT + plotH + 17}
                textAnchor="middle"
                className="fill-[#BDB4C3] text-[10.5px] font-mono tabular-nums"
              >
                {b.label}
              </text>
            </g>
          );
        })}

        <text
          x={padL + plotW / 2}
          y={h - 4}
          textAnchor="middle"
          className="fill-[#7D7485] text-[10px]"
        >
          Grade Range
        </text>
      </svg>

      {hovered !== null && buckets[hovered] && (
        <div className="glass-tooltip absolute top-2 right-3 px-3 py-1.5 rounded-xl text-[11px] text-[#FDF8FC] pointer-events-none tabular-nums">
          <span className="font-semibold text-[#F8C6DF]">
            {gradeCol} {buckets[hovered].label}:
          </span>{' '}
          <span>{buckets[hovered].count} students</span>{' '}
          <span className="text-[#BDB4C3]">({buckets[hovered].pct}%)</span>
        </div>
      )}
    </div>
  );
};

/**
 * 2. Sleek Obsidian-Black Smoked Glass Pie & Donut Chart
 * Supports true radial Black Glass Pie slices ('pie') and Black Glass Donut ('donut').
 */
export const PerformanceDonutChart: React.FC<{
  centerLabel: string;
  centerValue: string;
  variant?: 'pie' | 'donut';
  segments: {
    label: string;
    displayValue: string;
    share: number; // 0..100
    tone: 'pink' | 'blush' | 'lavender';
    subtext?: string;
  }[];
}> = ({ centerLabel, centerValue, variant = 'pie', segments }) => {
  const uid = useId().replace(/:/g, '');
  const [hovered, setHovered] = useState<number | null>(null);

  const size = 172;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 74;
  const stroke = 22;
  const donutR = (size - stroke) / 2 - 6;
  const circ = 2 * Math.PI * donutR;

  const totalShare = segments.reduce((acc, s) => acc + Math.max(0, s.share), 0) || 100;
  let startDeg = 0;
  let cumulativePct = 0;

  return (
    <div className="relative chart-obsidian-well rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
          <defs>
            {/* Slice 1: Lush Frosted Rose-Pink -> Plum-Olive Glass */}
            <linearGradient id={`pie_onyx_${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F6A8CE" />
              <stop offset="52%" stopColor="#A95C83" />
              <stop offset="100%" stopColor="#272124" />
            </linearGradient>

            {/* Slice 2: Deep Smoked Olive-Moss Glass with Blush Undertone */}
            <linearGradient id={`pie_carbon_${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#485E38" />
              <stop offset="55%" stopColor="#23301C" />
              <stop offset="100%" stopColor="#10170E" />
            </linearGradient>

            {/* Slice 3: Botanical Sage-Olive Glass */}
            <linearGradient id={`pie_graphite_${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#728F5A" />
              <stop offset="55%" stopColor="#314226" />
              <stop offset="100%" stopColor="#141C10" />
            </linearGradient>

            {/* Diagonal Baby-Pink Specular Sheen Overlay */}
            <linearGradient id={`pie_sheen_${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFE6F3" stopOpacity="0.28" />
              <stop offset="42%" stopColor="#FFFFFF" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Outer Olive-Pink Bezel Plate */}
          <circle
            cx={cx}
            cy={cy}
            r={outerR + 6}
            fill="#0F160C"
            stroke="rgba(245, 166, 204, 0.24)"
            strokeWidth={1}
          />

          {variant === 'pie' ? (
            <>
              {segments.map((seg, idx) => {
                const rawShare = Math.max(0, seg.share);
                if (rawShare <= 0) return null;
                const pct = (rawShare / totalShare) * 100;
                const sweep = Math.min(359.95, (pct / 100) * 360);
                const sDeg = startDeg;
                const eDeg = startDeg + sweep;
                const midRad = (((sDeg + sweep / 2) - 90) * Math.PI) / 180;
                startDeg += (pct / 100) * 360;

                const isHov = hovered === idx;
                const popOffset = isHov ? 4 : 0;
                const tx = Math.cos(midRad) * popOffset;
                const ty = Math.sin(midRad) * popOffset;

                const fillId =
                  seg.tone === 'pink'
                    ? `pie_onyx_${uid}`
                    : seg.tone === 'lavender'
                    ? `pie_graphite_${uid}`
                    : `pie_carbon_${uid}`;

                const strokeCol =
                  seg.tone === 'pink'
                    ? '#FFE3F1'
                    : seg.tone === 'lavender'
                    ? '#C5DBA9'
                    : 'rgba(245,166,204,0.46)';

                const labelR = outerR * 0.62;
                const lx = cx + labelR * Math.cos(midRad);
                const ly = cy + labelR * Math.sin(midRad);

                return (
                  <g
                    key={seg.label}
                    transform={`translate(${tx.toFixed(1)}, ${ty.toFixed(1)})`}
                    onMouseEnter={() => setHovered(idx)}
                    onMouseLeave={() => setHovered(null)}
                    className="cursor-pointer transition-transform duration-200"
                  >
                    <path
                      d={describePieWedge(cx, cy, outerR, sDeg, eDeg)}
                      fill={`url(#${fillId})`}
                      stroke={isHov ? '#FFFFFF' : strokeCol}
                      strokeWidth={idx === 0 || isHov ? 1.5 : 1.05}
                      strokeLinejoin="round"
                    />
                    <path
                      d={describePieWedge(cx, cy, outerR, sDeg, eDeg)}
                      fill={`url(#pie_sheen_${uid})`}
                      pointerEvents="none"
                    />
                    {pct >= 14 && (
                      <text
                        x={lx}
                        y={ly + 3}
                        textAnchor="middle"
                        className="fill-[#FCF9FB] text-[10.5px] font-mono font-semibold tabular-nums pointer-events-none"
                      >
                        {Math.round(pct)}%
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Sleek Small Deep-Olive Center Cap with Light-Pink Rim */}
              <circle
                cx={cx}
                cy={cy}
                r={25}
                fill="#121B0F"
                stroke="rgba(250, 217, 234, 0.45)"
                strokeWidth={1.15}
              />
              <text
                x={cx}
                y={cy - 3}
                textAnchor="middle"
                className="fill-[#A6B39E] text-[8.5px] font-medium pointer-events-none"
              >
                {centerLabel}
              </text>
              <text
                x={cx}
                y={cy + 9}
                textAnchor="middle"
                className="fill-[#FCF9FB] text-[11px] font-display font-bold tabular-nums pointer-events-none"
              >
                {centerValue}
              </text>
            </>
          ) : (
            <g transform={`rotate(-90 ${cx} ${cy})`}>
              <circle
                cx={cx}
                cy={cy}
                r={donutR}
                fill="#10180D"
                stroke="#182314"
                strokeWidth={stroke}
              />
              {segments.map((seg, idx) => {
                const pct = Math.max(0, Math.min(100, seg.share));
                const segLen = (pct / 100) * circ;
                const dashArray = `${Math.max(0, segLen - 3)} ${circ}`;
                const dashOffset = -((cumulativePct / 100) * circ);
                cumulativePct += pct;

                const strokeGrad =
                  seg.tone === 'pink'
                    ? `url(#pie_onyx_${uid})`
                    : seg.tone === 'lavender'
                    ? `url(#pie_graphite_${uid})`
                    : `url(#pie_carbon_${uid})`;

                const rimColor =
                  seg.tone === 'pink'
                    ? '#FAD9EA'
                    : seg.tone === 'lavender'
                    ? '#C5DBA9'
                    : 'rgba(250,217,234,0.34)';

                return (
                  <g
                    key={seg.label}
                    onMouseEnter={() => setHovered(idx)}
                    onMouseLeave={() => setHovered(null)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r={donutR}
                      fill="none"
                      stroke={strokeGrad}
                      strokeWidth={hovered === idx ? stroke + 3 : stroke}
                      strokeDasharray={dashArray}
                      strokeDashoffset={dashOffset}
                    />
                    <circle
                      cx={cx}
                      cy={cy}
                      r={donutR + stroke / 2}
                      fill="none"
                      stroke={rimColor}
                      strokeWidth={1.3}
                      strokeDasharray={dashArray}
                      strokeDashoffset={dashOffset}
                    />
                  </g>
                );
              })}
            </g>
          )}
        </svg>

        {variant === 'donut' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-[10.5px] text-[#A6B39E] font-medium">{centerLabel}</span>
            <span className="text-[20px] font-display font-bold text-[#FCF9FB] tabular-nums leading-tight mt-0.5">
              {centerValue}
            </span>
          </div>
        )}
      </div>

      {/* Right Olive-Pink Legend */}
      <div className="flex-1 w-full space-y-2.5">
        {segments.map((seg, idx) => {
          const swatchStyle =
            seg.tone === 'pink'
              ? 'bg-[#D87EA9] border-[#FFE6F3]'
              : seg.tone === 'lavender'
              ? 'bg-[#5B7546] border-[#DCF0C5]'
              : 'bg-[#2C3C23] border-[#F5A6CC]/60';

          return (
            <div
              key={seg.label}
              onMouseEnter={() => setHovered(idx)}
              onMouseLeave={() => setHovered(null)}
              className={`flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl border transition-all cursor-default ${
                hovered === idx
                  ? 'bg-[#2B3A23] border-[#F5A6CC]/60'
                  : 'bg-[#141D11] border-[#F5A6CC]/18'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`w-3 h-3 rounded-full border-[1.5px] shrink-0 ${swatchStyle}`} />
                <span className="text-xs text-[#CAD2C4] truncate">{seg.label}</span>
              </div>
              <span className="text-xs font-mono font-semibold text-[#FCF9FB] tabular-nums shrink-0">
                {seg.displayValue}
              </span>
            </div>
          );
        })}
      </div>

      {hovered !== null && segments[hovered]?.subtext && (
        <div className="glass-tooltip absolute -top-1 right-2 px-3 py-1 rounded-xl text-[11px] text-[#FDF8FC] pointer-events-none tabular-nums">
          {segments[hovered].subtext}
        </div>
      )}
    </div>
  );
};

/**
 * 3. Model Comparison Obsidian-Black Smoked Glass Chart
 */
export const ModelComparisonGlassChart: React.FC<{
  models: ModelReport[];
  metric: 'r2' | 'cv' | 'mae' | 'rmse';
  onSelectModel?: (key: ModelReport['key']) => void;
}> = ({ models, metric, onSelectModel }) => {
  const uid = useId().replace(/:/g, '');
  const [hovered, setHovered] = useState<number | null>(null);

  const items = models.map((m, i) => {
    const val =
      metric === 'r2'
        ? Math.max(0, m.testMetrics.r2)
        : metric === 'cv'
        ? Math.max(0, m.cvMetrics.meanR2)
        : metric === 'mae'
        ? m.testMetrics.mae
        : m.testMetrics.rmse;

    const shortLabel = m.name
      .replace(' Regressor', '')
      .replace('Gradient Boosting', 'Grad. Boost');

    const tones: GlassTone[] = ['pink', 'lavender', 'periwinkle', 'blush'];
    return {
      key: m.key,
      label: shortLabel,
      fullName: m.name,
      value: val,
      formatted: metric === 'r2' || metric === 'cv' ? val.toFixed(3) : val.toFixed(2),
      tone: tones[i % tones.length],
      report: m,
    };
  });

  const maxAxis =
    metric === 'r2' || metric === 'cv'
      ? 1.0
      : Math.max(3, Math.ceil(Math.max(...items.map((x) => x.value), 1)));
  const ticks = [0, 0.2, 0.4, 0.6, 0.8, 1.0].map((f) => Number((maxAxis * f).toFixed(1)));

  const w = 440;
  const h = 198;
  const padL = 34;
  const padR = 14;
  const padT = 22;
  const padB = 34;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  return (
    <div className="relative select-none chart-obsidian-well rounded-2xl p-2">
      <svg className="w-full h-[196px] overflow-visible" viewBox={`0 0 ${w} ${h}`}>
        <GlassSvgDefs prefix={uid} />

        {ticks.map((t, idx) => {
          const y = padT + plotH * (1 - t / maxAxis);
          return (
            <g key={idx}>
              <line
                x1={padL}
                x2={w - padR}
                y1={y}
                y2={y}
                stroke="rgba(255, 255, 255, 0.05)"
              />
              <text
                x={padL - 8}
                y={y + 3.5}
                textAnchor="end"
                className="fill-[#9C92A4] text-[9.5px] font-mono tabular-nums"
              >
                {t.toFixed(1)}
              </text>
            </g>
          );
        })}

        <line x1={padL} x2={padL} y1={padT} y2={padT + plotH} stroke="rgba(255,255,255,0.10)" />
        <line
          x1={padL}
          x2={w - padR}
          y1={padT + plotH}
          y2={padT + plotH}
          stroke="rgba(245,166,204,0.20)"
        />

        {items.map((item, idx) => {
          const slotW = plotW / items.length;
          const barW = Math.min(62, slotW * 0.58);
          const x = padL + idx * slotW + (slotW - barW) / 2;
          const barH = Math.max(8, (Math.min(maxAxis, item.value) / maxAxis) * plotH);
          const y = padT + (plotH - barH);
          const isHov = hovered === idx;

          return (
            <g
              key={item.key}
              onMouseEnter={() => setHovered(idx)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelectModel?.(item.key)}
              className="cursor-pointer"
            >
              <GlassColumn
                prefix={uid}
                x={x}
                y={y}
                width={barW}
                height={barH}
                trackTop={padT}
                trackHeight={plotH}
                rx={7}
                tone={item.tone}
                dimmed={hovered !== null && !isHov}
                hovered={isHov}
              />

              <text
                x={x + barW / 2}
                y={y - 7}
                textAnchor="middle"
                className="fill-[#FDF8FC] text-[10.5px] font-mono tabular-nums font-semibold"
              >
                {item.formatted}
              </text>

              <text
                x={x + barW / 2}
                y={padT + plotH + 17}
                textAnchor="middle"
                className="fill-[#BDB4C3] text-[10px] font-medium"
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>

      {hovered !== null && items[hovered] && (
        <div className="glass-tooltip absolute top-1 right-2 px-3 py-1.5 rounded-xl text-[11px] text-[#FDF8FC] pointer-events-none tabular-nums">
          <div className="font-semibold text-[#F8C6DF]">{items[hovered].fullName}</div>
          <div className="text-[#BDB4C3]">
            R² {items[hovered].report.testMetrics.r2.toFixed(3)} · MAE{' '}
            {items[hovered].report.testMetrics.mae.toFixed(2)} · RMSE{' '}
            {items[hovered].report.testMetrics.rmse.toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 4. Pitch-Black Obsidian Scatter Plot with Onyx Points & Thin Pink Trend Line
 */
export const StudyGradeScatterChart: React.FC<{
  rows: Record<string, any>[];
  xField: 'studytime' | 'G2' | 'G1' | 'absences';
  showTrend?: boolean;
}> = ({ rows, xField, showTrend = true }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const { points, slope, intercept, xMax, xTicks, xLabel } = useMemo(() => {
    const maxVal =
      xField === 'studytime'
        ? 4.5
        : xField === 'absences'
        ? Math.max(20, Math.min(40, ...rows.map((r) => Number(r.absences ?? 0))))
        : 20;

    const sampled = rows.slice(0, 260).map((r, idx) => {
      const rawX = Number(r[xField] ?? 0);
      const jitter =
        xField === 'studytime' ? (((idx * 37) % 100) / 100 - 0.5) * 0.44 : 0;
      const x = Math.max(0, Math.min(maxVal, rawX + jitter));
      const y = Math.max(0, Math.min(20, Number(r.G3 ?? 0)));
      return {
        idx,
        rawX,
        x,
        y,
        sex: String(r.sex ?? 'F'),
        age: Number(r.age ?? 16),
      };
    });

    const n = sampled.length || 1;
    const meanX = sampled.reduce((s, p) => s + p.rawX, 0) / n;
    const meanY = sampled.reduce((s, p) => s + p.y, 0) / n;
    let num = 0;
    let den = 0;
    for (const p of sampled) {
      num += (p.rawX - meanX) * (p.y - meanY);
      den += (p.rawX - meanX) ** 2;
    }
    const m = den > 0 ? num / den : 0;
    const b = meanY - m * meanX;

    const ticks =
      xField === 'studytime'
        ? [1, 2, 3, 4]
        : xField === 'absences'
        ? [0, Math.round(maxVal * 0.25), Math.round(maxVal * 0.5), Math.round(maxVal * 0.75), Math.round(maxVal)]
        : [0, 5, 10, 15, 20];

    const labelMap: Record<typeof xField, string> = {
      studytime: 'Weekly Study Time Category (1 = <2h … 4 = >10h)',
      G2: 'Second Period Grade G2 (0–20)',
      G1: 'First Period Grade G1 (0–20)',
      absences: 'School Absences (Days)',
    };

    return {
      points: sampled,
      slope: m,
      intercept: b,
      xMax: maxVal,
      xTicks: ticks,
      xLabel: labelMap[xField],
    };
  }, [rows, xField]);

  const w = 480;
  const h = 196;
  const padL = 42;
  const padR = 16;
  const padT = 14;
  const padB = 36;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const xMin = xField === 'studytime' ? 0.5 : 0;
  const toX = (v: number) => padL + ((v - xMin) / (xMax - xMin || 1)) * plotW;
  const toY = (v: number) => padT + plotH - (Math.max(0, Math.min(20, v)) / 20) * plotH;

  const xStart = xField === 'studytime' ? 0.7 : 0;
  const xEnd = xField === 'studytime' ? 4.3 : xMax;
  const yStart = Math.max(0, Math.min(20, slope * xStart + intercept));
  const yEnd = Math.max(0, Math.min(20, slope * xEnd + intercept));

  return (
    <div className="relative select-none chart-obsidian-well rounded-2xl p-2">
      <svg className="w-full h-[194px] overflow-visible" viewBox={`0 0 ${w} ${h}`}>
        {[0, 5, 10, 15, 20].map((yt) => (
          <g key={yt}>
            <line
              x1={padL}
              x2={w - padR}
              y1={toY(yt)}
              y2={toY(yt)}
              stroke="rgba(255, 255, 255, 0.05)"
            />
            <text
              x={padL - 8}
              y={toY(yt) + 3.5}
              textAnchor="end"
              className="fill-[#9C92A4] text-[9.5px] font-mono tabular-nums"
            >
              {yt}
            </text>
          </g>
        ))}

        {xTicks.map((xt) => (
          <g key={xt}>
            <line
              x1={toX(xt)}
              x2={toX(xt)}
              y1={padT}
              y2={padT + plotH}
              stroke="rgba(255, 255, 255, 0.04)"
            />
            <text
              x={toX(xt)}
              y={padT + plotH + 15}
              textAnchor="middle"
              className="fill-[#9C92A4] text-[9.5px] font-mono tabular-nums"
            >
              {xt}
            </text>
          </g>
        ))}

        <line x1={padL} x2={padL} y1={padT} y2={padT + plotH} stroke="rgba(255,255,255,0.10)" />
        <line
          x1={padL}
          x2={w - padR}
          y1={padT + plotH}
          y2={padT + plotH}
          stroke="rgba(245,166,204,0.20)"
        />

        <text
          x={13}
          y={padT + plotH / 2}
          textAnchor="middle"
          transform={`rotate(-90 13 ${padT + plotH / 2})`}
          className="fill-[#7D7485] text-[9.5px]"
        >
          Final Grade (G3)
        </text>

        {/* Rose-Pink & Botanical Olive-Sage Glass Scatter Points */}
        {points.map((pt) => {
          const isHov = hoveredIdx === pt.idx;
          const isFemale = pt.sex === 'F';
          return (
            <circle
              key={pt.idx}
              cx={toX(pt.x)}
              cy={toY(pt.y)}
              r={isHov ? 5.2 : 3.2}
              fill={isFemale ? '#B8638E' : '#3C5230'}
              stroke={isHov ? '#FFFFFF' : isFemale ? '#FFE3F1' : '#C5DBA9'}
              strokeWidth={isHov ? 1.6 : 1.05}
              onMouseEnter={() => setHoveredIdx(pt.idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-pointer transition-all"
            />
          );
        })}

        {/* Luminous Blush-Pink Trend Line */}
        {showTrend && points.length >= 2 && (
          <line
            x1={toX(xStart)}
            y1={toY(yStart)}
            x2={toX(xEnd)}
            y2={toY(yEnd)}
            stroke="#F5A6CC"
            strokeWidth={2.1}
            strokeLinecap="round"
          />
        )}

        <text
          x={padL + plotW / 2}
          y={h - 3}
          textAnchor="middle"
          className="fill-[#97A390] text-[9.5px]"
        >
          {xLabel}
        </text>
      </svg>

      {hoveredIdx !== null && points[hoveredIdx] && (
        <div className="glass-tooltip absolute top-2 right-3 px-3 py-1.5 rounded-xl text-[11px] text-[#FCF9FB] pointer-events-none tabular-nums">
          <span className="font-semibold text-[#FAD9EA]">
            {points[hoveredIdx].sex === 'F' ? 'Female' : 'Male'} ({points[hoveredIdx].age}y):
          </span>{' '}
          <span>
            {xField} = {points[hoveredIdx].rawX} → G3 = {points[hoveredIdx].y}/20
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * Circular Olive-Pink Metric Ring
 */
export const CircularMetricRing: React.FC<{
  percentage: number;
  label?: string;
}> = ({ percentage, label = '%' }) => {
  const uid = useId().replace(/:/g, '');
  const clamped = Math.max(0, Math.min(100, percentage));
  const size = 108;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - clamped / 100);

  return (
    <div
      className="relative inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={`ring_${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FAD9EA" />
            <stop offset="60%" stopColor="#F8C6DF" />
            <stop offset="100%" stopColor="#465D37" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="#11190E"
          stroke="rgba(250,217,234,0.10)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#ring_${uid})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 320ms cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-display font-semibold text-[#FDF8FC] tabular-nums leading-none">
          {Math.round(clamped)}
        </span>
        <span className="text-[10px] text-[#9C92A4] font-mono mt-0.5">{label}</span>
      </div>
    </div>
  );
};

/**
 * Obsidian-Black Smoked Glass Vertical Bar Chart
 */
export const SculptedBarChart: React.FC<{
  data: { label: string; value: number; subtext?: string; count?: number; active?: boolean }[];
  maxVal?: number;
  unit?: string;
  accent?: 'rose' | 'lavender' | 'cyan';
  height?: number;
  capsuleLabels?: boolean;
}> = ({ data, maxVal = 20, unit = '', accent = 'rose', height = 215, capsuleLabels = false }) => {
  const uid = useId().replace(/:/g, '');
  const [hovered, setHovered] = useState<number | null>(null);

  if (!data.length) {
    return (
      <div className="chart-obsidian-well rounded-2xl flex items-center justify-center h-44 text-xs text-[#8C8393]">
        No matching students for current filter selection.
      </div>
    );
  }

  const computedMax = Math.max(maxVal, ...data.map((d) => d.value), 1);
  const peakVal = Math.max(...data.map((d) => d.value));
  const defaultTone: GlassTone =
    accent === 'lavender' ? 'lavender' : accent === 'cyan' ? 'periwinkle' : 'pink';

  return (
    <div className="relative select-none chart-obsidian-well rounded-2xl p-2" style={{ height }}>
      <svg className="w-full h-full overflow-visible" viewBox={`0 0 420 ${height}`}>
        <GlassSvgDefs prefix={uid} />

        {[0.25, 0.5, 0.75, 1].map((frac, idx) => {
          const usableH = height - (capsuleLabels ? 70 : 60);
          const y = 22 + usableH * (1 - frac);
          return (
            <line
              key={idx}
              x1={8}
              x2={412}
              y1={y}
              y2={y}
              stroke="rgba(255,255,255,0.045)"
              strokeDasharray="2 4"
            />
          );
        })}

        {data.map((item, idx) => {
          const slotW = 400 / data.length;
          const barW = Math.min(72, Math.max(26, slotW * 0.64));
          const x = 10 + idx * slotW + (slotW - barW) / 2;
          const usableH = height - (capsuleLabels ? 70 : 60);
          const barH = Math.max(14, (item.value / computedMax) * usableH);
          const y = 22 + (usableH - barH);
          const isHov = hovered === idx;
          const isHighlight = item.active || item.value === peakVal;

          return (
            <g
              key={item.label}
              onMouseEnter={() => setHovered(idx)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer"
            >
              <GlassColumn
                prefix={uid}
                x={x}
                y={y}
                width={barW}
                height={barH}
                trackTop={22}
                trackHeight={usableH}
                rx={9}
                tone={isHighlight && defaultTone === 'pink' ? 'blush' : defaultTone}
                dimmed={hovered !== null && !isHov}
                hovered={isHov}
              />

              <text
                x={x + barW / 2}
                y={y - 7}
                textAnchor="middle"
                className="fill-[#FDF8FC] text-[11px] font-mono tabular-nums font-semibold"
              >
                {item.value}
                {unit}
              </text>

              {capsuleLabels ? (
                <g>
                  <rect
                    x={x}
                    y={height - 34}
                    width={barW}
                    height={23}
                    rx={11.5}
                    fill="#141E11"
                    stroke={
                      isHighlight || isHov
                        ? 'rgba(250, 217, 234, 0.50)'
                        : 'rgba(250, 217, 234, 0.14)'
                    }
                    strokeWidth={1}
                  />
                  <text
                    x={x + barW / 2}
                    y={height - 19}
                    textAnchor="middle"
                    className="fill-[#FDF8FC] text-[10px] font-medium"
                  >
                    {item.label}
                  </text>
                </g>
              ) : (
                <>
                  <text
                    x={x + barW / 2}
                    y={height - 16}
                    textAnchor="middle"
                    className="fill-[#BDB4C3] text-[10.5px] font-medium"
                  >
                    {item.label}
                  </text>
                  {item.count !== undefined && (
                    <text
                      x={x + barW / 2}
                      y={height - 3}
                      textAnchor="middle"
                      className="fill-[#7D7485] text-[9.5px] font-mono tabular-nums"
                    >
                      n={item.count}
                    </text>
                  )}
                </>
              )}
            </g>
          );
        })}
      </svg>

      {hovered !== null && data[hovered]?.subtext && (
        <div className="glass-tooltip absolute top-1 right-2 px-3 py-1.5 rounded-xl text-[11px] text-[#FDF8FC] pointer-events-none">
          <span className="font-semibold text-[#F8C6DF]">{data[hovered].label}:</span>{' '}
          <span className="tabular-nums text-[#BDB4C3]">{data[hovered].subtext}</span>
        </div>
      )}
    </div>
  );
};

/**
 * Interactive 0–20 Grade Score Matrix Grid in Pitch-Black Glass
 */
export const GradeScoreMatrix: React.FC<{
  data: { grade: number; count: number; status: string }[];
  totalStudents: number;
}> = ({ data, totalStudents }) => {
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const peakGrade = data.reduce(
    (best, cur) => (cur.count > best.count ? cur : best),
    data[0] || { grade: 10, count: 0, status: 'Pass' }
  ).grade;

  const activeGrade = selectedGrade !== null ? selectedGrade : peakGrade;
  const activeObj = data.find((d) => d.grade === activeGrade) || {
    grade: activeGrade,
    count: 0,
    status: activeGrade >= 10 ? 'Pass' : 'Fail',
  };
  const share = totalStudents > 0 ? ((activeObj.count * 100) / totalStudents).toFixed(1) : '0.0';
  const tierHeaders = ['F', 'F', 'P', 'P', 'G', 'A', 'A+'];

  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between text-xs text-[#BDB4C3] mb-3">
          <span className="font-medium text-[#FDF8FC]">G3 Score Matrix (0–20)</span>
          <span className="font-mono tabular-nums text-[11px] text-[#F8C6DF]">
            Modal G3 = {peakGrade}/20
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center mb-1.5">
          {tierHeaders.map((h, i) => (
            <span key={i} className="text-[10px] font-mono text-[#7D7485]">
              {h}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {data.map((cell) => {
            const isSelected = cell.grade === activeGrade;
            const hasStudents = cell.count > 0;
            const isPassing = cell.grade >= 10;
            return (
              <button
                key={cell.grade}
                type="button"
                onClick={() => setSelectedGrade(cell.grade)}
                onMouseEnter={() => setSelectedGrade(cell.grade)}
                className={`h-8 rounded-full text-xs font-mono tabular-nums transition-all flex items-center justify-center ${
                  isSelected
                    ? 'glass-pill-active font-semibold scale-105'
                    : isPassing && hasStudents
                    ? 'text-[#FCF9FB] bg-[#162112] hover:bg-[#23321C] border border-[#FAD9EA]/25'
                    : hasStudents
                    ? 'text-[#CAD2C4] bg-[#0F160C] hover:bg-[#192414]'
                    : 'text-[#55634D]'
                }`}
              >
                {cell.grade}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] tabular-nums">
        <span className="text-[#BDB4C3]">
          Grade <strong className="text-[#FDF8FC] font-mono">{activeObj.grade}/20</strong> (
          {activeObj.status})
        </span>
        <span className="font-mono text-[#F8C6DF]">
          {activeObj.count} students ({share}%)
        </span>
      </div>
    </div>
  );
};

/**
 * Full 0–20 Final Grade (G3) Obsidian-Black Histogram
 */
export const GradeDistributionChart: React.FC<{
  data: { grade: number; count: number; status: string }[];
}> = ({ data }) => {
  const uid = useId().replace(/:/g, '');
  const [hovered, setHovered] = useState<number | null>(null);
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const h = 218;
  const usableH = 160;

  return (
    <div className="relative chart-obsidian-well rounded-2xl p-2">
      <svg className="w-full h-[214px] overflow-visible" viewBox={`0 0 540 ${h}`}>
        <GlassSvgDefs prefix={uid} />

        {[0.25, 0.5, 0.75, 1].map((f, i) => {
          const y = 18 + usableH * (1 - f);
          return (
            <g key={i}>
              <line x1={28} x2={532} y1={y} y2={y} stroke="rgba(255,255,255,0.045)" />
              <text
                x={22}
                y={y + 3}
                textAnchor="end"
                className="fill-[#9C92A4] text-[9.5px] font-mono tabular-nums"
              >
                {Math.round(maxCount * f)}
              </text>
            </g>
          );
        })}

        <line
          x1={28 + 10 * 24 - 2}
          x2={28 + 10 * 24 - 2}
          y1={10}
          y2={180}
          stroke="#F5A6CC"
          strokeOpacity={0.7}
          strokeWidth={1.2}
          strokeDasharray="3 3"
        />
        <text x={28 + 10 * 24 + 6} y={18} className="fill-[#F8C6DF] text-[10px] font-medium">
          Pass Threshold (G3 ≥ 10)
        </text>

        {data.map((d, idx) => {
          const x = 30 + idx * 24;
          const barH = d.count === 0 ? 3 : Math.max(6, (d.count / maxCount) * usableH);
          const y = 18 + (usableH - barH);
          const isHov = hovered === idx;
          return (
            <g
              key={d.grade}
              onMouseEnter={() => setHovered(idx)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer"
            >
              <GlassColumn
                prefix={uid}
                x={x}
                y={y}
                width={18}
                height={barH}
                trackTop={18}
                trackHeight={usableH}
                rx={5}
                tone={d.grade >= 10 ? 'pink' : 'lavender'}
                dimmed={hovered !== null && !isHov}
                hovered={isHov}
              />
              <text
                x={x + 9}
                y={196}
                textAnchor="middle"
                className="fill-[#9C92A4] text-[10px] font-mono tabular-nums"
              >
                {d.grade}
              </text>
            </g>
          );
        })}
      </svg>

      {hovered !== null && data[hovered] && (
        <div className="glass-tooltip absolute top-2 right-3 px-3 py-1.5 rounded-xl text-xs text-[#FCF9FB] pointer-events-none tabular-nums">
          Grade <span className="font-semibold text-[#FAD9EA]">{data[hovered].grade}/20</span> ·{' '}
          <span className="text-[#CAD2C4]">{data[hovered].count} students</span> ·{' '}
          <span className={data[hovered].grade >= 10 ? 'text-[#FAD9EA]' : 'text-[#D6E8BE]'}>
            {data[hovered].status}
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * Longitudinal Period Trajectory Chart in Smoked Olive Glass
 */
export const PeriodProgressionChart: React.FC<{
  data: { period: string; passingAvg: number; failingAvg: number; overallAvg: number }[];
}> = ({ data }) => {
  const uid = useId().replace(/:/g, '');
  if (!data.length) return null;

  return (
    <div className="chart-obsidian-well rounded-2xl p-3">
      <div className="flex items-center justify-end gap-5 mb-2 text-[11px] text-[#CAD2C4]">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#C66E9A] border border-[#FFE3F1] inline-block" />
          Passing Cohort (G3 ≥ 10)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#3A4F2E] border border-[#C5DBA9] inline-block" />
          Overall Mean
        </span>
      </div>
      <svg className="w-full h-[188px] overflow-visible" viewBox="0 0 440 195">
        <GlassSvgDefs prefix={uid} />
        {data.map((d, idx) => {
          const slot = 410 / data.length;
          const xBase = 20 + idx * slot + slot * 0.16;
          const barW = 34;
          const usableH = 136;
          const hPass = Math.max(8, (d.passingAvg / 18) * usableH);
          const hAll = Math.max(8, (d.overallAvg / 18) * usableH);
          const yPass = 20 + (usableH - hPass);
          const yAll = 20 + (usableH - hAll);

          return (
            <g key={d.period}>
              <GlassColumn
                prefix={uid}
                x={xBase}
                y={yPass}
                width={barW}
                height={hPass}
                trackTop={20}
                trackHeight={usableH}
                rx={8}
                tone="pink"
              />
              <text
                x={xBase + barW / 2}
                y={yPass - 6}
                textAnchor="middle"
                className="fill-[#FDF8FC] text-[10px] font-mono tabular-nums font-medium"
              >
                {d.passingAvg}
              </text>

              <GlassColumn
                prefix={uid}
                x={xBase + barW + 8}
                y={yAll}
                width={barW}
                height={hAll}
                trackTop={20}
                trackHeight={usableH}
                rx={8}
                tone="lavender"
              />
              <text
                x={xBase + barW + 8 + barW / 2}
                y={yAll - 6}
                textAnchor="middle"
                className="fill-[#BDB4C3] text-[10px] font-mono tabular-nums"
              >
                {d.overallAvg}
              </text>

              <text
                x={xBase + barW + 4}
                y={178}
                textAnchor="middle"
                className="fill-[#BDB4C3] text-[11px] font-medium"
              >
                {d.period}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/**
 * Age-wise Trajectory on Pitch-Black Obsidian Canvas
 */
export const AgeTrajectoryChart: React.FC<{
  data: { age: number; avgG3: number; passRate: number; count: number }[];
}> = ({ data }) => {
  const uid = useId().replace(/:/g, '');
  const [hovered, setHovered] = useState<number | null>(null);
  if (data.length < 2) {
    return (
      <div className="chart-obsidian-well rounded-2xl flex items-center justify-center h-44 text-xs text-[#8C8393]">
        Select at least 2 age cohorts to inspect age trajectory.
      </div>
    );
  }
  const w = 420;
  const h = 205;
  const padX = 34;
  const usableW = w - padX * 2;
  const usableH = 140;
  const maxY = 16;
  const minY = 4;

  const pts = data.map((d, i) => ({
    ...d,
    x: padX + (i / (data.length - 1)) * usableW,
    y: 22 + usableH - ((Math.max(minY, Math.min(maxY, d.avgG3)) - minY) / (maxY - minY)) * usableH,
  }));

  const linePath = pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');
  const areaPath = `${linePath} L ${pts[pts.length - 1].x.toFixed(1)} ${22 + usableH} L ${pts[0].x.toFixed(1)} ${22 + usableH} Z`;

  return (
    <div className="relative chart-obsidian-well rounded-2xl p-2">
      <svg className="w-full h-[200px] overflow-visible" viewBox={`0 0 ${w} ${h}`}>
        <defs>
          <linearGradient id={`ageArea_${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E88DBB" stopOpacity="0.48" />
            <stop offset="55%" stopColor="#485E38" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#11190E" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        {[6, 10, 14].map((g) => {
          const y = 22 + usableH - ((g - minY) / (maxY - minY)) * usableH;
          return (
            <g key={g}>
              <line
                x1={padX}
                x2={w - padX}
                y1={y}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="3 3"
              />
              <text
                x={padX - 8}
                y={y + 3}
                textAnchor="end"
                className="fill-[#A6B39E] text-[10px] font-mono tabular-nums"
              >
                {g}
              </text>
            </g>
          );
        })}
        <path d={areaPath} fill={`url(#ageArea_${uid})`} />
        <path d={linePath} fill="none" stroke="#F5A6CC" strokeWidth="2.1" strokeLinecap="round" />
        {pts.map((p, idx) => (
          <g
            key={p.age}
            onMouseEnter={() => setHovered(idx)}
            onMouseLeave={() => setHovered(null)}
            className="cursor-pointer"
          >
            <circle
              cx={p.x}
              cy={p.y}
              r={hovered === idx ? 5.6 : 4.2}
              fill="#A85980"
              stroke="#FFE6F3"
              strokeWidth={1.8}
            />
            <text
              x={p.x}
              y={p.y - 10}
              textAnchor="middle"
              className="fill-[#FDF8FC] text-[10px] font-mono tabular-nums"
            >
              {p.avgG3}
            </text>
            <text
              x={p.x}
              y={184}
              textAnchor="middle"
              className="fill-[#BDB4C3] text-[11px] font-mono tabular-nums"
            >
              {p.age}y
            </text>
            <text
              x={p.x}
              y={197}
              textAnchor="middle"
              className="fill-[#7D7485] text-[9px] font-mono tabular-nums"
            >
              n={p.count}
            </text>
          </g>
        ))}
      </svg>
      {hovered !== null && pts[hovered] && (
        <div className="glass-tooltip absolute top-1 right-2 px-3 py-1 rounded-xl text-xs text-[#FDF8FC] tabular-nums">
          Age {pts[hovered].age}: Avg{' '}
          <span className="text-[#F8C6DF] font-semibold">{pts[hovered].avgG3}/20</span> · Pass{' '}
          {pts[hovered].passRate}%
        </div>
      )}
    </div>
  );
};

/**
 * Dual Grouped Obsidian-Black vs Graphite-Black Glass Bar Chart
 */
export const GroupedBarsChart: React.FC<{
  categories: string[];
  seriesA: { name: string; values: number[]; color?: string };
  seriesB: { name: string; values: number[]; color?: string };
  maxVal?: number;
}> = ({ categories, seriesA, seriesB, maxVal = 16 }) => {
  const uid = useId().replace(/:/g, '');
  const computedMax = Math.max(maxVal, ...seriesA.values, ...seriesB.values, 1);
  const h = 210;
  const usableH = 142;

  return (
    <div className="chart-obsidian-well rounded-2xl p-3">
      <div className="flex items-center justify-end gap-5 mb-1 text-[11px] text-[#CAD2C4]">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#C66E9A] border border-[#FFE3F1] inline-block" />
          {seriesA.name}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#3A4F2E] border border-[#C5DBA9] inline-block" />
          {seriesB.name}
        </span>
      </div>
      <svg className="w-full h-[188px] overflow-visible" viewBox={`0 0 440 ${h}`}>
        <GlassSvgDefs prefix={uid} />
        {categories.map((cat, idx) => {
          const slot = 420 / categories.length;
          const xBase = 12 + idx * slot + slot * 0.14;
          const barW = Math.min(28, slot * 0.32);
          const hA = Math.max(6, (seriesA.values[idx] / computedMax) * usableH);
          const hB = Math.max(6, (seriesB.values[idx] / computedMax) * usableH);
          const yA = 20 + (usableH - hA);
          const yB = 20 + (usableH - hB);

          return (
            <g key={cat}>
              <GlassColumn
                prefix={uid}
                x={xBase}
                y={yA}
                width={barW}
                height={hA}
                trackTop={20}
                trackHeight={usableH}
                rx={6}
                tone="pink"
              />
              <text
                x={xBase + barW / 2}
                y={yA - 5}
                textAnchor="middle"
                className="fill-[#FDF8FC] text-[9.5px] font-mono tabular-nums"
              >
                {seriesA.values[idx]}
              </text>

              <GlassColumn
                prefix={uid}
                x={xBase + barW + 6}
                y={yB}
                width={barW}
                height={hB}
                trackTop={20}
                trackHeight={usableH}
                rx={6}
                tone="lavender"
              />
              <text
                x={xBase + barW + 6 + barW / 2}
                y={yB - 5}
                textAnchor="middle"
                className="fill-[#BDB4C3] text-[9.5px] font-mono tabular-nums"
              >
                {seriesB.values[idx]}
              </text>

              <text
                x={xBase + barW + 3}
                y={184}
                textAnchor="middle"
                className="fill-[#BDB4C3] text-[10.5px]"
              >
                {cat}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/**
 * 8. Obsidian-Black Smoked Glass Correlation Heatmap
 */
export const CorrelationHeatmap: React.FC<{
  columns: string[];
  matrix: number[][];
}> = ({ columns, matrix }) => {
  const [hoverCell, setHoverCell] = useState<{ r: number; c: number; val: number } | null>(null);
  if (!columns.length || !matrix.length) return null;

  const cellStyle = (val: number): React.CSSProperties => {
    const mag = Math.abs(val);
    if (val >= 0.45) {
      return {
        background: `linear-gradient(155deg, rgba(${Math.round(135 + mag * 82)}, ${Math.round(68 + mag * 56)}, ${Math.round(102 + mag * 72)}, 0.78) 0%, rgba(30, 35, 24, 0.94) 100%)`,
        borderColor: `rgba(250, 211, 231, ${(0.32 + mag * 0.38).toFixed(2)})`,
        boxShadow: 'inset 0 1px 0 rgba(255,238,247,0.22)',
      };
    }
    if (val >= 0) {
      return {
        background: `linear-gradient(155deg, rgba(${Math.round(36 + mag * 62)}, ${Math.round(49 + mag * 50)}, ${Math.round(30 + mag * 36)}, 0.92) 0%, rgba(18, 25, 15, 0.96) 100%)`,
        borderColor: `rgba(245, 166, 204, ${(0.14 + mag * 0.28).toFixed(2)})`,
        boxShadow: 'inset 0 1px 0 rgba(255,240,248,0.12)',
      };
    }
    return {
      background: `linear-gradient(155deg, rgba(${Math.round(28 + mag * 34)}, ${Math.round(42 + mag * 44)}, ${Math.round(24 + mag * 26)}, 0.94) 0%, rgba(15, 22, 13, 0.96) 100%)`,
      borderColor: `rgba(197, 219, 169, ${(0.18 + mag * 0.36).toFixed(2)})`,
      boxShadow: 'inset 0 1px 0 rgba(235,246,224,0.10)',
    };
  };

  return (
    <div className="overflow-x-auto chart-obsidian-well rounded-2xl p-4 mt-2">
      <div className="flex items-center justify-between mb-3 text-xs text-[#A6B39E]">
        <span>Pearson Correlation Coefficient (r) across numerical student attributes</span>
        {hoverCell && (
          <span className="font-mono tabular-nums text-[#FAD9EA]">
            corr({columns[hoverCell.r]}, {columns[hoverCell.c]}) = {hoverCell.val.toFixed(2)}
          </span>
        )}
      </div>
      <div
        className="grid gap-1.5 min-w-[540px]"
        style={{
          gridTemplateColumns: `76px repeat(${columns.length}, minmax(48px, 1fr))`,
        }}
      >
        <div />
        {columns.map((col) => (
          <div
            key={col}
            className="text-center text-[11px] font-semibold text-[#FCF9FB] py-1 truncate"
          >
            {col}
          </div>
        ))}

        {matrix.map((row, rIdx) => (
          <React.Fragment key={columns[rIdx]}>
            <div className="flex items-center justify-end pr-2 text-[11px] font-semibold text-[#CAD2C4]">
              {columns[rIdx]}
            </div>
            {row.map((val, cIdx) => (
              <div
                key={`${rIdx}-${cIdx}`}
                onMouseEnter={() => setHoverCell({ r: rIdx, c: cIdx, val })}
                onMouseLeave={() => setHoverCell(null)}
                style={cellStyle(val)}
                className="h-10 rounded-xl flex items-center justify-center text-[11px] font-mono tabular-nums transition-transform duration-150 hover:scale-[1.04] border cursor-default"
              >
                <span
                  className={
                    val >= 0.7
                      ? 'font-bold text-[#FAD9EA]'
                      : val < -0.2
                      ? 'text-[#D6E8BE]'
                      : 'text-[#CAD2C4]'
                  }
                >
                  {val.toFixed(2)}
                </span>
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

/**
 * 7. Actual vs Predicted Olive-Glass Scatter Plot with Light-Pink Diagonal
 */
export const ActualVsPredictedScatter: React.FC<{
  points: ScatterPoint[];
}> = ({ points }) => {
  const [hovered, setHovered] = useState<ScatterPoint | null>(null);
  const w = 440;
  const h = 270;
  const padL = 38;
  const padB = 34;
  const padT = 16;
  const padR = 18;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const toX = (v: number) => padL + (Math.max(0, Math.min(20, v)) / 20) * plotW;
  const toY = (v: number) => padT + plotH - (Math.max(0, Math.min(20, v)) / 20) * plotH;

  return (
    <div className="relative chart-obsidian-well rounded-2xl p-2">
      <svg className="w-full h-[266px] overflow-visible" viewBox={`0 0 ${w} ${h}`}>
        {[0, 5, 10, 15, 20].map((tick) => (
          <g key={tick}>
            <line
              x1={padL}
              x2={w - padR}
              y1={toY(tick)}
              y2={toY(tick)}
              stroke="rgba(255,255,255,0.06)"
            />
            <line
              x1={toX(tick)}
              x2={toX(tick)}
              y1={padT}
              y2={h - padB}
              stroke="rgba(255,255,255,0.045)"
            />
            <text
              x={padL - 8}
              y={toY(tick) + 3}
              textAnchor="end"
              className="fill-[#A6B39E] text-[10px] font-mono tabular-nums"
            >
              {tick}
            </text>
            <text
              x={toX(tick)}
              y={h - padB + 15}
              textAnchor="middle"
              className="fill-[#A6B39E] text-[10px] font-mono tabular-nums"
            >
              {tick}
            </text>
          </g>
        ))}

        <line
          x1={toX(0)}
          y1={toY(0)}
          x2={toX(20)}
          y2={toY(20)}
          stroke="#F5A6CC"
          strokeOpacity={0.85}
          strokeWidth={1.6}
          strokeDasharray="4 4"
        />
        <text x={toX(13.6)} y={toY(16.4)} className="fill-[#FAD3E7] text-[10px] font-medium">
          Ideal Fit (y = x)
        </text>

        {points.map((pt) => {
          const isHov = hovered?.id === pt.id;
          const closeFit = Math.abs(pt.residual) <= 2;
          return (
            <circle
              key={pt.id}
              cx={toX(pt.actual)}
              cy={toY(pt.predicted)}
              r={isHov ? 6.4 : 4.4}
              fill={closeFit ? '#B6638D' : '#35482B'}
              stroke={isHov ? '#FFFFFF' : closeFit ? '#FFE3F1' : '#C5DBA9'}
              strokeWidth={isHov ? 1.8 : 1.15}
              onMouseEnter={() => setHovered(pt)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer transition-all"
            />
          );
        })}

        <text x={w / 2} y={h - 3} textAnchor="middle" className="fill-[#97A390] text-[11px]">
          Actual Held-Out Test Grade G3 (0–20)
        </text>
      </svg>

      {hovered && (
        <div className="glass-tooltip absolute top-3 left-12 px-3 py-2 rounded-xl text-xs text-[#FCF9FB] pointer-events-none tabular-nums">
          <div className="font-semibold text-[#FAD9EA]">Test Student #{hovered.id}</div>
          <div className="text-[#CAD2C4]">
            Actual: <b className="text-white">{hovered.actual}</b> · Predicted:{' '}
            <b className="text-white">{hovered.predicted}</b> · Residual:{' '}
            <span
              className={
                Math.abs(hovered.residual) <= 1.5 ? 'text-[#FAD9EA]' : 'text-[#D6E8BE]'
              }
            >
              {hovered.residual > 0 ? `+${hovered.residual}` : hovered.residual}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 9. Residual Distribution Smoked-Olive Histogram + Light-Pink Density Curve
 */
export const ResidualHistogram: React.FC<{ bins: ResidualBin[] }> = ({ bins }) => {
  const uid = useId().replace(/:/g, '');
  const [hovered, setHovered] = useState<number | null>(null);
  const maxC = Math.max(...bins.map((b) => b.count), 1);
  const h = 235;
  const usableH = 165;

  const slot = bins.length ? 410 / bins.length : 30;
  const barW = Math.max(16, slot - 6);

  const curvePts = bins.map((b, i) => ({
    x: 18 + i * slot + barW / 2,
    y: 22 + usableH - (b.count / maxC) * usableH,
  }));

  let curvePath = '';
  if (curvePts.length >= 2) {
    curvePath = `M ${curvePts[0].x.toFixed(1)} ${curvePts[0].y.toFixed(1)}`;
    for (let i = 0; i < curvePts.length - 1; i++) {
      const cx = (curvePts[i].x + curvePts[i + 1].x) / 2;
      curvePath += ` C ${cx.toFixed(1)} ${curvePts[i].y.toFixed(1)}, ${cx.toFixed(1)} ${curvePts[i + 1].y.toFixed(1)}, ${curvePts[i + 1].x.toFixed(1)} ${curvePts[i + 1].y.toFixed(1)}`;
    }
  }

  return (
    <div className="relative chart-obsidian-well rounded-2xl p-2">
      <svg className="w-full h-[231px] overflow-visible" viewBox={`0 0 440 ${h}`}>
        <GlassSvgDefs prefix={uid} />
        {bins.map((b, i) => {
          const x = 18 + i * slot;
          const barH = b.count === 0 ? 3 : Math.max(6, (b.count / maxC) * usableH);
          const y = 22 + (usableH - barH);
          const isZeroCenter = Math.abs(b.binCenter) < 0.9;
          const isHov = hovered === i;

          return (
            <g
              key={b.range}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer"
            >
              <GlassColumn
                prefix={uid}
                x={x}
                y={y}
                width={barW}
                height={barH}
                trackTop={22}
                trackHeight={usableH}
                rx={6}
                tone={isZeroCenter ? 'pink' : 'lavender'}
                dimmed={hovered !== null && !isHov}
                hovered={isHov}
              />
              {b.count > 0 && (
                <text
                  x={x + barW / 2}
                  y={y - 5}
                  textAnchor="middle"
                  className="fill-[#FCF9FB] text-[9.5px] font-mono tabular-nums"
                >
                  {b.count}
                </text>
              )}
              <text
                x={x + barW / 2}
                y={204}
                textAnchor="middle"
                className="fill-[#A6B39E] text-[9.5px] font-mono tabular-nums"
              >
                {b.binLabel}
              </text>
            </g>
          );
        })}

        {curvePath && (
          <path
            d={curvePath}
            fill="none"
            stroke="#FAD9EA"
            strokeWidth={1.7}
            strokeLinecap="round"
          />
        )}

        <text x={220} y={226} textAnchor="middle" className="fill-[#97A390] text-[11px]">
          Residual Error (y_actual − y_predicted)
        </text>
      </svg>

      {hovered !== null && bins[hovered] && (
        <div className="glass-tooltip absolute top-2 right-3 px-3 py-1 rounded-xl text-xs text-[#FCF9FB] pointer-events-none tabular-nums">
          Bin <span className="text-[#FAD9EA] font-semibold">{bins[hovered].range}</span>:{' '}
          {bins[hovered].count} test students
        </div>
      )}
    </div>
  );
};

/**
 * 6. Horizontal Smoked-Olive + Light-Pink Feature Importance Bars
 */
export const FeatureImportanceBars: React.FC<{ items: FeatureImportanceItem[] }> = ({ items }) => {
  const maxPct = Math.max(...items.map((i) => i.percentage), 1);
  return (
    <div className="chart-obsidian-well rounded-2xl p-4 space-y-3">
      {items.map((item, idx) => {
        const widthPct = Math.max(4, (item.percentage / maxPct) * 100);
        return (
          <div key={item.feature} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#FCF9FB] font-medium">
                <span className="text-[#97A390] font-mono mr-2">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                {item.label}
              </span>
              <span className="font-mono tabular-nums text-[#FAD9EA] font-semibold">
                {item.percentage.toFixed(1)}%
              </span>
            </div>
            <div className="h-3.5 w-full rounded-full bg-[#0F160C] border border-[#F5A6CC]/20 p-[1px] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${widthPct}%`,
                  background:
                    idx === 0
                      ? 'linear-gradient(90deg, #324427 0%, #A95C83 55%, #FAD3E7 100%)'
                      : idx <= 2
                      ? 'linear-gradient(90deg, #27361F 0%, #8A506D 68%, #F5A6CC 100%)'
                      : 'linear-gradient(90deg, #1E2918 0%, #526B3F 100%)',
                  boxShadow: 'inset 0 1px 0 rgba(255,242,249,0.28)',
                  border: '1px solid rgba(250, 211, 231, 0.48)',
                  borderRight: '2px solid #FFE3F1',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Semi-Circular Smoked-Olive + Blush Rose-Pink Grade Gauge
 */
export const GradeGauge: React.FC<{ score: number }> = ({ score }) => {
  const uid = useId().replace(/:/g, '');
  const clamped = Math.max(0, Math.min(20, score));
  const ratio = clamped / 20;
  const radius = 84;
  const cx = 120;
  const cy = 108;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference * (1 - ratio);

  return (
    <div className="chart-obsidian-well rounded-2xl px-4 pt-3 pb-2 flex flex-col items-center">
      <svg width="240" height="136" viewBox="0 0 240 136" className="overflow-visible">
        <defs>
          <linearGradient id={`gauge_${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4A633A" />
            <stop offset="52%" stopColor="#C9739D" />
            <stop offset="100%" stopColor="#FAD3E7" />
          </linearGradient>
        </defs>

        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="#0F160C"
          strokeWidth="16"
          strokeLinecap="round"
        />

        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="rgba(250,217,234,0.10)"
          strokeWidth="14"
          strokeLinecap="round"
        />

        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke={`url(#gauge_${uid})`}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 320ms cubic-bezier(0.16, 1, 0.3, 1)' }}
        />

        <line
          x1={cx}
          y1={cy - radius - 10}
          x2={cx}
          y2={cy - radius + 10}
          stroke="#FAD9EA"
          strokeWidth="2"
        />
        <text
          x={cx}
          y={cy - radius - 14}
          textAnchor="middle"
          className="fill-[#FAD9EA] text-[10px] font-mono"
        >
          Pass 10
        </text>

        <text
          x={cx - radius}
          y={cy + 20}
          textAnchor="middle"
          className="fill-[#97A390] text-[10px] font-mono"
        >
          0
        </text>
        <text
          x={cx + radius}
          y={cy + 20}
          textAnchor="middle"
          className="fill-[#97A390] text-[10px] font-mono"
        >
          20
        </text>

        <text
          x={cx}
          y={cy - 12}
          textAnchor="middle"
          className="fill-[#FCF9FB] text-[34px] font-display font-bold tabular-nums"
        >
          {clamped.toFixed(2)}
        </text>
        <text
          x={cx}
          y={cy + 10}
          textAnchor="middle"
          className="fill-[#A6B39E] text-[11px] font-mono"
        >
          out of 20.0
        </text>
      </svg>
    </div>
  );
};
