import { getUser } from "@/lib/auth/protected";
import Link from "next/link";

export default async function HomePage() {
  const user = await getUser();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900">Welcome to My App</h1>
        <p className="mt-4 text-xl text-gray-600">
          Next.js + Supabase で構築された認証アプリ
        </p>
        <div className="mt-8 flex justify-center gap-4">
          {user ? (
            <Link
              href="/dashboard"
              className="rounded-md bg-blue-600 px-6 py-3 text-lg font-semibold text-white hover:bg-blue-700"
            >
              ダッシュボードへ
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md bg-blue-600 px-6 py-3 text-lg font-semibold text-white hover:bg-blue-700"
              >
                ログイン
              </Link>
              <Link
                href="/signup"
                className="rounded-md border-2 border-blue-600 bg-white px-6 py-3 text-lg font-semibold text-blue-600 hover:bg-blue-50"
              >
                新規登録
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
