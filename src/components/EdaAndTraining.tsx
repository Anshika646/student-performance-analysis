import React from 'react';
import { RefreshCw, Trophy } from 'lucide-react';
import { DatasetPayload, EvaluationPayload, ModelKey } from '../types';
import {
  AgeTrajectoryChart,
  CorrelationHeatmap,
  FeatureImportanceBars,
  GradeDistributionChart,
  GroupedBarsChart,
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
      {/* Row 1: Grade Distribution + Study Time vs Grades */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 rounded-[24px] bg-gradient-to-br from-[#251E29] to-[#1B151E] border border-white/15 p-6 text-white">
          <div className="mb-3">
            <h3 className="text-base font-display font-semibold">
              01. Final Grade (G3) Distribution
            </h3>
            <p className="text-xs text-[#B8AABF]">
              Cohort histogram across 0–20 grade points with G3 ≥ 10 pass boundary
            </p>
          </div>
          <GradeDistributionChart data={analytics.gradeDistribution} />
        </div>

        <div className="lg:col-span-5 rounded-[24px] bg-gradient-to-br from-[#251E29] to-[#1B151E] border border-white/15 p-6 text-white">
          <div className="mb-3">
            <h3 className="text-base font-display font-semibold">
              02. Study Time vs Final Grades
            </h3>
            <p className="text-xs text-[#B8AABF]">
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
          />
        </div>
      </div>

      {/* Row 2: Absences + Previous Failures + Gender */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="rounded-[24px] bg-gradient-to-br from-[#251E29] to-[#1B151E] border border-white/15 p-6 text-white">
          <div className="mb-3">
            <h3 className="text-base font-display font-semibold">
              03. Absences vs Performance
            </h3>
            <p className="text-xs text-[#B8AABF]">
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

        <div className="rounded-[24px] bg-gradient-to-br from-[#251E29] to-[#1B151E] border border-white/15 p-6 text-white">
          <div className="mb-3">
            <h3 className="text-base font-display font-semibold">
              04. Previous Failures vs Grades
            </h3>
            <p className="text-xs text-[#B8AABF]">
              Steep negative impact of prior class failures on G3
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
          />
        </div>

        <div className="rounded-[24px] bg-gradient-to-br from-[#251E29] to-[#1B151E] border border-white/15 p-6 text-white">
          <div className="mb-3">
            <h3 className="text-base font-display font-semibold">
              05. Gender-wise Performance
            </h3>
            <p className="text-xs text-[#B8AABF]">
              Comparison of mean final grade and pass rate by gender
            </p>
          </div>
          <SculptedBarChart
            data={analytics.genderPerformance.map((d) => ({
              label: d.label,
              value: d.avgG3,
              count: d.count,
              subtext: `Avg ${d.avgG3}/20 · Pass ${d.passRate}%`,
            }))}
            maxVal={15}
            accent="cyan"
          />
        </div>
      </div>

      {/* Row 3: Age Trajectory + Family Education + Internet Access */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4 rounded-[24px] bg-gradient-to-br from-[#251E29] to-[#1B151E] border border-white/15 p-6 text-white">
          <div className="mb-3">
            <h3 className="text-base font-display font-semibold">
              06. Age-wise Performance
            </h3>
            <p className="text-xs text-[#B8AABF]">
              Mean G3 trajectory from age 15 through 22
            </p>
          </div>
          <AgeTrajectoryChart data={analytics.agePerformance} />
        </div>

        <div className="lg:col-span-5 rounded-[24px] bg-gradient-to-br from-[#251E29] to-[#1B151E] border border-white/15 p-6 text-white">
          <div className="mb-3">
            <h3 className="text-base font-display font-semibold">
              07. Family Education vs Performance
            </h3>
            <p className="text-xs text-[#B8AABF]">
              Mother's (Medu) and Father's (Fedu) education level (0–4) vs G3
            </p>
          </div>
          <GroupedBarsChart
            categories={analytics.familyEduPerformance.map((d) => d.label)}
            seriesA={{
              name: 'Mother Ed (Medu)',
              values: analytics.familyEduPerformance.map((d) => d.motherAvgG3),
              color: '#F5B2D4',
            }}
            seriesB={{
              name: 'Father Ed (Fedu)',
              values: analytics.familyEduPerformance.map((d) => d.fatherAvgG3),
              color: '#A78BFA',
            }}
            maxVal={15}
          />
        </div>

        <div className="lg:col-span-3 rounded-[24px] bg-gradient-to-br from-[#251E29] to-[#1B151E] border border-white/15 p-6 text-white">
          <div className="mb-3">
            <h3 className="text-base font-display font-semibold">
              08. Internet Access
            </h3>
            <p className="text-xs text-[#B8AABF]">
              Home connectivity vs final G3
            </p>
          </div>
          <SculptedBarChart
            data={analytics.internetPerformance.map((d) => ({
              label: d.label,
              value: d.avgG3,
              count: d.count,
              subtext: `Avg ${d.avgG3}/20 · Pass ${d.passRate}%`,
            }))}
            maxVal={15}
            accent="rose"
          />
        </div>
      </div>

      {/* Row 4: Correlation Heatmap + Feature Importance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 rounded-[24px] bg-gradient-to-br from-[#251E29] to-[#1B151E] border border-white/15 p-6 text-white">
          <h3 className="text-base font-display font-semibold mb-1">
            09. Feature Correlation Heatmap
          </h3>
          <CorrelationHeatmap
            columns={dataset.correlationColumns}
            matrix={analytics.correlationMatrix}
          />
        </div>

        <div className="lg:col-span-4 rounded-[24px] bg-gradient-to-br from-[#251E29] to-[#1B151E] border border-white/15 p-6 text-white">
          <div className="mb-4">
            <h3 className="text-base font-display font-semibold">
              10. Feature Importance
            </h3>
            <p className="text-xs text-[#B8AABF]">
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
    evaluation.models.linear_regression,
    evaluation.models.decision_tree,
  ];

  return (
    <div className="space-y-5">
      {/* Hyperparameter & Mode Configuration Glass Strip */}
      <div className="rounded-[22px] bg-white/80 backdrop-blur-xl border border-white/95 p-5 shadow-[0_12px_32px_rgba(35,29,37,0.05)]">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#EADCE5]">
          <div>
            <h2 className="text-base font-display font-bold text-[#1F1823]">
              Leakage-Free Python Training Pipeline
            </h2>
            <p className="text-xs text-[#6E5D76] mt-0.5">
              Train/Test split ({evaluation.trainSize} train / {evaluation.testSize} test rows) executes prior to fitting median/mode imputers and StandardScaler.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center p-1 rounded-xl bg-[#F4E4EE]">
              <button
                onClick={() => onToggleIncludeGrades(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  includeGrades ? 'bg-[#221B25] text-white' : 'text-[#4C3B54] hover:text-[#1F1823]'
                }`}
              >
                Mode 1: With G1 & G2
              </button>
              <button
                onClick={() => onToggleIncludeGrades(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  !includeGrades ? 'bg-[#221B25] text-white' : 'text-[#4C3B54] hover:text-[#1F1823]'
                }`}
              >
                Mode 2: Without G1 & G2
              </button>
            </div>

            <button
              onClick={onRetrain}
              disabled={isTraining}
              className="px-4 py-2 rounded-xl bg-[#221B25] hover:bg-[#332838] text-white text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTraining ? 'animate-spin' : ''}`} />
              <span>{isTraining ? 'Training in Python...' : 'Retrain Models'}</span>
            </button>
          </div>
        </div>

        {/* Hyperparameter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-4 text-xs">
          <div>
            <div className="flex justify-between font-medium text-[#3B2E41] mb-1.5">
              <span>Test Split Ratio</span>
              <span className="font-mono tabular-nums font-semibold">
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
              className="w-full accent-[#D879AA]"
            />
          </div>

          <div>
            <div className="flex justify-between font-medium text-[#3B2E41] mb-1.5">
              <span>Tree Max Depth</span>
              <span className="font-mono tabular-nums font-semibold">{hyperparams.maxDepth}</span>
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
              className="w-full accent-[#D879AA]"
            />
          </div>

          <div>
            <div className="flex justify-between font-medium text-[#3B2E41] mb-1.5">
              <span>RF Trees (n_estimators)</span>
              <span className="font-mono tabular-nums font-semibold">{hyperparams.nEstimators}</span>
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
              className="w-full accent-[#D879AA]"
            />
          </div>

          <div>
            <div className="flex justify-between font-medium text-[#3B2E41] mb-1.5">
              <span>Random Seed</span>
              <span className="font-mono tabular-nums font-semibold">{hyperparams.randomState}</span>
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
              className="w-full px-3 py-1 rounded-lg bg-white border border-[#DFC9D6] font-mono tabular-nums text-[#1F1823]"
            />
          </div>
        </div>
      </div>

      {/* Best Model Analytical Verdict */}
      <div className="rounded-[24px] bg-gradient-to-r from-[#261E2B] via-[#211A26] to-[#2B2030] border border-white/15 p-6 text-white">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-[#FAD6E8] text-[#1F1823] flex items-center justify-center shrink-0 mt-0.5">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="text-xs text-[#FAD6E8] font-medium">
              Best Test-Set Generalization · {evaluation.modeLabel}
            </div>
            <h3 className="text-lg font-display font-bold text-white">
              Winner: {evaluation.bestModelName}
            </h3>
            <p className="text-sm text-[#DDD2E4] leading-relaxed max-w-4xl">
              {evaluation.bestModelExplanation}
            </p>
          </div>
        </div>
      </div>

      {/* 3 Model Evaluation Cards + Comparison Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {modelList.map((m) => {
          const isBest = m.key === evaluation.bestModelKey;
          const isSelected = m.key === selectedModel;
          return (
            <div
              key={m.key}
              onClick={() => onSelectModel(m.key)}
              className={`rounded-[24px] p-6 cursor-pointer transition-all border ${
                isSelected
                  ? 'bg-gradient-to-b from-[#2C2232] to-[#1D1621] border-[#FAD6E8]/60 shadow-[0_20px_48px_rgba(28,20,33,0.22)]'
                  : 'bg-[#221B25] border-white/10 hover:border-white/25'
              } text-white`}
            >
              <div className="flex items-center justify-between gap-2 mb-4">
                <h3 className="text-base font-display font-semibold">{m.name}</h3>
                {isBest && (
                  <span className="text-xs font-medium text-[#FAD6E8]">
                    Best on Test Split
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 py-3 border-y border-white/10">
                <div>
                  <div className="text-[11px] text-[#B8AABF]">Test R²</div>
                  <div className="text-2xl font-display font-bold tabular-nums text-[#FAD6E8] mt-0.5">
                    {m.testMetrics.r2.toFixed(3)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-[#B8AABF]">MAE</div>
                  <div className="text-2xl font-display font-bold tabular-nums text-white mt-0.5">
                    {m.testMetrics.mae.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-[#B8AABF]">RMSE</div>
                  <div className="text-2xl font-display font-bold tabular-nums text-white mt-0.5">
                    {m.testMetrics.rmse.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-[#C8BBD0] tabular-nums">
                <span>Train R²: {m.trainMetrics.r2.toFixed(3)}</span>
                <span>Residual σ: {m.residualStd.toFixed(2)} pts</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Model Error & R² Visual Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-[24px] bg-gradient-to-br from-[#251E29] to-[#1B151E] border border-white/15 p-6 text-white">
          <h3 className="text-base font-display font-semibold mb-1">
            Model Comparison: Test Error (MAE vs RMSE, Lower is Better)
          </h3>
          <p className="text-xs text-[#B8AABF] mb-3">
            Average prediction error in grade points (out of 20) on held-out test students
          </p>
          <GroupedBarsChart
            categories={modelList.map((m) => m.name.replace(' Regressor', ''))}
            seriesA={{
              name: 'MAE (pts)',
              values: modelList.map((m) => Number(m.testMetrics.mae.toFixed(2))),
              color: '#FAD6E8',
            }}
            seriesB={{
              name: 'RMSE (pts)',
              values: modelList.map((m) => Number(m.testMetrics.rmse.toFixed(2))),
              color: '#A78BFA',
            }}
            maxVal={5}
          />
        </div>

        <div className="rounded-[24px] bg-gradient-to-br from-[#251E29] to-[#1B151E] border border-white/15 p-6 text-white">
          <h3 className="text-base font-display font-semibold mb-1">
            Selected Model Top Drivers — {evaluation.models[selectedModel].name}
          </h3>
          <p className="text-xs text-[#B8AABF] mb-4">
            Click any model card above to compare how it weights student features
          </p>
          <FeatureImportanceBars items={evaluation.models[selectedModel].featureImportance.slice(0, 7)} />
        </div>
      </div>
    </div>
  );
};
