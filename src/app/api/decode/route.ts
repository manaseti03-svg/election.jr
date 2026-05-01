import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ai } from '@/lib/gemini';

interface DecodeResponse {
  summary: string;
  demographic_impact: string;
  jargon_explained: string;
  vote_power_quote: string;
}

export async function POST(req: Request) {
  try {
    if (!process.env.GOOGLE_GENAI_API_KEY) throw new Error('Missing Google API Key');
    const { text, voterProfile } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: "Invalid text input" }, { status: 400 });
    }
    
    const { location, ageGroup, gender, sector, voterStatus = 'unregistered' } = voterProfile || {};

    // Generate SHA-256 hash for Civic Cache
    const hash = crypto.createHash('sha256').update(text).digest('hex');

    // Check Firestore for a cache hit
    const docRef = doc(db, 'manifesto_cache', hash);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log(`[FIREBASE LOG]: Cache HIT for hash ${hash}`);
      return NextResponse.json(docSnap.data().response);
    }
    
    console.log(`[FIREBASE LOG]: Cache MISS for hash ${hash}. Querying Gemini...`);

    const prompt = `
      You are a premier political strategist and legal decoder. The user is a ${gender} ${sector} in the ${ageGroup} demographic from ${location}. Their current voter registration status is '${voterStatus}'. Decode the following political manifesto/policy text into highly accessible, gamified insights. Return strictly as a JSON object with these keys:
      {
        "summary": "A 3-point summary of the main promises",
        "demographic_impact": "How this affects the specific demographic based on the crucial context provided",
        "jargon_explained": "A brief explanation of any complex legal or political jargon used",
        "vote_power_quote": "Generate a short, inspiring 1-2 sentence quote connecting these specific policies to the power of a single vote and the user's civic duty, matching the tone of the Election Commission of India."
      }
      
      Crucial Context: The user is a ${gender} in the ${ageGroup} demographic, currently a ${sector}, from ${location}. Explain exactly how these policies directly affect their daily routine, career prospects, and finances. Hyper-focus on their occupation and age.
      
      Text to decode:
      """
      ${text}
      """
    `;

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

    // Save the new result to the Civic Cache
    try {
      await setDoc(docRef, { hash, response: jsonResponse });
      console.log(`[FIREBASE LOG]: Successfully inserted new response into cache for hash ${hash}`);
    } catch (insertError) {
      console.error("[FIREBASE LOG]: Failed to insert into cache:", insertError);
    }

    return NextResponse.json(jsonResponse);

  } catch (error: any) {
    console.error('[API PIPELINE ERROR]:', error);
    
    // Graceful fallback for Rate Limits or Server Errors
    const fallback: DecodeResponse = {
      summary: "Our AI is currently experiencing high traffic. Please try again in a moment.",
      demographic_impact: "We couldn't analyze the demographic impact at this time.",
      jargon_explained: "Please hold on while we scale our servers.",
      vote_power_quote: "Your patience is a virtue in democracy!"
    };

    return NextResponse.json(fallback, { status: 200 });
  }
}
