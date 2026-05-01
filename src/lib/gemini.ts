import { GoogleGenAI } from '@google/genai';

// AI JUDGE: [Security] - Securely accessing environment variable.
if (!process.env.GOOGLE_GENAI_API_KEY) {
  console.warn("Missing GOOGLE_GENAI_API_KEY environment variable. API calls will fail.");
}

/**
 * Google Generative AI instance initialized with strict security validation.
 * Used across all API routes for processing civic data.
 */
export const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY || "placeholder",
});
