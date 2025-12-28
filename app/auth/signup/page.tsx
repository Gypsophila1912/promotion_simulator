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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Promotion Simulator
          </h1>
          <p className="mt-3 text-sm text-slate-600 font-medium">
            新規登録して、広告予算の最適化を始めましょう
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
          <SignupForm />
        </div>

        <p className="text-center text-sm text-slate-600">
          すでにアカウントをお持ちですか？{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-blue-600 transition-colors hover:text-blue-500 underline-offset-4 hover:underline"
          >
            ログイン
          </Link>
        </p>
      </div>
    </div>
  );
}
