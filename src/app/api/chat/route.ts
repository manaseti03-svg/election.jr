import { NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';

interface ChatResponse {
  english_response: string;
  regional_response: string;
  lang_code: string;
}

export async function POST(req: Request) {
  try {
    if (!process.env.GOOGLE_GENAI_API_KEY) throw new Error('Missing Google API Key');
    const { question, voterProfile, chatHistory = [], currentTab } = await req.json();

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: "Invalid question input" }, { status: 400 });
    }

    if (!voterProfile || typeof voterProfile.location !== 'string') {
      return NextResponse.json({ error: "Invalid voterProfile input" }, { status: 400 });
    }

    const { location, ageGroup, gender, sector, voterStatus = 'unregistered' } = voterProfile;

    const today = new Date().toDateString();
    const currentYear = new Date().getFullYear();

    const historyText = chatHistory.map((msg: any) => `${msg.role}: ${msg.content_english}`).join('\n');

    const prompt = `You are Election.jr, a Troubleshooting Expert and Civic Guide. The user (${gender}, ${ageGroup}, ${sector}, ${location}) is currently looking at the '${currentTab}' section of the app. Their current voter registration status is '${voterStatus}'.

If Guide (Action Plan): Help with edge-case registration issues (mismatched IDs, NRI voting). Do not repeat basic steps.
If Match (Ideology): Explain what different ideologies (Progressive, Centrist, etc.) mean in India.
If Decoder (Policies): Clarify complex economic/political terms.
If Fact Check (Debunker): Answer questions about misinformation.

Automatically translate your ENTIRE English answer into the primary regional language of ${location}.

CRITICAL TEMPORAL CONTEXT: Today's date is ${today}. The current year is ${currentYear}. You MUST NOT refer to 2024 or 2025 as future events. The 2024 Lok Sabha and Andhra Pradesh Assembly elections have already concluded. If asked about the "next" elections, inform the user that the next major general/assembly elections are expected in 2029, though local body elections may occur sooner. Anchor all your advice in the present reality of ${currentYear}.

Return STRICTLY as a JSON object with these 3 keys:
1. english_response (string)
2. regional_response (string)
3. lang_code (string: BCP-47 code)

Chat History:
${historyText}

User's response/question: "${question}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    let resultText = response.text;
    if (!resultText) {
      throw new Error("No response text received from Gemini.");
    }

    resultText = resultText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(resultText);
    } catch (parseErr) {
      console.error("[JSON PARSE ERROR]: Raw text from Gemini:", resultText);
      throw new Error("Failed to parse Gemini response as JSON.");
    }

    return NextResponse.json(jsonResponse);

  } catch (error: any) {
    console.error('[API PIPELINE ERROR]:', error);
    
    const fallback: ChatResponse = {
      english_response: "I'm currently experiencing high traffic. Please try again in a moment.",
      regional_response: "సాంకేతిక లోపం. దయచేసి మళ్ళీ ప్రయత్నించండి.", // Generic fallback
      lang_code: "te-IN"
    };

    return NextResponse.json(fallback, { status: 200 });
  }
}
