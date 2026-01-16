"use client";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// 通知バナーコンポーネント
function AlertBanner({ type, message }: { type: 'error' | 'success', message: string }) {
  if (!message) return null;
  const isError = type === 'error';
  return (
    <div className={`rounded-2xl p-4 mb-6 border-2 flex items-center gap-3 animate-[fadeIn_0.5s_ease-out] ${
      isError 
        ? 'bg-red-50 border-red-100 text-red-600' 
        : 'bg-green-50 border-green-100 text-green-700'
    }`}>
      <span className="text-xl shrink-0 animate-bounce">{isError ? '🥺' : '✨'}</span>
      <p className="text-sm font-bold">{message}</p>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  // パスワード強度管理 (0-4)
  const [strength, setStrength] = useState(0);

  const router = useRouter();
  const supabase = createClient();

  // パスワード強度の計算
  useEffect(() => {
    let score = 0;
    if (!password) {
      setStrength(0);
      return;
    }
    if (password.length > 5) score += 1;
    if (password.length > 9) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    setStrength(Math.min(score, 4));
  }, [password]);

  // 強度に応じたメタデータを取得
  const getStrengthMeta = () => {
    if (password.length === 0) return { label: "入力してください", color: "bg-slate-200", textClass: "text-slate-400" };
    if (strength <= 1) return { label: "弱いかも... 😟", color: "bg-red-400", textClass: "text-red-400" };
    if (strength === 2) return { label: "まあまあ 🤔", color: "bg-orange-400", textClass: "text-orange-400" };
    if (strength === 3) return { label: "いい感じ！ 😎", color: "bg-blue-400", textClass: "text-blue-400" };
    return { label: "完璧です！ 😍", color: "bg-green-500", textClass: "text-green-500" };
  };

  const meta = getStrengthMeta();

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
    <div className="w-full">
      {/* 通知バナー */}
      {error && <AlertBanner type="error" message={error} />}
      {message && <AlertBanner type="success" message={message} />}

      {/* ソーシャルボタン */}
      <div className="grid grid-cols-2 gap-4">
        {/* Google Signup Button */}
        <button
          onClick={() => handleSocialSignup('google')}
          className="group relative flex items-center justify-center rounded-2xl bg-white px-4 py-3.5 text-sm font-bold text-slate-600 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-100 transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-none overflow-hidden"
        >
          <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <svg className="relative mr-2 h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span className="relative">Google</span>
        </button>

        {/* GitHub Signup Button */}
        <button
          onClick={() => handleSocialSignup('github')}
          className="group relative flex items-center justify-center rounded-2xl bg-white px-4 py-3.5 text-sm font-bold text-slate-600 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-100 transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-none overflow-hidden"
        >
          <div className="absolute inset-0 bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <svg className="relative mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              clipRule="evenodd"
            />
          </svg>
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
            
            {/* パスワード強度インジケーター */}
            <div className="mt-3 bg-white/50 p-3 rounded-xl border border-slate-100">
               <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-400">セキュリティ強度</span>
                  <span className={`text-xs font-bold transition-colors ${meta.textClass}`}>
                    {meta.label}
                  </span>
               </div>
               <div className="flex gap-1 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                 {[1, 2, 3, 4].map((level) => (
                   <div 
                     key={level} 
                     className={`h-full flex-1 transition-all duration-500 ${strength >= level ? meta.color : 'bg-transparent'}`}
                   ></div>
                 ))}
               </div>
            </div>
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