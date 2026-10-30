import React, { useState } from 'react';
import { FeatureImportanceItem, ResidualBin, ScatterPoint } from '../types';

/**
 * Smooth Sparkline curve for the top-right frosted blush glass KPI cards
 */
export const RoseSparkline: React.FC<{ values: number[]; id: string }> = ({ values, id }) => {
  const pts = values.length >= 2 ? values : [4, 6, 5, 8, 7, 10];
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const span = max - min || 1;
  const w = 96;
  const h = 36;
  const coords = pts.map((v, i) => ({
    x: (i / (pts.length - 1)) * w,
    y: h - 4 - ((v - min) / span) * (h - 10),
  }));

  let d = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const cx = (coords[i].x + coords[i + 1].x) / 2;
    d += ` C ${cx.toFixed(1)} ${coords[i].y.toFixed(1)}, ${cx.toFixed(1)} ${coords[i + 1].y.toFixed(1)}, ${coords[i + 1].x.toFixed(1)} ${coords[i + 1].y.toFixed(1)}`;
  }
  const area = `${d} L ${w} ${h} L 0 ${h} Z`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible shrink-0">
      <defs>
        <linearGradient id={`spark_${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E589B5" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#E589B5" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#spark_${id})`} />
      <path d={d} fill="none" stroke="#DF7EAD" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

/**
 * Signature Blush-Pink & Lavender Rounded Vertical Bar Chart inside Dark Plum Glass Panels
 * Matches the "Pay from" sculpted gradient bar visual language in the reference UI.
 */
