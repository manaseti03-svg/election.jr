import { NextResponse } from 'next/server';
import { extractStructuredJson } from '@/lib/ai-utils';
import { ai } from '@/lib/gemini';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const ChatRequestSchema = z.object({
  question: z.string().min(1).max(2000, "Question too long"),
  voterProfile: z.object({
    location: z.string().min(1).max(50).optional().default("General"),
    ageGroup: z.string().min(1).max(30).optional().default("General"),
    gender: z.string().min(1).max(30).optional().default("Not Specified"),
    sector: z.string().min(1).max(50).optional().default("General Citizen"),
    voterStatus: z.string().min(1).max(20).optional().default("unregistered")
  }).optional().default({}),
  chatHistory: z.array(z.any()).default([]),
  currentTab: z.string().max(20).optional().default("General")
});

interface ChatResponse {
  english_response: string;
  regional_response: string;
  language_name: string;
  lang_code: string;
}

/**
 * POST handler for the Civic Sherpa Chat API.
 * 
 * @param {Request} req - The incoming Next.js request object.
 * @returns {Promise<NextResponse>} A JSON response containing the AI's generated bilingual content.
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    
    // Defensive Parsing with Zod
    const validation = ChatRequestSchema.safeParse(rawBody);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: validation.error.flatten() }, 
        { status: 400 }
      );
    }

    const { question: currentQuery, voterProfile, chatHistory, currentTab } = validation.data;
    const { location, ageGroup, sector, voterStatus } = voterProfile;

    const systemPrompt = `
      You are 'Election.jr Guide', a bilingual AI assistant.
      User Profile: ${sector} from ${location}, ${ageGroup}, ${voterStatus}.
      Current Section: ${currentTab}.
      
      Tasks:
      1. Provide a helpful answer in English.
      2. Provide a translation in the regional language of ${location} (e.g., Telugu for AP/Telangana, Marathi for Maharashtra).
      
      Return strictly as a JSON object:
      {
        "english_response": "...",
        "regional_response": "...",
        "language_name": "Telugu|Hindi|...",
        "lang_code": "te-IN|hi-IN|..."
      }
    `;

    const filteredHistory = chatHistory
      .filter((msg: any) => msg.content_english !== currentQuery)
      .map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content_english }]
      }));

    // Initialize chat session with system instructions
    const chat = ai.chats.create({ 
      model: 'gemini-2.0-flash',
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json'
      },
      history: filteredHistory
    });

    const chatResult = await chat.sendMessage({ message: currentQuery });
    const responseText = chatResult.text; // Getter in @google/genai

    // Defensive JSON extraction
    let finalPayload;
    if (!responseText) {
      throw new Error("No response text received from Gemini.");
    }

    try {
      const cleaned = responseText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      finalPayload = JSON.parse(cleaned);
    } catch (parseError) {
      console.warn("Gemini JSON parse failed, falling back to plain text wrapper", parseError);
      finalPayload = {
        english_response: responseText,
        regional_response: "సమాచారాన్ని ప్రాసెస్ చేయడంలో ఇబ్బంది ఉంది. దయచేసి మళ్ళీ ప్రయత్నించండి.",
        language_name: "Telugu",
        lang_code: "te-IN"
      };
    }

    return NextResponse.json(finalPayload);

  } catch (error: unknown) {
    // Senior Engineer Error Visibility
    console.error('Gemini API Failure:', error);
    return NextResponse.json({ 
      error: 'Failed to generate response',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
