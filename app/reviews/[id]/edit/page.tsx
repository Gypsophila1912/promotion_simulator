"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";

export default function EditReviewPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const reviewId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [review, setReview] = useState({
    company_name: "",
    industry: "",
    budget: "",
    ad_methods: [] as string[],
    ad_purpose: "購買",
    target_audience: "",
    result_description: "",
    roi_rating: "3",
    simulation_link: "", // 追加
  });

  const AD_METHODS = [
    "SNS広告",
    "リスティング",
    "ディスプレイ",
    "インフルエンサー",
  ];

  useEffect(() => {
    if (!reviewId) return;

    const fetchReview = async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("id", reviewId)
        .single();

      if (error || !data) {
        setMessage("口コミが見つかりません");
        setLoading(false);
        return;
      }

      setReview({
        company_name: data.company_name,
        industry: data.industry,
        budget: String(data.budget),
        ad_methods: data.ad_methods || [],
        ad_purpose: data.ad_purpose || "購買",
        target_audience: data.target_audience || "",
        result_description: data.result_description,
        roi_rating: String(data.roi_rating),
        simulation_link: data.simulation_link || "", // 追加
      });

      setLoading(false);
    };

    fetchReview();
  }, [reviewId, supabase]);

  const toggleAdMethod = (method: string) => {
    setReview((prev) => ({
      ...prev,
      ad_methods: prev.ad_methods.includes(method)
        ? prev.ad_methods.filter((m) => m !== method)
        : [...prev.ad_methods, method],
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    if (review.ad_methods.length === 0) {
      setMessage("❌ 広告手法を最低1つ選択してください");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("reviews")
      .update({
        company_name: review.company_name,
        industry: review.industry,
        budget: Number(review.budget),
        ad_methods: review.ad_methods,
        ad_purpose: review.ad_purpose,
        target_audience: review.target_audience,
        result_description: review.result_description,
        roi_rating: Number(review.roi_rating),
        simulation_link: review.simulation_link, // 追加
      })
      .eq("id", reviewId);

    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      router.push("/reviews/mine");
    }

    setSaving(false);
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return <p className="p-6">読み込み中...</p>;
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">口コミを編集</h1>

      {message && (
        <div className="mb-4 p-3 bg-red-50 border rounded">{message}</div>
      )}

      <form
        onSubmit={handleSave}
        className="space-y-6 border rounded-lg p-6 bg-white shadow"
      >
        {/* サービス名 */}
        <div>
          <label className="block text-sm font-medium mb-1">
            サービス名 <span className="text-red-500">*</span>
          </label>
          <input
            className="w-full border px-3 py-2 rounded"
            value={review.company_name}
            onChange={(e) =>
              setReview({ ...review, company_name: e.target.value })
            }
            required
          />
        </div>

        {/* 業種 */}
        <div>
          <label className="block text-sm font-medium mb-1">
            業種 <span className="text-red-500">*</span>
          </label>
          <input
            className="w-full border px-3 py-2 rounded"
            value={review.industry}
            onChange={(e) => setReview({ ...review, industry: e.target.value })}
            required
          />
        </div>

        {/* 費用感 */}
        <div>
          <label className="block text-sm font-medium mb-1">
            費用（円） <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            className="w-full border px-3 py-2 rounded"
            value={review.budget}
            onChange={(e) => setReview({ ...review, budget: e.target.value })}
            required
          />
        </div>

        {/* 実施シミュレーションリンク ここ追加 */}
        <div>
          <label className="block text-sm font-medium mb-1">
            実施シミュレーションリンク
          </label>
          <input
            type="url"
            className="w-full border px-3 py-2 rounded"
            value={review.simulation_link}
            onChange={(e) =>
              setReview({ ...review, simulation_link: e.target.value })
            }
            placeholder="https://example.com"
          />
        </div>

        {/* 利用した広告手法 */}
        <div>
          <label className="block text-sm font-medium mb-2">
            利用した広告手法 <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {AD_METHODS.map((method) => (
              <button
                type="button"
                key={method}
                onClick={() => toggleAdMethod(method)}
                className={`px-3 py-1 rounded border text-sm ${
                  review.ad_methods.includes(method)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white"
                }`}
              >
                {method}
              </button>
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
                checked={review.ad_purpose === "購買"}
                onChange={(e) =>
                  setReview({ ...review, ad_purpose: e.target.value })
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
                checked={review.ad_purpose === "周知"}
                onChange={(e) =>
                  setReview({ ...review, ad_purpose: e.target.value })
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
            className="w-full border px-3 py-2 rounded"
            value={review.target_audience}
            onChange={(e) =>
              setReview({
                ...review,
                target_audience: e.target.value,
              })
            }
            placeholder="例：20代女性、経営者層、学生など"
            required
          />
        </div>

        {/* ROI評価 */}
        <div>
          <label className="block text-sm font-medium mb-1">
            ROI評価（1〜5） <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full border px-3 py-2 rounded"
            value={review.roi_rating}
            onChange={(e) =>
              setReview({ ...review, roi_rating: e.target.value })
            }
            required
          >
            <option value="1">1（悪い）</option>
            <option value="2">2</option>
            <option value="3">3（普通）</option>
            <option value="4">4</option>
            <option value="5">5（良い）</option>
          </select>
        </div>

        {/* 成果実感 */}
        <div>
          <label className="block text-sm font-medium mb-1">成果・感想</label>
          <textarea
            className="w-full border px-3 py-2 rounded"
            rows={4}
            value={review.result_description}
            onChange={(e) =>
              setReview({
                ...review,
                result_description: e.target.value,
              })
            }
          />
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300 transition disabled:bg-gray-100"
            disabled={saving}
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {saving ? "保存中..." : "変更を保存"}
          </button>
        </div>
      </form>
    </main>
  );
}
