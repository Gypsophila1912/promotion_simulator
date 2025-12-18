"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// 質問データの定義
const QUESTIONS = [
  {
    id: 1,
    question: "主なターゲット層を教えてください",
    options: ["新規のお客さん", "既存のお客さん", "新卒・就職活動中の方", "BtoB（企業向け）", "その他"],
  },
  {
    id: 2,
    question: "検討している広告媒体はありますか？",
    options: ["Instagram/TikTokなどSNS", "Google/Yahooなどの検索", "YouTubeなどの動画広告", "チラシや看板などのオフライン", "まだ決まっていない"],
  },
  {
    id: 3,
    question: "現在、一番困っていることは何ですか？",
    options: ["予算をどう分けるべきか不明", "宣伝効果の比較が難しい", "どの媒体が合うか分からない", "人手が足りず実施できない", "以前やってみたが効果が出なかった"],
  },
  {
    id: 4,
    question: "過去の広告運用の経験を教えてください",
    options: ["全く経験がない", "SNSなどを個人でやった程度", "外注して運用したことがある", "社内に専門の担当がいる", "現在も運用中だが改善したい"],
  },
  {
    id: 5,
    question: "最も重視したい成果（KPI）は何ですか？",
    options: ["直接の問い合わせ・購入", "商品や会社の認知度アップ", "Webサイトへのアクセス数", "フォロワーやファンを増やす", "費用対効果（ROAS）の最大化"],
  },
];

export default function QuestionPage() {
  const router = useRouter();
  
  // 現在何番目の質問か（0〜4）
  const [currentStep, setCurrentStep] = useState(0);
  // 回答を保存する配列
  const [answers, setAnswers] = useState<string[]>([]);

  const currentQ = QUESTIONS[currentStep];

  // 選択肢をクリックした時の処理
  const handleSelect = (option: string) => {
    const newAnswers = [...answers, option];
    setAnswers(newAnswers);

    if (currentStep < QUESTIONS.length - 1) {
      // 次の質問へ
      setCurrentStep(currentStep + 1);
    } else {
      // 全質問終了 -> 分析結果ページへ（回答データを渡す想定）
      console.log("全回答完了:", newAnswers);
      router.push('/home/result'); 
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        
        {/* プログレスバー（今どこにいるか） */}
        <div className="w-full bg-gray-100 h-2 rounded-full mb-8">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / QUESTIONS.length) * 100}%` }}
          ></div>
        </div>

        <div className="text-center mb-10">
          <span className="text-blue-500 font-bold text-sm uppercase tracking-widest">Question {currentQ.id}</span>
          <h2 className="text-2xl font-bold text-gray-800 mt-2">{currentQ.question}</h2>
        </div>

        <div className="grid gap-4">
          {currentQ.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelect(option)}
              className="w-full text-left p-4 rounded-xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="flex items-center">
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 group-hover:bg-blue-500 group-hover:text-white mr-4 transition-colors">
                  {index + 1}
                </span>
                <span className="text-gray-700 font-medium group-hover:text-blue-700">{option}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => router.back()}
            className="text-gray-400 text-sm hover:text-gray-600 underline"
          >
            やり直す（前の画面へ）
          </button>
        </div>
      </div>
    </div>
  );
}