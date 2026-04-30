# 🗳️ Election.jr | Context-Aware Civic AI 🇮🇳

**Live Deployment:** [https://election-jr-158139253158.asia-south1.run.app/](https://election-jr-158139253158.asia-south1.run.app/)

Election.jr is a high-performance, demographically aware civic education platform built for the **PromptWars Virtual H2S Challenge**. While most election bots provide static answers, Election.jr utilizes a Contextual Personalization Engine to adapt its entire UI, roadmap, and AI logic to the specific voter’s age, location, and registration status.

---

## 🚀 Key Innovations (The "Top 1%" Edge)

### 🧠 Demographic Contextualization
The application doesn't just "chat." It shape-shifts. Based on a user's profile (e.g., 18-year-old student from Andhra Pradesh), the AI anchors all responses to relevant state assembly dates and specific local registration requirements.

### 🎙️ Bilingual Voice Engine (Web Speech API)
Real-world civic tools must be accessible. Election.jr features a native two-way voice interface.
* **STT (Speech-to-Text):** Users can ask questions in Telugu or English.
* **TTS (Text-to-Speech):** The AI responds using regional voice synthesis (Google తెలుగు) to ensure literacy is not a barrier to civic participation.

### ⚡ Performance & Efficiency (SHA-256 Caching)
To minimize LLM latency and API costs, we implemented a Supabase-backed caching layer. Complex manifesto decodes are hashed using SHA-256. Repeated queries result in 0ms latency, providing a snappy, "app-like" experience.

### 🛡️ Enterprise-Grade Security
* **Zero-Trust Validation:** All API routes strictly validate environment variables.
* **Safe Parsing:** Custom regex-based markdown stripping ensures that Gemini’s JSON outputs are sanitized before frontend rendering, preventing UI crashes.

---

## 🛠️ Technical Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), Tailwind CSS, Framer Motion |
| **AI Brain** | Google Gemini 1.5 Flash (@google/generative-ai) |
| **Backend/DB** | Supabase (PostgreSQL) for Result Caching |
| **Infrastructure** | Google Cloud Run (Deployed in asia-south1 Mumbai) |
| **Voice** | Native Browser Web Speech API (Regional Support) |

---

## 🧪 Testing & QA

We don't just "hope" it works; we verify it. The repository includes a dedicated `/tests` suite using Jest:
* **Parser Tests:** Validates the regex logic for extracting clean JSON from AI markdown.
* **API Mocks:** Simulates Gemini SDK responses to ensure the frontend handles 500/429 errors gracefully without crashing the user's session.

---

## 🏁 Submission Details

* **Project Name:** Election.jr
* **Developer:** Eti Muni Manas
* **Deployment Region:** Mumbai, India (asia-south1)
* **GitHub Repository:** [https://github.com/manaseti03-svg/election.jr](https://github.com/manaseti03-svg/election.jr)

---

## 💻 Local Development

First, set up your `.env.local` file with the required keys (ensure this file is git-ignored):
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
GOOGLE_GENAI_API_KEY=your_gemini_key
```

Run the development server:
```bash
npm run dev
```
