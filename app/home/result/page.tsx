"use client";

import React, { Suspense, useEffect, useState, useMemo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { generateHomeAdvice } from '@/app/actions/diagnosis';
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

  const diagnosisId = searchParams.get('id') || '';
  const companyName = searchParams.get('company') || 'お客様';
  const budget = Number(searchParams.get('budget')) || 0;
  const answersParam = searchParams.get('answers') || '[]';

  // useMemoでanswersをメモ化して無限ループを防止
  const answers = useMemo(() => {
    try {
      return JSON.parse(answersParam);
    } catch {
      return [];
    }
  }, [answersParam]);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [aiAdvice, setAiAdvice] = useState<string>("AIが分析しています...");
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  // 重複実行を防ぐためのref
  const hasRun = useRef(false);

  useEffect(() => {
    // 既に実行済みの場合はスキップ
    if (hasRun.current) return;

    const runDiagnosis = async () => {
      if (!diagnosisId) {
        setAiAdvice("診断IDが見つかりません。もう一度お試しください。");
        setIsAnalyzing(false);
        setLoadingReviews(false);
        return;
      }

      hasRun.current = true;
      setLoadingReviews(true);
      setIsAnalyzing(true);

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        // 口コミ取得
        const { data: revData, error: revError } = await supabase
          .from("reviews").select("*").limit(3);

        if (revError) throw revError;
        setReviews(revData as Review[]);

        // 診断データ取得（AI分析結果も含む）
        const { data: diagnosis, error: diagnosisError } = await supabase
          .from("ad_diagnoses")
          .select("ai_advice")
          .eq("id", diagnosisId)
          .single();

        if (diagnosisError || !diagnosis) {
          setAiAdvice("診断データが見つかりません");
        } else if (diagnosis.ai_advice && diagnosis.ai_advice.trim() !== "") {
          setAiAdvice(diagnosis.ai_advice);
        } else {
          setAiAdvice("AI分析結果がまだ保存されていません。しばらくしてから再度お試しください。");
        }

      } catch (err: unknown) {
        console.error("Diagnosis error:", err);
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setAiAdvice(`診断結果の取得中にエラーが発生しました: ${errorMessage}`);
      } finally {
        setLoadingReviews(false);
        setIsAnalyzing(false);
      }
    };

    runDiagnosis();
  }, [diagnosisId, router, supabase]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">{companyName} 様の分析結果</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-cyan-200 text-slate-900 p-8 rounded-3xl shadow-lg border-2 border-cyan-400">
          <h2 className="text-xl font-bold mb-4">🚀 戦略アドバイス</h2>
          {isAnalyzing ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin h-5 w-5 border-2 border-cyan-700 rounded-full border-t-transparent"></div>
              <span>AIが分析しています...</span>
            </div>
          ) : (
            <div className="whitespace-pre-wrap break-words text-base leading-relaxed max-h-[400px] overflow-y-auto pr-2" style={{wordBreak: 'break-word'}}>
              {aiAdvice}
            </div>
          )}
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
        {loadingReviews ? (
          <div className="text-center py-4">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent mx-auto"></div>
          </div>
        ) : (
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
        )}
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
