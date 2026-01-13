"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";

type Review = {
  id: string;
  user_id: string;
  company_name: string;
  industry: string;
  budget: number;
  ad_methods: string[];
  ad_purpose: string;
  target_audience: string;
  result_description: string;
  roi_rating: number;
  created_at: string;
  service_url?: string;
  simulation_link?: string; // ← 追加
};

export default function ReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const reviewId = params.id as string;

  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviewAndUser = async () => {
      // 現在のユーザーを取得
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      // レビューを取得
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("id", reviewId)
        .single();

      if (error) {
        console.error(error);
        setErrorMessage("口コミの取得に失敗しました");
      } else {
        setReview(data);
      }

      setLoading(false);
    };

    fetchReviewAndUser();
  }, [supabase, reviewId]);

  const handleDelete = async () => {
    if (!confirm("本当にこの口コミを削除しますか？")) {
      return;
    }

    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId);

    if (error) {
      console.error(error);
      alert("削除に失敗しました");
    } else {
      alert("削除しました");
      router.push("/reviews");
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <p>読み込み中...</p>
      </main>
    );
  }

  if (errorMessage || !review) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          {errorMessage || "口コミが見つかりませんでした"}
        </div>
        <Link href="/reviews" className="text-blue-600 hover:underline">
          ← 口コミ一覧に戻る
        </Link>
      </main>
    );
  }

  const isOwner = currentUserId === review.user_id;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <Link href="/reviews" className="text-blue-600 hover:underline">
          ← 口コミ一覧に戻る
        </Link>
      </div>

      <div className="bg-white border rounded-lg p-8 shadow-lg">
        {/* ヘッダー */}
        <div className="mb-6 border-b pb-4">
          <h1 className="text-3xl font-bold mb-2">{review.company_name}</h1>
          <p className="text-gray-600">業界：{review.industry}</p>

          {/* サービスURL */}
          {review.service_url && (
            <p className="mt-2">
              <span className="font-semibold mr-2">公式サイト：</span>
              <a
                href={review.service_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800 break-all"
              >
                {review.service_url}
              </a>
            </p>
          )}

          {/* 実施シミュレーションリンク 追加 */}
          {review.simulation_link && (
            <p className="mt-1">
              <span className="font-semibold mr-2">
                実施シミュレーションリンク：
              </span>
              <a
                href={review.simulation_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800 break-all"
              >
                {review.simulation_link}
              </a>
            </p>
          )}

          <p className="text-sm text-gray-400 mt-2">
            投稿日：{new Date(review.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* メタ情報 */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center">
            <span className="font-semibold w-32">月額予算：</span>
            <span className="text-lg">¥{review.budget.toLocaleString()}</span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold w-32">費用対効果：</span>
            <span className="text-lg">
              {review.roi_rating} / 5
              <span className="ml-2 text-yellow-500">
                {"★".repeat(review.roi_rating)}
                {"☆".repeat(5 - review.roi_rating)}
              </span>
            </span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold w-32">広告目的：</span>
            <span className="text-lg">
              {review.ad_purpose === "購買" ? "購買目的" : "周知目的"}
            </span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold w-32">ターゲット層：</span>
            <span className="text-lg">{review.target_audience}</span>
          </div>
        </div>

        {/* 広告手法 */}
        {review.ad_methods?.length > 0 && (
          <div className="mb-6">
            <h2 className="font-semibold mb-3">利用した広告手法</h2>
            <div className="flex flex-wrap gap-2">
              {review.ad_methods.map((method) => (
                <span
                  key={method}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 成果詳細 */}
        <div className="mb-6">
          <h2 className="font-semibold mb-3">成果・結果</h2>
          <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
            {review.result_description}
          </p>
        </div>

        {/* アクションボタン（自分の投稿の場合） */}
        {isOwner && (
          <div className="flex gap-4 pt-6 border-t">
            <Link
              href={`/reviews/${review.id}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              編集
            </Link>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              削除
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
