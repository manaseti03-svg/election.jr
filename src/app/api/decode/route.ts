export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ai } from '@/lib/gemini';
import { z } from 'zod';

/**
 * Interface representing the structure of the Decode response.
 */
interface DecodeResponse {
  summary: string;
  demographic_impact: string;
  jargon_explained: string;
  vote_power_quote: string;
}

/**
 * Zod Schema for Decode Request Validation
 * Strictly typed with length constraints to prevent prompt injection or abuse.
 */
const DecodeRequestSchema = z.object({
  text: z.string().min(1, "Input text is required").max(10000, "Manifesto text too long"),
  voterProfile: z.object({
    location: z.string().min(1).max(50).optional().default("General"),
    ageGroup: z.string().min(1).max(30).optional().default("General"),
    gender: z.string().min(1).max(30).optional().default("Not Specified"),
    sector: z.string().min(1).max(50).optional().default("General Citizen"),
    voterStatus: z.string().min(1).max(20).optional().default("unregistered")
  }).optional().default({})
});

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const validation = DecodeRequestSchema.safeParse(rawBody);
    
    if (!validation.success) {
      return NextResponse.json({ 
        error: "Invalid request payload", 
        details: validation.error.flatten() 
      }, { status: 400 });
    }

    const { text, voterProfile } = validation.data;
    const { location, ageGroup, gender, sector, voterStatus } = voterProfile;

    // 1. Check Civic Cache (Firestore)
    const hash = crypto.createHash('sha256').update(text).digest('hex');
    const docRef = doc(db, 'manifesto_cache', hash);

    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return NextResponse.json(docSnap.data().response);
      }
    } catch (firebaseError) {
      console.warn(`[FIREBASE FAIL-SAFE]:`, firebaseError);
    }

    // 2. Prepare Context-Aware Prompt
    const prompt = `
      You are a premier political strategist and legal decoder. The user is a ${gender} ${sector} in the ${ageGroup} demographic from ${location}. Their current voter registration status is '${voterStatus}'. 
      Decode the following political manifesto/policy text into highly accessible, gamified insights. Return strictly as a JSON object.
      
      Structure:
      {
        "summary": "A 3-point summary of the main promises",
        "demographic_impact": "How this affects the specific demographic based on the crucial context provided",
        "jargon_explained": "A brief explanation of any complex legal or political jargon used",
        "vote_power_quote": "Generate a short, inspiring 1-2 sentence quote connecting these specific policies to the power of a single vote."
      }
      
      Text to decode:
      """
      ${text}
      """
    `;

    // 3. Execute Unified Civic Task
    const jsonResponse = await executeCivicTask<DecodeResponse>(prompt);

    // 4. Update Civic Cache
    try {
      await setDoc(docRef, { hash, response: jsonResponse });
    } catch (insertError) {
      console.error("[FIREBASE LOG]: Cache update failed:", insertError);
    }

    return NextResponse.json(jsonResponse);

  } catch (error: unknown) {
    console.error('[DECODE API ERROR]:', error);

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
