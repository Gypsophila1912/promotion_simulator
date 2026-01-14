"use client";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError("メールアドレスかパスワードが違うようです 🤔");
        return;
      }

      if (data.session) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("エラーが発生しました。もう一度お試しください 💦");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
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
      setError(`${provider}でのログインに失敗しました`);
    }
  };

  return (
    <div className="space-y-6">
      {/* ソーシャルログイン */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleSocialLogin('google')}
          className="group flex items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-600 shadow-[0_4px_0_0_rgba(0,0,0,0.05)] border-2 border-transparent hover:border-blue-100 hover:bg-blue-50 hover:text-blue-600 transition-all active:translate-y-1 active:shadow-none"
        >
          <span className="mr-2">G</span> Google
        </button>
        <button
          onClick={() => handleSocialLogin('github')}
          className="group flex items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-600 shadow-[0_4px_0_0_rgba(0,0,0,0.05)] border-2 border-transparent hover:border-slate-200 hover:bg-slate-50 hover:text-slate-800 transition-all active:translate-y-1 active:shadow-none"
        >
          <span className="mr-2">🐙</span> GitHub
        </button>
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t-2 border-slate-100 rounded-full"></span>
        </div>
        <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest">
          <span className="bg-[#FFFBF5] px-4 text-slate-400">OR</span>
        </div>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        {error && (
          <div className="rounded-2xl bg-red-50 p-4 border-2 border-red-100 flex items-center gap-3 animate-pulse">
             <span className="text-xl">🥺</span>
            <p className="text-sm text-red-600 font-bold">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="group">
            <label htmlFor="email" className="block text-sm font-bold text-slate-700 ml-1 mb-1">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-2xl border-2 border-slate-100 bg-white px-5 py-4 text-slate-800 placeholder:text-slate-300 shadow-sm transition-all focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100 group-hover:border-slate-200"
              placeholder="name@company.com"
            />
          </div>

          <div className="group">
            <div className="flex items-center justify-between mb-1 ml-1">
              <label htmlFor="password" className="block text-sm font-bold text-slate-700">
                パスワード
              </label>
            </div>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-2xl border-2 border-slate-100 bg-white px-5 py-4 text-slate-800 placeholder:text-slate-300 shadow-sm transition-all focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100 group-hover:border-slate-200"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-full bg-gradient-to-r from-orange-400 to-pink-500 px-6 py-4 text-sm font-black text-white shadow-[0_4px_0_0_#d946ef] transition-all hover:opacity-90 hover:-translate-y-0.5 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "準備中..." : "配分シミュレーションを始める 🚀"}
        </button>
      </form>
    </div>
  );
}