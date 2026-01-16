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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 py-10 px-2">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-slate-800 mb-8 tracking-tight drop-shadow-sm">
          こんにちは、<span className="text-blue-700">{userName}</span> さん
        </h1>
        <div className="flex justify-center mb-8">
          <button
            onClick={() => router.push('/home/new')}
            className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            ＋ 新規診断
          </button>
        </div>
        <div className="bg-white/90 rounded-2xl shadow-xl border border-gray-100 overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-gray-400">読み込み中...</div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gradient-to-r from-cyan-100 to-blue-100 text-blue-700 text-xs uppercase tracking-wider">
                  <th className="p-4">実施日</th>
                  <th className="p-4">会社名</th>
                  <th className="p-4">予算</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {histories.map((item) => (
                  <tr key={item.id} className="hover:bg-cyan-50 group transition">
                    <td className="p-4 text-sm whitespace-nowrap">{new Date(item.created_at).toLocaleDateString()}</td>
                    <td className="p-4 font-bold text-slate-700 whitespace-nowrap">{item.company_name}</td>
                    <td className="p-4 text-slate-600 whitespace-nowrap">¥{item.budget.toLocaleString()}</td>
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
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-4 py-2 rounded-full shadow-sm border border-blue-200 transition-all duration-150"
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
    </div>
  );
}