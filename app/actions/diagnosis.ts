"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/protected";
import { callGeminiAPI } from "@/lib/ai/gemini";

/**
 * 診断IDを使用してAIアドバイスを生成・保存する
 * キャッシュ機能付き：既にai_adviceがある場合はそれを返す
 */
export async function generateHomeAdvice(diagnosisId: string) {
  const user = await requireAuth();
  const supabase = await createClient();

  // 診断データを取得
  const { data: diagnosis, error: fetchError } = await supabase
    .from("ad_diagnoses")
    .select("*")
    .eq("id", diagnosisId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !diagnosis) {
    return { success: false, error: "診断データが見つかりません" };
  }

  // 既にAI分析結果がある場合はそれを返す（キャッシュ）
  if (diagnosis.ai_advice && diagnosis.ai_advice.trim() !== "") {
    return { success: true, advice: diagnosis.ai_advice, cached: true };
  }

  // AI分析を実行
  const [targetAudience, adMedia, concerns, experience, kpi] = diagnosis.answers || [];

  const prompt = `あなたはマーケティングの専門家です。以下のヒアリング結果に基づいて、具体的な戦略アドバイスを提案してください。

【会社情報】
- 会社名: ${diagnosis.company_name}
- 予算: ${diagnosis.budget.toLocaleString()}円

【ヒアリング結果】
1. 主なターゲット層: ${targetAudience || '未回答'}
2. 検討している広告媒体: ${adMedia || '未回答'}
3. 現在の悩み: ${concerns || '未回答'}
4. 運用経験: ${experience || '未回答'}
5. 重視する成果（KPI）: ${kpi || '未回答'}

以下の観点から具体的なアドバイスを提供してください:
1. 推奨する広告媒体と予算配分の方向性
2. ターゲット層へのアプローチ方法
3. 現在の悩みに対する具体的な解決策
4. 運用経験を踏まえた実践的なアドバイス

回答は日本語で、専門用語を使う場合は簡単な説明を添えてください。`;

  try {
    const advice = await callGeminiAPI(prompt, {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 4096,
    });

    // 結果をDBに保存
    const { error: updateError } = await supabase
      .from("ad_diagnoses")
      .update({ ai_advice: advice })
      .eq("id", diagnosisId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("AI分析結果の保存に失敗:", updateError);
    }

    return { success: true, advice, cached: false };
  } catch (error: unknown) {
    console.error("Home advice generation failed:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `AIアドバイスの生成に失敗しました: ${errorMessage}`,
    };
  }
}
