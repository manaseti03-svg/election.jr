# 🗳️ Election.jr

**The AI-Powered Civic Engine for First-Time Voters.**

Built for the **Hack2Skill** challenge, Election.jr is a high-tier, demographic-aware civic education platform designed to combat voter apathy. It uses a custom **Constituency Engine** to capture a 4-part user profile (Location, Age Group, Gender, Sector), slicing through 50-page political manifestos and dynamically tailoring AI-generated policies strictly to the user's socioeconomic priorities.

---

## 🚨 The Problem
First-time voters want to make informed decisions, but official political manifestos are written in dense legal jargon. Furthermore, youth political opinions are heavily skewed by biased social media reels and viral rumors rather than actual party policies. This leads to misinformed voting and civic disengagement.

## 🌟 The Solution (Features)

### 1. The Manifesto Decoder (Live)
Users paste heavy political jargon, and our AI engine instantly outputs a simplified JSON payload containing:
* **Summary:** The core policy in plain English.
* **Demographic Impact:** Exactly how it affects their daily routine, finances, and career, hyper-focused on their age, gender, and sector.
* **Jargon Explained:** Definitions for complex legal/political terms.
* **ECI-Style Social Impact:** A dynamic, inspiring quote tying the policy to the power of a single vote, mirroring the Election Commission of India's SVEEP initiatives.

### 2. Blind Policy Match (Live)
A "Tinder-style" gamified swipe interface. Instead of static content, the engine dynamically pings Gemini with the user's exact profile to generate hyper-local, currently debated policies in their specific Indian state. Users swipe right (Agree) or left (Disagree). By stripping away party labels, users discover which political ideology they *actually* align with based purely on their socioeconomic priorities.

### 3. The WhatsApp Debunker (Live)
An AI verification tool built to cross-reference viral political rumors against verified facts. By piping the user's exact 4-part Voter Profile (Location, Age, Gender, Sector) into the prompt, the AI generates a `truth_score` and dynamic verdict colors, while explicitly detailing the **Targeting Motive**—explaining *why* this specific demographic was targeted by the misinformation.

---

## 🏗️ Technical Architecture & System Design

Election.jr is not just an API wrapper; it features a resilient, highly-optimized full-stack pipeline designed for 0ms latency and minimal AI compute costs.

* **Frontend Framework:** Next.js 14 (App Router) with React & TypeScript.
* **UI/UX & Physics:** Tailwind CSS & Framer Motion. Features an ultra-premium "Opal Glass" 3D aesthetic, interactive mouse-tracking, and a sleek 4-step dynamic onboarding modal (State, Age, Gender, Sector).
* **Backend Pipeline:** Next.js Serverless API Routes (`/api/decode`, `/api/match`, & `/api/debunker`) wrapped in bulletproof try/catch blocks with aggressive Markdown stripping and JSON fallback arrays to prevent LLM hallucination crashes.
* **The AI Engine:** Google Generative AI (Gemini Flash) strictly prompted to act as a localized civic educator. Prompts are aggressively tuned to inject the user's exact demographic context.
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
