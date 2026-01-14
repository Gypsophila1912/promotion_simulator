import { NextResponse } from "next/server";
import { getCacheStats, clearCache } from "@/lib/ai/cache";
import { requireAuth } from "@/lib/auth/protected";

/**
 * GET /api/ai/cache-stats
 * キャッシュの統計情報を取得
 */
export async function GET() {
  try {
    // 認証チェック（本番環境では管理者権限も確認すべき）
    await requireAuth();

    const stats = getCacheStats();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}

/**
 * DELETE /api/ai/cache-stats
 * キャッシュをクリア
 */
export async function DELETE() {
  try {
    // 認証チェック（本番環境では管理者権限も確認すべき）
    await requireAuth();

    clearCache();
    return NextResponse.json({ success: true, message: "Cache cleared" });
  } catch (error) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}
