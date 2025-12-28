import { getUser } from "@/lib/auth/protected";
import Link from "next/link";

export default async function HomePage() {
  const user = await getUser();

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-900">
      {/* 背景装飾：深淵なるデータ空間 */}
      <div className="absolute inset-0 z-0">
         {/* グリッド（白の透明度を下げて配置） */}
        <div className="absolute inset-0 opacity-[0.05]" 
             style={{ backgroundImage: 'radial-gradient(#ffffff 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}>
        </div>
        {/* 上部からのライティング効果 */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <main className="mx-auto max-w-4xl text-center">
          
          {/* 信頼の証（バッジ）：暗色に合わせて調整 */}
          <div className="mb-8 flex justify-center">
            <span className="rounded-full bg-blue-900/50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-300 ring-1 ring-inset ring-blue-500/30">
              Promotion Simulator Beta
            </span>
          </div>

          {/* メインコピー：白文字でコントラストを強調 */}
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl drop-shadow-sm">
            広告予算の最適解を、<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              瞬時にシミュレーション。
            </span>
          </h1>

          {/* サブコピー：読みやすい薄いグレー */}
          <p className="mt-6 text-lg leading-8 text-slate-300 mb-12">
            複雑な媒体ごとの予算配分に、もう迷う必要はありません。<br className="hidden sm:block" />
            データに基づいた予測分析で、ROI（投資対効果）を最大化する意思決定をサポートします。
          </p>

          {/* グラフ風ビジュアル（ダークモード仕様） */}
          <div className="relative mx-auto max-w-2xl mb-12 p-6 bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl ring-1 ring-white/10 overflow-hidden">
            {/* グラフの背景グリッド線 */}
            <div className="absolute inset-0 flex flex-col justify-between p-6 opacity-10 pointer-events-none">
              <div className="border-t border-dashed border-white w-full h-0"></div>
              <div className="border-t border-dashed border-white w-full h-0"></div>
              <div className="border-t border-dashed border-white w-full h-0"></div>
              <div className="border-t border-dashed border-white w-full h-0"></div>
              <div className="border-t border-white w-full h-0"></div>
            </div>
            
            <div className="relative flex items-end justify-between h-48 sm:h-64 px-4 pt-8 pb-2 gap-3 sm:gap-6 z-10">
              {/* 棒グラフ1: 現状 */}
              <div className="relative flex flex-col items-center justify-end w-full h-full group">
                <div className="mb-2 text-xs font-bold text-slate-400">現状</div>
                <div className="w-full bg-slate-700 rounded-t-lg h-[40%] relative overflow-hidden">
                   <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-slate-800 to-transparent opacity-50"></div>
                </div>
              </div>
              {/* 棒グラフ2: 案A */}
              <div className="relative flex flex-col items-center justify-end w-full h-full group">
                <div className="mb-2 text-xs font-bold text-blue-400">案A</div>
                <div className="w-full bg-blue-900 rounded-t-lg h-[65%] relative overflow-hidden border border-blue-500/30 transition-all group-hover:h-[68%]">
                    <div className="absolute inset-0 bg-blue-500/20"></div>
                </div>
              </div>
               {/* 棒グラフ3: 最適解（発光表現） */}
              <div className="relative flex flex-col items-center justify-end w-full h-full group">
                 <div className="absolute -top-10 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)] animate-bounce">
                  最適解
                </div>
                <div className="mb-2 text-sm font-extrabold text-blue-400 shadow-blue-500/50">案B</div>
                <div className="w-full bg-blue-500 rounded-t-lg h-[90%] relative overflow-hidden shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all group-hover:h-[92%]">
                   <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/40 to-transparent"></div>
                </div>
              </div>
            </div>
            
            {/* 上昇トレンドライン（発光） */}
             <svg className="absolute top-0 left-0 w-full h-full pointer-events-none p-6 z-20" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,100 L0,60 C20,55 40,45 60,35 C80,25 100,10 100,10 L100,100 Z" fill="url(#trendGradientDark)" className="opacity-30" />
                <path d="M0,60 C20,55 40,45 60,35 C80,25 100,10 100,10" stroke="#60a5fa" strokeWidth="2" fill="none" strokeLinecap="round" className="drop-shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
                 <circle cx="100" cy="10" r="4" fill="#60a5fa" className="animate-pulse shadow-[0_0_15px_rgba(96,165,250,1)]" />
                 <defs>
                    <linearGradient id="trendGradientDark" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                </defs>
            </svg>
          </div>

          {/* アクションエリア */}
          <div className="mt-8 flex items-center justify-center gap-x-6">
            {user ? (
              // ログイン済み
              <div className="flex flex-col items-center gap-4">
                <p className="text-sm text-slate-400">
                  おかえりなさいませ、{user.email} 様
                </p>
                <Link
                  href="/dashboard"
                  className="rounded-lg bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all hover:bg-blue-500 hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] active:scale-95"
                >
                  ダッシュボードへ移動する
                </Link>
              </div>
            ) : (
              // 未ログイン
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/auth/signup"
                  className="rounded-lg bg-blue-600 px-8 py-3.5 text-base font-bold text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all hover:bg-blue-500 hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] active:scale-95"
                >
                  無料でシミュレーションを始める
                </Link>
                <Link
                  href="/auth/login"
                  className="group rounded-lg px-8 py-3.5 text-base font-semibold text-slate-300 ring-1 ring-white/10 transition-all hover:bg-white/10 hover:text-white hover:ring-white/30"
                >
                  ログイン <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}