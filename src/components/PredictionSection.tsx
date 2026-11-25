import React, { useState } from 'react';
import { LinearRegressionSummary, PredictionResult } from '../types';

export const PredictionSection: React.FC<{
  model: LinearRegressionSummary;
}> = ({ model }) => {
  const [studyHours, setStudyHours] = useState(5.0);
  const [attendancePercentage, setAttendancePercentage] = useState(85);
  const [assignmentScore, setAssignmentScore] = useState(75);
  const [previousExamScore, setPreviousExamScore] = useState(72);

  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!model.isTrained) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studyHours,
          attendancePercentage,
          assignmentScore,
          previousExamScore,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Prediction failed.');
      }
      setPrediction(json);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to compute prediction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Model Training & Evaluation Summary */}
      <div className="clean-card rounded-xl p-5">
        <h2 className="text-base font-display font-semibold text-slate-900">
          Simple Linear Regression Model (Scikit-learn)
        </h2>
        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
          We train a single beginner-friendly <strong>Linear Regression</strong> model using 4 inputs:
          Study Hours, Attendance Percentage, Assignment Score, and Previous Exam Score.
        </p>

        {!model.isTrained ? (
          <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-4 text-xs text-red-700">
            The Linear Regression model is not trained yet: {model.errorMessage || 'Training unavailable'}.
            Prediction is disabled until the model is properly trained.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3.5">
              <div className="text-xs text-blue-700 font-medium">Training Set (80%)</div>
              <div className="text-xl font-display font-bold text-slate-900 tabular-nums mt-1">
                {model.trainCount} students
              </div>
            </div>
            <div className="bg-purple-50/70 border border-purple-200 rounded-lg p-3.5">
              <div className="text-xs text-purple-700 font-medium">Testing Set (20%)</div>
              <div className="text-xl font-display font-bold text-slate-900 tabular-nums mt-1">
                {model.testCount} students
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-3.5">
              <div className="text-xs text-slate-500 font-medium">MAE (Mean Absolute Error)</div>
              <div className="text-xl font-display font-bold text-blue-700 tabular-nums mt-1">
                ±{model.mae.toFixed(2)} pts
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-3.5">
              <div className="text-xs text-slate-500 font-medium">R² Score</div>
              <div className="text-xl font-display font-bold text-purple-700 tabular-nums mt-1">
                {model.r2.toFixed(3)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Prediction Form + Model Explanation */}
      {model.isTrained && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <form
            onSubmit={handlePredict}
            className="lg:col-span-6 clean-card rounded-xl p-5 space-y-4"
          >
            <h3 className="text-base font-display font-semibold text-slate-900">
              Predict Final Exam Score
            </h3>
            <p className="text-xs text-slate-500">
              Enter a student&apos;s metrics below to run the trained Linear Regression model.
            </p>

            <div className="space-y-3.5 text-xs">
              <div>
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <label htmlFor="study-hours">Study Hours (per day)</label>
                  <span className="font-mono tabular-nums text-blue-700 font-semibold">
                    {studyHours.toFixed(1)} hrs
                  </span>
                </div>
                <input
                  id="study-hours"
                  type="range"
                  min={0.5}
                  max={10}
                  step={0.5}
                  value={studyHours}
                  onChange={(e) => setStudyHours(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <label htmlFor="attendance-pct">Attendance Percentage (%)</label>
                  <span className="font-mono tabular-nums text-blue-700 font-semibold">
                    {attendancePercentage}%
                  </span>
                </div>
                <input
                  id="attendance-pct"
                  type="range"
                  min={40}
                  max={100}
                  step={1}
                  value={attendancePercentage}
                  onChange={(e) => setAttendancePercentage(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <label htmlFor="assignment-score">Assignment Score (0–100)</label>
                  <span className="font-mono tabular-nums text-purple-700 font-semibold">
                    {assignmentScore}
                  </span>
                </div>
                <input
                  id="assignment-score"
                  type="range"
                  min={20}
                  max={100}
                  step={1}
                  value={assignmentScore}
                  onChange={(e) => setAssignmentScore(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <label htmlFor="prev-exam-score">Previous Exam Score (0–100)</label>
                  <span className="font-mono tabular-nums text-purple-700 font-semibold">
                    {previousExamScore}
                  </span>
                </div>
                <input
                  id="prev-exam-score"
                  type="range"
                  min={20}
                  max={100}
                  step={1}
                  value={previousExamScore}
                  onChange={(e) => setPreviousExamScore(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs font-semibold transition-all disabled:opacity-60"
            >
              {loading ? 'Predicting...' : 'Predict Final Exam Score'}
            </button>

            {prediction && (
              <div className="soft-banner rounded-xl p-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-600">Predicted Final Exam Score</div>
                  <div className="text-2xl font-display font-bold text-slate-900 tabular-nums mt-0.5">
                    {prediction.predictedScore.toFixed(1)} / 100
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-600">Expected Category</div>
                  <div className="text-sm font-display font-bold text-purple-700 mt-0.5">
                    {prediction.predictedCategory}
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* Beginner-Friendly Interview Explanation */}
          <div className="lg:col-span-6 clean-card rounded-xl p-5 space-y-4">
            <h3 className="text-base font-display font-semibold text-slate-900">
              How This Model Works (Beginner Explanation)
            </h3>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div>
                <h4 className="font-semibold text-slate-800">1. Train-Test Split (80 / 20)</h4>
                <p>
                  We hide 20% of students ({model.testCount} records) as an unseen test set, and train
                  the model only on the remaining 80% ({model.trainCount} records). This ensures we
                  test the model fairly on students it has never seen.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800">2. Linear Regression Weights</h4>
                <p className="mb-2">
                  Linear Regression learns one number (weight) for each input and adds them up:
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono text-[11px] text-slate-700 space-y-1">
                  <div>Base Intercept: {model.intercept.toFixed(2)}</div>
                  {model.coefficients.map((c) => (
                    <div key={c.feature} className="flex justify-between">
                      <span>{c.feature}:</span>
                      <span className="font-semibold text-blue-700">
                        +{c.weight.toFixed(2)} per unit
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800">3. MAE and R² Score</h4>
                <p>
                  <strong>MAE ({model.mae.toFixed(2)}):</strong> On average, predictions are within{' '}
                  {model.mae.toFixed(2)} marks of the true exam score.{' '}
                  <strong>R² ({model.r2.toFixed(3)}):</strong> The 4 features explain{' '}
                  {(model.r2 * 100).toFixed(1)}% of the variation in final exam scores.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
