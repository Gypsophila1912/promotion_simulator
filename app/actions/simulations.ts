"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/protected";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { SimulationFormData } from "@/lib/types/database";
import { validateSimulation } from "@/lib/validation/simulation";
import {
  generateInvestmentAllocation,
  convertToSimpleAnalysisResult,
} from "@/lib/ai/investment-advisor";
import { getCachedAnalysis, setCachedAnalysis } from "@/lib/ai/cache";
import type { AIAnalysisResult } from "@/lib/types/database";

export async function createSimulation(formData: SimulationFormData) {
  const user = await requireAuth();

  // バリデーション
  const validation = validateSimulation(formData);
  if (!validation.isValid) {
    return { success: false, errors: validation.errors };
  }

  const supabase = await createClient();

  // AI分析を実行
  let analysisResult = null;
  let aiReasoning = null;

  try {
    // キャッシュチェック
    const cached = getCachedAnalysis(formData.industry, formData.budget);

    let aiAnalysis: AIAnalysisResult;
    if (cached) {
      console.log("Using cached AI analysis");
      aiAnalysis = cached;
    } else {
      console.log("Generating new AI analysis");
      aiAnalysis = await generateInvestmentAllocation({
        companyName: formData.company_name,
        industry: formData.industry,
        budget: formData.budget,
        details: formData.details,
      });

      // キャッシュに保存
      setCachedAnalysis(formData.industry, formData.budget, aiAnalysis);
    }

    // analysis_result: シンプルな配分マップ（UI表示用の簡易版）
    analysisResult = convertToSimpleAnalysisResult(aiAnalysis);

    // ai_reasoning: 詳細情報をJSON文字列として保存
    const aiReasoningJson = JSON.stringify(aiAnalysis);

    // JSONサイズチェック（PostgreSQL text型の制限を考慮）
    // 一般的に1MB程度が安全な上限
    const MAX_JSON_SIZE = 1024 * 1024; // 1MB
    if (aiReasoningJson.length > MAX_JSON_SIZE) {
      console.warn(`AI reasoning JSON size (${aiReasoningJson.length} bytes) exceeds safe limit`);
      // サイズ超過時は要約版を保存
      aiReasoning = JSON.stringify({
        userBased: { summary: aiAnalysis.userBased.summary },
        aiBased: { summary: aiAnalysis.aiBased.summary },
        generatedAt: aiAnalysis.generatedAt,
        truncated: true,
      });
    } else {
      aiReasoning = aiReasoningJson;
    }
  } catch (error) {
    console.error("AI analysis failed:", error);
    // AI分析失敗時もシミュレーション作成は続行
    // 後で再生成できるようにnullで保存
  }

  const { data, error } = await supabase
    .from("simulations")
    .insert([
      {
        user_id: user.id,
        company_name: formData.company_name,
        industry: formData.industry,
        budget: formData.budget,
        details: formData.details || null,
        analysis_result: analysisResult,
        ai_reasoning: aiReasoning,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating simulation:", error);
    return {
      success: false,
      errors: { submit: "シミュレーションの作成に失敗しました" },
    };
  }

  revalidatePath("/simulations");
  redirect(`/simulations/${data.id}`);
}

export async function updateSimulation(
  id: string,
  formData: SimulationFormData
) {
  const user = await requireAuth();

  const validation = validateSimulation(formData);
  if (!validation.isValid) {
    return { success: false, errors: validation.errors };
  }

  const supabase = await createClient();

  // 自分のシミュレーションかチェック
  const { data: existing } = await supabase
    .from("simulations")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!existing || existing.user_id !== user.id) {
    return { success: false, errors: { submit: "権限がありません" } };
  }

  const { error } = await supabase
    .from("simulations")
    .update({
      company_name: formData.company_name,
      industry: formData.industry,
      budget: formData.budget,
      details: formData.details || null,
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating simulation:", error);
    return {
      success: false,
      errors: { submit: "シミュレーションの更新に失敗しました" },
    };
  }

  revalidatePath("/simulations");
  revalidatePath(`/simulations/${id}`);
  redirect(`/simulations/${id}`);
}

export async function deleteSimulation(id: string) {
  const user = await requireAuth();
  const supabase = await createClient();

  // 自分のシミュレーションかチェック
  const { data: existing } = await supabase
    .from("simulations")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!existing || existing.user_id !== user.id) {
    return { success: false, errors: { submit: "権限がありません" } };
  }

  const { error } = await supabase.from("simulations").delete().eq("id", id);

  if (error) {
    console.error("Error deleting simulation:", error);
    return {
      success: false,
      errors: { submit: "シミュレーションの削除に失敗しました" },
    };
  }

  revalidatePath("/simulations");
  redirect("/simulations");
}
