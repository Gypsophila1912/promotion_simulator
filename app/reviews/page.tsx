"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

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
  simulation_link?: string; // ← ここ変更
};

export default function ReviewsPage() {
  const supabase = createClient();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [displayReviews, setDisplayReviews] = useState<Review[]>([]);
  const [myPostCount, setMyPostCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const { data, error } = await supabase
          .from("reviews")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error(error);
          setErrorMessage("口コミの取得に失敗しました");
          setLoading(false);
          return;
        }

        const allReviews = data || [];
        setReviews(allReviews);

        if (user) {
          const myReviews = allReviews.filter(
            (review) => review.user_id === user.id
          );

          setMyPostCount(myReviews.length);

          if (myReviews.length >= 3) {
            setDisplayReviews(allReviews);
          } else {
            setDisplayReviews(allReviews.slice(0, 3));
          }
        } else {
          setDisplayReviews(allReviews.slice(0, 3));
        }
      } catch (err) {
        console.error(err);
        setErrorMessage("予期しないエラーが発生しました");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [supabase]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 py-10 px-2">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-slate-800 mb-8 tracking-tight drop-shadow-sm">
          口コミ一覧
        </h1>
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Link
            href="/reviews/new"
            className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            ＋ 新規投稿
          </Link>
          <Link
            href="/reviews/mine"
            className="bg-white text-blue-700 font-bold px-8 py-3 rounded-full border-2 border-blue-200 hover:bg-blue-50 shadow-sm transition-all duration-200"
          >
            自分の投稿
          </Link>
        </div>
        {loading && <p className="text-center text-gray-400">読み込み中...</p>}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
            {errorMessage}
          </div>
        )}
        {!loading && displayReviews.length === 0 && (
          <p className="text-center text-gray-500">まだ口コミがありません</p>
        )}
        {/* カード一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayReviews.map((review) => (
            <div
              key={review.id}
              className="rounded-2xl bg-white/90 p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-200 cursor-pointer active:scale-[0.98] hover:-translate-y-1"
            >
              {/* ヘッダー（詳細ページリンク） */}
              <Link href={`/reviews/${review.id}`} className="block mb-3">
                <h2 className="text-xl font-bold text-blue-700 line-clamp-1 hover:underline">
                  {review.company_name}
                </h2>
                <p className="text-sm text-gray-500">業界：{review.industry}</p>
              </Link>
              {/* 実施シミュレーションリンク */}
              {review.simulation_link && (
                <a
                  href={review.simulation_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-sm text-blue-600 underline hover:text-blue-800 mb-2 inline-block"
                >
                  実施シミュレーションリンク
                </a>
              )}
              {/* メタ情報 */}
              <div className="text-sm text-gray-700 space-y-1 mb-3">
                <p>月額予算：<span className="font-semibold text-slate-800">¥{review.budget.toLocaleString()}</span></p>
                <p className="flex items-center gap-1">
                  費用対効果：{review.roi_rating} / 5
                  <span className="text-yellow-500 text-xs">
                    {"★".repeat(review.roi_rating)}
                    {"☆".repeat(5 - review.roi_rating)}
                  </span>
                </p>
                <p>
                  目的：
                  {review.ad_purpose === "購入" ? "購入目的" : "周知目的"}
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
            </div>
          ))}
        </div>
        {/* 3件未満のときの誘導メッセージ */}
        {!loading && myPostCount < 3 && (
          <div className="mt-10 p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
            <p className="text-lg font-semibold mb-2">
              もっと見たいなら、口コミを投稿してね！
            </p>
            <p className="text-sm text-gray-600 mb-4">
              あなたの投稿が増えると、すべての口コミが見られるようになります 👀
            </p>
            <Link
              href="/reviews/new"
              className="inline-block px-6 py-3 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
            >
              口コミを投稿する
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
