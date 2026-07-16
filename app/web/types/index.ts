// ── Prediction types ──────────────────────────────────────────
export interface PredictionInput {
  _BMI5:    number;
  _AGE80:   number;
  SEXVAR:   number;
  _IMPRACE: number;
  GENHLTH:  number;
  PHYSHLTH: number;
  SMOKE100: number;
  _TOTINDA: number;
  EDUCA:    number;
  INCOME3:  number;
  _RFHYPE6: number;
  _RFCHOL3: number;
  CHCKDNY2: number;
  _MICHD:   number;
}

export interface PredictionResponse {
  id?:              number; // only present when the prediction was saved (authenticated user)
  prediction:       number;
  probability:      number;
  risk_level:       RiskLevel;
  risk_percentage:  number;
  top_risk_factor:  string;
  top_risk_label:   string;
  recommendation:   string;
  shap_values?:     Record<string, number>;
  shap_labels?:     Record<string, number>;
}

export type RiskLevel = "High Risk" | "Moderate Risk" | "Low Risk";

// ── Batch types ───────────────────────────────────────────────
export interface BatchJob {
  id:                   number;
  filename:             string;
  total_rows:           number;
  high_risk_count:      number;
  moderate_risk_count:  number;
  low_risk_count:       number;
  avg_probability:      number;
  median_probability:   number;
  std_probability:      number;
  status:               "pending" | "processing" | "completed" | "failed";
  global_shap?:         Record<string, number>;
  created_at:           string;
  completed_at?:        string;
}

export interface BatchAnalytics extends BatchJob {
  high_risk_pct:        number;
  moderate_risk_pct:    number;
  low_risk_pct:         number;
  risk_by_age:          AgeRiskData[];
  risk_by_bmi:          BmiRiskData[];
  top_risk_factors:     TopFactor[];
}

export interface AgeRiskData {
  age_group:        string;
  count:            number;
  high_risk_count:  number;
  avg_probability:  number;
}

export interface BmiRiskData {
  bmi_range:        string;
  count:            number;
  avg_probability:  number;
}

export interface TopFactor {
  feature:    string;
  importance: number;
}

// ── History types ─────────────────────────────────────────────
export interface PredictionHistoryItem {
  id:               number;
  prediction:       number;
  probability:      number;
  risk_level:       RiskLevel;
  top_risk_factor?: string;
  recommendation?:  string;
  method:           "single" | "batch";
  created_at:       string;
  input_features:   Record<string, number>;
}

// ── Auth types ────────────────────────────────────────────────
export interface User {
  id:          number;
  email:       string;
  name:        string;
  avatar_url?: string;
  created_at:  string;
}

export interface DashboardSummary {
  total_predictions:   number;
  avg_probability:     number;
  highest_risk:        number;
  high_risk_count:     number;
  recent_predictions:  RecentPrediction[];
}

export interface RecentPrediction {
  id:          number;
  risk_level:  RiskLevel;
  probability: number;
  created_at:  string;
}

// ── Research paper type ───────────────────────────────────────
export interface ResearchPaper {
  authors:    string;
  year:       number;
  title:      string;
  journal:    string;
  volume:     string;
  keyFinding: string;
  relevance:  string;
  url:        string;
  tags:       string[];
}

// ── NextAuth session extension ────────────────────────────────
declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
  }
}
