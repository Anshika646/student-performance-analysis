import React, { useMemo, useState } from 'react';
import {
  Award,
  Check,
  ChevronRight,
  Database,
  Download,
  ExternalLink,
  GraduationCap,
  LayoutGrid,
  Search,
  Sparkles,
  TrendingUp,
  Upload,
  Users,
  X,
} from 'lucide-react';
import {
  DatasetPayload,
  EvaluationPayload,
  ModelKey,
  PageId,
  PredictionPayload,
} from '../types';
import {
  GradeScoreMatrix,
  RoseSparkline,
  SculptedBarChart,
} from './Charts';

interface OverviewProps {
  dataset: DatasetPayload;
  analytics: ReturnType<typeof import('../utils/analytics').computeDynamicAnalytics>;
  evaluation: EvaluationPayload;
  selectedModel: ModelKey;
  onSelectModel: (key: ModelKey) => void;
  includeGrades: boolean;
  onToggleIncludeGrades: (val: boolean) => void;
  prediction: PredictionPayload | null;
  onSwitchDataset: (key: 'mat' | 'por') => void;
  onNavigate: (page: PageId) => void;
}

export const OverviewPage: React.FC<OverviewProps> = ({
  dataset,
  analytics,
  evaluation,
  selectedModel,
  onSelectModel,
  includeGrades,
  onToggleIncludeGrades,
  prediction,
  onSwitchDataset,
  onNavigate,
}) => {
  const activeModelObj = evaluation.models[selectedModel];
  const r2DisplayPct = Math.max(0, Math.round(activeModelObj.testMetrics.r2 * 100));

  // Take 3 clear study brackets or top 3 study levels for the 3-column capsule bar card
  const studyBars = useMemo(() => {
    const raw = analytics.studyVsGrade;
    if (raw.length <= 3) {
      return raw.map((s) => ({
        label: s.label,
        value: s.avgG3,
        subtext: `Avg ${s.avgG3}/20 · Pass ${s.passRate}% (n=${s.count})`,
      }));
    }
    // Group into <2h, 2-5h, and 5-10h+ for crisp 3-bar sculpted visual balance
    const low = raw[0];
    const mid = raw[1];
    const highCount = raw.slice(2).reduce((s, x) => s + x.count, 0) || 1;
    const highWeightedAvg =
      raw.slice(2).reduce((s, x) => s + x.avgG3 * x.count, 0) / highCount;
    const highPass =
      raw.slice(2).reduce((s, x) => s + x.passRate * x.count, 0) / highCount;
    return [
      {
        label: '< 2 hrs',
        value: low.avgG3,
        subtext: `Avg ${low.avgG3}/20 · Pass ${low.passRate}% (n=${low.count})`,
      },
      {
        label: '2–5 hrs',
        value: mid.avgG3,
        subtext: `Avg ${mid.avgG3}/20 · Pass ${mid.passRate}% (n=${mid.count})`,
      },
      {
        label: '5–10+ hrs',
        value: Number(highWeightedAvg.toFixed(2)),
        subtext: `Avg ${highWeightedAvg.toFixed(2)}/20 · Pass ${highPass.toFixed(1)}% (n=${highCount})`,
      },
    ];
  }, [analytics.studyVsGrade]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
      {/* Left 9-Column Sleek Smoked-Glass Bento Container */}
      <div className="xl:col-span-9 glass-shell rounded-[26px] p-6 flex flex-col justify-between gap-5">
        {/* Top Interactive Header & Rose Node Track */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => onNavigate('eda')}
              title="Open All Visualizations"
              className="w-10 h-10 rounded-full bg-[#3A2736]/80 hover:bg-[#4E3449] border border-white/10 flex items-center justify-center text-[#F4B6D6] transition-colors shrink-0"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>

            {/* Cohort Mode Interactive Switch Cluster */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/[0.04] border border-white/10">
              <button
                onClick={() => onSwitchDataset('mat')}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                  dataset.datasetKey === 'mat'
                    ? 'bg-[#F4B6D6] text-[#160F1B]'
                    : 'text-[#B8ABC2] hover:text-white'
                }`}
              >
                Math (395)
              </button>
              <button
                onClick={() => onSwitchDataset('por')}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                  dataset.datasetKey === 'por'
                    ? 'bg-[#F4B6D6] text-[#160F1B]'
                    : 'text-[#B8ABC2] hover:text-white'
                }`}
              >
                Portuguese (649)
              </button>
              <button
                onClick={() => onNavigate('prediction')}
                className="px-3 py-1 rounded-full text-[11px] font-medium text-[#E99BC3] hover:bg-white/10 transition-colors"
              >
                + Predict
              </button>
            </div>

            <button
              onClick={() => onNavigate('insights')}
              className="text-xs text-[#B8ABC2] hover:text-white transition-colors whitespace-nowrap hidden sm:inline-flex items-center gap-1"
            >
              <span>Diagnostics</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Signature Thin Rose Track Line with 3 Nodes */}
          <div className="relative flex items-center justify-between max-w-md mx-auto px-2">
            <div className="absolute left-3 right-3 h-[1.5px] bg-gradient-to-r from-[#8E5674] via-[#F4B6D6] to-[#6E5675]" />
            <button
              type="button"
              onClick={() => onSwitchDataset('mat')}
              title="Mathematics Cohort"
              className={`relative z-10 w-2.5 h-2.5 rounded-full transition-transform ${
                dataset.datasetKey === 'mat'
                  ? 'bg-[#F4B6D6] ring-4 ring-[#F4B6D6]/25 scale-110'
                  : 'bg-[#7A6682] hover:bg-white'
              }`}
            />
            <button
              type="button"
              onClick={() => onToggleIncludeGrades(!includeGrades)}
              title="Toggle G1/G2 Prior Grades Mode"
              className={`relative z-10 w-3 h-3 rounded-full transition-transform ${
                includeGrades
                  ? 'bg-[#F4B6D6] ring-4 ring-[#F4B6D6]/25'
                  : 'bg-[#B794F4] ring-4 ring-[#B794F4]/25'
              }`}
            />
            <button
              type="button"
              onClick={() => onSwitchDataset('por')}
              title="Portuguese Cohort"
              className={`relative z-10 w-2.5 h-2.5 rounded-full transition-transform ${
                dataset.datasetKey === 'por'
                  ? 'bg-[#F4B6D6] ring-4 ring-[#F4B6D6]/25 scale-110'
                  : 'bg-[#7A6682] hover:bg-white'
              }`}
            />
          </div>
        </div>

        {/* 3 Inner Smoked-Glass Sub-Cards (Matches Calendar / Plan / Sculpted Bars layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* Sub-Card 1: Interactive 0-20 Grade Score Matrix */}
          <div className="lg:col-span-4 glass-subcard rounded-[20px] p-4">
            <GradeScoreMatrix
              data={analytics.gradeDistribution}
              totalStudents={analytics.totalStudents}
            />
          </div>

          {/* Sub-Card 2: Supervised ML Model Selector ("Payment plan" equivalent) */}
          <div className="lg:col-span-4 glass-subcard rounded-[20px] p-4 flex flex-col justify-between">
            <div>
              <div className="text-xs font-medium text-white mb-3.5">
                Regression Algorithm
              </div>

              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ['random_forest', 'Random Forest'],
                    ['linear_regression', 'Linear Reg.'],
                    ['decision_tree', 'Decision Tree'],
                  ] as [ModelKey, string][]
                ).map(([key, label]) => {
                  const active = selectedModel === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => onSelectModel(key)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                        active
                          ? 'bg-[#4B2E42]/80 border border-[#F4B6D6]/65 text-[#FAD8EA] shadow-[0_0_18px_rgba(244,182,214,0.18)]'
                          : 'bg-white/[0.03] border border-white/12 text-[#B8ABC2] hover:text-white hover:border-white/25'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-white/[0.06]">
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-display font-semibold text-white tabular-nums">
                  {includeGrades ? r2DisplayPct : activeModelObj.testMetrics.rmse.toFixed(2)}
                </span>
                <span className="text-sm font-mono text-[#F4B6D6]">
                  {includeGrades ? '%' : 'pts'}
                </span>
                <span className="text-xs text-[#9E90A8] ml-1">
                  / {includeGrades ? 'test R² variance' : 'test RMSE'}
                </span>
              </div>
              <div className="text-[11px] text-[#8F8099] font-mono tabular-nums mt-1">
                MAE: {activeModelObj.testMetrics.mae.toFixed(2)} · Train R²: {activeModelObj.trainMetrics.r2.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Sub-Card 3: Study Time Sculpted Gradient Bars with Outlined Capsule Footers */}
          <div className="lg:col-span-4 glass-subcard rounded-[20px] p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-white">Study Hours vs G3</span>
              <span className="text-[10px] font-mono text-[#9E90A8]">avg / 20</span>
            </div>
            <SculptedBarChart
              data={studyBars}
              maxVal={15}
              height={195}
              capsuleLabels={true}
            />
          </div>
        </div>

        {/* Bottom 4 Smoked-Glass Micro-Cards with Rose Sparklines */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Mini Card 1 */}
          <button
            type="button"
            onClick={() => onNavigate('eda')}
            className="glass-subcard hover:border-white/20 rounded-[18px] p-3.5 text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#472D40]/80 border border-[#F4B6D6]/20 flex items-center justify-center text-[#F4B6D6]">
                  <TrendingUp className="w-3.5 h-3.5" />
                </span>
                <span className="text-[11px] text-[#B8ABC2]">Mean Absences</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#8F8099] group-hover:text-white transition-colors" />
            </div>
            <div className="flex items-end justify-between gap-2">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-display font-semibold text-white tabular-nums">
                  {analytics.avgAbsences}
                </span>
                <span className="text-xs text-[#9E90A8]">/ term</span>
              </div>
              <RoseSparkline
                id="mini_abs"
                width={58}
                height={22}
                values={analytics.absencesBinned.map((a) => a.avgG3)}
              />
            </div>
          </button>

          {/* Mini Card 2 */}
          <button
            type="button"
            onClick={() => onNavigate('explorer')}
            className="glass-subcard hover:border-white/20 rounded-[18px] p-3.5 text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#472D40]/80 border border-[#F4B6D6]/20 flex items-center justify-center text-[#F4B6D6]">
                  <Users className="w-3.5 h-3.5" />
                </span>
                <span className="text-[11px] text-[#B8ABC2]">Active Students</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#8F8099] group-hover:text-white transition-colors" />
            </div>
            <div className="flex items-end justify-between gap-2">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-display font-semibold text-white tabular-nums">
                  {analytics.totalStudents}
                </span>
              </div>
              <RoseSparkline
                id="mini_stu"
                width={58}
                height={22}
                values={analytics.agePerformance.map((a) => a.count)}
              />
            </div>
          </button>

          {/* Mini Card 3 */}
          <button
            type="button"
            onClick={() => onNavigate('eda')}
            className="glass-subcard hover:border-white/20 rounded-[18px] p-3.5 text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#472D40]/80 border border-[#F4B6D6]/20 flex items-center justify-center text-[#F4B6D6]">
                  <Award className="w-3.5 h-3.5" />
                </span>
                <span className="text-[11px] text-[#B8ABC2]">Highest Grade</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#8F8099] group-hover:text-white transition-colors" />
            </div>
            <div className="flex items-end justify-between gap-2">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-display font-semibold text-white tabular-nums">
                  {analytics.highestG3}
                </span>
                <span className="text-xs text-[#9E90A8]">/ 20</span>
              </div>
              <RoseSparkline
                id="mini_max"
                width={58}
                height={22}
                values={[12, 14, 15, 17, 19, analytics.highestG3]}
              />
            </div>
          </button>

          {/* Mini Card 4 */}
          <button
            type="button"
            onClick={() => onNavigate('training')}
            className="glass-subcard hover:border-white/20 rounded-[18px] p-3.5 text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#472D40]/80 border border-[#F4B6D6]/20 flex items-center justify-center text-[#F4B6D6]">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span className="text-[11px] text-[#B8ABC2]">Best Test Model</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#8F8099] group-hover:text-white transition-colors" />
            </div>
            <div className="flex items-end justify-between gap-2">
              <span className="text-lg font-display font-semibold text-white truncate">
                {evaluation.bestModelName.replace(' Regressor', '')}
              </span>
              <RoseSparkline id="mini_mod" width={54} height={22} values={[0.68, 0.74, 0.78, 0.85]} />
            </div>
          </button>
        </div>
      </div>

      {/* Right 3-Column Stacked Dark Smoked-Glass Cards (Matches Unsplash / Dropbox cards) */}
      <div className="xl:col-span-3 flex flex-col gap-5">
        {/* Stacked Card 1: Live Student Prediction & G1/G2 Toggle */}
        <div className="flex-1 glass-kpi rounded-[24px] p-6 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-[#F8DFEC] text-[#19111E] flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(248,223,236,0.2)]">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-display font-semibold text-white">
                  Grade Predictor
                </h3>
                <p className="text-xs text-[#9E90A8] mt-0.5">
                  {includeGrades ? 'With G1 & G2 grades' : 'Habits & background'}
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('prediction')}
              title="Open Student Predictor"
              className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/15 border border-white/10 flex items-center justify-center text-[#C7B9D1] hover:text-white transition-colors shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-6">
            <div className="text-[11px] text-[#9E90A8] mb-1">
              Sample Predicted Final G3
            </div>
            <div className="flex items-end justify-between gap-2">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-display font-semibold text-white tabular-nums">
                  {prediction ? prediction.predictedGrade.toFixed(1) : '15.2'}
                </span>
                <sup className="text-xs font-mono text-[#F4B6D6]">/20</sup>
              </div>

              {/* Signature [ x | check ] Pill Switch */}
              <div className="flex items-center p-1 rounded-full bg-white/[0.06] border border-white/10">
                <button
                  type="button"
                  onClick={() => onToggleIncludeGrades(false)}
                  title="Exclude G1 & G2"
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    !includeGrades
                      ? 'bg-[#F4B6D6] text-[#17101C] shadow-sm'
                      : 'text-[#9E90A8] hover:text-white'
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onToggleIncludeGrades(true)}
                  title="Include G1 & G2"
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    includeGrades
                      ? 'bg-[#F4B6D6] text-[#17101C] shadow-sm'
                      : 'text-[#9E90A8] hover:text-white'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stacked Card 2: UCI Dataset Records & Subject Switch */}
        <div className="flex-1 glass-kpi rounded-[24px] p-6 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-[#F8DFEC] text-[#19111E] flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(248,223,236,0.2)]">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-display font-semibold text-white">
                  UCI Repository
                </h3>
                <p className="text-xs text-[#9E90A8] mt-0.5 truncate max-w-[140px]">
                  {dataset.datasetKey === 'por' ? 'Portuguese Cohort' : 'Mathematics Cohort'}
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('explorer')}
              title="Open Dataset Explorer"
              className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/15 border border-white/10 flex items-center justify-center text-[#C7B9D1] hover:text-white transition-colors shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-6">
            <div className="text-[11px] text-[#9E90A8] mb-1">
              Verified Student Records
            </div>
            <div className="flex items-end justify-between gap-2">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-display font-semibold text-white tabular-nums">
                  {dataset.rowCount}
                </span>
                <sup className="text-xs font-mono text-[#F4B6D6]">{dataset.columnCount}c</sup>
              </div>

              {/* Dataset Switcher Pill */}
              <div className="flex items-center p-1 rounded-full bg-white/[0.06] border border-white/10">
                <button
                  type="button"
                  onClick={() => onSwitchDataset('mat')}
                  title="Mathematics (student-mat.csv)"
                  className={`px-2.5 h-7 rounded-full text-[10px] font-mono font-semibold transition-all ${
                    dataset.datasetKey === 'mat'
                      ? 'bg-[#F4B6D6] text-[#17101C]'
                      : 'text-[#9E90A8] hover:text-white'
                  }`}
                >
                  MAT
                </button>
                <button
                  type="button"
                  onClick={() => onSwitchDataset('por')}
                  title="Portuguese (student-por.csv)"
                  className={`px-2.5 h-7 rounded-full text-[10px] font-mono font-semibold transition-all ${
                    dataset.datasetKey === 'por'
                      ? 'bg-[#F4B6D6] text-[#17101C]'
                      : 'text-[#9E90A8] hover:text-white'
                  }`}
                >
                  POR
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
  globalSearch: string;
  onChangeGlobalSearch: (q: string) => void;
  onSwitchDataset: (key: 'mat' | 'por') => void;
  onUploadCsv: (csvText: string, fileName: string) => void;
}

