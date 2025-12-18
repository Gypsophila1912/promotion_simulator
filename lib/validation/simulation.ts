import type { SimulationFormData } from "@/lib/types/database";

export function validateSimulation(data: SimulationFormData): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  // 会社名のバリデーション
  if (!data.company_name || data.company_name.trim().length === 0) {
    errors.company_name = "会社名を入力してください";
  } else if (data.company_name.length > 100) {
    errors.company_name = "会社名は100文字以内で入力してください";
  }

  // 投資カテゴリーのバリデーション
  if (!data.industry || data.industry.trim().length === 0) {
    errors.industry = "投資カテゴリーを入力してください";
  } else if (data.industry.length > 50) {
    errors.industry = "投資カテゴリーは50文字以内で入力してください";
  }

  // 予算のバリデーション
  if (!data.budget || data.budget <= 0) {
    errors.budget = "予算は1円以上で入力してください";
  } else if (data.budget > 1000000000) {
    errors.budget = "予算は10億円以下で入力してください";
  }

  // 悩み・詳細のバリデーション（任意項目）
  if (data.details && data.details.length > 1000) {
    errors.details = "悩みの詳細は1000文字以内で入力してください";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
