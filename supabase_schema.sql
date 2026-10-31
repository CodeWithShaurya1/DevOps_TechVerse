-- ============================================================================
-- TECHVERSE ’26 — 5-TABLE BACKEND DATABASE ARCHITECTURE FOR SUPABASE
-- Project URL: https://wuvrwrznhyoqdoafzpad.supabase.co
--
-- EXACTLY FIVE TABLES:
--   1. public.game1_scores   (Round 1: Server Sniper scores)
--   2. public.game2_scores   (Round 2: Pipeline Recall scores)
--   3. public.game3_scores   (Round 3: SwipeOps scores)
--   4. public.final_scores   (Total score of 3/3, average score & tournament ranking)
--   5. public.admin_relogin  (Re-login & replay authorization audit by admin key)
-- ============================================================================

-- 0. Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================================
-- TABLE 1: game1_scores (Round 1: Server Sniper)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.game1_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_number TEXT NOT NULL,
    full_name TEXT NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    completion_time_ms BIGINT NOT NULL DEFAULT 0,
    streak INTEGER NOT NULL DEFAULT 0,
    accuracy NUMERIC(5,2) DEFAULT 0,
    completion_status TEXT NOT NULL DEFAULT 'completed',
    is_official_attempt BOOLEAN NOT NULL DEFAULT true,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure only 1 official attempt per operator in Round 1
CREATE UNIQUE INDEX IF NOT EXISTS idx_game1_official_attempt
ON public.game1_scores (enrollment_number)
WHERE (is_official_attempt = true);

CREATE INDEX IF NOT EXISTS idx_game1_scores_rank
ON public.game1_scores (score DESC, completion_time_ms ASC);

ALTER TABLE public.game1_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read game1_scores"
ON public.game1_scores FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public insert game1_scores"
ON public.game1_scores FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Deny public update game1_scores"
ON public.game1_scores FOR UPDATE
TO anon, authenticated
USING (false);

CREATE POLICY "Deny public delete game1_scores"
ON public.game1_scores FOR DELETE
TO anon, authenticated
USING (false);


-- ============================================================================
-- TABLE 2: game2_scores (Round 2: Pipeline Recall)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.game2_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_number TEXT NOT NULL,
    full_name TEXT NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    completion_time_ms BIGINT NOT NULL DEFAULT 0,
    streak INTEGER NOT NULL DEFAULT 0,
    accuracy NUMERIC(5,2) DEFAULT 0,
    completion_status TEXT NOT NULL DEFAULT 'completed',
    is_official_attempt BOOLEAN NOT NULL DEFAULT true,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure only 1 official attempt per operator in Round 2
CREATE UNIQUE INDEX IF NOT EXISTS idx_game2_official_attempt
ON public.game2_scores (enrollment_number)
WHERE (is_official_attempt = true);

CREATE INDEX IF NOT EXISTS idx_game2_scores_rank
ON public.game2_scores (score DESC, completion_time_ms ASC);

ALTER TABLE public.game2_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read game2_scores"
ON public.game2_scores FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public insert game2_scores"
ON public.game2_scores FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Deny public update game2_scores"
ON public.game2_scores FOR UPDATE
TO anon, authenticated
USING (false);

CREATE POLICY "Deny public delete game2_scores"
ON public.game2_scores FOR DELETE
TO anon, authenticated
USING (false);


-- ============================================================================
-- TABLE 3: game3_scores (Round 3: SwipeOps)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.game3_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_number TEXT NOT NULL,
    full_name TEXT NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    completion_time_ms BIGINT NOT NULL DEFAULT 0,
    streak INTEGER NOT NULL DEFAULT 0,
    accuracy NUMERIC(5,2) DEFAULT 0,
    completion_status TEXT NOT NULL DEFAULT 'completed',
    is_official_attempt BOOLEAN NOT NULL DEFAULT true,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure only 1 official attempt per operator in Round 3
CREATE UNIQUE INDEX IF NOT EXISTS idx_game3_official_attempt
ON public.game3_scores (enrollment_number)
WHERE (is_official_attempt = true);

CREATE INDEX IF NOT EXISTS idx_game3_scores_rank
ON public.game3_scores (score DESC, completion_time_ms ASC);

ALTER TABLE public.game3_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read game3_scores"
ON public.game3_scores FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public insert game3_scores"
ON public.game3_scores FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Deny public update game3_scores"
ON public.game3_scores FOR UPDATE
TO anon, authenticated
USING (false);

