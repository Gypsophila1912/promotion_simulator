import { requireAuth } from "@/lib/auth/protected";

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
      </div>
    </main>
  );
}
