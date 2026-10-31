import React, { useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Code2,
  Download,
  FileDown,
  Lightbulb,
  Play,
  ShieldAlert,
  Sliders,
  Sparkles,
  X,
} from 'lucide-react';
import {
  AtRiskStudent,
  EvaluationPayload,
  ModelKey,
  PredictionPayload,
  PythonSourceFile,
  StudentInputProfile,
} from '../types';
import { EDU_LABELS, exportRowsToCsv, STUDY_LABELS } from '../utils/analytics';
import {
  ActualVsPredictedScatter,
  FeatureImportanceBars,
  GradeGauge,
  ResidualHistogram,
  SculptedBarChart,
} from './Charts';

interface PredictionPageProps {
  studentInput: StudentInputProfile;
  onChangeInput: (next: StudentInputProfile) => void;
  includeGrades: boolean;
  onToggleIncludeGrades: (val: boolean) => void;
  selectedModel: ModelKey;
  onSelectModel: (key: ModelKey) => void;
  onRunPredict: (overrideProfile?: StudentInputProfile) => void;
  prediction: PredictionPayload | null;
  isPredicting: boolean;
}

const PRESETS: { name: string; profile: StudentInputProfile }[] = [
  {
    name: 'High Achiever',
    profile: {
      age: 16,
      sex: 'F',
      studytime: 4,
      absences: 2,
      failures: 0,
      Medu: 4,
      Fedu: 4,
      internet: 'yes',
      schoolsup: 'no',
      G1: 16,
      G2: 17,
    },
  },
  {
    name: 'Cohort Typical',
    profile: {
      age: 17,
      sex: 'M',
      studytime: 2,
      absences: 4,
      failures: 0,
      Medu: 3,
      Fedu: 2,
      internet: 'yes',
      schoolsup: 'no',
      G1: 11,
      G2: 12,
    },
  },
  {
    name: 'At-Risk Profile',
    profile: {
      age: 18,
      sex: 'M',
      studytime: 1,
      absences: 16,
      failures: 2,
      Medu: 1,
      Fedu: 1,
      internet: 'no',
      schoolsup: 'no',
      G1: 7,
      G2: 6,
    },
  },
];

