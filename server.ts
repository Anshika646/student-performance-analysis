import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type PerformanceCategory = 'Excellent' | 'Good' | 'Average' | 'Needs Support';

interface StudentRecord {
  studentId: string;
  gender: 'Female' | 'Male';
  studyHours: number;
  attendancePercentage: number;
  assignmentScore: number;
  previousExamScore: number;
  finalExamScore: number;
  performanceCategory: PerformanceCategory;
}

interface TrainedLinearRegression {
  isTrained: boolean;
  errorMessage?: string;
  intercept: number;
  weights: number[]; // [studyHours, attendance, assignmentScore, previousExamScore]
  trainCount: number;
  testCount: number;
  mae: number;
  r2: number;
}

const FEATURE_NAMES = [
  'Study Hours',
  'Attendance Percentage',
  'Assignment Score',
  'Previous Exam Score',
];

const CATEGORY_ORDER: PerformanceCategory[] = [
  'Excellent',
  'Good',
  'Average',
  'Needs Support',
];

function classifyScore(score: number): PerformanceCategory {
  if (score >= 80) return 'Excellent';
  if (score >= 65) return 'Good';
  if (score >= 50) return 'Average';
  return 'Needs Support';
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

// Solve linear system A * beta = b via Gaussian elimination with partial pivoting
function solveLinearSystem(A: number[][], b: number[]): number[] {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);

  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) {
        pivot = r;
      }
    }
    [M[col], M[pivot]] = [M[pivot], M[col]];

    const denom = M[col][col];
    if (Math.abs(denom) < 1e-12) continue;

    for (let j = col; j <= n; j++) {
      M[col][j] /= denom;
    }
    for (let r = 0; r < n; r++) {
      if (r !== col && Math.abs(M[r][col]) > 0) {
        const factor = M[r][col];
        for (let j = col; j <= n; j++) {
          M[r][j] -= factor * M[col][j];
        }
      }
    }
  }
  return M.map((row) => row[n]);
}

