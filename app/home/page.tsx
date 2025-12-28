"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [companyName, setCompanyName] = useState('');
  const [budget, setBudget] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">ホーム画面</h1>
        
        {/* onSubmitは不要になるのでdivに変更してもOKです */}
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">会社名</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="株式会社〇〇"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            <div className="w-1/3">
              <label className="block text-sm font-medium text-gray-700 mb-1">予算</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="金額"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>
          </div>

          {/* 送信ボタン（質問へ） */}
          {/* queryを使って、入力した会社名と予算を次のページへ送る設定です */}
          <Link 
            href={{
              pathname: "/home/question",
              query: { company: companyName, budget: budget }
            }} 
            className="block w-full"
          >
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-md transition duration-200">
              質問へ
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}