export const PredictionPage: React.FC<PredictionPageProps> = ({
  studentInput,
  onChangeInput,
  includeGrades,
  onToggleIncludeGrades,
  selectedModel,
  onSelectModel,
  onRunPredict,
  prediction,
  isPredicting,
}) => {
  const [whatIfTab, setWhatIfTab] = useState<'study' | 'absences'>('study');

  const updateField = <K extends keyof StudentInputProfile>(
    key: K,
    val: StudentInputProfile[K]
  ) => {
    onChangeInput({ ...studentInput, [key]: val });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
      {/* Left Column: Smoked-Glass Student Profile Form */}
      <div className="xl:col-span-6 glass-shell rounded-[24px] p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
          <div>
            <h2 className="text-lg font-display font-bold text-[#FDF8FC]">
              Student Input Parameters
            </h2>
            <p className="text-xs text-[#BDB4C3]">
              Configure demographics, study habits, and optional prior grades
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => {
                  onChangeInput(p.profile);
                  onRunPredict(p.profile);
                }}
                className="glass-control px-3 py-1.5 rounded-full text-[11px] font-medium text-[#FDF8FC] whitespace-nowrap"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Mode & Algorithm Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#BDB4C3] mb-1.5">
              Prediction Mode
            </label>
            <div className="grid grid-cols-2 p-1 rounded-full bg-white/[0.04] border border-[rgba(255,210,235,0.20)]">
              <button
                type="button"
                onClick={() => onToggleIncludeGrades(true)}
                className={`py-1.5 rounded-full text-xs font-medium transition-all ${
                  includeGrades
                    ? 'glass-pill-active font-semibold'
                    : 'text-[#BDB4C3] hover:text-white'
                }`}
              >
                With G1 & G2
              </button>
              <button
                type="button"
                onClick={() => onToggleIncludeGrades(false)}
                className={`py-1.5 rounded-full text-xs font-medium transition-all ${
                  !includeGrades
                    ? 'glass-pill-active font-semibold'
                    : 'text-[#BDB4C3] hover:text-white'
                }`}
              >
                Without G1 & G2
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#BDB4C3] mb-1.5">
              Trained ML Algorithm
            </label>
            <select
              value={selectedModel}
              onChange={(e) => onSelectModel(e.target.value as ModelKey)}
              className="glass-control w-full px-3.5 py-2 rounded-full text-xs font-medium"
            >
              <option value="random_forest">Random Forest Regressor</option>
              <option value="gradient_boosting">Gradient Boosting Regressor</option>
              <option value="linear_regression">Linear Regression</option>
              <option value="decision_tree">Decision Tree Regressor</option>
            </select>
          </div>
        </div>

        {includeGrades && (
          <div className="glass-subcard rounded-[20px] p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[#BDB4C3]">First Period Grade (G1)</span>
                <span className="font-mono tabular-nums font-semibold text-[#F8C6DF]">
                  {studentInput.G1} / 20
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={20}
                value={studentInput.G1}
                onChange={(e) => updateField('G1', Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[#BDB4C3]">Second Period Grade (G2)</span>
                <span className="font-mono tabular-nums font-semibold text-[#F8C6DF]">
                  {studentInput.G2} / 20
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={20}
                value={studentInput.G2}
                onChange={(e) => updateField('G2', Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Core Demographic & Habit Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <div className="flex justify-between font-medium text-[#BDB4C3] mb-1.5">
              <span>Student Age</span>
              <span className="font-mono tabular-nums text-[#FDF8FC]">{studentInput.age} yrs</span>
            </div>
            <input
              type="range"
              min={15}
              max={22}
              value={studentInput.age}
              onChange={(e) => updateField('age', Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between font-medium text-[#BDB4C3] mb-1.5">
              <span>Weekly / Term Absences</span>
              <span className="font-mono tabular-nums text-[#FDF8FC]">
                {studentInput.absences} days
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={60}
              value={studentInput.absences}
              onChange={(e) => updateField('absences', Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block font-medium text-[#BDB4C3] mb-1.5">Gender</label>
            <div className="grid grid-cols-2 gap-2">
              {(['F', 'M'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => updateField('sex', g)}
                  className={`py-2 rounded-full font-medium transition-all ${
                    studentInput.sex === g
                      ? 'glass-pill-active font-semibold'
                      : 'glass-control text-[#BDB4C3]'
                  }`}
                >
                  {g === 'F' ? 'Female (F)' : 'Male (M)'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-medium text-[#BDB4C3] mb-1.5">
              Study Hours Category
            </label>
            <select
              value={studentInput.studytime}
              onChange={(e) => updateField('studytime', Number(e.target.value))}
              className="glass-control w-full px-3.5 py-2 rounded-full font-medium"
            >
              {[1, 2, 3, 4].map((st) => (
                <option key={st} value={st}>
                  Category {st}: {STUDY_LABELS[st]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-[#BDB4C3] mb-1.5">
              Previous Class Failures
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[0, 1, 2, 3].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => updateField('failures', f)}
                  className={`py-2 rounded-full font-mono font-medium transition-all ${
                    studentInput.failures === f
                      ? 'glass-pill-active font-semibold'
                      : 'glass-control text-[#BDB4C3]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-medium text-[#BDB4C3] mb-1.5">
              Mother's Education (Medu)
            </label>
            <select
              value={studentInput.Medu}
              onChange={(e) => updateField('Medu', Number(e.target.value))}
              className="glass-control w-full px-3.5 py-2 rounded-full font-medium"
            >
              {[0, 1, 2, 3, 4].map((lvl) => (
                <option key={lvl} value={lvl}>
                  {EDU_LABELS[lvl]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-[#BDB4C3] mb-1.5">
              Father's Education (Fedu)
            </label>
            <select
              value={studentInput.Fedu}
              onChange={(e) => updateField('Fedu', Number(e.target.value))}
              className="glass-control w-full px-3.5 py-2 rounded-full font-medium"
            >
              {[0, 1, 2, 3, 4].map((lvl) => (
                <option key={lvl} value={lvl}>
                  {EDU_LABELS[lvl]}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-medium text-[#BDB4C3] mb-1.5">Internet Access</label>
              <button
                type="button"
                onClick={() =>
                  updateField('internet', studentInput.internet === 'yes' ? 'no' : 'yes')
                }
                className={`w-full py-2 rounded-full font-medium transition-all ${
                  studentInput.internet === 'yes'
                    ? 'glass-pill-active font-semibold'
                    : 'glass-control text-[#BDB4C3]'
                }`}
              >
                {studentInput.internet === 'yes' ? 'Yes (Home)' : 'No'}
              </button>
            </div>

            <div>
              <label className="block font-medium text-[#BDB4C3] mb-1.5">School Support</label>
              <button
                type="button"
                onClick={() =>
                  updateField('schoolsup', studentInput.schoolsup === 'yes' ? 'no' : 'yes')
                }
                className={`w-full py-2 rounded-full font-medium transition-all ${
                  studentInput.schoolsup === 'yes'
                    ? 'glass-pill-active font-semibold'
                    : 'glass-control text-[#BDB4C3]'
                }`}
              >
                {studentInput.schoolsup === 'yes' ? 'Yes (Extra)' : 'No'}
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onRunPredict()}
          disabled={isPredicting}
          className="glass-cta w-full py-3.5 rounded-full text-sm font-display font-bold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{isPredicting ? 'Executing Python Model...' : 'Predict Final Grade (G3)'}</span>
        </button>
      </div>

      {/* Right Column: Live ML Prediction Result, Gauge, What-If Simulator & Improvement Plan */}
      <div className="xl:col-span-6 space-y-5">
        {prediction ? (
          <div className="glass-shell rounded-[24px] p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
              <div>
                <div className="text-xs text-[#BDB4C3]">
                  Active Model: {prediction.selectedModelName}
                </div>
                <h3 className="text-xl font-display font-bold text-[#FDF8FC] mt-0.5">
                  {prediction.classification.category}
                </h3>
              </div>

              <div className="text-right text-xs tabular-nums">
                <div className="text-[#928997]">
                  vs Cohort Avg ({prediction.cohortAverage}/20)
                </div>
                <div
                  className={`font-mono font-semibold text-sm ${
                    prediction.deltaVsCohort >= 0 ? 'text-[#FAD9EA]' : 'text-[#D6E8BE]'
                  }`}
                >
                  {prediction.deltaVsCohort >= 0 ? '+' : ''}
                  {prediction.deltaVsCohort} pts
                </div>
              </div>
            </div>

            {/* Gauge + 4-Model Consensus */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="sm:col-span-7 flex justify-center">
                <GradeGauge score={prediction.predictedGrade} />
              </div>

              <div className="sm:col-span-5 space-y-2 glass-subcard rounded-[20px] p-4">
                <div className="text-xs font-semibold text-[#F8C6DF]">4-Model Consensus</div>
                {(
                  [
                    ['random_forest', 'Random Forest'],
                    ['gradient_boosting', 'Grad. Boosting'],
                    ['linear_regression', 'Linear Reg.'],
                    ['decision_tree', 'Decision Tree'],
                  ] as const
                ).map(([k, label]) => (
                  <div
                    key={k}
                    className="flex items-center justify-between text-xs py-1 border-b border-white/[0.06] last:border-0"
                  >
                    <span
                      className={
                        k === prediction.selectedModelKey
                          ? 'text-[#FDF8FC] font-semibold'
                          : 'text-[#BDB4C3]'
                      }
                    >
                      {label}
                    </span>
                    <span className="font-mono tabular-nums font-medium text-[#FDF8FC]">
                      {prediction.allModelPredictions[k]?.toFixed(2)} / 20
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive What-If Counterfactual Sensitivity Chart */}
            {prediction.whatIfStudy && prediction.whatIfStudy.length > 0 && (
              <div className="glass-subcard rounded-[20px] p-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-[#F5A6CC]" />
                    <h4 className="text-xs font-semibold text-[#FDF8FC]">
                      Counterfactual What-If Sensitivity
                    </h4>
                  </div>
                  <div className="flex items-center gap-1 p-0.5 rounded-full bg-white/[0.04] border border-[rgba(255,210,235,0.18)] text-[10.5px]">
                    <button
                      type="button"
                      onClick={() => setWhatIfTab('study')}
                      className={`px-2.5 py-1 rounded-full transition-all ${
                        whatIfTab === 'study'
                          ? 'glass-pill-active font-medium'
                          : 'text-[#BDB4C3]'
                      }`}
                    >
                      Vary Study Hours
                    </button>
                    <button
                      type="button"
                      onClick={() => setWhatIfTab('absences')}
                      className={`px-2.5 py-1 rounded-full transition-all ${
                        whatIfTab === 'absences'
                          ? 'glass-pill-active font-medium'
                          : 'text-[#BDB4C3]'
                      }`}
                    >
                      Vary Absences
                    </button>
                  </div>
                </div>

                <SculptedBarChart
                  data={
                    whatIfTab === 'study'
                      ? prediction.whatIfStudy.map((w) => ({
                          label: w.label,
                          value: w.value,
                          active: w.active,
                          subtext: `Projected G3: ${w.value}/20`,
                        }))
                      : prediction.whatIfAbsences.map((w) => ({
                          label: w.label,
                          value: w.value,
                          subtext: `Projected G3 at ${w.label}: ${w.value}/20`,
                        }))
                  }
                  maxVal={20}
                  height={175}
                  accent={whatIfTab === 'study' ? 'rose' : 'lavender'}
                  capsuleLabels={true}
                />
              </div>
            )}

            {/* Factors Influencing This Prediction */}
            <div>
              <h4 className="text-sm font-display font-semibold text-[#FDF8FC] mb-2.5">
                Factors Influencing This Prediction (vs Cohort Mean)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {prediction.influencingFactors.slice(0, 6).map((f) => (
                  <div
                    key={f.feature}
                    className="glass-subcard rounded-2xl px-3.5 py-2.5 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-[#FDF8FC] truncate">{f.label}</div>
                      <div className="text-[11px] text-[#928997] font-mono tabular-nums">
                        Input: {String(f.studentValue)} · Avg: {f.cohortMean}
                      </div>
                    </div>
                    <div
                      className={`flex items-center gap-0.5 text-xs font-mono tabular-nums font-semibold shrink-0 ${
                        f.impact > 0.05
                          ? 'text-[#FAD9EA]'
                          : f.impact < -0.05
                          ? 'text-[#D6E8BE]'
                          : 'text-[#CAD2C4]'
                      }`}
                    >
                      {f.impact > 0.05 && <ArrowUpRight className="w-3.5 h-3.5" />}
                      {f.impact < -0.05 && <ArrowDownRight className="w-3.5 h-3.5" />}
                      <span>
                        {f.impact > 0 ? `+${f.impact.toFixed(2)}` : f.impact.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Personalized Academic Improvement Suggestions */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <Lightbulb className="w-4 h-4 text-[#FAD9EA]" />
                <h4 className="text-sm font-display font-semibold text-[#FCF9FB]">
                  Personalized Academic Improvement Plan
                </h4>
              </div>
              <div className="space-y-2.5">
                {prediction.suggestions.map((s, idx) => (
                  <div key={idx} className="glass-subcard rounded-2xl p-3.5">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-[#FAD9EA]">{s.title}</span>
                      <span className="text-[11px] font-mono text-[#D6E8BE]">{s.impact}</span>
                    </div>
                    <p className="text-xs text-[#CAD2C4] leading-relaxed">{s.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-shell rounded-[24px] p-10 text-center text-[#BDB4C3]">
            Adjust student parameters and click Predict Final Grade to run live ML inference.
          </div>
        )}
      </div>
    </div>
  );
};

interface InsightsProps {
  evaluation: EvaluationPayload;
  selectedModel: ModelKey;
  onSelectModel: (key: ModelKey) => void;
  includeGrades: boolean;
  onToggleIncludeGrades: (val: boolean) => void;
}

export const InsightsPage: React.FC<InsightsProps> = ({
  evaluation,
  selectedModel,
  onSelectModel,
  includeGrades,
  onToggleIncludeGrades,
}) => {
  const activeModel = evaluation.models[selectedModel];

  return (
    <div className="space-y-5">
      <div className="glass-shell rounded-[22px] p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {(
            ['random_forest', 'gradient_boosting', 'linear_regression', 'decision_tree'] as ModelKey[]
          ).map((k) => (
            <button
              key={k}
              onClick={() => onSelectModel(k)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                selectedModel === k
                  ? 'glass-pill-active font-semibold'
                  : 'glass-control text-[#BDB4C3] hover:text-white'
              }`}
            >
              {evaluation.models[k].name}
            </button>
          ))}
        </div>

        <div className="flex items-center p-1 rounded-full bg-white/[0.04] border border-[rgba(255,210,235,0.20)]">
          <button
            onClick={() => onToggleIncludeGrades(true)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              includeGrades
                ? 'glass-pill-active font-semibold'
                : 'text-[#BDB4C3] hover:text-white'
            }`}
          >
            With G1 & G2
          </button>
          <button
            onClick={() => onToggleIncludeGrades(false)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              !includeGrades
                ? 'glass-pill-active font-semibold'
                : 'text-[#BDB4C3] hover:text-white'
            }`}
          >
            Without G1 & G2
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 glass-shell glass-shell-hover rounded-[24px] p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-display font-semibold text-[#FDF8FC]">
                Actual vs Predicted G3 — {activeModel.name}
              </h3>
              <p className="text-xs text-[#BDB4C3]">
                Unseen test split (n = {evaluation.testSize}) · Hover points to inspect student residuals
              </p>
            </div>
            <span className="text-xs font-mono tabular-nums font-semibold text-[#F8C6DF]">
              R² = {activeModel.testMetrics.r2.toFixed(3)}
            </span>
          </div>
          <ActualVsPredictedScatter points={activeModel.actualVsPredicted} />
        </div>

        <div className="lg:col-span-5 glass-shell glass-shell-hover rounded-[24px] p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-display font-semibold text-[#FDF8FC]">
                Residual Distribution
              </h3>
              <p className="text-xs text-[#BDB4C3]">
                Mean error: {activeModel.residualMean} · Std: {activeModel.residualStd}
              </p>
            </div>
            <span className="text-xs font-mono tabular-nums text-[#D6E8BE]">
              RMSE {activeModel.testMetrics.rmse.toFixed(2)}
            </span>
          </div>
          <ResidualHistogram bins={activeModel.residualHistogram} />
        </div>
      </div>

      <div className="glass-shell rounded-[24px] p-6">
        <div className="mb-4">
          <h3 className="text-base font-display font-semibold text-[#FDF8FC]">
            Feature Importance Breakdown — {activeModel.name}
          </h3>
          <p className="text-xs text-[#BDB4C3]">
            Normalized relative contribution of every input feature on test-set grade predictions
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
          <FeatureImportanceBars items={activeModel.featureImportance} />
          <div className="glass-subcard rounded-2xl p-5 space-y-3 text-xs text-[#BDB4C3] leading-relaxed">
            <h4 className="text-sm font-display font-semibold text-[#F8C6DF]">
              Diagnostic Interpretation
            </h4>
            <p>
              <strong className="text-[#FDF8FC]">1. Prior Academic Momentum vs Habits:</strong>{' '}
              {includeGrades
                ? 'When G1 and G2 are available, second-period performance (G2) dominates predictive power because final assessments build cumulatively on mid-year mastery.'
                : 'When G1 and G2 are excluded, Previous Class Failures, Study Time, Family Education (Medu/Fedu), and School Absences carry the primary predictive signal.'}
            </p>
            <p>
              <strong className="text-[#FDF8FC]">2. 5-Fold Cross-Validation Stability:</strong>{' '}
              Across 5 training folds, {activeModel.name} achieves R² ={' '}
              <span className="font-mono text-[#FDF8FC]">
                {activeModel.cvMetrics.meanR2.toFixed(3)} ±{' '}
                {activeModel.cvMetrics.stdR2.toFixed(3)}
              </span>
              , confirming stable generalization across cohort partitions.
            </p>
            <p>
              <strong className="text-[#FDF8FC]">3. Zero Data Leakage Guarantee:</strong> Test
              metrics are computed strictly on {evaluation.testSize} held-out students unseen
              during imputation, scaling, or tree split selection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const RiskRadarPage: React.FC<{
  evaluation: EvaluationPayload;
  onSimulateStudent: (student: AtRiskStudent) => void;
}> = ({ evaluation, onSimulateStudent }) => {
  return (
    <div className="space-y-5">
      <div className="glass-kpi rounded-[24px] p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl pink-icon-badge flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-[#FDF8FC]" />
          </div>
          <div>
            <div className="text-xs text-[#F8C6DF] font-medium">
              Early-Warning Academic Intervention Engine · {evaluation.bestModelName}
            </div>
            <h2 className="text-lg font-display font-bold text-[#FDF8FC] mt-0.5">
              {evaluation.atRiskCount} Students Projected Below Pass Threshold (G3 &lt; 10/20)
            </h2>
            <p className="text-xs text-[#BDB4C3] mt-0.5 max-w-3xl">
              Prioritized by recoverable pass proximity so advisors can focus tutoring and attendance outreach where 1–3 grade points flip an outcome from fail to pass.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            exportRowsToCsv(evaluation.atRiskSample, 'at_risk_intervention_priority.csv')
          }
          className="glass-cta px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 whitespace-nowrap"
        >
          <FileDown className="w-3.5 h-3.5" />
          <span>Export Priority List (CSV)</span>
        </button>
      </div>

      <div className="glass-shell rounded-[24px] p-6">
        <div className="overflow-x-auto rounded-2xl border border-[rgba(255,210,235,0.18)]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-white/[0.05] text-[#BDB4C3] border-b border-[rgba(255,210,235,0.16)]">
                <th className="py-3 px-3.5 font-semibold">Row #</th>
                <th className="py-3 px-3.5 font-semibold">Profile</th>
                <th className="py-3 px-3.5 font-semibold text-right">Study Cat</th>
                <th className="py-3 px-3.5 font-semibold text-right">Failures</th>
                <th className="py-3 px-3.5 font-semibold text-right">Absences</th>
                <th className="py-3 px-3.5 font-semibold text-right">G1 / G2</th>
                <th className="py-3 px-3.5 font-semibold text-right">Projected G3</th>
                <th className="py-3 px-3.5 font-semibold text-right">Gap to Pass</th>
                <th className="py-3 px-3.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {evaluation.atRiskSample.map((st) => (
                <tr key={st.rowNumber} className="hover:bg-white/[0.045] transition-colors">
                  <td className="py-2.5 px-3.5 font-mono tabular-nums text-[#928997]">
                    #{st.rowNumber}
                  </td>
                  <td className="py-2.5 px-3.5 text-[#FDF8FC]">
                    {st.school} · {st.sex === 'F' ? 'Female' : 'Male'} · {st.age}y
                  </td>
                  <td className="py-2.5 px-3.5 font-mono tabular-nums text-right text-[#BDB4C3]">
                    {STUDY_LABELS[st.studytime] || st.studytime}
                  </td>
                  <td className="py-2.5 px-3.5 font-mono tabular-nums text-right text-[#BDB4C3]">
                    {st.failures}
                  </td>
                  <td className="py-2.5 px-3.5 font-mono tabular-nums text-right text-[#BDB4C3]">
                    {st.absences}d
                  </td>
                  <td className="py-2.5 px-3.5 font-mono tabular-nums text-right text-[#BDB4C3]">
                    {st.G1} → {st.G2}
                  </td>
                  <td className="py-2.5 px-3.5 font-mono tabular-nums text-right font-semibold text-[#D6E8BE]">
                    {st.predictedG3.toFixed(2)} / 20
                  </td>
                  <td className="py-2.5 px-3.5 font-mono tabular-nums text-right text-[#FAD9EA]">
                    +{st.gapToPass.toFixed(2)} pts
                  </td>
                  <td className="py-2.5 px-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => onSimulateStudent(st)}
                      className="px-3 py-1 rounded-full glass-pill-active text-[11px] font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-1 whitespace-nowrap"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Simulate Lift</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const PythonSourceModal: React.FC<{
  open: boolean;
  onClose: () => void;
  files: PythonSourceFile[];
}> = ({ open, onClose, files }) => {
  const [activeIdx, setActiveIdx] = React.useState(0);
  if (!open) return null;

  const current = files[activeIdx] || files[0];

  const downloadFile = (f: PythonSourceFile) => {
    const blob = new Blob([f.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = f.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B1009]/78 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-5xl rounded-[24px] glass-shell text-[#FDF8FC] overflow-hidden flex flex-col max-h-[86vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.10]">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl pink-icon-badge flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-display font-bold">
                Modular Python ML & Streamlit Source Files
              </h3>
              <p className="text-xs text-[#BDB4C3]">
                Live backend executes these Python modules (`data_loader.py`, `preprocessing.py`, `model_training.py`, `prediction.py`)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-3 bg-white/[0.03] border-b border-white/[0.08]">
          <div className="flex flex-wrap items-center gap-1.5">
            {files.map((f, idx) => (
              <button
                key={f.name}
                onClick={() => setActiveIdx(idx)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all ${
                  idx === activeIdx
                    ? 'glass-pill-active font-semibold'
                    : 'glass-control text-[#BDB4C3]'
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>

          {current && (
            <button
              onClick={() => downloadFile(current)}
              className="glass-cta px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {current.name}</span>
            </button>
          )}
        </div>

        <pre className="p-6 overflow-auto text-xs font-mono text-[#FDF8FC]/92 leading-relaxed flex-1">
          {current?.content || 'Loading Python source files...'}
        </pre>
      </div>
    </div>
  );
};
