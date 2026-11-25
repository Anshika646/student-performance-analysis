import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { DashboardPayload, ProjectFileItem, TabId } from './types';
import { OverviewSection } from './components/OverviewSection';
import { AnalysisSection } from './components/AnalysisSection';
import {
  CategoryBarChart,
  CategoryBoxPlotChart,
  CorrelationHeatmapChart,
  ScoreHistogramChart,
  StudyScatterChart,
} from './components/Charts';
import { PredictionSection } from './components/PredictionSection';
import { ProjectFilesModal } from './components/ProjectFilesModal';

const NAV_TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'analysis', label: 'Data Analysis' },
  { id: 'visualizations', label: 'Visualizations' },
  { id: 'prediction', label: 'Predict Score' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filesModalOpen, setFilesModalOpen] = useState(false);
  const [projectFiles, setProjectFiles] = useState<ProjectFileItem[]>([]);

  useEffect(() => {
    let active = true;
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/dashboard');
        if (!res.ok) {
          throw new Error('Failed to load student performance dataset.');
        }
        const json: DashboardPayload = await res.json();
        if (active) {
          setData(json);
        }
      } catch (err: any) {
        if (active) {
          setError(err?.message || 'Unable to load dashboard data.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    fetchDashboard();
    return () => {
      active = false;
    };
  }, []);

  const handleOpenProjectFiles = async () => {
    setFilesModalOpen(true);
    if (projectFiles.length === 0) {
      try {
        const res = await fetch('/api/project-files');
        const json = await res.json();
        if (Array.isArray(json.files)) {
          setProjectFiles(json.files);
        }
      } catch {
        // Ignore gracefully if offline
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      {/* Clean 3-Zone Top Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          <a
            href="#overview"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('overview');
            }}
            className="text-lg font-display font-bold text-slate-900 whitespace-nowrap shrink-0"
          >
            Student Performance Analysis
          </a>

          <nav className="hidden md:flex items-center gap-6">
            {NAV_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-sm font-medium transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                    isActive
                      ? 'text-blue-700 border-blue-600'
                      : 'text-slate-600 border-transparent hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center shrink-0">
            <a
              href="/api/dataset/download"
              download="student_performance.csv"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </a>
          </div>
        </div>

        {/* Mobile Tab Strip */}
        <div className="md:hidden border-t border-slate-100 px-4 py-2 flex items-center gap-4 overflow-x-auto">
          {NAV_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`text-xs font-medium whitespace-nowrap shrink-0 px-2.5 py-1 rounded-md ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-7">
        {loading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-20 bg-white border border-slate-200 rounded-xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="h-28 bg-white border border-slate-200 rounded-xl" />
              <div className="h-28 bg-white border border-slate-200 rounded-xl" />
              <div className="h-28 bg-white border border-slate-200 rounded-xl" />
              <div className="h-28 bg-white border border-slate-200 rounded-xl" />
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="clean-card rounded-xl p-6 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && data && (
          <>
            {activeTab === 'overview' && (
              <OverviewSection
                data={data}
                onNavigatePrediction={() => setActiveTab('prediction')}
              />
            )}

            {activeTab === 'analysis' && <AnalysisSection data={data} />}

            {activeTab === 'visualizations' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-xl font-display font-bold text-slate-900">
                    Data Visualizations
                  </h1>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Five core statistical charts matching our Matplotlib & Seaborn implementation in app.py
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <CategoryBarChart data={data.charts.categoryBar} />
                  <ScoreHistogramChart data={data.charts.scoreHistogram} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <StudyScatterChart points={data.charts.scatterPoints} />
                  <CategoryBoxPlotChart stats={data.charts.boxPlotStats} />
                </div>

                <CorrelationHeatmapChart
                  columns={data.charts.correlationColumns}
                  matrix={data.charts.correlationMatrix}
                />
              </div>
            )}

            {activeTab === 'prediction' && (
              <PredictionSection model={data.mlModel} />
            )}
          </>
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <span>
            Synthetic Student Performance Dataset · Pandas, NumPy, Matplotlib, Seaborn & Linear Regression
          </span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleOpenProjectFiles}
              className="text-blue-700 hover:underline font-medium"
            >
              View Python / Streamlit Files (app.py)
            </button>
            <a
              href="/api/dataset/download"
              download="student_performance.csv"
              className="hover:text-slate-800"
            >
              student_performance.csv
            </a>
          </div>
        </div>
      </footer>

      <ProjectFilesModal
        open={filesModalOpen}
        onClose={() => setFilesModalOpen(false)}
        files={projectFiles}
      />
    </div>
  );
}
