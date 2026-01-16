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
    <main className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 py-10 px-2">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-slate-800 mb-8 tracking-tight drop-shadow-sm">
          シミュレーション一覧
        </h1>
        <div className="flex justify-center mb-8">
          <Link
            href="/simulations/new"
            className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            ＋ 新規作成
          </Link>
        </div>
        {!simulations || simulations?.length === 0 ? (
          <div className="rounded-2xl bg-white/90 p-12 text-center shadow-xl border border-gray-100">
            <p className="text-gray-500 mb-4">まだシミュレーションがありません</p>
            <Link
              href="/simulations/new"
              className="inline-block text-blue-600 hover:text-blue-700 font-bold"
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
                className="rounded-2xl bg-white/90 p-6 shadow-xl border border-gray-100 transition-all hover:shadow-2xl hover:-translate-y-1"
              >
                <h2 className="text-xl font-bold text-blue-700 mb-2 truncate">
                  {simulation.company_name}
                </h2>
                <div className="space-y-1 text-sm text-gray-700 mb-2">
                  <p>投資カテゴリー: <span className="font-semibold text-slate-800">{simulation.industry}</span></p>
                  <p>予算: <span className="font-semibold text-slate-800">{simulation.budget.toLocaleString()}円</span></p>
                </div>
                {simulation.analysis_result && (
                  <div className="mt-3 rounded bg-green-50 px-3 py-1 text-xs text-green-700 font-bold inline-block">
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
      </div>
    </main>
  );
}
