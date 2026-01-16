import { requireAuth } from "@/lib/auth/protected";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await requireAuth();
  return (
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

        {/* テストページへのボタン */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            開発者ツール
          </h3>
          <Link
            href="/test/db"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            DB保存テストページ
          </Link>
        </div>
      </div>
    </main>
  );
}
