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
    <div className="flex min-h-screen w-full bg-[#FFFBF5] text-slate-600 font-sans selection:bg-orange-200">
      {/* 左側：フォームエリア */}
      <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 xl:px-24 bg-white/60 backdrop-blur-md z-10">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-8 text-center lg:text-left">
            <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-600 mb-3 tracking-wide">
              BUDGET OPTIMIZER 🎯
            </span>
            <h2 className="text-3xl font-black tracking-tight text-slate-800 leading-tight">
              その予算、<br />
              <span className="text-orange-500">どこに</span>掛けますか？
            </h2>
            <p className="mt-4 text-base text-slate-500 font-medium leading-relaxed">
              広報、運営、採用...。<br />
              あなたのビジネスに最適な「黄金比」を、<br />
              シミュレーションで見つけましょう。
            </p>
          </div>

          <LoginForm />

          <p className="mt-8 text-center text-sm font-medium text-slate-500">
            登録はまだ？{" "}
            <Link
              href="/auth/signup"
              className="font-bold text-orange-500 hover:text-orange-600 hover:underline decoration-2 underline-offset-4 transition-all"
            >
              アカウント作成はこちら
            </Link>
          </p>
        </div>
      </div>

      {/* 右側：ビジュアルエリア（配分シミュレーションの表現） */}
      <div className="hidden lg:relative lg:block lg:w-1/2 overflow-hidden bg-[#FFFAF0]">
        {/* 背景装飾 */}
        <div className="absolute inset-0" 
             style={{ backgroundImage: 'radial-gradient(#E2E8F0 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
        </div>
        
        {/* 中央のビジュアル：予算配分の積み木 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg p-8">
          
          {/* 3つの比較案を示す棒グラフ風イラスト */}
          <div className="flex items-end justify-center gap-6 h-80">
            
            {/* 案A：バランスが悪い例 */}
            <div className="relative w-24 flex flex-col justify-end group cursor-pointer">
              <div className="mb-4 text-center opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 left-0 right-0">
                <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-1 rounded-lg">Imbalance...</span>
              </div>
              {/* SNS費 */}
              <div className="w-full bg-blue-200 h-12 rounded-2xl mb-2 mx-auto w-[90%] transition-all duration-500 group-hover:scale-95"></div>
              {/* 広告費（過多） */}
              <div className="w-full bg-orange-200 h-32 rounded-2xl mb-2 mx-auto w-[90%] transition-all duration-500 group-hover:scale-95"></div>
              {/* 運営費 */}
              <div className="w-full bg-slate-200 h-8 rounded-2xl mx-auto w-[90%] transition-all duration-500 group-hover:scale-95"></div>
              <p className="text-center text-xs font-bold text-slate-400 mt-3">Plan A</p>
            </div>

            {/* 案B：最適な配分（ヒーロー） */}
            <div className="relative w-28 flex flex-col justify-end group">
              {/* 吹き出し */}
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-2xl shadow-lg border-2 border-orange-100 animate-[bounce_3s_infinite] z-20 whitespace-nowrap">
                <span className="text-sm font-black text-orange-500">✨ Best Choice!</span>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-2 border-b-2 border-orange-100 rotate-45"></div>
              </div>

              {/* 積み木（配分） */}
              <div className="w-full bg-white p-2 rounded-[2rem] shadow-xl border-4 border-white ring-1 ring-orange-100 transition-transform hover:-translate-y-2">
                {/* SNS費（最適） */}
                <div className="w-full bg-blue-400 h-24 rounded-xl mb-2 flex items-center justify-center relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/20"></div>
                   <span className="text-white text-xs font-bold">SNS</span>
                </div>
                {/* 広告費（最適） */}
                <div className="w-full bg-orange-400 h-20 rounded-xl mb-2 flex items-center justify-center relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/20"></div>
                   <span className="text-white text-xs font-bold">Ads</span>
                </div>
                {/* 運営費（最適） */}
                <div className="w-full bg-teal-400 h-16 rounded-xl flex items-center justify-center relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/20"></div>
                   <span className="text-white text-xs font-bold">Ops</span>
                </div>
              </div>
              <p className="text-center text-sm font-black text-orange-500 mt-4">Optimal Plan</p>
            </div>

            {/* 案C：不足している例 */}
            <div className="relative w-24 flex flex-col justify-end group cursor-pointer">
              <div className="mb-4 text-center opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 left-0 right-0">
                <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-1 rounded-lg">Low Return</span>
              </div>
              {/* SNS費 */}
              <div className="w-full bg-blue-200 h-8 rounded-2xl mb-2 mx-auto w-[90%] transition-all duration-500 group-hover:scale-95"></div>
              {/* 広告費 */}
              <div className="w-full bg-orange-200 h-8 rounded-2xl mb-2 mx-auto w-[90%] transition-all duration-500 group-hover:scale-95"></div>
              {/* 運営費 */}
              <div className="w-full bg-slate-200 h-8 rounded-2xl mx-auto w-[90%] transition-all duration-500 group-hover:scale-95"></div>
              <p className="text-center text-xs font-bold text-slate-400 mt-3">Plan C</p>
            </div>

          </div>
          
          <div className="text-center mt-10 px-8">
            <div className="inline-flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full shadow-sm text-sm text-slate-600 font-bold">
              <span>💡</span> 
              <span>AIが最適な予算比率を提案します</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}