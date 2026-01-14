import { requireAuth } from "@/lib/auth/protected";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { AIAnalysisResult } from "@/lib/types/database";

export default async function SimulationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: simulation, error } = await supabase
    .from("simulations")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !simulation) {
    notFound();
  }

  // AI分析結果をパース
  let aiAnalysis: AIAnalysisResult | null = null;
  if (simulation.ai_reasoning) {
    try {
      aiAnalysis = JSON.parse(simulation.ai_reasoning);
    } catch (e) {
      console.error("Failed to parse AI reasoning:", e);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/simulations"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          ← 一覧に戻る
        </Link>
      </div>

      <div className="rounded-lg bg-white p-8 shadow">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">
          {simulation.company_name}
        </h1>

        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-medium text-gray-500">投資カテゴリー</h2>
            <p className="mt-1 text-lg text-gray-900">{simulation.industry}</p>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-500">予算</h2>
            <p className="mt-1 text-lg text-gray-900">
              {simulation.budget.toLocaleString()}円
            </p>
          </div>

          {simulation.details && (
            <div>
              <h2 className="text-sm font-medium text-gray-500">
                悩み・相談内容
              </h2>
              <p className="mt-1 whitespace-pre-wrap text-gray-900">
                {simulation.details}
              </p>
            </div>
          )}

          <div className="border-t pt-4">
            <h2 className="text-sm font-medium text-gray-500">作成日時</h2>
            <p className="mt-1 text-gray-900">
              {new Date(simulation.created_at).toLocaleString("ja-JP")}
            </p>
          </div>
        </div>

        {/* AI分析結果表示エリア */}
        {aiAnalysis ? (
          <div className="mt-8 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              AI投資配分提案
            </h2>

            {/* パターン1: ユーザー指定カテゴリーベース */}
            <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-6">
              <h3 className="mb-4 text-xl font-semibold text-blue-900">
                パターン1: {simulation.industry}を基にした提案
              </h3>

              <p className="mb-4 text-sm text-gray-700">
                {aiAnalysis.userBased.summary}
              </p>

              <div className="space-y-3">
                {aiAnalysis.userBased.allocations.map((allocation, index) => (
                  <div
                    key={index}
                    className="rounded-lg bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900">
                        {allocation.category}
                      </h4>
                      <div className="text-right">
                        <span className="text-lg font-bold text-blue-600">
                          {allocation.percentage}%
                        </span>
                        <span className="ml-2 text-sm text-gray-600">
                          ({allocation.amount.toLocaleString()}円)
                        </span>
                      </div>
                    </div>

                    {/* 配分バー */}
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${allocation.percentage}%` }}
                      />
                    </div>

                    <p className="mt-2 text-sm text-gray-600">
                      {allocation.reasoning}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* パターン2: AI完全お任せ */}
            <div className="rounded-lg border-2 border-green-200 bg-green-50 p-6">
              <h3 className="mb-4 text-xl font-semibold text-green-900">
                パターン2: AIお任せ提案
              </h3>

              <p className="mb-4 text-sm text-gray-700">
                {aiAnalysis.aiBased.summary}
              </p>

              {aiAnalysis.aiBased.recommendedCategories.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {aiAnalysis.aiBased.recommendedCategories.map((cat, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-green-200 px-3 py-1 text-xs font-medium text-green-800"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              )}

              <div className="space-y-3">
                {aiAnalysis.aiBased.allocations.map((allocation, index) => (
                  <div
                    key={index}
                    className="rounded-lg bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900">
                        {allocation.category}
                      </h4>
                      <div className="text-right">
                        <span className="text-lg font-bold text-green-600">
                          {allocation.percentage}%
                        </span>
                        <span className="ml-2 text-sm text-gray-600">
                          ({allocation.amount.toLocaleString()}円)
                        </span>
                      </div>
                    </div>

                    {/* 配分バー */}
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${allocation.percentage}%` }}
                      />
                    </div>

                    <p className="mt-2 text-sm text-gray-600">
                      {allocation.reasoning}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 生成日時 */}
            <div className="text-sm text-gray-500">
              分析生成日時: {new Date(aiAnalysis.generatedAt).toLocaleString("ja-JP")}
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-700">
              AI分析結果がありません
            </h2>
            <p className="mt-2 text-gray-500">
              シミュレーション作成時にAI分析が実行されませんでした。
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
