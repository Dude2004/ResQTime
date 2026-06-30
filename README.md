# 🌿 ResQTime — Mindful Productivity Sanctuary & Rescue Engine

> **A soothing, psychological productivity sanctuary designed to help students and professionals conquer deadline-paralysis, parse chaotic thoughts, simulate schedule alternatives, and stay calm under pressure.**

ResQTime is a fully functional full-stack application built with **React**, **Vite**, **Tailwind CSS**, and **Express**, featuring advanced generative AI capabilities powered by the **Google Gemini-3.5-Flash** model.

---

## 🎨 Design Philosophy & User Experience

ResQTime is built to reject the standard high-stress, noisy dashboard formats of typical productivity platforms. Instead of red alerts and guilt-inducing alarms, it functions as a **mindful sanctuary**:

*   **Aesthetic Theme-Aware Styling**: Built with a complete dark-mode/light-mode color framework.
    *   **Dark Mode**: A sleek, deep midnight-slate canvas with ambient, high-contrast cyan, emerald, and glowing amber focus accents.
    *   **Light Mode**: A clean, spacious, high-visibility layout featuring bold block contrasts, deep sapphire branding, and solid amber borders.
*   **Visual Calming Elements**: Integrates slow, organic fade-ins, scaling modal animations (via `motion/react`), and custom SVG illustrations.
*   **Bypassing Start-Paralysis**: The entire user interface is designed to reduce decision fatigue by isolating focus tasks and offering step-by-step pathways.

---

## 🚀 Key Core Features

### 1. 🧠 Chaos Brain Dump (Messy Input Parser)
Instead of forcing users to fill out complex forms when they are overwhelmed, they can write stream-of-consciousness, unorganized, or messy thoughts. The **Gemini-3.5-Flash** engine on the backend parses the input to:
*   Extract distinct goals and assignment objects.
*   Infer precise deadlines based on current time context (e.g., converting "tomorrow by 5pm" to `YYYY-MM-DD HH:MM:SS`).
*   Estimate duration parameters in minutes.
*   Assign psychological priority scores (Critical vs. Medium vs. Low).
*   Synthesize initial actionable micro-steps.

### 2. 🚨 Tactical Crisis Survival Timeline (Panic Mode)
When a user clicks **Panic Mode**, they enter the *Tactical Crisis Commander*. The engine:
*   Ruthlessly triages the current agenda, postponing non-essential items (such as chores or long-term reading).
*   Generates an aggressive, tight, minute-by-minute focus timeline for the next 4–6 hours.
*   Injects tactical mental breathers.
*   Adopts an encouraging, high-energy, "drill-sergeant-who-believes-in-you" supportive coach persona to spark focus.

### 3. 🧭 Reality-Check Simulator (Alternatives Explorer)
Allows users to explore consequences before skipping or deferring an item:
*   Empathetically assesses immediate and downstream scheduling effects.
*   Calculates "freed mental hours."
*   Generates a witty, peer-to-peer conversational reality check.
*   Formulates a custom **Harm Reduction Compromise** (e.g., instead of writing a full 5-page essay or skipping it entirely, execute a 15-minute micro-sprint drafting the outline).

### 4. 👁️ Multimodal Accountability Inspector (Visual proof audit)
To prevent cheating, users upload visual proof of completion (e.g., a photo of a handwritten math problem, a screenshot of an IDE, or a submitted web form).
*   The backend leverages **Gemini's Multimodal capabilities** to cross-examine the image against the task description.
*   If approved, it scores the quality, awards custom gamified XP points, and provides witty feedback.

### 5. 🔔 Behavioral Nudge Engine
Generates context-aware, highly personalized push notification simulations based on remaining time and progress:
*   *Supportive Tier*: Gentle reminders with supportive and encouraging undertones.
*   *Firm Warning*: Direct, humorous notifications urging users to close distracting apps.
*   *Panic Attack*: Quick, urgent, high-energy instructions to code or write a quick-and-dirty draft to bypass overthinking.

### 6. 🌬️ Soothing Zen Breathing Space
Interactive respiratory coach with visual expansion trackers, deep tension-release prompts, counting helpers, and tranquil ambient chimes to calm physical panic symptoms.

---

## 🛠️ Technology Stack & Architecture

```
                 +--------------------------------------------+
                 |              CLIENT (React)                |
                 |  - Theme-Aware (Light/Dark) UI             |
                 |  - Interactive Respiratory Breathing Hub   |
                 |  - Motion/React Calming Micro-animations   |
                 +----------------------+---------------------+
                                        | HTTP Requests (Header: x-user-id)
                                        v
                 +--------------------------------------------+
                 |            BACKEND (Express.js)            |
                 |  - Bundled standalone Node.js server       |
                 |  - Gemini API Proxy & Fallback Handlers    |
                 |  - Sandbox Debug Logging Logs              |
                 +-------+-----------------------------+------+
                         |                             |
                         v                             v
           +---------------------------+   +---------------------------+
           |       GOOGLE GEMINI       |   |    FIREBASE FIRESTORE     |
           |  - Gemini-3.5-Flash       |   |  - Persistent DB Storage  |
           |  - Multimodal Vision      |   |  - Decoupled User Schemas |
           |  - Structural JSON Output |   +---------------------------+
           +---------------------------+
```

