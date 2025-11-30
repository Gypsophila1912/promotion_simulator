import { requireAuth } from "@/lib/auth/protected";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await requireAuth();

  const signOut = async () => {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">ダッシュボード</h1>
            </div>
            <div className="flex items-center">
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
                >
                  ログアウト
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-2xl font-bold text-gray-900">ようこそ！</h2>
          <div className="mt-4 space-y-2">
            <p className="text-gray-600">
              <span className="font-semibold">メール:</span> {user.email}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">ユーザーID:</span> {user.id}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">登録日時:</span>{" "}
              {new Date(user.created_at).toLocaleString("ja-JP")}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
