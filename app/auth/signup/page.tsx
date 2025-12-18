import { getUser } from "@/lib/auth/protected";
import { redirect } from "next/navigation";
import SignupForm from "./SignupForm";
import Link from "next/link";

export default async function SignupPage() {
  const user = await getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">アカウント作成</h2>
          <p className="mt-2 text-sm text-gray-600">メールアドレスで新規登録</p>
        </div>

        <SignupForm />

        <p className="text-center text-sm text-gray-600">
          すでにアカウントをお持ちですか？{" "}
          <Link
            href="/auth/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            ログイン
          </Link>
        </p>
      </div>
    </div>
  );
}
