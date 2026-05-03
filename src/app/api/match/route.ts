export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { executeCivicTask } from '@/lib/ai-utils';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

/**
 * Zod Schema for Policy Match Request Validation
 */
const MatchRequestSchema = z.object({
  voterProfile: z.object({
    location: z.string().min(1).max(50).optional().default("General"),
    ageGroup: z.string().min(1).max(30).optional().default("General"),
    gender: z.string().min(1).max(30).optional().default("Not Specified"),
    sector: z.string().min(1).max(50).optional().default("General Citizen"),
    voterStatus: z.string().min(1).max(20).optional().default("unregistered")
  }).optional().default({})
});

/**
 * Interface representing the structure of a policy match item.
 */
interface Policy {
  id: number;
  text: string;
  alignment: string;
}

/**
 * POST handler for the Blind Policy Match API.
 * 
 * @param {Request} req - The incoming Next.js request object.
 * @returns {Promise<NextResponse>} A JSON array of policy objects or a safe fallback.
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    
    // Defensive Validation
    const validation = MatchRequestSchema.safeParse(rawBody);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid request payload", details: validation.error.flatten() }, { status: 400 });
    }

    const { voterProfile } = validation.data;
    const { location, ageGroup, gender, sector, voterStatus } = voterProfile;
    
    const prompt = `
      You are an expert in Indian State-Level politics. 
      Generate exactly 5 policy promises tailored for a user who is a ${gender} ${sector} in the ${ageGroup} group from ${location}.
      Their status is '${voterStatus}'.
      
      Rule 1: Focus on Indian state realities (e.g., SPSC exams, IT hubs, fee reimbursement, local infrastructure).
      Rule 2: Strip away party names.
      Rule 3: Return strictly as a JSON array of objects with: { id, text, alignment }.
      
      Return as: [ { "id": 1, "text": "...", "alignment": "Progressive|Conservative|Centrist" } ]
    `;

    const jsonResponse = await executeCivicTask<Policy[]>(prompt);

    return NextResponse.json(jsonResponse);

  } catch (error: unknown) {
    console.error('[MATCH API ERROR]:', error);
    const FALLBACK_POLICIES: Policy[] = [
      { id: 1, text: "Increase state funding for local public universities and IT hubs.", alignment: "Progressive" },
      { id: 2, text: "Implement stricter guidelines for State Public Service Commission exams to prevent leaks.", alignment: "Centrist" },
      { id: 3, text: "Provide fee reimbursement for economically weaker students in professional courses.", alignment: "Progressive" },
      { id: 4, text: "Prioritize local infrastructure development and road expansion in semi-urban areas.", alignment: "Conservative" },
      { id: 5, text: "Introduce subsidies for young entrepreneurs starting businesses in rural sectors.", alignment: "Centrist" }
    ];
    return NextResponse.json(FALLBACK_POLICIES, { status: 200 });
  }
}
