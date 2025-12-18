"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type Review = {
  id: string;
  company_name: string;
  industry: string;
  roi_rating: number;
  created_at: string;
};

export default function MyReviewsPage() {
  const supabase = createClient();

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
        .select("id, company_name, industry, roi_rating, created_at")
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
              <h2 className="font-semibold">{review.company_name}</h2>
              <p className="text-sm text-gray-500">
                {review.industry} / ROI {review.roi_rating}
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
