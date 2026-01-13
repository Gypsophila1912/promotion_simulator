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
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">シミュレーション一覧</h1>
        <button
          onClick={() => router.push('/home/new')} // 入力画面へ
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-md"
        >
          新規作成
        </button>
      </div>

      <div className="grid gap-4">
        {histories.length > 0 ? (
          histories.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-bold text-gray-800 mb-2">{item.company_name}</h2>
              <div className="text-sm text-gray-500 space-y-1">
                <p>投資カテゴリー: {item.answers?.[1] || '未設定'}</p>
                <p>予算: {Number(item.budget).toLocaleString()}円</p>
                <p className="pt-2 text-xs text-gray-300">
                  {new Date(item.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 py-20">データがありません。「新規作成」から始めましょう！</p>
        )}
      </div>
    </div>
  );
}