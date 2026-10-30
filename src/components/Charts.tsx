import React, { useId, useMemo, useState } from 'react';
import { FeatureImportanceItem, ModelReport, ResidualBin, ScatterPoint } from '../types';

type GlassTone = 'pink' | 'lavender' | 'periwinkle' | 'blush';

/**
 * Shared SVG Definitions for Luminous Baby-Pink & Light-Lavender Smoked Glass Bars
 * Matches the translucent neon-rimmed smoked-glass aesthetic of the reference design.
 */
const GlassSvgDefs: React.FC<{ prefix: string }> = ({ prefix }) => (
  <defs>
    {/* Soft Baby-Pink Ambient Glow Filter */}
    <filter id={`${prefix}_pink_glow`} x="-25%" y="-25%" width="150%" height="150%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    {/* 1. Baby Pink Smoked Glass Body (#F5A6CC / #F8C6DF / #E88DBB) */}
    <linearGradient id={`${prefix}_body_pink`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#FDF8FC" stopOpacity="0.62" />
      <stop offset="28%" stopColor="#F8C6DF" stopOpacity="0.42" />
      <stop offset="76%" stopColor="#E88DBB" stopOpacity="0.28" />
      <stop offset="100%" stopColor="#F5A6CC" stopOpacity="0.48" />
    </linearGradient>

    {/* 2. Blush Highlight Glass Body (Hovered / Active Peak) */}
    <linearGradient id={`${prefix}_body_blush`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.76" />
      <stop offset="32%" stopColor="#F8C6DF" stopOpacity="0.54" />
      <stop offset="78%" stopColor="#F5A6CC" stopOpacity="0.36" />
      <stop offset="100%" stopColor="#E88DBB" stopOpacity="0.58" />
    </linearGradient>

    {/* 3. Light Lavender Smoked Glass Body (#C4A8F5) */}
    <linearGradient id={`${prefix}_body_lavender`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#F6F1FF" stopOpacity="0.62" />
      <stop offset="32%" stopColor="#C4A8F5" stopOpacity="0.42" />
      <stop offset="78%" stopColor="#9D7BE8" stopOpacity="0.26" />
      <stop offset="100%" stopColor="#C4A8F5" stopOpacity="0.48" />
    </linearGradient>

    {/* 4. Soft Pastel Periwinkle-Lavender Glass Body (Model Comparison 3rd Column) */}
    <linearGradient id={`${prefix}_body_periwinkle`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#F3F7FF" stopOpacity="0.62" />
      <stop offset="35%" stopColor="#A6C8FA" stopOpacity="0.40" />
      <stop offset="80%" stopColor="#7DA8F0" stopOpacity="0.25" />
      <stop offset="100%" stopColor="#B4CEFC" stopOpacity="0.46" />
    </linearGradient>

    {/* Diagonal Specular Glass Reflection Sheen */}
    <linearGradient id={`${prefix}_sheen`} x1="0" y1="0" x2="1" y2="0.9">
      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.28" />
      <stop offset="36%" stopColor="#FFFFFF" stopOpacity="0.06" />
      <stop offset="75%" stopColor="#FFFFFF" stopOpacity="0.0" />
    </linearGradient>

    {/* Glowing Rim Gradients */}
    <linearGradient id={`${prefix}_rim_pink`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#FDF8FC" stopOpacity="0.82" />
      <stop offset="50%" stopColor="#F5A6CC" stopOpacity="0.52" />
      <stop offset="100%" stopColor="#F5A6CC" stopOpacity="0.85" />
    </linearGradient>

    <linearGradient id={`${prefix}_rim_lavender`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#FDF8FC" stopOpacity="0.80" />
      <stop offset="50%" stopColor="#C4A8F5" stopOpacity="0.52" />
      <stop offset="100%" stopColor="#C4A8F5" stopOpacity="0.85" />
    </linearGradient>

    <linearGradient id={`${prefix}_rim_periwinkle`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#FDF8FC" stopOpacity="0.80" />
      <stop offset="50%" stopColor="#A6C8FA" stopOpacity="0.52" />
      <stop offset="100%" stopColor="#A6C8FA" stopOpacity="0.85" />
    </linearGradient>
  </defs>
);

/**
 * Reusable Translucent Smoked-Glass Column Primitive with Soft Pink/Lavender Rim Glow
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
  const glowColor =
    tone === 'lavender'
      ? 'rgba(196, 168, 245, 0.72)'
      : tone === 'periwinkle'
      ? 'rgba(166, 200, 250, 0.72)'
      : 'rgba(245, 166, 204, 0.78)';

  return (
    <g opacity={dimmed ? 0.45 : 1} style={{ transition: 'opacity 160ms ease' }}>
      {/* Optional faint glass slot */}
      {trackTop !== undefined && trackHeight !== undefined && (
        <rect
          x={x}
          y={trackTop}
          width={width}
          height={trackHeight}
          rx={safeR}
          fill="rgba(255,255,255,0.015)"
          stroke="rgba(255,210,235,0.04)"
          strokeWidth={0.75}
        />
      )}

      {/* Translucent glass body */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={safeR}
        fill={`url(#${prefix}_body_${hovered ? 'blush' : tone})`}
      />

      {/* Diagonal optical reflection */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={safeR}
        fill={`url(#${prefix}_sheen)`}
      />

      {/* Luminous rim border */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={safeR}
        fill="none"
        stroke={hovered ? '#FDF8FC' : `url(#${rimId})`}
        strokeWidth={hovered ? 1.45 : 1.1}
      />

      {/* Subtle top specular cap */}
      {width > 10 && (
        <line
          x1={x + safeR * 0.8}
          y1={y + 0.8}
          x2={x + width - safeR * 0.8}
          y2={y + 0.8}
          stroke="rgba(255,255,255,0.85)"
          strokeWidth={1.25}
          strokeLinecap="round"
        />
      )}

      {/* Luminous base reflection glow (signature detail from reference image) */}
      {width > 12 && (
        <line
          x1={x + safeR * 0.6}
          y1={y + height - 0.8}
          x2={x + width - safeR * 0.6}
          y2={y + height - 0.8}
          stroke={glowColor}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
      )}
    </g>
  );
};

/**
 * Glowing Baby-Pink Micro-Trend Sparkline for KPI Cards
 */
export const RoseSparkline: React.FC<{
  values: number[];
  id: string;
  width?: number;
  height?: number;
}> = ({ values, id, width = 82, height = 30 }) => {
  const pts = values.length >= 2 ? values : [4, 6, 5, 8, 7, 10];
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const span = max - min || 1;
  const coords = pts.map((v, i) => ({
    x: (i / (pts.length - 1)) * width,
    y: height - 4 - ((v - min) / span) * (height - 9),
  }));

  let d = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const cx = (coords[i].x + coords[i + 1].x) / 2;
    d += ` C ${cx.toFixed(1)} ${coords[i].y.toFixed(1)}, ${cx.toFixed(1)} ${coords[i + 1].y.toFixed(1)}, ${coords[i + 1].x.toFixed(1)} ${coords[i + 1].y.toFixed(1)}`;
  }
  const area = `${d} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible shrink-0">
      <defs>
        <linearGradient id={`spark_${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F5A6CC" stopOpacity="0.30" />
          <stop offset="100%" stopColor="#F5A6CC" stopOpacity="0.0" />
        </linearGradient>
        <filter id={`spark_glow_${id}`} x="-20%" y="-30%" width="140%" height="160%">
          <feGaussianBlur stdDeviation="1.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path d={area} fill={`url(#spark_${id})`} />
      <path
        d={d}
        fill="none"
        stroke="#F5A6CC"
        strokeWidth="1.85"
        strokeLinecap="round"
        filter={`url(#spark_glow_${id})`}
      />
    </svg>
  );
};

/**
 * 1. Final Grade Distribution (Range Buckets 0–4, 5–9, 10–14, 15–20)
 * Matches the Overview "Final Grade Distribution" glass chart in the reference image,
 * using 100% real dataset rows (supports G3, G2, or G1).
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
  const h = 216;
  const padL = 44;
  const padR = 18;
  const padT = 20;
  const padB = 42;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  return (
    <div className="relative select-none">
      <svg className="w-full h-[216px] overflow-visible" viewBox={`0 0 ${w} ${h}`}>
        <GlassSvgDefs prefix={uid} />

        {/* Subtle horizontal & vertical glass gridlines */}
        {ticks.map((t, idx) => {
          const y = padT + plotH * (1 - t / niceMax);
          return (
            <g key={idx}>
              <line
                x1={padL}
                x2={w - padR}
                y1={y}
                y2={y}
                stroke="rgba(253, 248, 252, 0.07)"
                strokeWidth={1}
              />
              <text
                x={padL - 10}
                y={y + 3.5}
                textAnchor="end"
                className="fill-[#BDB4C3] text-[10px] font-mono tabular-nums"
              >
                {t}
              </text>
            </g>
          );
        })}

        {/* Left Y-axis & Bottom X-axis hairlines */}
        <line x1={padL} x2={padL} y1={padT} y2={padT + plotH} stroke="rgba(255,210,235,0.16)" />
        <line
          x1={padL}
          x2={w - padR}
          y1={padT + plotH}
          y2={padT + plotH}
          stroke="rgba(255,210,235,0.20)"
        />

        {/* Rotated Y-Axis Title */}
        <text
          x={12}
          y={padT + plotH / 2}
          textAnchor="middle"
          transform={`rotate(-90 12 ${padT + plotH / 2})`}
          className="fill-[#928997] text-[9.5px]"
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
                rx={7}
                tone="pink"
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
          className="fill-[#928997] text-[10px]"
        >
          Grade Range
        </text>
      </svg>

      {hovered !== null && buckets[hovered] && (
        <div className="glass-tooltip absolute top-1 right-2 px-3 py-1.5 rounded-xl text-[11px] text-[#FDF8FC] pointer-events-none tabular-nums">
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
 * 2. Translucent Donut Chart with Transparent Center & Soft Pink/Lavender Glow
 * Used for both "Performance Overview" (Pass vs Fail) and "Gender-wise Performance".
 */
export const PerformanceDonutChart: React.FC<{
  centerLabel: string;
  centerValue: string;
  segments: {
    label: string;
    displayValue: string;
    share: number; // 0..100
    tone: 'pink' | 'blush' | 'lavender';
    subtext?: string;
  }[];
}> = ({ centerLabel, centerValue, segments }) => {
  const uid = useId().replace(/:/g, '');
  const [hovered, setHovered] = useState<number | null>(null);

  const size = 164;
  const stroke = 20;
  const radius = (size - stroke) / 2 - 4;
  const circ = 2 * Math.PI * radius;

  let cumulative = 0;

  return (
    <div className="relative flex flex-col sm:flex-row items-center justify-between gap-5 py-2">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90 overflow-visible">
          <defs>
            <linearGradient id={`donut_pink_${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F8C6DF" />
              <stop offset="50%" stopColor="#F5A6CC" />
              <stop offset="100%" stopColor="#E88DBB" />
            </linearGradient>
            <linearGradient id={`donut_blush_${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(248, 198, 223, 0.55)" />
              <stop offset="100%" stopColor="rgba(146, 137, 151, 0.32)" />
            </linearGradient>
            <linearGradient id={`donut_lavender_${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#E0D0FC" />
              <stop offset="55%" stopColor="#C4A8F5" />
              <stop offset="100%" stopColor="#9B7AE8" />
            </linearGradient>
            <filter id={`donut_glow_${uid}`} x="-25%" y="-25%" width="150%" height="150%">
              <feGaussianBlur stdDeviation="3.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Subtle recessed smoked-glass ring track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth={stroke}
          />

          {segments.map((seg, idx) => {
            const pct = Math.max(0, Math.min(100, seg.share));
            const segLen = (pct / 100) * circ;
            const dashArray = `${Math.max(0, segLen - 2)} ${circ}`;
            const dashOffset = -((cumulative / 100) * circ);
            cumulative += pct;

            const gradId =
              seg.tone === 'lavender'
                ? `donut_lavender_${uid}`
                : seg.tone === 'blush'
                ? `donut_blush_${uid}`
                : `donut_pink_${uid}`;

            return (
              <circle
                key={seg.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={`url(#${gradId})`}
                strokeWidth={hovered === idx ? stroke + 3 : stroke}
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
                filter={idx === 0 ? `url(#donut_glow_${uid})` : undefined}
                onMouseEnter={() => setHovered(idx)}
                onMouseLeave={() => setHovered(null)}
                className="cursor-pointer transition-all duration-200"
              />
            );
          })}

          {/* Inner & outer fine glass specular rims */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius + stroke / 2}
            fill="none"
            stroke="rgba(255, 210, 235, 0.22)"
            strokeWidth={0.8}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius - stroke / 2}
            fill="none"
            stroke="rgba(255, 210, 235, 0.18)"
            strokeWidth={0.8}
          />
        </svg>

        {/* Transparent Donut Center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-[11px] text-[#BDB4C3] font-medium">{centerLabel}</span>
          <span className="text-[22px] font-display font-bold text-[#FDF8FC] tabular-nums leading-tight mt-0.5">
            {centerValue}
          </span>
        </div>
      </div>

      {/* Right Legend */}
      <div className="flex-1 w-full space-y-3">
        {segments.map((seg, idx) => {
          const swatchBg =
            seg.tone === 'lavender'
              ? 'bg-[#C4A8F5] shadow-[0_0_10px_rgba(196,168,245,0.55)]'
              : seg.tone === 'blush'
              ? 'bg-[#F8C6DF]/70'
              : 'bg-[#F5A6CC] shadow-[0_0_10px_rgba(245,166,204,0.65)]';

          return (
            <div
              key={seg.label}
              onMouseEnter={() => setHovered(idx)}
              onMouseLeave={() => setHovered(null)}
              className={`flex items-center justify-between gap-3 px-2.5 py-1.5 rounded-xl transition-colors cursor-default ${
                hovered === idx ? 'bg-white/[0.06]' : ''
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${swatchBg}`} />
                <span className="text-xs text-[#BDB4C3] truncate">{seg.label}</span>
              </div>
              <span className="text-xs font-mono font-semibold text-[#FDF8FC] tabular-nums shrink-0">
                {seg.displayValue}
              </span>
            </div>
          );
        })}
      </div>

      {hovered !== null && segments[hovered]?.subtext && (
        <div className="glass-tooltip absolute -top-1 right-1 px-3 py-1 rounded-xl text-[11px] text-[#FDF8FC] pointer-events-none tabular-nums">
          {segments[hovered].subtext}
        </div>
      )}
    </div>
  );
};

/**
 * 3. Model Comparison Translucent Glass Chart (Baby Pink + Light Lavender + Pastel Periwinkle)
 * Matches the "Model Comparison" panel in the reference image while using real Python ML scores.
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
    <div className="relative select-none">
      <svg className="w-full h-[198px] overflow-visible" viewBox={`0 0 ${w} ${h}`}>
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
                stroke="rgba(253, 248, 252, 0.065)"
              />
              <text
                x={padL - 8}
                y={y + 3.5}
                textAnchor="end"
                className="fill-[#BDB4C3] text-[9.5px] font-mono tabular-nums"
              >
                {t.toFixed(1)}
              </text>
            </g>
          );
        })}

        <line x1={padL} x2={padL} y1={padT} y2={padT + plotH} stroke="rgba(255,210,235,0.16)" />
        <line
          x1={padL}
          x2={w - padR}
          y1={padT + plotH}
          y2={padT + plotH}
          stroke="rgba(255,210,235,0.20)"
        />

        {items.map((item, idx) => {
          const slotW = plotW / items.length;
          const barW = Math.min(64, slotW * 0.6);
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
        <div className="glass-tooltip absolute top-0 right-1 px-3 py-1.5 rounded-xl text-[11px] text-[#FDF8FC] pointer-events-none tabular-nums">
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
 * 4. Study Time / Prior Grade vs Final Grade Scatter Plot with Glowing Pink Trend Line
 * Matches the bottom-left scatter plot in the reference image using real UCI student records.
 */
export const StudyGradeScatterChart: React.FC<{
  rows: Record<string, any>[];
  xField: 'studytime' | 'G2' | 'G1' | 'absences';
  showTrend?: boolean;
}> = ({ rows, xField, showTrend = true }) => {
  const uid = useId().replace(/:/g, '');
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
      // Deterministic micro-jitter on discrete 1..4 studytime categories so overlapping points are visible
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

    // Compute exact OLS linear regression trend line y = m*x + b on real student rows
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
    <div className="relative select-none">
      <svg className="w-full h-[196px] overflow-visible" viewBox={`0 0 ${w} ${h}`}>
        <defs>
          <filter id={`trend_glow_${uid}`} x="-20%" y="-30%" width="140%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {[0, 5, 10, 15, 20].map((yt) => (
          <g key={yt}>
            <line
              x1={padL}
              x2={w - padR}
              y1={toY(yt)}
              y2={toY(yt)}
              stroke="rgba(253, 248, 252, 0.06)"
            />
            <text
              x={padL - 8}
              y={toY(yt) + 3.5}
              textAnchor="end"
              className="fill-[#BDB4C3] text-[9.5px] font-mono tabular-nums"
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
              stroke="rgba(253, 248, 252, 0.045)"
            />
            <text
              x={toX(xt)}
              y={padT + plotH + 15}
              textAnchor="middle"
              className="fill-[#BDB4C3] text-[9.5px] font-mono tabular-nums"
            >
              {xt}
            </text>
          </g>
        ))}

        <line x1={padL} x2={padL} y1={padT} y2={padT + plotH} stroke="rgba(255,210,235,0.16)" />
        <line
          x1={padL}
          x2={w - padR}
          y1={padT + plotH}
          y2={padT + plotH}
          stroke="rgba(255,210,235,0.20)"
        />

        <text
          x={12}
          y={padT + plotH / 2}
          textAnchor="middle"
          transform={`rotate(-90 12 ${padT + plotH / 2})`}
          className="fill-[#928997] text-[9.5px]"
        >
          Final Grade (G3)
        </text>

        {/* Pastel Baby-Pink & Light-Lavender Student Scatter Dots */}
        {points.map((pt) => {
          const isHov = hoveredIdx === pt.idx;
          const isFemale = pt.sex === 'F';
          return (
            <circle
              key={pt.idx}
              cx={toX(pt.x)}
              cy={toY(pt.y)}
              r={isHov ? 5.2 : 2.8}
              fill={isFemale ? 'rgba(245, 166, 204, 0.72)' : 'rgba(196, 168, 245, 0.68)'}
              stroke={isHov ? '#FDF8FC' : 'rgba(255, 240, 250, 0.35)'}
              strokeWidth={isHov ? 1.5 : 0.6}
              onMouseEnter={() => setHoveredIdx(pt.idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-pointer transition-all"
            />
          );
        })}

        {/* Thin Glowing Baby-Pink Linear Regression Trend Line */}
        {showTrend && points.length >= 2 && (
          <line
            x1={toX(xStart)}
            y1={toY(yStart)}
            x2={toX(xEnd)}
            y2={toY(yEnd)}
            stroke="#F8C6DF"
            strokeWidth={2}
            strokeLinecap="round"
            filter={`url(#trend_glow_${uid})`}
          />
        )}

        <text
          x={padL + plotW / 2}
          y={h - 3}
          textAnchor="middle"
          className="fill-[#928997] text-[9.5px]"
        >
          {xLabel}
        </text>
      </svg>

      {hoveredIdx !== null && points[hoveredIdx] && (
        <div className="glass-tooltip absolute top-1 right-2 px-3 py-1.5 rounded-xl text-[11px] text-[#FDF8FC] pointer-events-none tabular-nums">
          <span className="font-semibold text-[#F8C6DF]">
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
 * Circular Frosted Glass Ring
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
            <stop offset="0%" stopColor="#F8C6DF" />
            <stop offset="55%" stopColor="#F5A6CC" />
            <stop offset="100%" stopColor="#C4A8F5" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
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
        <span className="text-[10px] text-[#BDB4C3] font-mono mt-0.5">{label}</span>
      </div>
    </div>
  );
};

/**
 * Translucent Baby-Pink & Light-Lavender Vertical Bar Chart
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
      <div className="flex items-center justify-center h-44 text-xs text-[#928997]">
        No matching students for current filter selection.
      </div>
    );
  }

  const computedMax = Math.max(maxVal, ...data.map((d) => d.value), 1);
  const peakVal = Math.max(...data.map((d) => d.value));
  const defaultTone: GlassTone =
    accent === 'lavender' ? 'lavender' : accent === 'cyan' ? 'periwinkle' : 'pink';

  return (
    <div className="relative select-none" style={{ height }}>
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
              stroke="rgba(253,248,252,0.06)"
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
                    height={24}
                    rx={12}
                    fill={
                      isHighlight || isHov
                        ? 'rgba(245, 166, 204, 0.16)'
                        : 'rgba(255, 255, 255, 0.04)'
                    }
                    stroke={
                      isHighlight || isHov
                        ? 'rgba(248, 198, 223, 0.42)'
                        : 'rgba(255, 210, 235, 0.14)'
                    }
                    strokeWidth={1}
                  />
                  <text
                    x={x + barW / 2}
                    y={height - 18}
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
                      className="fill-[#928997] text-[9.5px] font-mono tabular-nums"
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
        <div className="glass-tooltip absolute top-0 right-1 px-3 py-1.5 rounded-xl text-[11px] text-[#FDF8FC] pointer-events-none">
          <span className="font-semibold text-[#F8C6DF]">{data[hovered].label}:</span>{' '}
          <span className="tabular-nums text-[#BDB4C3]">{data[hovered].subtext}</span>
        </div>
      )}
    </div>
  );
};

/**
 * Interactive 0–20 Grade Score Matrix Grid
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
            <span key={i} className="text-[10px] font-mono text-[#928997]">
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
                    ? 'text-[#FDF8FC] bg-white/[0.04] hover:bg-white/[0.09] border border-[#F5A6CC]/20'
                    : hasStudents
                    ? 'text-[#BDB4C3] hover:bg-white/[0.05]'
                    : 'text-[#5C5363]'
                }`}
              >
                {cell.grade}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-white/[0.08] flex items-center justify-between text-[11px] tabular-nums">
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
 * Full 0–20 Final Grade (G3) Translucent Baby-Pink & Lavender Histogram
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
    <div className="relative">
      <svg className="w-full h-[218px] overflow-visible" viewBox={`0 0 540 ${h}`}>
        <GlassSvgDefs prefix={uid} />

        {[0.25, 0.5, 0.75, 1].map((f, i) => {
          const y = 18 + usableH * (1 - f);
          return (
            <g key={i}>
              <line x1={28} x2={532} y1={y} y2={y} stroke="rgba(253,248,252,0.06)" />
              <text
                x={22}
                y={y + 3}
                textAnchor="end"
                className="fill-[#BDB4C3] text-[9.5px] font-mono tabular-nums"
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
          strokeOpacity={0.75}
          strokeWidth={1.3}
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
                className="fill-[#BDB4C3] text-[10px] font-mono tabular-nums"
              >
                {d.grade}
              </text>
            </g>
          );
        })}
      </svg>

      {hovered !== null && data[hovered] && (
        <div className="glass-tooltip absolute top-1 right-2 px-3 py-1.5 rounded-xl text-xs text-[#FDF8FC] pointer-events-none tabular-nums">
          Grade <span className="font-semibold text-[#F8C6DF]">{data[hovered].grade}/20</span> ·{' '}
          <span className="text-[#BDB4C3]">{data[hovered].count} students</span> ·{' '}
          <span className={data[hovered].grade >= 10 ? 'text-[#F5A6CC]' : 'text-[#C4A8F5]'}>
            {data[hovered].status}
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * Longitudinal Period Trajectory Chart (G1 -> G2 -> G3) in Baby-Pink & Lavender Glass
 */
export const PeriodProgressionChart: React.FC<{
  data: { period: string; passingAvg: number; failingAvg: number; overallAvg: number }[];
}> = ({ data }) => {
  const uid = useId().replace(/:/g, '');
  if (!data.length) return null;

  return (
    <div>
      <div className="flex items-center justify-end gap-5 mb-2 text-[11px] text-[#BDB4C3]">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#F5A6CC]/80 border border-white/40 inline-block" />
          Passing Cohort (G3 ≥ 10)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#C4A8F5]/75 border border-white/30 inline-block" />
          Overall Mean
        </span>
      </div>
      <svg className="w-full h-[195px] overflow-visible" viewBox="0 0 440 195">
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
                className="fill-[#E4D6FA] text-[10px] font-mono tabular-nums"
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
 * Age-wise Smooth Glowing Pink Trajectory Chart
 */
export const AgeTrajectoryChart: React.FC<{
  data: { age: number; avgG3: number; passRate: number; count: number }[];
}> = ({ data }) => {
  const uid = useId().replace(/:/g, '');
  const [hovered, setHovered] = useState<number | null>(null);
  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center h-44 text-xs text-[#928997]">
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
    <div className="relative">
      <svg className="w-full h-[205px] overflow-visible" viewBox={`0 0 ${w} ${h}`}>
        <defs>
          <linearGradient id={`ageArea_${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F5A6CC" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#C4A8F5" stopOpacity="0.0" />
          </linearGradient>
          <filter id={`ageGlow_${uid}`} x="-20%" y="-30%" width="140%" height="160%">
            <feGaussianBlur stdDeviation="2.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
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
                stroke="rgba(253,248,252,0.06)"
                strokeDasharray="3 3"
              />
              <text
                x={padX - 8}
                y={y + 3}
                textAnchor="end"
                className="fill-[#BDB4C3] text-[10px] font-mono tabular-nums"
              >
                {g}
              </text>
            </g>
          );
        })}
        <path d={areaPath} fill={`url(#ageArea_${uid})`} />
        <path
          d={linePath}
          fill="none"
          stroke="#F5A6CC"
          strokeWidth="2.2"
          strokeLinecap="round"
          filter={`url(#ageGlow_${uid})`}
        />
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
              r={hovered === idx ? 5.8 : 4.2}
              fill="#19151E"
              stroke="#F8C6DF"
              strokeWidth={2}
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
              className="fill-[#928997] text-[9px] font-mono tabular-nums"
            >
              n={p.count}
            </text>
          </g>
        ))}
      </svg>
      {hovered !== null && pts[hovered] && (
        <div className="glass-tooltip absolute top-0 right-2 px-3 py-1 rounded-xl text-xs text-[#FDF8FC] tabular-nums">
          Age {pts[hovered].age}: Avg{' '}
          <span className="text-[#F8C6DF] font-semibold">{pts[hovered].avgG3}/20</span> · Pass{' '}
          {pts[hovered].passRate}%
        </div>
      )}
    </div>
  );
};

/**
 * Dual Grouped Baby-Pink vs Light-Lavender Frosted Glass Bar Chart
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
    <div>
      <div className="flex items-center justify-end gap-5 mb-1 text-[11px] text-[#BDB4C3]">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#F5A6CC]/80 border border-white/40 inline-block" />
          {seriesA.name}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#C4A8F5]/80 border border-white/30 inline-block" />
          {seriesB.name}
        </span>
      </div>
      <svg className="w-full h-[195px] overflow-visible" viewBox={`0 0 440 ${h}`}>
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
                className="fill-[#E4D6FA] text-[9.5px] font-mono tabular-nums"
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
 * 8. Translucent Smoked-Glass Correlation Heatmap (Baby Pink Positive, Light Lavender Negative)
 */
export const CorrelationHeatmap: React.FC<{
  columns: string[];
  matrix: number[][];
}> = ({ columns, matrix }) => {
  const [hoverCell, setHoverCell] = useState<{ r: number; c: number; val: number } | null>(null);
  if (!columns.length || !matrix.length) return null;

  const cellStyle = (val: number): React.CSSProperties => {
    if (val >= 0) {
      const alpha = 0.06 + val * 0.50;
      return {
        background: `linear-gradient(155deg, rgba(248, 198, 223, ${(alpha * 1.05).toFixed(2)}) 0%, rgba(232, 141, 187, ${(alpha * 0.68).toFixed(2)}) 100%)`,
        boxShadow: 'inset 0 1px 0 rgba(255,245,250,0.22)',
      };
    }
    const alpha = 0.07 + Math.abs(val) * 0.52;
    return {
      background: `linear-gradient(155deg, rgba(196, 168, 245, ${alpha.toFixed(2)}) 0%, rgba(132, 104, 196, ${(alpha * 0.68).toFixed(2)}) 100%)`,
      boxShadow: 'inset 0 1px 0 rgba(240,235,255,0.18)',
    };
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center justify-between mb-3 text-xs text-[#BDB4C3]">
        <span>Pearson Correlation Coefficient (r) across numerical student attributes</span>
        {hoverCell && (
          <span className="font-mono tabular-nums text-[#F8C6DF]">
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
            className="text-center text-[11px] font-semibold text-[#FDF8FC] py-1 truncate"
          >
            {col}
          </div>
        ))}

        {matrix.map((row, rIdx) => (
          <React.Fragment key={columns[rIdx]}>
            <div className="flex items-center justify-end pr-2 text-[11px] font-semibold text-[#BDB4C3]">
              {columns[rIdx]}
            </div>
            {row.map((val, cIdx) => (
              <div
                key={`${rIdx}-${cIdx}`}
                onMouseEnter={() => setHoverCell({ r: rIdx, c: cIdx, val })}
                onMouseLeave={() => setHoverCell(null)}
                style={cellStyle(val)}
                className="h-10 rounded-xl flex items-center justify-center text-[11px] font-mono tabular-nums transition-transform duration-150 hover:scale-[1.04] border border-[rgba(255,210,235,0.20)] cursor-default text-[#FDF8FC]"
              >
                <span className={val >= 0.75 ? 'font-bold text-white' : 'text-[#FDF8FC]/90'}>
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
 * 7. Actual vs Predicted Translucent Glass Scatter Plot with Glowing Pink Alignment Line
 */
export const ActualVsPredictedScatter: React.FC<{
  points: ScatterPoint[];
}> = ({ points }) => {
  const uid = useId().replace(/:/g, '');
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
    <div className="relative">
      <svg className="w-full h-[270px] overflow-visible" viewBox={`0 0 ${w} ${h}`}>
        <defs>
          <filter id={`avp_glow_${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {[0, 5, 10, 15, 20].map((tick) => (
          <g key={tick}>
            <line
              x1={padL}
              x2={w - padR}
              y1={toY(tick)}
              y2={toY(tick)}
              stroke="rgba(253,248,252,0.06)"
            />
            <line
              x1={toX(tick)}
              x2={toX(tick)}
              y1={padT}
              y2={h - padB}
              stroke="rgba(253,248,252,0.05)"
            />
            <text
              x={padL - 8}
              y={toY(tick) + 3}
              textAnchor="end"
              className="fill-[#BDB4C3] text-[10px] font-mono tabular-nums"
            >
              {tick}
            </text>
            <text
              x={toX(tick)}
              y={h - padB + 15}
              textAnchor="middle"
              className="fill-[#BDB4C3] text-[10px] font-mono tabular-nums"
            >
              {tick}
            </text>
          </g>
        ))}

        {/* Glowing Baby-Pink Ideal y = x Line */}
        <line
          x1={toX(0)}
          y1={toY(0)}
          x2={toX(20)}
          y2={toY(20)}
          stroke="#F5A6CC"
          strokeOpacity={0.78}
          strokeWidth={1.6}
          strokeDasharray="4 4"
          filter={`url(#avp_glow_${uid})`}
        />
        <text x={toX(13.6)} y={toY(16.4)} className="fill-[#F8C6DF] text-[10px] font-medium">
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
              r={isHov ? 6.6 : 4.5}
              fill={closeFit ? 'rgba(245, 166, 204, 0.58)' : 'rgba(196, 168, 245, 0.46)'}
              stroke={isHov ? '#FDF8FC' : closeFit ? '#F8C6DF' : '#C4A8F5'}
              strokeWidth={isHov ? 1.8 : 1.15}
              onMouseEnter={() => setHovered(pt)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer transition-all"
            />
          );
        })}

        <text x={w / 2} y={h - 3} textAnchor="middle" className="fill-[#928997] text-[11px]">
          Actual Held-Out Test Grade G3 (0–20)
        </text>
      </svg>

      {hovered && (
        <div className="glass-tooltip absolute top-2 left-12 px-3 py-2 rounded-xl text-xs text-[#FDF8FC] pointer-events-none tabular-nums">
          <div className="font-semibold text-[#F8C6DF]">Test Student #{hovered.id}</div>
          <div className="text-[#BDB4C3]">
            Actual: <b className="text-white">{hovered.actual}</b> · Predicted:{' '}
            <b className="text-white">{hovered.predicted}</b> · Residual:{' '}
            <span
              className={
                Math.abs(hovered.residual) <= 1.5 ? 'text-[#F8C6DF]' : 'text-[#C4A8F5]'
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
 * 9. Residual Distribution Frosted Glass Histogram + Glowing Pink Smooth Curve
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
    <div className="relative">
      <svg className="w-full h-[235px] overflow-visible" viewBox={`0 0 440 ${h}`}>
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
                  className="fill-[#FDF8FC] text-[9.5px] font-mono tabular-nums"
                >
                  {b.count}
                </text>
              )}
              <text
                x={x + barW / 2}
                y={204}
                textAnchor="middle"
                className="fill-[#BDB4C3] text-[9.5px] font-mono tabular-nums"
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
            stroke="#F8C6DF"
            strokeWidth={1.8}
            strokeLinecap="round"
            filter={`url(#${uid}_pink_glow)`}
          />
        )}

        <text x={220} y={226} textAnchor="middle" className="fill-[#928997] text-[11px]">
          Residual Error (y_actual − y_predicted)
        </text>
      </svg>

      {hovered !== null && bins[hovered] && (
        <div className="glass-tooltip absolute top-1 right-2 px-3 py-1 rounded-xl text-xs text-[#FDF8FC] pointer-events-none tabular-nums">
          Bin <span className="text-[#F8C6DF] font-semibold">{bins[hovered].range}</span>:{' '}
          {bins[hovered].count} test students
        </div>
      )}
    </div>
  );
};

/**
 * 6. Horizontal Translucent Baby-Pink & Lavender Feature Importance Bars
 */
export const FeatureImportanceBars: React.FC<{ items: FeatureImportanceItem[] }> = ({ items }) => {
  const maxPct = Math.max(...items.map((i) => i.percentage), 1);
  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const widthPct = Math.max(4, (item.percentage / maxPct) * 100);
        return (
          <div key={item.feature} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#FDF8FC] font-medium">
                <span className="text-[#928997] font-mono mr-2">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                {item.label}
              </span>
              <span className="font-mono tabular-nums text-[#F8C6DF] font-semibold">
                {item.percentage.toFixed(1)}%
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-white/[0.045] border border-[rgba(255,210,235,0.14)] p-[1px] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${widthPct}%`,
                  background:
                    idx === 0
                      ? 'linear-gradient(90deg, rgba(245, 166, 204, 0.55) 0%, rgba(248, 198, 223, 0.92) 100%)'
                      : 'linear-gradient(90deg, rgba(196, 168, 245, 0.42) 0%, rgba(245, 166, 204, 0.78) 100%)',
                  boxShadow:
                    '0 0 12px rgba(245, 166, 204, 0.35), inset 0 1px 0 rgba(255,255,255,0.55)',
                  borderRight: '1px solid rgba(255,255,255,0.85)',
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
 * Semi-Circular Glowing Baby-Pink & Lavender Grade Gauge
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
    <div className="flex flex-col items-center">
      <svg width="240" height="136" viewBox="0 0 240 136" className="overflow-visible">
        <defs>
          <linearGradient id={`gauge_${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#C4A8F5" />
            <stop offset="52%" stopColor="#F5A6CC" />
            <stop offset="100%" stopColor="#F8C6DF" />
          </linearGradient>
          <filter id={`gauge_glow_${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
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
          filter={`url(#gauge_glow_${uid})`}
          style={{ transition: 'stroke-dashoffset 320ms cubic-bezier(0.16, 1, 0.3, 1)' }}
        />

        <line
          x1={cx}
          y1={cy - radius - 10}
          x2={cx}
          y2={cy - radius + 10}
          stroke="#FDF8FC"
          strokeWidth="2"
        />
        <text
          x={cx}
          y={cy - radius - 14}
          textAnchor="middle"
          className="fill-[#F8C6DF] text-[10px] font-mono"
        >
          Pass 10
        </text>

        <text
          x={cx - radius}
          y={cy + 20}
          textAnchor="middle"
          className="fill-[#928997] text-[10px] font-mono"
        >
          0
        </text>
        <text
          x={cx + radius}
          y={cy + 20}
          textAnchor="middle"
          className="fill-[#928997] text-[10px] font-mono"
        >
          20
        </text>

        <text
          x={cx}
          y={cy - 12}
          textAnchor="middle"
          className="fill-[#FDF8FC] text-[34px] font-display font-bold tabular-nums"
        >
          {clamped.toFixed(2)}
        </text>
        <text
          x={cx}
          y={cy + 10}
          textAnchor="middle"
          className="fill-[#BDB4C3] text-[11px] font-mono"
        >
          out of 20.0
        </text>
      </svg>
    </div>
  );
};
