import { NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { voterProfile } = await req.json();

    if (!voterProfile || typeof voterProfile.location !== 'string') {
      return NextResponse.json({ error: "Invalid voterProfile input" }, { status: 400 });
    }

    const { location, ageGroup, gender, sector } = voterProfile;
    
    // Create a dynamic prompt combining all available profile traits
    const prompt = `You are a neutral civic educator. The user is a ${gender} in the ${ageGroup} demographic, working as a ${sector}, located in ${location}. Generate 5 highly relevant, currently debated political policies tailored SPECIFICALLY to the socioeconomic priorities of this exact profile in this region. Return strictly as JSON.`;

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

    // Ensure the response is an array
    if (!Array.isArray(jsonResponse)) {
        throw new Error("Gemini response is not an array of objects.");
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
