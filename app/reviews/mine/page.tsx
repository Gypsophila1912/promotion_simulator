"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Review = {
  id: string;
  company_name: string;
  industry: string;
  ad_purpose: string;
  target_audience: string;
  roi_rating: number;
  created_at: string;
};

export default function MyReviewsPage() {
  const supabase = createClient();
  const router = useRouter();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyReviews = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("reviews")
        .select(
          "id, company_name, industry, ad_purpose, target_audience, roi_rating, created_at"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setReviews(data || []);
      setLoading(false);
    };

    fetchMyReviews();
  }, [supabase]);

  if (loading) return <p className="p-6">読み込み中...</p>;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
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

      <h1 className="text-3xl font-bold mb-6">自分の口コミ</h1>

      {reviews.length === 0 && (
        <p className="text-gray-500">まだ投稿がありません</p>
      )}

      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="border rounded-lg p-4 bg-white shadow flex justify-between items-center"
          >
            <div>
              <h2 className="font-semibold text-lg">{review.company_name}</h2>
              <p className="text-sm text-gray-500">
                {review.industry} / ROI {review.roi_rating} /{" "}
                {review.ad_purpose === "購買" ? "購買目的" : "周知目的"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                ターゲット：{review.target_audience}
              </p>
            </div>

            <Link
              href={`/reviews/${review.id}/edit`}
              className="text-blue-600 hover:underline text-sm"
            >
              編集
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
