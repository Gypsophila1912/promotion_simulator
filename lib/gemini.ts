// lib/gemini.ts (または getAiAdvice を定義しているファイル)

export async function getAiAdvice(companyName: string, budget: number, answers: string[], reviews: any[]) {
  try {
    // APIキーの確認
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) throw new Error("APIキーが設定されていません");

    // モデル名を "gemini-1.5-flash-latest" に変更して試す
    // もしくは、Google公式SDK（@google/generative-ai）を使用している場合は、
    // モデル名から "models/" を抜いた文字列を指定してみてください。
    const modelName = "gemini-1.5-flash"; 

    // フェッチURLの確認 (v1beta ではなく v1 を推奨)
    const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `あなたはプロの広告運用コンサルタントです。以下の情報を元に、${companyName}様へ300文字程度で具体的なアドバイスをしてください...（以下略）`
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API Error Detail:", errorData);
      
      // もし 404 エラーが出る場合は、モデル名を "gemini-pro" に落としてテストしてみてください
      throw new Error(errorData.error?.message || "AI診断に失敗しました");
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;

  } catch (error) {
    console.error("Fetch Error:", error);
    throw error;
  }
}