CREATE POLICY "Deny public delete game3_scores"
ON public.game3_scores FOR DELETE
TO anon, authenticated
USING (false);


-- ============================================================================
-- TABLE 4: final_scores (Aggregated Tournament Score = Total Score of 3/3)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.final_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_number TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    game1_score INTEGER NOT NULL DEFAULT 0,
    game2_score INTEGER NOT NULL DEFAULT 0,
    game3_score INTEGER NOT NULL DEFAULT 0,
    total_score INTEGER NOT NULL DEFAULT 0,       -- Total score of 3/3 games
    average_score NUMERIC(7,2) NOT NULL DEFAULT 0.00, -- (game1 + game2 + game3) / 3.0
    game1_time_ms BIGINT NOT NULL DEFAULT 0,
    game2_time_ms BIGINT NOT NULL DEFAULT 0,
    game3_time_ms BIGINT NOT NULL DEFAULT 0,
    total_time_ms BIGINT NOT NULL DEFAULT 0,
    game1_streak INTEGER NOT NULL DEFAULT 0,
    game2_streak INTEGER NOT NULL DEFAULT 0,
    game3_streak INTEGER NOT NULL DEFAULT 0,
    combined_streak INTEGER NOT NULL DEFAULT 0,
    rounds_completed INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'REGISTERED',
    last_completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tournament Leaderboard Ranking Index
CREATE INDEX IF NOT EXISTS idx_final_scores_ranking
ON public.final_scores (
    rounds_completed DESC,
    average_score DESC,
    total_time_ms ASC,
    combined_streak DESC,
    last_completed_at ASC
);

ALTER TABLE public.final_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read final_scores"
ON public.final_scores FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public insert final_scores"
ON public.final_scores FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow public update final_scores"
ON public.final_scores FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Deny public delete final_scores"
ON public.final_scores FOR DELETE
TO anon, authenticated
USING (false);


-- ============================================================================
-- TABLE 5: admin_relogin (Re-login & Replay Authorization by Admin Key)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.admin_relogin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_number TEXT NOT NULL,
    admin_key TEXT NOT NULL,
    round_number INTEGER, -- NULL = global operator relogin, 1/2/3 = specific round
    action_type TEXT NOT NULL DEFAULT 'relogin', -- 'relogin' or 'replay'
    status TEXT NOT NULL DEFAULT 'pending',      -- 'pending', 'consumed', 'revoked'
    reason TEXT DEFAULT 'Administrator authorization',
    authorized_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    consumed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_relogin_lookup
ON public.admin_relogin (enrollment_number, status);

ALTER TABLE public.admin_relogin ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read admin_relogin"
ON public.admin_relogin FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public insert admin_relogin"
ON public.admin_relogin FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow public update admin_relogin"
ON public.admin_relogin FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Deny public delete admin_relogin"
ON public.admin_relogin FOR DELETE
TO anon, authenticated
USING (false);


-- ============================================================================
-- AUTOMATIC SYNCHRONIZATION TRIGGER: game scores -> final_scores
-- Keeps final_scores (total of 3/3) in real-time sync with individual game scores
-- ============================================================================
CREATE OR REPLACE FUNCTION public.sync_final_scores()
RETURNS TRIGGER AS $$
DECLARE
    r1 RECORD;
    r2 RECORD;
    r3 RECORD;
    r_name TEXT;
    r_enroll TEXT;
    r_completed INTEGER := 0;
    r_g1_score INTEGER := 0;
    r_g2_score INTEGER := 0;
    r_g3_score INTEGER := 0;
    r_g1_time BIGINT := 0;
    r_g2_time BIGINT := 0;
    r_g3_time BIGINT := 0;
    r_g1_streak INTEGER := 0;
    r_g2_streak INTEGER := 0;
    r_g3_streak INTEGER := 0;
    r_total_score INTEGER := 0;
    r_avg_score NUMERIC(7,2) := 0.00;
    r_total_time BIGINT := 0;
    r_comb_streak INTEGER := 0;
    r_status TEXT := 'IN PROGRESS';
    r_last_at TIMESTAMPTZ := NOW();
