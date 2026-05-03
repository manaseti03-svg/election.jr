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
To minimize LLM latency and API costs, we implemented a Firebase Firestore caching layer. Complex manifesto decodes are hashed using SHA-256. Repeated queries result in 0ms latency, providing a snappy, "app-like" experience.

### 🛡️ Enterprise-Grade Security
* **Zero-Trust Validation:** All API routes strictly validate environment variables.
* **Safe Parsing:** Custom regex-based markdown stripping ensures that Gemini’s JSON outputs are sanitized before frontend rendering, preventing UI crashes.

---

## 🛠️ Technical Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), Tailwind CSS, Framer Motion |
| **AI Brain** | Google Gemini 1.5 Flash (@google/generative-ai) |
| **Backend/DB** | Firebase Firestore (NoSQL) for Result Caching |
| **Infrastructure** | Google Cloud Run (Deployed in asia-south1 Mumbai) |
| **Voice** | Native Browser Web Speech API (Regional Support) |

---

We don't just "hope" it works; we verify it. The repository includes a dedicated `/tests` suite using **Vitest**:
* **Parser Tests:** Validates the regex logic for extracting clean JSON from AI markdown.
* **API Mocks:** Simulates Gemini SDK responses to ensure the frontend handles 500/429 errors gracefully without crashing the user's session.

---

## ⚖️ Ethical AI & Alignment

Election.jr is built on the pillars of **Responsible AI**. We recognize that civic data is sensitive, and our architecture reflects a deep commitment to **Inclusive Design**. 

* **Misinformation Mitigation:** Our WhatsApp Debunker doesn't just label news; it explains the logical fallacies and demographic targeting motives behind viral rumors, empowering users to think critically.
* **Responsible Data Handling:** We utilize a Zero-Trust validation model for all API requests and prioritize local browser-based regional voice synthesis to ensure user privacy.
* **Scalable Civic Tech:** By utilizing a serverless architecture on Google Cloud Run and highly efficient SHA-256 caching, we've created a framework that is ready to serve millions of voters with minimal overhead.

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
GOOGLE_GENAI_API_KEY=your_gemini_key
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_id
```

Run the development server:
```bash
npm run dev
```
