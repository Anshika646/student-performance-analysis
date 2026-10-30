import React, { useState } from 'react';
import { FeatureImportanceItem, ResidualBin, ScatterPoint } from '../types';

/**
 * Hero Circular Progress Ring (Matches the thick dark ring with pastel-rose arc next to the Hero Title)
 */
export const CircularMetricRing: React.FC<{
  percentage: number;
  label?: string;
}> = ({ percentage, label = '%' }) => {
  const clamped = Math.max(0, Math.min(100, percentage));
  const size = 112;
  const stroke = 11;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - clamped / 100);

  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="heroRingGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FAD6E8" />
            <stop offset="100%" stopColor="#D67BA8" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#heroRingGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 320ms cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-display font-semibold text-white tabular-nums leading-none">
          {Math.round(clamped)}
        </span>
        <span className="text-[10px] text-[#A89BB2] font-mono mt-0.5">{label}</span>
      </div>
    </div>
  );
};

/**
 * Luminous Rose Bezier Sparkline for Dark Smoked-Glass KPI & Mini Cards
 */
export const RoseSparkline: React.FC<{
  values: number[];
  id: string;
  width?: number;
  height?: number;
}> = ({ values, id, width = 84, height = 30 }) => {
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
          <stop offset="0%" stopColor="#F2A2CB" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#F2A2CB" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#spark_${id})`} />
      <path d={d} fill="none" stroke="#E994C0" strokeWidth="1.85" strokeLinecap="round" />
    </svg>
  );
};

/**
 * Sculpted Pastel-Rose Gradient Bars with Outlined Capsule Footers
 * Matches the "Pay item" sculpted gradient column card in image_8cdbd167.png
 */
