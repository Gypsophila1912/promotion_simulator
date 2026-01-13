"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
// 以前のやり取りで確定したパスを使用
import { createClient } from '@/lib/supabase/client';

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
  const supabase = createClient();

  // URLパラメータからデータを取得
  const companyName = searchParams.get('company') || 'お客様';
  const budget = searchParams.get('budget') || '0';
  const answers = JSON.parse(searchParams.get('answers') || '[]');

  // --- 共同開発者の「口コミ」データを保持する設定 ---
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // --- ページ読み込み時に口コミを取得 ---
  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from("reviews") // 相手が作成したテーブル名
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3); // 最新3件を表示

      if (!error && data) {
        setReviews(data);
      }
      setLoadingReviews(false);
    };
    fetchReviews();
  }, [supabase]);

  const getAdvice = () => {
    if (answers[1] === "SNS") {
      return "視覚的な訴求が重要なSNS広告で、認知度と親近感を同時に高める戦略が有効です。";
    } else if (answers[0] === "BtoB") {
      return "ターゲットが限定的なBtoBでは、検索キーワードを絞ったリスティング広告が最も費用対効果が高くなります。";
    }
    return "まずは低予算から複数の媒体をテストし、貴社に最適な獲得ルートを特定することをお勧めします。";
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* ヘッダーセクション */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">{companyName} 様の診断結果</h1>
        <p className="text-gray-500">ご回答いただいた内容に基づいた最適なプランです</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* 左側：AI分析アドバイス */}
        <div className="bg-blue-600 text-white p-8 rounded-3xl shadow-lg">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <span className="mr-2">💡</span> 推奨される戦略
          </h2>
          <p className="text-lg leading-relaxed opacity-90">
            {getAdvice()}
          </p>
          <div className="mt-6 pt-6 border-t border-blue-400">
            <p className="text-sm opacity-80">設定予算</p>
            {/* 単位を相手のデータ形式に合わせて調整 */}
            <p className="text-2xl font-bold">¥{Number(budget).toLocaleString()}円</p>
          </div>
        </div>

        {/* 右側：回答一覧 */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">あなたの回答一覧</h2>
          <div className="space-y-4">
            {QUESTIONS.map((q, index) => (
              <div key={q.id} className="pb-4 border-b border-gray-50 last:border-0">
                <p className="text-xs text-gray-400 font-medium mb-1">Q{q.id}. {q.question}</p>
                <p className="text-gray-700 font-semibold">{answers[index] || "未回答"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- 連携済み：他のユーザーの口コミ表示セクション --- */}
      <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="mr-2">💬</span> 業界の先輩たちのリアルな声
        </h2>
        
        {loadingReviews ? (
          <p className="text-center text-gray-400">口コミを読み込み中...</p>
        ) : reviews.length > 0 ? (
          <div className="grid gap-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-blue-600">{rev.company_name}</h3>
                  <span className="text-xs bg-yellow-50 text-yellow-600 px-2 py-1 rounded font-bold">
                    ★ {rev.roi_rating}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{rev.result_description}</p>
                <div className="flex flex-wrap gap-2">
                  {rev.ad_methods?.map((method: string) => (
                    <span key={method} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                      #{method}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 italic">まだ口コミが投稿されていません。</p>
        )}
      </div>

      {/* アクションボタン */}
      <div className="flex justify-center pt-4 gap-4">
        <button
          onClick={() => router.push('/home')}
          className="px-8 py-3 bg-white border border-gray-300 text-gray-600 rounded-full font-bold hover:bg-gray-50 transition-colors"
        >
          一覧に戻る
        </button>
        <button
          onClick={() => router.push('/home/new')}
          className="px-8 py-3 bg-gray-800 text-white rounded-full font-bold hover:bg-gray-700 transition-colors"
        >
          新しく診断する
        </button>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">分析中...</div>}>
      <ResultContent />
    </Suspense>
  );
}