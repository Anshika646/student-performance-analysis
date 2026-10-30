import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  BookOpen,
  BrainCircuit,
  Code2,
  Compass,
  Database,
  GraduationCap,
  LayoutDashboard,
  Menu,
  RotateCcw,
  Sparkles,
  Upload,
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
import { RoseSparkline } from './components/Charts';
import { ExplorerPage, OverviewPage } from './components/OverviewAndExplorer';
import { EdaPage, TrainingPage } from './components/EdaAndTraining';
import {
  InsightsPage,
  PredictionPage,
  PythonSourceModal,
} from './components/PredictionAndInsights';

const PAGE_META: Record<
  PageId,
  { navLabel: string; heroTop: string; heroAccent: string; icon: React.FC<{ className?: string }> }
> = {
  overview: {
    navLabel: 'Overview',
    heroTop: 'Student',
    heroAccent: 'Performance',
    icon: LayoutDashboard,
  },
  explorer: {
    navLabel: 'Dataset Explorer',
    heroTop: 'Dataset',
    heroAccent: 'Explorer',
    icon: Database,
  },
  eda: {
    navLabel: 'Exploratory Data Analysis',
    heroTop: 'Exploratory',
    heroAccent: 'Analytics',
    icon: BarChart3,
  },
  training: {
    navLabel: 'Model Training',
    heroTop: 'Supervised',
    heroAccent: 'Training',
    icon: BrainCircuit,
  },
  prediction: {
    navLabel: 'Student Prediction',
    heroTop: 'Academic',
    heroAccent: 'Prediction',
    icon: GraduationCap,
  },
  insights: {
    navLabel: 'Model Insights',
    heroTop: 'Model',
    heroAccent: 'Diagnostics',
    icon: Compass,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Dynamic Cohort Filters
  const [filters, setFilters] = useState<CohortFilters>(DEFAULT_FILTERS);

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

  // Initial load on mount
  useEffect(() => {
    loadBundle('mat', null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Run live prediction whenever dataset, mode, or selectedModel updates
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

  // Filtered rows & dynamic EDA recalculation
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

  const hasActiveFilters =
    filters.school !== 'all' ||
    filters.sex !== 'all' ||
    filters.studytime !== 'all' ||
    filters.minAge !== 15 ||
    filters.maxAge !== 22;

  const pageMeta = PAGE_META[activePage];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row text-[#1F1823]">
      {/* Left Glass Sidebar Navigation (All 6 Required Pages) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white/75 backdrop-blur-2xl border-r border-white/90 p-5 flex flex-col justify-between transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="flex items-center justify-between mb-7 px-1">
            <button
              onClick={() => setActivePage('overview')}
              className="flex items-center gap-2.5 text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-[#221B25] text-[#FAD6E8] font-display font-bold text-base flex items-center justify-center">
                ep
              </div>
              <span className="text-lg font-display font-bold tracking-tight text-[#1F1823]">
                EduPulse
              </span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-[#55425E]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav className="space-y-1.5">
            {(Object.keys(PAGE_META) as PageId[]).map((pid) => {
              const Icon = PAGE_META[pid].icon;
              const isActive = activePage === pid;
              return (
                <button
                  key={pid}
                  onClick={() => {
                    setActivePage(pid);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-[#221B25] text-white shadow-[0_8px_20px_rgba(34,27,37,0.2)]'
                      : 'text-[#55425E] hover:bg-[#F7E5F0] hover:text-[#1F1823]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{PAGE_META[pid].navLabel}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Dataset Switcher & Python Source Trigger */}
        <div className="space-y-3 pt-4 border-t border-[#EADCE5]">
          <div className="rounded-2xl bg-[#F7E7F1]/90 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#4B3954]">
              <span>UCI Dataset</span>
              <span className="font-mono tabular-nums">
                {dataset ? `${dataset.rowCount} rows` : '...'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => handleSwitchDataset('mat')}
                className={`py-1.5 rounded-xl text-[11px] font-semibold transition-colors ${
                  datasetKey === 'mat'
                    ? 'bg-[#221B25] text-white'
                    : 'bg-white/80 text-[#4B3954] hover:bg-white'
                }`}
              >
                Math (395)
              </button>
              <button
                onClick={() => handleSwitchDataset('por')}
                className={`py-1.5 rounded-xl text-[11px] font-semibold transition-colors ${
                  datasetKey === 'por'
                    ? 'bg-[#221B25] text-white'
                    : 'bg-white/80 text-[#4B3954] hover:bg-white'
                }`}
              >
                Port. (649)
              </button>
            </div>
            <label className="w-full py-1.5 rounded-xl bg-white hover:bg-[#FAD6E8] text-[#1F1823] text-[11px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors border border-[#E5CEDB]">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Custom CSV</span>
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

          <button
            onClick={handleOpenPythonModal}
            className="w-full py-2.5 px-3 rounded-2xl bg-[#221B25]/95 hover:bg-[#221B25] text-[#FAD6E8] text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Code2 className="w-4 h-4" />
            <span>Python ML Codebase</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar Contract: 3 Clean Zones */}
        <header className="flex items-center justify-between gap-8 px-6 lg:px-8 py-4 bg-white/55 backdrop-blur-xl border-b border-white/80">
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white/80 text-[#1F1823]"
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4" />
            </button>
            <span className="text-sm font-display font-bold tracking-tight text-[#1F1823] whitespace-nowrap shrink-0">
              UCI Student Analytics
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#5E4B68]">
            {(
              [
                ['overview', 'Overview'],
                ['explorer', 'Dataset'],
                ['eda', 'Visualizations'],
                ['training', 'ML Models'],
                ['prediction', 'Predict Grade'],
              ] as [PageId, string][]
            ).map(([pid, label]) => (
              <button
                key={pid}
                onClick={() => setActivePage(pid)}
                className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
                  activePage === pid
                    ? 'text-[#1F1823] border-b-2 border-[#1F1823]'
                    : 'hover:text-[#1F1823]'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="shrink-0">
            <a
              href={`/api/dataset/download/${datasetKey === 'por' ? 'por' : 'mat'}`}
              download={datasetKey === 'por' ? 'student-por.csv' : 'student-mat.csv'}
              className="px-4 py-2 rounded-xl bg-[#221B25] hover:bg-[#322737] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 inline-block"
            >
              Download UCI CSV
            </a>
          </div>
        </header>

        {/* Workspace Body */}
        <main className="flex-1 px-5 lg:px-8 py-6 max-w-[1440px] w-full mx-auto space-y-6">
          {errorBanner && (
            <div className="rounded-2xl bg-rose-950/90 text-rose-100 border border-rose-400/30 px-4 py-3 text-xs flex items-center justify-between">
              <span>{errorBanner}</span>
              <button onClick={() => setErrorBanner(null)} className="p-1 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Hero Two-Tone Title + 3 Frosted Blush KPI Cards (Exact Visual Motif from Reference UI) */}
          <section className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-end">
            <div className="xl:col-span-5 space-y-4">
              <h1
                className="font-display font-bold tracking-tight leading-[1.06]"
                style={{ fontSize: 'clamp(2.15rem, 3.4vw, 3.25rem)', textWrap: 'balance' }}
              >
                <span className="block text-[#1F1823]">{pageMeta.heroTop}</span>
                <span className="block text-[#DF82B0]">{pageMeta.heroAccent}</span>
              </h1>

              {/* Dynamic Cohort Filter Strip (Updates Overview, Explorer & All 10 EDA Charts) */}
              <div className="flex flex-wrap items-center gap-1.5">
                {(['all', 'GP', 'MS'] as const).map((sch) => (
                  <button
                    key={sch}
                    onClick={() => setFilters((f) => ({ ...f, school: sch }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                      filters.school === sch
                        ? 'bg-[#FAD5E8] text-[#1F1823] shadow-sm border border-[#ECAAD0]'
                        : 'bg-white/75 text-[#55425E] hover:bg-white border border-white/90'
                    }`}
                  >
                    {sch === 'all' ? 'All Schools' : `School ${sch}`}
                  </button>
                ))}

                {(['all', 'F', 'M'] as const).map((sx) => (
                  <button
                    key={sx}
                    onClick={() => setFilters((f) => ({ ...f, sex: sx }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                      filters.sex === sx
                        ? 'bg-[#FAD5E8] text-[#1F1823] shadow-sm border border-[#ECAAD0]'
                        : 'bg-white/75 text-[#55425E] hover:bg-white border border-white/90'
                    }`}
                  >
                    {sx === 'all' ? 'All Genders' : sx === 'F' ? 'Female' : 'Male'}
                  </button>
                ))}

                <select
                  value={String(filters.studytime)}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      studytime: e.target.value === 'all' ? 'all' : Number(e.target.value),
                    }))
                  }
                  aria-label="Filter by Study Time"
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/80 border border-white/90 text-[#3B2E41] focus:outline-none"
                >
                  <option value="all">Study: All</option>
                  <option value="1">Study: &lt;2h</option>
                  <option value="2">Study: 2–5h</option>
                  <option value="3">Study: 5–10h</option>
                  <option value="4">Study: &gt;10h</option>
                </select>

                <select
                  value={`${filters.minAge}-${filters.maxAge}`}
                  onChange={(e) => {
                    const [lo, hi] = e.target.value.split('-').map(Number);
                    setFilters((f) => ({ ...f, minAge: lo, maxAge: hi }));
                  }}
                  aria-label="Filter by Age Bracket"
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/80 border border-white/90 text-[#3B2E41] focus:outline-none"
                >
                  <option value="15-22">Age: 15–22</option>
                  <option value="15-16">Age: 15–16</option>
                  <option value="17-18">Age: 17–18</option>
                  <option value="19-22">Age: 19–22</option>
                </select>

                {hasActiveFilters && (
                  <button
                    onClick={() => setFilters(DEFAULT_FILTERS)}
                    title="Reset Filters"
                    className="p-1.5 rounded-full bg-[#221B25] text-white hover:bg-[#3A2E40] transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* 3 Frosted White-Blush Glass KPI Cards with Sparklines */}
            <div className="xl:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* KPI 1 */}
              <div className="rounded-[22px] bg-white/75 backdrop-blur-xl border border-white/95 p-5 shadow-[0_12px_32px_rgba(35,29,37,0.05)] flex flex-col justify-between">
                <div className="text-xs font-medium text-[#5E4B68]">Average Final Grade</div>
                <div className="my-2 flex items-baseline gap-1">
                  <span className="text-3xl font-display font-bold tabular-nums text-[#1F1823]">
                    {analytics.avgG3.toFixed(2)}
                  </span>
                  <sup className="text-xs font-mono font-semibold text-[#6E5D76]">/20</sup>
                </div>
                <div className="flex items-end justify-between gap-2">
                  <span className="text-xs font-semibold text-[#D66A9E] tabular-nums">
                    ↑ Max {analytics.highestG3}/20
                  </span>
                  <RoseSparkline
                    id="kpi_avg"
                    values={
                      analytics.studyVsGrade.length >= 2
                        ? analytics.studyVsGrade.map((s) => s.avgG3)
                        : [9.5, 10.1, 11.4, 11.9]
                    }
                  />
                </div>
              </div>

              {/* KPI 2 */}
              <div className="rounded-[22px] bg-white/75 backdrop-blur-xl border border-white/95 p-5 shadow-[0_12px_32px_rgba(35,29,37,0.05)] flex flex-col justify-between">
                <div className="text-xs font-medium text-[#5E4B68]">Pass Percentage</div>
                <div className="my-2 flex items-baseline gap-1">
                  <span className="text-3xl font-display font-bold tabular-nums text-[#1F1823]">
                    {analytics.passRate.toFixed(1)}
                  </span>
                  <sup className="text-xs font-mono font-semibold text-[#6E5D76]">%</sup>
                </div>
                <div className="flex items-end justify-between gap-2">
                  <span className="text-xs font-semibold text-[#D66A9E] tabular-nums">
                    n = {analytics.totalStudents}
                  </span>
                  <RoseSparkline
                    id="kpi_pass"
                    values={
                      analytics.agePerformance.length >= 2
                        ? analytics.agePerformance.map((a) => a.passRate)
                        : [62, 68, 71, 67]
                    }
                  />
                </div>
              </div>

              {/* KPI 3 */}
              <div className="rounded-[22px] bg-white/75 backdrop-blur-xl border border-white/95 p-5 shadow-[0_12px_32px_rgba(35,29,37,0.05)] flex flex-col justify-between">
                <div className="text-xs font-medium text-[#5E4B68]">Best Test R² Score</div>
                <div className="my-2 flex items-baseline gap-1">
                  <span className="text-3xl font-display font-bold tabular-nums text-[#1F1823]">
                    {activeEvaluation
                      ? activeEvaluation.models[activeEvaluation.bestModelKey].testMetrics.r2.toFixed(3)
                      : '...'}
                  </span>
                  <sup className="text-xs font-mono font-semibold text-[#6E5D76]">R²</sup>
                </div>
                <div className="flex items-end justify-between gap-2">
                  <span className="text-xs font-semibold text-[#D66A9E] truncate max-w-[95px]">
                    {includeGrades ? 'With G1/G2' : 'Habits Only'}
                  </span>
                  <RoseSparkline id="kpi_r2" values={[0.68, 0.74, 0.77, 0.85]} />
                </div>
              </div>
            </div>
          </section>

          {/* Page Content Area */}
          {loadingBundle || !dataset || !activeEvaluation ? (
            <div className="rounded-[26px] bg-[#221B25] p-10 text-white space-y-4 animate-pulse">
              <div className="h-5 w-64 bg-white/10 rounded-lg" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="h-52 bg-white/5 rounded-2xl" />
                <div className="h-52 bg-white/5 rounded-2xl" />
                <div className="h-52 bg-white/5 rounded-2xl" />
              </div>
            </div>
          ) : (
            <>
              {activePage === 'overview' && (
                <OverviewPage
                  dataset={dataset}
                  analytics={analytics}
                  evaluation={activeEvaluation}
                  includeGrades={includeGrades}
                  onToggleIncludeGrades={setIncludeGrades}
                  onNavigate={setActivePage}
                />
              )}

              {activePage === 'explorer' && (
                <ExplorerPage
                  dataset={dataset}
                  filteredRows={filteredRows}
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

          {/* Subtle Editorial Footer Quote (Matches reference bottom-left quiet note) */}
          <footer className="pt-2 pb-4 flex flex-wrap items-center justify-between gap-4 text-xs text-[#6E5D76]">
            <p className="italic">
              “Data-grounded academic insight — built on the UCI Student Performance Repository (Cortez, 2008).”
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={handleOpenPythonModal}
                className="hover:text-[#1F1823] underline underline-offset-4"
              >
                Inspect Modular Python ML Source
              </button>
              <a
                href="/api/dataset/download/mat"
                download="student-mat.csv"
                className="hover:text-[#1F1823] underline underline-offset-4"
              >
                student-mat.csv
              </a>
              <a
                href="/api/dataset/download/por"
                download="student-por.csv"
                className="hover:text-[#1F1823] underline underline-offset-4"
              >
                student-por.csv
              </a>
            </div>
          </footer>
        </main>
      </div>

      <PythonSourceModal
        open={pythonModalOpen}
        onClose={() => setPythonModalOpen(false)}
        files={pythonFiles}
      />
    </div>
  );
}
