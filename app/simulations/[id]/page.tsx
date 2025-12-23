import { requireAuth } from "@/lib/auth/protected";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

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

        {/* AI分析結果表示エリア（将来実装） */}
        <div className="mt-8 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-700">AI分析機能</h2>
          <p className="mt-2 text-gray-500">
            今後実装予定：AIによる投資配分の提案が表示されます
          </p>
        </div>
      </div>
    </main>
  );
}
