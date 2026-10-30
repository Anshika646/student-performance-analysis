import React, { useState } from 'react';
import { BarChart3, RefreshCw, TrendingUp, Trophy } from 'lucide-react';
import { DatasetPayload, EvaluationPayload, ModelKey } from '../types';
import {
  AgeTrajectoryChart,
  CorrelationHeatmap,
  FeatureImportanceBars,
  GradeDistributionChart,
  GroupedBarsChart,
  ModelComparisonGlassChart,
  PeriodProgressionChart,
  SculptedBarChart,
  StudyGradeScatterChart,
} from './Charts';

interface EdaProps {
  dataset: DatasetPayload;
  filteredRows: Record<string, any>[];
  analytics: ReturnType<typeof import('../utils/analytics').computeDynamicAnalytics>;
  evaluation: EvaluationPayload;
}

export const EdaPage: React.FC<EdaProps> = ({
  dataset,
  filteredRows,
  analytics,
  evaluation,
}) => {
  const [scatterX, setScatterX] = useState<'studytime' | 'G2' | 'G1' | 'absences'>('studytime');
  const bestModel = evaluation.models[evaluation.bestModelKey];
  const activeRows = filteredRows.length > 0 ? filteredRows : dataset.rows;

  return (
    <div className="space-y-5">
      {/* Row 1: Full 0-20 Final Grade Histogram + Period Trajectory (G1 -> G2 -> G3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 glass-shell glass-shell-hover rounded-[24px] p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-display font-semibold text-[#FDF8FC]">
                01. Final Grade (G3) Distribution (0–20 Scale)
              </h3>
              <p className="text-xs text-[#BDB4C3]">
                Full integer grade distribution across active cohort with G3 ≥ 10 pass boundary
              </p>
            </div>
            <span className="w-8 h-8 rounded-lg pink-icon-badge flex items-center justify-center shrink-0">
              <BarChart3 className="w-4 h-4" />
            </span>
          </div>
          <GradeDistributionChart data={analytics.gradeDistribution} />
        </div>

        <div className="lg:col-span-5 glass-shell glass-shell-hover rounded-[24px] p-6">
          <div className="mb-3">
            <h3 className="text-base font-display font-semibold text-[#FDF8FC]">
              02. Period Trajectory (G1 → G2 → G3)
            </h3>
            <p className="text-xs text-[#BDB4C3]">
              Longitudinal progression comparing passing students vs overall cohort mean
            </p>
          </div>
          {analytics.periodProgression.length > 0 ? (
            <PeriodProgressionChart data={analytics.periodProgression} />
          ) : (
            <SculptedBarChart
              data={analytics.studyVsGrade.map((d) => ({
                label: d.label,
                value: d.avgG3,
                count: d.count,
                subtext: `Avg ${d.avgG3}/20 · Pass ${d.passRate}%`,
              }))}
              maxVal={16}
              capsuleLabels={true}
            />
          )}
        </div>
      </div>

      {/* Row 2: Interactive Scatter Regression + Study Time + Absences */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-6 glass-shell glass-shell-hover rounded-[24px] p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="text-base font-display font-semibold text-[#FDF8FC]">
                03. Student Scatter & OLS Trend Line
              </h3>
              <p className="text-xs text-[#BDB4C3]">
                Individual student observations colored by gender with glowing linear fit
              </p>
            </div>
            <select
              value={scatterX}
              onChange={(e) =>
                setScatterX(e.target.value as 'studytime' | 'G2' | 'G1' | 'absences')
              }
              aria-label="Scatter X Axis"
              className="glass-control px-3 py-1.5 rounded-full text-xs font-medium"
            >
              <option value="studytime">Study Time vs G3</option>
              <option value="G2">Period 2 (G2) vs G3</option>
              <option value="G1">Period 1 (G1) vs G3</option>
              <option value="absences">Absences vs G3</option>
            </select>
          </div>
          <StudyGradeScatterChart rows={activeRows} xField={scatterX} showTrend={true} />
        </div>

        <div className="lg:col-span-3 glass-shell glass-shell-hover rounded-[24px] p-6">
          <div className="mb-3">
            <h3 className="text-base font-display font-semibold text-[#FDF8FC]">
              04. Study Time vs Grades
            </h3>
            <p className="text-xs text-[#BDB4C3]">Mean G3 by weekly study hours</p>
          </div>
          <SculptedBarChart
            data={analytics.studyVsGrade.map((d) => ({
              label: d.label,
              value: d.avgG3,
              count: d.count,
              subtext: `Avg ${d.avgG3}/20 · Pass ${d.passRate}%`,
            }))}
            maxVal={16}
            accent="rose"
            capsuleLabels={true}
          />
        </div>

        <div className="lg:col-span-3 glass-shell glass-shell-hover rounded-[24px] p-6">
          <div className="mb-3">
            <h3 className="text-base font-display font-semibold text-[#FDF8FC]">
              05. Absences vs Grades
            </h3>
            <p className="text-xs text-[#BDB4C3]">Mean G3 across absence brackets</p>
          </div>
          <SculptedBarChart
            data={analytics.absencesBinned.map((d) => ({
              label: d.label,
              value: d.avgG3,
              count: d.count,
              subtext: `Avg ${d.avgG3}/20 · Pass ${d.passRate}%`,
            }))}
            maxVal={15}
            accent="lavender"
          />
        </div>
      </div>

      {/* Row 3: Previous Failures + Age Trajectory + Family Education + Gender & Internet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-3 glass-shell glass-shell-hover rounded-[24px] p-6">
          <div className="mb-3">
            <h3 className="text-base font-display font-semibold text-[#FDF8FC]">
              06. Prior Failures vs G3
            </h3>
            <p className="text-xs text-[#BDB4C3]">Impact of past class failures</p>
          </div>
          <SculptedBarChart
            data={analytics.failuresVsGrade.map((d) => ({
              label: d.label,
              value: d.avgG3,
              count: d.count,
              subtext: `Avg ${d.avgG3}/20 · Pass ${d.passRate}%`,
            }))}
            maxVal={15}
            accent="rose"
            capsuleLabels={true}
          />
        </div>

        <div className="lg:col-span-3 glass-shell glass-shell-hover rounded-[24px] p-6">
          <div className="mb-3">
            <h3 className="text-base font-display font-semibold text-[#FDF8FC]">
              07. Age-wise Trajectory
            </h3>
            <p className="text-xs text-[#BDB4C3]">Mean G3 from age 15 to 22</p>
          </div>
          <AgeTrajectoryChart data={analytics.agePerformance} />
        </div>

        <div className="lg:col-span-3 glass-shell glass-shell-hover rounded-[24px] p-6">
          <div className="mb-3">
            <h3 className="text-base font-display font-semibold text-[#FDF8FC]">
              08. Family Education
            </h3>
            <p className="text-xs text-[#BDB4C3]">Medu & Fedu (0–4) vs G3</p>
          </div>
          <GroupedBarsChart
            categories={analytics.familyEduPerformance.map((d) => d.label.split(' ')[0])}
            seriesA={{
              name: 'Mother',
              values: analytics.familyEduPerformance.map((d) => d.motherAvgG3),
            }}
            seriesB={{
              name: 'Father',
              values: analytics.familyEduPerformance.map((d) => d.fatherAvgG3),
            }}
            maxVal={15}
          />
        </div>

        <div className="lg:col-span-3 glass-shell glass-shell-hover rounded-[24px] p-6">
          <div className="mb-3">
            <h3 className="text-base font-display font-semibold text-[#FDF8FC]">
              09. Gender & Internet
            </h3>
            <p className="text-xs text-[#BDB4C3]">Mean G3 by sex & connectivity</p>
          </div>
          <SculptedBarChart
            data={[
              ...analytics.genderPerformance.map((d) => ({
                label: d.label.replace(' (F)', '').replace(' (M)', ''),
                value: d.avgG3,
                subtext: `Avg ${d.avgG3}/20 · Pass ${d.passRate}% (n=${d.count})`,
              })),
              ...analytics.internetPerformance.map((d) => ({
                label: d.label === 'Home Internet' ? 'Internet' : 'Offline',
                value: d.avgG3,
                subtext: `Avg ${d.avgG3}/20 · Pass ${d.passRate}% (n=${d.count})`,
              })),
            ]}
            maxVal={15}
            accent="lavender"
            capsuleLabels={true}
          />
        </div>
      </div>

      {/* Row 4: Correlation Heatmap + Feature Importance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 glass-shell glass-shell-hover rounded-[24px] p-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-display font-semibold text-[#FDF8FC]">
              10. Feature Correlation Heatmap
            </h3>
            <TrendingUp className="w-4 h-4 text-[#F8C6DF]" />
          </div>
          <CorrelationHeatmap
            columns={dataset.correlationColumns}
            matrix={analytics.correlationMatrix}
          />
        </div>

        <div className="lg:col-span-4 glass-shell glass-shell-hover rounded-[24px] p-6">
          <div className="mb-4">
            <h3 className="text-base font-display font-semibold text-[#FDF8FC]">
              11. Feature Importance
            </h3>
            <p className="text-xs text-[#BDB4C3]">
              {bestModel.name} ({evaluation.includeGrades ? 'With G1 & G2' : 'Without G1 & G2'})
            </p>
          </div>
          <FeatureImportanceBars items={bestModel.featureImportance} />
        </div>
      </div>
    </div>
  );
};

interface TrainingProps {
  evaluation: EvaluationPayload;
  includeGrades: boolean;
  onToggleIncludeGrades: (val: boolean) => void;
  selectedModel: ModelKey;
  onSelectModel: (key: ModelKey) => void;
  hyperparams: {
    testSize: number;
    randomState: number;
    maxDepth: number;
    nEstimators: number;
  };
  onChangeHyperparams: (next: {
    testSize: number;
    randomState: number;
    maxDepth: number;
    nEstimators: number;
  }) => void;
  onRetrain: () => void;
  isTraining: boolean;
}

export const TrainingPage: React.FC<TrainingProps> = ({
  evaluation,
  includeGrades,
  onToggleIncludeGrades,
  selectedModel,
  onSelectModel,
  hyperparams,
  onChangeHyperparams,
  onRetrain,
  isTraining,
}) => {
  const [compMetric, setCompMetric] = useState<'r2' | 'cv' | 'mae' | 'rmse'>('r2');

  const modelList = [
    evaluation.models.linear_regression,
    evaluation.models.random_forest,
    evaluation.models.decision_tree,
    evaluation.models.gradient_boosting,
  ];

  return (
    <div className="space-y-5">
      {/* Smoked-Glass Hyperparameter & Pipeline Bar */}
      <div className="glass-shell rounded-[24px] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
          <div>
            <h2 className="text-base font-display font-semibold text-[#FDF8FC]">
              Leakage-Free Python Training & 5-Fold Cross-Validation Pipeline
            </h2>
            <p className="text-xs text-[#BDB4C3] mt-0.5">
              Train/Test split ({evaluation.trainSize} train / {evaluation.testSize} test rows) executes prior to fitting median/mode imputers and StandardScaler.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center p-1 rounded-full bg-white/[0.04] border border-[rgba(255,210,235,0.20)]">
              <button
                onClick={() => onToggleIncludeGrades(true)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  includeGrades ? 'glass-pill-active font-semibold' : 'text-[#BDB4C3] hover:text-white'
                }`}
              >
                With G1 & G2
              </button>
              <button
                onClick={() => onToggleIncludeGrades(false)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  !includeGrades ? 'glass-pill-active font-semibold' : 'text-[#BDB4C3] hover:text-white'
                }`}
              >
                Without G1 & G2
              </button>
            </div>

            <button
              onClick={onRetrain}
              disabled={isTraining}
              className="glass-cta px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTraining ? 'animate-spin' : ''}`} />
              <span>{isTraining ? 'Training in Python...' : 'Retrain All 4 Models'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-5 text-xs">
          <div>
            <div className="flex justify-between font-medium text-[#BDB4C3] mb-2">
              <span>Test Split Ratio</span>
              <span className="font-mono tabular-nums font-semibold text-[#F8C6DF]">
                {Math.round(hyperparams.testSize * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0.15}
              max={0.35}
              step={0.05}
              value={hyperparams.testSize}
              onChange={(e) =>
                onChangeHyperparams({ ...hyperparams, testSize: Number(e.target.value) })
              }
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between font-medium text-[#BDB4C3] mb-2">
              <span>Tree Max Depth</span>
              <span className="font-mono tabular-nums font-semibold text-[#F8C6DF]">
                {hyperparams.maxDepth}
              </span>
            </div>
            <input
              type="range"
              min={3}
              max={12}
              step={1}
              value={hyperparams.maxDepth}
              onChange={(e) =>
                onChangeHyperparams({ ...hyperparams, maxDepth: Number(e.target.value) })
              }
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between font-medium text-[#BDB4C3] mb-2">
              <span>Ensemble Trees</span>
              <span className="font-mono tabular-nums font-semibold text-[#F8C6DF]">
                {hyperparams.nEstimators}
              </span>
            </div>
            <input
              type="range"
              min={15}
              max={75}
              step={5}
              value={hyperparams.nEstimators}
              onChange={(e) =>
                onChangeHyperparams({ ...hyperparams, nEstimators: Number(e.target.value) })
              }
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between font-medium text-[#BDB4C3] mb-1.5">
              <span>Random Seed</span>
              <span className="font-mono tabular-nums font-semibold text-[#F8C6DF]">
                {hyperparams.randomState}
              </span>
            </div>
            <input
              type="number"
              min={1}
              max={999}
              value={hyperparams.randomState}
              onChange={(e) =>
                onChangeHyperparams({
                  ...hyperparams,
                  randomState: Math.max(1, Number(e.target.value) || 42),
                })
              }
              className="glass-control w-full px-3 py-1.5 rounded-xl font-mono tabular-nums"
            />
          </div>
        </div>
      </div>

      {/* Best Model Verdict Card */}
      <div className="glass-kpi rounded-[24px] p-6">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl pink-icon-badge flex items-center justify-center shrink-0 mt-0.5">
            <Trophy className="w-5 h-5 text-[#FDF8FC]" />
          </div>
          <div className="space-y-1">
            <div className="text-xs text-[#F8C6DF] font-medium">
              Best Held-Out Generalization · {evaluation.modeLabel}
            </div>
            <h3 className="text-lg font-display font-bold text-[#FDF8FC]">
              Winner: {evaluation.bestModelName}
            </h3>
            <p className="text-xs sm:text-sm text-[#BDB4C3] leading-relaxed max-w-4xl">
              {evaluation.bestModelExplanation}
            </p>
          </div>
        </div>
      </div>

      {/* 4 Supervised Model Evaluation Smoked-Glass Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {modelList.map((m) => {
          const isBest = m.key === evaluation.bestModelKey;
          const isSelected = m.key === selectedModel;
          return (
            <div
              key={m.key}
              onClick={() => onSelectModel(m.key)}
              className={`rounded-[24px] p-5 cursor-pointer transition-all ${
                isSelected
                  ? 'glass-kpi border-[#F5A6CC]/55 shadow-[0_20px_50px_rgba(0,0,0,0.55),0_0_28px_rgba(245,166,204,0.16)]'
                  : 'glass-shell glass-shell-hover'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <h3 className="text-sm font-display font-semibold text-[#FDF8FC] truncate">
                  {m.name.replace(' Regressor', '')}
                </h3>
                {isBest && (
                  <span className="text-[10.5px] font-semibold text-[#F8C6DF] shrink-0">
                    Best Test R²
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/[0.08]">
                <div>
                  <div className="text-[10.5px] text-[#928997]">Test R²</div>
                  <div className="text-xl font-display font-bold tabular-nums text-[#F8C6DF] mt-0.5">
                    {m.testMetrics.r2.toFixed(3)}
                  </div>
                </div>
                <div>
                  <div className="text-[10.5px] text-[#928997]">MAE</div>
                  <div className="text-xl font-display font-semibold tabular-nums text-[#FDF8FC] mt-0.5">
                    {m.testMetrics.mae.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-[10.5px] text-[#928997]">RMSE</div>
                  <div className="text-xl font-display font-semibold tabular-nums text-[#FDF8FC] mt-0.5">
                    {m.testMetrics.rmse.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="mt-3 space-y-1 text-[11px] text-[#BDB4C3] font-mono tabular-nums">
                <div className="flex justify-between">
                  <span>5-Fold CV R²:</span>
                  <span className="text-[#FDF8FC]">
                    {m.cvMetrics.meanR2.toFixed(3)} ± {m.cvMetrics.stdR2.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Train R²:</span>
                  <span>{m.trainMetrics.r2.toFixed(3)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Model Comparison Frosted Glass Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass-shell rounded-[24px] p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="text-base font-display font-semibold text-[#FDF8FC]">
                Model Comparison Across Algorithms
              </h3>
              <p className="text-xs text-[#BDB4C3]">
                Switch evaluation metric to compare test generalization & error
              </p>
            </div>
            <select
              value={compMetric}
              onChange={(e) => setCompMetric(e.target.value as 'r2' | 'cv' | 'mae' | 'rmse')}
              aria-label="Comparison Metric"
              className="glass-control px-3 py-1.5 rounded-full text-xs font-medium"
            >
              <option value="r2">R² Score</option>
              <option value="cv">5-Fold CV R²</option>
              <option value="mae">Test MAE (pts)</option>
              <option value="rmse">Test RMSE (pts)</option>
            </select>
          </div>
          <ModelComparisonGlassChart
            models={modelList}
            metric={compMetric}
            onSelectModel={onSelectModel}
          />
        </div>

        <div className="glass-shell rounded-[24px] p-6">
          <h3 className="text-base font-display font-semibold text-[#FDF8FC] mb-1">
            Selected Model Feature Weights — {evaluation.models[selectedModel].name}
          </h3>
          <p className="text-xs text-[#BDB4C3] mb-4">
            Click any algorithm card above to inspect how it ranks student predictive factors
          </p>
          <FeatureImportanceBars
            items={evaluation.models[selectedModel].featureImportance.slice(0, 7)}
          />
        </div>
      </div>
    </div>
  );
};
