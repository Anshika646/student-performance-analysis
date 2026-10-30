import React from 'react';
import { RefreshCw, Trophy } from 'lucide-react';
import { DatasetPayload, EvaluationPayload, ModelKey } from '../types';
import {
  AgeTrajectoryChart,
  CorrelationHeatmap,
  FeatureImportanceBars,
  GradeDistributionChart,
  GroupedBarsChart,
  PeriodProgressionChart,
  SculptedBarChart,
} from './Charts';

interface EdaProps {
  dataset: DatasetPayload;
  analytics: ReturnType<typeof import('../utils/analytics').computeDynamicAnalytics>;
  evaluation: EvaluationPayload;
}

export const EdaPage: React.FC<EdaProps> = ({ dataset, analytics, evaluation }) => {
  const bestModel = evaluation.models[evaluation.bestModelKey];

  return (
    <div className="space-y-5">
      {/* Row 1: Grade Distribution + Period Trajectory (G1 -> G2 -> G3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 glass-shell rounded-[24px] p-6">
          <div className="mb-3">
            <h3 className="text-base font-display font-semibold text-[#FAF6FA]">
              01. Final Grade (G3) Frosted Histogram
            </h3>
            <p className="text-xs text-[#95899E]">
              Cohort distribution across 0–20 grade points with G3 ≥ 10 pass boundary
            </p>
          </div>
          <GradeDistributionChart data={analytics.gradeDistribution} />
        </div>

        <div className="lg:col-span-5 glass-shell rounded-[24px] p-6">
          <div className="mb-3">
            <h3 className="text-base font-display font-semibold text-[#FAF6FA]">
              02. Period Trajectory (G1 → G2 → G3)
            </h3>
            <p className="text-xs text-[#95899E]">
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

      {/* Row 2: Study Time + Absences + Previous Failures */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="glass-shell rounded-[24px] p-6">
          <div className="mb-3">
            <h3 className="text-base font-display font-semibold text-[#FAF6FA]">
              03. Study Time vs Final Grades
            </h3>
            <p className="text-xs text-[#95899E]">
              Mean G3 across weekly self-study duration categories
            </p>
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

        <div className="glass-shell rounded-[24px] p-6">
          <div className="mb-3">
            <h3 className="text-base font-display font-semibold text-[#FAF6FA]">
              04. Absences vs Performance
            </h3>
            <p className="text-xs text-[#95899E]">
              Average G3 across cumulative school absence brackets
            </p>
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

        <div className="glass-shell rounded-[24px] p-6">
          <div className="mb-3">
            <h3 className="text-base font-display font-semibold text-[#FAF6FA]">
              05. Previous Failures vs Grades
            </h3>
            <p className="text-xs text-[#95899E]">
              Impact of prior class failures on final G3 achievement
            </p>
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
      </div>

      {/* Row 3: Age Trajectory + Family Education + Gender & Internet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4 glass-shell rounded-[24px] p-6">
          <div className="mb-3">
            <h3 className="text-base font-display font-semibold text-[#FAF6FA]">
              06. Age-wise Performance
            </h3>
            <p className="text-xs text-[#95899E]">
              Mean G3 trajectory from age 15 through 22
            </p>
          </div>
          <AgeTrajectoryChart data={analytics.agePerformance} />
        </div>

        <div className="lg:col-span-5 glass-shell rounded-[24px] p-6">
          <div className="mb-3">
            <h3 className="text-base font-display font-semibold text-[#FAF6FA]">
              07. Family Education vs Performance
            </h3>
            <p className="text-xs text-[#95899E]">
              Mother's (Medu) and Father's (Fedu) education level (0–4) vs G3
            </p>
          </div>
          <GroupedBarsChart
            categories={analytics.familyEduPerformance.map((d) => d.label)}
            seriesA={{
              name: 'Mother Ed (Medu)',
              values: analytics.familyEduPerformance.map((d) => d.motherAvgG3),
            }}
            seriesB={{
              name: 'Father Ed (Fedu)',
              values: analytics.familyEduPerformance.map((d) => d.fatherAvgG3),
            }}
            maxVal={15}
          />
        </div>

        <div className="lg:col-span-3 glass-shell rounded-[24px] p-6">
          <div className="mb-3">
            <h3 className="text-base font-display font-semibold text-[#FAF6FA]">
              08. Gender & Connectivity
            </h3>
            <p className="text-xs text-[#95899E]">
              Mean G3 across gender & internet access
            </p>
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
        <div className="lg:col-span-8 glass-shell rounded-[24px] p-6">
          <h3 className="text-base font-display font-semibold text-[#FAF6FA] mb-1">
            09. Feature Correlation Heatmap
          </h3>
          <CorrelationHeatmap
            columns={dataset.correlationColumns}
            matrix={analytics.correlationMatrix}
          />
        </div>

        <div className="lg:col-span-4 glass-shell rounded-[24px] p-6">
          <div className="mb-4">
            <h3 className="text-base font-display font-semibold text-[#FAF6FA]">
              10. Feature Importance
            </h3>
            <p className="text-xs text-[#95899E]">
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
  const modelList = [
    evaluation.models.random_forest,
    evaluation.models.gradient_boosting,
    evaluation.models.linear_regression,
    evaluation.models.decision_tree,
  ];

  return (
    <div className="space-y-5">
      {/* Dark Smoked-Glass Hyperparameter & Pipeline Bar */}
      <div className="glass-shell rounded-[24px] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
          <div>
            <h2 className="text-base font-display font-semibold text-[#FAF6FA]">
              Leakage-Free Python Training & 5-Fold Cross-Validation Pipeline
            </h2>
            <p className="text-xs text-[#95899E] mt-0.5">
              Train/Test split ({evaluation.trainSize} train / {evaluation.testSize} test rows) executes prior to fitting median/mode imputers and StandardScaler.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center p-1 rounded-full bg-white/[0.03] border border-white/[0.08]">
              <button
                onClick={() => onToggleIncludeGrades(true)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  includeGrades ? 'glass-pill-active font-semibold' : 'text-[#A89BB2] hover:text-white'
                }`}
              >
                With G1 & G2
              </button>
              <button
                onClick={() => onToggleIncludeGrades(false)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  !includeGrades ? 'glass-pill-active font-semibold' : 'text-[#A89BB2] hover:text-white'
                }`}
              >
                Without G1 & G2
              </button>
            </div>

            <button
              onClick={onRetrain}
              disabled={isTraining}
              className="glass-cta px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-50 whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTraining ? 'animate-spin' : ''}`} />
              <span>{isTraining ? 'Training in Python...' : 'Retrain All 4 Models'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-5 text-xs">
          <div>
            <div className="flex justify-between font-medium text-[#D4C9DC] mb-2">
              <span>Test Split Ratio</span>
              <span className="font-mono tabular-nums font-semibold text-[#EAD0DF]">
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
              className="w-full accent-[#DFBACC]"
            />
          </div>

          <div>
            <div className="flex justify-between font-medium text-[#D4C9DC] mb-2">
              <span>Tree Max Depth</span>
              <span className="font-mono tabular-nums font-semibold text-[#EAD0DF]">
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
              className="w-full accent-[#DFBACC]"
            />
          </div>

          <div>
            <div className="flex justify-between font-medium text-[#D4C9DC] mb-2">
              <span>Ensemble Trees</span>
              <span className="font-mono tabular-nums font-semibold text-[#EAD0DF]">
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
              className="w-full accent-[#DFBACC]"
            />
          </div>

          <div>
            <div className="flex justify-between font-medium text-[#D4C9DC] mb-1.5">
              <span>Random Seed</span>
              <span className="font-mono tabular-nums font-semibold text-[#EAD0DF]">
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
              className="w-full px-3 py-1.5 rounded-xl bg-white/[0.035] border border-white/12 font-mono tabular-nums text-white focus:outline-none focus:border-white/30"
            />
          </div>
        </div>
      </div>

      {/* Best Model Verdict Card */}
      <div className="glass-kpi rounded-[24px] p-6">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-full bg-[#EFE0E8] text-[#17111C] flex items-center justify-center shrink-0 mt-0.5">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="text-xs text-[#DFC0D1] font-medium">
              Best Held-Out Generalization · {evaluation.modeLabel}
            </div>
            <h3 className="text-lg font-display font-semibold text-[#FAF6FA]">
              Winner: {evaluation.bestModelName}
            </h3>
            <p className="text-xs sm:text-sm text-[#C4B8CD] leading-relaxed max-w-4xl">
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
                  ? 'glass-kpi border-[#EAD0DF]/45 shadow-[0_20px_50px_rgba(0,0,0,0.55)]'
                  : 'glass-shell hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <h3 className="text-sm font-display font-semibold text-[#FAF6FA] truncate">
                  {m.name.replace(' Regressor', '')}
                </h3>
                {isBest && (
                  <span className="text-[10.5px] font-medium text-[#E8CEDC] shrink-0">
                    Best Test R²
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/[0.08]">
                <div>
                  <div className="text-[10.5px] text-[#95899E]">Test R²</div>
                  <div className="text-xl font-display font-semibold tabular-nums text-[#F4E6EE] mt-0.5">
                    {m.testMetrics.r2.toFixed(3)}
                  </div>
                </div>
                <div>
                  <div className="text-[10.5px] text-[#95899E]">MAE</div>
                  <div className="text-xl font-display font-semibold tabular-nums text-[#FAF6FA] mt-0.5">
                    {m.testMetrics.mae.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-[10.5px] text-[#95899E]">RMSE</div>
                  <div className="text-xl font-display font-semibold tabular-nums text-[#FAF6FA] mt-0.5">
                    {m.testMetrics.rmse.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="mt-3 space-y-1 text-[11px] text-[#9E93A6] font-mono tabular-nums">
                <div className="flex justify-between">
                  <span>5-Fold CV R²:</span>
                  <span className="text-[#E8DCEB]">
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
          <h3 className="text-base font-display font-semibold text-[#FAF6FA] mb-1">
            Model Error Comparison (MAE vs RMSE, Lower is Better)
          </h3>
          <p className="text-xs text-[#95899E] mb-3">
            Average prediction error in grade points (out of 20) across all 4 supervised algorithms
          </p>
          <GroupedBarsChart
            categories={modelList.map((m) =>
              m.name
                .replace(' Regressor', '')
                .replace('Gradient Boosting', 'Grad. Boost')
                .replace('Linear Regression', 'Linear Reg.')
            )}
            seriesA={{
              name: 'Test MAE (pts)',
              values: modelList.map((m) => Number(m.testMetrics.mae.toFixed(2))),
            }}
            seriesB={{
              name: 'Test RMSE (pts)',
              values: modelList.map((m) => Number(m.testMetrics.rmse.toFixed(2))),
            }}
            maxVal={5}
          />
        </div>

        <div className="glass-shell rounded-[24px] p-6">
          <h3 className="text-base font-display font-semibold text-[#FAF6FA] mb-1">
            Selected Model Feature Weights — {evaluation.models[selectedModel].name}
          </h3>
          <p className="text-xs text-[#95899E] mb-4">
            Click any algorithm card above to inspect how it ranks student predictive factors
          </p>
          <FeatureImportanceBars items={evaluation.models[selectedModel].featureImportance.slice(0, 7)} />
        </div>
      </div>
    </div>
  );
};
