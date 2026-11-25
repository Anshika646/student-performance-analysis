export type TabId =
  | 'overview'
  | 'analysis'
  | 'visualizations'
  | 'prediction';

export type PerformanceCategory =
  | 'Excellent'
  | 'Good'
  | 'Average'
  | 'Needs Support';

export interface StudentRecord {
  studentId: string;
  gender: 'Female' | 'Male';
  studyHours: number;
  attendancePercentage: number;
  assignmentScore: number;
  previousExamScore: number;
  finalExamScore: number;
  performanceCategory: PerformanceCategory;
}

export interface MissingColumnCount {
  column: string;
  missingCount: number;
}

export interface CategoryAverageItem {
  category: PerformanceCategory;
  count: number;
  avgFinalScore: number;
  avgStudyHours: number;
  avgAttendance: number;
  avgAssignment: number;
}

export interface GenderAverageItem {
  gender: string;
  count: number;
  avgFinalScore: number;
  avgAttendance: number;
  avgStudyHours: number;
}

export interface HistogramBin {
  range: string;
  midpoint: number;
  count: number;
}

export interface BoxPlotStat {
  category: PerformanceCategory;
  count: number;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
}

export interface LinearRegressionSummary {
  isTrained: boolean;
  errorMessage?: string;
  trainCount: number;
  testCount: number;
  mae: number;
  r2: number;
  intercept: number;
  coefficients: {
    feature: string;
    weight: number;
  }[];
}

export interface DashboardPayload {
  isSyntheticData: boolean;
  overview: {
    totalStudents: number;
    avgFinalScore: number;
    avgAttendance: number;
    avgStudyHours: number;
  };
  cleaning: {
    rawRowCount: number;
    duplicatesRemoved: number;
    totalMissingFound: number;
    totalMissingAfter: number;
    cleanRowCount: number;
    missingByColumn: MissingColumnCount[];
  };
  analysis: {
    minScore: number;
    maxScore: number;
    avgScore: number;
    highAttendanceAvg: number;
    lowAttendanceAvg: number;
    highStudyAvg: number;
    lowStudyAvg: number;
    categoryBreakdown: CategoryAverageItem[];
    genderComparison: GenderAverageItem[];
    supportNeededCount: number;
    supportNeededStudents: StudentRecord[];
  };
  charts: {
    categoryBar: CategoryAverageItem[];
    scoreHistogram: HistogramBin[];
    scatterPoints: {
      studentId: string;
      studyHours: number;
      finalExamScore: number;
      category: PerformanceCategory;
    }[];
    boxPlotStats: BoxPlotStat[];
    correlationColumns: string[];
    correlationMatrix: number[][];
  };
  mlModel: LinearRegressionSummary;
  sampleRows: StudentRecord[];
}

export interface PredictionResult {
  predictedScore: number;
  predictedCategory: PerformanceCategory;
}

export interface ProjectFileItem {
  name: string;
  description: string;
  content: string;
}
