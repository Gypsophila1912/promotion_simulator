# AI投資配分提案機能

Gemini APIを使用した投資配分の提案機能です。

## 機能概要

シミュレーション作成時に自動的に2パターンの投資配分を提案します：

1. **パターン1**: ユーザーが入力した投資カテゴリーに基づいた配分
2. **パターン2**: AIが完全に自由に提案（カテゴリーも含む）

## ファイル構成

- `gemini.ts` - Gemini API クライアント
- `investment-advisor.ts` - 投資配分アドバイザーロジック

## 環境変数設定

### 必須

```env
GEMINI_API_KEY=your_api_key_here
```

### オプション（リトライ設定）

```env
# 最大リトライ回数（デフォルト: 3）
GEMINI_MAX_RETRIES=3

# リトライ間隔の基本値（ミリ秒、デフォルト: 1000）
# 指数バックオフで増加: 1000ms → 2000ms → 4000ms
GEMINI_RETRY_DELAY_MS=1000
```

## リトライロジック

### 自動リトライが発生する条件

1. **レート制限エラー (HTTP 429)**
   - Free tier: 10 RPM, 250 RPD
   - 指数バックオフで自動リトライ

2. **サーバーエラー (HTTP 5xx)**
   - Gemini APIの一時的な障害
   - 自動リトライで回復を試みる

3. **ネットワークエラー**
   - タイムアウトや接続エラー
   - 一時的な問題に対応

### リトライシーケンス例

デフォルト設定（3回リトライ、1000ms基本遅延）の場合：

```
試行1: 失敗 → 1000ms 待機
試行2: 失敗 → 2000ms 待機
試行3: 失敗 → 4000ms 待機
試行4: エラーをスロー
```

## 環境別の推奨設定

### 開発環境

```env
GEMINI_MAX_RETRIES=3
GEMINI_RETRY_DELAY_MS=1000
```

### 本番環境

```env
GEMINI_MAX_RETRIES=5
GEMINI_RETRY_DELAY_MS=2000
```

### テスト環境

```env
GEMINI_MAX_RETRIES=1
GEMINI_RETRY_DELAY_MS=100
```

## コスト管理

### 現在の使用状況

- **モデル**: gemini-2.5-flash
- **入力トークン**: ~500 tokens/リクエスト × 2回 = 1,000 tokens
- **出力トークン**: ~300 tokens/リクエスト × 2回 = 600 tokens

### コスト試算（2026年1月時点）

- 入力: $0.075 per 1M tokens
- 出力: $0.30 per 1M tokens

**1シミュレーションあたり**:
- 入力コスト: 1,000 / 1,000,000 × $0.075 = $0.000075
- 出力コスト: 600 / 1,000,000 × $0.30 = $0.00018
- **合計**: 約 $0.000255 (約0.04円 @ 150円/ドル)

**月間1,000シミュレーション**: 約40円

### レート制限（Free tier）

- **RPM (Requests Per Minute)**: 10
- **RPD (Requests Per Day)**: 250

**本番環境では有料プラン（Tier 1以上）推奨**:
- Tier 1: 1,000 RPM / 10,000 RPD

## トラブルシューティング

### エラー: "Rate limit exceeded (429)"

**原因**: リクエストが多すぎる

**対処**:
1. `GEMINI_MAX_RETRIES` を増やす
2. `GEMINI_RETRY_DELAY_MS` を長くする
3. 有料プランにアップグレード

### エラー: "Failed after all retry attempts"

**原因**: すべてのリトライが失敗

**対処**:
1. APIキーを確認
2. ネットワーク接続を確認
3. Gemini API のステータスページを確認

## キャッシング機構

### 概要

同じ業界・予算範囲の分析結果をキャッシュして再利用することで、コストを大幅に削減します。

### 仕組み

1. **キャッシュキーの生成**: `業界名:予算範囲`
2. **予算範囲のグルーピング**:
   - 0-100k
   - 100k-500k
   - 500k-1m
   - 1m-5m
   - 5m-10m
   - 10m+

3. **キャッシュヒット時**: Gemini APIを呼び出さず、即座に結果を返す
4. **キャッシュミス時**: API呼び出し後、結果をキャッシュに保存

### 環境変数設定

```env
# キャッシュの有効/無効（デフォルト: true）
AI_CACHE_ENABLED=true

# キャッシュの有効期限（時間、デフォルト: 24）
AI_CACHE_TTL_HOURS=24

# 最大キャッシュサイズ（デフォルト: 100）
AI_CACHE_MAX_SIZE=100
```

### キャッシュ戦略

#### LRU (Least Recently Used) 削除

キャッシュが最大サイズに達した場合、最も長く使用されていないエントリを削除します。

#### 自動クリーンアップ

1時間ごとに期限切れのエントリを自動削除します。

### キャッシュ統計API

#### 統計情報の取得

```bash
GET /api/ai/cache-stats
```

レスポンス例:
```json
{
  "enabled": true,
  "size": 15,
  "maxSize": 100,
  "ttlHours": 24,
  "entries": [
    {
      "key": "sns広告-youtube広告:500k-1m",
      "ageMinutes": 120,
      "accessCount": 5
    }
  ]
}
```

#### キャッシュのクリア

```bash
DELETE /api/ai/cache-stats
```

### コスト削減効果

#### キャッシュなしの場合

- 1シミュレーション: $0.000255
- 1,000シミュレーション/月: $0.255 (約38円)

#### キャッシュあり（50%ヒット率の場合）

- キャッシュヒット: 500回 × $0 = $0
- キャッシュミス: 500回 × $0.000255 = $0.1275
- **合計**: $0.1275 (約19円) → **50%削減**

#### 実際のヒット率予測

同じ業界・予算範囲での問い合わせが多い場合、ヒット率は70-80%に達する可能性があります。

### 使用例

#### コード内での使用

```typescript
// キャッシュは自動的に使用される
const aiAnalysis = await generateInvestmentAllocation({
  companyName: "テストカフェ",
  industry: "SNS広告、YouTube広告",
  budget: 1000000,
  details: "効果的な配分を知りたい"
});

// ログ出力例:
// [Cache] MISS for sns広告-youtube広告:500k-1m
// Generating new AI analysis
// [Cache] SET for sns広告-youtube広告:500k-1m (total: 1/100)

// 同じ業界・予算範囲での2回目の呼び出し
// [Cache] HIT for sns広告-youtube広告:500k-1m (age: 5分, hits: 1)
// Using cached AI analysis
```

#### キャッシュの無効化

特定のシミュレーションでキャッシュを使用したくない場合:

```env
AI_CACHE_ENABLED=false
```

### モニタリング

サーバーログでキャッシュの動作を確認できます:

```
[Cache] MISS for sns広告:500k-1m
[Cache] SET for sns広告:500k-1m (total: 1/100)
[Cache] HIT for sns広告:500k-1m (age: 10分, hits: 3)
[Cache] EVICTED リスティング:100k-500k (LRU)
[Cache] CLEANUP: 5 expired entries removed
```

## 将来の拡張

### 優先度3: Redis統合（スケーラビリティ）

メモリベースのキャッシュをRedisに移行:
- 複数サーバー間でキャッシュを共有
- 永続化オプション
- より高度なキャッシュ戦略

### 優先度4: バックグラウンド処理

ジョブキュー（BullMQ等）でバックグラウンド実行
