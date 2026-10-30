import React from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Code2,
  Download,
  Lightbulb,
  Play,
  X,
} from 'lucide-react';
import {
  EvaluationPayload,
  ModelKey,
  PredictionPayload,
  PythonSourceFile,
  StudentInputProfile,
} from '../types';
import { EDU_LABELS, STUDY_LABELS } from '../utils/analytics';
import {
  ActualVsPredictedScatter,
  FeatureImportanceBars,
  GradeGauge,
  ResidualHistogram,
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
    name: 'Steady Cohort Typical',
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
    name: 'At-Risk Student',
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
  const updateField = <K extends keyof StudentInputProfile>(
    key: K,
    val: StudentInputProfile[K]
  ) => {
    onChangeInput({ ...studentInput, [key]: val });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
      {/* Left Column: Interactive Student Profile Form */}
      <div className="xl:col-span-6 rounded-[24px] bg-white/80 backdrop-blur-xl border border-white/95 p-6 shadow-[0_14px_38px_rgba(35,29,37,0.06)] space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#EADCE5]">
          <div>
            <h2 className="text-lg font-display font-bold text-[#1F1823]">
              Student Profile Parameters
            </h2>
            <p className="text-xs text-[#6E5D76]">
              Configure demographics, study habits, and optional prior grades
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => {
                  onChangeInput(p.profile);
                  onRunPredict(p.profile);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-[#F5E6EF] hover:bg-[#FAD6E8] text-[11px] font-semibold text-[#2E2234] transition-colors whitespace-nowrap"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Mode & Algorithm Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#3B2E41] mb-1.5">
              Prediction Mode
            </label>
            <div className="grid grid-cols-2 p-1 rounded-xl bg-[#F3E3ED]">
              <button
                type="button"
                onClick={() => onToggleIncludeGrades(true)}
                className={`py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  includeGrades ? 'bg-[#221B25] text-white' : 'text-[#55425E]'
                }`}
              >
                With G1 & G2
              </button>
              <button
                type="button"
                onClick={() => onToggleIncludeGrades(false)}
                className={`py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  !includeGrades ? 'bg-[#221B25] text-white' : 'text-[#55425E]'
                }`}
              >
                Without G1 & G2
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3B2E41] mb-1.5">
              Trained ML Algorithm
            </label>
            <select
              value={selectedModel}
              onChange={(e) => onSelectModel(e.target.value as ModelKey)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#DFC9D6] text-xs font-semibold text-[#1F1823] focus:outline-none focus:border-[#221B25]"
            >
              <option value="random_forest">Random Forest Regressor</option>
              <option value="linear_regression">Linear Regression</option>
              <option value="decision_tree">Decision Tree Regressor</option>
            </select>
          </div>
        </div>

        {/* Conditional G1 & G2 Sliders when Mode 1 is Active */}
        {includeGrades && (
          <div className="rounded-2xl bg-[#221B25] text-white p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[#D9CEE0]">First Period Grade (G1)</span>
                <span className="font-mono tabular-nums font-bold text-[#FAD6E8]">
                  {studentInput.G1} / 20
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={20}
                value={studentInput.G1}
                onChange={(e) => updateField('G1', Number(e.target.value))}
                className="w-full accent-[#FAD6E8]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[#D9CEE0]">Second Period Grade (G2)</span>
                <span className="font-mono tabular-nums font-bold text-[#FAD6E8]">
                  {studentInput.G2} / 20
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={20}
                value={studentInput.G2}
                onChange={(e) => updateField('G2', Number(e.target.value))}
                className="w-full accent-[#FAD6E8]"
              />
            </div>
          </div>
        )}

        {/* Core Demographic & Habit Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <div className="flex justify-between font-semibold text-[#3B2E41] mb-1.5">
              <span>Student Age</span>
              <span className="font-mono tabular-nums">{studentInput.age} yrs</span>
            </div>
            <input
              type="range"
              min={15}
              max={22}
              value={studentInput.age}
              onChange={(e) => updateField('age', Number(e.target.value))}
              className="w-full accent-[#D879AA]"
            />
          </div>

          <div>
            <div className="flex justify-between font-semibold text-[#3B2E41] mb-1.5">
              <span>Term Absences</span>
              <span className="font-mono tabular-nums">{studentInput.absences} days</span>
            </div>
            <input
              type="range"
              min={0}
              max={60}
              value={studentInput.absences}
              onChange={(e) => updateField('absences', Number(e.target.value))}
              className="w-full accent-[#D879AA]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#3B2E41] mb-1.5">Gender</label>
            <div className="grid grid-cols-2 gap-2">
              {(['F', 'M'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => updateField('sex', g)}
                  className={`py-2 rounded-xl font-semibold border transition-colors ${
                    studentInput.sex === g
                      ? 'bg-[#221B25] text-white border-[#221B25]'
                      : 'bg-white text-[#3B2E41] border-[#DFC9D6]'
                  }`}
                >
                  {g === 'F' ? 'Female (F)' : 'Male (M)'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#3B2E41] mb-1.5">
              Weekly Study Hours
            </label>
            <select
              value={studentInput.studytime}
              onChange={(e) => updateField('studytime', Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#DFC9D6] font-medium text-[#1F1823]"
            >
              {[1, 2, 3, 4].map((st) => (
                <option key={st} value={st}>
                  Category {st}: {STUDY_LABELS[st]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#3B2E41] mb-1.5">
              Previous Class Failures
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[0, 1, 2, 3].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => updateField('failures', f)}
                  className={`py-2 rounded-xl font-mono font-semibold border transition-colors ${
                    studentInput.failures === f
                      ? 'bg-[#221B25] text-white border-[#221B25]'
                      : 'bg-white text-[#3B2E41] border-[#DFC9D6]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#3B2E41] mb-1.5">
              Mother's Education (Medu)
            </label>
            <select
              value={studentInput.Medu}
              onChange={(e) => updateField('Medu', Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#DFC9D6] font-medium text-[#1F1823]"
            >
              {[0, 1, 2, 3, 4].map((lvl) => (
                <option key={lvl} value={lvl}>
                  {EDU_LABELS[lvl]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#3B2E41] mb-1.5">
              Father's Education (Fedu)
            </label>
            <select
              value={studentInput.Fedu}
              onChange={(e) => updateField('Fedu', Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#DFC9D6] font-medium text-[#1F1823]"
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
              <label className="block font-semibold text-[#3B2E41] mb-1.5">
                Internet Access
              </label>
              <button
                type="button"
                onClick={() =>
                  updateField('internet', studentInput.internet === 'yes' ? 'no' : 'yes')
                }
                className={`w-full py-2 rounded-xl font-semibold border transition-colors ${
                  studentInput.internet === 'yes'
                    ? 'bg-[#FAD6E8] text-[#1F1823] border-[#E59BC2]'
                    : 'bg-white text-[#55425E] border-[#DFC9D6]'
                }`}
              >
                {studentInput.internet === 'yes' ? 'Yes (Home)' : 'No'}
              </button>
            </div>

            <div>
              <label className="block font-semibold text-[#3B2E41] mb-1.5">
                School Support
              </label>
              <button
                type="button"
                onClick={() =>
                  updateField('schoolsup', studentInput.schoolsup === 'yes' ? 'no' : 'yes')
                }
                className={`w-full py-2 rounded-xl font-semibold border transition-colors ${
                  studentInput.schoolsup === 'yes'
                    ? 'bg-[#FAD6E8] text-[#1F1823] border-[#E59BC2]'
                    : 'bg-white text-[#55425E] border-[#DFC9D6]'
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
          className="w-full py-3.5 rounded-2xl bg-[#221B25] hover:bg-[#322737] text-white text-sm font-display font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{isPredicting ? 'Executing Python Model...' : 'Predict Final Grade (G3)'}</span>
        </button>
      </div>

      {/* Right Column: Live ML Prediction Result, Gauge, Factors & Improvement Plan */}
      <div className="xl:col-span-6 space-y-5">
        {prediction ? (
          <div className="rounded-[26px] bg-gradient-to-br from-[#251E29] via-[#201924] to-[#19131C] border border-white/15 p-6 text-white shadow-[0_24px_60px_rgba(28,20,33,0.22)] space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <div className="text-xs text-[#C8BBD0]">
                  Active Model: {prediction.selectedModelName}
                </div>
                <h3 className="text-xl font-display font-bold text-white mt-0.5">
                  {prediction.classification.category}
                </h3>
              </div>

              <div className="text-right text-xs tabular-nums">
                <div className="text-[#B8AABF]">vs Cohort Avg ({prediction.cohortAverage}/20)</div>
                <div
                  className={`font-mono font-bold text-sm ${
                    prediction.deltaVsCohort >= 0 ? 'text-emerald-300' : 'text-rose-300'
                  }`}
                >
                  {prediction.deltaVsCohort >= 0 ? '+' : ''}
                  {prediction.deltaVsCohort} pts
                </div>
              </div>
            </div>

            {/* Gauge + Cross-Model Estimates */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="sm:col-span-7 flex justify-center">
                <GradeGauge score={prediction.predictedGrade} />
              </div>

              <div className="sm:col-span-5 space-y-2.5 bg-[#2E2533] rounded-2xl p-4 border border-white/10">
                <div className="text-xs font-semibold text-[#FAD6E8]">
                  Cross-Model Consensus
                </div>
                {(
                  [
                    ['random_forest', 'Random Forest'],
                    ['linear_regression', 'Linear Regression'],
                    ['decision_tree', 'Decision Tree'],
                  ] as const
                ).map(([k, label]) => (
                  <div
                    key={k}
                    className="flex items-center justify-between text-xs py-1 border-b border-white/[0.06] last:border-0"
                  >
                    <span className={k === prediction.selectedModelKey ? 'text-white font-semibold' : 'text-[#B8AABF]'}>
                      {label}
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-white">
                      {prediction.allModelPredictions[k].toFixed(2)} / 20
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Factors Influencing This Prediction */}
            <div>
              <h4 className="text-sm font-display font-semibold text-white mb-2.5">
                Factors Influencing This Prediction (vs Cohort Mean)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {prediction.influencingFactors.slice(0, 6).map((f) => (
                  <div
                    key={f.feature}
                    className="rounded-xl bg-[#2E2533]/85 border border-white/10 px-3.5 py-2.5 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-white truncate">{f.label}</div>
                      <div className="text-[11px] text-[#B8AABF] font-mono tabular-nums">
                        Input: {String(f.studentValue)} · Avg: {f.cohortMean}
                      </div>
                    </div>
                    <div
                      className={`flex items-center gap-0.5 text-xs font-mono tabular-nums font-semibold shrink-0 ${
                        f.impact > 0.05
                          ? 'text-emerald-300'
                          : f.impact < -0.05
                          ? 'text-rose-300'
                          : 'text-[#C8BBD0]'
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

            {/* Realistic Academic Improvement Recommendations */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <Lightbulb className="w-4 h-4 text-[#FAD6E8]" />
                <h4 className="text-sm font-display font-semibold text-white">
                  Personalized Academic Improvement Plan
                </h4>
              </div>
              <div className="space-y-2.5">
                {prediction.suggestions.map((s, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl bg-white/[0.05] border border-white/10 p-3.5"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-[#FAD6E8]">{s.title}</span>
                      <span className="text-[11px] font-mono text-emerald-300">{s.impact}</span>
                    </div>
                    <p className="text-xs text-[#DDD2E4] leading-relaxed">{s.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[26px] bg-[#221B25] p-10 text-center text-[#C8BBD0]">
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
      {/* Selector Header */}
      <div className="rounded-[22px] bg-white/80 backdrop-blur-xl border border-white/95 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {(['random_forest', 'linear_regression', 'decision_tree'] as ModelKey[]).map((k) => (
            <button
              key={k}
              onClick={() => onSelectModel(k)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                selectedModel === k
                  ? 'bg-[#221B25] text-white'
                  : 'bg-[#F5E6EF] text-[#3B2E41] hover:bg-[#FAD6E8]'
              }`}
            >
              {evaluation.models[k].name}
            </button>
          ))}
        </div>

        <div className="flex items-center p-1 rounded-xl bg-[#F3E3ED]">
          <button
            onClick={() => onToggleIncludeGrades(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              includeGrades ? 'bg-[#221B25] text-white' : 'text-[#55425E]'
            }`}
          >
            With G1 & G2
          </button>
          <button
            onClick={() => onToggleIncludeGrades(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              !includeGrades ? 'bg-[#221B25] text-white' : 'text-[#55425E]'
            }`}
          >
            Without G1 & G2
          </button>
        </div>
      </div>

      {/* Actual vs Predicted + Residual Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 rounded-[24px] bg-gradient-to-br from-[#251E29] to-[#1B151E] border border-white/15 p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-display font-semibold">
                Actual vs Predicted G3 — {activeModel.name}
              </h3>
              <p className="text-xs text-[#B8AABF]">
                Unseen test split (n = {evaluation.testSize}) · Hover points to inspect student residuals
              </p>
            </div>
            <span className="text-xs font-mono tabular-nums text-[#FAD6E8]">
              R² = {activeModel.testMetrics.r2.toFixed(3)}
            </span>
          </div>
          <ActualVsPredictedScatter points={activeModel.actualVsPredicted} />
        </div>

        <div className="lg:col-span-5 rounded-[24px] bg-gradient-to-br from-[#251E29] to-[#1B151E] border border-white/15 p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-display font-semibold">
                Residual Error Distribution
              </h3>
              <p className="text-xs text-[#B8AABF]">
                Mean error: {activeModel.residualMean} · Std: {activeModel.residualStd}
              </p>
            </div>
            <span className="text-xs font-mono tabular-nums text-[#C8BBD0]">
              RMSE {activeModel.testMetrics.rmse.toFixed(2)}
            </span>
          </div>
          <ResidualHistogram bins={activeModel.residualHistogram} />
        </div>
      </div>

      {/* Full Ranked Feature Importance */}
      <div className="rounded-[24px] bg-gradient-to-br from-[#251E29] to-[#1B151E] border border-white/15 p-6 text-white">
        <div className="mb-4">
          <h3 className="text-base font-display font-semibold">
            Complete Feature Importance Breakdown — {activeModel.name}
          </h3>
          <p className="text-xs text-[#B8AABF]">
            Normalized relative contribution of every input feature on test-set grade predictions
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3">
          <FeatureImportanceBars items={activeModel.featureImportance} />
          <div className="rounded-2xl bg-[#2E2533]/80 border border-white/10 p-5 space-y-3 text-xs text-[#DDD2E4] leading-relaxed">
            <h4 className="text-sm font-display font-semibold text-[#FAD6E8]">
              Diagnostic Interpretation
            </h4>
            <p>
              <strong>1. Prior Academic Momentum vs Habits:</strong>{' '}
              {includeGrades
                ? 'When G1 and G2 are available, second-period performance (G2) dominates predictive power because final assessments build cumulatively on mid-year mastery.'
                : 'When G1 and G2 are excluded, Previous Class Failures, Study Time, Family Education (Medu/Fedu), and School Absences carry the primary predictive signal.'}
            </p>
            <p>
              <strong>2. Residual Symmetry:</strong>Residuals cluster tightly around{' '}
              <span className="font-mono">{activeModel.residualMean}</span> grade points. Outliers correspond primarily to UCI students who attended mid-terms (G2 = 8–10) but recorded 0 on the final G3 exam.
            </p>
            <p>
              <strong>3. Zero Data Leakage Guarantee:</strong> Test metrics are computed strictly on {evaluation.testSize} held-out students unseen during imputation, scaling, or tree split selection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Modal allowing interviewers / users to inspect & download the modular Python ML codebase
 */
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
    <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-5xl rounded-[26px] bg-[#1E1722] border border-white/15 text-white shadow-2xl overflow-hidden flex flex-col max-h-[86vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Code2 className="w-5 h-5 text-[#FAD6E8]" />
            <div>
              <h3 className="text-base font-display font-bold">
                Modular Python ML & Streamlit Source Files
              </h3>
              <p className="text-xs text-[#B8AABF]">
                Live backend executes these exact Python modules (`data_loader.py`, `preprocessing.py`, `model_training.py`, `prediction.py`)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-3 bg-[#271F2C] border-b border-white/10">
          <div className="flex flex-wrap items-center gap-1.5">
            {files.map((f, idx) => (
              <button
                key={f.name}
                onClick={() => setActiveIdx(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                  idx === activeIdx
                    ? 'bg-[#FAD6E8] text-[#1F1823] font-semibold'
                    : 'bg-white/5 text-[#D9CEE0] hover:bg-white/10'
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>

          {current && (
            <button
              onClick={() => downloadFile(current)}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {current.name}</span>
            </button>
          )}
        </div>

        <pre className="p-6 overflow-auto text-xs font-mono text-[#EDE5F2] leading-relaxed flex-1">
          {current?.content || 'Loading Python source files...'}
        </pre>
      </div>
    </div>
  );
};
