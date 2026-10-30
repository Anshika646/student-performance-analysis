import { CohortFilters } from '../types';

export const STUDY_LABELS: Record<number, string> = {
  1: '< 2 hrs',
  2: '2–5 hrs',
  3: '5–10 hrs',
  4: '> 10 hrs',
};

export const EDU_LABELS: Record<number, string> = {
  0: 'None (0)',
  1: 'Primary (1)',
  2: '5th–9th (2)',
  3: 'Secondary (3)',
  4: 'Higher Ed (4)',
};

export function filterDatasetRows(
  rows: Record<string, any>[],
  filters: CohortFilters
): Record<string, any>[] {
  return rows.filter((r) => {
    if (filters.school !== 'all' && r.school !== undefined && String(r.school) !== filters.school) {
      return false;
    }
    if (filters.sex !== 'all' && r.sex !== undefined && String(r.sex) !== filters.sex) {
      return false;
    }
    const age = Number(r.age ?? 17);
    if (!Number.isNaN(age) && (age < filters.minAge || age > filters.maxAge)) {
      return false;
    }
    if (filters.studytime !== 'all' && r.studytime !== undefined && Number(r.studytime) !== filters.studytime) {
      return false;
    }
    return true;
  });
}

export function computeDynamicAnalytics(rows: Record<string, any>[], corrCols: string[]) {
  const n = rows.length;
  if (n === 0) {
    return {
      totalStudents: 0,
      avgG3: 0,
      passRate: 0,
      highestG3: 0,
      lowestG3: 0,
      medianG3: 0,
      avgAbsences: 0,
      gradeDistribution: [] as { grade: number; count: number; status: string }[],
      studyVsGrade: [] as { label: string; avgG3: number; passRate: number; count: number }[],
      absencesBinned: [] as { label: string; avgG3: number; passRate: number; count: number }[],
      failuresVsGrade: [] as { label: string; avgG3: number; passRate: number; count: number }[],
      genderPerformance: [] as { label: string; avgG3: number; passRate: number; count: number }[],
      agePerformance: [] as { age: number; avgG3: number; passRate: number; count: number }[],
      familyEduPerformance: [] as {
        label: string;
        motherAvgG3: number;
        fatherAvgG3: number;
        motherCount: number;
        fatherCount: number;
      }[],
      internetPerformance: [] as { label: string; avgG3: number; passRate: number; count: number }[],
      correlationMatrix: [] as number[][],
    };
  }

  const g3Vals = rows.map((r) => Number(r.G3 ?? 0)).sort((a, b) => a - b);
  const sumG3 = g3Vals.reduce((acc, v) => acc + v, 0);
  const passCount = g3Vals.filter((v) => v >= 10).length;
  const mid = Math.floor(n / 2);
  const medianG3 = n % 2 === 1 ? g3Vals[mid] : (g3Vals[mid - 1] + g3Vals[mid]) / 2;
  const avgAbsences =
    rows.reduce((acc, r) => acc + Number(r.absences ?? 0), 0) / n;

  // 1. Grade distribution 0..20
  const bins = new Array(21).fill(0);
  for (const v of g3Vals) {
    const idx = Math.max(0, Math.min(20, Math.round(v)));
    bins[idx] += 1;
  }
  const gradeDistribution = bins.map((count, grade) => ({
    grade,
    count,
    status: grade >= 10 ? 'Pass' : 'Fail',
  }));

  // Helper group aggregator
  const groupStats = (keyFn: (r: Record<string, any>) => string | number) => {
    const map = new Map<string | number, number[]>();
    for (const r of rows) {
      const k = keyFn(r);
      const list = map.get(k) || [];
      list.push(Number(r.G3 ?? 0));
      map.set(k, list);
    }
    return map;
  };

  // 2. Study time vs G3
  const stMap = groupStats((r) => Number(r.studytime ?? 2));
  const studyVsGrade = Array.from(stMap.keys())
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => {
      const arr = stMap.get(k)!;
      const avg = arr.reduce((s, v) => s + v, 0) / arr.length;
      const pass = (arr.filter((v) => v >= 10).length * 100) / arr.length;
      return {
        label: STUDY_LABELS[Number(k)] || `Cat ${k}`,
        avgG3: Number(avg.toFixed(2)),
        passRate: Number(pass.toFixed(1)),
        count: arr.length,
      };
    });

  // 3. Absences vs Performance
  const absDefs: [string, (a: number) => boolean][] = [
    ['0 days', (a) => a === 0],
    ['1–3 days', (a) => a >= 1 && a <= 3],
    ['4–7 days', (a) => a >= 4 && a <= 7],
    ['8–14 days', (a) => a >= 8 && a <= 14],
    ['15+ days', (a) => a >= 15],
  ];
  const absencesBinned = absDefs
    .map(([label, pred]) => {
      const arr = rows
        .filter((r) => pred(Number(r.absences ?? 0)))
        .map((r) => Number(r.G3 ?? 0));
      if (!arr.length) return null;
      const avg = arr.reduce((s, v) => s + v, 0) / arr.length;
      const pass = (arr.filter((v) => v >= 10).length * 100) / arr.length;
      return {
        label,
        avgG3: Number(avg.toFixed(2)),
        passRate: Number(pass.toFixed(1)),
        count: arr.length,
      };
    })
    .filter(Boolean) as { label: string; avgG3: number; passRate: number; count: number }[];

  // 4. Previous Failures vs Grades
  const failMap = groupStats((r) => Number(r.failures ?? 0));
  const failuresVsGrade = Array.from(failMap.keys())
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => {
      const arr = failMap.get(k)!;
      const avg = arr.reduce((s, v) => s + v, 0) / arr.length;
      const pass = (arr.filter((v) => v >= 10).length * 100) / arr.length;
      return {
        label: `${k} fail${Number(k) === 1 ? '' : 's'}`,
        avgG3: Number(avg.toFixed(2)),
        passRate: Number(pass.toFixed(1)),
        count: arr.length,
      };
    });

  // 5. Gender-wise Performance
  const sexMap = groupStats((r) => String(r.sex ?? 'F'));
  const genderPerformance = Array.from(sexMap.keys())
    .sort()
    .map((k) => {
      const arr = sexMap.get(k)!;
      const avg = arr.reduce((s, v) => s + v, 0) / arr.length;
      const pass = (arr.filter((v) => v >= 10).length * 100) / arr.length;
      return {
        label: k === 'F' ? 'Female (F)' : k === 'M' ? 'Male (M)' : String(k),
        avgG3: Number(avg.toFixed(2)),
        passRate: Number(pass.toFixed(1)),
        count: arr.length,
      };
    });

  // 6. Age-wise Performance
  const ageMap = groupStats((r) => Number(r.age ?? 17));
  const agePerformance = Array.from(ageMap.keys())
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => {
      const arr = ageMap.get(k)!;
      const avg = arr.reduce((s, v) => s + v, 0) / arr.length;
      const pass = (arr.filter((v) => v >= 10).length * 100) / arr.length;
      return {
        age: Number(k),
        avgG3: Number(avg.toFixed(2)),
        passRate: Number(pass.toFixed(1)),
        count: arr.length,
      };
    });

  // 7. Family Education vs Performance (Medu & Fedu)
  const meduMap = groupStats((r) => Number(r.Medu ?? 0));
  const feduMap = groupStats((r) => Number(r.Fedu ?? 0));
  const eduLevels = Array.from(new Set([...meduMap.keys(), ...feduMap.keys()])).sort(
    (a, b) => Number(a) - Number(b)
  );
  const familyEduPerformance = eduLevels.map((lvl) => {
    const mArr = meduMap.get(lvl) || [];
    const fArr = feduMap.get(lvl) || [];
    const mAvg = mArr.length ? mArr.reduce((s, v) => s + v, 0) / mArr.length : 0;
    const fAvg = fArr.length ? fArr.reduce((s, v) => s + v, 0) / fArr.length : 0;
    return {
      label: EDU_LABELS[Number(lvl)] || `Lvl ${lvl}`,
      motherAvgG3: Number(mAvg.toFixed(2)),
      fatherAvgG3: Number(fAvg.toFixed(2)),
      motherCount: mArr.length,
      fatherCount: fArr.length,
    };
  });

  // 8. Internet Access vs Performance
  const netMap = groupStats((r) => String(r.internet ?? 'yes').toLowerCase());
  const internetPerformance = Array.from(netMap.keys())
    .sort()
    .reverse()
    .map((k) => {
      const arr = netMap.get(k)!;
      const avg = arr.reduce((s, v) => s + v, 0) / arr.length;
      const pass = (arr.filter((v) => v >= 10).length * 100) / arr.length;
      return {
        label: k === 'yes' ? 'Home Internet' : 'No Internet',
        avgG3: Number(avg.toFixed(2)),
        passRate: Number(pass.toFixed(1)),
        count: arr.length,
      };
    });

  // 9. Dynamic Pearson Correlation Matrix on filtered cohort
  const correlationMatrix = computePearsonMatrix(rows, corrCols);

  return {
    totalStudents: n,
    avgG3: Number((sumG3 / n).toFixed(2)),
    passRate: Number(((passCount * 100) / n).toFixed(1)),
    highestG3: g3Vals[n - 1],
    lowestG3: g3Vals[0],
    medianG3: Number(medianG3.toFixed(1)),
    avgAbsences: Number(avgAbsences.toFixed(1)),
    gradeDistribution,
    studyVsGrade,
    absencesBinned,
    failuresVsGrade,
    genderPerformance,
    agePerformance,
    familyEduPerformance,
    internetPerformance,
    correlationMatrix,
  };
}

function computePearsonMatrix(rows: Record<string, any>[], cols: string[]): number[][] {
  const n = rows.length;
  if (n < 2 || !cols.length) return [];
  const vectors: Record<string, number[]> = {};
  const means: Record<string, number> = {};
  const stds: Record<string, number> = {};

  for (const c of cols) {
    const vec = rows.map((r) => Number(r[c] ?? 0));
    vectors[c] = vec;
    const m = vec.reduce((s, v) => s + v, 0) / n;
    means[c] = m;
    stds[c] = Math.sqrt(vec.reduce((s, v) => s + (v - m) ** 2, 0));
  }

  return cols.map((c1) =>
    cols.map((c2) => {
      if (c1 === c2) return 1;
      if (stds[c1] === 0 || stds[c2] === 0) return 0;
      let cov = 0;
      const v1 = vectors[c1];
      const v2 = vectors[c2];
      const m1 = means[c1];
      const m2 = means[c2];
      for (let i = 0; i < n; i++) {
        cov += (v1[i] - m1) * (v2[i] - m2);
      }
      const r = cov / (stds[c1] * stds[c2]);
      return Number(Math.max(-1, Math.min(1, r)).toFixed(2));
    })
  );
}
