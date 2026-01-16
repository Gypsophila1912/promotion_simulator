import type {
  SimulationFormData,
  AgeAllocation,
} from "@/lib/types/database";

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

  // 年代別配分のバリデーション
  if (data.age_allocation) {
    const ageValidation = validateAgeAllocation(
      data.age_allocation,
      data.budget
    );
    Object.assign(errors, ageValidation.errors);
  }

  // 選択月のバリデーション
  if (data.selected_months) {
    const monthValidation = validateSelectedMonths(data.selected_months);
    Object.assign(errors, monthValidation.errors);
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// 年代別配分のバリデーション
export function validateAgeAllocation(
  allocation: AgeAllocation | undefined,
  budget: number
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!allocation) {
    return { isValid: true, errors }; // 任意項目
  }

  const ageGroups = ["10代", "20代", "30代", "40代", "50代", "60代以上"];

  // 各年代の存在チェック
  for (const age of ageGroups) {
    if (allocation[age as keyof AgeAllocation] === undefined) {
      errors.age_allocation = `${age}の配分が設定されていません`;
      break;
    }
  }

  // 金額チェック（負数を防ぐ）
  for (const age of ageGroups) {
    const amount = allocation[age as keyof AgeAllocation];
    if (typeof amount !== "number" || amount < 0) {
      errors.age_allocation = `${age}の配分金額が不正です`;
      break;
    }
  }

  // 合計チェック（100円の誤差を許容）
  const total = Object.values(allocation).reduce((sum, val) => sum + val, 0);
  const tolerance = 100;

  if (Math.abs(total - budget) > tolerance) {
    errors.age_allocation = `合計金額が予算と一致しません（合計: ${total.toLocaleString()}円、予算: ${budget.toLocaleString()}円）`;
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

// 選択月のバリデーション
export function validateSelectedMonths(
  months: string[] | undefined
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!months || months.length === 0) {
    return { isValid: true, errors }; // 任意項目
  }

  const validMonths: string[] = [];
  // 5年分の月を生成（1年目～5年目）
  for (let year = 1; year <= 5; year++) {
    const yearLabel = year === 1 ? "1年目" : `${year}年目`;
    for (let month = 1; month <= 12; month++) {
      validMonths.push(`${yearLabel}${month}月`);
    }
  }

  // 重複チェック
  if (new Set(months).size !== months.length) {
    errors.selected_months = "重複した月が選択されています";
  }

  // 有効な月かチェック
  for (const month of months) {
    if (!validMonths.includes(month)) {
      errors.selected_months = `無効な月が選択されています: ${month}`;
      break;
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}
