import React, { useId, useState } from 'react';
import { FeatureImportanceItem, ResidualBin, ScatterPoint } from '../types';

type GlassTone = 'champagne' | 'pewter' | 'pearl';

/**
 * Shared SVG Definitions for True Physical Architectural Frosted Glass Bars
 * Zero neon colors: uses translucent champagne-quartz, smoked pewter-silver,
 * diagonal specular light refraction, inner rim stroke, and top meniscus glint.
 */
const GlassSvgDefs: React.FC<{ prefix: string }> = ({ prefix }) => (
  <defs>
    {/* 1. Champagne-Rose Smoked Glass Body */}
    <linearGradient id={`${prefix}_body_champagne`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#F2DCE7" stopOpacity="0.46" />
      <stop offset="38%" stopColor="#CFA5BA" stopOpacity="0.22" />
      <stop offset="100%" stopColor="#7A5B6D" stopOpacity="0.06" />
    </linearGradient>

    {/* 2. Pearl Highlight Glass Body (Peak / Active Columns) */}
    <linearGradient id={`${prefix}_body_pearl`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#FAF0F5" stopOpacity="0.60" />
      <stop offset="42%" stopColor="#DFBACC" stopOpacity="0.28" />
      <stop offset="100%" stopColor="#8E6B7E" stopOpacity="0.09" />
    </linearGradient>

    {/* 3. Smoked Pewter-Silver Glass Body (Secondary / Reference Columns) */}
    <linearGradient id={`${prefix}_body_pewter`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#DFDAE6" stopOpacity="0.34" />
      <stop offset="45%" stopColor="#9E94AA" stopOpacity="0.15" />
      <stop offset="100%" stopColor="#524A5C" stopOpacity="0.05" />
    </linearGradient>

    {/* 4. Diagonal Specular Glass Refraction Sheen */}
    <linearGradient id={`${prefix}_sheen`} x1="0" y1="0" x2="1" y2="0.85">
      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.26" />
      <stop offset="32%" stopColor="#FFFFFF" stopOpacity="0.06" />
      <stop offset="68%" stopColor="#FFFFFF" stopOpacity="0.0" />
    </linearGradient>

    {/* 5. Vertical Specular Rim Border (Bright top meniscus fading down) */}
    <linearGradient id={`${prefix}_rim`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.58" />
      <stop offset="35%" stopColor="#F2DCE7" stopOpacity="0.22" />
      <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.06" />
    </linearGradient>

    {/* 6. Subtle Left Vertical Bevel Glint */}
    <linearGradient id={`${prefix}_bevel`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.32" />
      <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.04" />
      <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
    </linearGradient>
  </defs>
);

/**
 * Reusable Physical Frosted Glass Column Primitive
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
  rx = 10,
  tone = 'champagne',
  dimmed = false,
  hovered = false,
}) => {
  const safeR = Math.min(rx, width / 2, height / 2);
  const topCapWidth = Math.max(4, width - safeR * 1.4);

  return (
    <g opacity={dimmed ? 0.42 : 1} style={{ transition: 'opacity 180ms ease' }}>
      {/* Recessed dark glass slot track */}
      {trackTop !== undefined && trackHeight !== undefined && (
        <rect
          x={x}
          y={trackTop}
          width={width}
          height={trackHeight}
          rx={safeR}
          fill="rgba(255,255,255,0.018)"
          stroke="rgba(255,255,255,0.038)"
          strokeWidth={0.8}
        />
      )}

      {/* Frosted translucent body */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={safeR}
        fill={`url(#${prefix}_body_${hovered ? 'pearl' : tone})`}
      />

      {/* Diagonal optical glass sheen */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={safeR}
        fill={`url(#${prefix}_sheen)`}
      />

      {/* Left vertical studio rim reflection */}
      {height > 14 && width > 12 && (
        <line
          x1={x + 2}
          y1={y + safeR}
          x2={x + 2}
          y2={y + height - safeR}
          stroke={`url(#${prefix}_bevel)`}
          strokeWidth={1.2}
          strokeLinecap="round"
        />
      )}

      {/* Outer crisp specular border */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={safeR}
        fill="none"
        stroke={hovered ? 'rgba(255,255,255,0.72)' : `url(#${prefix}_rim)`}
        strokeWidth={hovered ? 1.35 : 1}
      />

      {/* Luminous top meniscus highlight */}
      <line
        x1={x + (width - topCapWidth) / 2}
        y1={y + 0.75}
        x2={x + (width + topCapWidth) / 2}
        y2={y + 0.75}
        stroke="rgba(255,255,255,0.78)"
        strokeWidth={1.35}
        strokeLinecap="round"
      />
    </g>
  );
};

/**
 * Hero Circular Frosted Glass Ring
 */
export const CircularMetricRing: React.FC<{
  percentage: number;
  label?: string;
}> = ({ percentage, label = '%' }) => {
  const uid = useId().replace(/:/g, '');
  const clamped = Math.max(0, Math.min(100, percentage));
  const size = 112;
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
            <stop offset="0%" stopColor="#F7ECF2" />
            <stop offset="55%" stopColor="#DFB8CC" />
            <stop offset="100%" stopColor="#9C7489" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.055)"
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
        <span className="text-2xl font-display font-semibold text-[#FAF6FA] tabular-nums leading-none">
          {Math.round(clamped)}
        </span>
        <span className="text-[10px] text-[#9E93A6] font-mono mt-0.5">{label}</span>
      </div>
    </div>
  );
};

/**
 * Refined Champagne-Pearl Sparkline (Zero Neon)
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
          <stop offset="0%" stopColor="#E6C2D4" stopOpacity="0.24" />
          <stop offset="100%" stopColor="#E6C2D4" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#spark_${id})`} />
      <path d={d} fill="none" stroke="#DDB4C9" strokeWidth="1.65" strokeLinecap="round" />
    </svg>
  );
};

/**
 * Sleek Frosted Glass Vertical Bar Chart
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
      <div className="flex items-center justify-center h-44 text-xs text-[#95899E]">
        No matching students for current filter selection.
      </div>
    );
  }

  const computedMax = Math.max(maxVal, ...data.map((d) => d.value), 1);
  const peakVal = Math.max(...data.map((d) => d.value));
  const defaultTone: GlassTone = accent === 'lavender' || accent === 'cyan' ? 'pewter' : 'champagne';

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
              stroke="rgba(255,255,255,0.038)"
              strokeDasharray="2 4"
            />
          );
        })}

        {data.map((item, idx) => {
          const slotW = 400 / data.length;
          const barW = Math.min(76, Math.max(26, slotW * 0.68));
          const x = 10 + idx * slotW + (slotW - barW) / 2;
          const usableH = height - (capsuleLabels ? 70 : 60);
          const barH = Math.max(16, (item.value / computedMax) * usableH);
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
                rx={11}
                tone={isHighlight ? 'pearl' : defaultTone}
                dimmed={hovered !== null && !isHov}
                hovered={isHov}
              />

              <text
                x={x + barW / 2}
                y={y - 7}
                textAnchor="middle"
                className="fill-[#F6F1F8] text-[11px] font-mono tabular-nums font-medium"
                opacity={isHov ? 1 : 0.88}
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
                    height={25}
                    rx={12.5}
                    fill={
                      isHighlight || isHov
                        ? 'rgba(238, 206, 223, 0.12)'
                        : 'rgba(255, 255, 255, 0.025)'
                    }
                    stroke={
                      isHighlight || isHov
                        ? 'rgba(242, 214, 229, 0.36)'
                        : 'rgba(255, 255, 255, 0.10)'
                    }
                    strokeWidth={1}
                  />
                  <text
                    x={x + barW / 2}
                    y={height - 18}
                    textAnchor="middle"
                    className="fill-[#EAE3EE] text-[10.5px] font-medium"
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
                    className="fill-[#D4C9DC] text-[10.5px] font-medium"
                  >
                    {item.label}
                  </text>
                  {item.count !== undefined && (
                    <text
                      x={x + barW / 2}
                      y={height - 3}
                      textAnchor="middle"
                      className="fill-[#887C93] text-[9.5px] font-mono tabular-nums"
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
        <div className="absolute top-0 right-1 px-3 py-1.5 rounded-xl bg-[#120E17]/95 border border-white/15 text-[11px] text-[#F5EFF7] shadow-xl pointer-events-none backdrop-blur-md">
          <span className="font-semibold text-[#EAD0DF]">{data[hovered].label}:</span>{' '}
          <span className="tabular-nums text-[#C9BDD2]">{data[hovered].subtext}</span>
        </div>
      )}
    </div>
  );
};

/**
 * Interactive 0–20 Grade Score Matrix Grid (Frosted Glass Cells)
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
          <span className="font-medium text-[#F5EFF7]">G3 Score Matrix (0–20)</span>
          <span className="font-mono tabular-nums text-[11px] text-[#DFC0D1]">
            Modal G3 = {peakGrade}/20
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center mb-1.5">
          {tierHeaders.map((h, i) => (
            <span key={i} className="text-[10px] font-mono text-[#786C82]">
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
                    ? 'text-[#EDE6F2] bg-white/[0.025] hover:bg-white/[0.07] border border-white/[0.05]'
                    : hasStudents
                    ? 'text-[#95899E] hover:bg-white/[0.04]'
                    : 'text-[#4F4557]'
                }`}
              >
                {cell.grade}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-white/[0.07] flex items-center justify-between text-[11px] tabular-nums">
        <span className="text-[#9E93A6]">
          Grade <strong className="text-white font-mono">{activeObj.grade}/20</strong> ({activeObj.status})
        </span>
        <span className="font-mono text-[#E6CCD9]">
          {activeObj.count} students ({share}%)
        </span>
      </div>
    </div>
  );
};

/**
 * Final Grade (G3: 0 to 20) Frosted Glass Histogram
 */
export const GradeDistributionChart: React.FC<{
  data: { grade: number; count: number; status: string }[];
}> = ({ data }) => {
  const uid = useId().replace(/:/g, '');
  const [hovered, setHovered] = useState<number | null>(null);
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const h = 215;
  const usableH = 158;

  return (
    <div className="relative">
      <svg className="w-full h-[215px] overflow-visible" viewBox={`0 0 540 ${h}`}>
        <GlassSvgDefs prefix={uid} />

        {[0.25, 0.5, 0.75, 1].map((f, i) => {
          const y = 18 + usableH * (1 - f);
          return (
            <g key={i}>
              <line x1={28} x2={532} y1={y} y2={y} stroke="rgba(255,255,255,0.04)" />
              <text x={22} y={y + 3} textAnchor="end" className="fill-[#887C93] text-[9.5px] font-mono tabular-nums">
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
          stroke="rgba(238, 206, 223, 0.55)"
          strokeWidth={1.2}
          strokeDasharray="3 3"
        />
        <text x={28 + 10 * 24 + 5} y={18} className="fill-[#E4C7D6] text-[10px] font-medium">
          Pass Boundary (G3 ≥ 10)
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
                rx={6}
                tone={d.grade >= 10 ? 'champagne' : 'pewter'}
                dimmed={hovered !== null && !isHov}
                hovered={isHov}
              />
              <text
                x={x + 9}
                y={195}
                textAnchor="middle"
                className="fill-[#B5A9BF] text-[10px] font-mono tabular-nums"
              >
                {d.grade}
              </text>
            </g>
          );
        })}
      </svg>

      {hovered !== null && data[hovered] && (
        <div className="absolute top-1 right-2 px-3 py-1.5 rounded-xl bg-[#120E17]/95 border border-white/15 text-xs text-white shadow-lg pointer-events-none tabular-nums backdrop-blur-md">
          Grade <span className="font-semibold text-[#EAD0DF]">{data[hovered].grade}/20</span> ·{' '}
          <span className="text-[#C9BDD2]">{data[hovered].count} students</span> ·{' '}
          <span className={data[hovered].grade >= 10 ? 'text-[#B5CBBF]' : 'text-[#D4A3B4]'}>
            {data[hovered].status}
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * Longitudinal Period Trajectory Chart (G1 -> G2 -> G3) in Frosted Glass
 */
export const PeriodProgressionChart: React.FC<{
  data: { period: string; passingAvg: number; failingAvg: number; overallAvg: number }[];
}> = ({ data }) => {
  const uid = useId().replace(/:/g, '');
  if (!data.length) return null;

  return (
    <div>
      <div className="flex items-center justify-end gap-5 mb-2 text-[11px] text-[#B8ABC2]">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#E8CEDC]/70 border border-white/40 inline-block" />
          Passing Cohort (G3 ≥ 10)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#B8B0C4]/45 border border-white/25 inline-block" />
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
                rx={9}
                tone="pearl"
              />
              <text
                x={xBase + barW / 2}
                y={yPass - 6}
                textAnchor="middle"
                className="fill-[#F6F1F8] text-[10px] font-mono tabular-nums"
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
                rx={9}
                tone="pewter"
              />
              <text
                x={xBase + barW + 8 + barW / 2}
                y={yAll - 6}
                textAnchor="middle"
                className="fill-[#CFC6D8] text-[10px] font-mono tabular-nums"
              >
                {d.overallAvg}
              </text>

              <text
                x={xBase + barW + 4}
                y={178}
                textAnchor="middle"
                className="fill-[#D4C9DC] text-[11px] font-medium"
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
 * Age-wise Smooth Glass Area & Trajectory Line Chart
 */
export const AgeTrajectoryChart: React.FC<{
  data: { age: number; avgG3: number; passRate: number; count: number }[];
}> = ({ data }) => {
  const uid = useId().replace(/:/g, '');
  const [hovered, setHovered] = useState<number | null>(null);
  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center h-44 text-xs text-[#95899E]">
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
          <linearGradient id={`ageArea_${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E8CBD9" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#E8CBD9" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        {[6, 10, 14].map((g) => {
          const y = 22 + usableH - ((g - minY) / (maxY - minY)) * usableH;
          return (
            <g key={g}>
              <line x1={padX} x2={w - padX} y1={y} y2={y} stroke="rgba(255,255,255,0.045)" strokeDasharray="3 3" />
              <text x={padX - 8} y={y + 3} textAnchor="end" className="fill-[#887C93] text-[10px] font-mono tabular-nums">
                {g}
              </text>
            </g>
          );
        })}
        <path d={areaPath} fill={`url(#ageArea_${uid})`} />
        <path d={linePath} fill="none" stroke="#E8CBD9" strokeWidth="2" strokeLinecap="round" />
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
              r={hovered === idx ? 5.8 : 4}
              fill="#14101A"
              stroke="#F3E2EC"
              strokeWidth={2}
            />
            <text x={p.x} y={p.y - 10} textAnchor="middle" className="fill-[#F5EFF7] text-[10px] font-mono tabular-nums">
              {p.avgG3}
            </text>
            <text x={p.x} y={184} textAnchor="middle" className="fill-[#D4C9DC] text-[11px] font-mono tabular-nums">
              {p.age}y
            </text>
            <text x={p.x} y={197} textAnchor="middle" className="fill-[#887C93] text-[9px] font-mono tabular-nums">
              n={p.count}
            </text>
          </g>
        ))}
      </svg>
      {hovered !== null && pts[hovered] && (
        <div className="absolute top-0 right-2 px-3 py-1 rounded-xl bg-[#120E17]/95 border border-white/15 text-xs text-white tabular-nums backdrop-blur-md">
          Age {pts[hovered].age}: Avg <span className="text-[#EAD0DF] font-semibold">{pts[hovered].avgG3}/20</span> · Pass {pts[hovered].passRate}%
        </div>
      )}
    </div>
  );
};

/**
 * Dual Grouped Frosted Glass Bar Chart (Zero Neon: Champagne Glass vs Pewter Glass)
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
      <div className="flex items-center justify-end gap-5 mb-1 text-[11px] text-[#C4B8CD]">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#E8CEDC]/65 border border-white/40 inline-block" />
          {seriesA.name}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#B8B0C4]/45 border border-white/25 inline-block" />
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
                rx={7}
                tone="champagne"
              />
              <text
                x={xBase + barW / 2}
                y={yA - 5}
                textAnchor="middle"
                className="fill-[#F6F1F8] text-[9.5px] font-mono tabular-nums"
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
                rx={7}
                tone="pewter"
              />
              <text
                x={xBase + barW + 6 + barW / 2}
                y={yB - 5}
                textAnchor="middle"
                className="fill-[#CFC6D8] text-[9.5px] font-mono tabular-nums"
              >
                {seriesB.values[idx]}
              </text>

              <text
                x={xBase + barW + 3}
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
 * Interactive Smoked-Glass Correlation Matrix (Muted Champagne & Slate-Pewter, Zero Neon)
 */
export const CorrelationHeatmap: React.FC<{
  columns: string[];
  matrix: number[][];
}> = ({ columns, matrix }) => {
  const [hoverCell, setHoverCell] = useState<{ r: number; c: number; val: number } | null>(null);
  if (!columns.length || !matrix.length) return null;

  const cellStyle = (val: number): React.CSSProperties => {
    if (val >= 0) {
      const alpha = 0.05 + val * 0.44;
      return {
        background: `linear-gradient(165deg, rgba(236, 202, 220, ${(alpha * 1.15).toFixed(2)}) 0%, rgba(168, 122, 148, ${(alpha * 0.65).toFixed(2)}) 100%)`,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.16)',
      };
    }
    const alpha = 0.06 + Math.abs(val) * 0.46;
    return {
      background: `linear-gradient(165deg, rgba(188, 196, 214, ${alpha.toFixed(2)}) 0%, rgba(102, 112, 134, ${(alpha * 0.7).toFixed(2)}) 100%)`,
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)',
    };
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center justify-between mb-3 text-xs text-[#9E93A6]">
        <span>Pearson Correlation Coefficient (r) across numerical student attributes</span>
        {hoverCell && (
          <span className="font-mono tabular-nums text-[#E8CEDC]">
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
          <div key={col} className="text-center text-[11px] font-semibold text-[#E2D8E8] py-1 truncate">
            {col}
          </div>
        ))}

        {matrix.map((row, rIdx) => (
          <React.Fragment key={columns[rIdx]}>
            <div className="flex items-center justify-end pr-2 text-[11px] font-semibold text-[#E2D8E8]">
              {columns[rIdx]}
            </div>
            {row.map((val, cIdx) => (
              <div
                key={`${rIdx}-${cIdx}`}
                onMouseEnter={() => setHoverCell({ r: rIdx, c: cIdx, val })}
                onMouseLeave={() => setHoverCell(null)}
                style={cellStyle(val)}
                className="h-10 rounded-xl flex items-center justify-center text-[11px] font-mono tabular-nums transition-transform duration-150 hover:scale-[1.04] border border-white/[0.09] cursor-default text-[#F6F1F8]"
              >
                <span className={val >= 0.75 ? 'font-semibold text-white' : 'text-[#E5DCEB]'}>
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
 * Actual vs Predicted Frosted-Glass Scatter Plot (Zero Neon)
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
            <line x1={padL} x2={w - padR} y1={toY(tick)} y2={toY(tick)} stroke="rgba(255,255,255,0.045)" />
            <line x1={toX(tick)} x2={toX(tick)} y1={padT} y2={h - padB} stroke="rgba(255,255,255,0.045)" />
            <text x={padL - 8} y={toY(tick) + 3} textAnchor="end" className="fill-[#887C93] text-[10px] font-mono tabular-nums">
              {tick}
            </text>
            <text x={toX(tick)} y={h - padB + 15} textAnchor="middle" className="fill-[#887C93] text-[10px] font-mono tabular-nums">
              {tick}
            </text>
          </g>
        ))}

        {/* Muted Pearl Diagonal y = x Reference */}
        <line
          x1={toX(0)}
          y1={toY(0)}
          x2={toX(20)}
          y2={toY(20)}
          stroke="rgba(232, 224, 238, 0.42)"
          strokeWidth={1.3}
          strokeDasharray="4 4"
        />
        <text x={toX(14.0)} y={toY(16.3)} className="fill-[#C7B9D1] text-[10px]">
          Ideal Alignment (y = x)
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
              fill={closeFit ? 'rgba(238, 204, 221, 0.48)' : 'rgba(192, 184, 208, 0.30)'}
              stroke={isHov ? '#FFFFFF' : closeFit ? 'rgba(255, 240, 248, 0.78)' : 'rgba(220, 214, 232, 0.5)'}
              strokeWidth={isHov ? 1.6 : 1.1}
              onMouseEnter={() => setHovered(pt)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer transition-all"
            />
          );
        })}

        <text x={w / 2} y={h - 3} textAnchor="middle" className="fill-[#9E93A6] text-[11px]">
          Actual Held-Out Test Grade G3 (0–20)
        </text>
      </svg>

      {hovered && (
        <div className="absolute top-2 left-12 px-3 py-2 rounded-xl bg-[#120E17]/95 border border-white/15 text-xs text-white shadow-xl pointer-events-none tabular-nums backdrop-blur-md">
          <div className="font-semibold text-[#EAD0DF]">Test Student #{hovered.id}</div>
          <div className="text-[#D4C9DC]">
            Actual: <b className="text-white">{hovered.actual}</b> · Predicted:{' '}
            <b className="text-white">{hovered.predicted}</b> · Residual:{' '}
            <span className={Math.abs(hovered.residual) <= 1.5 ? 'text-[#B5CBBF]' : 'text-[#D4A3B4]'}>
              {hovered.residual > 0 ? `+${hovered.residual}` : hovered.residual}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Residual Error Frosted Glass Histogram
 */
export const ResidualHistogram: React.FC<{ bins: ResidualBin[] }> = ({ bins }) => {
  const uid = useId().replace(/:/g, '');
  const maxC = Math.max(...bins.map((b) => b.count), 1);
  const h = 235;
  const usableH = 165;

  return (
    <svg className="w-full h-[235px] overflow-visible" viewBox={`0 0 440 ${h}`}>
      <GlassSvgDefs prefix={uid} />
      {bins.map((b, i) => {
        const slot = 410 / bins.length;
        const barW = Math.max(16, slot - 6);
        const x = 18 + i * slot;
        const barH = b.count === 0 ? 3 : Math.max(6, (b.count / maxC) * usableH);
        const y = 22 + (usableH - barH);
        const isZeroCenter = Math.abs(b.binCenter) < 0.85;

        return (
          <g key={b.range}>
            <GlassColumn
              prefix={uid}
              x={x}
              y={y}
              width={barW}
              height={barH}
              trackTop={22}
              trackHeight={usableH}
              rx={6}
              tone={isZeroCenter ? 'pearl' : 'pewter'}
            />
            {b.count > 0 && (
              <text
                x={x + barW / 2}
                y={y - 5}
                textAnchor="middle"
                className="fill-[#F5EFF7] text-[9.5px] font-mono tabular-nums"
              >
                {b.count}
              </text>
            )}
            <text
              x={x + barW / 2}
              y={204}
              textAnchor="middle"
              className="fill-[#B5A9BF] text-[9.5px] font-mono tabular-nums"
            >
              {b.binLabel}
            </text>
          </g>
        );
      })}
      <text x={220} y={226} textAnchor="middle" className="fill-[#887C93] text-[11px]">
        Residual Error (y_actual − y_predicted)
      </text>
    </svg>
  );
};

/**
 * Horizontal Liquid-Glass Ranked Feature Importance Bars
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
              <span className="text-[#EFE9F4] font-medium">
                <span className="text-[#847890] font-mono mr-2">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                {item.label}
              </span>
              <span className="font-mono tabular-nums text-[#E8CEDC] font-medium">
                {item.percentage.toFixed(1)}%
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-white/[0.025] border border-white/[0.05] p-[1px] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${widthPct}%`,
                  background:
                    idx === 0
                      ? 'linear-gradient(90deg, rgba(236, 202, 220, 0.35) 0%, rgba(246, 226, 236, 0.68) 100%)'
                      : 'linear-gradient(90deg, rgba(196, 186, 208, 0.22) 0%, rgba(226, 214, 234, 0.48) 100%)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.45)',
                  borderRight: '1px solid rgba(255,255,255,0.65)',
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
 * Semi-Circular Frosted Champagne-Pearl Grade Gauge (Zero Neon)
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
            <stop offset="0%" stopColor="#9C7A8E" />
            <stop offset="52%" stopColor="#DFBACC" />
            <stop offset="100%" stopColor="#F8EEF3" />
          </linearGradient>
        </defs>

        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
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

        <line x1={cx} y1={cy - radius - 10} x2={cx} y2={cy - radius + 10} stroke="rgba(255,255,255,0.75)" strokeWidth="2" />
        <text x={cx} y={cy - radius - 14} textAnchor="middle" className="fill-[#B8ABC2] text-[10px] font-mono">
          Pass 10
        </text>

        <text x={cx - radius} y={cy + 20} textAnchor="middle" className="fill-[#887C93] text-[10px] font-mono">
          0
        </text>
        <text x={cx + radius} y={cy + 20} textAnchor="middle" className="fill-[#887C93] text-[10px] font-mono">
          20
        </text>

        <text
          x={cx}
          y={cy - 12}
          textAnchor="middle"
          className="fill-[#FAF6FA] text-[34px] font-display font-semibold tabular-nums"
        >
          {clamped.toFixed(2)}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" className="fill-[#9E93A6] text-[11px] font-mono">
          out of 20.0
        </text>
      </svg>
    </div>
  );
};
