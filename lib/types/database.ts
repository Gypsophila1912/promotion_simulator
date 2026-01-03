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

// AI投資配分提案の型定義
export interface InvestmentAllocation {
  category: string;      // カテゴリー名 (例: "SNS広告", "YouTube広告")
  percentage: number;    // 配分割合 (0-100)
  amount: number;        // 配分金額
  reasoning: string;     // このカテゴリーへの配分理由
}

export interface AIAnalysisResult {
  // パターン1: ユーザー指定カテゴリーベース
  userBased: {
    allocations: InvestmentAllocation[];
    totalBudget: number;
    summary: string;  // 全体的な提案サマリー
  };
  // パターン2: AI完全お任せ
  aiBased: {
    allocations: InvestmentAllocation[];
    totalBudget: number;
    summary: string;
    recommendedCategories: string[];  // AIが提案した新しいカテゴリー
  };
  generatedAt: string;  // 生成日時
}
