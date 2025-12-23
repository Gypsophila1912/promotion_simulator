"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/protected";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { SimulationFormData } from "@/lib/types/database";
import { validateSimulation } from "@/lib/validation/simulation";

export async function createSimulation(formData: SimulationFormData) {
  const user = await requireAuth();

  // バリデーション
  const validation = validateSimulation(formData);
  if (!validation.isValid) {
    return { success: false, errors: validation.errors };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("simulations")
    .insert([
      {
        user_id: user.id,
        company_name: formData.company_name,
        industry: formData.industry,
        budget: formData.budget,
        details: formData.details || null,
        // AI機能はまだ実装しないのでnull
        analysis_result: null,
        ai_reasoning: null,
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