export const SculptedBarChart: React.FC<{
  data: { label: string; value: number; subtext?: string; count?: number }[];
  maxVal?: number;
  unit?: string;
  accent?: 'rose' | 'lavender' | 'cyan';
  height?: number;
}> = ({ data, maxVal = 20, unit = '', accent = 'rose', height = 210 }) => {
  const [hovered, setHovered] = useState<number | null>(null);
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-44 text-sm text-[#B8AABF]">
        No matching students for current filter selection.
      </div>
    );
  }

  const computedMax = Math.max(maxVal, ...data.map((d) => d.value), 1);
  const gradColors =
    accent === 'lavender'
      ? ['#E5D4FF', '#9D7BE8']
      : accent === 'cyan'
      ? ['#BAE6FD', '#38BDF8']
      : ['#FAD6E8', '#D883B0'];

  const gradId = `sculpt_${accent}_${data.length}`;

  return (
    <div className="relative select-none" style={{ height }}>
      <svg className="w-full h-full overflow-visible" viewBox={`0 0 420 ${height}`}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gradColors[0]} stopOpacity="0.96" />
            <stop offset="100%" stopColor={gradColors[1]} stopOpacity="0.72" />
          </linearGradient>
        </defs>

        {/* Subtle horizontal reference lines */}
        {[0.25, 0.5, 0.75, 1].map((frac, idx) => {
          const y = (height - 46) * (1 - frac) + 12;
          return (
            <line
              key={idx}
              x1={8}
              x2={412}
              y1={y}
              y2={y}
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray="3 3"
            />
          );
        })}

        {data.map((item, idx) => {
          const slotW = 400 / data.length;
          const barW = Math.min(68, Math.max(24, slotW * 0.66));
          const x = 10 + idx * slotW + (slotW - barW) / 2;
          const usableH = height - 62;
          const barH = Math.max(12, (item.value / computedMax) * usableH);
          const y = 18 + (usableH - barH);
          const isHov = hovered === idx;

          return (
            <g
              key={item.label}
              onMouseEnter={() => setHovered(idx)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer"
            >
              {/* Value label above bar */}
              <text
                x={x + barW / 2}
                y={y - 7}
                textAnchor="middle"
                className="fill-white text-[11px] font-mono tabular-nums font-medium"
                opacity={isHov ? 1 : 0.88}
              >
                {item.value}
                {unit}
              </text>

              {/* Sculpted rounded gradient bar */}
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={12}
                fill={`url(#${gradId})`}
                opacity={hovered === null || isHov ? 1 : 0.58}
                stroke={isHov ? '#FFFFFF' : 'rgba(255,255,255,0.18)'}
                strokeWidth={isHov ? 1.5 : 1}
              />

              {/* Bottom label */}
              <text
                x={x + barW / 2}
                y={height - 16}
                textAnchor="middle"
                className="fill-[#D9CEE0] text-[11px] font-medium"
              >
                {item.label}
              </text>
              {item.count !== undefined && (
                <text
                  x={x + barW / 2}
                  y={height - 3}
                  textAnchor="middle"
                  className="fill-[#9A8BA3] text-[9.5px] font-mono tabular-nums"
                >
                  n={item.count}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {hovered !== null && data[hovered]?.subtext && (
        <div className="absolute top-0 right-2 px-3 py-1.5 rounded-xl bg-[#161119]/95 border border-white/15 text-xs text-white shadow-lg pointer-events-none">
          <span className="font-semibold text-[#FAD6E8]">{data[hovered].label}:</span>{' '}
          <span className="tabular-nums">{data[hovered].subtext}</span>
        </div>
      )}
    </div>
  );
};

/**
 * Final Grade (G3: 0 to 20) Histogram with Pass Threshold Line (G3 >= 10)
 */
export const GradeDistributionChart: React.FC<{
  data: { grade: number; count: number; status: string }[];
}> = ({ data }) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const h = 215;
  const usableH = 158;

  return (
    <div className="relative">
      <svg className="w-full h-[215px] overflow-visible" viewBox={`0 0 540 ${h}`}>
        <defs>
          <linearGradient id="passGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FAD6E8" />
            <stop offset="100%" stopColor="#D780AD" />
          </linearGradient>
          <linearGradient id="failGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7B6582" />
            <stop offset="100%" stopColor="#4A3A50" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75, 1].map((f, i) => {
          const y = 18 + usableH * (1 - f);
          return (
            <g key={i}>
              <line x1={28} x2={532} y1={y} y2={y} stroke="rgba(255,255,255,0.06)" />
              <text x={22} y={y + 3} textAnchor="end" className="fill-[#9A8BA3] text-[9.5px] font-mono tabular-nums">
                {Math.round(maxCount * f)}
              </text>
            </g>
          );
        })}

        {/* Pass threshold vertical dashed marker between grade 9 and 10 */}
        <line
          x1={28 + 10 * 24 - 2}
          x2={28 + 10 * 24 - 2}
          y1={10}
          y2={178}
          stroke="#FAD6E8"
          strokeWidth={1.3}
          strokeDasharray="4 3"
        />
        <text
          x={28 + 10 * 24 + 4}
          y={18}
          className="fill-[#FAD6E8] text-[10px] font-medium"
        >
          Pass Threshold (G3 ≥ 10)
        </text>

        {data.map((d, idx) => {
          const x = 30 + idx * 24;
          const barH = d.count === 0 ? 2 : Math.max(5, (d.count / maxCount) * usableH);
          const y = 18 + (usableH - barH);
          const isHov = hovered === idx;
          return (
            <g
              key={d.grade}
              onMouseEnter={() => setHovered(idx)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer"
            >
              <rect
                x={x}
                y={y}
                width={18}
                height={barH}
                rx={5}
                fill={d.grade >= 10 ? 'url(#passGrad)' : 'url(#failGrad)'}
                opacity={hovered === null || isHov ? 0.95 : 0.5}
                stroke={isHov ? '#FFFFFF' : 'none'}
                strokeWidth={1.2}
              />
              <text
                x={x + 9}
                y={195}
                textAnchor="middle"
                className="fill-[#C8BBD0] text-[10px] font-mono tabular-nums"
              >
                {d.grade}
              </text>
            </g>
          );
        })}
      </svg>

      {hovered !== null && data[hovered] && (
        <div className="absolute top-1 right-2 px-3 py-1.5 rounded-xl bg-[#161119]/95 border border-white/15 text-xs text-white shadow-lg pointer-events-none tabular-nums">
          Grade <span className="font-semibold text-[#FAD6E8]">{data[hovered].grade}/20</span> ·{' '}
          <span>{data[hovered].count} students</span> ·{' '}
          <span className={data[hovered].grade >= 10 ? 'text-emerald-300' : 'text-rose-300'}>
            {data[hovered].status}
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * Age-wise Smooth Area & Trajectory Line Chart
 */
export const AgeTrajectoryChart: React.FC<{
  data: { age: number; avgG3: number; passRate: number; count: number }[];
}> = ({ data }) => {
  const [hovered, setHovered] = useState<number | null>(null);
  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center h-44 text-sm text-[#B8AABF]">
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

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${pts[pts.length - 1].x.toFixed(1)} ${22 + usableH} L ${pts[0].x.toFixed(1)} ${22 + usableH} Z`;

  return (
    <div className="relative">
      <svg className="w-full h-[205px] overflow-visible" viewBox={`0 0 ${w} ${h}`}>
        <defs>
          <linearGradient id="ageArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F5B2D4" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#F5B2D4" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        {[6, 10, 14].map((g) => {
          const y = 22 + usableH - ((g - minY) / (maxY - minY)) * usableH;
          return (
            <g key={g}>
              <line x1={padX} x2={w - padX} y1={y} y2={y} stroke="rgba(255,255,255,0.07)" strokeDasharray="3 3" />
              <text x={padX - 8} y={y + 3} textAnchor="end" className="fill-[#9A8BA3] text-[10px] font-mono tabular-nums">
                {g}
              </text>
            </g>
          );
        })}
        <path d={areaPath} fill="url(#ageArea)" />
        <path d={linePath} fill="none" stroke="#FAD6E8" strokeWidth="2.5" strokeLinecap="round" />
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
              r={hovered === idx ? 6 : 4.2}
              fill="#221B25"
              stroke="#FAD6E8"
              strokeWidth={2.4}
            />
            <text x={p.x} y={p.y - 10} textAnchor="middle" className="fill-white text-[10px] font-mono tabular-nums">
              {p.avgG3}
            </text>
            <text x={p.x} y={184} textAnchor="middle" className="fill-[#D9CEE0] text-[11px] font-mono tabular-nums">
              {p.age}y
            </text>
            <text x={p.x} y={197} textAnchor="middle" className="fill-[#9A8BA3] text-[9px] font-mono tabular-nums">
              n={p.count}
            </text>
          </g>
        ))}
      </svg>
      {hovered !== null && pts[hovered] && (
        <div className="absolute top-0 right-2 px-3 py-1 rounded-xl bg-[#161119]/95 border border-white/15 text-xs text-white tabular-nums">
          Age {pts[hovered].age}: Avg <span className="text-[#FAD6E8] font-semibold">{pts[hovered].avgG3}/20</span> · Pass {pts[hovered].passRate}%
        </div>
      )}
    </div>
  );
};

/**
 * Dual Grouped Bar Chart (Used for Family Education Mother vs Father & Multi-Model Comparison)
 */
export const GroupedBarsChart: React.FC<{
  categories: string[];
  seriesA: { name: string; values: number[]; color: string };
  seriesB: { name: string; values: number[]; color: string };
  maxVal?: number;
}> = ({ categories, seriesA, seriesB, maxVal = 16 }) => {
  const computedMax = Math.max(maxVal, ...seriesA.values, ...seriesB.values, 1);
  const h = 210;
  const usableH = 142;

  return (
    <div>
      <div className="flex items-center justify-end gap-5 mb-1 text-xs text-[#D9CEE0]">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: seriesA.color }} />
          {seriesA.name}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: seriesB.color }} />
          {seriesB.name}
        </span>
      </div>
      <svg className="w-full h-[195px] overflow-visible" viewBox={`0 0 440 ${h}`}>
        {categories.map((cat, idx) => {
          const slot = 420 / categories.length;
          const xBase = 12 + idx * slot + slot * 0.16;
          const barW = Math.min(26, slot * 0.3);
          const hA = Math.max(4, (seriesA.values[idx] / computedMax) * usableH);
          const hB = Math.max(4, (seriesB.values[idx] / computedMax) * usableH);
          const yA = 20 + (usableH - hA);
          const yB = 20 + (usableH - hB);

          return (
            <g key={cat}>
              <rect x={xBase} y={yA} width={barW} height={hA} rx={6} fill={seriesA.color} />
              <text
                x={xBase + barW / 2}
                y={yA - 5}
                textAnchor="middle"
                className="fill-white text-[9.5px] font-mono tabular-nums"
              >
                {seriesA.values[idx]}
              </text>

              <rect x={xBase + barW + 5} y={yB} width={barW} height={hB} rx={6} fill={seriesB.color} />
              <text
                x={xBase + barW + 5 + barW / 2}
                y={yB - 5}
                textAnchor="middle"
                className="fill-[#E5D4FF] text-[9.5px] font-mono tabular-nums"
              >
                {seriesB.values[idx]}
              </text>

              <text
                x={xBase + barW + 2}
                y={184}
                textAnchor="middle"
                className="fill-[#D9CEE0] text-[10.5px]"
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
 * Interactive Annotated Correlation Heatmap (Pearson r in [-1, 1])
 */
export const CorrelationHeatmap: React.FC<{
  columns: string[];
  matrix: number[][];
}> = ({ columns, matrix }) => {
  const [hoverCell, setHoverCell] = useState<{ r: number; c: number; val: number } | null>(null);
  if (!columns.length || !matrix.length) return null;

  const cellColor = (val: number) => {
    if (val >= 0) {
      const alpha = 0.12 + val * 0.78;
      return `rgba(244, 162, 204, ${alpha.toFixed(2)})`;
    }
    const alpha = 0.14 + Math.abs(val) * 0.75;
    return `rgba(125, 211, 252, ${alpha.toFixed(2)})`;
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center justify-between mb-3 text-xs text-[#C8BBD0]">
        <span>Pearson Correlation Coefficient (r) across numerical student attributes</span>
        {hoverCell && (
          <span className="font-mono tabular-nums text-[#FAD6E8]">
            corr({columns[hoverCell.r]}, {columns[hoverCell.c]}) = {hoverCell.val.toFixed(2)}
          </span>
        )}
      </div>
      <div
        className="grid gap-1 min-w-[540px]"
        style={{
          gridTemplateColumns: `76px repeat(${columns.length}, minmax(48px, 1fr))`,
        }}
      >
        <div />
        {columns.map((col) => (
          <div key={col} className="text-center text-[11px] font-semibold text-[#E8DCEB] py-1 truncate">
            {col}
          </div>
        ))}

        {matrix.map((row, rIdx) => (
          <React.Fragment key={columns[rIdx]}>
            <div className="flex items-center justify-end pr-2 text-[11px] font-semibold text-[#E8DCEB]">
              {columns[rIdx]}
            </div>
            {row.map((val, cIdx) => (
              <div
                key={`${rIdx}-${cIdx}`}
                onMouseEnter={() => setHoverCell({ r: rIdx, c: cIdx, val })}
                onMouseLeave={() => setHoverCell(null)}
                style={{ backgroundColor: cellColor(val) }}
                className="h-10 rounded-lg flex items-center justify-center text-[11px] font-mono tabular-nums transition-transform duration-150 hover:scale-105 border border-white/10 cursor-default"
              >
                <span className={Math.abs(val) > 0.55 ? 'text-[#1B141E] font-bold' : 'text-white'}>
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
 * Actual vs Predicted Scatter Plot with Ideal y = x Reference Line
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
    <div className="relative">
      <svg className="w-full h-[270px] overflow-visible" viewBox={`0 0 ${w} ${h}`}>
        {[0, 5, 10, 15, 20].map((tick) => (
          <g key={tick}>
            <line
              x1={padL}
              x2={w - padR}
              y1={toY(tick)}
              y2={toY(tick)}
              stroke="rgba(255,255,255,0.07)"
            />
            <line
              x1={toX(tick)}
              x2={toX(tick)}
              y1={padT}
              y2={h - padB}
              stroke="rgba(255,255,255,0.07)"
            />
            <text
              x={padL - 8}
              y={toY(tick) + 3}
              textAnchor="end"
              className="fill-[#9A8BA3] text-[10px] font-mono tabular-nums"
            >
              {tick}
            </text>
            <text
              x={toX(tick)}
              y={h - padB + 15}
              textAnchor="middle"
              className="fill-[#9A8BA3] text-[10px] font-mono tabular-nums"
            >
              {tick}
            </text>
          </g>
        ))}

        {/* Ideal y = x line */}
        <line
          x1={toX(0)}
          y1={toY(0)}
          x2={toX(20)}
          y2={toY(20)}
          stroke="#7DD3FC"
          strokeWidth={1.6}
          strokeDasharray="5 4"
        />
        <text x={toX(14.5)} y={toY(16.2)} className="fill-[#7DD3FC] text-[10px]">
          Ideal Fit (y = x)
        </text>

        {points.map((pt) => {
          const isHov = hovered?.id === pt.id;
          return (
            <circle
              key={pt.id}
              cx={toX(pt.actual)}
              cy={toY(pt.predicted)}
              r={isHov ? 6.2 : 4.2}
              fill={Math.abs(pt.residual) <= 2 ? '#FAD6E8' : '#C084FC'}
              fillOpacity={isHov ? 1 : 0.78}
              stroke="#1E1722"
              strokeWidth={1.2}
              onMouseEnter={() => setHovered(pt)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer transition-opacity"
            />
          );
        })}

        <text x={w / 2} y={h - 3} textAnchor="middle" className="fill-[#C8BBD0] text-[11px]">
          Actual Test Grade G3 (0–20)
        </text>
      </svg>

      {hovered && (
        <div className="absolute top-2 left-12 px-3 py-2 rounded-xl bg-[#161119]/95 border border-white/15 text-xs text-white shadow-xl pointer-events-none tabular-nums">
          <div className="font-semibold text-[#FAD6E8]">Test Student #{hovered.id}</div>
          <div>
            Actual: <b>{hovered.actual}</b> · Predicted: <b>{hovered.predicted}</b> · Residual:{' '}
            <span className={Math.abs(hovered.residual) <= 1.5 ? 'text-emerald-300' : 'text-amber-300'}>
              {hovered.residual > 0 ? `+${hovered.residual}` : hovered.residual}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Residual Error Histogram (Actual - Predicted)
 */
export const ResidualHistogram: React.FC<{ bins: ResidualBin[] }> = ({ bins }) => {
  const maxC = Math.max(...bins.map((b) => b.count), 1);
  const h = 235;
  const usableH = 165;

  return (
    <svg className="w-full h-[235px] overflow-visible" viewBox={`0 0 440 ${h}`}>
      <defs>
        <linearGradient id="resGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E5D4FF" />
          <stop offset="100%" stopColor="#9D7BE8" />
        </linearGradient>
      </defs>
      {bins.map((b, i) => {
        const slot = 410 / bins.length;
        const barW = Math.max(16, slot - 6);
        const x = 18 + i * slot;
        const barH = b.count === 0 ? 2 : Math.max(6, (b.count / maxC) * usableH);
        const y = 22 + (usableH - barH);
        const isZeroCenter = Math.abs(b.binCenter) < 0.8;

        return (
          <g key={b.range}>
            {b.count > 0 && (
              <text
                x={x + barW / 2}
                y={y - 5}
                textAnchor="middle"
                className="fill-white text-[9.5px] font-mono tabular-nums"
              >
                {b.count}
              </text>
            )}
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx={5}
              fill={isZeroCenter ? '#FAD6E8' : 'url(#resGrad)'}
              opacity={0.9}
            />
            <text
              x={x + barW / 2}
              y={204}
              textAnchor="middle"
              className="fill-[#C8BBD0] text-[9.5px] font-mono tabular-nums"
            >
              {b.binLabel}
            </text>
          </g>
        );
      })}
      <text x={220} y={226} textAnchor="middle" className="fill-[#9A8BA3] text-[11px]">
        Residual Error (y_actual − y_predicted)
      </text>
    </svg>
  );
};

/**
 * Horizontal Ranked Feature Importance Bars
 */
export const FeatureImportanceBars: React.FC<{ items: FeatureImportanceItem[] }> = ({ items }) => {
  const maxPct = Math.max(...items.map((i) => i.percentage), 1);
  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const widthPct = Math.max(3, (item.percentage / maxPct) * 100);
        return (
          <div key={item.feature} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#F1E9F5] font-medium">
                <span className="text-[#9A8BA3] font-mono mr-2">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                {item.label}
              </span>
              <span className="font-mono tabular-nums text-[#FAD6E8] font-semibold">
                {item.percentage.toFixed(1)}%
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-white/[0.07] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${widthPct}%`,
                  background:
                    idx === 0
                      ? 'linear-gradient(90deg, #FAD6E8 0%, #E384B3 100%)'
                      : 'linear-gradient(90deg, #D8B4FE 0%, #818CF8 100%)',
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
 * Semi-Circular Glassmorphism Grade Gauge (0 to 20 scale, Pass mark at 10)
 */
export const GradeGauge: React.FC<{ score: number }> = ({ score }) => {
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
          <linearGradient id="gaugeArc" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FB7185" />
            <stop offset="50%" stopColor="#F5A9CE" />
            <stop offset="100%" stopColor="#6EE7B7" />
          </linearGradient>
        </defs>

        {/* Background track */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="16"
          strokeLinecap="round"
        />

        {/* Active progress arc */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="url(#gaugeArc)"
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 320ms cubic-bezier(0.16, 1, 0.3, 1)' }}
        />

        {/* Midpoint Pass Marker at 10/20 (top center of semicircle) */}
        <line x1={cx} y1={cy - radius - 11} x2={cx} y2={cy - radius + 11} stroke="#FFFFFF" strokeWidth="2.5" />
        <text x={cx} y={cy - radius - 15} textAnchor="middle" className="fill-[#D9CEE0] text-[10px] font-mono">
          Pass 10
        </text>

        <text x={cx - radius} y={cy + 20} textAnchor="middle" className="fill-[#9A8BA3] text-[10px] font-mono">
          0
        </text>
        <text x={cx + radius} y={cy + 20} textAnchor="middle" className="fill-[#9A8BA3] text-[10px] font-mono">
          20
        </text>

        {/* Center score readout */}
        <text
          x={cx}
          y={cy - 12}
          textAnchor="middle"
          className="fill-white text-[34px] font-display font-bold tabular-nums"
        >
          {clamped.toFixed(2)}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" className="fill-[#C8BBD0] text-[11px] font-mono">
          out of 20.0
        </text>
      </svg>
    </div>
  );
};
