# 🗳️ Election.jr

**The AI-Powered Civic Engine for First-Time Voters.**

Built for the **Hack2Skill** challenge, Election.jr is a high-tier civic education platform designed specifically to combat voter apathy among youth. It slices through 50-page political manifestos, removes party bias, and debunks misinformation using a highly optimized, AI-driven architecture.

---

## 🚨 The Problem
First-time voters want to make informed decisions, but official political manifestos are written in dense legal jargon. Furthermore, youth political opinions are heavily skewed by biased social media reels and viral rumors rather than actual party policies. This leads to misinformed voting and civic disengagement.

## 🌟 The Solution (Features)

### 1. The Manifesto Decoder (Live)
Users paste heavy political jargon, and our AI engine instantly outputs a simplified JSON payload containing:
* **Summary:** The core policy in plain English.
* **Impact on Youth:** Exactly how it affects 18-to-25-year-olds.
* **Jargon Explained:** Definitions for complex legal/political terms.
* **ECI-Style Social Impact:** A dynamic, inspiring quote tying the policy to the power of a single vote, mirroring the Election Commission of India's SVEEP initiatives.

### 2. Blind Policy Match (In Progress)
A "Tinder-style" gamified swipe interface. Users are presented with anonymous policy promises and swipe right (Agree) or left (Disagree). By stripping away party labels, users discover which political ideology they *actually* align with based purely on the issues.

### 3. The WhatsApp Debunker (Upcoming)
An AI verification tool to cross-reference viral political rumors against verified facts.

---

## 🏗️ Technical Architecture & System Design

Election.jr is not just an API wrapper; it features a resilient, highly-optimized full-stack pipeline designed for 0ms latency and minimal AI compute costs.

* **Frontend Framework:** Next.js 14 (App Router) with React & TypeScript.
* **UI/UX & Physics:** Tailwind CSS & Framer Motion. Features an ultra-premium "Opal Glass" 3D aesthetic with interactive mouse-tracking, physics-based drag constraints for the swipe game, and dynamic loading states to mask API latency.
* **Backend Pipeline:** Next.js Serverless API Route (`/api/decode`) wrapped in a bulletproof try/catch block with aggressive Markdown stripping to prevent LLM hallucination crashes.
* **The AI Engine:** Google Generative AI (Gemini Flash) strictly prompted to act as a civic educator and return formatted JSON.
* **The "Civic Cache" (Database):** Supabase (PostgreSQL). Secured via Service Role bypassing client-side RLS.

### ⚡ The 0ms Latency Data Flow
To drastically reduce API costs and load times, we implemented a custom **SHA-256 Hashing Engine**:
1. User submits manifesto text.
2. The Node.js `crypto` module generates a unique SHA-256 hash of the exact string.
3. The backend queries the Supabase `election_cache` table via an indexed lookup.
4. **Cache Hit:** Returns the stored JSON payload instantly (0ms latency).
5. **Cache Miss:** Pings Gemini, sanitizes the response, stores the new hash/JSON pair in Supabase, and renders the UI.

---

## 💻 Local Development

First, set up your `.env.local` file with the required keys (ensure this file is git-ignored):
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
GOOGLE_GENAI_API_KEY=your_gemini_key
