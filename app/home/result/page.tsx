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
  const supabase = createClient();

  const companyName = searchParams.get('company') || 'お客様';
  const budget = Number(searchParams.get('budget')) || 0;
  
  let answers: string[] = [];
  try {
    answers = JSON.parse(searchParams.get('answers') || '[]');
  } catch (e) { answers = []; }

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [aiAdvice, setAiAdvice] = useState<string>("AIが分析しています...");

  useEffect(() => {
    const runDiagnosis = async () => {
      setLoadingReviews(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        // 口コミ取得 (カラム名 roi_rating, result_description)
        const { data: revData, error: revError } = await supabase
          .from("reviews").select("*").limit(3);
        
        if (revError) throw revError;
        setReviews(revData as Review[]);

        // Gemini呼び出し
        const advice = await getAiAdvice(companyName, budget, answers);
        setAiAdvice(advice);

      } catch (err: any) {
        console.error("Diagnosis error:", err);
        setAiAdvice("診断結果の生成中にエラーが発生しました。");
      } finally {
        setLoadingReviews(false);
      }
    };

    runDiagnosis();
  }, [companyName, budget, router]); // 無限ループ防止のためsupabaseを除外

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">{companyName} 様の分析結果</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-blue-600 text-white p-8 rounded-3xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">🚀 戦略アドバイス</h2>
          <p className="whitespace-pre-wrap">{aiAdvice}</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6">ヒアリング内容</h2>
          <div className="space-y-4">
            {QUESTIONS.map((q, index) => (
              <div key={q.id} className="pb-2 border-b">
                <p className="text-gray-400 text-xs">{q.question}</p>
                <p className="font-bold">{answers[index] || "未回答"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-8 rounded-3xl border">
        <h2 className="text-xl font-bold mb-6">🤝 あなたに近い事例</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {reviews.map((rev) => (
            <div key={rev.id} className="bg-white p-4 rounded-2xl shadow-sm border">
              <div className="flex justify-between mb-2">
                <span className="font-bold truncate">{rev.company_name}</span>
                <span className="text-yellow-500">★{rev.rating}</span>
              </div>
              <p className="text-gray-600 text-sm italic">"{rev.comment}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <ResultContent />
    </Suspense>
  );
}