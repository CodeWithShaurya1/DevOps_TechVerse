# TECHVERSE ’26 — Unified DevOps Tri-Athlon Portal

> **High-octane competitive SRE & DevOps tournament platform.** Orchestrates three production-grade engineering simulations under a single unified Supabase database, cinematic multiverse state transitions, strict 4-tier tie-breaking rules, and a responsive Cyberpunk HUD.

---

## ⚡ Executive Overview

**TechVerse ’26 DevOps Tri-Athlon** unites three independently engineered DevOps challenge simulations into one continuous, high-performance tournament experience:

1. **Round 1: Server Sniper — Chaos Edition** (Kubernetes Pod Triage & CrashLoopBackOff Remediation)
2. **Round 2: DevOps Arena — Pipeline Recall** (CI/CD Deployment Track Memorization & Dependency Reconstruction)
3. **Round 3: SwipeOps — The Production Rescue Mission** (High-tempo incident response decision deck with 45s mission cap)

Built for fast-paced hackathons and competitive engineering arenas, the portal guarantees tournament integrity through single-entry identity registration, non-tamperable Supabase Row Level Security (RLS), isolated attempt tracking, practice replay authorization, and live leaderboard rankings.

---

## 🏆 Official Tournament Progression

```
[1. Cinematic Intro] ➔ [2. Operator Registration] ➔ [3. Optional Mission Rules]
         │
         ▼
[4. Round 1 Intro (3-2-1 Countdown)] ➔ [5. Server Sniper (60s K8s Shift)]
         │
         ▼
[6. Round 2 Intro (3-2-1 Countdown)] ➔ [7. Pipeline Recall (60s CI/CD Sprint)]
         │
         ▼
[8. Round 3 Intro (3-2-1 Countdown)] ➔ [9. SwipeOps (45s Total / 3×15s Incidents)]
         │
         ▼
[10. Final Results Debrief] ➔ [11. Unified Tournament Leaderboard]
```

### Complete 11-Step Event Sequence
1. **Cinematic Intro:** Audio-booted cyberpunk gateway showcasing the 3 challenge stages in a horizontal desktop grid with matrix DevOps digital rain.
2. **Operator Registration:** Single-entry portal collecting **Full Name** first and **Enrollment Number** second, with real-time uppercase normalization.
3. **Optional Tournament Rules:** Transparent briefing modal disclosing the 4-tier ranking formula, round mechanics, and timing disclosures without forcing unnecessary page routing.
4. **Cinematic Round 1 Transition:** Multiverse-style countdown (`3`, `2`, `1`, `ENTER ARENA`).
5. **Round 1 (Server Sniper):** 60-second shift over a 6×6 (36 pods) Kubernetes cluster. Mitigate High CPU, CrashLoopBackOff, Deadlocks, and Ghost Pods using Autoscalers, Load Balancers, or Emergency CLI Terminals with combo multipliers.
6. **Cinematic Round 2 Transition:** Multiverse transition into CI/CD cyberspace.
7. **Round 2 (Pipeline Recall):** 60-second sprint across 3 phases: Memorization Scan (18s), Drag-and-Drop Reconstruction with decoy filtering, and Automated CI/CD Runner verification with live bash terminal output.
8. **Cinematic Round 3 Transition:** Multiverse transition into Production Control.
9. **Round 3 (SwipeOps):** 45-second total mission across three 15-second incident rounds. Tinder-style card deck decision engine (`← Mitigate/Reject` vs `Deploy/Apply →`), vitals monitoring, streak multiplier, and keyboard shortcuts (`←`/`→`, `A`/`D`, `1`/`2`).
10. **Final Results Debrief:** Comprehensive scorecard displaying individual round scores, raw total, average score, isolated active runtimes, best streaks, combined streak metric, and official rank badge.
11. **Unified Leaderboard:** Real-time database view with live refresh, student search, masked privacy (hiding enrollment numbers), and tie-breaker auditing.

---

## 🎯 4-Tier Official Tie-Breaker Algorithm

The portal strictly enforces the official four-tier tournament ranking specification via PostgreSQL database view logic:

| Priority | Metric | Evaluation Method | Rationale |
| :---: | :--- | :--- | :--- |
| **1** | **Average Score** | `(R1_Score + R2_Score + R3_Score) / 3.0` | Primary measure of overall engineering competency across all 3 domains. |
| **2** | **Total Completion Time** | `R1_Duration + R2_Duration + R3_Duration` | Faster cumulative active gameplay breaks equal average scores. Clocks run *strictly* during active simulation. |
| **3** | **Combined Streak** | `R1_Max_Combo + R2_Max_Streak + R3_Max_Streak` | Measures sustained incident triage accuracy under pressure without errors. |
| **4** | **Database Timestamp** | `MIN(created_at)` across verified submissions | Earlier official database commit breaks deadlocks. |

> **Fair Play Timing Disclosure:** Briefing review, credential registration, and inter-round transition screens are excluded from total duration. Only active gameplay ticks count.

---

## 🗄️ Single Supabase Architecture

All tournament records are stored in a single PostgreSQL database schema with Row Level Security (RLS):

- **`public.game1_scores`**: Round 1 (Server Sniper) scores, durations, streaks, accuracy, and official attempt uniqueness.
- **`public.game2_scores`**: Round 2 (Pipeline Recall) scores, durations, streaks, accuracy, and official attempt uniqueness.
- **`public.game3_scores`**: Round 3 (SwipeOps) scores, durations, streaks, accuracy, and official attempt uniqueness.
- **`public.final_scores`**: 4th table for final score = total score of 3/3, average score ((R1+R2+R3)/3), total time, combined streak, rounds completed, and leaderboard rank.
- **`public.admin_relogin`**: 5th table for operator re-login and practice replay authorizations by administrator key (`SHAURYA@GAME999`).

