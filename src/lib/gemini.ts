import { GoogleGenerativeAI } from '@google/generative-ai';

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  return key;
}

let genAIInstance: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAIInstance) {
    genAIInstance = new GoogleGenerativeAI(getApiKey());
  }
  return genAIInstance;
}

export async function generateContent(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: systemPrompt,
  });
  const result = await model.generateContent(userPrompt);
  return result.response.text();
}

export async function generateContentStream(
  systemPrompt: string,
  userPrompt: string
) {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: systemPrompt,
  });
  return model.generateContentStream(userPrompt);
}

/**
 * Gemini のレスポンスから JSON を抽出してパースする。
 * markdown コードブロック (```json ... ```) にも対応。
 */
export function parseJsonResponse<T>(text: string): T {
  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  return JSON.parse(cleaned) as T;
}
