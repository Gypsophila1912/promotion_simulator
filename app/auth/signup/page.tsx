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
    <div className="flex min-h-screen w-full bg-[#FFFBF5] text-slate-600 font-sans selection:bg-orange-200 overflow-hidden">
      {/* 左側：フォームエリア */}
      <div className="relative flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 xl:px-24 bg-white/70 backdrop-blur-xl z-20 border-r border-white/50 shadow-2xl shadow-orange-100/20">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-10 text-center lg:text-left transform transition-all hover:scale-[1.01]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-100 to-amber-50 px-4 py-1.5 text-xs font-bold text-orange-600 mb-4 tracking-wide shadow-sm border border-orange-100/50">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              AI BUDGET OPTIMIZER
            </span>
            <h2 className="text-4xl font-black tracking-tight text-slate-800 leading-[1.15]">
              データが導く、<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
                確実な成長戦略
              </span>
            </h2>
            <p className="mt-5 text-base text-slate-500 font-medium leading-relaxed">
              経験や勘に頼る経営は、もう終わり。<br />
              AIシミュレーションで、<br />
              あなたのビジネスの「正解」を見つけましょう。
            </p>
          </div>

          <SignupForm />

          <p className="mt-8 text-center text-sm font-medium text-slate-500">
            すでにアカウントをお持ちですか？{" "}
            <Link
              href="/auth/login"
              className="group font-bold text-blue-600 transition-all hover:text-blue-500 relative inline-block"
            >
              ログインはこちら
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 transform scale-x-0 transition-transform group-hover:scale-x-100"></span>
            </Link>
          </p>
        </div>
      </div>

      {/* 右側：ビジュアルエリア（上昇する成功カード） */}
      <div className="hidden lg:relative lg:block lg:w-1/2 overflow-hidden bg-[#FFFAF0]">
        {/* 背景のグリッドと光 */}
        <div className="absolute inset-0" 
             style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-3xl mix-blend-multiply filter opacity-70 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-100/40 rounded-full blur-3xl mix-blend-multiply filter opacity-70 animate-blob animation-delay-2000"></div>
        
        {/* フローティングカードのアニメーションコンテナ */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full max-w-lg">
            
            {/* カード1: ROI向上 */}
            <div className="absolute left-10 top-[60%] animate-[floatUp_8s_linear_infinite] opacity-0">
               <div className="bg-white p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 backdrop-blur-sm flex items-center gap-4 w-64 transform rotate-[-6deg] hover:rotate-0 transition-transform">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl">📈</div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">Result</p>
                    <p className="text-slate-700 font-black text-lg">ROI +150% 達成</p>
                  </div>
               </div>
            </div>

            {/* カード2: コスト削減 */}
            <div className="absolute right-10 top-[80%] animate-[floatUp_7s_linear_infinite_2s] opacity-0">
               <div className="bg-white p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 backdrop-blur-sm flex items-center gap-4 w-60 transform rotate-[3deg] hover:rotate-0 transition-transform">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-2xl">💰</div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">Budget</p>
                    <p className="text-slate-700 font-black text-lg">無駄コスト 0円</p>
                  </div>
               </div>
            </div>

            {/* カード3: 最適化完了 */}
            <div className="absolute left-1/2 -translate-x-1/2 top-[100%] animate-[floatUp_9s_linear_infinite_4s] opacity-0">
               <div className="bg-white/90 p-5 rounded-[2rem] shadow-[0_20px_60px_rgba(59,130,246,0.15)] border-2 border-white flex flex-col items-center gap-3 w-72 text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-3xl shadow-lg shadow-blue-200">✨</div>
                  <div>
                    <p className="text-blue-600 font-black text-xl">最適化完了</p>
                    <p className="text-slate-500 text-sm mt-1">AIが黄金比を発見しました</p>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-blue-500 h-full w-full animate-[loading_1.5s_ease-in-out_infinite]"></div>
                  </div>
               </div>
            </div>

          </div>
        </div>

        {/* 下部のグラデーションフェード（カードが消えていく演出用） */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#FFFAF0] to-transparent z-10"></div>
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#FFFAF0] to-transparent z-10"></div>
      </div>

      {/* グローバルCSSに追加すべきアニメーション定義（今回はstyleタグで代用） */}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(100px) scale(0.9); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-600px) scale(1); opacity: 0; }
        }
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
      `}</style>
    </div>
  );
}