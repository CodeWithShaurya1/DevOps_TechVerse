-- ============================================================================
-- TECHVERSE ’26 — UNIFIED DEVOPS GAMING PORTAL SCHEMA & SECURITY ARCHITECTURE
-- Shared Single Source of Truth for Round 1, Round 2, Round 3
-- ============================================================================

-- 1. Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing views/tables if necessary for a clean setup (optional in production)
-- DROP VIEW IF EXISTS public.leaderboard CASCADE;

-- ----------------------------------------------------------------------------
-- 2. Table: participants
-- Stores identity with normalized enrollment. Enrollment is private.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    enrollment_number_normalized TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fast lookup indexes
CREATE INDEX IF NOT EXISTS idx_participants_enrollment 
ON public.participants (enrollment_number_normalized);

CREATE INDEX IF NOT EXISTS idx_participants_created 
ON public.participants (created_at DESC);

-- Enable RLS
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

-- Allow anonymous registration (INSERT)
CREATE POLICY "Allow public participant registration"
ON public.participants FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow public lookup of participant identity for session restoration
CREATE POLICY "Allow public participant read"
ON public.participants FOR SELECT
TO anon, authenticated
USING (true);

-- Deny public modifications / deletions
CREATE POLICY "Deny public participant update"
ON public.participants FOR UPDATE
TO anon, authenticated
USING (false);

CREATE POLICY "Deny public participant delete"
ON public.participants FOR DELETE
TO anon, authenticated
USING (false);


-- ----------------------------------------------------------------------------
-- 3. Table: game_results
-- Individual official and practice attempts for each of the 3 rounds.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.game_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL CHECK (round_number IN (1, 2, 3)),
    game_name TEXT NOT NULL CHECK (game_name IN ('Server Sniper', 'Pipeline Recall', 'SwipeOps')),
    score INTEGER NOT NULL DEFAULT 0,
    maximum_score INTEGER,
    completion_time_ms BIGINT NOT NULL DEFAULT 0,
    completion_status TEXT NOT NULL DEFAULT 'completed' CHECK (completion_status IN ('completed', 'failed', 'timeout', 'abandoned')),
    streak_count INTEGER NOT NULL DEFAULT 0,
    best_streak INTEGER NOT NULL DEFAULT 0,
    successful_actions INTEGER DEFAULT 0,
    total_actions INTEGER DEFAULT 0,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    is_official_attempt BOOLEAN NOT NULL DEFAULT true,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Crucial unique constraints:
-- 1) A participant can only have ONE official attempt per round:
CREATE UNIQUE INDEX IF NOT EXISTS idx_game_results_official 
ON public.game_results (participant_id, round_number) 
WHERE (is_official_attempt = true);

-- 2) Each attempt number for a participant per round is unique:
CREATE UNIQUE INDEX IF NOT EXISTS idx_game_results_attempts 
ON public.game_results (participant_id, round_number, attempt_number);

-- Performance indexes for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_game_results_round_score 
ON public.game_results (round_number, is_official_attempt, score DESC);

CREATE INDEX IF NOT EXISTS idx_game_results_participant 
ON public.game_results (participant_id);

-- Enable RLS
ALTER TABLE public.game_results ENABLE ROW LEVEL SECURITY;

-- Allow reading results for the leaderboard & participant summary
CREATE POLICY "Allow public game_results read"
ON public.game_results FOR SELECT
TO anon, authenticated
USING (true);

-- Allow inserting game results (validated via unique indexes)
CREATE POLICY "Allow public game_results insert"
ON public.game_results FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Deny updating or tampering with submitted official results
CREATE POLICY "Deny public game_results update"
ON public.game_results FOR UPDATE
TO anon, authenticated
USING (false);

CREATE POLICY "Deny public game_results delete"
ON public.game_results FOR DELETE
TO anon, authenticated
USING (false);


-- ----------------------------------------------------------------------------
-- 4. Table: replay_authorizations
-- Audit trail of admin-authorized practice replays.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.replay_authorizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
    round_number INTEGER CHECK (round_number IN (1, 2, 3)),
    authorization_status TEXT NOT NULL DEFAULT 'pending' CHECK (authorization_status IN ('pending', 'consumed', 'revoked')),
    authorized_administrator TEXT NOT NULL DEFAULT 'ADMIN',
    authorization_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reason TEXT,
    consumed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_replay_auth_participant 
ON public.replay_authorizations (participant_id, authorization_status);

-- Enable RLS
ALTER TABLE public.replay_authorizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public replay_authorizations read"
ON public.replay_authorizations FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public replay_authorizations insert"
ON public.replay_authorizations FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow public replay_authorizations update"
ON public.replay_authorizations FOR UPDATE
TO anon, authenticated
USING (true);


