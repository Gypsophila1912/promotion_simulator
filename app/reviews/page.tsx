"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Review = {
  id: string;
  company_name: string;
  industry: string;
  budget: number;
  ad_methods: string[];
  result_description: string;
  roi_rating: number;
  created_at: string;
};

export default function ReviewsPage() {
  const supabase = createClient();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select(
          `
          id,
          company_name,
          industry,
          budget,
          ad_methods,
          result_description,
          roi_rating,
          created_at
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setErrorMessage("口コミの取得に失敗しました");
      } else {
        setReviews(data || []);
      }

      setLoading(false);
    };

    fetchReviews();
  }, [supabase]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">口コミ一覧</h1>
      <Link href="/reviews/new" className="font-bold">
        口コミ作成ページへ
      </Link>
      <Link href="/reviews/mine" className="font-bold">
        自分の口コミへ
      </Link>

      {loading && <p>読み込み中...</p>}

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          {errorMessage}
        </div>
      )}

      {!loading && reviews.length === 0 && (
        <p className="text-gray-500">まだ口コミがありません</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="border rounded-lg p-6 bg-white shadow"
          >
            {/* ヘッダー */}
            <div className="mb-2">
              <h2 className="text-xl font-semibold">{review.company_name}</h2>
              <p className="text-sm text-gray-500">業界：{review.industry}</p>
            </div>

            {/* メタ情報 */}
            <div className="text-sm text-gray-700 space-y-1 mb-3">
              <p>月額予算：¥{review.budget.toLocaleString()}</p>
              <p>費用対効果：{review.roi_rating} / 5</p>
            </div>

            {/* 広告手法 */}
            {review.ad_methods?.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {review.ad_methods.map((method) => (
                  <span
                    key={method}
                    className="text-xs bg-gray-100 px-2 py-1 rounded"
                  >
                    {method}
                  </span>
                ))}
              </div>
            )}

            {/* 成果 */}
            <div className="text-sm text-gray-800 whitespace-pre-wrap">
              {review.result_description}
            </div>

            {/* 日付 */}
            <div className="mt-4 text-xs text-gray-400">
              投稿日：
              {new Date(review.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
