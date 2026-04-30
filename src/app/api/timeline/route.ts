import { NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { voterProfile } = await req.json();

    if (!voterProfile || typeof voterProfile.location !== 'string') {
      return NextResponse.json({ error: "Invalid voterProfile input" }, { status: 400 });
    }

    const { location, ageGroup } = voterProfile;
    const today = new Date().toDateString();

    const prompt = `You are an expert on Indian election procedures and the Election Commission of India (ECI). The user is in the ${ageGroup} age group living in ${location}, India. CRUCIAL: Today's date is ${today}. You MUST NOT generate any dates in the past (e.g., 2024, 2025). All timeline events must be for the upcoming 2026 or 2027 electoral roll revisions, form submission deadlines, and upcoming elections specific to ${location}. Generate exactly 4 upcoming election-related deadlines and voter registration steps that are specifically relevant to this user. Focus on: voter registration deadlines, Form 6 submission windows, electoral roll revision dates, and any upcoming state/local elections. Rule 1: Be specific to the Indian state mentioned. Rule 2: All dates MUST be in the future from ${today}. Rule 3: Keep each step title under 8 words and description under 25 words. Return strictly as a pure JSON array of objects with keys: id (number 1-4), title (string), description (string), date (string like "Jun 2026"), status (string: "upcoming" or "action_needed").`;

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

    const cleanedText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(cleanedText);
      if (!Array.isArray(jsonResponse)) throw new Error("Not an array");
    } catch (parseErr) {
      console.error("[JSON PARSE ERROR]: Raw text from Gemini:", resultText);
      const FALLBACK_TIMELINE = [
        { id: 1, title: "Check Electoral Roll Status", description: "Verify your name on the latest voter list at nvsp.in.", date: "Ongoing", status: "action_needed" },
        { id: 2, title: "Submit Form 6 Online", description: "Apply for new Voter ID via the NVSP portal if not registered.", date: "Open Now", status: "action_needed" },
        { id: 3, title: "Electoral Roll Revision", description: "Annual revision of voter rolls with updated addresses.", date: "Jan 2026", status: "upcoming" },
        { id: 4, title: "Booth Level Officer Visit", description: "BLO verifies your registration door-to-door before elections.", date: "Pre-Election", status: "upcoming" }
      ];
      return NextResponse.json(FALLBACK_TIMELINE);
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
