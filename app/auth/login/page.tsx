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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Promotion Simulator
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            経営の意思決定を、データとシミュレーションで支える
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
          <LoginForm />
        </div>

        <p className="text-center text-sm text-slate-600">
          アカウントをお持ちでない方は{" "}
          <Link
            href="/auth/signup"
            className="font-semibold text-blue-600 transition-colors hover:text-blue-500 underline-offset-4 hover:underline"
          >
            新規登録
          </Link>
        </p>
      </div>
    </div>
  );
}