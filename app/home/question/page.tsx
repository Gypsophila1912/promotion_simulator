"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const QUESTIONS = [
  { id: 1, question: "主なターゲット層を教えてください", options: ["新規客", "既存客", "新卒・就職活動中", "BtoB", "その他"] },
  { id: 2, question: "検討している広告媒体はありますか？", options: ["SNS", "検索エンジン", "動画広告", "オフライン", "未定"] },
  { id: 3, question: "現在、一番困っていることは何ですか？", options: ["予算配分不明", "効果比較が困難", "媒体選び", "人手不足", "過去の失敗"] },
  { id: 4, question: "過去の広告運用の経験を教えてください", options: ["未経験", "個人で経験", "外注経験あり", "専門担当あり", "改善したい"] },
  { id: 5, question: "最も重視したい成果（KPI）は何ですか？", options: ["問い合わせ・購入", "認知度アップ", "アクセス数", "ファン獲得", "費用対効果"] },
];

export default function QuestionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  // 3. 前の画面からのデータ（会社名・予算）を受け取る
  const companyName = searchParams.get('company') || '';
  const budget = searchParams.get('budget') || '';

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. 入力チェック（会社名や予算がない場合はホームに戻す）
  useEffect(() => {
    if (!companyName || !budget) {
      alert("会社名と予算を最初に入力してください。");
      router.push('/home');
    }
  }, [companyName, budget, router]);

  const handleSelect = async (option: string) => {
    const newAnswers = [...answers, option];
    setAnswers(newAnswers);

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // 1 & Supabase: 全質問終了時にデータを保存
      setIsSubmitting(true);
      try {
        console.log("Supabaseに保存中...", { companyName, budget, newAnswers });
        
        // 実際のSupabase保存処理
        const { error } = await supabase.from('ad_diagnoses') // ここに確認したテーブル名を入れる
        .insert([{ 
        company_name: companyName, 
        budget: parseInt(budget, 10) || 0, 
        answers: newAnswers // 配列のまま保存（SQL側でjsonb型にしているため）
    }]);

    if (error) {
        console.error("エラー内容:", error.message);
        throw error;
    }

        // データの引き継ぎ：URLパラメータに回答も含めて結果ページへ
        const query = new URLSearchParams({
          company: companyName,
          budget: budget,
          answers: JSON.stringify(newAnswers)
        }).toString();
        
        router.push(`/home/result?${query}`);
      } catch (error) {
        alert("保存に失敗しました");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const currentQ = QUESTIONS[currentStep];

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        
        {/* 上部に現在の情報を小さく表示（引き継ぎ確認用） */}
        <div className="flex justify-between text-xs text-gray-400 mb-4">
          <span>会社: {companyName}</span>
          <span>予算: {Number(budget).toLocaleString()}円</span>
        </div>

        <div className="w-full bg-gray-100 h-2 rounded-full mb-8">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / QUESTIONS.length) * 100}%` }}
          ></div>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mt-2">{currentQ.question}</h2>
        </div>

        <div className="grid gap-4">
          {currentQ.options.map((option, index) => (
            <button
              key={index}
              disabled={isSubmitting}
              onClick={() => handleSelect(option)}
              className="w-full text-left p-4 rounded-xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center disabled:opacity-50"
            >
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 mr-4 text-sm">{index + 1}</span>
              <span className="text-gray-700 font-medium">{option}</span>
            </button>
          ))}
        </div>

        {/* 4. やり直すボタンの挙動修正 */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/home')}
            className="text-gray-400 text-sm hover:text-gray-600 underline"
          >
            最初からやり直す
          </button>
        </div>
      </div>
    </div>
  );
}