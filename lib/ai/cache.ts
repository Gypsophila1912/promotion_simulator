/**
 * AI分析結果のキャッシング機構
 *
 * 同じ業界・予算範囲の分析結果を再利用してコスト削減
 *
 * 環境変数:
 * - AI_CACHE_ENABLED: キャッシュの有効/無効（デフォルト: true）
 * - AI_CACHE_TTL_HOURS: キャッシュの有効期限（時間、デフォルト: 24）
 * - AI_CACHE_MAX_SIZE: 最大キャッシュサイズ（デフォルト: 100）
 */

import type { AIAnalysisResult } from "@/lib/types/database";

interface CacheEntry {
  result: AIAnalysisResult;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

// メモリベースのキャッシュ（本番ではRedisなどに移行可能）
const cache = new Map<string, CacheEntry>();

// 環境変数から設定を読み込む
const CACHE_ENABLED = process.env.AI_CACHE_ENABLED !== "false"; // デフォルトは有効
const CACHE_TTL_MS = parseInt(process.env.AI_CACHE_TTL_HOURS || "24", 10) * 60 * 60 * 1000;
const MAX_CACHE_SIZE = parseInt(process.env.AI_CACHE_MAX_SIZE || "100", 10);

/**
 * 予算を範囲でグルーピング
 *
 * @param budget - 予算額
 * @returns 予算範囲の文字列
 */
function getBudgetRange(budget: number): string {
  if (budget < 100000) return "0-100k";
  if (budget < 500000) return "100k-500k";
  if (budget < 1000000) return "500k-1m";
  if (budget < 5000000) return "1m-5m";
  if (budget < 10000000) return "5m-10m";
  return "10m+";
}

/**
 * キャッシュキーを生成
 *
 * @param industry - 投資カテゴリー
 * @param budgetRange - 予算範囲
 * @returns キャッシュキー
 */
function getCacheKey(industry: string, budgetRange: string): string {
  // 業界名を正規化（大文字小文字、空白を統一）
  const normalizedIndustry = industry.trim().toLowerCase().replace(/\s+/g, "-");
  return `${normalizedIndustry}:${budgetRange}`;
}

/**
 * キャッシュから分析結果を取得
 *
 * @param industry - 投資カテゴリー
 * @param budget - 予算額
 * @returns キャッシュされた分析結果、または null
 */
export function getCachedAnalysis(
  industry: string,
  budget: number
): AIAnalysisResult | null {
  if (!CACHE_ENABLED) {
    return null;
  }

  const key = getCacheKey(industry, getBudgetRange(budget));
  const cached = cache.get(key);

  if (!cached) {
    console.log(`[Cache] MISS for ${key}`);
    return null;
  }

  // TTLチェック
  const age = Date.now() - cached.timestamp;
  if (age > CACHE_TTL_MS) {
    console.log(`[Cache] EXPIRED for ${key} (age: ${Math.round(age / 1000 / 60)}分)`);
    cache.delete(key);
    return null;
  }

  // アクセス情報を更新
  cached.accessCount++;
  cached.lastAccessed = Date.now();

  console.log(
    `[Cache] HIT for ${key} (age: ${Math.round(age / 1000 / 60)}分, hits: ${cached.accessCount})`
  );

  return cached.result;
}

/**
 * 分析結果をキャッシュに保存
 *
 * @param industry - 投資カテゴリー
 * @param budget - 予算額
 * @param result - 分析結果
 */
export function setCachedAnalysis(
  industry: string,
  budget: number,
  result: AIAnalysisResult
): void {
  if (!CACHE_ENABLED) {
    return;
  }

  const key = getCacheKey(industry, getBudgetRange(budget));

  // キャッシュサイズ制限チェック
  if (cache.size >= MAX_CACHE_SIZE && !cache.has(key)) {
    evictLRU();
  }

  cache.set(key, {
    result,
    timestamp: Date.now(),
    accessCount: 0,
    lastAccessed: Date.now(),
  });

  console.log(
    `[Cache] SET for ${key} (total: ${cache.size}/${MAX_CACHE_SIZE})`
  );
}

/**
 * LRU（Least Recently Used）戦略でキャッシュエントリを削除
 */
function evictLRU(): void {
  let oldestKey: string | null = null;
  let oldestTime = Date.now();

  for (const [key, entry] of cache.entries()) {
    if (entry.lastAccessed < oldestTime) {
      oldestTime = entry.lastAccessed;
      oldestKey = key;
    }
  }

  if (oldestKey) {
    cache.delete(oldestKey);
    console.log(`[Cache] EVICTED ${oldestKey} (LRU)`);
  }
}

/**
 * キャッシュをクリア
 */
export function clearCache(): void {
  const size = cache.size;
  cache.clear();
  console.log(`[Cache] CLEARED (${size} entries removed)`);
}

/**
 * キャッシュ統計を取得
 *
 * @returns キャッシュの統計情報
 */
export function getCacheStats(): {
  enabled: boolean;
  size: number;
  maxSize: number;
  ttlHours: number;
  entries: Array<{
    key: string;
    ageMinutes: number;
    accessCount: number;
  }>;
} {
  const entries = Array.from(cache.entries()).map(([key, entry]) => ({
    key,
    ageMinutes: Math.round((Date.now() - entry.timestamp) / 1000 / 60),
    accessCount: entry.accessCount,
  }));

  return {
    enabled: CACHE_ENABLED,
    size: cache.size,
    maxSize: MAX_CACHE_SIZE,
    ttlHours: CACHE_TTL_MS / 1000 / 60 / 60,
    entries,
  };
}

/**
 * 期限切れのエントリをクリーンアップ
 */
export function cleanupExpiredEntries(): void {
  let cleaned = 0;
  const now = Date.now();

  for (const [key, entry] of cache.entries()) {
    if (now - entry.timestamp > CACHE_TTL_MS) {
      cache.delete(key);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`[Cache] CLEANUP: ${cleaned} expired entries removed`);
  }
}

// 定期的なクリーンアップ（1時間ごと）
if (CACHE_ENABLED) {
  setInterval(cleanupExpiredEntries, 60 * 60 * 1000);
}