### Frontend Architecture
*   **Framework**: React 19 + TypeScript + Vite
*   **Styles**: Tailwind CSS (loaded natively via `@import "tailwindcss"`)
*   **Animations**: Motion (`motion/react`)
*   **Iconography**: Lucide-React
*   **Routing & Components**:
    *   `src/App.tsx`: Central Dashboard and State Controller.
    *   `src/components/Auth.tsx`: OTP Auth Form and Hackathon Judge Quick Entry.
    *   `src/components/EmergencyServices.tsx`: Curated mental support guides.
    *   `src/components/EntryAnimation.tsx`: Transition landing sequence.
    *   `src/components/Logo.tsx`: Elegant vector branding asset.

### Backend & Database Integration
*   **Web Framework**: Express.js with JSON payloads up to 20MB (to comfortably accept base64 visual verification uploads).
*   **AI Integration**: `@google/genai` TypeScript SDK referencing the server secret `GEMINI_API_KEY`.
*   **Resilience & Fault Tolerance**: Fully redundant local algorithmic models exist for **all** core Gemini routes, ensuring the app runs perfectly even if the API key is unconfigured.
*   **Data Persistence**: Bundled with a Google Firebase Firestore client initializing an isolated tenant workspace (`ai-studio-resqtime-5052ff34-861d-4034-b544-09fd24acdde0`). User metrics and tasks automatically fall back to isolated flat JSON storage files on disk (`data_tasks_<userid>.json` and `data_stats_<userid>.json`) in development environments.

---

## 🚪 Authentication & Hackathon Evaluator Portal

To ensure frictionless audits by judges, ResQTime provides a dual-authentication gateway:
1.  **Passwordless One-Time Passcode (OTP)**: Users register or sign in with their email address. The system instantly generates a 6-digit code. In development, this is printed to the interactive **System Debug Sandbox Portal** on the login screen to allow passwordless verification without opening an external inbox.
2.  **Instant Evaluator Trial**: A single-click guest login bypasses registration, seeds rich pre-loaded academic and professional assignments, configures initial game statistics, and grants full access.

---

## 📡 API Routing & Integration Documentation

The server exposes a series of REST endpoints and a master orchestrator route:

### Core Tasks & Stats
*   `GET /api/tasks` — Retrieves tasks list for current authenticated session.
    *   *Headers*: `x-user-id` (User session UUID)
*   `POST /api/tasks` — Appends a new customized task.
*   `PUT /api/tasks/:id` — Updates completed state, roadmap items, or alternative choices.
*   `DELETE /api/tasks/:id` — Removes task permanently.
*   `GET /api/stats` — Fetches current user stats (Total XP, Streak, Completed counters).

### Passwordless Auth
*   `POST /api/auth/send-otp` — Registers email, generates random 6-digit passcode.
    *   *Payload*: `{ "email": "judge@resqtime.io", "mode": "signup", "displayName": "Judge" }`
*   `POST /api/auth/verify-otp` — Validates passcode. Returns synchronized user profiles.
*   `POST /api/auth/guest-login` — Activates evaluator bypass session.

### Gemini Services
*   `POST /api/chaos-parse` — Deconstructs raw user text transcripts.
*   `POST /api/micro-steps` — Breaks down target goal names into action items.
*   `POST /api/reality-check` — Evaluates skipped consequences.
*   `POST /api/tactical-crisis` — Generates emergency survival calendar timelines.
*   `POST /api/verify-action` — Inspector that parses visual uploads against task requirements.

---

## ⚙️ Development & Local Installation

### Prerequisites
*   Node.js (v18 or higher)
*   npm (v10 or higher)

### Installation
1.  Clone or download the project files.
2.  Install required dependencies:
    ```bash
    npm install
    ```
3.  Set up environment credentials in the root directory:
    ```bash
    cp .env.example .env
    ```
    Configure your Google Gemini API key:
    ```env
    GEMINI_API_KEY=your_actual_api_key_here
    ```

### Running the Application

*   **Development Mode**: Boots the server using `tsx` (TypeScript Executor) and launches the Vite client with HMR on port 3000:
    ```bash
    npm run dev
    ```
*   **Production Build**: Compiles client-side React assets into the `/dist` directory, and bundles the server code into a unified, high-performance CommonJS file (`/dist/server.cjs`) using `esbuild`:
    ```bash
    npm run build
    ```
*   **Production Launch**: Runs the compiled server:
    ```bash
    npm run start
    ```

---

## 🛡️ Master Event Routing Protocol (Orchestrator)

For high-level event coordination, the application provides a single-entry **Orchestration Engine Router** on `/api/orchestrate` that accepts standard frontend events:

#### Request Structure
```json
{
  "current_theme": "dark",
  "action": "TRIGGER_CRISIS",
  "payload": {
    "current_time": "2026-06-30 09:49:27",
    "all_tasks": [
      { "task_name": "Final Exam Prep", "priority": "Critical" }
    ]
  }
}
```

#### Supported Route Dispatchers
1.  `PROCESS_LOGIN`: Maps auth providers, creates user profiles, and logs customized judge onboarding greetings.
2.  `VERIFY_VOICE_PASS`: Verifies spoken phrases (e.g. matching "ResQ my time").
3.  `PARSE_CHAOS`: Ingests stream-of-consciousness text, returning prioritized action logs.
4.  `RUN_SIMULATION`: Simulates schedule alternative compromises.
5.  `TRIGGER_CRISIS`: Triggers Panic Mode schedule timeline generators.
6.  `VERIFY_ACTION`: Inspects completion proof images.

---

*Mindfully crafted to keep students cool, organized, and focused under stress.* 🌿