-- ----------------------------------------------------------------------------
-- 5. Database View: leaderboard
-- Calculates ranking strictly according to Techverse '26 rules:
--   Priority 1 — Average score (descending)
--   Priority 2 — Total completion time (ascending)
--   Priority 3 — Combined streak metric (descending)
--   Priority 4 — Earlier verified completion timestamp (ascending)
-- Does NOT expose enrollment number.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.leaderboard AS
WITH official_results AS (
    SELECT 
        participant_id,
        round_number,
        score,
        completion_time_ms,
        best_streak,
        completion_status,
        completed_at
    FROM public.game_results
    WHERE is_official_attempt = true
),
participant_aggregates AS (
    SELECT
        p.id AS participant_id,
        p.full_name,
        
        -- Round 1 Metrics
        MAX(CASE WHEN gr.round_number = 1 THEN gr.score END) AS round_1_score,
        MAX(CASE WHEN gr.round_number = 1 THEN gr.completion_time_ms END) AS round_1_time_ms,
        MAX(CASE WHEN gr.round_number = 1 THEN gr.best_streak END) AS round_1_streak,
        MAX(CASE WHEN gr.round_number = 1 THEN gr.completion_status END) AS round_1_status,
        
        -- Round 2 Metrics
        MAX(CASE WHEN gr.round_number = 2 THEN gr.score END) AS round_2_score,
        MAX(CASE WHEN gr.round_number = 2 THEN gr.completion_time_ms END) AS round_2_time_ms,
        MAX(CASE WHEN gr.round_number = 2 THEN gr.best_streak END) AS round_2_streak,
        MAX(CASE WHEN gr.round_number = 2 THEN gr.completion_status END) AS round_2_status,
        
        -- Round 3 Metrics
        MAX(CASE WHEN gr.round_number = 3 THEN gr.score END) AS round_3_score,
        MAX(CASE WHEN gr.round_number = 3 THEN gr.completion_time_ms END) AS round_3_time_ms,
        MAX(CASE WHEN gr.round_number = 3 THEN gr.best_streak END) AS round_3_streak,
        MAX(CASE WHEN gr.round_number = 3 THEN gr.completion_status END) AS round_3_status,
        
        -- Computed Aggregates
        COUNT(gr.round_number) AS completed_rounds_count,
        (
            COALESCE(MAX(CASE WHEN gr.round_number = 1 THEN gr.score END), 0) +
            COALESCE(MAX(CASE WHEN gr.round_number = 2 THEN gr.score END), 0) +
            COALESCE(MAX(CASE WHEN gr.round_number = 3 THEN gr.score END), 0)
        ) AS total_raw_score,
        
        ROUND(
            (
                COALESCE(MAX(CASE WHEN gr.round_number = 1 THEN gr.score END), 0) +
                COALESCE(MAX(CASE WHEN gr.round_number = 2 THEN gr.score END), 0) +
                COALESCE(MAX(CASE WHEN gr.round_number = 3 THEN gr.score END), 0)
            )::NUMERIC / 3.0,
            2
        ) AS average_score,
        
        (
            COALESCE(MAX(CASE WHEN gr.round_number = 1 THEN gr.completion_time_ms END), 0) +
            COALESCE(MAX(CASE WHEN gr.round_number = 2 THEN gr.completion_time_ms END), 0) +
            COALESCE(MAX(CASE WHEN gr.round_number = 3 THEN gr.completion_time_ms END), 0)
        ) AS total_completion_time_ms,
        
        (
            COALESCE(MAX(CASE WHEN gr.round_number = 1 THEN gr.best_streak END), 0) +
            COALESCE(MAX(CASE WHEN gr.round_number = 2 THEN gr.best_streak END), 0) +
            COALESCE(MAX(CASE WHEN gr.round_number = 3 THEN gr.best_streak END), 0)
        ) AS combined_streak,
        
        MAX(gr.completed_at) AS last_completed_at
    FROM public.participants p
    INNER JOIN official_results gr ON p.id = gr.participant_id
    GROUP BY p.id, p.full_name
)
SELECT
    DENSE_RANK() OVER (
        ORDER BY
            -- Completed all 3 rounds prioritized over incomplete
            CASE WHEN completed_rounds_count = 3 THEN 1 ELSE 2 END ASC,
            -- Priority 1: Average Score (Descending)
            average_score DESC,
            -- Priority 2: Total Completion Time (Ascending)
            total_completion_time_ms ASC,
            -- Priority 3: Combined Streak (Descending)
            combined_streak DESC,
            -- Priority 4: Verified timestamp tie-breaker (Ascending)
            last_completed_at ASC
    ) AS rank,
    participant_id,
    full_name,
    round_1_score,
    round_2_score,
    round_3_score,
    total_raw_score,
    average_score,
    round_1_time_ms,
    round_2_time_ms,
    round_3_time_ms,
    total_completion_time_ms,
    round_1_streak,
    round_2_streak,
    round_3_streak,
    combined_streak,
    completed_rounds_count,
    CASE 
        WHEN completed_rounds_count = 3 THEN 'COMPLETED (3/3)'
        WHEN completed_rounds_count = 2 THEN 'IN PROGRESS (2/3)'
        WHEN completed_rounds_count = 1 THEN 'IN PROGRESS (1/3)'
        ELSE 'REGISTERED'
    END AS completion_status,
    last_completed_at
FROM participant_aggregates;

-- Grant public read access to the view
GRANT SELECT ON public.leaderboard TO anon, authenticated;
