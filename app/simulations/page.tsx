import { requireAuth } from "@/lib/auth/protected";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Simulation } from "@/lib/types/database";

export default async function SimulationsPage() {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: simulations, error } = await supabase
    .from("simulations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching simulations:", error);
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">シミュレーション一覧</h1>
        <Link
          href="/simulations/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          新規作成
        </Link>
      </div>

      {!simulations || simulations.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow">
          <p className="text-gray-500">まだシミュレーションがありません</p>
          <Link
            href="/simulations/new"
            className="mt-4 inline-block text-blue-600 hover:text-blue-700"
          >
            最初のシミュレーションを作成する
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {simulations.map((simulation: Simulation) => (
            <Link
              key={simulation.id}
              href={`/simulations/${simulation.id}`}
              className="rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-lg"
            >
              <h2 className="text-xl font-semibold text-gray-900">
                {simulation.company_name}
              </h2>
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <p>投資カテゴリー: {simulation.industry}</p>
                <p>予算: {simulation.budget.toLocaleString()}円</p>
              </div>
              {simulation.analysis_result && (
                <div className="mt-3 rounded bg-green-50 px-3 py-1 text-xs text-green-700">
                  分析済み
                </div>
              )}
              <p className="mt-3 text-xs text-gray-400">
                {new Date(simulation.created_at).toLocaleDateString("ja-JP")}
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
