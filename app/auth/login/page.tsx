import { getUser } from "@/lib/auth/protected";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";
import Link from "next/link";

export default async function LoginPage() {
  const user = await getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">ログイン</h2>
          <p className="mt-2 text-sm text-gray-600">メールアドレスでログイン</p>
        </div>

        <LoginForm />

        <p className="text-center text-sm text-gray-600">
          アカウントをお持ちでない方は{" "}
          <Link
            href="/auth/signup"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            新規登録
          </Link>
        </p>
      </div>
    </div>
  );
}
