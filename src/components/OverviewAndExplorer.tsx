import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Calendar,
  Database,
  Download,
  FileDown,
  GraduationCap,
  Lightbulb,
  Percent,
  Search,
  ShieldAlert,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  Upload,
  UserCheck,
  Users,
  Wifi,
} from 'lucide-react';
import {
  DatasetPayload,
  EvaluationPayload,
  ModelKey,
  PageId,
  PredictionPayload,
} from '../types';
import { exportRowsToCsv } from '../utils/analytics';
import {
  GradeRangeDistributionChart,
  KpiSparkPoint,
  ModelComparisonGlassChart,
  PerformanceDonutChart,
  RoseSparkline,
  StudyGradeScatterChart,
} from './Charts';

interface OverviewProps {
  dataset: DatasetPayload;
  filteredRows: Record<string, any>[];
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

const EDU_FULL_NAMES: Record<number, string> = {
  0: 'No Formal Ed',
  1: 'Primary School',
  2: 'Middle School',
  3: 'Secondary Ed',
  4: 'Higher Education',
};

export const OverviewPage: React.FC<OverviewProps> = ({
  dataset,
  filteredRows,
  analytics,
  evaluation,
  onSelectModel,
  includeGrades,
  onToggleIncludeGrades,
  prediction,
  onSwitchDataset,
  onNavigate,
}) => {
  const [distGradeCol, setDistGradeCol] = useState<'G3' | 'G2' | 'G1'>('G3');
  const [compMetric, setCompMetric] = useState<'r2' | 'cv' | 'mae' | 'rmse'>('r2');
  const [scatterField, setScatterField] = useState<'G2' | 'studytime' | 'G1' | 'absences'>('G2');
  const [pieMode, setPieMode] = useState<'pie' | 'donut'>('pie');

  const activeRows = filteredRows.length > 0 ? filteredRows : dataset.rows;

  // Dynamic real Quick Stats computed from active dataset rows
  const quickStats = useMemo(() => {
    const n = activeRows.length || 1;
    const ageCounts = new Map<number, number>();
    const eduCounts = new Map<number, number>();
    let internetYes = 0;

    for (const r of activeRows) {
      const ag = Number(r.age ?? 16);
      ageCounts.set(ag, (ageCounts.get(ag) || 0) + 1);

      const bestParentEdu = Math.max(Number(r.Medu ?? 0), Number(r.Fedu ?? 0));
      eduCounts.set(bestParentEdu, (eduCounts.get(bestParentEdu) || 0) + 1);

      if (String(r.internet ?? 'yes').toLowerCase() === 'yes') {
        internetYes += 1;
      }
    }

    let modalAge = 16;
    let bestAgeFreq = -1;
    for (const [ag, cnt] of ageCounts.entries()) {
      if (cnt > bestAgeFreq) {
        bestAgeFreq = cnt;
        modalAge = ag;
      }
    }

    let modalEdu = 4;
    let bestEduFreq = -1;
    for (const [ed, cnt] of eduCounts.entries()) {
      if (cnt > bestEduFreq) {
        bestEduFreq = cnt;
        modalEdu = ed;
      }
    }

    const internetPct = ((internetYes * 100) / n).toFixed(1);
    const subjectLabel =
      dataset.datasetKey === 'por'
        ? 'Portuguese Language'
        : dataset.datasetKey === 'mat'
        ? 'Mathematics'
        : 'Custom Cohort';

    return {
      subjectLabel,
      modalAge: `${modalAge} years`,
      topEdu: EDU_FULL_NAMES[modalEdu] || 'Higher Education',
      internetText: `Yes (${internetPct}%)`,
    };
  }, [activeRows, dataset.datasetKey]);

  // Cohort-relative distributions & trends for the 4 Recharts KPI Sparklines
  const kpiSparkData = useMemo(() => {
    const total = activeRows.length || 1;

    // 1. Total Students: Relative cohort distribution across student age brackets
    const ageBuckets = [
      { label: 'Age 15', match: (a: number) => a <= 15 },
      { label: 'Age 16', match: (a: number) => a === 16 },
      { label: 'Age 17', match: (a: number) => a === 17 },
      { label: 'Age 18', match: (a: number) => a === 18 },
      { label: 'Age 19+', match: (a: number) => a >= 19 },
    ];
    const studentsByAge: KpiSparkPoint[] = ageBuckets.map((b) => {
      const cnt = activeRows.filter((r) => b.match(Number(r.age ?? 16))).length;
      const pct = Math.round((cnt * 100) / total);
      return {
        label: b.label,
        value: cnt,
        formatted: `${cnt} (${pct}%)`,
      };
    });

    // 2. Average Final Grade: Mean grade trend across study-hour tiers (fallback: G1 -> G2 -> G3 progression)
    const populatedStudy = analytics.studyVsGrade.filter((s) => s.count > 0);
    let avgGradeTrend: KpiSparkPoint[];
    if (populatedStudy.length >= 3) {
      avgGradeTrend = populatedStudy.map((s) => ({
        label: `Study ${s.label}`,
        value: Number(s.avgG3.toFixed(2)),
        formatted: `${s.avgG3.toFixed(2)} / 20`,
      }));
    } else {
      const meanOf = (col: 'G1' | 'G2' | 'G3') => {
        const sum = activeRows.reduce((acc, r) => acc + Number(r[col] ?? 0), 0);
        return Number((sum / total).toFixed(2));
      };
      const g1 = meanOf('G1');
      const g2 = meanOf('G2');
      const g3 = meanOf('G3');
      avgGradeTrend = [
        { label: 'Period G1', value: g1, formatted: `${g1.toFixed(2)} / 20` },
        { label: 'Period G2', value: g2, formatted: `${g2.toFixed(2)} / 20` },
        { label: 'Final G3', value: g3, formatted: `${g3.toFixed(2)} / 20` },
      ];
    }

    // 3. Pass Percentage: Cohort pass-rate (%) trend across absence brackets
    const absDefs = [
      { label: '0 Abs', min: 0, max: 0 },
      { label: '1–3 Abs', min: 1, max: 3 },
      { label: '4–7 Abs', min: 4, max: 7 },
      { label: '8–14 Abs', min: 8, max: 14 },
      { label: '15+ Abs', min: 15, max: 999 },
    ];
    const passRateTrend: KpiSparkPoint[] = [];
    for (const ab of absDefs) {
      const sub = activeRows.filter((r) => {
        const a = Number(r.absences ?? 0);
        return a >= ab.min && a <= ab.max;
      });
      if (!sub.length) continue;
      const passCnt = sub.filter((r) => Number(r.G3 ?? 0) >= 10).length;
      const rate = Number(((passCnt * 100) / sub.length).toFixed(1));
      passRateTrend.push({
        label: ab.label,
        value: rate,
        formatted: `${rate.toFixed(1)}%`,
      });
    }

    // 4. Highest Grade: Cohort G3 percentile curve culminating at Max (Highest Grade)
    const sortedG3 = activeRows
      .map((r) => Number(r.G3 ?? 0))
      .sort((a, b) => a - b);
    const pickQuantile = (q: number) => {
      if (!sortedG3.length) return 0;
      const idx = Math.min(sortedG3.length - 1, Math.max(0, Math.round(q * (sortedG3.length - 1))));
      return sortedG3[idx];
    };
    const quantiles: { label: string; q: number }[] = [
      { label: 'P10', q: 0.1 },
      { label: 'P25', q: 0.25 },
      { label: 'Median', q: 0.5 },
      { label: 'P75', q: 0.75 },
      { label: 'P90', q: 0.9 },
      { label: 'Max', q: 1.0 },
    ];
    const highestQuantileCurve: KpiSparkPoint[] = quantiles.map((qt) => {
      const val = pickQuantile(qt.q);
      return {
        label: qt.label,
        value: val,
        formatted: `${val} / 20`,
      };
    });

    return {
      studentsByAge,
      avgGradeTrend,
      passRateTrend:
        passRateTrend.length >= 2
          ? passRateTrend
          : [
              { label: 'Cohort', value: analytics.passRate, formatted: `${analytics.passRate.toFixed(1)}%` },
              { label: 'Target', value: Math.min(100, analytics.passRate), formatted: `${analytics.passRate.toFixed(1)}%` },
            ],
      highestQuantileCurve,
    };
  }, [activeRows, analytics.studyVsGrade, analytics.passRate]);

  // Dynamic real Key Insights computed from active dataset analytics
  const keyInsights = useMemo(() => {
    const lowStudy = analytics.studyVsGrade[0];
    const highStudy = analytics.studyVsGrade[analytics.studyVsGrade.length - 1];
    const studyDelta =
      lowStudy && highStudy ? (highStudy.avgG3 - lowStudy.avgG3).toFixed(2) : '1.40';

    const g2Idx = dataset.correlationColumns.indexOf('G2');
    const g3Idx = dataset.correlationColumns.indexOf('G3');
    const g2g3Corr =
      g2Idx >= 0 &&
      g3Idx >= 0 &&
      analytics.correlationMatrix[g2Idx]?.[g3Idx] !== undefined
        ? analytics.correlationMatrix[g2Idx][g3Idx].toFixed(2)
        : '0.90';

    const fem = analytics.genderPerformance.find((g) => g.label.startsWith('Female'));
    const mal = analytics.genderPerformance.find((g) => g.label.startsWith('Male'));
    const higherGenderText =
      fem && mal
        ? fem.avgG3 >= mal.avgG3
          ? `Female students average ${fem.avgG3}/20 vs ${mal.avgG3}/20 for male peers.`
          : `Male students average ${mal.avgG3}/20 vs ${fem.avgG3}/20 for female peers.`
        : 'Gender cohorts exhibit distinct average grade distributions.';

    const netYes = analytics.internetPerformance.find((x) => x.label.includes('Home'));
    const netNo = analytics.internetPerformance.find((x) => x.label.includes('No'));
    const netText =
      netYes && netNo
        ? `Students with home internet score ${netYes.avgG3}/20 vs ${netNo.avgG3}/20 offline.`
        : 'Students with home internet access tend to achieve higher final grades.';

    return [
      {
        tone: 'pink' as const,
        icon: BookOpen,
        text: (
          <>
            Higher weekly study time lifts mean G3 by{' '}
            <span className="text-[#F8C6DF] font-semibold">+{studyDelta} pts</span> across cohorts.
          </>
        ),
      },
      {
        tone: 'pink' as const,
        icon: TrendingUp,
        text: (
          <>
            Strong <span className="text-[#F8C6DF] font-semibold">positive correlation (r = {g2g3Corr})</span>{' '}
            between G1, G2 and final G3.
          </>
        ),
      },
      {
        tone: 'lavender' as const,
        icon: UserCheck,
        text: <>{higherGenderText}</>,
      },
      {
        tone: 'lavender' as const,
        icon: Wifi,
        text: <>{netText}</>,
      },
    ];
  }, [analytics, dataset.correlationColumns]);

  const orderedComparisonModels = useMemo(() => {
    return [
      evaluation.models.linear_regression,
      evaluation.models.random_forest,
      evaluation.models.decision_tree,
      evaluation.models.gradient_boosting,
    ];
  }, [evaluation.models]);

  const femStat = analytics.genderPerformance.find((g) => g.label.startsWith('Female'));
  const malStat = analytics.genderPerformance.find((g) => g.label.startsWith('Male'));
  const femShare =
    femStat && analytics.totalStudents > 0
      ? (femStat.count * 100) / analytics.totalStudents
      : 52;
  const malShare = Math.max(0, 100 - femShare);

  const failRate = Number(Math.max(0, 100 - analytics.passRate).toFixed(1));
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
      {/* =====================================================================
          MAIN CENTER ANALYTICS COLUMN (9 Cols)
          ===================================================================== */}
      <div className="xl:col-span-9 space-y-5">
        {/* 1. Welcome Glass Banner */}
        <section className="glass-shell rounded-[24px] px-6 py-5 flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-12 w-56 h-56 rounded-full bg-[#F5A6CC]/[0.05] blur-3xl"
          />
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl pink-icon-badge flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-[#FDF8FC]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-display font-bold text-[#FDF8FC] tracking-tight">
                Student Performance Studio
              </h1>
              <p className="text-xs sm:text-sm text-[#BDB4C3] mt-0.5">
                Explore student data, train supervised ML models, and predict future academic performance.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center p-1 rounded-full bg-white/[0.05] border border-[rgba(255,210,235,0.20)]">
              <button
                type="button"
                onClick={() => onToggleIncludeGrades(true)}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all whitespace-nowrap ${
                  includeGrades
                    ? 'glass-pill-active font-semibold'
                    : 'text-[#BDB4C3] hover:text-[#FDF8FC]'
                }`}
              >
                With G1 & G2
              </button>
              <button
                type="button"
                onClick={() => onToggleIncludeGrades(false)}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all whitespace-nowrap ${
                  !includeGrades
                    ? 'glass-pill-active font-semibold'
                    : 'text-[#BDB4C3] hover:text-[#FDF8FC]'
                }`}
              >
                Habits Only
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2.5 pl-2 text-xs text-[#BDB4C3]">
              <span className="w-8 h-8 rounded-full bg-white/[0.06] border border-[rgba(255,210,235,0.20)] flex items-center justify-center text-[#F8C6DF]">
                <Calendar className="w-3.5 h-3.5" />
              </span>
              <div className="leading-tight">
                <div className="text-[10.5px] text-[#928997]">Active Session</div>
                <div className="font-medium text-[#FDF8FC] tabular-nums">{formattedDate}</div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Four Premium Smoked-Glass KPI Cards with Recharts Cohort Sparklines */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Total Students */}
          <div className="glass-kpi rounded-[22px] p-5 flex flex-col justify-between">
            <div className="w-9 h-9 rounded-full pink-icon-badge flex items-center justify-center mb-3.5">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-[#BDB4C3] font-medium">Total Students</div>
              <div className="mt-1 text-3xl font-display font-bold text-[#FDF8FC] tabular-nums">
                {analytics.totalStudents}
              </div>
            </div>
            <div className="mt-4 flex items-end justify-between gap-2">
              <div>
                <div className="text-[11px] font-mono font-medium text-[#F8C6DF] flex items-center gap-0.5 tabular-nums">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>
                    {dataset.rowCount > 0
                      ? `${Math.round((analytics.totalStudents * 100) / dataset.rowCount)}%`
                      : '100%'}
                  </span>
                </div>
                <div className="text-[10.5px] text-[#928997]">Age distribution</div>
              </div>
              <RoseSparkline
                id="kpi_total_students"
                variant="bar"
                accent="pink"
                data={kpiSparkData.studentsByAge}
              />
            </div>
          </div>

          {/* KPI 2: Average Final Grade */}
          <div className="glass-kpi rounded-[22px] p-5 flex flex-col justify-between">
            <div className="w-9 h-9 rounded-full pink-icon-badge flex items-center justify-center mb-3.5">
              <Star className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-[#BDB4C3] font-medium">Average Final Grade</div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-3xl font-display font-bold text-[#FDF8FC] tabular-nums">
                  {analytics.avgG3.toFixed(2)}
                </span>
                <span className="text-sm font-mono text-[#BDB4C3]">/ 20</span>
              </div>
            </div>
            <div className="mt-4 flex items-end justify-between gap-2">
              <div>
                <div className="text-[11px] font-mono font-medium text-[#F8C6DF] flex items-center gap-0.5 tabular-nums">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>Med {analytics.medianG3}</span>
                </div>
                <div className="text-[10.5px] text-[#928997]">Study-tier trend</div>
              </div>
              <RoseSparkline
                id="kpi_avg_grade"
                variant="area"
                accent="blush"
                data={kpiSparkData.avgGradeTrend}
              />
            </div>
          </div>

          {/* KPI 3: Pass Percentage */}
          <div className="glass-kpi rounded-[22px] p-5 flex flex-col justify-between">
            <div className="w-9 h-9 rounded-full pink-icon-badge flex items-center justify-center mb-3.5">
              <Percent className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-[#BDB4C3] font-medium">Pass Percentage</div>
              <div className="mt-1 flex items-baseline gap-0.5">
                <span className="text-3xl font-display font-bold text-[#FDF8FC] tabular-nums">
                  {analytics.passRate.toFixed(1)}
                </span>
                <span className="text-lg font-display font-semibold text-[#F8C6DF]">%</span>
              </div>
            </div>
            <div className="mt-4 flex items-end justify-between gap-2">
              <div>
                <div className="text-[11px] font-mono font-medium text-[#F8C6DF] flex items-center gap-0.5 tabular-nums">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>{Math.round((analytics.passRate * analytics.totalStudents) / 100)} pass</span>
                </div>
                <div className="text-[10.5px] text-[#928997]">Attendance trend</div>
              </div>
              <RoseSparkline
                id="kpi_pass_pct"
                variant="area"
                accent="lavender"
                data={kpiSparkData.passRateTrend}
              />
            </div>
          </div>

          {/* KPI 4: Highest Grade */}
          <div className="glass-kpi rounded-[22px] p-5 flex flex-col justify-between">
            <div className="w-9 h-9 rounded-full pink-icon-badge flex items-center justify-center mb-3.5">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-[#BDB4C3] font-medium">Highest Grade</div>
              <div className="mt-1 text-3xl font-display font-bold text-[#FDF8FC] tabular-nums">
                {analytics.highestG3}
              </div>
            </div>
            <div className="mt-4 flex items-end justify-between gap-2">
              <div>
                <div className="text-[11px] font-mono font-medium text-[#F8C6DF] tabular-nums">
                  P90 {kpiSparkData.highestQuantileCurve[4]?.value ?? analytics.highestG3} / 20
                </div>
                <div className="text-[10.5px] text-[#928997]">Cohort percentiles</div>
              </div>
              <RoseSparkline
                id="kpi_highest_grade"
                variant="area"
                accent="pink"
                data={kpiSparkData.highestQuantileCurve}
              />
            </div>
          </div>
        </section>

        {/* 3. Row 1 Charts: Final Grade Distribution + Performance Overview Donut */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <div className="lg:col-span-7 glass-shell glass-shell-hover rounded-[24px] p-5 flex flex-col justify-between">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg pink-icon-badge flex items-center justify-center">
                  <BarChart3 className="w-3.5 h-3.5" />
                </span>
                <h2 className="text-sm sm:text-base font-display font-semibold text-[#FDF8FC]">
                  Final Grade Distribution
                </h2>
              </div>

              <select
                value={distGradeCol}
                onChange={(e) => setDistGradeCol(e.target.value as 'G3' | 'G2' | 'G1')}
                aria-label="Select Grade Period"
                className="glass-control px-3 py-1.5 rounded-full text-xs font-medium"
              >
                <option value="G3">G3 (Final Grade)</option>
                <option value="G2">G2 (Period 2)</option>
                <option value="G1">G1 (Period 1)</option>
              </select>
            </div>

            <GradeRangeDistributionChart rows={activeRows} gradeCol={distGradeCol} />
          </div>

          <div className="lg:col-span-5 glass-shell glass-shell-hover rounded-[24px] p-5 flex flex-col justify-between">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg pink-icon-badge flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5" />
                </span>
                <h2 className="text-sm sm:text-base font-display font-semibold text-[#FDF8FC]">
                  Performance Overview
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center p-0.5 rounded-full bg-[#050408] border border-white/[0.10]">
                  <button
                    type="button"
                    onClick={() => setPieMode('pie')}
                    className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-medium transition-all ${
                      pieMode === 'pie'
                        ? 'bg-[#1D1622] text-[#F8C6DF] border border-[#F5A6CC]/40'
                        : 'text-[#928997] hover:text-[#FDF8FC]'
                    }`}
                  >
                    Pie
                  </button>
                  <button
                    type="button"
                    onClick={() => setPieMode('donut')}
                    className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-medium transition-all ${
                      pieMode === 'donut'
                        ? 'bg-[#1D1622] text-[#F8C6DF] border border-[#F5A6CC]/40'
                        : 'text-[#928997] hover:text-[#FDF8FC]'
                    }`}
                  >
                    Donut
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('risk')}
                  className="text-[11px] text-[#F8C6DF] hover:text-[#FDF8FC] transition-colors whitespace-nowrap"
                >
                  Risk ({evaluation.atRiskCount}) →
                </button>
              </div>
            </div>

            <div className="my-auto">
              <PerformanceDonutChart
                centerLabel="Pass"
                centerValue={`${analytics.passRate.toFixed(1)}%`}
                variant={pieMode}
                segments={[
                  {
                    label: 'Pass (G3 ≥ 10)',
                    displayValue: `${analytics.passRate.toFixed(1)}%`,
                    share: analytics.passRate,
                    tone: 'pink',
                    subtext: `${Math.round((analytics.passRate * analytics.totalStudents) / 100)} students passing`,
                  },
                  {
                    label: 'Fail (G3 < 10)',
                    displayValue: `${failRate.toFixed(1)}%`,
                    share: failRate,
                    tone: 'blush',
                    subtext: `${Math.round((failRate * analytics.totalStudents) / 100)} students below 10`,
                  },
                ]}
              />
            </div>
          </div>
        </section>

        {/* 4. Row 2 Panels: Key Insights + Model Comparison */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <div className="lg:col-span-6 glass-shell glass-shell-hover rounded-[24px] p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg pink-icon-badge flex items-center justify-center">
                  <Lightbulb className="w-3.5 h-3.5" />
                </span>
                <h2 className="text-sm sm:text-base font-display font-semibold text-[#FDF8FC]">
                  Key Insights
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('eda')}
                className="text-[11px] text-[#BDB4C3] hover:text-[#FDF8FC] transition-colors"
              >
                Explore All →
              </button>
            </div>

            <div className="space-y-2.5">
              {keyInsights.map((ins, idx) => {
                const IconComp = ins.icon;
                return (
                  <div
                    key={idx}
                    className="glass-subcard rounded-2xl px-3.5 py-2.5 flex items-center gap-3"
                  >
                    <span
                      className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${
                        ins.tone === 'lavender' ? 'lavender-icon-badge' : 'pink-icon-badge'
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                    </span>
                    <p className="text-xs text-[#FDF8FC]/92 leading-relaxed">{ins.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-6 glass-shell glass-shell-hover rounded-[24px] p-5 flex flex-col justify-between">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg pink-icon-badge flex items-center justify-center">
                  <BarChart3 className="w-3.5 h-3.5" />
                </span>
                <h2 className="text-sm sm:text-base font-display font-semibold text-[#FDF8FC]">
                  Model Comparison
                </h2>
              </div>

              <select
                value={compMetric}
                onChange={(e) => setCompMetric(e.target.value as 'r2' | 'cv' | 'mae' | 'rmse')}
                aria-label="Select Evaluation Metric"
                className="glass-control px-3 py-1.5 rounded-full text-xs font-medium"
              >
                <option value="r2">R² Score</option>
                <option value="cv">5-Fold CV R²</option>
                <option value="mae">MAE (Error)</option>
                <option value="rmse">RMSE (Error)</option>
              </select>
            </div>

            <ModelComparisonGlassChart
              models={orderedComparisonModels}
              metric={compMetric}
              onSelectModel={(k) => {
                onSelectModel(k);
                onNavigate('insights');
              }}
            />
          </div>
        </section>

        {/* 5. Row 3 Charts: Scatter Trend Plot + Gender-wise Performance Donut */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <div className="lg:col-span-7 glass-shell glass-shell-hover rounded-[24px] p-5 flex flex-col justify-between">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg pink-icon-badge flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5" />
                </span>
                <h2 className="text-sm sm:text-base font-display font-semibold text-[#FDF8FC]">
                  Study Time & Prior Grades vs Final Grade
                </h2>
              </div>

              <select
                value={scatterField}
                onChange={(e) =>
                  setScatterField(e.target.value as 'G2' | 'studytime' | 'G1' | 'absences')
                }
                aria-label="Select Scatter X-Axis"
                className="glass-control px-3 py-1.5 rounded-full text-xs font-medium"
              >
                <option value="G2">G2 vs Final G3 (Trend)</option>
                <option value="studytime">Study Time vs Final G3</option>
                <option value="G1">G1 vs Final G3</option>
                <option value="absences">Absences vs Final G3</option>
              </select>
            </div>

            <StudyGradeScatterChart rows={activeRows} xField={scatterField} showTrend={true} />
          </div>

          <div className="lg:col-span-5 glass-shell glass-shell-hover rounded-[24px] p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg lavender-icon-badge flex items-center justify-center">
                  <Users className="w-3.5 h-3.5" />
                </span>
                <h2 className="text-sm sm:text-base font-display font-semibold text-[#FDF8FC]">
                  Gender-wise Performance
                </h2>
              </div>
              <div className="flex items-center p-0.5 rounded-full bg-[#050408] border border-white/[0.10]">
                <button
                  type="button"
                  onClick={() => setPieMode('pie')}
                  className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-medium transition-all ${
                    pieMode === 'pie'
                      ? 'bg-[#1D1622] text-[#F8C6DF] border border-[#F5A6CC]/40'
                      : 'text-[#928997] hover:text-[#FDF8FC]'
                  }`}
                >
                  Pie
                </button>
                <button
                  type="button"
                  onClick={() => setPieMode('donut')}
                  className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-medium transition-all ${
                    pieMode === 'donut'
                      ? 'bg-[#1D1622] text-[#F8C6DF] border border-[#F5A6CC]/40'
                      : 'text-[#928997] hover:text-[#FDF8FC]'
                  }`}
                >
                  Donut
                </button>
              </div>
            </div>

            <div className="my-auto">
              <PerformanceDonutChart
                centerLabel="Avg Grade"
                centerValue={analytics.avgG3.toFixed(2)}
                variant={pieMode}
                segments={[
                  {
                    label: 'Female',
                    displayValue: femStat ? femStat.avgG3.toFixed(2) : '—',
                    share: femShare,
                    tone: 'pink',
                    subtext: femStat
                      ? `Female (n=${femStat.count}): Avg ${femStat.avgG3}/20 · Pass ${femStat.passRate}%`
                      : undefined,
                  },
                  {
                    label: 'Male',
                    displayValue: malStat ? malStat.avgG3.toFixed(2) : '—',
                    share: malShare,
                    tone: 'lavender',
                    subtext: malStat
                      ? `Male (n=${malStat.count}): Avg ${malStat.avgG3}/20 · Pass ${malStat.passRate}%`
                      : undefined,
                  },
                ]}
              />
            </div>
          </div>
        </section>
      </div>

      {/* =====================================================================
          RIGHT LAYERED GLASS RAIL (3 Cols)
          ===================================================================== */}
      <aside className="xl:col-span-3 space-y-5">
        {/* Card 1: Predict Student Performance CTA */}
        <div className="glass-kpi rounded-[24px] p-6 relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-8 -top-8 w-36 h-36 rounded-full bg-[#F5A6CC]/[0.07] blur-2xl"
          />
          <div className="w-11 h-11 rounded-2xl pink-icon-badge flex items-center justify-center mb-4">
            <Sparkles className="w-5 h-5 text-[#FDF8FC]" />
          </div>

          <h2 className="text-lg font-display font-bold text-[#FDF8FC] leading-snug">
            Predict Student Performance
          </h2>
          <p className="text-xs text-[#BDB4C3] leading-relaxed mt-2">
            Enter student attributes and run trained Python ML regressors with counterfactual What-If insights.
          </p>

          {prediction && (
            <div className="mt-4 px-3.5 py-2.5 rounded-2xl bg-white/[0.05] border border-[rgba(255,210,235,0.18)] flex items-center justify-between text-xs">
              <span className="text-[#BDB4C3]">Active Profile G3</span>
              <span className="font-mono font-bold text-[#F8C6DF] tabular-nums">
                {prediction.predictedGrade.toFixed(2)} / 20
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={() => onNavigate('prediction')}
            className="glass-cta w-full mt-5 py-3 px-4 rounded-full text-xs font-display font-bold flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <span>Go to Prediction</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: Quick Stats */}
        <div className="glass-shell rounded-[24px] p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg pink-icon-badge flex items-center justify-center">
              <BarChart3 className="w-3.5 h-3.5" />
            </span>
            <h2 className="text-sm font-display font-semibold text-[#FDF8FC]">Quick Stats</h2>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full pink-icon-badge flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <div className="text-[11px] text-[#928997]">Active Cohort Subject</div>
                <div className="text-sm font-display font-semibold text-[#FDF8FC] truncate">
                  {quickStats.subjectLabel}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full pink-icon-badge flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <div className="text-[11px] text-[#928997]">Most Common Age</div>
                <div className="text-sm font-display font-semibold text-[#FDF8FC] tabular-nums">
                  {quickStats.modalAge}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full lavender-icon-badge flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <div className="text-[11px] text-[#928997]">Top Family Education</div>
                <div className="text-sm font-display font-semibold text-[#FDF8FC] truncate">
                  {quickStats.topEdu}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full pink-icon-badge flex items-center justify-center shrink-0">
                <Wifi className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <div className="text-[11px] text-[#928997]">Internet Access</div>
                <div className="text-sm font-display font-semibold text-[#FDF8FC] tabular-nums">
                  {quickStats.internetText}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Dataset Info */}
        <div className="glass-shell rounded-[24px] p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg pink-icon-badge flex items-center justify-center">
                <Database className="w-3.5 h-3.5" />
              </span>
              <h2 className="text-sm font-display font-semibold text-[#FDF8FC]">Dataset Info</h2>
            </div>

            <div className="flex items-center p-0.5 rounded-full bg-white/[0.05] border border-[rgba(255,210,235,0.18)] text-[10px] font-mono">
              <button
                type="button"
                onClick={() => onSwitchDataset('mat')}
                className={`px-2 py-0.5 rounded-full transition-all ${
                  dataset.datasetKey === 'mat'
                    ? 'glass-pill-active font-semibold'
                    : 'text-[#BDB4C3] hover:text-white'
                }`}
              >
                MAT
              </button>
              <button
                type="button"
                onClick={() => onSwitchDataset('por')}
                className={`px-2 py-0.5 rounded-full transition-all ${
                  dataset.datasetKey === 'por'
                    ? 'glass-pill-active font-semibold'
                    : 'text-[#BDB4C3] hover:text-white'
                }`}
              >
                POR
              </button>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <div className="text-[10.5px] text-[#928997]">Dataset</div>
              <div className="font-medium text-[#FDF8FC]">UCI Student Performance</div>
            </div>

            <div>
              <div className="text-[10.5px] text-[#928997]">File</div>
              <div className="font-mono text-[#F8C6DF]">
                {dataset.datasetKey === 'por'
                  ? 'student-por.csv'
                  : dataset.datasetKey === 'mat'
                  ? 'student-mat.csv'
                  : 'uploaded-cohort.csv'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <div className="text-[10.5px] text-[#928997]">Total Rows</div>
                <div className="text-sm font-mono font-semibold text-[#FDF8FC] tabular-nums">
                  {dataset.rowCount}
                </div>
              </div>
              <div>
                <div className="text-[10.5px] text-[#928997]">Total Columns</div>
                <div className="text-sm font-mono font-semibold text-[#FDF8FC] tabular-nums">
                  {dataset.columnCount}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="text-[10.5px] text-[#928997]">Missing Values</div>
                <div className="text-sm font-mono font-semibold text-[#FDF8FC] tabular-nums">
                  {dataset.totalMissingImputed}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('risk')}
                className="text-[11px] text-[#F8C6DF] hover:text-white flex items-center gap-1"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{evaluation.atRiskCount} at-risk</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('explorer')}
            className="w-full py-2.5 px-4 rounded-full bg-white/[0.06] hover:bg-white/[0.11] border border-[rgba(255,210,235,0.22)] text-xs font-medium text-[#FDF8FC] transition-all flex items-center justify-center gap-1.5"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#F8C6DF]" />
          </button>
        </div>
      </aside>
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
      <div className="glass-shell rounded-[24px] p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#BDB4C3]">
            <Database className="w-3.5 h-3.5 text-[#F5A6CC]" />
            <span className="text-[#FDF8FC] font-semibold">{dataset.datasetLabel}</span>
            <span>·</span>
            <span className="tabular-nums">{dataset.rowCount} clean rows</span>
            <span>·</span>
            <span className="tabular-nums">{dataset.columnCount} columns</span>
            <span>·</span>
            <span className="tabular-nums">Duplicates removed: {dataset.duplicatesRemoved}</span>
            <span>·</span>
            <span className="tabular-nums">Missing imputed: {dataset.totalMissingImputed}</span>
          </div>
          <p className="text-xs text-[#928997]">
            Switch between official UCI datasets, export your filtered slice as CSV, or upload custom student records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onSwitchDataset('mat')}
            className={`px-3.5 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              dataset.datasetKey === 'mat'
                ? 'glass-pill-active font-semibold'
                : 'glass-control text-[#BDB4C3] hover:text-white'
            }`}
          >
            Mathematics (395)
          </button>
          <button
            onClick={() => onSwitchDataset('por')}
            className={`px-3.5 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              dataset.datasetKey === 'por'
                ? 'glass-pill-active font-semibold'
                : 'glass-control text-[#BDB4C3] hover:text-white'
            }`}
          >
            Portuguese (649)
          </button>

          <label className="glass-control px-3.5 py-2 rounded-full text-xs font-medium cursor-pointer flex items-center gap-1.5 whitespace-nowrap">
            <Upload className="w-3.5 h-3.5 text-[#F5A6CC]" />
            <span>Upload CSV</span>
            <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
          </label>

          <button
            type="button"
            onClick={() => exportRowsToCsv(searchedRows, `filtered_${dataset.datasetKey}_cohort.csv`)}
            className="glass-control px-3.5 py-2 rounded-full text-xs font-medium flex items-center gap-1.5 whitespace-nowrap"
          >
            <FileDown className="w-3.5 h-3.5 text-[#F8C6DF]" />
            <span>Export Filtered ({searchedRows.length})</span>
          </button>

          <a
            href="/api/dataset/download/mat"
            download="student-mat.csv"
            className="glass-control px-3 py-2 rounded-full text-xs font-medium flex items-center gap-1.5 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-[#F8C6DF]" />
            <span>MAT</span>
          </a>
          <a
            href="/api/dataset/download/por"
            download="student-por.csv"
            className="glass-control px-3 py-2 rounded-full text-xs font-medium flex items-center gap-1.5 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-[#C4A8F5]" />
            <span>POR</span>
          </a>
        </div>
      </div>

      <div className="glass-shell rounded-[24px] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.04] border border-[rgba(255,210,235,0.18)]">
            <button
              onClick={() => setSubTab('records')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                subTab === 'records'
                  ? 'glass-pill-active font-semibold'
                  : 'text-[#BDB4C3] hover:text-white'
              }`}
            >
              Student Records ({searchedRows.length})
            </button>
            <button
              onClick={() => setSubTab('schema')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                subTab === 'schema'
                  ? 'glass-pill-active font-semibold'
                  : 'text-[#BDB4C3] hover:text-white'
              }`}
            >
              Statistics, Data Types & Missing ({dataset.columnCount})
            </button>
          </div>

          {subTab === 'records' && (
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#BDB4C3] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => {
                  onChangeGlobalSearch(e.target.value);
                  setPageIdx(0);
                }}
                placeholder="Search records (e.g. teacher, GP)..."
                className="glass-control w-full pl-9 pr-3 py-1.5 rounded-full text-xs placeholder-[#928997]"
              />
            </div>
          )}
        </div>

        {subTab === 'records' ? (
          <>
            <div className="overflow-x-auto rounded-2xl border border-[rgba(255,210,235,0.18)]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-white/[0.05] text-[#BDB4C3] border-b border-[rgba(255,210,235,0.16)]">
                    <th className="py-2.5 px-3 font-semibold">#</th>
                    {dataset.columns.map((col) => (
                      <th
                        key={col}
                        className={`py-2.5 px-3 font-semibold whitespace-nowrap ${
                          col === 'G3' ? 'text-[#F8C6DF] bg-[#F5A6CC]/12' : ''
                        }`}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {visibleRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.045] transition-colors">
                      <td className="py-2 px-3 font-mono tabular-nums text-[#928997]">
                        {safePage * pageSize + idx + 1}
                      </td>
                      {dataset.columns.map((col) => {
                        const val = row[col];
                        const isNum = dataset.columnTypes[col] !== 'categorical';
                        return (
                          <td
                            key={col}
                            className={`py-2 px-3 whitespace-nowrap ${
                              isNum
                                ? 'font-mono tabular-nums text-right text-[#FDF8FC]'
                                : 'text-[#BDB4C3]'
                            } ${
                              col === 'G3'
                                ? Number(val) >= 10
                                  ? 'font-semibold text-[#F8C6DF] bg-[#F5A6CC]/[0.08]'
                                  : 'font-semibold text-[#C4A8F5] bg-[#C4A8F5]/[0.08]'
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

            <div className="flex items-center justify-between mt-4 text-xs text-[#BDB4C3]">
              <span className="tabular-nums">
                Showing {searchedRows.length === 0 ? 0 : safePage * pageSize + 1}–
                {Math.min(searchedRows.length, (safePage + 1) * pageSize)} of {searchedRows.length}{' '}
                records
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={safePage === 0}
                  onClick={() => setPageIdx((p) => Math.max(0, p - 1))}
                  className="glass-control px-3.5 py-1.5 rounded-full disabled:opacity-35"
                >
                  Previous
                </button>
                <span className="font-mono tabular-nums text-[#FDF8FC]">
                  {safePage + 1} / {totalPages}
                </span>
                <button
                  disabled={safePage >= totalPages - 1}
                  onClick={() => setPageIdx((p) => Math.min(totalPages - 1, p + 1))}
                  className="glass-control px-3.5 py-1.5 rounded-full disabled:opacity-35"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[rgba(255,210,235,0.18)]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-white/[0.05] text-[#BDB4C3] border-b border-[rgba(255,210,235,0.16)]">
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
                  <tr key={st.column} className="hover:bg-white/[0.045]">
                    <td className="py-2 px-3 font-semibold text-[#FDF8FC]">{st.column}</td>
                    <td className="py-2 px-3 font-mono text-[#F8C6DF]">{st.dtype}</td>
                    <td className="py-2 px-3 font-mono tabular-nums text-right text-[#BDB4C3]">
                      {st.missing}
                    </td>
                    <td className="py-2 px-3 font-mono tabular-nums text-right text-[#FDF8FC]">
                      {st.mean !== undefined ? st.mean : `${st.top} (${st.freq})`}
                    </td>
                    <td className="py-2 px-3 font-mono tabular-nums text-right text-[#BDB4C3]">
                      {st.std !== undefined ? st.std : `${st.unique} classes`}
                    </td>
                    <td className="py-2 px-3 font-mono tabular-nums text-right text-[#928997]">
                      {st.min !== undefined ? st.min : '—'}
                    </td>
                    <td className="py-2 px-3 font-mono tabular-nums text-right text-[#FDF8FC]">
                      {st.median !== undefined ? st.median : '—'}
                    </td>
                    <td className="py-2 px-3 font-mono tabular-nums text-right text-[#928997]">
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
