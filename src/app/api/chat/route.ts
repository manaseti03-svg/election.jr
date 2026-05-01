export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { messages, voterProfile } = await req.json();
    const { location, ageGroup, gender, sector, voterStatus = 'unregistered' } = voterProfile || {};

    const today = new Date().toDateString();
    const currentYear = new Date().getFullYear();

    const systemPrompt = `
      You are the Election.jr Civic Sherpa. You are a helpful, expert guide on Indian elections and civic duties.
      CRITICAL TEMPORAL CONTEXT: Today's date is ${today}. The current year is ${currentYear}. You MUST NOT refer to 2024 or 2025 as future events. The 2024 Lok Sabha and Andhra Pradesh Assembly elections have already concluded. If asked about the "next" elections, inform the user that the next major general/assembly elections are expected in 2029, though local body elections may occur sooner. Anchor all your advice in the present reality of ${currentYear}.
      
      User Profile: ${gender}, ${ageGroup}, ${sector} from ${location}. Status: ${voterStatus}.
      Always provide accurate, non-partisan information based on Election Commission of India (ECI) standards. 
      Encourage voting and civic participation. Keep responses concise and inspiring.
    `;

    const chatMessages = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }))
    ];

    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const chat = model.startChat({ history: chatMessages });
    const result = await chat.sendMessage(messages[messages.length - 1].content);

    return NextResponse.json({ content: result.response.text() });
  } catch (error: unknown) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}
