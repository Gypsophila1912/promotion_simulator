"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function TestDBPage() {
  const [simulationData, setSimulationData] = useState({
    company_name: "",
    industry: "",
    budget: "",
  });

  const [reviewData, setReviewData] = useState({
    company_name: "",
    rating: "",
    comment: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  // シミュレーション保存テスト
  const handleSimulationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // 現在のユーザーを取得
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("❌ ログインが必要です");
        setLoading(false);
        return;
      }

      // シミュレーションデータを保存
      const { data, error } = await supabase.from("simulations").insert([
        {
          user_id: user.id,
          company_name: simulationData.company_name,
          industry: simulationData.industry,
          budget: parseInt(simulationData.budget),
        },
      ]);

      if (error) {
        setMessage(`❌ エラー: ${error.message}`);
        console.error("Error:", error);
      } else {
        setMessage("✅ シミュレーションが保存されました！");
        setSimulationData({ company_name: "", industry: "", budget: "" });
      }
    } catch (error) {
      setMessage(`❌ エラー: ${error}`);
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 口コミ保存テスト
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // 現在のユーザーを取得
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("❌ ログインが必要です");
        setLoading(false);
        return;
      }

      // 口コミデータを保存
      const { data, error } = await supabase.from("reviews").insert([
        {
          user_id: user.id,
          company_name: reviewData.company_name,
          rating: parseInt(reviewData.rating),
          comment: reviewData.comment,
        },
      ]);

      if (error) {
        setMessage(`❌ エラー: ${error.message}`);
        console.error("Error:", error);
      } else {
        setMessage("✅ 口コミが保存されました！");
        setReviewData({ company_name: "", rating: "", comment: "" });
      }
    } catch (error) {
      setMessage(`❌ エラー: ${error}`);
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">DB保存テストページ</h1>

      {/* メッセージ表示 */}
      {message && (
        <div className="mb-6 p-4 bg-gray-100 border rounded-lg">
          <p className="text-lg">{message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* シミュレーション保存テスト */}
        <div className="border rounded-lg p-6 bg-white shadow">
          <h2 className="text-2xl font-semibold mb-4">
            シミュレーション保存テスト
          </h2>
          <form onSubmit={handleSimulationSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">会社名</label>
              <input
                type="text"
                value={simulationData.company_name}
                onChange={(e) =>
                  setSimulationData({
                    ...simulationData,
                    company_name: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-md"
                placeholder="例: テストカフェ"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">投資詳細</label>
              <input
                type="text"
                value={simulationData.industry}
                onChange={(e) =>
                  setSimulationData({
                    ...simulationData,
                    industry: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-md"
                placeholder="例: 広告"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                予算（円）
              </label>
              <input
                type="number"
                value={simulationData.budget}
                onChange={(e) =>
                  setSimulationData({
                    ...simulationData,
                    budget: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-md"
                placeholder="例: 100000"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? "保存中..." : "シミュレーションを保存"}
            </button>
          </form>
        </div>

        {/* 口コミ保存テスト */}
        <div className="border rounded-lg p-6 bg-white shadow">
          <h2 className="text-2xl font-semibold mb-4">口コミ保存テスト</h2>
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">会社名</label>
              <input
                type="text"
                value={reviewData.company_name}
                onChange={(e) =>
                  setReviewData({ ...reviewData, company_name: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md"
                placeholder="例: テストカフェ"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                評価（1-5）
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={reviewData.rating}
                onChange={(e) =>
                  setReviewData({ ...reviewData, rating: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md"
                placeholder="例: 5"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">コメント</label>
              <textarea
                value={reviewData.comment}
                onChange={(e) =>
                  setReviewData({ ...reviewData, comment: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md"
                placeholder="例: とても良いサービスでした"
                rows={4}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? "保存中..." : "口コミを保存"}
            </button>
          </form>
        </div>
      </div>

      {/* 使い方 */}
      <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">使い方</h3>
        <ol className="list-decimal list-inside space-y-2">
          <li>ログインしていることを確認してください</li>
          <li>左側のフォームでシミュレーションデータを入力して保存</li>
          <li>右側のフォームで口コミデータを入力して保存</li>
          <li>
            Supabaseのダッシュボードで「simulations」と「reviews」テーブルを確認
          </li>
          <li>データが正しく保存されているか確認してください</li>
        </ol>
      </div>
    </main>
  );
}