BEGIN
    r_enroll := NEW.enrollment_number;
    r_name := NEW.full_name;

    -- Round 1 Score
    SELECT score, completion_time_ms, streak, created_at INTO r1
    FROM public.game1_scores
    WHERE enrollment_number = r_enroll AND is_official_attempt = true
    ORDER BY created_at DESC LIMIT 1;

    IF FOUND THEN
        r_completed := r_completed + 1;
        r_g1_score := r1.score;
        r_g1_time := r1.completion_time_ms;
        r_g1_streak := r1.streak;
        r_last_at := r1.created_at;
    END IF;

    -- Round 2 Score
    SELECT score, completion_time_ms, streak, created_at INTO r2
    FROM public.game2_scores
    WHERE enrollment_number = r_enroll AND is_official_attempt = true
    ORDER BY created_at DESC LIMIT 1;

    IF FOUND THEN
        r_completed := r_completed + 1;
        r_g2_score := r2.score;
        r_g2_time := r2.completion_time_ms;
        r_g2_streak := r2.streak;
        IF r2.created_at > r_last_at THEN r_last_at := r2.created_at; END IF;
    END IF;

    -- Round 3 Score
    SELECT score, completion_time_ms, streak, created_at INTO r3
    FROM public.game3_scores
    WHERE enrollment_number = r_enroll AND is_official_attempt = true
    ORDER BY created_at DESC LIMIT 1;

    IF FOUND THEN
        r_completed := r_completed + 1;
        r_g3_score := r3.score;
        r_g3_time := r3.completion_time_ms;
        r_g3_streak := r3.streak;
        IF r3.created_at > r_last_at THEN r_last_at := r3.created_at; END IF;
    END IF;

    -- Final Score = Total score of 3/3
    r_total_score := r_g1_score + r_g2_score + r_g3_score;
    r_avg_score := ROUND((r_total_score::NUMERIC / 3.0), 2);
    r_total_time := r_g1_time + r_g2_time + r_g3_time;
    r_comb_streak := r_g1_streak + r_g2_streak + r_g3_streak;

    IF r_completed = 3 THEN
        r_status := 'COMPLETED (3/3)';
    ELSIF r_completed > 0 THEN
        r_status := 'IN PROGRESS (' || r_completed || '/3)';
    ELSE
        r_status := 'REGISTERED';
    END IF;

    INSERT INTO public.final_scores (
        enrollment_number, full_name,
        game1_score, game2_score, game3_score,
        total_score, average_score,
        game1_time_ms, game2_time_ms, game3_time_ms, total_time_ms,
        game1_streak, game2_streak, game3_streak, combined_streak,
        rounds_completed, status, last_completed_at
    ) VALUES (
        r_enroll, r_name,
        r_g1_score, r_g2_score, r_g3_score,
        r_total_score, r_avg_score,
        r_g1_time, r_g2_time, r_g3_time, r_total_time,
        r_g1_streak, r_g2_streak, r_g3_streak, r_comb_streak,
        r_completed, r_status, r_last_at
    )
    ON CONFLICT (enrollment_number) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        game1_score = EXCLUDED.game1_score,
        game2_score = EXCLUDED.game2_score,
        game3_score = EXCLUDED.game3_score,
        total_score = EXCLUDED.total_score,
        average_score = EXCLUDED.average_score,
        game1_time_ms = EXCLUDED.game1_time_ms,
        game2_time_ms = EXCLUDED.game2_time_ms,
        game3_time_ms = EXCLUDED.game3_time_ms,
        total_time_ms = EXCLUDED.total_time_ms,
        game1_streak = EXCLUDED.game1_streak,
        game2_streak = EXCLUDED.game2_streak,
        game3_streak = EXCLUDED.game3_streak,
        combined_streak = EXCLUDED.combined_streak,
        rounds_completed = EXCLUDED.rounds_completed,
        status = EXCLUDED.status,
        last_completed_at = EXCLUDED.last_completed_at;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_final_scores_g1 ON public.game1_scores;
CREATE TRIGGER trg_sync_final_scores_g1
AFTER INSERT OR UPDATE ON public.game1_scores
FOR EACH ROW EXECUTE FUNCTION public.sync_final_scores();

DROP TRIGGER IF EXISTS trg_sync_final_scores_g2 ON public.game2_scores;
CREATE TRIGGER trg_sync_final_scores_g2
AFTER INSERT OR UPDATE ON public.game2_scores
FOR EACH ROW EXECUTE FUNCTION public.sync_final_scores();

DROP TRIGGER IF EXISTS trg_sync_final_scores_g3 ON public.game3_scores;
CREATE TRIGGER trg_sync_final_scores_g3
AFTER INSERT OR UPDATE ON public.game3_scores
FOR EACH ROW EXECUTE FUNCTION public.sync_final_scores();
