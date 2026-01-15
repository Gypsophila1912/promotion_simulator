import { getUser } from "@/lib/auth/protected";
import Link from "next/link";

export default async function HomePage() {
  const user = await getUser();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#FFFBF5] text-slate-600 font-sans selection:bg-orange-200">
      
      {/* 1. 背景のアニメーション装飾 */}
      <div className="absolute inset-0 pointer-events-none">
        {/* グリッド背景 */}
        <div className="absolute inset-0 opacity-40" 
             style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>
        {/* ふわふわ動く光のオーブ */}
        <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-orange-200/40 rounded-full blur-3xl mix-blend-multiply filter animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-blue-200/40 rounded-full blur-3xl mix-blend-multiply filter animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[800px] h-[800px] bg-pink-200/40 rounded-full blur-3xl mix-blend-multiply filter animate-blob animation-delay-4000"></div>
      </div>

      {/* 2. メインコンテンツ */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        
        {/* ヘッダーバッジ */}
        <div className="mb-8 transform transition-all hover:scale-105 cursor-default">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-sm px-4 py-2 text-sm font-black text-slate-600 shadow-sm border border-white ring-1 ring-slate-100">
            <span className="flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            AI Budget Simulator Beta
          </span>
        </div>

        {/* キャッチコピー */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-800 mb-6 leading-[1.1]">
            経営の<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">迷い</span>を、<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-400">確信</span>に変える。
          </h1>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            広告、採用、運営費...。<br className="md:hidden"/>
            複雑な予算パズルをAIが解き明かし、<br />
            あなたのビジネスに「最短ルート」を提案します。
          </p>
        </div>

        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-20">
          {user ? (
            <Link
              href="/dashboard"
              className="group relative px-8 py-4 bg-slate-800 rounded-full text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative flex items-center gap-2">
                ダッシュボードへ戻る <span className="text-xl">🚀</span>
              </span>
            </Link>
          ) : (
            <>
              <Link
                href="/auth/signup"
                className="group relative px-10 py-5 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full text-white font-black text-lg shadow-[0_10px_30px_-10px_rgba(249,115,22,0.6)] hover:shadow-[0_20px_40px_-10px_rgba(249,115,22,0.7)] hover:-translate-y-1 transition-all"
              >
                <span className="flex items-center gap-2">
                  今すぐシュミレーション<span className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center text-sm">➜</span>
                </span>
                {/* キラリと光るエフェクト */}
                <div className="absolute top-0 -left-full w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 group-hover:animate-shine"></div>
              </Link>
              
              <Link
                href="/auth/login"
                className="px-10 py-5 bg-white rounded-full text-slate-600 font-bold text-lg shadow-sm border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
              >
                ログイン
              </Link>
            </>
          )}
        </div>

        {/* 3. ビジュアルデモエリア（浮遊する要素） */}
        <div className="relative w-full max-w-5xl h-[400px] perspective-1000">
          
          {/* 中央：PC画面のようなメインビジュアル */}
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-full max-w-3xl bg-white rounded-t-3xl shadow-2xl border-4 border-white ring-1 ring-slate-100 p-2 md:p-4 overflow-hidden transform rotate-x-12 origin-bottom transition-transform hover:rotate-x-0 duration-700">
             <div className="bg-slate-50 w-full h-[300px] rounded-t-2xl flex items-end justify-center gap-4 pb-0 overflow-hidden relative">
                {/* グラフアニメーション */}
                <div className="w-16 bg-blue-200 h-[40%] rounded-t-lg animate-[grow_2s_ease-out_forwards]"></div>
                <div className="w-16 bg-blue-300 h-[60%] rounded-t-lg animate-[grow_2s_ease-out_0.2s_forwards]"></div>
                <div className="w-16 bg-orange-400 h-[85%] rounded-t-lg animate-[grow_2s_ease-out_0.4s_forwards] relative shadow-lg">
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-md text-xs font-bold text-orange-500 whitespace-nowrap animate-bounce">
                    Best! 👑
                  </div>
                </div>
                <div className="w-16 bg-blue-200 h-[50%] rounded-t-lg animate-[grow_2s_ease-out_0.6s_forwards]"></div>

                {/* 背景のグリッド線 */}
                <div className="absolute inset-0 border-b border-slate-200 pointer-events-none" style={{ backgroundSize: '100% 20%', backgroundImage: 'linear-gradient(to bottom, transparent 98%, #e2e8f0 100%)' }}></div>
             </div>
          </div>

          {/* 周囲に浮遊するカード（赤を排除し、ポジティブな色へ） */}
          <div className="absolute top-10 left-[5%] md:left-[10%] animate-[float_6s_ease-in-out_infinite]">
             <div className="bg-white p-3 rounded-2xl shadow-xl flex items-center gap-3 transform -rotate-6 hover:rotate-0 transition-transform cursor-default">
                <span className="text-2xl bg-green-100 p-2 rounded-full">📈</span>
                <div>
                  <div className="text-xs text-slate-400 font-bold">GROWTH</div>
                  <div className="text-sm font-black text-slate-700">+120% UP</div>
                </div>
             </div>
          </div>

          <div className="absolute top-20 right-[5%] md:right-[10%] animate-[float_7s_ease-in-out_infinite_1s]">
             <div className="bg-white p-3 rounded-2xl shadow-xl flex items-center gap-3 transform rotate-6 hover:rotate-0 transition-transform cursor-default">
                <span className="text-2xl bg-blue-100 p-2 rounded-full">⚡</span>
                <div>
                  <div className="text-xs text-slate-400 font-bold">SPEED</div>
                  <div className="text-sm font-black text-slate-700">即時分析</div>
                </div>
             </div>
          </div>

        </div>

      </div>

      {/* アニメーション定義 */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes shine {
          100% { left: 125%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(var(--r, 0deg)); }
          50% { transform: translateY(-20px) rotate(var(--r, 0deg)); }
        }
        @keyframes grow {
          from { height: 0; }
        }
      `}</style>
    </div>
  );
}