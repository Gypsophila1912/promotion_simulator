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
    result_description: "",
    roi_rating: "3",
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
        result_description: data.result_description,
        roi_rating: String(data.roi_rating),
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

    const { error } = await supabase
      .from("reviews")
      .update({
        company_name: review.company_name,
        industry: review.industry,
        budget: Number(review.budget),
        ad_methods: review.ad_methods,
        result_description: review.result_description,
        roi_rating: Number(review.roi_rating),
      })
      .eq("id", reviewId);

    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      router.push("/reviews/mine");
    }

    setSaving(false);
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
          <label className="block text-sm font-medium mb-1">サービス名</label>
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
          <label className="block text-sm font-medium mb-1">業種</label>
          <input
            className="w-full border px-3 py-2 rounded"
            value={review.industry}
            onChange={(e) => setReview({ ...review, industry: e.target.value })}
            required
          />
        </div>

        {/* 費用感 */}
        <div>
          <label className="block text-sm font-medium mb-1">費用（円）</label>
          <input
            type="number"
            className="w-full border px-3 py-2 rounded"
            value={review.budget}
            onChange={(e) => setReview({ ...review, budget: e.target.value })}
            required
          />
        </div>

        {/* 利用した広告手法 */}
        <div>
          <label className="block text-sm font-medium mb-2">
            利用した広告手法
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
            required
          />
        </div>

        {/* ROI評価 */}
        <div>
          <label className="block text-sm font-medium mb-1">
            ROI評価（1〜5）
          </label>
          <select
            className="w-full border px-3 py-2 rounded"
            value={review.roi_rating}
            onChange={(e) =>
              setReview({ ...review, roi_rating: e.target.value })
            }
          >
            <option value="1">1（悪い）</option>
            <option value="2">2</option>
            <option value="3">3（普通）</option>
            <option value="4">4</option>
            <option value="5">5（良い）</option>
          </select>
        </div>

        <button
          disabled={saving}
          className="w-full bg-blue-600 text-white py-2 rounded disabled:bg-gray-400"
        >
          {saving ? "保存中..." : "変更を保存"}
        </button>
      </form>
    </main>
  );
}
