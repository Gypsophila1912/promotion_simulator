import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function getAiAdvice(companyName: string, budget: number, answers: string[], reviews: any[]) {
  // モデル名を確実に利用可能なものに指定
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 

  const prompt = `
    あなたは広告運用の専門家です。以下のデータを分析し、${companyName}様に最適な戦略を200文字程度で簡潔に提案してください。
    
    【状況】
    ・予算：${budget}円
    ・ターゲット：${answers[0] || "未設定"}
    ・検討媒体：${answers[1] || "未設定"}
    
    【参考データ】
    ${reviews.length > 0 
      ? reviews.map(r => `- ${r.company_name}: ${r.result_description}`).join('\n')
      : "過去の事例データは現在ありません。"}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AIアドバイスの生成中に制限またはエラーが発生しました。一般的な予算配分を参考にしてください。";
  }
}