To initialize or review the database schema, execute the SQL script in [`supabase_schema.sql`](file:///Users/shaurya_bansal/comb_game/supabase_schema.sql).

---

## 💻 Tech Stack & Design System

- **Framework & Bundler:** Vanilla ES Modules + Vite 6
- **Styling:** Modular Vanilla CSS with responsive CSS Grid, Flexbox, `clamp()`, and `min()`/`max()` viewport scaling
- **Database & Auth:** Supabase (`@supabase/supabase-js` v2)
- **Audio Engine:** Web Audio API synth SFX synthesizer (zero external audio file dependencies)
- **Background FX:** HTML5 Canvas DevOps Matrix Rain distributing telemetry tokens across the viewport
- **Typography:** Chakra Petch, Oxanium, Plus Jakarta Sans, Orbitron, and JetBrains Mono
- **Palette:** Cyberpunk deep navy (`#02040a`), glowing cyan (`#00f3ff`), electric violet (`#a855f7`), and emerald green (`#10b981`)

---

## 📱 Responsive 100% Zoom Engineering

The portal and all 3 integrated games are engineered to fit standard laptop screens at **100% normal browser zoom**:

- **1366×768, 1440×900, 1920×1080 Viewports:** Fully contained with zero horizontal overflow and no clipping.
- **Dynamic Viewport Height (`100svh`):** The iframe host shell dynamically binds game views (`calc(100svh - 60px)`) with compact tournament HUDs (`38px`).
- **Internal Scroll Containment:** Event logs and bash terminals scroll internally without causing full-page jumps.
- **Interactive Decision Controls:** "← MITIGATE" and "DEPLOY →" buttons in SwipeOps remain visible and accessible on all viewports.

---

## 🛠️ Local Development & Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/CodeWithShaurya1/DevOps_TechVerse.git
cd DevOps_TechVerse

# Install dependencies
npm install
```

### Environment Configuration
Create a `.env` file in the root directory (refer to `.env.example`):

```env
# Supabase Database Connection
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Event Admin Passphrase for Authorized Practice Replays
VITE_ADMIN_PASSPHRASE=YOUR_SECRET_PASSPHRASE
```

### Run Locally
```bash
# Start Vite development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Run Verification Test Suite
```bash
npm test
```
Executes all 28 automated integration tests verifying registration, score formulas, tie-breaker order, session persistence, and responsive constraints.

### Build Production Bundle
```bash
npm run build
```

---

## 📁 Repository Structure

```
DevOps_TechVerse/
├── DEPLOYMENT_AND_SETUP.md   # Deployment instructions & hosting guide
├── README.md                 # Complete system documentation & architectural manual
├── index.html                # Main tournament portal entrance
├── package.json              # Scripts & dependencies
├── supabase_schema.sql       # Full Supabase PostgreSQL schema with RLS & Views
├── vite.config.js            # Vite configuration (port 3000, host binding)
│
├── public/                   # Static tournament game assets & sub-sandboxes
│   └── games/
│       ├── game1/            # Round 1: Server Sniper (K8s pod triage)
│       ├── game2/            # Round 2: Pipeline Recall (CI/CD reconstruction)
│       └── game3/            # Round 3: SwipeOps (Incident triage deck)
│
├── src/                      # Portal application core
│   ├── main.js               # Router & application bootstrap
│   ├── portalState.js        # Global tournament state & session manager
│   ├── components/           # Portal screen views & modal components
│   │   ├── CinematicIntro.js        # 3-card horizontal landing page
│   │   ├── RegistrationScreen.js    # Operator credentials intake
│   │   ├── RoundIntroScreen.js      # Multiverse 3-2-1 transition countdown
│   │   ├── GameSandboxScreen.js     # Sandboxed game container with HUD
│   │   ├── FinalResultsScreen.js    # Metric debriefing & tier badges
│   │   ├── LeaderboardScreen.js     # Real-time leaderboard view
│   │   ├── EventBriefingModal.js    # Rules modal
│   │   ├── ChallengeLockedModal.js  # Replay authorization modal
│   │   └── PortalHeader.js          # Persistent tournament header
│   ├── services/
│   │   ├── supabaseClient.js        # Database queries & result submissions
│   │   ├── soundManager.js          # Web Audio synth SFX
│   │   └── devopsRain.js            # HTML5 Canvas matrix background
│   └── styles/                      # Modular cyberpunk stylesheets
│       ├── portal.css               # Portal design system & layout tokens
│       ├── server-sniper.css        # Game 1 styling
│       ├── pipeline-recall.css      # Game 2 styling
│       └── swipeops.css             # Game 3 styling
│
├── Game 1/                   # Standalone Server Sniper project files
├── Game 2/                   # Standalone Pipeline Recall project files
├── Game 3./                  # Standalone SwipeOps Vite project files
└── test/
    └── unified_portal.test.js # 28-point automated verification suite
```

---

## 🛡️ Fair Play & Tournament Integrity

1. **Duplicate Attempt Prevention:** Database uniqueness constraints reject duplicate official attempts for the same round under the same student ID.
2. **Authorized Practice Replays:** If a participant encounters network disconnects, an event administrator can authorize a practice replay with `is_official_attempt = false`. Practice runs do not overwrite official leaderboard rankings.
3. **Session Persistence:** Active operator sessions persist across browser refreshes via `localStorage` state reconciliation.
4. **Clean Reset for Competitors:** The portal provides an operator switch utility that clears active session caches without deleting verified historical tournament submissions.

---

## 📜 License & Acknowledgments

Built for **TechVerse ’26** by the **DevOps Club**.
Licensed under the [MIT License](LICENSE).
