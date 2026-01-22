import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.REACT_APP_GEMINI_API_KEY,
});

const model = "gemini-3-flash-preview";

export async function getGeminiReply(prompt) {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt, // theo guide: truyền thẳng string
    });

    // Kết quả text
    return response.text;

  } catch (error) {
    // In lỗi thật chi tiết để debug
    console.error("❌ Gemini API Error:");

    if (error.response) {
      // Lỗi từ server trả về
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else if (error.message) {
      // Lỗi JS / SDK
      console.error("Message:", error.message);
    } else {
      console.error("Full error:", error);
    }

    return "⚠️ Có lỗi khi gọi Gemini API. Kiểm tra console để xem chi tiết.";
  }
}
