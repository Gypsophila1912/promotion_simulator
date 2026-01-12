/**
 * 投資配分アドバイザー
 * Gemini APIを使用して投資配分の提案を生成
 */

import { callGeminiAPI } from "./gemini";
import type {
  AIAnalysisResult,
  InvestmentAllocation,
  AgeAllocation,
  AgeAllocationProposal,
  MonthAllocation,
  MonthAllocationProposal,
} from "@/lib/types/database";

interface InvestmentInput {
  companyName: string;
  industry: string;      // ユーザー指定の投資カテゴリー
  budget: number;
  details?: string;      // 悩み・相談内容
}

/**
 * AIからのレスポンス内のallocation要素の型
 */
interface ParsedAllocation {
  category: string;
  percentage: number;
  amount: number;
  reasoning: string;
}

/**
 * AIからのレスポンス全体の型
 */
interface ParsedResponse {
  allocations: ParsedAllocation[];
  summary: string;
  recommendedCategories?: string[];
}

/**
 * ユーザー入力を安全にエスケープ
 */
function escapeUserInput(input: string): string {
  // JSON文字列としてエスケープし、前後の引用符を除去
  return JSON.stringify(input).slice(1, -1);
}

/**
 * プロンプト生成: パターン1（ユーザー指定カテゴリーベース）
 */
function buildUserBasedPrompt(input: InvestmentInput): string {
  const { companyName, industry, budget, details } = input;

  // ユーザー入力をエスケープしてプロンプトインジェクションを防止
  const safeCompanyName = escapeUserInput(companyName);
  const safeIndustry = escapeUserInput(industry);
  const safeDetails = details ? escapeUserInput(details) : "";

  return `あなたはマーケティング投資の専門家です。以下の情報に基づいて、投資配分を提案してください。

【会社情報】
- 会社名: ${safeCompanyName}
- 投資カテゴリー: ${safeIndustry}
- 予算: ${budget.toLocaleString()}円
${details ? `- 相談内容: ${safeDetails}` : ""}

【指示】
1. ユーザーが指定した投資カテゴリー「${safeIndustry}」を基に、具体的なサブカテゴリーに分けて配分を提案してください
2. 例: 「SNS広告、YouTube広告」→「Instagram広告(40%)」「Facebook広告(30%)」「YouTube TrueView広告(30%)」
3. 各カテゴリーへの配分割合(%)、金額、選定理由を説明してください
4. 合計が100%になるようにしてください

【回答形式】(必ずJSON形式で回答してください)
{
  "allocations": [
    {
      "category": "カテゴリー名",
      "percentage": 割合(数値),
      "amount": 金額(数値),
      "reasoning": "選定理由"
    }
  ],
  "summary": "全体的な提案サマリー（200文字程度）"
}`;
}

/**
 * プロンプト生成: パターン2（AI完全お任せ）
 */
function buildAIBasedPrompt(input: InvestmentInput): string {
  const { companyName, budget, details } = input;

  // ユーザー入力をエスケープしてプロンプトインジェクションを防止
  const safeCompanyName = escapeUserInput(companyName);
  const safeDetails = details ? escapeUserInput(details) : "";

  return `あなたはマーケティング投資の専門家です。以下の情報に基づいて、最適な投資配分を自由に提案してください。

【会社情報】
- 会社名: ${safeCompanyName}
- 予算: ${budget.toLocaleString()}円
${details ? `- 相談内容: ${safeDetails}` : ""}

【指示】
1. 投資カテゴリーも含めて、完全に自由に提案してください
2. 現代のマーケティングトレンドを考慮し、効果的な投資先を選んでください
3. SNS広告、コンテンツマーケティング、SEO、インフルエンサーマーケティングなど、多様な選択肢から最適な組み合わせを提案
4. 各カテゴリーへの配分割合(%)、金額、選定理由を説明してください
5. 合計が100%になるようにしてください

【回答形式】(必ずJSON形式で回答してください)
{
  "allocations": [
    {
      "category": "カテゴリー名",
      "percentage": 割合(数値),
      "amount": 金額(数値),
      "reasoning": "選定理由"
    }
  ],
  "summary": "全体的な提案サマリー（200文字程度）",
  "recommendedCategories": ["提案した主要カテゴリー1", "カテゴリー2", ...]
}`;
}

/**
 * プロンプト生成: 年代別予算配分
 */
