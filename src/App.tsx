import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Code2,
  Download,
  GraduationCap,
  Plus,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import {
  CohortFilters,
  DatasetPayload,
  EvaluationPayload,
  ModelKey,
  PageId,
  PredictionPayload,
  PythonSourceFile,
  StudentInputProfile,
} from './types';
import { computeDynamicAnalytics, filterDatasetRows } from './utils/analytics';
import { CircularMetricRing, RoseSparkline } from './components/Charts';
import { ExplorerPage, OverviewPage } from './components/OverviewAndExplorer';
import { EdaPage, TrainingPage } from './components/EdaAndTraining';
import {
  InsightsPage,
  PredictionPage,
  PythonSourceModal,
} from './components/PredictionAndInsights';

const PAGE_META: Record<
  PageId,
  {
    navLabel: string;
    heroTop: string;
    heroAccent: string;
    subtitle: string;
  }
> = {
  overview: {
    navLabel: 'Overview',
    heroTop: 'Student',
    heroAccent: 'Analytics',
    subtitle:
      'Predict final grades, explore cohort patterns, and evaluate supervised ML models on the UCI dataset.',
  },
  explorer: {
    navLabel: 'Dataset',
    heroTop: 'Dataset',
    heroAccent: 'Explorer',
    subtitle:
      'Inspect clean UCI records, missing-value imputation, data types, and summary statistics.',
  },
  eda: {
    navLabel: 'Visualizations',
    heroTop: 'Exploratory',
    heroAccent: 'Analysis',
    subtitle:
      'Ten interactive cohort visualizations updating dynamically across demographic and study filters.',
  },
  training: {
    navLabel: 'ML Training',
    heroTop: 'Supervised',
    heroAccent: 'Models',
    subtitle:
      'Train and compare Linear Regression, Random Forest, and Decision Tree Regressors without leakage.',
  },
  prediction: {
    navLabel: 'Prediction',
    heroTop: 'Student',
    heroAccent: 'Prediction',
    subtitle:
      'Run live Python ML grade inference with factor contributions and academic improvement guidance.',
  },
  insights: {
    navLabel: 'Insights',
    heroTop: 'Model',
    heroAccent: 'Diagnostics',
    subtitle:
      'Evaluate actual-vs-predicted test alignment, residual error symmetry, and feature importance.',
  },
};

const DEFAULT_FILTERS: CohortFilters = {
  school: 'all',
  sex: 'all',
  minAge: 15,
  maxAge: 22,
  studytime: 'all',
};

