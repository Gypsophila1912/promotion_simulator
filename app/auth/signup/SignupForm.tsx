"use client";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError("パスワードが一致しません");
      return;
    }

    if (password.length < 6) {
      setError("パスワードは6文字以上である必要があります");
      return;
    }

    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user && !data.session) {
        setMessage(
          "確認メールを送信しました。メールを確認してアカウントを有効化してください。"
        );
      } else if (data.session) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("予期しないエラーが発生しました");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignup = async (provider: 'google' | 'github') => {
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(`${provider}認証中にエラーが発生しました`);
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleSocialSignup('google')}
          className="flex items-center justify-center rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 active:scale-95"
        >
          Google
        </button>
        <button
          onClick={() => handleSocialSignup('github')}
          className="flex items-center justify-center rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white transition-all hover:bg-slate-800 active:scale-95"
        >
          GitHub
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-slate-400">またはメールアドレスで</span>
        </div>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-4 border border-red-100 text-sm text-red-800">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-lg bg-green-50 p-4 border border-green-100 text-sm text-green-800">
            {message}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="ceo@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="6文字以上"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700">
              パスワード（確認）
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="もう一度入力"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "作成中..." : "アカウント作成"}
        </button>
      </form>
    </div>
  );
}