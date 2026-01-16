// データベース型定義

// 年代別予算配分
export interface AgeAllocation {
  "10代": number;
  "20代": number;
  "30代": number;
  "40代": number;
  "50代": number;
  "60代以上": number;
}

// 月別予算配分
export interface MonthAllocation {
  [month: string]: number; // "1月": 50000 など
}

export interface Simulation {
  id: string;
  user_id: string;
  company_name: string;
  industry: string;
  budget: number;
  details: string | null;
  analysis_result: Record<string, number> | null;
  ai_reasoning: string | null;
  age_allocation: AgeAllocation | null; // 追加
  month_allocation: MonthAllocation | null; // 追加
  selected_months: string[] | null; // 追加
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
  // HomeDisplayとdevelopの両方のフィールドを統合
  ad_methods: string[] | any;
  ad_purpose: string;
  target_audience: string;
}

export interface DiagnosisHistory {
  id: string;
  user_id: string;
  company_name: string;
  budget: number;
  answers: string[];      
  created_at: string;
}

// フォーム用の型
export interface SimulationFormData {
  company_name: string;
  industry: string;
  budget: number;
  details?: string;
  age_allocation?: AgeAllocation; // 追加
  selected_months?: string[]; // 追加
  regenerate_ai?: boolean; // 追加（編集時）
}

export interface ReviewFormData {
  company_name: string;
  rating: number;
  comment: string;
}

// HomeDisplayからの定義
export interface DiagnosisFormData {
  company_name: string;
  budget: number;
  answers: string[];
}

// developからの定義：AI投資配分提案の型定義
export interface InvestmentAllocation {
  category: string; // カテゴリー名 (例: "SNS広告", "YouTube広告")
  percentage: number; // 配分割合 (0-100)
  amount: number; // 配分金額
  reasoning: string; // このカテゴリーへの配分理由
}

// 年代別配分提案（AI生成時）
export interface AgeAllocationProposal {
  allocation: AgeAllocation;
  reasoning: { [ageGroup: string]: string };
  summary: string;
}

// 月別配分提案（AI生成時）
export interface MonthAllocationProposal {
  allocation: MonthAllocation;
  reasoning: { [month: string]: string };
  summary: string;
  seasonalInsights: string;
}

export interface AIAnalysisResult {
  // パターン1: ユーザー指定カテゴリーベース
  userBased: {
    allocations: InvestmentAllocation[];
    totalBudget: number;
    summary: string; // 全体的な提案サマリー
  };
  // パターン2: AI完全お任せ
  aiBased: {
    allocations: InvestmentAllocation[];
    totalBudget: number;
    summary: string;
    recommendedCategories: string[]; // AIが提案した新しいカテゴリー
  };
  ageAllocation?: AgeAllocationProposal; // 追加
  monthAllocation?: MonthAllocationProposal; // 追加
  generatedAt: string; // 生成日時
}