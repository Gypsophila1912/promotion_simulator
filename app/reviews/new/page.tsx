"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function NewReviewPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [reviewData, setReviewData] = useState({
    company_name: "",
    industry: "",
    budget: "",
    ad_methods: [] as string[],
    ad_purpose: "購買",
    target_audience: "",
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

    // バリデーション: 広告手法が1つも選択されていない場合
    if (reviewData.ad_methods.length === 0) {
      setMessage("❌ 広告手法を最低1つ選択してください");
      setLoading(false);
      return;
    }

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
          ad_purpose: reviewData.ad_purpose,
          target_audience: reviewData.target_audience,
          result_description: reviewData.result_description,
          roi_rating: Number(reviewData.roi_rating),
        },
      ]);

      if (error) {
        console.error(error);
        setMessage(`❌ エラー: ${error.message}`);
      } else {
        setMessage("✅ 口コミを保存しました！");
        // 1秒後に一覧ページへ遷移
        setTimeout(() => {
          router.push("/reviews");
        }, 1000);
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
      <div className="mb-6">
        <button
          onClick={() => router.push("/reviews")}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          口コミ一覧に戻る
        </button>
      </div>

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
          <label className="block text-sm font-medium mb-1">
            サービス名 <span className="text-red-500">*</span>
          </label>
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
          <label className="block text-sm font-medium mb-1">
            業界 <span className="text-red-500">*</span>
          </label>
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
            月額予算（円） <span className="text-red-500">*</span>
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
          <label className="block text-sm font-medium mb-2">
            広告手法 <span className="text-red-500">*</span>
          </label>
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
          <p className="text-xs text-gray-500 mt-1">※最低1つ選択してください</p>
        </div>

        {/* 広告目的 */}
        <div>
          <label className="block text-sm font-medium mb-2">
            広告目的 <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="ad_purpose"
                value="購買"
                checked={reviewData.ad_purpose === "購買"}
                onChange={(e) =>
                  setReviewData({ ...reviewData, ad_purpose: e.target.value })
                }
                required
              />
              購買目的
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="ad_purpose"
                value="周知"
                checked={reviewData.ad_purpose === "周知"}
                onChange={(e) =>
                  setReviewData({ ...reviewData, ad_purpose: e.target.value })
                }
                required
              />
              周知目的
            </label>
          </div>
        </div>

        {/* ターゲット層 */}
        <div>
          <label className="block text-sm font-medium mb-1">
            ターゲット層 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={reviewData.target_audience}
            onChange={(e) =>
              setReviewData({
                ...reviewData,
                target_audience: e.target.value,
              })
            }
            placeholder="例：20代女性、経営者層、学生など"
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        {/* ROI */}
        <div>
          <label className="block text-sm font-medium mb-1">
            費用対効果（1〜5） <span className="text-red-500">*</span>
          </label>
          <select
            value={reviewData.roi_rating}
            onChange={(e) =>
              setReviewData({ ...reviewData, roi_rating: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-md"
            required
          >
            {[1, 2, 3, 4, 5].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
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
    </main>
  );
}
