export async function getAiAdvice(companyName: string, budget: number, answers: string[]) {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY?.trim();
  if (!apiKey) return "APIキーが設定されていません。";

  // 【修正ポイント1】APIバージョンを v1beta から v1 に変更（より安定しています）
  // 【修正ポイント2】モデル名を最新の安定版指定である gemini-1.5-flash-latest に変更
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ 
            text: `${companyName}様に、予算${budget}円での広告戦略を提案してください。アンケート結果は以下の通りです：${answers.join(", ")}` 
          }] 
        }]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Gemini API Error Detail:", data);
      // 詳細なエラーメッセージをスローするように修正
      throw new Error(data.error?.message || `HTTP ${response.status}: APIリクエストに失敗しました`);
    }

    // レスポンスの存在確認を追加（安全のため）
    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error("APIからの応答が空でした。");
    }

  } catch (error: any) {
    console.error("Fetch Error:", error);
    return `AI診断失敗: ${error.message}`;
  }
}