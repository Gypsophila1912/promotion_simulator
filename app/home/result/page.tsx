"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getAiAdvice } from '@/lib/gemini';
import { Review } from '@/lib/types/database';

const QUESTIONS = [
  { id: 1, question: "主なターゲット層" },
  { id: 2, question: "検討している広告媒体" },
  { id: 3, question: "現在の悩み" },
  { id: 4, question: "運用経験" },
  { id: 5, question: "重視する成果（KPI）" },
];

function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // supabaseインスタンスをコンポーネント内で作成
  const supabase = createClient();

  const companyName = searchParams.get('company') || 'お客様';
  const budget = Number(searchParams.get('budget')) || 0;
  
  let answers: string[] = [];
  try {
    answers = JSON.parse(searchParams.get('answers') || '[]');
  } catch (e) {
    answers = [];
  }

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [aiAdvice, setAiAdvice] = useState<string>("AIが分析しています...");

  const allocation = {
    primary: Math.round(budget * 0.7),
    secondary: Math.round(budget * 0.3)
  };

  useEffect(() => {
    const runDiagnosis = async () => {
      setLoadingReviews(true);
      try {
        // 1. ユーザー認証の確認 (CodeRabbit指摘: データ隔離のため)
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          alert("セッションが切れました。ログインし直してください。");
          router.push('/login');
          return;
        }

        // 2. 口コミを取得 (型定義 Review を適用)
        const { data: revData, error: revError } = await supabase
          .from("reviews")
          .select("*")
          .limit(3);
        
        if (revError) throw revError;

        const currentReviews = (revData || []) as Review[];
        setReviews(currentReviews);

        // 3. Gemini APIを呼び出し
        const advice = await getAiAdvice(companyName, budget, answers);
        setAiAdvice(advice);

      } catch (err: any) {
        console.error("Diagnosis error:", err);
        setAiAdvice("診断結果の生成中にエラーが発生しました。");
        alert("エラーが発生しました: " + (err.message || "不明なエラー"));
      } finally {
        setLoadingReviews(false);
      }
    };

    runDiagnosis();

    // 【修正の核心】依存配列を空にする、もしくはプリミティブな値(値が変わらないもの)のみにする
    // supabaseを含めると、レンダリングのたびに新しいインスタンスと判定され無限ループします。
  }, [companyName, budget, router]); // supabaseを配列から削除

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">{companyName} 様の分析結果</h1>
        <p className="text-gray-500">AIが導き出した最適なポートフォリオです</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-blue-600 text-white p-8 rounded-3xl shadow-lg">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <span className="mr-2">🚀</span> 戦略アドバイス
            </h2>
            <p className="text-lg leading-relaxed opacity-90 whitespace-pre-wrap">{aiAdvice}</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 text-sm">推奨予算配分シミュレーション</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>メイン媒体 ({answers[1] || '推奨'})</span>
                  <span className="font-bold">70%</span>
                </div>
                <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full" style={{ width: '70%' }}></div>
                </div>
                <p className="text-right text-sm font-bold text-blue-600 mt-1">¥{allocation.primary.toLocaleString()}</p>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>サブ/テスト運用</span>
                  <span className="font-bold">30%</span>
                </div>
                <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden">
                  <div className="bg-blue-300 h-full" style={{ width: '30%' }}></div>
                </div>
                <p className="text-right text-sm font-bold text-blue-400 mt-1">¥{allocation.secondary.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-xl font-bold text-gray-800 mb-6">ヒアリング内容</h2>
          <div className="space-y-4 text-sm">
            {QUESTIONS.map((q, index) => (
              <div key={q.id} className="pb-3 border-b border-gray-50 last:border-0">
                <p className="text-gray-400 mb-0.5">{q.question}</p>
                <p className="text-gray-800 font-bold">{answers[index] || "未回答"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="mr-2">🤝</span> あなたに近い事例
        </h2>
        
        {loadingReviews ? (
          <div className="text-center py-10 text-gray-400">データを読み込み中...</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 text-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-bold text-gray-800 truncate mr-2">{rev.company_name}</span>
                    <span className="text-yellow-500 font-bold">★{rev.rating}</span>
                  </div>
                  <p className="text-gray-600 leading-tight mb-3 line-clamp-3 italic">"{rev.comment}"</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {Array.isArray(rev.ad_methods) && rev.ad_methods.map((m: string) => (
                    <span key={m} className="text-[9px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded">#{m}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-center pt-4 gap-4">
        <button onClick={() => router.push('/home')} className="px-8 py-3 bg-white border border-gray-300 text-gray-600 rounded-full font-bold hover:bg-gray-50 transition-all">
          一覧へ
        </button>
        <button onClick={() => router.push('/home/new')} className="px-8 py-3 bg-gray-900 text-white rounded-full font-bold hover:bg-gray-800 transition-all shadow-lg">
          再シミュレーション
        </button>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">分析中...</div>}>
      <ResultContent />
    </Suspense>
  );
}