export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { executeCivicTask } from '@/lib/ai-utils';
import { z } from 'zod';

/**
 * Zod Schema for Debunker Request Validation
 */
const DebunkerRequestSchema = z.object({
  text: z.string().min(1).max(5000, "Rumor text too long"),
  voterProfile: z.object({
    location: z.string().min(1).max(50).optional().default("General"),
    ageGroup: z.string().min(1).max(30).optional().default("General"),
    gender: z.string().min(1).max(30).optional().default("Not Specified"),
    sector: z.string().min(1).max(50).optional().default("General Citizen"),
    voterStatus: z.string().min(1).max(20).optional().default("unregistered")
  }).optional().default({})
});

/**
 * Interface representing the structure of the Debunker response.
 */
interface DebunkerResponse {
  truth_score: number;
  verdict: string;
  fact_check: string;
  targeting_motive: string;
}

/**
 * POST handler for the WhatsApp Debunker API.
 * 
 * @param {Request} req - The incoming Next.js request object.
 * @returns {Promise<NextResponse>} A JSON response containing the fact-check analysis or a safe fallback.
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const validation = DebunkerRequestSchema.safeParse(rawBody);
    
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid request payload", details: validation.error.flatten() }, { status: 400 });
    }

    const { text, voterProfile } = validation.data;
    const { location, ageGroup, sector } = voterProfile;

    const prompt = `
      You are an expert fact-checker specializing in Indian political misinformation. 
      Analyze the following WhatsApp forward/rumor for a user who is a ${sector} from ${location} in the ${ageGroup} group.
      
      Return strictly as a JSON object with:
      {
        "truth_score": (number 0-100),
        "verdict": "True | False | Misleading",
        "fact_check": "A clear, evidence-based explanation",
        "targeting_motive": "Explain why this rumor specifically targets a ${sector} from ${location} in terms of cognitive bias or local political tension"
      }
      
      Rumor:
      """
      ${text}
      """
    `;

    const jsonResponse = await executeCivicTask<DebunkerResponse>(prompt);

    return NextResponse.json(jsonResponse);

  } catch (error: unknown) {
    console.error('[DEBUNKER API ERROR]:', error);
    
    const fallback: DebunkerResponse = {
      truth_score: 50,
      verdict: "Unknown",
      fact_check: "The AI Fact-Checker is experiencing high traffic. Please verify this information through official sources or reputable news outlets.",
      targeting_motive: "Our servers are currently scaling to handle the load."
    };
    
    return NextResponse.json(fallback, { status: 200 });
  }
}
