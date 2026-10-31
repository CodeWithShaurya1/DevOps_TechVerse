# TECHVERSE ’26 — UNIFIED DEVOPS GAMING PORTAL

A unified, high-octane competitive gaming portal built for **Club Battle: Techverse ’26** orchestrating three DevOps gauntlets under **one shared Supabase database**:

1. **Round 1: Server Sniper — Chaos Edition** (60s Kubernetes 6×6 Pod Arena triage)
2. **Round 2: DevOps Arena — Pipeline Recall** (CI/CD visual memorization & reconstruction)
3. **Round 3: SwipeOps — The Production Rescue Mission** (High-tempo incident response decision deck)

---

## 🚀 1. Complete Event Sequence

The portal strictly enforces the exact 11-step tournament progression:

1. **Cinematic Intro Animation:** Animated cyber canvas, audio bootup, and mission briefing.
2. **Participant Registration:** Single-entry portal collecting Full Name and Enrollment Number with input normalization and deduplication.
3. **Event Briefing & Tournament Instructions:** Overview of all three rounds, official ranking rules, and timing protocols.
4. **Round 1 Introduction:** Full-screen mission briefing with countdown and "Launch Server Sniper" button.
5. **Server Sniper Gameplay:** 60s 6×6 pod arena, Kubernetes incidents (High CPU, CrashLoopBackOff, Deadlocks, Ghost Pods), load balancer drag-and-drop, autoscaler, double-click emergency terminal fix, and 2x combo multiplier.
6. **Round 2 Introduction:** Full-screen mission briefing with countdown and "Launch Pipeline Recall" button.
7. **Pipeline Recall Gameplay:** Phase 1 memorization scan, Phase 2 drag-and-drop reconstruction with decoy stages, Phase 3 automated CI/CD runner verification with real-time terminal logs.
8. **Round 3 Introduction:** Full-screen mission briefing with countdown and "Launch SwipeOps" button.
9. **SwipeOps Gameplay:** 45s total mission limit, 3-round incident swipe decision deck (Left = Mitigate/Reject, Right = Deploy/Apply), production health meter, streaks, and accuracy metrics.
10. **Final Results Page:** Comprehensive metrics debriefing displaying Round 1, 2, and 3 scores, Total Raw Score, Average Score ((R1+R2+R3)/3), isolated round durations, Total Completion Time, Best Streaks, Combined Streak Metric, and Final Official Rank.
11. **Unified Central Leaderboard:** Real-time leaderboard view strictly sorted by the 4 tournament tie-breaker priorities with instant search, live refresh, and masked privacy.

---

## 🗄️ 2. Supabase Database Setup (Single Source of Truth)

All tournament records are stored in one shared Supabase PostgreSQL database.

### Step 1: Execute SQL Schema
Open the **SQL Editor** in your [Supabase Dashboard](https://supabase.com/dashboard) and paste the contents of [`supabase_schema.sql`](file:///Users/shaurya_bansal/comb_game/supabase_schema.sql):

```sql
-- Creates:
-- 1. Table public.participants (UUID PK, full_name, enrollment_number_normalized UNIQUE)
-- 2. Table public.game_results (UUID PK, participant_id FK, round_number, score, duration_ms, streak, official constraint)
-- 3. Table public.replay_authorizations (UUID PK, participant_id FK, audit trail of admin clearances)
-- 4. View public.leaderboard (Strict 4-priority ranking view, hides enrollment numbers)
-- 5. Row Level Security (RLS) policies protecting official scores from participant tampering
```

Click **Run** to create the tables, indexes, and views.

---

## ⚙️ 3. Environment Configuration

Create or update `.env` in the root directory:

```env
# Supabase Project URL
VITE_SUPABASE_URL=https://rrocaucskfsokxubpgra.supabase.co

# Supabase Anonymous (Public) API Key
VITE_SUPABASE_ANON_KEY=sb_publishable_QEmcA7peluK0phKfbIhdRA_lbtrCFmb

# Event Administrator Secret Key for authorized practice replays
VITE_ADMIN_PASSPHRASE=SHAURYA@GAME999
```

An example template is provided in [`.env.example`](file:///Users/shaurya_bansal/comb_game/.env.example).

---

## 💻 4. Local Development

Run the portal locally on your workstation:

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev
```

Open `http://localhost:3000` in your web browser.

---

## 🧪 5. Automated Verification Suite

Run the full automated test suite verifying all 18 prompt requirements:

```bash
npm test
```

### Verified Criteria:
- [x] Registration normalizes input and generates unique participant ID
- [x] Same participant ID reaches all three rounds via session persistence
- [x] Round 1, Round 2, and Round 3 scores are stored separately in `game_results`
- [x] Average score is calculated strictly by `(Round 1 + Round 2 + Round 3) / 3`
- [x] Total completion time equals sum of round durations, strictly excluding registration and briefing
- [x] Refreshing page does not reset an active attempt round start timer
- [x] Database constraint rejects duplicate official attempts for same round
- [x] Authorized practice replays run with `is_official_attempt = false` and cannot overwrite official scores
- [x] Priority 1: Higher average score always ranks first
- [x] Priority 2: Faster total completion time breaks equal average score
- [x] Priority 3: Combined streak metric breaks tie only when score and time are equal
- [x] Priority 4: Verified timestamp tie-breaker applied deterministically
- [x] Incomplete participants (1/3 or 2/3) show clear status and rank below completed (3/3)
- [x] Public leaderboard view excludes enrollment numbers
- [x] Admin key validates replay authorization securely
- [x] Round 1, 2, 3 load using shared operator name without individual name modals
- [x] Supabase SQL schema specifies participants, game_results, replay_authorizations, and leaderboard view with RLS
- [x] Complete 11-step tournament sequence is configured

---

## 🚢 6. Vercel Deployment

The project is fully compatible with Vercel zero-configuration deployment:

```bash
# Production bundle build
npm run build

# Deploy via Vercel CLI (optional)
npx vercel --prod
```

Configure `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_ADMIN_PASSPHRASE` in the **Vercel Project Settings → Environment Variables**.
