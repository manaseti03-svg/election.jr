import { NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { question, voterProfile } = await req.json();

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: "Invalid question input" }, { status: 400 });
    }

    if (!voterProfile || typeof voterProfile.location !== 'string') {
      return NextResponse.json({ error: "Invalid voterProfile input" }, { status: 400 });
    }

    const { location, ageGroup, gender, sector } = voterProfile;

    const prompt = `You are a friendly, helpful election assistant for Indian voters. The user is a ${gender} ${sector} in the ${ageGroup} demographic from ${location}, India. Answer their question about voting in exactly 2 short, clear sentences in English. Then, CRUCIAL: Automatically translate your ENTIRE 2-sentence answer into the primary regional language of ${location} (e.g., Telugu if Andhra Pradesh or Telangana, Tamil if Tamil Nadu, Hindi if Uttar Pradesh or Delhi, Kannada if Karnataka, Malayalam if Kerala, Marathi if Maharashtra, Bengali if West Bengal, Gujarati if Gujarat, Punjabi if Punjab, Odia if Odisha, Assamese if Assam). 

If the user asks how to register, enroll, or apply for a Voter ID, set ui_action to "HIGHLIGHT_REGISTER". If they ask how to find their booth, polling station, or where to vote, set ui_action to "HIGHLIGHT_EPIC". For all other general questions, set it to null.

Return STRICTLY as a JSON object with these 4 keys: english_response (string: the 2-sentence English answer), regional_response (string: the exact same response perfectly translated into the regional language), lang_code (string: the standard BCP-47 language code for that regional language, e.g., "te-IN"), ui_action (string or null).

User's question: "${question}"`;

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
