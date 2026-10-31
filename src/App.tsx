import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Code2,
  Database,
  Download,
  Home,
  Lightbulb,
  Menu,
  Plus,
  RotateCcw,
  Search,
  Settings,
  ShieldAlert,
  User,
  X,
} from 'lucide-react';
import {
  AtRiskStudent,
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
import { ExplorerPage, OverviewPage } from './components/OverviewAndExplorer';
import { EdaPage, TrainingPage } from './components/EdaAndTraining';
import {
  InsightsPage,
  PredictionPage,
  PythonSourceModal,
  RiskRadarPage,
} from './components/PredictionAndInsights';

const NAV_ITEMS: {
  id: PageId;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'overview',
    label: 'Overview',
    subtitle: 'Executive summary of student performance, model accuracy, and cohort metrics.',
    icon: Home,
  },
  {
    id: 'explorer',
    label: 'Dataset Explorer',
    subtitle: 'Inspect clean UCI records, missing-value imputation, data types, and statistics.',
    icon: Database,
  },
  {
    id: 'eda',
    label: 'Exploratory Data Analysis',
    subtitle: 'Interactive smoked-glass cohort visualizations updating dynamically with filters.',
    icon: BarChart3,
  },
  {
    id: 'training',
    label: 'Model Training',
    subtitle: 'Train and compare Linear Regression, Random Forest, Decision Tree, and Gradient Boosting.',
    icon: Settings,
  },
  {
    id: 'prediction',
    label: 'Student Prediction',
    subtitle: 'Run live Python ML grade inference with counterfactual What-If sweeps and guidance.',
    icon: User,
  },
  {
    id: 'insights',
    label: 'Model Insights',
    subtitle: 'Evaluate actual-vs-predicted test alignment, residual distribution, and feature weights.',
    icon: Lightbulb,
  },
  {
    id: 'risk',
    label: 'Risk Radar',
    subtitle: 'Identify recoverable at-risk students projected below 10/20 and simulate interventions.',
    icon: ShieldAlert,
  },
];

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
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

  const [datasetKey, setDatasetKey] = useState<'mat' | 'por' | 'custom'>('mat');
  const [customCsvText, setCustomCsvText] = useState<string | null>(null);
  const [dataset, setDataset] = useState<DatasetPayload | null>(null);
  const [evaluations, setEvaluations] = useState<{
    with_grades: EvaluationPayload;
    without_grades: EvaluationPayload;
  } | null>(null);

  const [includeGrades, setIncludeGrades] = useState<boolean>(true);
  const [selectedModel, setSelectedModel] = useState<ModelKey>('random_forest');
  const [hyperparams, setHyperparams] = useState({
    testSize: 0.2,
    randomState: 42,
    maxDepth: 6,
    nEstimators: 40,
  });

  const [filters, setFilters] = useState<CohortFilters>(DEFAULT_FILTERS);
  const [globalSearch, setGlobalSearch] = useState<string>('');

  const [studentInput, setStudentInput] = useState<StudentInputProfile>(INITIAL_STUDENT);
  const [prediction, setPrediction] = useState<PredictionPayload | null>(null);

  const [loadingBundle, setLoadingBundle] = useState<boolean>(true);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

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

  const handleSimulateAtRiskStudent = (st: AtRiskStudent) => {
    const profile: StudentInputProfile = {
      age: st.age,
      sex: st.sex === 'M' ? 'M' : 'F',
      studytime: st.studytime,
      absences: st.absences,
      failures: st.failures,
      Medu: st.Medu,
      Fedu: st.Fedu,
      internet: st.internet === 'no' ? 'no' : 'yes',
      schoolsup: st.schoolsup === 'yes' ? 'yes' : 'no',
      G1: st.G1,
      G2: st.G2,
    };
    setStudentInput(profile);
    setActivePage('prediction');
    executePrediction(profile);
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

  const hasActiveFilters =
    filters.school !== 'all' ||
    filters.sex !== 'all' ||
    filters.studytime !== 'all' ||
    filters.minAge !== 15 ||
    filters.maxAge !== 22;

  const activeNavMeta = NAV_ITEMS.find((n) => n.id === activePage) || NAV_ITEMS[0];

  const renderSidebarContent = () => (
    <div className="flex flex-col justify-between h-full p-5">
      <div className="space-y-6">
        {/* Brand Logo Lockup */}
        <button
          type="button"
          onClick={() => {
            setActivePage('overview');
            setMobileNavOpen(false);
          }}
          className="flex items-center gap-3 text-left w-full group"
        >
          <div className="w-10 h-10 rounded-full pink-icon-badge flex items-center justify-center shrink-0 shadow-[0_0_22px_rgba(245,166,204,0.32)]">
            <span className="font-display font-bold text-base tracking-tighter text-[#FDF8FC]">
              dp
            </span>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-display font-bold text-[#FDF8FC] truncate">
              Student Performance
            </div>
            <div className="text-[11px] text-[#928997] truncate">Prediction & Analytics</div>
          </div>
        </button>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActivePage(item.id);
                  setMobileNavOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-medium transition-all text-left ${
                  isActive
                    ? 'glass-nav-active font-semibold'
                    : 'text-[#BDB4C3] hover:text-[#FDF8FC] hover:bg-white/[0.04]'
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isActive
                      ? 'bg-gradient-to-br from-[#FCE2EF] to-[#F5A6CC] text-[#162013] shadow-[0_0_16px_rgba(248,198,223,0.60)]'
                      : 'text-[#CAD2C4]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Frosted Olive-Pink Glass Quote Card */}
      <div className="mt-6 glass-subcard rounded-[20px] p-4 flex items-center gap-3.5">
        <span
          aria-hidden="true"
          className="w-1 h-11 rounded-full bg-gradient-to-b from-[#FAD3E7] via-[#F5A6CC] to-[#A4C288] shadow-[0_0_14px_rgba(245,166,204,0.85)] shrink-0"
        />
        <p className="text-[11.5px] leading-relaxed text-[#CED5C9] font-medium">
          <span className="block text-[#FDF8FB]">Better data.</span>
          <span className="block">Better decisions.</span>
          <span className="block text-[#F8C6DF]">Brighter futures.</span>
        </p>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen text-[#FDF8FB] selection:bg-[#F5A6CC]/35">
      {/* =====================================================================
          CINEMATIC OLIVE-GREEN + BLUSH BABY-PINK AMBIENT GLASS BACKDROP
          Visible behind all blur(24px) smoked olive-glass panels
          ===================================================================== */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        {/* Top-center lush baby-pink & rose bokeh orb */}
        <div className="absolute -top-24 left-[32%] w-[520px] h-[500px] rounded-full bg-gradient-to-br from-[#F5A6CC]/38 via-[#FAD3E7]/20 to-transparent blur-[105px]" />
        {/* Bottom-left blush-rose & botanical sage bloom behind sidebar */}
        <div className="absolute bottom-[-80px] -left-16 w-[430px] h-[430px] rounded-full bg-gradient-to-tr from-[#E88DBB]/34 via-[#F5A6CC]/18 to-transparent blur-[95px]" />
        {/* Right-rail rose-pink & olive-moss glass refraction */}
        <div className="absolute top-[18%] -right-20 w-[450px] h-[450px] rounded-full bg-gradient-to-bl from-[#F5A6CC]/32 via-[#8CAA70]/18 to-transparent blur-[105px]" />
        {/* Center-bottom botanical olive & soft pink glow */}
        <div className="absolute bottom-[8%] left-[44%] w-[460px] h-[360px] rounded-full bg-gradient-to-t from-[#6E8B54]/22 via-[#F5A6CC]/14 to-transparent blur-[110px]" />
        {/* Subtle abstract translucent blush-pink & sage glass curves */}
        <svg
          className="absolute inset-0 w-full h-full opacity-45"
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="bg_curve_pink" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F5A6CC" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#B8D29B" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#FAD3E7" stopOpacity="0.06" />
            </linearGradient>
          </defs>
          <path
            d="M -80 680 C 180 540, 340 820, 620 710 C 900 600, 1140 260, 1520 340"
            fill="none"
            stroke="url(#bg_curve_pink)"
            strokeWidth="1.6"
          />
          <path
            d="M 780 -40 C 920 180, 1220 120, 1480 420"
            fill="none"
            stroke="url(#bg_curve_pink)"
            strokeWidth="1.3"
          />
        </svg>
      </div>

      {/* =====================================================================
          APP SHELL: FLOATING LEFT GLASS SIDEBAR + MAIN GLASS WORKSPACE
          ===================================================================== */}
      <div className="relative z-10 max-w-[1540px] mx-auto px-3 sm:px-5 py-4 flex gap-5 items-start">
        {/* Desktop Floating Glass Sidebar */}
        <aside className="hidden lg:block w-[256px] shrink-0 sticky top-4 h-[calc(100vh-2rem)] glass-sidebar rounded-[26px] overflow-y-auto">
          {renderSidebarContent()}
        </aside>

        {/* Mobile Drawer Sidebar */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-[#0B1009]/75 backdrop-blur-sm"
              onClick={() => setMobileNavOpen(false)}
            />
            <aside className="relative z-10 w-[270px] max-w-[82vw] h-full glass-sidebar rounded-r-[26px] overflow-y-auto">
              {renderSidebarContent()}
            </aside>
          </div>
        )}

        {/* Right Main Content Column */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Top Translucent Glass Search, Cohort Filter & Dataset Bar */}
          <header className="glass-shell rounded-[22px] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            {/* Left: Mobile Menu Button + Translucent Search Input */}
            <div className="flex items-center gap-2.5 flex-1 min-w-[210px] max-w-md">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open Navigation"
                className="lg:hidden glass-control w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              >
                <Menu className="w-4 h-4 text-[#F8C6DF]" />
              </button>

              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-[#BDB4C3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={globalSearch}
                  onChange={(e) => {
                    setGlobalSearch(e.target.value);
                    if (activePage !== 'explorer' && e.target.value.trim()) {
                      setActivePage('explorer');
                    }
                  }}
                  placeholder="Search student records or attributes..."
                  className="glass-control w-full pl-9 pr-3.5 py-2 rounded-full text-xs placeholder-[#928997]"
                />
              </div>
            </div>

            {/* Right: Interactive Cohort Filters & Dataset Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Dataset Quick Switch */}
              <div className="flex items-center p-0.5 rounded-full bg-white/[0.04] border border-[rgba(255,210,235,0.20)]">
                <button
                  type="button"
                  onClick={() => handleSwitchDataset('mat')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                    datasetKey === 'mat'
                      ? 'glass-pill-active font-semibold'
                      : 'text-[#BDB4C3] hover:text-white'
                  }`}
                >
                  Math (395)
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchDataset('por')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                    datasetKey === 'por'
                      ? 'glass-pill-active font-semibold'
                      : 'text-[#BDB4C3] hover:text-white'
                  }`}
                >
                  Port. (649)
                </button>
              </div>

              {/* Dynamic Cohort Filters */}
              <select
                value={filters.school}
                onChange={(e) => setFilters((f) => ({ ...f, school: e.target.value }))}
                aria-label="Filter by School"
                className="glass-control px-3 py-1.5 rounded-full text-xs font-medium"
              >
                <option value="all">School: All</option>
                <option value="GP">Gabriel Pereira (GP)</option>
                <option value="MS">Mousinho da Silveira (MS)</option>
              </select>

              <select
                value={filters.sex}
                onChange={(e) => setFilters((f) => ({ ...f, sex: e.target.value }))}
                aria-label="Filter by Gender"
                className="glass-control px-3 py-1.5 rounded-full text-xs font-medium"
              >
                <option value="all">Gender: All</option>
                <option value="F">Female (F)</option>
                <option value="M">Male (M)</option>
              </select>

              <select
                value={String(filters.studytime)}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    studytime: e.target.value === 'all' ? 'all' : Number(e.target.value),
                  }))
                }
                aria-label="Filter by Study Time"
                className="glass-control px-3 py-1.5 rounded-full text-xs font-medium hidden sm:block"
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
                aria-label="Filter by Age"
                className="glass-control px-3 py-1.5 rounded-full text-xs font-medium hidden xl:block"
              >
                <option value="15-22">Age: 15–22</option>
                <option value="15-16">Age: 15–16</option>
                <option value="17-18">Age: 17–18</option>
                <option value="19-22">Age: 19–22</option>
              </select>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  title="Reset Active Filters"
                  className="glass-control w-8 h-8 rounded-full flex items-center justify-center text-[#F8C6DF]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Upload Custom CSV */}
              <label
                title="Upload Custom CSV Dataset"
                className="glass-control w-8 h-8 rounded-full flex items-center justify-center cursor-pointer shrink-0 text-[#F8C6DF]"
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

              {/* View Modular Python ML Source */}
              <button
                type="button"
                onClick={handleOpenPythonModal}
                title="Inspect Modular Python ML Source Code"
                className="glass-control w-8 h-8 rounded-full flex items-center justify-center text-[#BDB4C3] hover:text-[#FDF8FC]"
              >
                <Code2 className="w-3.5 h-3.5" />
              </button>

              {/* Download Official UCI CSV */}
              <a
                href={`/api/dataset/download/${datasetKey === 'por' ? 'por' : 'mat'}`}
                download={datasetKey === 'por' ? 'student-por.csv' : 'student-mat.csv'}
                className="glass-control px-3.5 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5 text-[#F5A6CC]" />
                <span className="hidden sm:inline">UCI CSV</span>
              </a>
            </div>
          </header>

          {errorBanner && (
            <div className="glass-shell rounded-2xl border-[#F5A6CC]/45 px-4 py-3 text-xs flex items-center justify-between text-[#FDF8FC]">
              <span>{errorBanner}</span>
              <button onClick={() => setErrorBanner(null)} className="p-1 hover:text-[#F8C6DF]">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Contextual Subpage Glass Header when not on Overview */}
          {activePage !== 'overview' && dataset && (
            <section className="glass-shell rounded-[24px] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-display font-bold text-[#FDF8FC]">
                  {activeNavMeta.label}
                </h1>
                <p className="text-xs text-[#BDB4C3] mt-0.5">{activeNavMeta.subtitle}</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-[#BDB4C3] font-mono tabular-nums">
                <span>n = {analytics.totalStudents}</span>
                <span>·</span>
                <span>Avg G3 = {analytics.avgG3.toFixed(2)}/20</span>
                <span>·</span>
                <span className="text-[#F8C6DF]">Pass = {analytics.passRate.toFixed(1)}%</span>
              </div>
            </section>
          )}

          {/* Active Page View */}
          {loadingBundle || !dataset || !activeEvaluation ? (
            <div className="glass-shell rounded-[24px] p-10 space-y-4 animate-pulse">
              <div className="h-5 w-64 bg-white/10 rounded-lg" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="h-52 bg-white/[0.04] rounded-2xl" />
                <div className="h-52 bg-white/[0.04] rounded-2xl" />
                <div className="h-52 bg-white/[0.04] rounded-2xl" />
              </div>
            </div>
          ) : (
            <main>
              {activePage === 'overview' && (
                <OverviewPage
                  dataset={dataset}
                  filteredRows={filteredRows}
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
                  filteredRows={filteredRows}
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

              {activePage === 'risk' && (
                <RiskRadarPage
                  evaluation={activeEvaluation}
                  onSimulateStudent={handleSimulateAtRiskStudent}
                />
              )}
            </main>
          )}

          {/* Quiet Footer */}
          <footer className="pt-1 pb-4 px-2 flex flex-wrap items-center justify-between gap-4 text-xs text-[#928997]">
            <p>UCI Student Performance Dataset (Cortez, 2008) · Python Supervised ML Pipeline</p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleOpenPythonModal}
                className="hover:text-[#F8C6DF] transition-colors"
              >
                Python Source Files
              </button>
              <a
                href="/api/dataset/download/mat"
                download="student-mat.csv"
                className="hover:text-[#F8C6DF] transition-colors"
              >
                student-mat.csv
              </a>
              <a
                href="/api/dataset/download/por"
                download="student-por.csv"
                className="hover:text-[#F8C6DF] transition-colors"
              >
                student-por.csv
              </a>
            </div>
          </footer>
        </div>
      </div>

      <PythonSourceModal
        open={pythonModalOpen}
        onClose={() => setPythonModalOpen(false)}
        files={pythonFiles}
      />
    </div>
  );
}
