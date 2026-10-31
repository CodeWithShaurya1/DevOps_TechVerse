/**
 * TECHVERSE ’26 — Supabase Service Client
 * Unified database interface for participant registration, game results,
 * replay authorizations, and the central leaderboard.
 * Includes seamless local fallback when offline or before SQL schema is executed.
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables with fallback
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://rrocaucskfsokxubpgra.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_QEmcA7peluK0phKfbIhdRA_lbtrCFmb';
export const ADMIN_PASSPHRASE = import.meta.env.VITE_ADMIN_PASSPHRASE || 'SHAURYA@GAME999';

// Local storage keys for resilient fallback
const STORAGE_PARTICIPANTS = 'techverse_participants_v1';
const STORAGE_RESULTS = 'techverse_results_v1';
const STORAGE_REPLAYS = 'techverse_replays_v1';

class SupabaseService {
  constructor() {
    this.client = null;
    this.isCloudConnected = false;
    this._initClient();
    this._initLocalStore();
  }

  _initClient() {
    try {
      if (SUPABASE_URL && SUPABASE_ANON_KEY) {
        this.client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          auth: { persistSession: false }
        });
        this.isCloudConnected = true;
      }
    } catch (e) {
      console.warn('[SupabaseService] Client initialization fallback to local store:', e);
      this.isCloudConnected = false;
    }
  }

  _initLocalStore() {
    if (typeof localStorage === 'undefined') return;
    if (!localStorage.getItem(STORAGE_PARTICIPANTS)) {
      localStorage.setItem(STORAGE_PARTICIPANTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_RESULTS)) {
      localStorage.setItem(STORAGE_RESULTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_REPLAYS)) {
      localStorage.setItem(STORAGE_REPLAYS, JSON.stringify([]));
    }
  }

  // --- LOCAL STORE HELPERS ---
  _getLocalParticipants() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_PARTICIPANTS) || '[]');
    } catch (_) {
      return [];
    }
  }

  _saveLocalParticipants(list) {
    localStorage.setItem(STORAGE_PARTICIPANTS, JSON.stringify(list));
  }

  _getLocalResults() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_RESULTS) || '[]');
    } catch (_) {
      return [];
    }
  }

  _saveLocalResults(list) {
    localStorage.setItem(STORAGE_RESULTS, JSON.stringify(list));
  }

  _getLocalReplays() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_REPLAYS) || '[]');
    } catch (_) {
      return [];
    }
  }

  _saveLocalReplays(list) {
    localStorage.setItem(STORAGE_REPLAYS, JSON.stringify(list));
  }

  // --- NORMALIZATION & VALIDATION ---
  normalizeEnrollment(raw) {
    if (!raw) return '';
    return String(raw).trim().toUpperCase().replace(/\s+/g, '');
  }

  normalizeName(raw) {
    if (!raw) return '';
    return String(raw).trim().toUpperCase();
  }

  generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // --- 1. PARTICIPANT REGISTRATION & IDENTITY ---
  async registerOrGetParticipant(fullName, rawEnrollment) {
    const normalizedName = this.normalizeName(fullName);
    const normalizedEnroll = this.normalizeEnrollment(rawEnrollment);

    if (!normalizedName || normalizedName.length < 2) {
      throw new Error('Full Name must be at least 2 characters.');
    }
    if (!normalizedEnroll || normalizedEnroll.length < 3) {
      throw new Error('Enrollment number must be at least 3 characters.');
    }

    // Try Supabase Cloud first
    if (this.isCloudConnected) {
      try {
        const { data: existing, error: selectError } = await this.client
          .from('participants')
          .select('id, full_name, enrollment_number_normalized, created_at')
          .eq('enrollment_number_normalized', normalizedEnroll)
          .maybeSingle();

        if (!selectError && existing) {
          // Participant already registered; restore session
          return { participant: existing, isNew: false };
        }

        if (!selectError && !existing) {
          const newId = this.generateUUID();
          const { data: created, error: insertError } = await this.client
            .from('participants')
            .insert({
              id: newId,
              full_name: normalizedName,
              enrollment_number_normalized: normalizedEnroll
            })
            .select()
            .single();

          if (!insertError && created) {
            return { participant: created, isNew: true };
          }
        }
      } catch (err) {
        console.warn('[SupabaseService] Cloud participant query failed, using local store:', err);
      }
    }

    // Fallback: Local mirror
    const localList = this._getLocalParticipants();
    const existingLocal = localList.find(p => p.enrollment_number_normalized === normalizedEnroll);

    if (existingLocal) {
      return { participant: existingLocal, isNew: false };
    }

    const newParticipant = {
      id: this.generateUUID(),
      full_name: normalizedName,
      enrollment_number_normalized: normalizedEnroll,
      created_at: new Date().toISOString()
    };
    localList.push(newParticipant);
    this._saveLocalParticipants(localList);

    return { participant: newParticipant, isNew: true };
  }

  async updateParticipantName(participantId, newFullName) {
    const normalizedName = this.normalizeName(newFullName);
    if (!normalizedName || normalizedName.length < 2) {
      throw new Error('Operator Call Sign / Name must be at least 2 characters.');
    }

    if (this.isCloudConnected) {
      try {
        await this.client
          .from('participants')
          .update({ full_name: normalizedName })
          .eq('id', participantId);
      } catch (err) {
        console.warn('[SupabaseService] Cloud participant update failed, updating local store:', err);
      }
    }

    const localList = this._getLocalParticipants();
    const target = localList.find(p => p.id === participantId);
    if (target) {
      target.full_name = normalizedName;
      this._saveLocalParticipants(localList);
    }

    return normalizedName;
  }

  // --- 2. OFFICIAL RESULTS & ONE-ATTEMPT CHECK ---
  async getParticipantOfficialResults(participantId) {
    if (!participantId) return {};

    if (this.isCloudConnected) {
      try {
        const { data, error } = await this.client
          .from('game_results')
          .select('*')
          .eq('participant_id', participantId)
          .eq('is_official_attempt', true);

        if (!error && Array.isArray(data)) {
          const dict = {};
          data.forEach(r => { dict[r.round_number] = r; });
          return dict;
        }
      } catch (err) {
        console.warn('[SupabaseService] Cloud game_results read failed, reading local store:', err);
      }
    }

    // Local fallback
    const allResults = this._getLocalResults();
    const participantResults = allResults.filter(
      r => r.participant_id === participantId && r.is_official_attempt === true
    );
    const dict = {};
    participantResults.forEach(r => { dict[r.round_number] = r; });
    return dict;
  }

  async checkRoundLocked(participantId, roundNumber) {
    if (!participantId) return { isLocked: false, officialAttempt: null, hasReplayAuthorization: false };

    // 1) Check if official attempt already exists
    const officialResults = await this.getParticipantOfficialResults(participantId);
    const officialAttempt = officialResults[roundNumber] || null;

    if (!officialAttempt) {
      return { isLocked: false, officialAttempt: null, hasReplayAuthorization: false };
    }

    // 2) Official attempt exists. Check if an active replay authorization exists
    const hasReplayAuth = await this.hasActiveReplayAuthorization(participantId, roundNumber);

    return {
      isLocked: !hasReplayAuth,
      officialAttempt,
      hasReplayAuthorization: hasReplayAuth
    };
  }

  async hasActiveReplayAuthorization(participantId, roundNumber) {
    if (this.isCloudConnected) {
      try {
        const { data, error } = await this.client
          .from('replay_authorizations')
          .select('*')
          .eq('participant_id', participantId)
          .or(`round_number.eq.${roundNumber},round_number.is.null`)
          .eq('authorization_status', 'pending')
          .limit(1);

        if (!error && Array.isArray(data) && data.length > 0) {
          return true;
        }
      } catch (err) {
        console.warn('[SupabaseService] Replay auth cloud check failed:', err);
      }
    }

    const replays = this._getLocalReplays();
    return replays.some(
      r => r.participant_id === participantId &&
           (r.round_number === roundNumber || r.round_number === null) &&
           r.authorization_status === 'pending'
    );
  }

  // --- 3. SUBMIT GAME RESULT ---
  async submitGameResult({
    participantId,
    roundNumber,
    gameName,
    score,
    maximumScore = null,
    completionTimeMs,
    completionStatus = 'completed',
    streakCount = 0,
    bestStreak = 0,
    successfulActions = 0,
    totalActions = 0,
    attemptNumber = 1,
    isOfficialAttempt = true,
    startedAt = new Date().toISOString(),
    completedAt = new Date().toISOString()
  }) {
    if (!participantId) throw new Error('Missing participantId');
    if (![1, 2, 3].includes(roundNumber)) throw new Error('Invalid round number');

    const resultRecord = {
      id: this.generateUUID(),
      participant_id: participantId,
      round_number: roundNumber,
      game_name: gameName,
      score: Math.max(0, Math.floor(score || 0)),
      maximum_score: maximumScore,
      completion_time_ms: Math.max(0, Math.floor(completionTimeMs || 0)),
      completion_status: completionStatus,
      streak_count: Math.max(0, streakCount || 0),
      best_streak: Math.max(0, bestStreak || 0),
      successful_actions: successfulActions || 0,
      total_actions: totalActions || 0,
      attempt_number: attemptNumber || 1,
      is_official_attempt: Boolean(isOfficialAttempt),
      started_at: startedAt,
      completed_at: completedAt,
      created_at: new Date().toISOString()
    };

    // If this was an authorized practice replay, consume the authorization
    if (!isOfficialAttempt) {
      await this.consumeReplayAuthorization(participantId, roundNumber);
    }

    // Try Supabase Cloud write
    if (this.isCloudConnected) {
      try {
        const { data, error } = await this.client
          .from('game_results')
          .insert(resultRecord)
          .select()
          .single();

        if (error) {
          console.warn('[SupabaseService] Cloud submission warning, saving to local store:', error);
        } else {
          // Always mirror to local store as well for instant resilience
          const localList = this._getLocalResults();
          localList.push(data || resultRecord);
          this._saveLocalResults(localList);
          return { success: true, cloudSynced: true, record: data || resultRecord };
        }
      } catch (err) {
        console.warn('[SupabaseService] Cloud insert threw error:', err);
      }
    }

    // Local fallback
    const localList = this._getLocalResults();
    localList.push(resultRecord);
    this._saveLocalResults(localList);

    return { success: true, cloudSynced: false, record: resultRecord };
  }

  // --- 4. ADMIN REPLAY AUTHORIZATION ---
  async authorizePracticeReplay(participantId, roundNumber, passphrase, reason = 'Administrator practice grant') {
    if (passphrase !== ADMIN_PASSPHRASE) {
      return { success: false, error: 'Invalid Administrator Key. Access Denied.' };
    }

    const authRecord = {
      id: this.generateUUID(),
      participant_id: participantId,
      round_number: roundNumber || null,
      authorization_status: 'pending',
      authorized_administrator: 'SUPER_ADMIN',
      authorization_timestamp: new Date().toISOString(),
      reason: reason || 'Authorized Practice Replay',
      created_at: new Date().toISOString()
    };

    if (this.isCloudConnected) {
      try {
        const { error } = await this.client
          .from('replay_authorizations')
          .insert(authRecord);

        if (!error) {
          const replays = this._getLocalReplays();
          replays.push(authRecord);
          this._saveLocalReplays(replays);
          return { success: true, cloudSynced: true };
        }
      } catch (err) {
        console.warn('[SupabaseService] Cloud replay auth failed, recording locally:', err);
      }
    }

    const replays = this._getLocalReplays();
    replays.push(authRecord);
    this._saveLocalReplays(replays);
    return { success: true, cloudSynced: false };
  }

  async consumeReplayAuthorization(participantId, roundNumber) {
    if (this.isCloudConnected) {
      try {
        await this.client
          .from('replay_authorizations')
          .update({
            authorization_status: 'consumed',
            consumed_at: new Date().toISOString()
          })
          .eq('participant_id', participantId)
          .or(`round_number.eq.${roundNumber},round_number.is.null`)
          .eq('authorization_status', 'pending');
      } catch (_) {}
    }

    const replays = this._getLocalReplays();
    replays.forEach(r => {
      if (r.participant_id === participantId &&
         (r.round_number === roundNumber || r.round_number === null) &&
         r.authorization_status === 'pending') {
        r.authorization_status = 'consumed';
        r.consumed_at = new Date().toISOString();
      }
    });
    this._saveLocalReplays(replays);
  }

  // --- 5. CENTRAL LEADERBOARD & WINNER DETERMINATION ---
  async getLeaderboard() {
    // Attempt to query the public.leaderboard view from Supabase
    if (this.isCloudConnected) {
      try {
        const { data, error } = await this.client
          .from('leaderboard')
          .select('*');

        if (!error && Array.isArray(data) && data.length > 0) {
          return this._sortLeaderboard(data);
        }
      } catch (err) {
        console.warn('[SupabaseService] Could not read view, computing dynamically:', err);
      }
    }

    // Build dynamic leaderboard from participants + game_results
    let participants = [];
    let results = [];

    if (this.isCloudConnected) {
      try {
        const { data: partData } = await this.client.from('participants').select('id, full_name, created_at');
        const { data: resData } = await this.client.from('game_results').select('*').eq('is_official_attempt', true);
        if (Array.isArray(partData) && partData.length > 0) participants = partData;
        if (Array.isArray(resData)) results = resData;
      } catch (_) {}
    }

    // Merge with local records
    if (participants.length === 0) {
      participants = this._getLocalParticipants();
    }
    if (results.length === 0) {
      results = this._getLocalResults().filter(r => r.is_official_attempt === true);
    }

    // Compute aggregates per participant
    const rows = [];
    const resultMap = {};

    results.forEach(res => {
      if (!resultMap[res.participant_id]) {
        resultMap[res.participant_id] = {};
      }
      resultMap[res.participant_id][res.round_number] = res;
    });

    participants.forEach(p => {
      const pRounds = resultMap[p.id] || {};
      const r1 = pRounds[1];
      const r2 = pRounds[2];
      const r3 = pRounds[3];

      const r1Score = r1 ? r1.score : null;
      const r2Score = r2 ? r2.score : null;
      const r3Score = r3 ? r3.score : null;

      const r1Time = r1 ? r1.completion_time_ms : null;
      const r2Time = r2 ? r2.completion_time_ms : null;
      const r3Time = r3 ? r3.completion_time_ms : null;

      const r1Streak = r1 ? r1.best_streak : 0;
      const r2Streak = r2 ? r2.best_streak : 0;
      const r3Streak = r3 ? r3.best_streak : 0;

      const completedCount = [r1, r2, r3].filter(Boolean).length;
      if (completedCount === 0) return; // Only show participants who played at least 1 round

      const totalRawScore = (r1Score || 0) + (r2Score || 0) + (r3Score || 0);
      const avgScore = Number((totalRawScore / 3.0).toFixed(2));
      const totalTimeMs = (r1Time || 0) + (r2Time || 0) + (r3Time || 0);
      const combinedStreak = r1Streak + r2Streak + r3Streak;

      const completedTimestamps = [r1, r2, r3].filter(Boolean).map(r => new Date(r.completed_at).getTime());
      const lastCompletedAt = completedTimestamps.length > 0 ? new Date(Math.max(...completedTimestamps)).toISOString() : p.created_at;

      rows.push({
        participant_id: p.id,
        full_name: p.full_name,
        round_1_score: r1Score,
        round_2_score: r2Score,
        round_3_score: r3Score,
        total_raw_score: totalRawScore,
        average_score: avgScore,
        round_1_time_ms: r1Time,
        round_2_time_ms: r2Time,
        round_3_time_ms: r3Time,
        total_completion_time_ms: totalTimeMs,
        round_1_streak: r1Streak,
        round_2_streak: r2Streak,
        round_3_streak: r3Streak,
        combined_streak: combinedStreak,
        completed_rounds_count: completedCount,
        completion_status: completedCount === 3 ? 'COMPLETED (3/3)' : `IN PROGRESS (${completedCount}/3)`,
        last_completed_at: lastCompletedAt
      });
    });

    return this._sortLeaderboard(rows);
  }

  // Sort strictly using Techverse rules:
  // 1. Average score (descending)
  // 2. Total completion time ms (ascending)
  // 3. Combined streak metric (descending)
  // 4. Earlier verified completion timestamp (ascending)
  _sortLeaderboard(rows) {
    const sorted = [...rows].sort((a, b) => {
      // Prioritize full completions (3/3)
      const aDone = a.completed_rounds_count === 3 ? 1 : 0;
      const bDone = b.completed_rounds_count === 3 ? 1 : 0;
      if (aDone !== bDone) return bDone - aDone;

      // Priority 1: Average Score (descending)
      const aAvg = Number(a.average_score || 0);
      const bAvg = Number(b.average_score || 0);
      if (aAvg !== bAvg) return bAvg - aAvg;

      // Priority 2: Total Completion Time (ascending)
      const aTime = Number(a.total_completion_time_ms || 0);
      const bTime = Number(b.total_completion_time_ms || 0);
      if (aTime !== bTime) return aTime - bTime;

      // Priority 3: Combined Streak (descending)
      const aStreak = Number(a.combined_streak || 0);
      const bStreak = Number(b.combined_streak || 0);
      if (aStreak !== bStreak) return bStreak - aStreak;

      // Priority 4: Earlier verified completion timestamp (ascending)
      const aTs = new Date(a.last_completed_at || 0).getTime();
      const bTs = new Date(b.last_completed_at || 0).getTime();
      return aTs - bTs;
    });

    return sorted.map((row, idx) => ({
      ...row,
      rank: idx + 1
    }));
  }
}

export const supabaseService = new SupabaseService();
