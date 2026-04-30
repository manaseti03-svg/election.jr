import { NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';

interface PolicyMatch {
  id: number;
  text: string;
  alignment: string;
}

export async function POST(req: Request) {
  try {
    if (!process.env.GOOGLE_GENAI_API_KEY) throw new Error('Missing Google API Key');
    const { voterProfile } = await req.json();

    if (!voterProfile || typeof voterProfile.location !== 'string') {
      return NextResponse.json({ error: "Invalid voterProfile input" }, { status: 400 });
    }

    const { location, ageGroup, gender, sector, voterStatus = 'unregistered' } = voterProfile;
    
    const prompt = `You are an expert in Indian State-Level politics. The user is a ${gender} ${sector} in the ${ageGroup} age bracket living in ${location}, India. Their current voter registration status is '${voterStatus}'. Rule 1: DO NOT use American concepts (e.g., Federal, Congress, student debt). Rule 2: Focus on Indian state realities (e.g., State Public Service Commission exams, IT hubs, fee reimbursement, local infrastructure). Rule 3: Strip away party names. Return strictly as a pure JSON array of objects with keys: id, text, alignment.`;

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
    const cleanedText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(cleanedText);
      if (!Array.isArray(jsonResponse)) throw new Error("Not an array");
    } catch (parseErr) {
      console.error("[JSON PARSE ERROR]: Raw text from Gemini:", resultText);
      const FALLBACK_POLICIES = [
        { id: 1, text: "Increase state funding for local public universities and IT hubs.", alignment: "Progressive" },
        { id: 2, text: "Implement stricter guidelines for State Public Service Commission exams to prevent leaks.", alignment: "Centrist" },
        { id: 3, text: "Provide fee reimbursement for economically weaker students in professional courses.", alignment: "Progressive" },
        { id: 4, text: "Prioritize local infrastructure development and road expansion in semi-urban areas.", alignment: "Conservative" },
        { id: 5, text: "Introduce subsidies for young entrepreneurs starting businesses in rural sectors.", alignment: "Centrist" }
      ];
      return NextResponse.json(FALLBACK_POLICIES);
    }

    return NextResponse.json(jsonResponse);

  } catch (error: any) {
    console.error('[API PIPELINE ERROR]:', error);
    const FALLBACK_POLICIES: PolicyMatch[] = [
      { id: 1, text: "Increase state funding for local public universities and IT hubs.", alignment: "Progressive" },
      { id: 2, text: "Implement stricter guidelines for State Public Service Commission exams to prevent leaks.", alignment: "Centrist" },
      { id: 3, text: "Provide fee reimbursement for economically weaker students in professional courses.", alignment: "Progressive" },
      { id: 4, text: "Prioritize local infrastructure development and road expansion in semi-urban areas.", alignment: "Conservative" },
      { id: 5, text: "Introduce subsidies for young entrepreneurs starting businesses in rural sectors.", alignment: "Centrist" }
    ];
    return NextResponse.json(FALLBACK_POLICIES, { status: 200 });
  }
}
