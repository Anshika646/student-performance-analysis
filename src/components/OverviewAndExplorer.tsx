import React, { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Check,
  Database,
  Download,
  FileSpreadsheet,
  Search,
  SlidersHorizontal,
  Upload,
} from 'lucide-react';
import { DatasetPayload, EvaluationPayload, PageId } from '../types';
import { GradeDistributionChart, SculptedBarChart } from './Charts';

interface OverviewProps {
  dataset: DatasetPayload;
  analytics: ReturnType<typeof import('../utils/analytics').computeDynamicAnalytics>;
  evaluation: EvaluationPayload;
  includeGrades: boolean;
  onToggleIncludeGrades: (val: boolean) => void;
  onNavigate: (page: PageId) => void;
}

export const OverviewPage: React.FC<OverviewProps> = ({
  dataset,
  analytics,
  evaluation,
  includeGrades,
  onToggleIncludeGrades,
  onNavigate,
}) => {
  const bestModel = evaluation.models[evaluation.bestModelKey];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
      {/* Main Deep Espresso-Plum Glass Bento Container (Matches reference centerpiece) */}
      <div className="xl:col-span-9 rounded-[26px] bg-gradient-to-br from-[#251E29] via-[#201924] to-[#1A141D] border border-white/15 p-6 text-white shadow-[0_24px_60px_rgba(28,20,33,0.22)] flex flex-col justify-between">
        {/* Top bar inside dark container */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div>
            <div className="text-xs text-[#C8BBD0]">
              {dataset.datasetLabel} · Filtered Cohort Overview
            </div>
            <h2 className="text-lg font-display font-semibold text-white mt-0.5">
              Academic Performance Distribution & Study Impact
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('eda')}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-medium text-white transition-colors whitespace-nowrap shrink-0"
            >
              Explore All 10 Charts
            </button>
            <button
              onClick={() => onNavigate('prediction')}
              className="px-3.5 py-2 rounded-xl bg-[#F5B2D4] hover:bg-[#FAD6E8] text-xs font-semibold text-[#1F1823] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <span>Predict Student Grade</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Inner Flat Sub-Surfaces */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 my-5">
          {/* Sub-panel 1: Grade Distribution (0-20) */}
          <div className="lg:col-span-7 rounded-[20px] bg-[#2D2432]/90 border border-white/10 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Final Grade (G3) Distribution
                </h3>
                <p className="text-xs text-[#B8AABF]">
                  0–20 grading scale · Pass defined as G3 ≥ 10
                </p>
              </div>
              <span className="text-xs font-mono tabular-nums text-[#FAD6E8]">
                Range: {analytics.lowestG3}–{analytics.highestG3} / 20
              </span>
            </div>
            <GradeDistributionChart data={analytics.gradeDistribution} />
          </div>

          {/* Sub-panel 2: Study Time Sculpted Gradient Bars */}
          <div className="lg:col-span-5 rounded-[20px] bg-[#2D2432]/90 border border-white/10 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Study Time vs Mean Grade
                </h3>
                <p className="text-xs text-[#B8AABF]">
                  Weekly study hours impact on G3
                </p>
              </div>
              <span className="text-xs font-mono tabular-nums text-[#C8BBD0]">
                / 20 pts
              </span>
            </div>
            <SculptedBarChart
              data={analytics.studyVsGrade.map((s) => ({
                label: s.label,
                value: s.avgG3,
                count: s.count,
                subtext: `Avg ${s.avgG3}/20 · Pass ${s.passRate}%`,
              }))}
              maxVal={16}
              accent="rose"
              height={210}
            />
          </div>
        </div>

        {/* Bottom 4-Zone Telemetry Strip (Matches bottom row of dark card in reference UI) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10 items-end">
          <div>
            <div className="text-xs text-[#B8AABF]">Filtered Students</div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-3xl font-display font-bold tabular-nums text-white">
                {analytics.totalStudents}
              </span>
              <span className="text-xs text-[#C8BBD0] font-mono tabular-nums">
                / {dataset.rowCount}
              </span>
            </div>
          </div>

          <div>
            <div className="text-xs text-[#B8AABF]">Highest Final Grade</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-3xl font-display font-bold tabular-nums text-[#FAD6E8]">
                {analytics.highestG3}
              </span>
              <span className="text-xs text-[#C8BBD0] font-mono">/ 20</span>
            </div>
          </div>

          <div>
            <div className="text-xs text-[#B8AABF]">Median Grade & Absences</div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-3xl font-display font-bold tabular-nums text-white">
                {analytics.medianG3}
              </span>
              <span className="text-xs text-[#C8BBD0] font-mono tabular-nums">
                · {analytics.avgAbsences}d abs
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-xs text-[#B8AABF]">Best Test Model</div>
              <div className="mt-1 text-lg font-display font-semibold text-[#F5B2D4] truncate max-w-[165px]">
                {evaluation.bestModelName.replace(' Regressor', '')}
              </div>
            </div>
            <button
              onClick={() => onNavigate('training')}
              title="Inspect Model Evaluation"
              className="w-10 h-10 rounded-full bg-[#F5B2D4]/20 hover:bg-[#F5B2D4] text-[#FAD6E8] hover:text-[#1F1823] border border-[#F5B2D4]/40 flex items-center justify-center transition-colors shrink-0"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Two Stacked Dark Plum Glass Cards (Matches reference right column) */}
      <div className="xl:col-span-3 flex flex-col gap-5">
        {/* Card 1: Pass Rate Summary */}
        <div className="flex-1 rounded-[24px] bg-gradient-to-b from-[#2A222F] to-[#201924] border border-white/15 p-6 text-white shadow-[0_18px_42px_rgba(28,20,33,0.16)] flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#FAD6E8] text-[#1F1823] flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white leading-snug">
                  Cohort Pass Rate
                </h3>
                <p className="text-xs text-[#B8AABF]">Students with G3 ≥ 10</p>
              </div>
            </div>
          </div>

          <div className="my-4">
            <div className="text-xs text-[#B8AABF] mb-1">
              Passing students in active view
            </div>
            <div className="flex items-end justify-between gap-2">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-display font-bold tabular-nums text-white">
                  {analytics.passRate}
                </span>
                <span className="text-sm font-mono text-[#FAD6E8]">%</span>
              </div>

              <button
                onClick={() => onNavigate('explorer')}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-[#F5B2D4] hover:text-[#1F1823] text-xs font-medium text-[#FAD6E8] transition-colors whitespace-nowrap"
              >
                Inspect Rows
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Active ML Mode & Test R² */}
        <div className="flex-1 rounded-[24px] bg-gradient-to-b from-[#2A222F] to-[#201924] border border-white/15 p-6 text-white shadow-[0_18px_42px_rgba(28,20,33,0.16)] flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#FAD6E8] text-[#1F1823] flex items-center justify-center shrink-0">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white leading-snug">
                  Prediction Mode R²
                </h3>
                <p className="text-xs text-[#B8AABF]">
                  {includeGrades ? 'With G1 & G2 grades' : 'Habits & background only'}
                </p>
              </div>
            </div>
          </div>

          <div className="my-4">
            <div className="text-xs text-[#B8AABF] mb-1">
              Test RMSE: {bestModel.testMetrics.rmse.toFixed(2)} pts · MAE: {bestModel.testMetrics.mae.toFixed(2)}
            </div>
            <div className="flex items-end justify-between gap-2">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-display font-bold tabular-nums text-white">
                  {bestModel.testMetrics.r2.toFixed(3)}
                </span>
                <span className="text-xs font-mono text-[#FAD6E8]">R²</span>
              </div>

              {/* Interactive Pill Switch matching reference UI toggle */}
              <div className="flex items-center p-1 rounded-full bg-white/10 border border-white/10">
                <button
                  onClick={() => onToggleIncludeGrades(false)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors whitespace-nowrap ${
                    !includeGrades ? 'bg-[#F5B2D4] text-[#1F1823] font-semibold' : 'text-[#C8BBD0] hover:text-white'
                  }`}
                >
                  No G1/G2
                </button>
                <button
                  onClick={() => onToggleIncludeGrades(true)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors whitespace-nowrap ${
                    includeGrades ? 'bg-[#F5B2D4] text-[#1F1823] font-semibold' : 'text-[#C8BBD0] hover:text-white'
                  }`}
                >
                  +G1/G2
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ExplorerProps {
  dataset: DatasetPayload;
  filteredRows: Record<string, any>[];
  onSwitchDataset: (key: 'mat' | 'por') => void;
  onUploadCsv: (csvText: string, fileName: string) => void;
}

export const ExplorerPage: React.FC<ExplorerProps> = ({
  dataset,
  filteredRows,
  onSwitchDataset,
  onUploadCsv,
}) => {
  const [subTab, setSubTab] = useState<'records' | 'schema'>('records');
  const [searchQuery, setSearchQuery] = useState('');
  const [pageIdx, setPageIdx] = useState(0);
  const pageSize = 18;

  const searchedRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return filteredRows;
    return filteredRows.filter((row) =>
      Object.values(row).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [filteredRows, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(searchedRows.length / pageSize));
  const safePage = Math.min(pageIdx, totalPages - 1);
  const visibleRows = searchedRows.slice(safePage * pageSize, (safePage + 1) * pageSize);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUploadCsv(reader.result, file.name);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-5">
      {/* Dataset Management & Hygiene Bar */}
      <div className="rounded-[22px] bg-white/75 backdrop-blur-xl border border-white/90 p-5 shadow-[0_12px_32px_rgba(35,29,37,0.05)] flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#6E5D76]">
            <Database className="w-3.5 h-3.5 text-[#C76596]" />
            <span>Active Source: {dataset.datasetLabel}</span>
            <span>·</span>
            <span className="tabular-nums">{dataset.rowCount} clean rows</span>
            <span>·</span>
            <span className="tabular-nums">{dataset.columnCount} columns</span>
            <span>·</span>
            <span className="tabular-nums">Duplicates removed: {dataset.duplicatesRemoved}</span>
            <span>·</span>
            <span className="tabular-nums">Missing values imputed: {dataset.totalMissingImputed}</span>
          </div>
          <p className="text-sm font-medium text-[#1F1823]">
            Switch between UCI Mathematics and Portuguese datasets, download raw UCI CSVs, or upload your own CSV.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onSwitchDataset('mat')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
              dataset.datasetKey === 'mat'
                ? 'bg-[#221B25] text-white'
                : 'bg-[#F6E6EF] text-[#3B2E41] hover:bg-[#FAD6E8]'
            }`}
          >
            Mathematics (395)
          </button>
          <button
            onClick={() => onSwitchDataset('por')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
              dataset.datasetKey === 'por'
                ? 'bg-[#221B25] text-white'
                : 'bg-[#F6E6EF] text-[#3B2E41] hover:bg-[#FAD6E8]'
            }`}
          >
            Portuguese (649)
          </button>

          <label className="px-3.5 py-2 rounded-xl bg-[#FAD6E8] hover:bg-[#F5B2D4] text-[#1F1823] text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload CSV</span>
            <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
          </label>

          <a
            href="/api/dataset/download/mat"
            download="student-mat.csv"
            className="px-3 py-2 rounded-xl border border-[#DFC9D6] bg-white hover:bg-[#FDF6FA] text-[#221B25] text-xs font-medium flex items-center gap-1.5 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>student-mat.csv</span>
          </a>
          <a
            href="/api/dataset/download/por"
            download="student-por.csv"
            className="px-3 py-2 rounded-xl border border-[#DFC9D6] bg-white hover:bg-[#FDF6FA] text-[#221B25] text-xs font-medium flex items-center gap-1.5 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>student-por.csv</span>
          </a>
        </div>
      </div>

      {/* Main Dark Plum Data Explorer Container */}
      <div className="rounded-[26px] bg-gradient-to-br from-[#251E29] via-[#201924] to-[#1A141D] border border-white/15 p-6 text-white shadow-[0_24px_60px_rgba(28,20,33,0.2)]">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/10">
            <button
              onClick={() => setSubTab('records')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                subTab === 'records' ? 'bg-[#F5B2D4] text-[#1F1823]' : 'text-[#D9CEE0] hover:text-white'
              }`}
            >
              Interactive Data Table ({searchedRows.length})
            </button>
            <button
              onClick={() => setSubTab('schema')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                subTab === 'schema' ? 'bg-[#F5B2D4] text-[#1F1823]' : 'text-[#D9CEE0] hover:text-white'
              }`}
            >
              Statistics, Data Types & Missing Values ({dataset.columnCount})
            </button>
          </div>

          {subTab === 'records' && (
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#B8AABF] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPageIdx(0);
                }}
                placeholder="Filter rows (e.g. teacher, GP)..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder-[#9A8BA3] focus:outline-none focus:border-[#FAD6E8]"
              />
            </div>
          )}
        </div>

        {subTab === 'records' ? (
          <>
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#2F2635] text-[#D9CEE0] border-b border-white/10">
                    <th className="py-2.5 px-3 font-semibold">#</th>
                    {dataset.columns.map((col) => (
                      <th
                        key={col}
                        className={`py-2.5 px-3 font-semibold whitespace-nowrap ${
                          col === 'G3' ? 'text-[#FAD6E8] bg-[#3B2B3E]' : ''
                        }`}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {visibleRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.05] transition-colors">
                      <td className="py-2 px-3 font-mono tabular-nums text-[#9A8BA3]">
                        {safePage * pageSize + idx + 1}
                      </td>
                      {dataset.columns.map((col) => {
                        const val = row[col];
                        const isNum = dataset.columnTypes[col] !== 'categorical';
                        return (
                          <td
                            key={col}
                            className={`py-2 px-3 whitespace-nowrap ${
                              isNum ? 'font-mono tabular-nums text-right' : 'text-[#EDE5F2]'
                            } ${
                              col === 'G3'
                                ? Number(val) >= 10
                                  ? 'font-bold text-[#FAD6E8] bg-[#3B2B3E]/50'
                                  : 'font-bold text-rose-300 bg-[#3B2B3E]/50'
                                : ''
                            }`}
                          >
                            {String(val)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-4 text-xs text-[#C8BBD0]">
              <span className="tabular-nums">
                Showing {searchedRows.length === 0 ? 0 : safePage * pageSize + 1}–
                {Math.min(searchedRows.length, (safePage + 1) * pageSize)} of {searchedRows.length} records
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={safePage === 0}
                  onClick={() => setPageIdx((p) => Math.max(0, p - 1))}
                  className="px-3 py-1.5 rounded-lg bg-white/10 disabled:opacity-40 hover:bg-white/15 transition-colors"
                >
                  Previous
                </button>
                <span className="font-mono tabular-nums">
                  Page {safePage + 1} / {totalPages}
                </span>
                <button
                  disabled={safePage >= totalPages - 1}
                  onClick={() => setPageIdx((p) => Math.min(totalPages - 1, p + 1))}
                  className="px-3 py-1.5 rounded-lg bg-white/10 disabled:opacity-40 hover:bg-white/15 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#2F2635] text-[#D9CEE0] border-b border-white/10">
                  <th className="py-2.5 px-3 font-semibold">Column</th>
                  <th className="py-2.5 px-3 font-semibold">Data Type</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Missing</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Mean / Top</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Std / Unique</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Min</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Median (50%)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Max</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {dataset.columnStats.map((st) => (
                  <tr key={st.column} className="hover:bg-white/[0.05]">
                    <td className="py-2 px-3 font-semibold text-white">{st.column}</td>
                    <td className="py-2 px-3 font-mono text-[#FAD6E8]">{st.dtype}</td>
                    <td className="py-2 px-3 font-mono tabular-nums text-right text-[#C8BBD0]">
                      {st.missing}
                    </td>
                    <td className="py-2 px-3 font-mono tabular-nums text-right">
                      {st.mean !== undefined ? st.mean : `${st.top} (${st.freq})`}
                    </td>
                    <td className="py-2 px-3 font-mono tabular-nums text-right text-[#C8BBD0]">
                      {st.std !== undefined ? st.std : `${st.unique} classes`}
                    </td>
                    <td className="py-2 px-3 font-mono tabular-nums text-right text-[#C8BBD0]">
                      {st.min !== undefined ? st.min : '—'}
                    </td>
                    <td className="py-2 px-3 font-mono tabular-nums text-right text-white">
                      {st.median !== undefined ? st.median : '—'}
                    </td>
                    <td className="py-2 px-3 font-mono tabular-nums text-right text-[#C8BBD0]">
                      {st.max !== undefined ? st.max : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
