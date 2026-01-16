"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { DiagnosisHistory } from '@/lib/types/database';

export default function HomePage() {
  const router = useRouter();
  const supabase = createClient();

  const [histories, setHistories] = useState<DiagnosisHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const fetchUserDataAndHistories = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        setUserName(user.user_metadata?.full_name || user.email || "ユーザー");

        const { data, error } = await supabase
          .from('ad_diagnoses')
          .select('*')
          .eq('user_id', user.id) // セキュリティ対策
          .order('created_at', { ascending: false });

        if (error) throw error;
        setHistories(data || []);

      } catch (error: any) {
        console.error("Fetch Error:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndHistories();
  }, [router]); // supabaseを依存配列から削除して無限ループを防止

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">こんにちは、{userName} さん</h1>
        <button onClick={() => router.push('/home/new')} className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold">
          新規診断
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">読み込み中...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs">
                <th className="p-4">実施日</th>
                <th className="p-4">会社名</th>
                <th className="p-4">予算</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {histories.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 group">
                  <td className="p-4 text-sm">{new Date(item.created_at).toLocaleDateString()}</td>
                  <td className="p-4 font-bold">{item.company_name}</td>
                  <td className="p-4">¥{item.budget.toLocaleString()}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => {
                        const query = new URLSearchParams({
                          id: item.id,
                          company: item.company_name,
                          budget: item.budget.toString(),
                          answers: JSON.stringify(item.answers)
                        }).toString();
                        router.push(`/home/result?${query}`);
                      }}
                      className="text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      結果を見る
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}