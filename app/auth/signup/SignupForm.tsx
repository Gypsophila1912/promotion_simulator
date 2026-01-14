"use client";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  // パスワード強度管理
  const [strength, setStrength] = useState(0);

  const router = useRouter();
  const supabase = createClient();

  // パスワード強度の計算
  useEffect(() => {
    let score = 0;
    if (password.length > 5) score += 1;
    if (password.length > 9) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    setStrength(score);
  }, [password]);

  const getStrengthColor = () => {
    if (strength <= 1) return "bg-slate-200";
    if (strength === 2) return "bg-red-400";
    if (strength === 3) return "bg-yellow-400";
    return "bg-green-500";
  };
  
  const getStrengthLabel = () => {
    if (password.length === 0) return "";
    if (strength <= 2) return "弱いかも... 😟";
    if (strength === 3) return "いい感じ！ 🙂";
    return "完璧です！ 💪";
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError("パスワードが一致していません 💦");
      return;
    }
    if (password.length < 6) {
      setError("パスワードは6文字以上にしてください 🔒");
      return;
    }

    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectUrl },
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user && !data.session) {
        setMessage("確認メールを送信しました 📩 メール内のリンクから登録を完了してください。");
      } else if (data.session) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("予期しないエラーが発生しました 😢");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignup = async (provider: 'google' | 'github') => {
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (err) {
      setError(`${provider}での登録に失敗しました`);
    }
  };

  return (
    <div className="space-y-6">
      {/* ソーシャルボタン */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleSocialSignup('google')}
          className="group relative flex items-center justify-center rounded-2xl bg-white px-4 py-3.5 text-sm font-bold text-slate-600 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-100 transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-none overflow-hidden"
        >
          <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="relative mr-2 text-lg">G</span> 
          <span className="relative">Google</span>
        </button>
        <button
          onClick={() => handleSocialSignup('github')}
          className="group relative flex items-center justify-center rounded-2xl bg-white px-4 py-3.5 text-sm font-bold text-slate-600 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-100 transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-none overflow-hidden"
        >
          <div className="absolute inset-0 bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="relative mr-2 text-lg">🐙</span>
          <span className="relative">GitHub</span>
        </button>
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200"></span>
        </div>
        <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest">
          <span className="bg-[#FFFBF5] px-4 text-slate-400">OR</span>
        </div>
      </div>

      <form onSubmit={handleSignup} className="space-y-5">
        {error && (
          <div className="rounded-2xl bg-red-50 p-4 border-2 border-red-100 flex items-center gap-3 animate-pulse">
             <span className="text-xl">🥺</span>
            <p className="text-sm text-red-600 font-bold">{error}</p>
          </div>
        )}
        {message && (
          <div className="rounded-2xl bg-green-50 p-4 border-2 border-green-100 flex items-center gap-3">
             <span className="text-xl">✨</span>
            <p className="text-sm text-green-700 font-bold">{message}</p>
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
              className="block w-full rounded-2xl border-2 border-slate-100 bg-white/80 px-5 py-4 text-slate-800 placeholder:text-slate-300 shadow-sm transition-all focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-50 group-hover:border-slate-200"
              placeholder="ceo@example.com"
            />
          </div>

          <div className="group">
            <label htmlFor="password" className="block text-sm font-bold text-slate-700 ml-1 mb-1">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-2xl border-2 border-slate-100 bg-white/80 px-5 py-4 text-slate-800 placeholder:text-slate-300 shadow-sm transition-all focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-50 group-hover:border-slate-200"
              placeholder="6文字以上"
            />
            {/* パスワード強度メーター */}
            <div className="mt-3 flex items-center justify-between gap-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
               <div className={`h-full flex-1 transition-all duration-500 ${strength >= 1 ? (strength >= 2 ? (strength >= 3 ? "bg-green-400" : "bg-yellow-400") : "bg-red-400") : "bg-transparent"}`}></div>
               <div className={`h-full flex-1 transition-all duration-500 ${strength >= 2 ? (strength >= 3 ? "bg-green-400" : "bg-yellow-400") : "bg-transparent"}`}></div>
               <div className={`h-full flex-1 transition-all duration-500 ${strength >= 3 ? (strength >= 4 ? "bg-green-400" : "bg-green-400") : "bg-transparent"}`}></div>
               <div className={`h-full flex-1 transition-all duration-500 ${strength >= 4 ? "bg-green-400" : "bg-transparent"}`}></div>
            </div>
            <p className={`text-xs mt-1.5 font-bold transition-colors ${strength >= 3 ? "text-green-500" : "text-slate-400"} text-right h-4`}>
              {getStrengthLabel()}
            </p>
          </div>

          <div className="group">
            <label htmlFor="confirmPassword" className="block text-sm font-bold text-slate-700 ml-1 mb-1">
              パスワード（確認）
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full rounded-2xl border-2 border-slate-100 bg-white/80 px-5 py-4 text-slate-800 placeholder:text-slate-300 shadow-sm transition-all focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-50 group-hover:border-slate-200"
              placeholder="もう一度入力してください"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-4 text-sm font-black text-white shadow-[0_8px_20px_-6px_rgba(6,182,212,0.5)] transition-all hover:shadow-[0_12px_25px_-8px_rgba(6,182,212,0.6)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed group"
        >
           <span className="relative z-10 flex items-center justify-center gap-2">
             {loading ? "作成中..." : <>アカウントを作成する <span className="transition-transform group-hover:translate-x-1">🚀</span></>}
           </span>
           {/* ボタン内の光るエフェクト */}
           <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0"></div>
        </button>
        <style jsx>{`
          @keyframes shimmer {
            100% { transform: translateX(100%); }
          }
        `}</style>
      </form>
    </div>
  );
}