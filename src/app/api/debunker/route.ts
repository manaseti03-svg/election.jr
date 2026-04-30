import { NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';

interface DebunkerResponse {
  truth_score: number;
  verdict: string;
  fact_check: string;
  targeting_motive: string;
}

export async function POST(req: Request) {
  try {
    if (!process.env.GOOGLE_GENAI_API_KEY) throw new Error('Missing Google API Key');
    const { text, voterProfile } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: "Invalid text input" }, { status: 400 });
    }

    if (!voterProfile || typeof voterProfile.location !== 'string') {
      return NextResponse.json({ error: "Invalid voterProfile input" }, { status: 400 });
    }

    const { location, ageGroup, gender, sector } = voterProfile;

    const prompt = `You are a premier political fact-checker. The user has received a suspicious political WhatsApp forward. The user is a ${gender} ${sector} in the ${ageGroup} demographic from ${location}. Analyze the text. Return strictly as a JSON object with these keys:
      truth_score (number 0-100)
      verdict (string: "True", "False", or "Misleading")
      fact_check (string: 2-3 sentences explaining the actual truth)
      targeting_motive (string: Explain exactly why this specific demographic was targeted by this rumor).
      
      Text to analyze:
      """
      ${text}
      """`;

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

    // Strip markdown formatting if the LLM wrapped the JSON
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
    
    const fallback: DebunkerResponse = {
      truth_score: 50,
      verdict: "Unknown",
      fact_check: "The AI Fact-Checker is experiencing high traffic. Please verify this information through official sources or reputable news outlets.",
      targeting_motive: "Our servers are currently scaling to handle the load."
    };
    
    return NextResponse.json(fallback, { status: 200 });
  }
}
