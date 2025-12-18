"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function NewReviewPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [reviewData, setReviewData] = useState({
    company_name: "",
    industry: "",
    budget: "",
    ad_methods: [] as string[],
    result_description: "",
    roi_rating: "3",
  });

  const AD_METHODS = [
    "SNS広告",
    "リスティング",
    "ディスプレイ",
    "インフルエンサー",
  ];

  const toggleAdMethod = (method: string) => {
    setReviewData((prev) => ({
      ...prev,
      ad_methods: prev.ad_methods.includes(method)
        ? prev.ad_methods.filter((m) => m !== method)
        : [...prev.ad_methods, method],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // ログインユーザー取得
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("❌ ログインが必要です");
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("reviews").insert([
        {
          user_id: user.id,
          company_name: reviewData.company_name,
          industry: reviewData.industry,
          budget: Number(reviewData.budget),
          ad_methods: reviewData.ad_methods,
          result_description: reviewData.result_description,
          roi_rating: Number(reviewData.roi_rating),
        },
      ]);

      if (error) {
        console.error(error);
        setMessage(`❌ エラー: ${error.message}`);
      } else {
        setMessage("✅ 口コミを保存しました！");
        setReviewData({
          company_name: "",
          industry: "",
          budget: "",
          ad_methods: [],
          result_description: "",
          roi_rating: "3",
        });
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ 予期しないエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">口コミ投稿</h1>

      {message && (
        <div className="mb-6 p-4 bg-gray-100 border rounded-lg">{message}</div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 border rounded-lg p-6 bg-white shadow"
      >
        {/* サービス名 */}
        <div>
          <label className="block text-sm font-medium mb-1">サービス名</label>
          <input
            type="text"
            value={reviewData.company_name}
            onChange={(e) =>
              setReviewData({
                ...reviewData,
                company_name: e.target.value,
              })
            }
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        {/* 業界 */}
        <div>
          <label className="block text-sm font-medium mb-1">業界</label>
          <input
            type="text"
            value={reviewData.industry}
            onChange={(e) =>
              setReviewData({ ...reviewData, industry: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        {/* 予算 */}
        <div>
          <label className="block text-sm font-medium mb-1">
            月額予算（円）
          </label>
          <input
            type="number"
            value={reviewData.budget}
            onChange={(e) =>
              setReviewData({ ...reviewData, budget: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        {/* 広告手法 */}
        <div>
          <label className="block text-sm font-medium mb-2">広告手法</label>
          <div className="grid grid-cols-2 gap-2">
            {AD_METHODS.map((method) => (
              <label key={method} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={reviewData.ad_methods.includes(method)}
                  onChange={() => toggleAdMethod(method)}
                />
                {method}
              </label>
            ))}
          </div>
        </div>

        {/* 成果実感 */}
        <div>
          <label className="block text-sm font-medium mb-1">成果の実感</label>
          <textarea
            rows={4}
            value={reviewData.result_description}
            onChange={(e) =>
              setReviewData({
                ...reviewData,
                result_description: e.target.value,
              })
            }
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        {/* ROI */}
        <div>
          <label className="block text-sm font-medium mb-1">
            費用対効果（1〜5）
          </label>
          <select
            value={reviewData.roi_rating}
            onChange={(e) =>
              setReviewData({ ...reviewData, roi_rating: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-md"
          >
            {[1, 2, 3, 4, 5].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading ? "保存中..." : "口コミを保存"}
        </button>
      </form>
    </main>
  );
}
