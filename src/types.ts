export type PageId =
  | 'overview'
  | 'explorer'
  | 'eda'
  | 'training'
  | 'prediction'
  | 'insights';

export type ModelKey = 'random_forest' | 'linear_regression' | 'decision_tree';

export interface ColumnStat {
  column: string;
  dtype: string;
  missing: number;
  count: number;
  mean?: number;
  std?: number;
  min?: number;
  q25?: number;
  median?: number;
  q75?: number;
  max?: number;
  unique?: number;
  top?: string;
  freq?: number;
}

export interface DatasetPayload {
  datasetLabel: string;
  datasetKey: 'mat' | 'por' | 'custom';
  delimiter: string;
  initialRows: number;
  rowCount: number;
  columnCount: number;
  duplicatesRemoved: number;
  totalMissingImputed: number;
  columns: string[];
  columnTypes: Record<string, string>;
  missingByColumn: Record<string, number>;
  columnStats: ColumnStat[];
  correlationColumns: string[];
  correlationMatrix: number[][];
  rows: Record<string, any>[];
}

export interface RegressionMetrics {
  r2: number;
  mae: number;
  rmse: number;
}

export interface ScatterPoint {
  id: number;
  actual: number;
  predicted: number;
  residual: number;
  age: number | string;
  sex: string;
  studytime: number | string;
  absences: number | string;
}

export interface ResidualBin {
  binLabel: string;
  binCenter: number;
  range: string;
  count: number;
}

export interface FeatureImportanceItem {
  feature: string;
  label: string;
  importance: number;
  percentage: number;
}

export interface ModelReport {
  key: ModelKey;
  name: string;
  testMetrics: RegressionMetrics;
  trainMetrics: RegressionMetrics;
  actualVsPredicted: ScatterPoint[];
  residualHistogram: ResidualBin[];
  residualMean: number;
  residualStd: number;
  featureImportance: FeatureImportanceItem[];
}

export interface EvaluationPayload {
  includeGrades: boolean;
  modeLabel: string;
  features: { key: string; label: string }[];
  trainSize: number;
  testSize: number;
  testSplitRatio: number;
  randomState: number;
  maxDepth: number;
  nEstimators: number;
  engineBackend: string;
  bestModelKey: ModelKey;
  bestModelName: string;
  bestModelExplanation: string;
  models: Record<ModelKey, ModelReport>;
}

export interface StudentInputProfile {
  age: number;
  sex: 'F' | 'M';
  studytime: number;
  absences: number;
  failures: number;
  Medu: number;
  Fedu: number;
  internet: 'yes' | 'no';
  schoolsup: 'yes' | 'no';
  G1: number;
  G2: number;
}

export interface InfluencingFactor {
  feature: string;
  label: string;
  studentValue: string | number;
  cohortMean: number;
  impact: number;
  direction: 'positive' | 'negative' | 'neutral';
  importance: number;
}

export interface ImprovementSuggestion {
  title: string;
  impact: string;
  detail: string;
}

export interface PredictionPayload {
  selectedModelKey: ModelKey;
  selectedModelName: string;
  predictedGrade: number;
  outOf: number;
  percentage: number;
  cohortAverage: number;
  deltaVsCohort: number;
  classification: {
    category: string;
    tier: string;
    status: string;
    summary: string;
  };
  allModelPredictions: Record<ModelKey, number>;
  influencingFactors: InfluencingFactor[];
  suggestions: ImprovementSuggestion[];
}

export interface CohortFilters {
  school: string;
  sex: string;
  minAge: number;
  maxAge: number;
  studytime: number | 'all';
}

export interface PythonSourceFile {
  name: string;
  content: string;
}