function buildAgeAllocationPrompt(input: InvestmentInput): string {
  const { companyName, industry, budget, details } = input;

  // ユーザー入力をエスケープしてプロンプトインジェクションを防止
  const safeCompanyName = escapeUserInput(companyName);
  const safeIndustry = escapeUserInput(industry);
  const safeDetails = details ? escapeUserInput(details) : "";

  return `あなたはマーケティング投資の専門家です。年代別のターゲット予算配分を提案してください。

【会社情報】
- 会社名: ${safeCompanyName}
- 投資カテゴリー: ${safeIndustry}
- 総予算: ${budget.toLocaleString()}円
${details ? `- 相談内容: ${safeDetails}` : ""}

【指示】
1. 以下の6つの年代区分で予算配分を提案してください:
   - 10代, 20代, 30代, 40代, 50代, 60代以上

2. 各年代への配分理由を説明してください

3. 業界「${safeIndustry}」の特性を考慮し、メインターゲット層に重点配分してください

4. 合計が総予算${budget.toLocaleString()}円と完全に一致するようにしてください

【回答形式】(必ずJSON形式で回答してください)
{
  "allocation": {
    "10代": 金額(数値),
    "20代": 金額(数値),
    "30代": 金額(数値),
    "40代": 金額(数値),
    "50代": 金額(数値),
    "60代以上": 金額(数値)
  },
  "reasoning": {
    "10代": "配分理由",
    "20代": "配分理由",
    "30代": "配分理由",
    "40代": "配分理由",
    "50代": "配分理由",
    "60代以上": "配分理由"
  },
  "summary": "全体的な年代別配分戦略のサマリー（200文字程度）"
}`;
}

/**
 * プロンプト生成: 月別予算配分
 */
function buildMonthAllocationPrompt(
  input: InvestmentInput,
  selectedMonths: string[]
): string {
  const { companyName, industry, budget, details } = input;

  // ユーザー入力をエスケープしてプロンプトインジェクションを防止
  const safeCompanyName = escapeUserInput(companyName);
  const safeIndustry = escapeUserInput(industry);
  const safeDetails = details ? escapeUserInput(details) : "";
  // selectedMonthsは内部生成されたデータなのでエスケープ不要だが、念のため
  const monthList = selectedMonths.map(m => escapeUserInput(m)).join("、");

  return `あなたはマーケティング投資の専門家です。選択された月への最適な予算配分を提案してください。

【会社情報】
- 会社名: ${safeCompanyName}
- 投資カテゴリー: ${safeIndustry}
- 総予算: ${budget.toLocaleString()}円
- 掲載希望月: ${monthList}
${details ? `- 相談内容: ${safeDetails}` : ""}

【指示】
1. 選択された月（${monthList}）に対して、最適な予算配分を提案してください

2. 業界「${safeIndustry}」の繁忙期、閑散期、季節トレンドを考慮してください

3. 各月への配分理由を説明してください

4. 合計が総予算${budget.toLocaleString()}円と完全に一致するようにしてください

【回答形式】(必ずJSON形式で回答してください)
{
  "allocation": {
    ${selectedMonths.map((m) => `"${m}": 金額(数値)`).join(",\n    ")}
  },
  "reasoning": {
    ${selectedMonths.map((m) => `"${m}": "配分理由"`).join(",\n    ")}
  },
  "summary": "全体的な月別配分戦略のサマリー（200文字程度）",
  "seasonalInsights": "業界の季節性・トレンド分析（150文字程度）"
}`;
}

/**
 * レスポンステキストからJSON部分を抽出
 */
function extractJSON(responseText: string): string {
  let jsonText = responseText.trim();

  const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    jsonText = jsonMatch[1].trim();
  } else if (responseText.includes("```")) {
    const match = responseText.match(/```\s*([\s\S]*?)\s*```/);
    if (match) {
      jsonText = match[1].trim();
    }
  }

  return jsonText;
}

/**
 * 年代別配分レスポンスをパース
 */
