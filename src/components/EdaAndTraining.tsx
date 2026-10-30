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
        <div className="lg:col-span-7 glass-shell rounded-[24px] p-6">
          <div className="mb-3">
            <h3 className="text-base font-display font-semibold text-white">
              01. Final Grade (G3) Distribution
            </h3>
            <p className="text-xs text-[#9E90A8]">
              Cohort histogram across 0–20 grade points with G3 ≥ 10 pass boundary
            </p>
          </div>
          <GradeDistributionChart data={analytics.gradeDistribution} />
        </div>

        <div className="lg:col-span-5 glass-shell rounded-[24px] p-6">
          <div className="mb-3">
            <h3 className="text-base font-display font-semibold text-white">
              02. Study Time vs Final Grades
            </h3>
            <p className="text-xs text-[#9E90A8]">
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
      </div>

      {/* Row 2: Absences + Previous Failures + Gender */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="glass-shell rounded-[24px] p-6">
          <div className="mb-3">
            <h3 className="text-base font-display font-semibold text-white">
              03. Absences vs Performance
            </h3>
            <p className="text-xs text-[#9E90A8]">
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
            <h3 className="text-base font-display font-semibold text-white">
              04. Previous Failures vs Grades
            </h3>
            <p className="text-xs text-[#9E90A8]">
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

        <div className="glass-shell rounded-[24px] p-6">
          <div className="mb-3">
            <h3 className="text-base font-display font-semibold text-white">
              05. Gender-wise Performance
            </h3>
            <p className="text-xs text-[#9E90A8]">
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
            capsuleLabels={true}
          />
        </div>
      </div>

      {/* Row 3: Age Trajectory + Family Education + Internet Access */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4 glass-shell rounded-[24px] p-6">
          <div className="mb-3">
            <h3 className="text-base font-display font-semibold text-white">
              06. Age-wise Performance
            </h3>
            <p className="text-xs text-[#9E90A8]">
              Mean G3 trajectory from age 15 through 22
            </p>
          </div>
          <AgeTrajectoryChart data={analytics.agePerformance} />
        </div>

        <div className="lg:col-span-5 glass-shell rounded-[24px] p-6">
          <div className="mb-3">
            <h3 className="text-base font-display font-semibold text-white">
              07. Family Education vs Performance
            </h3>
            <p className="text-xs text-[#9E90A8]">
              Mother's (Medu) and Father's (Fedu) education level (0–4) vs G3
            </p>
          </div>
          <GroupedBarsChart
            categories={analytics.familyEduPerformance.map((d) => d.label)}
            seriesA={{
              name: 'Mother Ed (Medu)',
              values: analytics.familyEduPerformance.map((d) => d.motherAvgG3),
              color: '#F4B6D6',
            }}
            seriesB={{
              name: 'Father Ed (Fedu)',
              values: analytics.familyEduPerformance.map((d) => d.fatherAvgG3),
              color: '#A78BFA',
            }}
            maxVal={15}
          />
        </div>

        <div className="lg:col-span-3 glass-shell rounded-[24px] p-6">
          <div className="mb-3">
            <h3 className="text-base font-display font-semibold text-white">
              08. Internet Access
            </h3>
            <p className="text-xs text-[#9E90A8]">
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
            capsuleLabels={true}
          />
        </div>
      </div>

      {/* Row 4: Correlation Heatmap + Feature Importance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 glass-shell rounded-[24px] p-6">
          <h3 className="text-base font-display font-semibold text-white mb-1">
            09. Feature Correlation Heatmap
          </h3>
          <CorrelationHeatmap
            columns={dataset.correlationColumns}
            matrix={analytics.correlationMatrix}
          />
        </div>

        <div className="lg:col-span-4 glass-shell rounded-[24px] p-6">
          <div className="mb-4">
            <h3 className="text-base font-display font-semibold text-white">
              10. Feature Importance
            </h3>
            <p className="text-xs text-[#9E90A8]">
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
      {/* Dark Smoked-Glass Hyperparameter & Pipeline Bar */}
      <div className="glass-shell rounded-[24px] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
          <div>
            <h2 className="text-base font-display font-semibold text-white">
              Leakage-Free Python Training Pipeline
            </h2>
            <p className="text-xs text-[#9E90A8] mt-0.5">
              Train/Test split ({evaluation.trainSize} train / {evaluation.testSize} test rows) executes prior to fitting median/mode imputers and StandardScaler.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center p-1 rounded-full bg-white/[0.04] border border-white/10">
              <button
                onClick={() => onToggleIncludeGrades(true)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  includeGrades ? 'bg-[#F4B6D6] text-[#17101C]' : 'text-[#B8ABC2] hover:text-white'
                }`}
              >
                With G1 & G2
              </button>
              <button
                onClick={() => onToggleIncludeGrades(false)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  !includeGrades ? 'bg-[#F4B6D6] text-[#17101C]' : 'text-[#B8ABC2] hover:text-white'
                }`}
              >
                Without G1 & G2
              </button>
            </div>

            <button
              onClick={onRetrain}
              disabled={isTraining}
              className="px-4 py-2 rounded-full bg-[#4B2E42]/90 hover:bg-[#613C56] border border-[#F4B6D6]/45 text-[#FAD8EA] text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTraining ? 'animate-spin' : ''}`} />
              <span>{isTraining ? 'Training in Python...' : 'Retrain Models'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-5 text-xs">
          <div>
            <div className="flex justify-between font-medium text-[#D7CADF] mb-2">
              <span>Test Split Ratio</span>
              <span className="font-mono tabular-nums font-semibold text-[#F4B6D6]">
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
              className="w-full accent-[#F4B6D6]"
            />
          </div>

          <div>
            <div className="flex justify-between font-medium text-[#D7CADF] mb-2">
              <span>Tree Max Depth</span>
              <span className="font-mono tabular-nums font-semibold text-[#F4B6D6]">
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
              className="w-full accent-[#F4B6D6]"
            />
          </div>

          <div>
            <div className="flex justify-between font-medium text-[#D7CADF] mb-2">
              <span>RF Estimators</span>
              <span className="font-mono tabular-nums font-semibold text-[#F4B6D6]">
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
              className="w-full accent-[#F4B6D6]"
            />
          </div>

          <div>
            <div className="flex justify-between font-medium text-[#D7CADF] mb-1.5">
              <span>Random Seed</span>
              <span className="font-mono tabular-nums font-semibold text-[#F4B6D6]">
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
              className="w-full px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/12 font-mono tabular-nums text-white focus:outline-none focus:border-[#F4B6D6]/60"
            />
          </div>
        </div>
      </div>

      {/* Best Model Verdict Card */}
      <div className="glass-kpi rounded-[24px] p-6">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-full bg-[#F8DFEC] text-[#17101C] flex items-center justify-center shrink-0 mt-0.5">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="text-xs text-[#F4B6D6] font-medium">
              Best Held-Out Test Performance · {evaluation.modeLabel}
            </div>
            <h3 className="text-lg font-display font-bold text-white">
              Winner: {evaluation.bestModelName}
            </h3>
            <p className="text-xs sm:text-sm text-[#C7B9D1] leading-relaxed max-w-4xl">
              {evaluation.bestModelExplanation}
            </p>
          </div>
        </div>
      </div>

      {/* 3 Model Evaluation Smoked-Glass Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {modelList.map((m) => {
          const isBest = m.key === evaluation.bestModelKey;
          const isSelected = m.key === selectedModel;
          return (
            <div
              key={m.key}
              onClick={() => onSelectModel(m.key)}
              className={`rounded-[24px] p-6 cursor-pointer transition-all ${
                isSelected
                  ? 'glass-kpi border-[#F4B6D6]/55 shadow-[0_20px_50px_rgba(0,0,0,0.5)]'
                  : 'glass-shell hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-4">
                <h3 className="text-base font-display font-semibold text-white">{m.name}</h3>
                {isBest && (
                  <span className="text-[11px] font-medium text-[#F4B6D6]">
                    Top Test Score
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 py-3.5 border-y border-white/[0.08]">
                <div>
                  <div className="text-[11px] text-[#9E90A8]">Test R²</div>
                  <div className="text-2xl font-display font-semibold tabular-nums text-[#F4B6D6] mt-0.5">
                    {m.testMetrics.r2.toFixed(3)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-[#9E90A8]">MAE</div>
                  <div className="text-2xl font-display font-semibold tabular-nums text-white mt-0.5">
                    {m.testMetrics.mae.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-[#9E90A8]">RMSE</div>
                  <div className="text-2xl font-display font-semibold tabular-nums text-white mt-0.5">
                    {m.testMetrics.rmse.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-[#A89BB2] tabular-nums">
                <span>Train R²: {m.trainMetrics.r2.toFixed(3)}</span>
                <span>Residual σ: {m.residualStd.toFixed(2)} pts</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Model Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass-shell rounded-[24px] p-6">
          <h3 className="text-base font-display font-semibold text-white mb-1">
            Model Comparison: Test Error (MAE vs RMSE, Lower is Better)
          </h3>
          <p className="text-xs text-[#9E90A8] mb-3">
            Average prediction error in grade points (out of 20) on held-out test students
          </p>
          <GroupedBarsChart
            categories={modelList.map((m) => m.name.replace(' Regressor', ''))}
            seriesA={{
              name: 'MAE (pts)',
              values: modelList.map((m) => Number(m.testMetrics.mae.toFixed(2))),
              color: '#F4B6D6',
            }}
            seriesB={{
              name: 'RMSE (pts)',
              values: modelList.map((m) => Number(m.testMetrics.rmse.toFixed(2))),
              color: '#A78BFA',
            }}
            maxVal={5}
          />
        </div>

        <div className="glass-shell rounded-[24px] p-6">
          <h3 className="text-base font-display font-semibold text-white mb-1">
            Selected Model Top Drivers — {evaluation.models[selectedModel].name}
          </h3>
          <p className="text-xs text-[#9E90A8] mb-4">
            Click any model card above to compare how it weights student features
          </p>
          <FeatureImportanceBars items={evaluation.models[selectedModel].featureImportance.slice(0, 7)} />
        </div>
      </div>
    </div>
  );
};
