import React, { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';
import {
  BoxPlotStat,
  CategoryAverageItem,
  HistogramBin,
  PerformanceCategory,
} from '../types';

const CATEGORY_COLORS: Record<PerformanceCategory, string> = {
  Excellent: '#6D28D9',
  Good: '#3B82F6',
  Average: '#60A5FA',
  'Needs Support': '#A78BFA',
};

export const CategoryBarChart: React.FC<{ data: CategoryAverageItem[] }> = ({
  data,
}) => {
  return (
    <div className="clean-card rounded-xl p-5">
      <h3 className="text-base font-display font-semibold text-slate-900">
        1. Average Marks by Performance Category
      </h3>
      <p className="text-xs text-slate-500 mt-0.5 mb-4">
        Mean Final Exam Score across Excellent, Good, Average, and Needs Support groups
      </p>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 16, left: 4, bottom: 18 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="category"
              tick={{ fill: '#475569', fontSize: 12 }}
              axisLine={{ stroke: '#CBD5E1' }}
              tickLine={false}
              label={{
                value: 'Performance Category',
                position: 'insideBottom',
                offset: -10,
                fill: '#64748B',
                fontSize: 11,
              }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: '#475569', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              label={{
                value: 'Average Score',
                angle: -90,
                position: 'insideLeft',
                fill: '#64748B',
                fontSize: 11,
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderColor: '#DBEAFE',
                borderRadius: '10px',
                fontSize: '12px',
                color: '#0F172A',
              }}
              formatter={(value: any) => [`${Number(value).toFixed(1)} / 100`, 'Avg Final Score']}
            />
            <Bar dataKey="avgFinalScore" radius={[6, 6, 0, 0]} maxBarSize={54}>
              {data.map((entry) => (
                <Cell
                  key={entry.category}
                  fill={CATEGORY_COLORS[entry.category]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100 leading-relaxed">
        <strong className="text-slate-800">What this tells us:</strong> There is a clear
        separation in average scores across categories — Excellent students average above
        85, while Needs Support students average below 45.
      </p>
    </div>
  );
};

export const ScoreHistogramChart: React.FC<{ data: HistogramBin[] }> = ({
  data,
}) => {
  return (
    <div className="clean-card rounded-xl p-5">
      <h3 className="text-base font-display font-semibold text-slate-900">
        2. Distribution of Final Exam Scores
      </h3>
      <p className="text-xs text-slate-500 mt-0.5 mb-4">
        Number of students falling into each 10-point final exam score bracket
      </p>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 16, left: 4, bottom: 18 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="range"
              tick={{ fill: '#475569', fontSize: 12 }}
              axisLine={{ stroke: '#CBD5E1' }}
              tickLine={false}
              label={{
                value: 'Final Exam Score Range',
                position: 'insideBottom',
                offset: -10,
                fill: '#64748B',
                fontSize: 11,
              }}
            />
            <YAxis
              tick={{ fill: '#475569', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              label={{
                value: 'Number of Students',
                angle: -90,
                position: 'insideLeft',
                fill: '#64748B',
                fontSize: 11,
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderColor: '#DBEAFE',
                borderRadius: '10px',
                fontSize: '12px',
              }}
              formatter={(value: any) => [`${value} students`, 'Count']}
            />
            <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100 leading-relaxed">
        <strong className="text-slate-800">What this tells us:</strong> Most student scores
        cluster in the 60–80 range (bell-shaped distribution), with smaller tails at the
        very low and very high ends.
      </p>
    </div>
  );
};

export const StudyScatterChart: React.FC<{
  points: {
    studentId: string;
    studyHours: number;
    finalExamScore: number;
    category: PerformanceCategory;
  }[];
}> = ({ points }) => {
  const categories: PerformanceCategory[] = [
    'Excellent',
    'Good',
    'Average',
    'Needs Support',
  ];

  return (
    <div className="clean-card rounded-xl p-5">
      <h3 className="text-base font-display font-semibold text-slate-900">
        3. Study Hours vs Final Exam Scores
      </h3>
      <p className="text-xs text-slate-500 mt-0.5 mb-4">
        Each dot represents one student, colored by Performance Category
      </p>

      <div className="h-68 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 16, left: 4, bottom: 18 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              type="number"
              dataKey="studyHours"
              name="Study Hours"
              domain={[0, 10]}
              tick={{ fill: '#475569', fontSize: 12 }}
              axisLine={{ stroke: '#CBD5E1' }}
              tickLine={false}
              label={{
                value: 'Daily Study Hours',
                position: 'insideBottom',
                offset: -10,
                fill: '#64748B',
                fontSize: 11,
              }}
            />
            <YAxis
              type="number"
              dataKey="finalExamScore"
              name="Final Score"
              domain={[0, 100]}
              tick={{ fill: '#475569', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              label={{
                value: 'Final Exam Score',
                angle: -90,
                position: 'insideLeft',
                fill: '#64748B',
                fontSize: 11,
              }}
            />
            <ZAxis range={[36, 36]} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderColor: '#DBEAFE',
                borderRadius: '10px',
                fontSize: '12px',
              }}
              formatter={(value: any, name: any) => [
                name === 'Study Hours' ? `${value} hrs/day` : `${value} / 100`,
                name,
              ]}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
            {categories.map((cat) => (
              <Scatter
                key={cat}
                name={cat}
                data={points.filter((p) => p.category === cat)}
                fill={CATEGORY_COLORS[cat]}
                fillOpacity={0.75}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100 leading-relaxed">
        <strong className="text-slate-800">What this tells us:</strong> Dots trend upward
        from bottom-left to top-right, showing that students who study more hours per day
        usually achieve higher final scores.
      </p>
    </div>
  );
};

export const CategoryBoxPlotChart: React.FC<{ stats: BoxPlotStat[] }> = ({
  stats,
}) => {
  const [hovered, setHovered] = useState<BoxPlotStat | null>(null);

  const width = 520;
  const height = 260;
  const padLeft = 46;
  const padRight = 20;
  const padTop = 18;
  const padBottom = 38;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const yPos = (val: number) => padTop + plotH - (val / 100) * plotH;

  return (
    <div className="clean-card rounded-xl p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-display font-semibold text-slate-900">
            4. Scores Across Performance Categories (Box Plot)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 mb-3">
            Displays min, Q1 (25%), median (50%), Q3 (75%), and max score per group
          </p>
        </div>
        {hovered && (
          <div className="text-[11px] font-mono tabular-nums text-slate-700 bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1">
            {hovered.category}: Med {hovered.median} · IQR {hovered.q1}–{hovered.q3}
          </div>
        )}
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-64"
          role="img"
          aria-label="Box plot of final exam scores across performance categories"
        >
          {[0, 20, 40, 60, 80, 100].map((tick) => {
            const y = yPos(tick);
            return (
              <g key={tick}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray="3 3"
                />
                <text
                  x={padLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#64748B"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          <text
            x={14}
            y={padTop + plotH / 2}
            textAnchor="middle"
            fontSize="11"
            fill="#64748B"
            transform={`rotate(-90 14 ${padTop + plotH / 2})`}
          >
            Final Exam Score
          </text>

          {stats.map((item, idx) => {
            const bandW = plotW / Math.max(1, stats.length);
            const cx = padLeft + idx * bandW + bandW / 2;
            const boxW = Math.min(54, bandW * 0.48);
            const color = CATEGORY_COLORS[item.category];

            const yMin = yPos(item.min);
            const yQ1 = yPos(item.q1);
            const yMed = yPos(item.median);
            const yQ3 = yPos(item.q3);
            const yMax = yPos(item.max);

            return (
              <g
                key={item.category}
                className="cursor-pointer"
                onMouseEnter={() => setHovered(item)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Whisker vertical line */}
                <line
                  x1={cx}
                  y1={yMax}
                  x2={cx}
                  y2={yMin}
                  stroke={color}
                  strokeWidth="2"
                />
                {/* Top & bottom caps */}
                <line
                  x1={cx - 10}
                  y1={yMax}
                  x2={cx + 10}
                  y2={yMax}
                  stroke={color}
                  strokeWidth="2"
                />
                <line
                  x1={cx - 10}
                  y1={yMin}
                  x2={cx + 10}
                  y2={yMin}
                  stroke={color}
                  strokeWidth="2"
                />

                {/* IQR Box */}
                <rect
                  x={cx - boxW / 2}
                  y={yQ3}
                  width={boxW}
                  height={Math.max(4, yQ1 - yQ3)}
                  rx="4"
                  fill={color}
                  fillOpacity="0.22"
                  stroke={color}
                  strokeWidth="2"
                />

                {/* Median line */}
                <line
                  x1={cx - boxW / 2}
                  y1={yMed}
                  x2={cx + boxW / 2}
                  y2={yMed}
                  stroke={color}
                  strokeWidth="3"
                />

                {/* Category label */}
                <text
                  x={cx}
                  y={height - 14}
                  textAnchor="middle"
                  fontSize="11.5"
                  fontWeight="600"
                  fill="#334155"
                >
                  {item.category}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <p className="text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100 leading-relaxed">
        <strong className="text-slate-800">What this tells us:</strong> Shows the middle
        50% score box and median line for each group so we can see how tightly scores are
        packed inside every category.
      </p>
    </div>
  );
};

export const CorrelationHeatmapChart: React.FC<{
  columns: string[];
  matrix: number[][];
}> = ({ columns, matrix }) => {
  const getCellStyle = (val: number) => {
    const absVal = Math.min(1, Math.max(0, Math.abs(val)));
    if (val >= 0.75) {
      return {
        backgroundColor: '#6D28D9',
        color: '#FFFFFF',
      };
    }
    if (val >= 0.5) {
      return {
        backgroundColor: '#3B82F6',
        color: '#FFFFFF',
      };
    }
    if (val >= 0.3) {
      return {
        backgroundColor: '#BFDBFE',
        color: '#1E3A8A',
      };
    }
    return {
      backgroundColor: `rgba(219, 234, 254, ${0.35 + absVal * 0.4})`,
      color: '#1E293B',
    };
  };

  return (
    <div className="clean-card rounded-xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-base font-display font-semibold text-slate-900">
            5. Correlation Heatmap of Numerical Columns
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Pearson correlation (r) between study habits, attendance, prior scores, and final exam score
          </p>
        </div>
        <div className="text-xs text-slate-500">Scale: -1.0 (negative) to +1.0 (positive)</div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="p-2 text-left text-slate-500 font-medium" />
              {columns.map((col) => (
                <th
                  key={col}
                  className="p-2 text-center text-slate-700 font-semibold whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {columns.map((rowCol, rIdx) => (
              <tr key={rowCol}>
                <td className="p-2 pr-3 font-semibold text-slate-700 whitespace-nowrap">
                  {rowCol}
                </td>
                {columns.map((cCol, cIdx) => {
                  const val = matrix[rIdx]?.[cIdx] ?? 0;
                  const style = getCellStyle(val);
                  return (
                    <td key={`${rowCol}-${cCol}`} className="p-1">
                      <div
                        style={style}
                        className="rounded-lg py-3 px-2 text-center font-mono tabular-nums font-semibold"
                      >
                        {val.toFixed(2)}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-600 mt-4 pt-3 border-t border-slate-100 leading-relaxed">
        <strong className="text-slate-800">What this tells us:</strong> All four input
        features have a strong positive correlation with Final Exam Score, meaning higher
        study hours, better attendance, strong assignments, and good previous exam marks
        all move together with higher final scores.
      </p>
    </div>
  );
};
