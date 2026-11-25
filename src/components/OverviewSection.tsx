import React from 'react';
import { BookOpen, CalendarCheck, GraduationCap, Users } from 'lucide-react';
import { DashboardPayload } from '../types';

export const OverviewSection: React.FC<{
  data: DashboardPayload;
  onNavigatePrediction: () => void;
}> = ({ data, onNavigatePrediction }) => {
  const { overview, analysis, sampleRows } = data;

  const kpis = [
    {
      label: 'Total Students',
      value: String(overview.totalStudents),
      sub: 'Cleaned synthetic student records',
      icon: Users,
      accentBg: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Average Final Score',
      value: `${overview.avgFinalScore.toFixed(1)} / 100`,
      sub: `Range: ${analysis.minScore} – ${analysis.maxScore}`,
      icon: GraduationCap,
      accentBg: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Average Attendance',
      value: `${overview.avgAttendance.toFixed(1)}%`,
      sub: 'Class attendance rate',
      icon: CalendarCheck,
      accentBg: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Average Study Hours',
      value: `${overview.avgStudyHours.toFixed(1)} hrs/day`,
      sub: 'Self-study commitment',
      icon: BookOpen,
      accentBg: 'bg-purple-50 text-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Synthetic Data Disclosure */}
      <div className="soft-banner rounded-xl px-5 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-display font-semibold text-slate-900">
            Synthetic Dataset Notice
          </h2>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
            This project uses a realistic <strong>synthetic dataset</strong> of{' '}
            {overview.totalStudents} cleaned student records generated for learning Data
            Analysis and Linear Regression. It does not contain real student data.
          </p>
        </div>
        <button
          type="button"
          onClick={onNavigatePrediction}
          className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
        >
          Try Score Predictor
        </button>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="clean-card rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500">{kpi.label}</span>
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${kpi.accentBg}`}
                >
                  <Icon className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-display font-bold text-slate-900 tabular-nums">
                {kpi.value}
              </div>
              <div className="text-xs text-slate-500 mt-1">{kpi.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Category Summary + Sample Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 clean-card rounded-xl p-5">
          <h3 className="text-base font-display font-semibold text-slate-900">
            Performance Category Summary
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 mb-4">
            Students grouped by their Final Exam Score band
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 text-left font-semibold">Category</th>
                  <th className="py-2 text-right font-semibold">Students</th>
                  <th className="py-2 text-right font-semibold">Avg Score</th>
                  <th className="py-2 text-right font-semibold">Avg Att.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analysis.categoryBreakdown.map((item) => (
                  <tr key={item.category} className="hover:bg-slate-50">
                    <td className="py-2.5 font-medium text-slate-800">{item.category}</td>
                    <td className="py-2.5 text-right font-mono tabular-nums text-slate-700">
                      {item.count}
                    </td>
                    <td className="py-2.5 text-right font-mono tabular-nums font-semibold text-blue-700">
                      {item.avgFinalScore.toFixed(1)}
                    </td>
                    <td className="py-2.5 text-right font-mono tabular-nums text-slate-600">
                      {item.avgAttendance.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-7 clean-card rounded-xl p-5">
          <h3 className="text-base font-display font-semibold text-slate-900">
            Cleaned Dataset Preview (First 10 Records)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 mb-4">
            Showing the 8 simple columns from student_performance.csv after data cleaning
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 px-2 text-left font-semibold">ID</th>
                  <th className="py-2 px-2 text-left font-semibold">Gender</th>
                  <th className="py-2 px-2 text-right font-semibold">Study Hrs</th>
                  <th className="py-2 px-2 text-right font-semibold">Attend. %</th>
                  <th className="py-2 px-2 text-right font-semibold">Assign.</th>
                  <th className="py-2 px-2 text-right font-semibold">Prev Exam</th>
                  <th className="py-2 px-2 text-right font-semibold">Final Score</th>
                  <th className="py-2 px-2 text-left font-semibold">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sampleRows.slice(0, 10).map((row) => (
                  <tr key={row.studentId} className="hover:bg-slate-50">
                    <td className="py-2 px-2 font-mono text-slate-700">{row.studentId}</td>
                    <td className="py-2 px-2 text-slate-700">{row.gender}</td>
                    <td className="py-2 px-2 text-right font-mono tabular-nums text-slate-700">
                      {row.studyHours.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-right font-mono tabular-nums text-slate-700">
                      {row.attendancePercentage.toFixed(1)}%
                    </td>
                    <td className="py-2 px-2 text-right font-mono tabular-nums text-slate-700">
                      {row.assignmentScore.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-right font-mono tabular-nums text-slate-700">
                      {row.previousExamScore.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-right font-mono tabular-nums font-semibold text-purple-700">
                      {row.finalExamScore.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-slate-700">{row.performanceCategory}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