export const SculptedBarChart: React.FC<{
  data: { label: string; value: number; subtext?: string; count?: number }[];
  maxVal?: number;
  unit?: string;
  accent?: 'rose' | 'lavender' | 'cyan';
  height?: number;
  capsuleLabels?: boolean;
}> = ({ data, maxVal = 20, unit = '', accent = 'rose', height = 215, capsuleLabels = false }) => {
  const [hovered, setHovered] = useState<number | null>(null);
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-44 text-xs text-[#9E90A8]">
        No matching students for current filter selection.
      </div>
    );
  }

  const computedMax = Math.max(maxVal, ...data.map((d) => d.value), 1);
  const gradColors =
    accent === 'lavender'
      ? ['#E9D5FF', '#8B68C7']
      : accent === 'cyan'
      ? ['#BAE6FD', '#3898EC']
      : ['#FAD8EA', '#C4749E'];

  const mutedGrad = ['#9E899B', '#5A4A59'];
  const gradId = `sculpt_${accent}_${data.length}_${capsuleLabels ? 'cap' : 'std'}`;
  const mutedId = `${gradId}_muted`;

  return (
    <div className="relative select-none" style={{ height }}>
      <svg className="w-full h-full overflow-visible" viewBox={`0 0 420 ${height}`}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gradColors[0]} stopOpacity="0.98" />
            <stop offset="100%" stopColor={gradColors[1]} stopOpacity="0.82" />
          </linearGradient>
          <linearGradient id={mutedId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={mutedGrad[0]} stopOpacity="0.85" />
            <stop offset="100%" stopColor={mutedGrad[1]} stopOpacity="0.65" />
          </linearGradient>
        </defs>

        {!capsuleLabels &&
          [0.25, 0.5, 0.75, 1].map((frac, idx) => {
            const y = (height - 50) * (1 - frac) + 14;
            return (
              <line
                key={idx}
                x1={8}
                x2={412}
                y1={y}
                y2={y}
                stroke="rgba(255,255,255,0.05)"
                strokeDasharray="3 3"
              />
            );
          })}

        {data.map((item, idx) => {
          const slotW = 400 / data.length;
          const barW = Math.min(82, Math.max(28, slotW * 0.74));
          const x = 10 + idx * slotW + (slotW - barW) / 2;
          const usableH = height - (capsuleLabels ? 68 : 60);
          const barH = Math.max(18, (item.value / computedMax) * usableH);
          const y = 22 + (usableH - barH);
          const isHov = hovered === idx;
          const isPeak = item.value === Math.max(...data.map((d) => d.value));

          return (
            <g
              key={item.label}
              onMouseEnter={() => setHovered(idx)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer"
            >
              <text
                x={x + barW / 2}
                y={y - 8}
                textAnchor="middle"
                className="fill-white text-[11px] font-mono tabular-nums font-semibold"
                opacity={isHov ? 1 : 0.9}
              >
                {item.value}
                {unit}
              </text>

              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={12}
                fill={capsuleLabels && !isPeak && !isHov ? `url(#${mutedId})` : `url(#${gradId})`}
                opacity={hovered === null || isHov ? 1 : 0.62}
                stroke={isHov ? '#FAD8EA' : 'rgba(255,255,255,0.14)'}
                strokeWidth={isHov ? 1.5 : 1}
              />

              {capsuleLabels ? (
                <g>
                  <rect
                    x={x}
                    y={height - 34}
                    width={barW}
                    height={26}
                    rx={13}
                    fill={isPeak || isHov ? 'rgba(244, 182, 214, 0.14)' : 'rgba(255,255,255,0.03)'}
                    stroke={isPeak || isHov ? 'rgba(244, 182, 214, 0.45)' : 'rgba(255,255,255,0.14)'}
                    strokeWidth={1}
                  />
                  <text
                    x={x + barW / 2}
                    y={height - 17}
                    textAnchor="middle"
                    className="fill-[#EDE5F2] text-[10.5px] font-medium"
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
                    className="fill-[#D7CADF] text-[10.5px] font-medium"
                  >
                    {item.label}
                  </text>
                  {item.count !== undefined && (
                    <text
                      x={x + barW / 2}
                      y={height - 3}
                      textAnchor="middle"
                      className="fill-[#8F8099] text-[9.5px] font-mono tabular-nums"
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
        <div className="absolute top-0 right-1 px-3 py-1.5 rounded-xl bg-[#110C15]/95 border border-white/15 text-[11px] text-white shadow-xl pointer-events-none">
          <span className="font-semibold text-[#FAD6E8]">{data[hovered].label}:</span>{' '}
          <span className="tabular-nums">{data[hovered].subtext}</span>
        </div>
      )}
    </div>
  );
};

/**
 * Interactive 0–20 Grade Score Matrix Grid (Matches the sleek calendar-style matrix in the left sub-card of image_8cdbd167.png!)
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
        <div className="flex items-center justify-between text-xs text-[#C7B9D1] mb-3">
          <span className="font-medium text-white">G3 Score Matrix (0–20)</span>
          <span className="font-mono tabular-nums text-[11px] text-[#E99BC3]">
            Modal G3 = {peakGrade}/20
          </span>
        </div>

        {/* 7-column header aligned like the sleek matrix in the screenshot */}
        <div className="grid grid-cols-7 gap-1.5 text-center mb-1.5">
          {tierHeaders.map((h, i) => (
            <span key={i} className="text-[10px] font-mono text-[#7C6D87]">
              {h}
            </span>
          ))}
        </div>

        {/* 21 grade cells: 0 through 20 arranged in a clean 7x3 grid */}
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
                    ? 'bg-[#F4B6D6] text-[#17101C] font-bold shadow-[0_0_16px_rgba(244,182,214,0.55)] scale-105'
                    : isPassing && hasStudents
                    ? 'text-[#F3ECF7] hover:bg-white/10 font-medium'
                    : hasStudents
                    ? 'text-[#9A8BA5] hover:bg-white/5'
                    : 'text-[#55485E]'
                }`}
              >
                {cell.grade}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-white/[0.07] flex items-center justify-between text-[11px] tabular-nums">
        <span className="text-[#A89BB2]">
          Grade <strong className="text-white font-mono">{activeObj.grade}/20</strong> ({activeObj.status})
        </span>
        <span className="font-mono text-[#FAD6E8]">
          {activeObj.count} students ({share}%)
        </span>
      </div>
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
            <stop offset="0%" stopColor="#FAD8EA" />
            <stop offset="100%" stopColor="#C4739E" />
          </linearGradient>
          <linearGradient id="failGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6E5975" />
            <stop offset="100%" stopColor="#3B2E41" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75, 1].map((f, i) => {
          const y = 18 + usableH * (1 - f);
          return (
            <g key={i}>
              <line x1={28} x2={532} y1={y} y2={y} stroke="rgba(255,255,255,0.05)" />
              <text x={22} y={y + 3} textAnchor="end" className="fill-[#8F8099] text-[9.5px] font-mono tabular-nums">
                {Math.round(maxCount * f)}
              </text>
            </g>
          );
        })}

        <line
          x1={28 + 10 * 24 - 2}
          x2={28 + 10 * 24 - 2}
          y1={10}
          y2={178}
          stroke="#F4B6D6"
          strokeWidth={1.3}
          strokeDasharray="4 3"
        />
        <text x={28 + 10 * 24 + 5} y={18} className="fill-[#F4B6D6] text-[10px] font-medium">
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
                opacity={hovered === null || isHov ? 0.95 : 0.45}
                stroke={isHov ? '#FFFFFF' : 'none'}
                strokeWidth={1.2}
              />
              <text
                x={x + 9}
                y={195}
                textAnchor="middle"
                className="fill-[#B8ABC2] text-[10px] font-mono tabular-nums"
              >
                {d.grade}
              </text>
            </g>
          );
        })}
      </svg>

      {hovered !== null && data[hovered] && (
        <div className="absolute top-1 right-2 px-3 py-1.5 rounded-xl bg-[#110C15]/95 border border-white/15 text-xs text-white shadow-lg pointer-events-none tabular-nums">
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
      <div className="flex items-center justify-center h-44 text-xs text-[#9E90A8]">
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
            <stop offset="0%" stopColor="#F4B6D6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#F4B6D6" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        {[6, 10, 14].map((g) => {
          const y = 22 + usableH - ((g - minY) / (maxY - minY)) * usableH;
          return (
            <g key={g}>
              <line x1={padX} x2={w - padX} y1={y} y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
              <text x={padX - 8} y={y + 3} textAnchor="end" className="fill-[#8F8099] text-[10px] font-mono tabular-nums">
                {g}
              </text>
            </g>
          );
        })}
        <path d={areaPath} fill="url(#ageArea)" />
        <path d={linePath} fill="none" stroke="#F4B6D6" strokeWidth="2.4" strokeLinecap="round" />
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
              fill="#150F1A"
              stroke="#FAD6E8"
              strokeWidth={2.4}
            />
            <text x={p.x} y={p.y - 10} textAnchor="middle" className="fill-white text-[10px] font-mono tabular-nums">
              {p.avgG3}
            </text>
            <text x={p.x} y={184} textAnchor="middle" className="fill-[#D7CADF] text-[11px] font-mono tabular-nums">
              {p.age}y
            </text>
            <text x={p.x} y={197} textAnchor="middle" className="fill-[#8F8099] text-[9px] font-mono tabular-nums">
              n={p.count}
            </text>
          </g>
        ))}
      </svg>
      {hovered !== null && pts[hovered] && (
        <div className="absolute top-0 right-2 px-3 py-1 rounded-xl bg-[#110C15]/95 border border-white/15 text-xs text-white tabular-nums">
          Age {pts[hovered].age}: Avg <span className="text-[#FAD6E8] font-semibold">{pts[hovered].avgG3}/20</span> · Pass {pts[hovered].passRate}%
        </div>
      )}
    </div>
  );
};

/**
 * Dual Grouped Bar Chart
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
      <div className="flex items-center justify-end gap-5 mb-1 text-xs text-[#C7B9D1]">
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
                className="fill-[#C7B9D1] text-[10.5px]"
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
      const alpha = 0.08 + val * 0.76;
      return `rgba(244, 182, 214, ${alpha.toFixed(2)})`;
    }
    const alpha = 0.12 + Math.abs(val) * 0.72;
    return `rgba(125, 211, 252, ${alpha.toFixed(2)})`;
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center justify-between mb-3 text-xs text-[#A89BB2]">
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
                className="h-10 rounded-lg flex items-center justify-center text-[11px] font-mono tabular-nums transition-transform duration-150 hover:scale-105 border border-white/[0.08] cursor-default"
              >
                <span className={Math.abs(val) > 0.58 ? 'text-[#140E18] font-bold' : 'text-white'}>
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
              stroke="rgba(255,255,255,0.06)"
            />
            <line
              x1={toX(tick)}
              x2={toX(tick)}
              y1={padT}
              y2={h - padB}
              stroke="rgba(255,255,255,0.06)"
            />
            <text
              x={padL - 8}
              y={toY(tick) + 3}
              textAnchor="end"
              className="fill-[#8F8099] text-[10px] font-mono tabular-nums"
            >
              {tick}
            </text>
            <text
              x={toX(tick)}
              y={h - padB + 15}
              textAnchor="middle"
              className="fill-[#8F8099] text-[10px] font-mono tabular-nums"
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
          stroke="#7DD3FC"
          strokeWidth={1.5}
          strokeDasharray="5 4"
        />
        <text x={toX(14.2)} y={toY(16.2)} className="fill-[#7DD3FC] text-[10px]">
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
              fill={Math.abs(pt.residual) <= 2 ? '#F4B6D6' : '#C084FC'}
              fillOpacity={isHov ? 1 : 0.8}
              stroke="#120D16"
              strokeWidth={1.2}
              onMouseEnter={() => setHovered(pt)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer transition-opacity"
            />
          );
        })}

        <text x={w / 2} y={h - 3} textAnchor="middle" className="fill-[#A89BB2] text-[11px]">
          Actual Test Grade G3 (0–20)
        </text>
      </svg>

      {hovered && (
        <div className="absolute top-2 left-12 px-3 py-2 rounded-xl bg-[#110C15]/95 border border-white/15 text-xs text-white shadow-xl pointer-events-none tabular-nums">
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
          <stop offset="100%" stopColor="#8B68C7" />
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
              fill={isZeroCenter ? '#F4B6D6' : 'url(#resGrad)'}
              opacity={0.9}
            />
            <text
              x={x + barW / 2}
              y={204}
              textAnchor="middle"
              className="fill-[#B8ABC2] text-[9.5px] font-mono tabular-nums"
            >
              {b.binLabel}
            </text>
          </g>
        );
      })}
      <text x={220} y={226} textAnchor="middle" className="fill-[#8F8099] text-[11px]">
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
                <span className="text-[#8F8099] font-mono mr-2">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                {item.label}
              </span>
              <span className="font-mono tabular-nums text-[#FAD6E8] font-semibold">
                {item.percentage.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${widthPct}%`,
                  background:
                    idx === 0
                      ? 'linear-gradient(90deg, #FAD8EA 0%, #D97EB0 100%)'
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
            <stop offset="50%" stopColor="#F4B6D6" />
            <stop offset="100%" stopColor="#6EE7B7" />
          </linearGradient>
        </defs>

        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="15"
          strokeLinecap="round"
        />

        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="url(#gaugeArc)"
          strokeWidth="15"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 320ms cubic-bezier(0.16, 1, 0.3, 1)' }}
        />

        <line x1={cx} y1={cy - radius - 10} x2={cx} y2={cy - radius + 10} stroke="#FFFFFF" strokeWidth="2.2" />
        <text x={cx} y={cy - radius - 14} textAnchor="middle" className="fill-[#C7B9D1] text-[10px] font-mono">
          Pass 10
        </text>

        <text x={cx - radius} y={cy + 20} textAnchor="middle" className="fill-[#8F8099] text-[10px] font-mono">
          0
        </text>
        <text x={cx + radius} y={cy + 20} textAnchor="middle" className="fill-[#8F8099] text-[10px] font-mono">
          20
        </text>

        <text
          x={cx}
          y={cy - 12}
          textAnchor="middle"
          className="fill-white text-[34px] font-display font-bold tabular-nums"
        >
          {clamped.toFixed(2)}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" className="fill-[#A89BB2] text-[11px] font-mono">
          out of 20.0
        </text>
      </svg>
    </div>
  );
};
