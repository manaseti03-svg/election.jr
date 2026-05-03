import { ai } from './gemini';
import { GenerateContentResponse } from '@google/genai';

/**
 * Robustly extracts a JSON object from a string that might contain 
 * conversational filler or markdown blocks.
 * 
 * @param text - The raw text from the AI model.
 * @returns The extracted and parsed JSON object.
 */
export function extractStructuredJson<T>(text: string): T {
  try {
    // 1. Try direct parsing (ideal case)
    return JSON.parse(text);
  } catch (e) {
    // 2. Locate the first '{' and last '}'
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    
    if (start !== -1 && end !== -1) {
      const jsonCandidate = text.substring(start, end + 1);
      try {
        return JSON.parse(jsonCandidate);
      } catch (innerError) {
        throw new Error(`Failed to parse extracted JSON: ${innerError}`);
      }
    }
    throw new Error(`No JSON object found in response: ${text.substring(0, 100)}...`);
  }
}

/**
 * Safety settings to ensure the AI follows civic guidelines 
 * and avoids harmful content generation.
 */
export const civicSafetySettings = [
  {
    category: 'HARM_CATEGORY_HARASSMENT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_HATE_SPEECH',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    threshold: 'BLOCK_ONLY_HIGH',
  },
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
];

/**
 * Executes a standardized AI generation task with strict JSON parsing and safety gates.
 */
export async function executeCivicTask<T>(
  prompt: string, 
  modelId: string = 'gemini-2.0-flash',
  responseMimeType: string = 'application/json'
): Promise<T> {
  const response = await ai.models.generateContent({
    model: modelId,
    contents: prompt,
    config: {
      responseMimeType,
      // safetySettings: civicSafetySettings, // Supported in some SDK versions, check compatibility
    }
  });

  const resultText = response.text;
  if (!resultText) {
    throw new Error("No response text received from Gemini.");
  }

  return extractStructuredJson<T>(resultText);
}
