export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { executeCivicTask } from '@/lib/ai-utils';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const TimelineRequestSchema = z.object({
  voterProfile: z.object({
    location: z.string().min(1).max(50).optional().default("General"),
    ageGroup: z.string().min(1).max(30).optional().default("General"),
    gender: z.string().min(1).max(30).optional().default("Not Specified"),
    sector: z.string().min(1).max(50).optional().default("General Citizen"),
    voterStatus: z.string().min(1).max(20).optional().default("unregistered")
  }).optional().default({})
});

interface TimelineNode {
  id: number;
  title: string;
  description: string;
  date: string;
  status: string;
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const validation = TimelineRequestSchema.safeParse(rawBody);
    
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid request payload", details: validation.error.flatten() }, { status: 400 });
    }

    const { voterProfile } = validation.data;
    const { location, ageGroup, voterStatus } = voterProfile;
    const today = new Date().toISOString().split('T')[0];

    const prompt = `
      You are an expert on Indian election procedures and the Election Commission of India (ECI).
      The user is in the ${ageGroup} group living in ${location}. Status: '${voterStatus}'.
      Today's date: ${today}.
      
      Generate exactly 4 future deadlines or steps for voter registration specific to ${location} and their status.
      Rule 1: Be specific to the Indian state.
      Rule 2: All dates MUST be in the future (2026/2027).
      Rule 3: Return strictly as a JSON array of objects with: { id, title, description, date, status }.
    `;

    const jsonResponse = await executeCivicTask<TimelineNode[]>(prompt);

    return NextResponse.json(jsonResponse);

  } catch (error: unknown) {
    console.error('[TIMELINE API ERROR]:', error);
    const FALLBACK_TIMELINE: TimelineNode[] = [
      { id: 1, title: "Check Electoral Roll Status", description: "Verify your name on the latest voter list at nvsp.in.", date: "Ongoing", status: "action_needed" },
      { id: 2, title: "Submit Form 6 Online", description: "Apply for new Voter ID via the NVSP portal if not registered.", date: "Open Now", status: "action_needed" },
      { id: 3, title: "Electoral Roll Revision", description: "Annual revision of voter rolls with updated addresses.", date: "Jan 2026", status: "upcoming" },
      { id: 4, title: "Booth Level Officer Visit", description: "BLO verifies your registration door-to-door before elections.", date: "Pre-Election", status: "upcoming" }
    ];
    return NextResponse.json(FALLBACK_TIMELINE, { status: 200 });
  }
}