export const ExplorerPage: React.FC<ExplorerProps> = ({
  dataset,
  filteredRows,
  globalSearch,
  onChangeGlobalSearch,
  onSwitchDataset,
  onUploadCsv,
}) => {
  const [subTab, setSubTab] = useState<'records' | 'schema'>('records');
  const [pageIdx, setPageIdx] = useState(0);
  const pageSize = 18;

  const searchedRows = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    if (!q) return filteredRows;
    return filteredRows.filter((row) =>
      Object.values(row).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [filteredRows, globalSearch]);

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
      {/* Dark Smoked-Glass Dataset Controls & Hygiene Summary */}
      <div className="glass-shell rounded-[24px] p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#A89BB2]">
            <Database className="w-3.5 h-3.5 text-[#F4B6D6]" />
            <span className="text-white font-medium">{dataset.datasetLabel}</span>
            <span>·</span>
            <span className="tabular-nums">{dataset.rowCount} clean rows</span>
            <span>·</span>
            <span className="tabular-nums">{dataset.columnCount} columns</span>
            <span>·</span>
            <span className="tabular-nums">Duplicates removed: {dataset.duplicatesRemoved}</span>
            <span>·</span>
            <span className="tabular-nums">Missing imputed: {dataset.totalMissingImputed}</span>
          </div>
          <p className="text-xs text-[#8F8099]">
            Switch between official UCI Mathematics and Portuguese datasets, download raw semicolon CSVs, or upload custom student data.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onSwitchDataset('mat')}
            className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
              dataset.datasetKey === 'mat'
                ? 'bg-[#F4B6D6] text-[#17101C]'
                : 'bg-white/[0.05] border border-white/10 text-[#C7B9D1] hover:text-white'
            }`}
          >
            Mathematics (395)
          </button>
          <button
            onClick={() => onSwitchDataset('por')}
            className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
              dataset.datasetKey === 'por'
                ? 'bg-[#F4B6D6] text-[#17101C]'
                : 'bg-white/[0.05] border border-white/10 text-[#C7B9D1] hover:text-white'
            }`}
          >
            Portuguese (649)
          </button>

          <label className="px-3.5 py-2 rounded-full bg-[#4B2E42]/80 hover:bg-[#5E3A53] border border-[#F4B6D6]/40 text-[#FAD8EA] text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload CSV</span>
            <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
          </label>

          <a
            href="/api/dataset/download/mat"
            download="student-mat.csv"
            className="px-3 py-2 rounded-full bg-white/[0.04] hover:bg-white/10 border border-white/10 text-[#E6DCEB] text-xs font-medium flex items-center gap-1.5 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-[#F4B6D6]" />
            <span>student-mat.csv</span>
          </a>
          <a
            href="/api/dataset/download/por"
            download="student-por.csv"
            className="px-3 py-2 rounded-full bg-white/[0.04] hover:bg-white/10 border border-white/10 text-[#E6DCEB] text-xs font-medium flex items-center gap-1.5 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-[#F4B6D6]" />
            <span>student-por.csv</span>
          </a>
        </div>
      </div>

      {/* Main Dark Glass Table & Schema Explorer */}
      <div className="glass-shell rounded-[26px] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.04] border border-white/10">
            <button
              onClick={() => setSubTab('records')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                subTab === 'records'
                  ? 'bg-[#F4B6D6] text-[#17101C]'
                  : 'text-[#C7B9D1] hover:text-white'
              }`}
            >
              Student Records ({searchedRows.length})
            </button>
            <button
              onClick={() => setSubTab('schema')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                subTab === 'schema'
                  ? 'bg-[#F4B6D6] text-[#17101C]'
                  : 'text-[#C7B9D1] hover:text-white'
              }`}
            >
              Statistics, Data Types & Missing ({dataset.columnCount})
            </button>
          </div>

          {subTab === 'records' && (
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#9E90A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => {
                  onChangeGlobalSearch(e.target.value);
                  setPageIdx(0);
                }}
                placeholder="Search records (e.g. teacher, GP)..."
                className="w-full pl-9 pr-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs text-white placeholder-[#7F708A] focus:outline-none focus:border-[#F4B6D6]/60"
              />
            </div>
          )}
        </div>

        {subTab === 'records' ? (
          <>
            <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-white/[0.04] text-[#C7B9D1] border-b border-white/[0.08]">
                    <th className="py-2.5 px-3 font-semibold">#</th>
                    {dataset.columns.map((col) => (
                      <th
                        key={col}
                        className={`py-2.5 px-3 font-semibold whitespace-nowrap ${
                          col === 'G3' ? 'text-[#FAD6E8] bg-[#462C3F]/50' : ''
                        }`}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {visibleRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.04] transition-colors">
                      <td className="py-2 px-3 font-mono tabular-nums text-[#8F8099]">
                        {safePage * pageSize + idx + 1}
                      </td>
                      {dataset.columns.map((col) => {
                        const val = row[col];
                        const isNum = dataset.columnTypes[col] !== 'categorical';
                        return (
                          <td
                            key={col}
                            className={`py-2 px-3 whitespace-nowrap ${
                              isNum ? 'font-mono tabular-nums text-right text-[#EDE5F2]' : 'text-[#D7CADF]'
                            } ${
                              col === 'G3'
                                ? Number(val) >= 10
                                  ? 'font-bold text-[#F4B6D6] bg-[#462C3F]/35'
                                  : 'font-bold text-rose-300 bg-[#462C3F]/35'
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

            <div className="flex items-center justify-between mt-4 text-xs text-[#A89BB2]">
              <span className="tabular-nums">
                Showing {searchedRows.length === 0 ? 0 : safePage * pageSize + 1}–
                {Math.min(searchedRows.length, (safePage + 1) * pageSize)} of {searchedRows.length} records
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={safePage === 0}
                  onClick={() => setPageIdx((p) => Math.max(0, p - 1))}
                  className="px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/10 disabled:opacity-35 hover:bg-white/10 text-white transition-colors"
                >
                  Previous
                </button>
                <span className="font-mono tabular-nums">
                  {safePage + 1} / {totalPages}
                </span>
                <button
                  disabled={safePage >= totalPages - 1}
                  onClick={() => setPageIdx((p) => Math.min(totalPages - 1, p + 1))}
                  className="px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/10 disabled:opacity-35 hover:bg-white/10 text-white transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-white/[0.04] text-[#C7B9D1] border-b border-white/[0.08]">
                  <th className="py-2.5 px-3 font-semibold">Column</th>
                  <th className="py-2.5 px-3 font-semibold">Data Type</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Missing</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Mean / Mode</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Std / Unique</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Min</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Median (50%)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Max</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {dataset.columnStats.map((st) => (
                  <tr key={st.column} className="hover:bg-white/[0.04]">
                    <td className="py-2 px-3 font-semibold text-white">{st.column}</td>
                    <td className="py-2 px-3 font-mono text-[#F4B6D6]">{st.dtype}</td>
                    <td className="py-2 px-3 font-mono tabular-nums text-right text-[#A89BB2]">
                      {st.missing}
                    </td>
                    <td className="py-2 px-3 font-mono tabular-nums text-right text-white">
                      {st.mean !== undefined ? st.mean : `${st.top} (${st.freq})`}
                    </td>
                    <td className="py-2 px-3 font-mono tabular-nums text-right text-[#A89BB2]">
                      {st.std !== undefined ? st.std : `${st.unique} classes`}
                    </td>
                    <td className="py-2 px-3 font-mono tabular-nums text-right text-[#A89BB2]">
                      {st.min !== undefined ? st.min : '—'}
                    </td>
                    <td className="py-2 px-3 font-mono tabular-nums text-right text-white">
                      {st.median !== undefined ? st.median : '—'}
                    </td>
                    <td className="py-2 px-3 font-mono tabular-nums text-right text-[#A89BB2]">
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
