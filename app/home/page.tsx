"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function HistoryPage() {
  const router = useRouter();
  const supabase = createClient();
  const [histories, setHistories] = useState<any[]>([]);

  // Supabaseから過去の診断データを取得
  useEffect(() => {
    const fetchHistories = async () => {
      const { data, error } = await supabase
        .from('ad_diagnoses')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) setHistories(data);
    };
    fetchHistories();
  }, [supabase]);

  // --- 追加：クリック時に結果ページへ遷移する関数 ---
  const handleCardClick = (item: any) => {
    const query = new URLSearchParams({
      company: item.company_name,
      budget: String(item.budget),
      // answersは配列なので文字列にして渡す
      answers: JSON.stringify(item.answers || [])
    }).toString();

    router.push(`/home/result?${query}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">シミュレーション一覧</h1>
        <button
          onClick={() => router.push('/home/new')} 
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-md transition-colors"
        >
          新規作成
        </button>
      </div>

      <div className="grid gap-4">
        {histories.length > 0 ? (
          histories.map((item) => (
            <div 
              key={item.id} 
              // クリックイベントを追加
              onClick={() => handleCardClick(item)}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                    {item.company_name}
                  </h2>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>投資カテゴリー: <span className="text-gray-700 font-medium">{item.answers?.[1] || '未設定'}</span></p>
                    <p>予算: <span className="text-gray-700 font-medium">{Number(item.budget).toLocaleString()}円</span></p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-300 mb-2">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                  <span className="text-blue-500 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    結果を見る →
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400">データがありません。「新規作成」から始めましょう！</p>
          </div>
        )}
      </div>
    </div>
  );
}