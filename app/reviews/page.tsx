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
  ad_purpose: string;
  target_audience: string;
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
        .select("*")
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
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">口コミ一覧</h1>

      {/* アクションボタン */}
      <div className="mb-8 flex flex-wrap gap-4">
        <Link
          href="/reviews/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          新規投稿
        </Link>
        <Link
          href="/reviews/mine"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 transition-colors shadow-sm hover:shadow-md"
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
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          自分の投稿
        </Link>
      </div>

      {loading && <p>読み込み中...</p>}

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          {errorMessage}
        </div>
      )}

      {!loading && reviews.length === 0 && (
        <p className="text-gray-500">まだ口コミがありません</p>
      )}

      {/* レスポンシブグリッド: スマホ1列、タブレット2列、PC3列 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review) => (
          <Link
            key={review.id}
            href={`/reviews/${review.id}`}
            className="border rounded-lg p-6 bg-white shadow hover:shadow-xl transition-all duration-200 cursor-pointer active:scale-[0.98] hover:-translate-y-1"
          >
            {/* ヘッダー */}
            <div className="mb-3">
              <h2 className="text-xl font-semibold line-clamp-1">
                {review.company_name}
              </h2>
              <p className="text-sm text-gray-500">業界：{review.industry}</p>
            </div>

            {/* メタ情報 */}
            <div className="text-sm text-gray-700 space-y-1 mb-3">
              <p>月額予算：¥{review.budget.toLocaleString()}</p>
              <p className="flex items-center gap-1">
                費用対効果：{review.roi_rating} / 5
                <span className="text-yellow-500 text-xs">
                  {"★".repeat(review.roi_rating)}
                  {"☆".repeat(5 - review.roi_rating)}
                </span>
              </p>
              <p>
                目的：
                {review.ad_purpose === "購買" ? "購買目的" : "周知目的"}
              </p>
              <p className="line-clamp-1">
                ターゲット：{review.target_audience}
              </p>
            </div>

            {/* 広告手法 */}
            {review.ad_methods?.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {review.ad_methods.map((method) => (
                  <span
                    key={method}
                    className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
                  >
                    {method}
                  </span>
                ))}
              </div>
            )}

            {/* 成果（プレビュー） */}
            <div className="text-sm text-gray-800 line-clamp-3 mb-3">
              {review.result_description}
            </div>

            {/* 日付 */}
            <div className="mt-auto pt-3 border-t text-xs text-gray-400">
              投稿日：
              {new Date(review.created_at).toLocaleDateString()}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
