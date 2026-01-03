/**
 * Gemini API クライアント
 * Google の Gemini API と通信するための低レベルクライアント
 *
 * 機能:
 * - 自動リトライ機構（レート制限、サーバーエラー対応）
 * - 指数バックオフによる待機時間調整
 * - 環境変数による柔軟な設定
 *
 * 環境変数:
 * - GEMINI_API_KEY: APIキー（必須）
 * - GEMINI_MAX_RETRIES: 最大リトライ回数（デフォルト: 3）
 * - GEMINI_RETRY_DELAY_MS: リトライ間隔の基本値（デフォルト: 1000ms）
 */

const GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

// APIタイムアウト（デフォルト: 30秒）
const API_TIMEOUT_MS = parseInt(process.env.GEMINI_API_TIMEOUT_MS || "30000", 10);

export interface GeminiRequest {
  contents: {
    parts: {
      text: string;
    }[];
  }[];
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
  };
}

export interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
    finishReason: string;
  }[];
}

/**
 * Gemini APIを呼び出してテキストを生成
 *
 * @param prompt - 送信するプロンプト
 * @param config - 生成設定（オプション）
 * @param maxRetries - 最大リトライ回数（オプション、デフォルトは環境変数またはまたは3）
 * @returns 生成されたテキスト
 * @throws APIキーが設定されていない場合、またはすべてのリトライが失敗した場合
 *
 * @example
 * ```typescript
 * const response = await callGeminiAPI("こんにちは");
 * console.log(response);
 * ```
 *
 * @example カスタムリトライ回数
 * ```typescript
 * const response = await callGeminiAPI("こんにちは", undefined, 5);
 * ```
 */
export async function callGeminiAPI(
  prompt: string,
  config?: GeminiRequest["generationConfig"],
  maxRetries?: number
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  // 環境変数から設定を読み込む（未指定の場合はデフォルト値）
  const retries = maxRetries ?? parseInt(process.env.GEMINI_MAX_RETRIES || "3", 10);
  const baseDelayMs = parseInt(process.env.GEMINI_RETRY_DELAY_MS || "1000", 10);

  const requestBody: GeminiRequest = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: config || {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
    },
  };

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // タイムアウト制御付きfetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

      const response = await fetch(GEMINI_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey, // 推奨: ヘッダーでAPIキーを送信
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // レート制限エラーの場合は指数バックオフでリトライ
      if (response.status === 429) {
        const waitTime = Math.pow(2, attempt) * baseDelayMs; // baseDelayMs, 2x, 4x...
        console.warn(
          `Rate limit exceeded (429). Waiting ${waitTime}ms before retry ${attempt + 1}/${retries}`
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      // サーバーエラーの場合もリトライ
      if (response.status >= 500 && response.status < 600) {
        const waitTime = Math.pow(2, attempt) * baseDelayMs;
        console.warn(
          `Server error (${response.status}). Waiting ${waitTime}ms before retry ${attempt + 1}/${retries}`
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Gemini API error: ${response.status} - ${errorText}`
        );
      }

      const data: GeminiResponse = await response.json();

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error("No response from Gemini API");
      }

      const textContent = data.candidates[0].content.parts[0].text;
      console.log(`API call succeeded on attempt ${attempt + 1}`);
      return textContent;
    } catch (error) {
      // タイムアウトエラーの場合
      if (error instanceof Error && error.name === "AbortError") {
        console.warn(`Request timeout after ${API_TIMEOUT_MS}ms on attempt ${attempt + 1}`);
      }

      // 最後の試行の場合はエラーをスロー
      if (attempt === retries - 1) {
        console.error(`Gemini API call failed after ${retries} attempts:`, error);
        throw error;
      }

      // ネットワークエラーなど一時的なエラーの場合はリトライ
      console.warn(`Attempt ${attempt + 1} failed, retrying...`, error);
      const waitTime = Math.pow(2, attempt) * baseDelayMs;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw new Error(`Failed after all ${retries} retry attempts`);
}