const INITIAL_STUDENT: StudentInputProfile = {
  age: 17,
  sex: 'F',
  studytime: 3,
  absences: 3,
  failures: 0,
  Medu: 4,
  Fedu: 3,
  internet: 'yes',
  schoolsup: 'no',
  G1: 14,
  G2: 15,
};

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('overview');

  // Dataset & Evaluations from Python ML backend
  const [datasetKey, setDatasetKey] = useState<'mat' | 'por' | 'custom'>('mat');
  const [customCsvText, setCustomCsvText] = useState<string | null>(null);
  const [dataset, setDataset] = useState<DatasetPayload | null>(null);
  const [evaluations, setEvaluations] = useState<{
    with_grades: EvaluationPayload;
    without_grades: EvaluationPayload;
  } | null>(null);

  // Active ML Configuration
  const [includeGrades, setIncludeGrades] = useState<boolean>(true);
  const [selectedModel, setSelectedModel] = useState<ModelKey>('random_forest');
  const [hyperparams, setHyperparams] = useState({
    testSize: 0.2,
    randomState: 42,
    maxDepth: 6,
    nEstimators: 40,
  });

  // Dynamic Cohort Filters & Search
  const [filters, setFilters] = useState<CohortFilters>(DEFAULT_FILTERS);
  const [globalSearch, setGlobalSearch] = useState<string>('');

  // Student Prediction State
  const [studentInput, setStudentInput] = useState<StudentInputProfile>(INITIAL_STUDENT);
  const [prediction, setPrediction] = useState<PredictionPayload | null>(null);

  // Loading & Error States
  const [loadingBundle, setLoadingBundle] = useState<boolean>(true);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Python Source Modal
  const [pythonModalOpen, setPythonModalOpen] = useState(false);
  const [pythonFiles, setPythonFiles] = useState<PythonSourceFile[]>([]);

  const loadBundle = useCallback(
    async (targetKey: 'mat' | 'por' | 'custom', csvOverride: string | null = null) => {
      setLoadingBundle(true);
      setErrorBanner(null);
      try {
        const res = await fetch('/api/ml/bundle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            datasetKey: targetKey === 'custom' ? 'mat' : targetKey,
            customCsvText: targetKey === 'custom' ? csvOverride : null,
            ...hyperparams,
          }),
        });
        const data = await res.json();
        if (!res.ok || data.ok === false) {
          throw new Error(data.error || 'Failed to load dataset from Python ML engine');
        }
        setDataset(data.dataset);
        setEvaluations(data.evaluations);
        setFilters(DEFAULT_FILTERS);
      } catch (err: any) {
        setErrorBanner(err?.message || 'Unable to load dataset');
      } finally {
        setLoadingBundle(false);
      }
    },
    [hyperparams]
  );

  useEffect(() => {
    loadBundle('mat', null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const executePrediction = useCallback(
    async (profileOverride?: StudentInputProfile) => {
      const targetProfile = profileOverride || studentInput;
      setIsPredicting(true);
      setErrorBanner(null);
      try {
        const res = await fetch('/api/ml/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            datasetKey: datasetKey === 'custom' ? 'mat' : datasetKey,
            customCsvText: datasetKey === 'custom' ? customCsvText : null,
            includeGrades,
            modelKey: selectedModel,
            ...hyperparams,
            studentInput: targetProfile,
          }),
        });
        const data = await res.json();
        if (!res.ok || data.ok === false) {
          throw new Error(data.error || 'Prediction request failed');
        }
        setPrediction(data.prediction);
      } catch (err: any) {
        setErrorBanner(err?.message || 'Prediction failed');
      } finally {
        setIsPredicting(false);
      }
    },
    [datasetKey, customCsvText, includeGrades, selectedModel, hyperparams, studentInput]
  );

  useEffect(() => {
    if (dataset && evaluations) {
      executePrediction();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataset?.datasetLabel, includeGrades, selectedModel]);

  const handleSwitchDataset = (key: 'mat' | 'por') => {
    setDatasetKey(key);
    setCustomCsvText(null);
    loadBundle(key, null);
  };

  const handleUploadCsv = (csvText: string, _fileName: string) => {
    setDatasetKey('custom');
    setCustomCsvText(csvText);
    loadBundle('custom', csvText);
  };

  const handleRetrain = async () => {
    setIsTraining(true);
    setErrorBanner(null);
    try {
      const res = await fetch('/api/ml/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          datasetKey: datasetKey === 'custom' ? 'mat' : datasetKey,
          customCsvText: datasetKey === 'custom' ? customCsvText : null,
          ...hyperparams,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.ok === false) {
        throw new Error(data.error || 'Model retraining failed');
      }
      setEvaluations(data.evaluations);
      await executePrediction();
    } catch (err: any) {
      setErrorBanner(err?.message || 'Retraining failed');
    } finally {
      setIsTraining(false);
    }
  };

  const handleOpenPythonModal = async () => {
    setPythonModalOpen(true);
    if (!pythonFiles.length) {
      try {
        const res = await fetch('/api/ml/python-sources');
        const data = await res.json();
        if (data.ok && Array.isArray(data.files)) {
          setPythonFiles(data.files);
        }
      } catch {
        // Ignore gracefully
      }
    }
  };

  const filteredRows = useMemo(() => {
    if (!dataset) return [];
    return filterDatasetRows(dataset.rows, filters);
  }, [dataset, filters]);

  const analytics = useMemo(() => {
    if (!dataset) {
      return computeDynamicAnalytics([], []);
    }
    return computeDynamicAnalytics(filteredRows, dataset.correlationColumns);
  }, [dataset, filteredRows]);

  const activeEvaluation = evaluations
    ? includeGrades
      ? evaluations.with_grades
      : evaluations.without_grades
    : null;

  const bestModelMetrics = activeEvaluation
    ? activeEvaluation.models[activeEvaluation.bestModelKey].testMetrics
    : null;

  const hasActiveFilters =
    filters.school !== 'all' ||
    filters.sex !== 'all' ||
    filters.studytime !== 'all' ||
    filters.minAge !== 15 ||
    filters.maxAge !== 22;

  const pageMeta = PAGE_META[activePage];

  return (
    <div className="min-h-screen flex flex-col text-[#F7F2F9]">
      {/* Sleek Dark Glass Top Bar (3-Zone Contract matching image_8cdbd167.png) */}
      <header className="sticky top-0 z-30 bg-[#100C15]/80 backdrop-blur-2xl border-b border-white/[0.07]">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8 py-3.5 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Monogram */}
          <button
            type="button"
            onClick={() => setActivePage('overview')}
            className="text-2xl font-display font-bold tracking-tight text-[#FAD8EA] whitespace-nowrap shrink-0"
          >
            ep
          </button>

          {/* Zone 2: Sleek Single-Line Navigation Links */}
          <nav className="flex items-center gap-1.5 sm:gap-3 overflow-x-auto no-scrollbar py-0.5">
            {(Object.keys(PAGE_META) as PageId[]).map((pid) => {
              const isActive = activePage === pid;
              return (
                <button
                  key={pid}
                  type="button"
                  onClick={() => setActivePage(pid)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#8F5373]/65 border border-[#F4B6D6]/40 text-white shadow-[0_0_20px_rgba(244,182,214,0.16)]'
                      : 'text-[#A89BB2] hover:text-white'
                  }`}
                >
                  {PAGE_META[pid].navLabel}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action (UCI CSV Download) */}
          <div className="shrink-0">
            <a
              href={`/api/dataset/download/${datasetKey === 'por' ? 'por' : 'mat'}`}
              download={datasetKey === 'por' ? 'student-por.csv' : 'student-mat.csv'}
              className="px-4 py-1.5 rounded-full bg-white/[0.06] hover:bg-[#F4B6D6] hover:text-[#17101C] border border-white/12 text-xs font-medium text-[#EDE5F2] transition-all whitespace-nowrap shrink-0 inline-flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>UCI Dataset</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Sleek Glass Dashboard Canvas */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-5 lg:px-8 py-6 space-y-5">
        {errorBanner && (
          <div className="rounded-2xl bg-rose-950/90 text-rose-100 border border-rose-400/30 px-4 py-3 text-xs flex items-center justify-between">
            <span>{errorBanner}</span>
            <button onClick={() => setErrorBanner(null)} className="p-1 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Upper Hero Glass Section: Two-Tone Title + Circular Ring + 3 Smoked-Glass KPI Cards */}
        <section className="glass-shell rounded-[28px] p-6 lg:p-7">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-center">
            {/* Left Hero Copy + Donut Ring (Exact Match to Reference Hero Left) */}
            <div className="xl:col-span-5 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2.5 max-w-[290px]">
                <div className="text-[11px] font-medium tracking-wider text-[#C7B9D1]">
                  {dataset ? dataset.datasetLabel : 'UCI Student Performance'}
                </div>

                <h1
                  className="font-display font-semibold tracking-tight leading-[1.06]"
                  style={{ fontSize: 'clamp(2.1rem, 3.2vw, 3.05rem)', textWrap: 'balance' }}
                >
                  <span className="block text-white">{pageMeta.heroTop}</span>
                  <span className="block text-[#E99BC3]">{pageMeta.heroAccent}</span>
                </h1>

                <p className="text-xs text-[#9E90A8] leading-relaxed">
                  {pageMeta.subtitle}
                </p>
              </div>

              {/* Circular Metric Ring right next to Title */}
              <div className="flex items-center gap-3 self-start sm:self-center">
                <CircularMetricRing percentage={analytics.passRate} label="pass %" />
              </div>
            </div>

            {/* Right 3 Dark Smoked-Glass KPI Cards */}
            <div className="xl:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* KPI Card 1 */}
              <div className="glass-kpi rounded-[22px] p-5 flex flex-col justify-between">
                <div className="w-9 h-9 rounded-xl bg-[#472D40]/80 border border-[#F4B6D6]/20 flex items-center justify-center text-[#F4B6D6] mb-3.5">
                  <GraduationCap className="w-4 h-4" />
                </div>

                <div>
                  <div className="text-xs text-[#A89BB2]">Average Final Grade</div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl lg:text-[28px] font-display font-semibold text-white tabular-nums">
                      {analytics.avgG3.toFixed(2)}
                    </span>
                    <sup className="text-[11px] font-mono text-[#9E90A8]">/20</sup>
                  </div>
                </div>

                <div className="mt-4 flex items-end justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-mono font-medium text-emerald-400 flex items-center gap-0.5 tabular-nums">
                      <ArrowUpRight className="w-3 h-3" />
                      <span>Max {analytics.highestG3}</span>
                    </div>
                    <div className="text-[10px] text-[#7F708A]">out of 20 pts</div>
                  </div>
                  <RoseSparkline
                    id="hero_kpi_1"
                    values={
                      analytics.studyVsGrade.length >= 2
                        ? analytics.studyVsGrade.map((s) => s.avgG3)
                        : [9.4, 10.2, 11.4, 11.9]
                    }
                  />
                </div>
              </div>

              {/* KPI Card 2 */}
              <div className="glass-kpi rounded-[22px] p-5 flex flex-col justify-between">
                <div className="w-9 h-9 rounded-xl bg-[#472D40]/80 border border-[#F4B6D6]/20 flex items-center justify-center text-[#F4B6D6] mb-3.5">
                  <BarChart3 className="w-4 h-4" />
                </div>

                <div>
                  <div className="text-xs text-[#A89BB2]">Cohort Pass Rate</div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl lg:text-[28px] font-display font-semibold text-white tabular-nums">
                      {analytics.passRate.toFixed(1)}
                    </span>
                    <sup className="text-[11px] font-mono text-[#9E90A8]">%</sup>
                  </div>
                </div>

                <div className="mt-4 flex items-end justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-mono font-medium text-emerald-400 flex items-center gap-0.5 tabular-nums">
                      <ArrowUpRight className="w-3 h-3" />
                      <span>n = {analytics.totalStudents}</span>
                    </div>
                    <div className="text-[10px] text-[#7F708A]">G3 ≥ 10 pass</div>
                  </div>
                  <RoseSparkline
                    id="hero_kpi_2"
                    values={
                      analytics.agePerformance.length >= 2
                        ? analytics.agePerformance.map((a) => a.passRate)
                        : [62, 68, 71, 67]
                    }
                  />
                </div>
              </div>

              {/* KPI Card 3 */}
              <div className="glass-kpi rounded-[22px] p-5 flex flex-col justify-between">
                <div className="w-9 h-9 rounded-xl bg-[#472D40]/80 border border-[#F4B6D6]/20 flex items-center justify-center text-[#F4B6D6] mb-3.5">
                  <Activity className="w-4 h-4" />
                </div>

                <div>
                  <div className="text-xs text-[#A89BB2]">Best Test R² Score</div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl lg:text-[28px] font-display font-semibold text-white tabular-nums">
                      {bestModelMetrics ? bestModelMetrics.r2.toFixed(3) : '...'}
                    </span>
                    <sup className="text-[11px] font-mono text-[#9E90A8]">R²</sup>
                  </div>
                </div>

                <div className="mt-4 flex items-end justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-mono font-medium text-emerald-400 flex items-center gap-0.5 tabular-nums">
                      <ArrowUpRight className="w-3 h-3" />
                      <span>RMSE {bestModelMetrics ? bestModelMetrics.rmse.toFixed(2) : '...'}</span>
                    </div>
                    <div className="text-[10px] text-[#7F708A]">
                      {includeGrades ? 'with G1 & G2' : 'habits only'}
                    </div>
                  </div>
                  <RoseSparkline id="hero_kpi_3" values={[0.66, 0.74, 0.77, 0.85]} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Middle Sleek Dark Glass Filter & Utility Bar (Exact Match to Reference Middle Pill Strip) */}
        <section className="glass-shell rounded-[22px] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* All Reset Pill */}
            <button
              type="button"
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                !hasActiveFilters
                  ? 'bg-[#F4B6D6] text-[#17101C] shadow-[0_0_18px_rgba(244,182,214,0.3)]'
                  : 'bg-white/[0.04] border border-white/[0.08] text-[#B8ABC2] hover:text-white'
              }`}
            >
              All
            </button>

            {/* School GP / MS */}
            {(['GP', 'MS'] as const).map((sch) => (
              <button
                key={sch}
                type="button"
                onClick={() =>
                  setFilters((f) => ({ ...f, school: f.school === sch ? 'all' : sch }))
                }
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  filters.school === sch
                    ? 'bg-[#F4B6D6] text-[#17101C] font-semibold'
                    : 'bg-white/[0.04] border border-white/[0.08] text-[#B8ABC2] hover:text-white'
                }`}
              >
                School {sch}
              </button>
            ))}

            {/* Gender F / M */}
            {(['F', 'M'] as const).map((sx) => (
              <button
                key={sx}
                type="button"
                onClick={() =>
                  setFilters((f) => ({ ...f, sex: f.sex === sx ? 'all' : sx }))
                }
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  filters.sex === sx
                    ? 'bg-[#F4B6D6] text-[#17101C] font-semibold'
                    : 'bg-white/[0.04] border border-white/[0.08] text-[#B8ABC2] hover:text-white'
                }`}
              >
                {sx === 'F' ? 'Female' : 'Male'}
              </button>
            ))}

            {/* Study Time Select */}
            <select
              value={String(filters.studytime)}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  studytime: e.target.value === 'all' ? 'all' : Number(e.target.value),
                }))
              }
              aria-label="Filter by Study Time"
              className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/[0.04] border border-white/[0.08] text-[#D7CADF] focus:outline-none focus:border-[#F4B6D6]/50"
            >
              <option value="all">Study: All</option>
              <option value="1">Study: &lt;2h</option>
              <option value="2">Study: 2–5h</option>
              <option value="3">Study: 5–10h</option>
              <option value="4">Study: &gt;10h</option>
            </select>

            {/* Age Bracket Select */}
            <select
              value={`${filters.minAge}-${filters.maxAge}`}
              onChange={(e) => {
                const [lo, hi] = e.target.value.split('-').map(Number);
                setFilters((f) => ({ ...f, minAge: lo, maxAge: hi }));
              }}
              aria-label="Filter by Age"
              className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/[0.04] border border-white/[0.08] text-[#D7CADF] focus:outline-none focus:border-[#F4B6D6]/50"
            >
              <option value="15-22">Age: 15–22</option>
              <option value="15-16">Age: 15–16</option>
              <option value="17-18">Age: 17–18</option>
              <option value="19-22">Age: 19–22</option>
            </select>

            {/* Circular '+' Upload CSV Button matching reference '+' pill */}
            <label
              title="Upload Custom CSV Dataset"
              className="w-8 h-8 rounded-full bg-[#3A2736]/85 hover:bg-[#F4B6D6] text-[#F4B6D6] hover:text-[#17101C] border border-white/10 flex items-center justify-center cursor-pointer transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <input
                type="file"
                accept=".csv"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const r = new FileReader();
                  r.onload = () => {
                    if (typeof r.result === 'string') handleUploadCsv(r.result, f.name);
                  };
                  r.readAsText(f);
                  e.target.value = '';
                }}
                className="hidden"
              />
            </label>
          </div>

          {/* Right Quick Search & Utility Icon Buttons */}
          <div className="flex items-center gap-2">
            <div className="relative hidden md:block w-48">
              <Search className="w-3.5 h-3.5 text-[#8F8099] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => {
                  setGlobalSearch(e.target.value);
                  if (activePage !== 'explorer' && e.target.value.trim()) {
                    setActivePage('explorer');
                  }
                }}
                placeholder="Search students..."
                className="w-full pl-8 pr-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-[#7F708A] focus:outline-none focus:border-[#F4B6D6]/50"
              />
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => setFilters(DEFAULT_FILTERS)}
                title="Reset Active Filters"
                className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/15 border border-white/10 flex items-center justify-center text-[#F4B6D6] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={handleOpenPythonModal}
              title="Inspect Modular Python ML Source Code"
              className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-[#F4B6D6] text-[#D7CADF] hover:text-[#17101C] border border-white/10 flex items-center justify-center transition-colors"
            >
              <Code2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

        {/* Active Page Content */}
        {loadingBundle || !dataset || !activeEvaluation ? (
          <div className="glass-shell rounded-[26px] p-10 space-y-4 animate-pulse">
            <div className="h-5 w-64 bg-white/10 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-52 bg-white/[0.04] rounded-2xl" />
              <div className="h-52 bg-white/[0.04] rounded-2xl" />
              <div className="h-52 bg-white/[0.04] rounded-2xl" />
            </div>
          </div>
        ) : (
          <>
            {activePage === 'overview' && (
              <OverviewPage
                dataset={dataset}
                analytics={analytics}
                evaluation={activeEvaluation}
                selectedModel={selectedModel}
                onSelectModel={setSelectedModel}
                includeGrades={includeGrades}
                onToggleIncludeGrades={setIncludeGrades}
                prediction={prediction}
                onSwitchDataset={handleSwitchDataset}
                onNavigate={setActivePage}
              />
            )}

            {activePage === 'explorer' && (
              <ExplorerPage
                dataset={dataset}
                filteredRows={filteredRows}
                globalSearch={globalSearch}
                onChangeGlobalSearch={setGlobalSearch}
                onSwitchDataset={handleSwitchDataset}
                onUploadCsv={handleUploadCsv}
              />
            )}

            {activePage === 'eda' && (
              <EdaPage
                dataset={dataset}
                analytics={analytics}
                evaluation={activeEvaluation}
              />
            )}

            {activePage === 'training' && (
              <TrainingPage
                evaluation={activeEvaluation}
                includeGrades={includeGrades}
                onToggleIncludeGrades={setIncludeGrades}
                selectedModel={selectedModel}
                onSelectModel={setSelectedModel}
                hyperparams={hyperparams}
                onChangeHyperparams={setHyperparams}
                onRetrain={handleRetrain}
                isTraining={isTraining}
              />
            )}

            {activePage === 'prediction' && (
              <PredictionPage
                studentInput={studentInput}
                onChangeInput={setStudentInput}
                includeGrades={includeGrades}
                onToggleIncludeGrades={setIncludeGrades}
                selectedModel={selectedModel}
                onSelectModel={setSelectedModel}
                onRunPredict={executePrediction}
                prediction={prediction}
                isPredicting={isPredicting}
              />
            )}

            {activePage === 'insights' && (
              <InsightsPage
                evaluation={activeEvaluation}
                selectedModel={selectedModel}
                onSelectModel={setSelectedModel}
                includeGrades={includeGrades}
                onToggleIncludeGrades={setIncludeGrades}
              />
            )}
          </>
        )}

        {/* Quiet Editorial Footer */}
        <footer className="pt-2 pb-4 flex flex-wrap items-center justify-between gap-4 text-xs text-[#8F8099]">
          <p>
            UCI Student Performance Dataset (Cortez, 2008) · Python Supervised ML Pipeline
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleOpenPythonModal}
              className="hover:text-[#FAD8EA] transition-colors"
            >
              Python Source Files
            </button>
            <a
              href="/api/dataset/download/mat"
              download="student-mat.csv"
              className="hover:text-[#FAD8EA] transition-colors"
            >
              student-mat.csv
            </a>
            <a
              href="/api/dataset/download/por"
              download="student-por.csv"
              className="hover:text-[#FAD8EA] transition-colors"
            >
              student-por.csv
            </a>
          </div>
        </footer>
      </main>

      <PythonSourceModal
        open={pythonModalOpen}
        onClose={() => setPythonModalOpen(false)}
        files={pythonFiles}
      />
    </div>
  );
}
