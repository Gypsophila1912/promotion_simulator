"use client";

import React, { useState, useEffect, Suspense} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const QUESTIONS = [
  { id: 1, question: "主なターゲット層を教えてください", options: ["新規客", "既存客", "新卒・就職活動中", "BtoB", "その他"] },
  { id: 2, question: "検討している広告媒体はありますか？", options: ["SNS", "検索エンジン", "動画広告", "オフライン", "未定"] },
  { id: 3, question: "現在、一番困っていることは何ですか？", options: ["予算配分不明", "効果比較が困難", "媒体選び", "人手不足", "過去の失敗"] },
  { id: 4, question: "過去の広告運用の経験を教えてください", options: ["未経験", "個人で経験", "外注経験あり", "専門担当あり", "改善したい"] },
  { id: 5, question: "最も重視したい成果（KPI）は何ですか？", options: ["問い合わせ・購入", "認知度アップ", "アクセス数", "ファン獲得", "費用対効果"] },
];

function QuestionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const companyName = searchParams.get('company') || '';
  const budget = searchParams.get('budget') || '';

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelect = async (option: string) => {
    const newAnswers = [...answers, option];
    setAnswers(newAnswers);

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsSubmitting(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("認証が必要です");

        // user_id を追加して保存
        const { error } = await supabase.from('ad_diagnoses')
        .insert([{ 
          user_id: user.id, 
          company_name: companyName, 
          budget: parseInt(budget, 10) || 0, 
          answers: newAnswers 
        }]);

        if (error) throw error;

        const query = new URLSearchParams({
          company: companyName,
          budget: budget,
          answers: JSON.stringify(newAnswers)
        }).toString();
        
        router.push(`/home/result?${query}`);
      } catch (error: any) {
        alert(`保存に失敗しました: ${error.message}`);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const currentQ = QUESTIONS[currentStep];

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-center mb-10">{currentQ.question}</h2>
        <div className="grid gap-4">
          {currentQ.options.map((option, index) => (
            <button
              key={index}
              disabled={isSubmitting}
              onClick={() => handleSelect(option)}
              className="w-full text-left p-4 rounded-xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function QuestionPage() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <QuestionContent />
    </Suspense>
  );
}