function seededShuffle(length: number, seed = 42): number[] {
  const indices = Array.from({ length }, (_, i) => i);
  let s = seed >>> 0;
  for (let i = length - 1; i > 0; i--) {
    s = (1664525 * s + 1013904223) >>> 0;
    const j = s % (i + 1);
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

function trainLinearRegression(rows: StudentRecord[]): TrainedLinearRegression {
  try {
    if (rows.length < 20) {
      throw new Error('Dataset has too few records to train Linear Regression.');
    }

    // 80% train / 20% test split
    const shuffled = seededShuffle(rows.length, 42);
    const testCount = Math.max(1, Math.round(rows.length * 0.2));
    const testSet = new Set(shuffled.slice(0, testCount));

    const trainRows: StudentRecord[] = [];
    const testRows: StudentRecord[] = [];
    rows.forEach((row, idx) => {
      if (testSet.has(idx)) testRows.push(row);
      else trainRows.push(row);
    });

    const getX = (r: StudentRecord) => [
      r.studyHours,
      r.attendancePercentage,
      r.assignmentScore,
      r.previousExamScore,
    ];

    const dim = 5; // intercept + 4 features
    const A = Array.from({ length: dim }, () => Array(dim).fill(0));
    const b = Array(dim).fill(0);

    for (const r of trainRows) {
      const vec = [1, ...getX(r)];
      const y = r.finalExamScore;
      for (let j = 0; j < dim; j++) {
        b[j] += vec[j] * y;
        for (let k = j; k < dim; k++) {
          A[j][k] += vec[j] * vec[k];
        }
      }
    }
    for (let j = 0; j < dim; j++) {
      for (let k = 0; k < j; k++) {
        A[j][k] = A[k][j];
      }
    }

    const beta = solveLinearSystem(A, b);
    const intercept = beta[0];
    const weights = beta.slice(1);

    const predict = (r: StudentRecord) => {
      const x = getX(r);
      return intercept + weights.reduce((acc, w, idx) => acc + w * x[idx], 0);
    };

    const yTrue = testRows.map((r) => r.finalExamScore);
    const yPred = testRows.map((r) => predict(r));

    const mae =
      yTrue.reduce((acc, yt, idx) => acc + Math.abs(yt - yPred[idx]), 0) /
      yTrue.length;

    const meanY = yTrue.reduce((a, c) => a + c, 0) / yTrue.length;
    const ssTot = yTrue.reduce((acc, yt) => acc + (yt - meanY) ** 2, 0);
    const ssRes = yTrue.reduce((acc, yt, idx) => acc + (yt - yPred[idx]) ** 2, 0);
    const r2 = ssTot > 1e-12 ? 1 - ssRes / ssTot : 0;

    return {
      isTrained: true,
      intercept: Number(intercept.toFixed(4)),
      weights: weights.map((w) => Number(w.toFixed(4))),
      trainCount: trainRows.length,
      testCount: testRows.length,
      mae: Number(mae.toFixed(2)),
      r2: Number(r2.toFixed(3)),
    };
  } catch (err: any) {
    return {
      isTrained: false,
      errorMessage: err?.message || 'Model training failed.',
      intercept: 0,
      weights: [0, 0, 0, 0],
      trainCount: 0,
      testCount: 0,
      mae: 0,
      r2: 0,
    };
  }
}

function loadAndAnalyzeDataset() {
  const csvPath = path.join(__dirname, 'data', 'student_performance.csv');
  const rawText = fs.readFileSync(csvPath, 'utf-8').trim();
  const lines = rawText.split(/\r?\n/);
  const headers = lines[0].split(',').map((h) => h.trim());
  const rawLines = lines.slice(1).filter((l) => l.trim().length > 0);

  // Count missing values by column on raw data
  const missingCounts: Record<string, number> = {};
  for (const h of headers) missingCounts[h] = 0;

  const parsedRaw = rawLines.map((line) => {
    const parts = line.split(',');
    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      const val = (parts[idx] ?? '').trim();
      if (val === '') missingCounts[h] += 1;
      rowObj[h] = val;
    });
    return { rawLine: line.trim(), obj: rowObj };
  });

  // Remove exact duplicate rows
  const seen = new Set<string>();
  const deduped: Record<string, string>[] = [];
  for (const item of parsedRaw) {
    if (!seen.has(item.rawLine)) {
      seen.add(item.rawLine);
      deduped.push(item.obj);
    }
  }
  const duplicatesRemoved = parsedRaw.length - deduped.length;

  // Compute column medians for imputation
  const numericCols = [
    'Study Hours',
    'Attendance Percentage',
    'Assignment Score',
    'Previous Exam Score',
    'Final Exam Score',
  ];
  const medians: Record<string, number> = {};
  for (const col of numericCols) {
    const vals = deduped
      .map((r) => Number(r[col]))
      .filter((v) => rIsFinite(v) && !Number.isNaN(v));
    medians[col] = Number(median(vals).toFixed(1));
  }

  function rIsFinite(v: number) {
    return typeof v === 'number' && Number.isFinite(v);
  }

  // Clean typed rows
  const cleanRows: StudentRecord[] = deduped.map((r) => {
    const parseNum = (col: string) => {
      const raw = r[col];
      if (!raw) return medians[col];
      const n = Number(raw);
      return Number.isFinite(n) ? n : medians[col];
    };

    const finalScore = parseNum('Final Exam Score');
    const catRaw = r['Performance Category'] as PerformanceCategory;
    const cat = CATEGORY_ORDER.includes(catRaw) ? catRaw : classifyScore(finalScore);

    return {
      studentId: r['Student ID'] || 'STU0000',
      gender: r['Gender'] === 'Male' ? 'Male' : 'Female',
      studyHours: parseNum('Study Hours'),
      attendancePercentage: parseNum('Attendance Percentage'),
      assignmentScore: parseNum('Assignment Score'),
      previousExamScore: parseNum('Previous Exam Score'),
      finalExamScore: finalScore,
      performanceCategory: cat,
    };
  });

  const n = cleanRows.length;
  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / Math.max(1, arr.length);

  const finalScores = cleanRows.map((r) => r.finalExamScore);
  const avgFinalScore = Number(avg(finalScores).toFixed(2));
  const avgAttendance = Number(avg(cleanRows.map((r) => r.attendancePercentage)).toFixed(1));
  const avgStudyHours = Number(avg(cleanRows.map((r) => r.studyHours)).toFixed(2));
  const minScore = Math.min(...finalScores);
  const maxScore = Math.max(...finalScores);

  const highAttRows = cleanRows.filter((r) => r.attendancePercentage >= 75);
  const lowAttRows = cleanRows.filter((r) => r.attendancePercentage < 75);
  const highStudyRows = cleanRows.filter((r) => r.studyHours >= 5);
  const lowStudyRows = cleanRows.filter((r) => r.studyHours < 5);

  const categoryBreakdown = CATEGORY_ORDER.map((cat) => {
    const sub = cleanRows.filter((r) => r.performanceCategory === cat);
    return {
      category: cat,
      count: sub.length,
      avgFinalScore: Number(avg(sub.map((r) => r.finalExamScore)).toFixed(1)),
      avgStudyHours: Number(avg(sub.map((r) => r.studyHours)).toFixed(1)),
      avgAttendance: Number(avg(sub.map((r) => r.attendancePercentage)).toFixed(1)),
      avgAssignment: Number(avg(sub.map((r) => r.assignmentScore)).toFixed(1)),
    };
  });

  const genderComparison = (['Female', 'Male'] as const).map((g) => {
    const sub = cleanRows.filter((r) => r.gender === g);
    return {
      gender: g,
      count: sub.length,
      avgFinalScore: Number(avg(sub.map((r) => r.finalExamScore)).toFixed(1)),
      avgAttendance: Number(avg(sub.map((r) => r.attendancePercentage)).toFixed(1)),
      avgStudyHours: Number(avg(sub.map((r) => r.studyHours)).toFixed(1)),
    };
  });

  const supportNeededStudents = cleanRows
    .filter((r) => r.finalExamScore < 50 || r.attendancePercentage < 75)
    .sort((a, b) => a.finalExamScore - b.finalExamScore);

  // Histogram bins (20..100 in steps of 10)
  const scoreHistogram = Array.from({ length: 8 }, (_, idx) => {
    const lo = 20 + idx * 10;
    const hi = lo + 10;
    const count = cleanRows.filter((r) =>
      idx === 7
        ? r.finalExamScore >= lo && r.finalExamScore <= hi
        : r.finalExamScore >= lo && r.finalExamScore < hi
    ).length;
    return {
      range: `${lo}–${hi}`,
      midpoint: lo + 5,
      count,
    };
  });

  // Box plot stats per category
  const boxPlotStats = CATEGORY_ORDER.map((cat) => {
    const sorted = cleanRows
      .filter((r) => r.performanceCategory === cat)
      .map((r) => r.finalExamScore)
      .sort((a, b) => a - b);
    return {
      category: cat,
      count: sorted.length,
      min: Number((sorted[0] ?? 0).toFixed(1)),
      q1: Number(quantile(sorted, 0.25).toFixed(1)),
      median: Number(quantile(sorted, 0.5).toFixed(1)),
      q3: Number(quantile(sorted, 0.75).toFixed(1)),
      max: Number((sorted[sorted.length - 1] ?? 0).toFixed(1)),
    };
  });

  // Correlation matrix for the 5 numerical columns
  const vectors: number[][] = [
    cleanRows.map((r) => r.studyHours),
    cleanRows.map((r) => r.attendancePercentage),
    cleanRows.map((r) => r.assignmentScore),
    cleanRows.map((r) => r.previousExamScore),
    cleanRows.map((r) => r.finalExamScore),
  ];
  const corrColumns = [
    'Study Hours',
    'Attendance %',
    'Assignment',
    'Previous Exam',
    'Final Exam',
  ];
  const correlationMatrix = vectors.map((v1, i) =>
    vectors.map((v2, j) => {
      if (i === j) return 1.0;
      const m1 = avg(v1);
      const m2 = avg(v2);
      let num = 0;
      let d1 = 0;
      let d2 = 0;
      for (let k = 0; k < v1.length; k++) {
        const a = v1[k] - m1;
        const b = v2[k] - m2;
        num += a * b;
        d1 += a * a;
        d2 += b * b;
      }
      const denom = Math.sqrt(d1 * d2);
      return denom > 1e-12 ? Number((num / denom).toFixed(2)) : 0;
    })
  );

  const mlModel = trainLinearRegression(cleanRows);

  const totalMissingFound = Object.values(missingCounts).reduce((a, b) => a + b, 0);

  return {
    trainedModel: mlModel,
    dashboard: {
      isSyntheticData: true,
      overview: {
        totalStudents: n,
        avgFinalScore,
        avgAttendance,
        avgStudyHours,
      },
      cleaning: {
        rawRowCount: parsedRaw.length,
        duplicatesRemoved,
        totalMissingFound,
        totalMissingAfter: 0,
        cleanRowCount: n,
        missingByColumn: headers.map((col) => ({
          column: col,
          missingCount: missingCounts[col] || 0,
        })),
      },
      analysis: {
        minScore,
        maxScore,
        avgScore: avgFinalScore,
        highAttendanceAvg: Number(avg(highAttRows.map((r) => r.finalExamScore)).toFixed(1)),
        lowAttendanceAvg: Number(avg(lowAttRows.map((r) => r.finalExamScore)).toFixed(1)),
        highStudyAvg: Number(avg(highStudyRows.map((r) => r.finalExamScore)).toFixed(1)),
        lowStudyAvg: Number(avg(lowStudyRows.map((r) => r.finalExamScore)).toFixed(1)),
        categoryBreakdown,
        genderComparison,
        supportNeededCount: supportNeededStudents.length,
        supportNeededStudents: supportNeededStudents.slice(0, 20),
      },
      charts: {
        categoryBar: categoryBreakdown,
        scoreHistogram,
        scatterPoints: cleanRows.slice(0, 250).map((r) => ({
          studentId: r.studentId,
          studyHours: r.studyHours,
          finalExamScore: r.finalExamScore,
          category: r.performanceCategory,
        })),
        boxPlotStats,
        correlationColumns: corrColumns,
        correlationMatrix,
      },
      mlModel: {
        isTrained: mlModel.isTrained,
        errorMessage: mlModel.errorMessage,
        trainCount: mlModel.trainCount,
        testCount: mlModel.testCount,
        mae: mlModel.mae,
        r2: mlModel.r2,
        intercept: mlModel.intercept,
        coefficients: FEATURE_NAMES.map((feature, idx) => ({
          feature,
          weight: mlModel.weights[idx] ?? 0,
        })),
      },
      sampleRows: cleanRows.slice(0, 15),
    },
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const { trainedModel, dashboard } = loadAndAnalyzeDataset();

  app.get('/api/dashboard', (_req, res) => {
    res.json(dashboard);
  });

  app.post('/api/predict', (req, res) => {
    if (!trainedModel.isTrained) {
      res.status(400).json({
        error: 'Linear Regression model is not trained yet. Prediction is unavailable.',
      });
      return;
    }

    const studyHours = Number(req.body?.studyHours);
    const attendance = Number(req.body?.attendancePercentage);
    const assignment = Number(req.body?.assignmentScore);
    const prevExam = Number(req.body?.previousExamScore);

    if (
      [studyHours, attendance, assignment, prevExam].some(
        (v) => !Number.isFinite(v)
      )
    ) {
      res.status(400).json({ error: 'Please enter valid numbers for all 4 inputs.' });
      return;
    }

    const rawPred =
      trainedModel.intercept +
      trainedModel.weights[0] * studyHours +
      trainedModel.weights[1] * attendance +
      trainedModel.weights[2] * assignment +
      trainedModel.weights[3] * prevExam;

    const predictedScore = Number(Math.max(0, Math.min(100, rawPred)).toFixed(1));
    res.json({
      predictedScore,
      predictedCategory: classifyScore(predictedScore),
    });
  });

  app.get('/api/project-files', (_req, res) => {
    const specs = [
      { name: 'app.py', description: 'Beginner-friendly Streamlit dashboard script' },
      { name: 'requirements.txt', description: 'Basic Python libraries list' },
      { name: 'README.md', description: 'VS Code setup & interview preparation guide' },
    ];
    const files = specs
      .filter((s) => fs.existsSync(path.join(__dirname, s.name)))
      .map((s) => ({
        name: s.name,
        description: s.description,
        content: fs.readFileSync(path.join(__dirname, s.name), 'utf-8'),
      }));
    res.json({ files });
  });

  app.get('/api/dataset/download', (_req, res) => {
    const filePath = path.join(__dirname, 'data', 'student_performance.csv');
    if (!fs.existsSync(filePath)) {
      res.status(404).send('Dataset not found');
      return;
    }
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="student_performance.csv"');
    fs.createReadStream(filePath).pipe(res);
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Student Performance Dashboard running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
