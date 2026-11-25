import React, { useMemo, useState } from 'react';
import { DashboardPayload } from '../types';

export const AnalysisSection: React.FC<{ data: DashboardPayload }> = ({
  data,
}) => {
  const { cleaning, analysis } = data;
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSupportStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return analysis.supportNeededStudents;
    return analysis.supportNeededStudents.filter(
      (s) =>
        s.studentId.toLowerCase().includes(q) ||
        s.gender.toLowerCase().includes(q) ||
        s.performanceCategory.toLowerCase().includes(q)
    );
  }, [analysis.supportNeededStudents, searchQuery]);

  return (
    <div className="space-y-6">
      {/* 1. Data Cleaning Checks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="clean-card rounded-xl p-5">
          <h3 className="text-base font-display font-semibold text-slate-900">
            1. Missing Values Check & Cleaning
          </h3>
          <p className="text-xs text-slate-600 mt-1 mb-4 leading-relaxed">
            In Pandas, we check empty cells with <code className="font-mono text-purple-700">df.isnull().sum()</code>.
            We found <strong>{cleaning.totalMissingFound}</strong> missing values in the raw CSV and filled
            them using each column&apos;s median (middle value) so no student records were lost.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 text-left font-semibold">Column Name</th>
                  <th className="py-2 text-right font-semibold">Missing (Raw CSV)</th>
                  <th className="py-2 text-right font-semibold">After Cleaning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cleaning.missingByColumn.map((item) => (
                  <tr key={item.column} className="hover:bg-slate-50">
                    <td className="py-2 font-medium text-slate-800">{item.column}</td>
                    <td className="py-2 text-right font-mono tabular-nums text-slate-700">
                      {item.missingCount}
                    </td>
                    <td className="py-2 text-right font-mono tabular-nums text-blue-700 font-semibold">
                      0
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="clean-card rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-display font-semibold text-slate-900">
              2. Duplicate Records & Score Summary
            </h3>
            <p className="text-xs text-slate-600 mt-1 mb-4 leading-relaxed">
              We checked for repeated student rows with{' '}
              <code className="font-mono text-purple-700">df.duplicated().sum()</code> and removed them
              with <code className="font-mono text-purple-700">df.drop_duplicates()</code>.
            </p>

            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="text-[11px] text-slate-500">Raw Rows</div>
                <div className="text-lg font-display font-bold text-slate-900 tabular-nums mt-0.5">
                  {cleaning.rawRowCount}
                </div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="text-[11px] text-purple-700">Duplicates Removed</div>
                <div className="text-lg font-display font-bold text-purple-900 tabular-nums mt-0.5">
                  {cleaning.duplicatesRemoved}
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-[11px] text-blue-700">Clean Students</div>
                <div className="text-lg font-display font-bold text-blue-900 tabular-nums mt-0.5">
                  {cleaning.cleanRowCount}
                </div>
              </div>
            </div>

            <h4 className="text-sm font-display font-semibold text-slate-900 mb-2">
              3. Average, Maximum, and Minimum Final Exam Marks
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="border border-slate-200 rounded-lg p-3">
                <div className="text-[11px] text-slate-500">Average (Mean)</div>
                <div className="text-lg font-mono font-bold text-slate-900 tabular-nums mt-0.5">
                  {analysis.avgScore.toFixed(2)}
                </div>
              </div>
              <div className="border border-slate-200 rounded-lg p-3">
                <div className="text-[11px] text-slate-500">Maximum Score</div>
                <div className="text-lg font-mono font-bold text-blue-700 tabular-nums mt-0.5">
                  {analysis.maxScore.toFixed(1)}
                </div>
              </div>
              <div className="border border-slate-200 rounded-lg p-3">
                <div className="text-[11px] text-slate-500">Minimum Score</div>
                <div className="text-lg font-mono font-bold text-purple-700 tabular-nums mt-0.5">
                  {analysis.minScore.toFixed(1)}
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-600 mt-4 pt-3 border-t border-slate-100 leading-relaxed">
            <strong className="text-slate-800">Simple explanation:</strong> NumPy&apos;s{' '}
            <code className="font-mono">np.mean()</code>, <code className="font-mono">np.max()</code>,
            and <code className="font-mono">np.min()</code> summarize the class average and the gap
            between the lowest and highest scoring students.
          </p>
        </div>
      </div>

      {/* 2. Attendance, Study Hours, & Performance Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="clean-card rounded-xl p-5 space-y-4">
          <h3 className="text-base font-display font-semibold text-slate-900">
            4. Attendance & Study Hours Analysis
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-4">
              <div className="text-xs font-semibold text-blue-900 mb-2">
                Attendance Impact
              </div>
              <div className="flex justify-between text-xs text-slate-700 py-1">
                <span>≥ 75% Attendance:</span>
                <span className="font-mono font-bold tabular-nums text-blue-800">
                  {analysis.highAttendanceAvg.toFixed(1)} avg
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-700 py-1">
                <span>&lt; 75% Attendance:</span>
                <span className="font-mono font-bold tabular-nums text-slate-700">
                  {analysis.lowAttendanceAvg.toFixed(1)} avg
                </span>
              </div>
            </div>

            <div className="bg-purple-50/70 border border-purple-200 rounded-lg p-4">
              <div className="text-xs font-semibold text-purple-900 mb-2">
                Study Hours Impact
              </div>
              <div className="flex justify-between text-xs text-slate-700 py-1">
                <span>≥ 5 hrs/day study:</span>
                <span className="font-mono font-bold tabular-nums text-purple-800">
                  {analysis.highStudyAvg.toFixed(1)} avg
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-700 py-1">
                <span>&lt; 5 hrs/day study:</span>
                <span className="font-mono font-bold tabular-nums text-slate-700">
                  {analysis.lowStudyAvg.toFixed(1)} avg
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-800">Simple explanation:</strong> Students with
            75%+ attendance or 5+ daily study hours score significantly higher on average
            than peers with lower attendance or fewer study hours.
          </p>
        </div>

        <div className="clean-card rounded-xl p-5">
          <h3 className="text-base font-display font-semibold text-slate-900">
            5. Performance Comparison by Gender & Category
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 mb-3">
            Grouped averages calculated using Pandas <code className="font-mono">groupby()</code>
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 text-left font-semibold">Group</th>
                  <th className="py-2 text-right font-semibold">Students</th>
                  <th className="py-2 text-right font-semibold">Study Hrs</th>
                  <th className="py-2 text-right font-semibold">Attendance</th>
                  <th className="py-2 text-right font-semibold">Avg Final Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analysis.genderComparison.map((g) => (
                  <tr key={g.gender} className="hover:bg-slate-50">
                    <td className="py-2 font-medium text-slate-800">{g.gender}</td>
                    <td className="py-2 text-right font-mono tabular-nums">{g.count}</td>
                    <td className="py-2 text-right font-mono tabular-nums">
                      {g.avgStudyHours.toFixed(1)}
                    </td>
                    <td className="py-2 text-right font-mono tabular-nums">
                      {g.avgAttendance.toFixed(1)}%
                    </td>
                    <td className="py-2 text-right font-mono tabular-nums font-semibold text-blue-700">
                      {g.avgFinalScore.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 3. Students Needing Academic Support */}
      <div className="clean-card rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-display font-semibold text-slate-900">
              6. Students Who May Need Academic Support
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Identified <strong>{analysis.supportNeededCount}</strong> students with Final Exam Score &lt; 50
              or Attendance &lt; 75% (showing top 20 lowest scores)
            </p>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Student ID or Gender..."
            className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 px-2 text-left font-semibold">Student ID</th>
                <th className="py-2 px-2 text-left font-semibold">Gender</th>
                <th className="py-2 px-2 text-right font-semibold">Study Hours</th>
                <th className="py-2 px-2 text-right font-semibold">Attendance %</th>
                <th className="py-2 px-2 text-right font-semibold">Assignment</th>
                <th className="py-2 px-2 text-right font-semibold">Prev Exam</th>
                <th className="py-2 px-2 text-right font-semibold">Final Score</th>
                <th className="py-2 px-2 text-left font-semibold">Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSupportStudents.map((s) => (
                <tr key={s.studentId} className="hover:bg-slate-50">
                  <td className="py-2 px-2 font-mono text-slate-800">{s.studentId}</td>
                  <td className="py-2 px-2 text-slate-700">{s.gender}</td>
                  <td className="py-2 px-2 text-right font-mono tabular-nums text-slate-700">
                    {s.studyHours.toFixed(1)}
                  </td>
                  <td className="py-2 px-2 text-right font-mono tabular-nums text-purple-700 font-semibold">
                    {s.attendancePercentage.toFixed(1)}%
                  </td>
                  <td className="py-2 px-2 text-right font-mono tabular-nums text-slate-700">
                    {s.assignmentScore.toFixed(1)}
                  </td>
                  <td className="py-2 px-2 text-right font-mono tabular-nums text-slate-700">
                    {s.previousExamScore.toFixed(1)}
                  </td>
                  <td className="py-2 px-2 text-right font-mono tabular-nums font-bold text-blue-700">
                    {s.finalExamScore.toFixed(1)}
                  </td>
                  <td className="py-2 px-2 text-slate-700">{s.performanceCategory}</td>
                </tr>
              ))}
              {filteredSupportStudents.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-500">
                    No matching students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
