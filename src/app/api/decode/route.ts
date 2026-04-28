import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';
import { ai } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { text, voterProfile } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: "Invalid text input" }, { status: 400 });
    }
    
    const { location, ageGroup, gender, sector } = voterProfile || {};

    // Generate SHA-256 hash for Civic Cache
    const hash = crypto.createHash('sha256').update(text).digest('hex');

    // Check Supabase for a cache hit
    const { data: cachedData, error: cacheError } = await supabase
      .from('election_cache')
      .select('response')
      .eq('hash', hash)
      .single();

    if (cachedData && !cacheError) {
      console.log(`[SUPABASE LOG]: Cache HIT for hash ${hash}`);
      return NextResponse.json(cachedData.response);
    }
    
    console.log(`[SUPABASE LOG]: Cache MISS for hash ${hash}. Querying Gemini...`);

    const prompt = `
      You are an expert political analyst and civic educator.
      Please decode the following political manifesto text into plain English for an everyday voter.
      Format the output strictly as a JSON object with the following structure:
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
    const { error: insertError } = await supabase
      .from('election_cache')
      .insert([{ hash, response: jsonResponse }]);

    if (insertError) {
      console.error("[SUPABASE LOG]: Failed to insert into cache:", insertError);
      // We don't throw here; we still want to return the result to the user even if cache fails.
    } else {
      console.log(`[SUPABASE LOG]: Successfully inserted new response into cache for hash ${hash}`);
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
