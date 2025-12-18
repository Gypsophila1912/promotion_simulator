// データベース型定義

export interface Simulation {
  id: string;
  user_id: string;
  company_name: string;
  industry: string;
  budget: number;
  details: string | null;
  analysis_result: Record<string, number> | null;
  ai_reasoning: string | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  company_name: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

// フォーム用の型
export interface SimulationFormData {
  company_name: string;
  industry: string;
  budget: number;
  details?: string;
}

export interface ReviewFormData {
  company_name: string;
  rating: number;
  comment: string;
}
