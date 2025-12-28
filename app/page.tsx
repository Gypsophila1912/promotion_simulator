import { getUser } from "@/lib/auth/protected";
import Link from "next/link";

export default async function HomePage() {
  const user = await getUser();

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      {/* 背景装飾：データの整合性を象徴するグリッドパターン */}
      <div className="absolute inset-0 z-0 opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#444cf7 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}>
      </div>

      {/* メインコンテンツ */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <main className="mx-auto max-w-4xl text-center">
          
          {/* 信頼の証（バッジ） */}
          <div className="mb-8 flex justify-center">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600 ring-1 ring-inset ring-blue-600/20">
              Promotion Simulator Beta
            </span>
          </div>

          {/* メインコピー */}
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
            広告予算の最適解を、<br />
            <span className="text-blue-600">瞬時にシミュレーション。</span>
          </h1>

          {/* サブコピー */}
          <p className="mt-6 text-lg leading-8 text-slate-600 mb-12">
            複雑な媒体ごとの予算配分に、もう迷う必要はありません。<br className="hidden sm:block" />
            データに基づいた予測分析で、ROI（投資対効果）を最大化する意思決定をサポートします。
          </p>

          {/* グラフ風ビジュアル（CSSで描画） */}
          <div className="relative mx-auto max-w-2xl mb-12 p-6 bg-white rounded-2xl shadow-xl ring-1 ring-slate-200/60 overflow-hidden">
            {/* グラフの背景グリッド線 */}
            <div className="absolute inset-0 flex flex-col justify-between p-6 opacity-20 pointer-events-none">
              <div className="border-t border-dashed border-slate-300 w-full h-0"></div>
              <div className="border-t border-dashed border-slate-300 w-full h-0"></div>
              <div className="border-t border-dashed border-slate-300 w-full h-0"></div>
              <div className="border-t border-dashed border-slate-300 w-full h-0"></div>
              <div className="border-t border-gray-300 w-full h-0"></div> {/* ベースライン */}
            </div>
            
            <div className="relative flex items-end justify-between h-48 sm:h-64 px-4 pt-8 pb-2 gap-3 sm:gap-6 z-10">
              {/* 棒グラフ1: 現状 */}
              <div className="relative flex flex-col items-center justify-end w-full h-full group">
                <div className="mb-2 text-xs font-bold text-slate-500">現状</div>
                <div className="w-full bg-slate-200 rounded-t-lg h-[40%] relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-slate-300 to-slate-200 opacity-50"></div>
                </div>
              </div>
              {/* 棒グラフ2: 改善案A */}
              <div className="relative flex flex-col items-center justify-end w-full h-full group">
                <div className="mb-2 text-xs font-bold text-blue-500">案A</div>
                <div className="w-full bg-blue-400 rounded-t-lg h-[65%] relative overflow-hidden shadow-sm transition-all group-hover:h-[68%]">
                   <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-blue-500 to-blue-300 opacity-60"></div>
                </div>
              </div>
               {/* 棒グラフ3: 改善案B（最適解） */}
              <div className="relative flex flex-col items-center justify-end w-full h-full group">
                 {/* 強調表示のバッジ */}
                 <div className="absolute -top-10 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm animate-bounce">
                  最適解
                </div>
                <div className="mb-2 text-sm font-extrabold text-blue-600">案B</div>
                <div className="w-full bg-blue-600 rounded-t-lg h-[90%] relative overflow-hidden shadow-md transition-all group-hover:h-[92%]">
                  {/* 内部の光沢感 */}
                  <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/30 to-transparent"></div>
                   <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-blue-700 to-blue-500 opacity-80"></div>
                </div>
              </div>
            </div>
            {/* 上昇トレンドライン（SVG） */}
             <svg className="absolute top-0 left-0 w-full h-full pointer-events-none p-6 z-20" viewBox="0 0 100 100" preserveAspectRatio="none">
                 {/* 線の下のグラデーション領域 */}
                <path d="M0,100 L0,60 C20,55 40,45 60,35 C80,25 100,10 100,10 L100,100 Z" fill="url(#trendGradient)" className="opacity-20" />
                {/* トレンドライン本体 */}
                <path d="M0,60 C20,55 40,45 60,35 C80,25 100,10 100,10" stroke="#2563eb" strokeWidth="2" fill="none" strokeLinecap="round" className="drop-shadow-sm" />
                 {/* 終点のポイント */}
                <circle cx="100" cy="10" r="3" fill="#2563eb" className="animate-pulse" />
                 <defs>
                    <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                </defs>
            </svg>

            <div className="absolute bottom-4 right-6 text-xs font-bold text-blue-600/60">
                ↑ 収益最大化シミュレーション結果例
            </div>
          </div>

          {/* アクションエリア */}
          <div className="mt-8 flex items-center justify-center gap-x-6">
            {user ? (
              // ログイン済みユーザー向け
              <div className="flex flex-col items-center gap-4">
                <p className="text-sm text-slate-500">
                  おかえりなさいませ、{user.email} 様
                </p>
                <Link
                  href="/dashboard"
                  className="rounded-lg bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-blue-600/30 active:scale-95"
                >
                  ダッシュボードへ移動する
                </Link>
              </div>
            ) : (
              // 未ログインユーザー向け
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/auth/signup"
                  className="rounded-lg bg-blue-600 px-8 py-3.5 text-base font-bold text-white shadow-md transition-all hover:bg-blue-700 active:scale-95"
                >
                  無料でシミュレーションを始める
                </Link>
                <Link
                  href="/auth/login"
                  className="group rounded-lg px-8 py-3.5 text-base font-semibold text-slate-700 ring-1 ring-slate-200 transition-all hover:bg-white hover:text-blue-600 hover:ring-blue-200 hover:shadow-sm"
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