function parseAgeAllocationResponse(
  responseText: string,
  budget: number
): AgeAllocationProposal {
  const jsonText = extractJSON(responseText);

  try {
    const parsed: unknown = JSON.parse(jsonText);

    if (typeof parsed !== "object" || parsed === null) {
      throw new Error("Invalid response: not an object");
    }

    const response = parsed as Record<string, unknown>;

    // allocation の検証
    if (!response.allocation || typeof response.allocation !== "object") {
      throw new Error("Invalid response: allocation missing");
    }

    const allocation = response.allocation as Record<string, unknown>;
    const ageGroups = ["10代", "20代", "30代", "40代", "50代", "60代以上"];

    for (const age of ageGroups) {
      if (typeof allocation[age] !== "number" || allocation[age] < 0) {
        throw new Error(`Invalid allocation for ${age}`);
      }
    }

    // 合計チェックと調整（1%の誤差を許容）
    const total = Object.values(allocation as AgeAllocation).reduce(
      (sum, val) => sum + val,
      0
    );
    const tolerance = budget * 0.01;

    if (Math.abs(total - budget) > tolerance) {
      console.warn(
        `Age allocation total mismatch: ${total} vs ${budget}, adjusting...`
      );
      const maxAge = ageGroups.reduce((max, age) =>
        (allocation[age] as number) > (allocation[max] as number) ? age : max
      );
      allocation[maxAge] = (allocation[maxAge] as number) + (budget - total);
    }

    // reasoning の検証
    if (!response.reasoning || typeof response.reasoning !== "object") {
      throw new Error("Invalid response: reasoning missing");
    }

    // summary の検証
    if (typeof response.summary !== "string") {
      throw new Error("Invalid response: summary missing");
    }

    return {
      allocation: allocation as AgeAllocation,
      reasoning: response.reasoning as { [key: string]: string },
      summary: response.summary,
    };
  } catch (error) {
    console.error("Failed to parse age allocation response");
    throw new Error(
      `Failed to parse AI response: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * 月別配分レスポンスをパース
 */
function parseMonthAllocationResponse(
  responseText: string,
  budget: number,
  selectedMonths: string[]
): MonthAllocationProposal {
  const jsonText = extractJSON(responseText);

  try {
    const parsed: unknown = JSON.parse(jsonText);

    if (typeof parsed !== "object" || parsed === null) {
      throw new Error("Invalid response: not an object");
    }

    const response = parsed as Record<string, unknown>;

    // allocation の検証
    if (!response.allocation || typeof response.allocation !== "object") {
      throw new Error("Invalid response: allocation missing");
    }

    const allocation = response.allocation as Record<string, unknown>;

    // 選択された月のみ存在するか確認
    for (const month of selectedMonths) {
      if (typeof allocation[month] !== "number" || allocation[month] < 0) {
        throw new Error(`Invalid allocation for ${month}`);
      }
    }

    // 合計チェックと調整
    const total = Object.values(allocation).reduce(
      (sum, val) => sum + (val as number),
      0
    );
    const tolerance = budget * 0.01;

    if (Math.abs(total - budget) > tolerance) {
      console.warn(
        `Month allocation total mismatch: ${total} vs ${budget}, adjusting...`
      );
      const maxMonth = selectedMonths.reduce((max, month) =>
        (allocation[month] as number) > (allocation[max] as number)
          ? month
          : max
      );
      allocation[maxMonth] =
        (allocation[maxMonth] as number) + (budget - total);
    }

    // その他フィールドの検証
    if (!response.reasoning || typeof response.reasoning !== "object") {
      throw new Error("Invalid response: reasoning missing");
    }
    if (typeof response.summary !== "string") {
      throw new Error("Invalid response: summary missing");
    }
    if (typeof response.seasonalInsights !== "string") {
      throw new Error("Invalid response: seasonalInsights missing");
    }

    return {
      allocation: allocation as MonthAllocation,
      reasoning: response.reasoning as { [key: string]: string },
      summary: response.summary,
      seasonalInsights: response.seasonalInsights,
    };
  } catch (error) {
    console.error("Failed to parse month allocation response");
    throw new Error(
      `Failed to parse AI response: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * allocation要素の詳細バリデーション
 */
function validateAllocation(item: unknown, index: number): asserts item is ParsedAllocation {
  if (typeof item !== "object" || item === null) {
    throw new Error(`Allocation at index ${index} is not an object`);
  }

  const allocation = item as Record<string, unknown>;

  // category のバリデーション
  if (typeof allocation.category !== "string" || allocation.category.trim() === "") {
    throw new Error(`Allocation at index ${index} has invalid category (must be non-empty string)`);
  }

  // percentage のバリデーション
  if (typeof allocation.percentage !== "number" || isNaN(allocation.percentage)) {
    throw new Error(`Allocation at index ${index} has invalid percentage (must be a number)`);
  }
  if (allocation.percentage < 0 || allocation.percentage > 100) {
    throw new Error(`Allocation at index ${index} has percentage out of range: ${allocation.percentage}% (must be 0-100)`);
  }

  // amount のバリデーション（存在チェックのみ、値は後で計算し直す）
  if (typeof allocation.amount !== "number" || isNaN(allocation.amount)) {
    throw new Error(`Allocation at index ${index} has invalid amount (must be a number)`);
  }
  if (allocation.amount < 0) {
    throw new Error(`Allocation at index ${index} has negative amount: ${allocation.amount}`);
  }

  // reasoning のバリデーション
  if (typeof allocation.reasoning !== "string" || allocation.reasoning.trim() === "") {
    throw new Error(`Allocation at index ${index} has invalid reasoning (must be non-empty string)`);
  }
}

/**
 * JSONレスポンスをパースして検証
 */
function parseAndValidateResponse(responseText: string): ParsedResponse {
  // JSONブロックを抽出（```json ... ``` で囲まれている場合に対応）
  let jsonText = responseText.trim();

  // ```json ... ``` 形式の抽出を試みる
  const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    jsonText = jsonMatch[1].trim();
  } else if (responseText.includes("```")) {
    // ```のみで囲まれている場合
    const match = responseText.match(/```\s*([\s\S]*?)\s*```/);
    if (match) {
      jsonText = match[1].trim();
    }
  } else if (responseText.startsWith("{")) {
    // すでにJSON形式の場合はそのまま使用
    jsonText = responseText;
  }

  try {
    const parsed: unknown = JSON.parse(jsonText);

    // パース結果が object かチェック
    if (typeof parsed !== "object" || parsed === null) {
      throw new Error("Invalid response: response is not an object");
    }

    const response = parsed as Record<string, unknown>;

    // allocations のバリデーション
    if (!response.allocations || !Array.isArray(response.allocations)) {
      throw new Error("Invalid response: allocations array missing");
    }

    if (response.allocations.length === 0) {
      throw new Error("Invalid response: allocations array is empty");
    }

    // 各allocation要素の詳細バリデーション
    response.allocations.forEach((item, index) => {
      validateAllocation(item, index);
    });

    // summary のバリデーション
    if (typeof response.summary !== "string" || response.summary.trim() === "") {
      throw new Error("Invalid response: summary is missing or empty");
    }

    // recommendedCategories は optional なので存在する場合のみチェック
    if (response.recommendedCategories !== undefined) {
      if (!Array.isArray(response.recommendedCategories)) {
        throw new Error("Invalid response: recommendedCategories must be an array");
      }
      response.recommendedCategories.forEach((category, index) => {
        if (typeof category !== "string" || category.trim() === "") {
          throw new Error(`Invalid category at index ${index} in recommendedCategories`);
        }
      });
    }

    // 型アサーション: この時点で allocations は ParsedAllocation[] であることが保証されている
    const allocations = response.allocations as ParsedAllocation[];

    // 合計が100%になっているか確認
    const totalPercentage = allocations.reduce(
      (sum, item) => sum + item.percentage,
      0
    );

    if (Math.abs(totalPercentage - 100) > 1) {
      console.warn(`Total percentage is ${totalPercentage}%, adjusting...`);

      // 微調整: 最大の項目で調整
      const maxItem = allocations.reduce((max, item) =>
        item.percentage > max.percentage ? item : max
      );

      const adjustment = 100 - totalPercentage;
      const newPercentage = maxItem.percentage + adjustment;

      // バウンドチェック: 調整後の値が有効な範囲内にあることを確認
      if (newPercentage < 0 || newPercentage > 100) {
        throw new Error(
          `Cannot adjust percentages: adjustment would result in ${newPercentage}% ` +
          `(max item: ${maxItem.percentage}%, adjustment: ${adjustment}%)`
        );
      }

      maxItem.percentage = newPercentage;
      console.log(`Adjusted ${maxItem.category} to ${newPercentage}%`);
    }

    return {
      allocations,
      summary: response.summary as string,
      recommendedCategories: response.recommendedCategories as string[] | undefined,
    };
  } catch (error) {
    console.error("Failed to parse Gemini response.");
    console.error("Response length:", responseText.length);
    console.error("First 500 chars:", responseText.substring(0, 500));
    console.error("Last 500 chars:", responseText.substring(Math.max(0, responseText.length - 500)));
    throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * AIAnalysisResultの構造を検証
 */
function validateAIAnalysisResult(result: AIAnalysisResult): void {
  // userBasedの検証
  if (!result.userBased || !result.userBased.allocations || !Array.isArray(result.userBased.allocations)) {
    throw new Error("Invalid AIAnalysisResult: userBased.allocations is missing or invalid");
  }
  if (typeof result.userBased.totalBudget !== "number") {
    throw new Error("Invalid AIAnalysisResult: userBased.totalBudget is missing or invalid");
  }
  if (typeof result.userBased.summary !== "string") {
    throw new Error("Invalid AIAnalysisResult: userBased.summary is missing or invalid");
  }

  // aiBasedの検証
  if (!result.aiBased || !result.aiBased.allocations || !Array.isArray(result.aiBased.allocations)) {
    throw new Error("Invalid AIAnalysisResult: aiBased.allocations is missing or invalid");
  }
  if (typeof result.aiBased.totalBudget !== "number") {
    throw new Error("Invalid AIAnalysisResult: aiBased.totalBudget is missing or invalid");
  }
  if (typeof result.aiBased.summary !== "string") {
    throw new Error("Invalid AIAnalysisResult: aiBased.summary is missing or invalid");
  }

  // generatedAtの検証
  if (typeof result.generatedAt !== "string") {
    throw new Error("Invalid AIAnalysisResult: generatedAt is missing or invalid");
  }
}

/**
 * 投資配分を生成（メイン関数）
 */
export async function generateInvestmentAllocation(
  input: InvestmentInput,
  selectedMonths?: string[]
): Promise<AIAnalysisResult> {
  try {
    // パターン1: ユーザー指定カテゴリーベースの提案
    const userBasedPrompt = buildUserBasedPrompt(input);
    const userBasedResponse = await callGeminiAPI(userBasedPrompt);
    const userBasedData = parseAndValidateResponse(userBasedResponse);

    // 金額を計算
    const userBasedAllocations: InvestmentAllocation[] =
      userBasedData.allocations.map((item) => ({
        category: item.category,
        percentage: item.percentage,
        amount: Math.round((input.budget * item.percentage) / 100),
        reasoning: item.reasoning,
      }));

    // パターン2: AI完全お任せの提案
    const aiBasedPrompt = buildAIBasedPrompt(input);
    const aiBasedResponse = await callGeminiAPI(aiBasedPrompt);
    const aiBasedData = parseAndValidateResponse(aiBasedResponse);

    // 金額を計算
    const aiBasedAllocations: InvestmentAllocation[] =
      aiBasedData.allocations.map((item) => ({
        category: item.category,
        percentage: item.percentage,
        amount: Math.round((input.budget * item.percentage) / 100),
        reasoning: item.reasoning,
      }));

    // 年代別配分の生成
    const agePrompt = buildAgeAllocationPrompt(input);
    const ageResponse = await callGeminiAPI(agePrompt);
    const ageAllocation = parseAgeAllocationResponse(ageResponse, input.budget);

    // 月別配分の生成（選択月がある場合のみ）
    let monthAllocation: MonthAllocationProposal | undefined;
    if (selectedMonths && selectedMonths.length > 0) {
      const monthPrompt = buildMonthAllocationPrompt(input, selectedMonths);
      const monthResponse = await callGeminiAPI(monthPrompt);
      monthAllocation = parseMonthAllocationResponse(
        monthResponse,
        input.budget,
        selectedMonths
      );
    }

    const result: AIAnalysisResult = {
      userBased: {
        allocations: userBasedAllocations,
        totalBudget: input.budget,
        summary: userBasedData.summary,
      },
      aiBased: {
        allocations: aiBasedAllocations,
        totalBudget: input.budget,
        summary: aiBasedData.summary,
        recommendedCategories: aiBasedData.recommendedCategories || [],
      },
      ageAllocation,
      monthAllocation,
      generatedAt: new Date().toISOString(),
    };

    // 最終的な構造を検証
    validateAIAnalysisResult(result);

    return result;
  } catch (error) {
    console.error("Investment allocation generation failed:", error);
    throw error;
  }
}

/**
 * AIAnalysisResultを簡略版のanalysis_resultに変換
 * (既存のSimulation.analysis_resultフィールド用)
 */
export function convertToSimpleAnalysisResult(
  aiResult: AIAnalysisResult
): Record<string, number> {
  // デフォルトでパターン2（AI完全お任せ）を使用
  const allocations = aiResult.aiBased.allocations;
  const result: Record<string, number> = {};

  allocations.forEach((allocation) => {
    result[allocation.category] = allocation.percentage;
  });

  return result;
}
