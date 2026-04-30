import { NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { question, voterProfile, chatHistory = [], currentTab } = await req.json();

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: "Invalid question input" }, { status: 400 });
    }

    if (!voterProfile || typeof voterProfile.location !== 'string') {
      return NextResponse.json({ error: "Invalid voterProfile input" }, { status: 400 });
    }

    const { location, ageGroup, gender, sector } = voterProfile;

    const historyText = chatHistory.map((msg: any) => `${msg.role}: ${msg.content_english}`).join('\n');

    const prompt = `You are Election.jr, a Troubleshooting Expert and Civic Guide. The user (${gender}, ${ageGroup}, ${sector}, ${location}) is currently looking at the '${currentTab}' section of the app.

If Guide (Action Plan): Help with edge-case registration issues (mismatched IDs, NRI voting). Do not repeat basic steps.
If Match (Ideology): Explain what different ideologies (Progressive, Centrist, etc.) mean in India.
If Decoder (Policies): Clarify complex economic/political terms.
If Fact Check (Debunker): Answer questions about misinformation.

Automatically translate your ENTIRE English answer into the primary regional language of ${location}.

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
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
