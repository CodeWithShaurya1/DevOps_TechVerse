/**
 * TECHVERSE ’26 — Supabase Service Client
 * Unified database interface connected to the 5-table architecture:
 *   1. game1_scores  (Round 1: Server Sniper)
 *   2. game2_scores  (Round 2: Pipeline Recall)
 *   3. game3_scores  (Round 3: SwipeOps)
 *   4. final_scores  (Total score of 3/3, average score, tournament leaderboard)
 *   5. admin_relogin (Admin re-login and practice replay authorization audit)
 *
 * Includes automatic local storage mirroring for resilient offline / pre-setup play.
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables with active defaults
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://wuvrwrznhyoqdoafzpad.supabase.co';

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_1ZwM-kLSC9FYRR3D5m0_xw_jxf3zrQa';

export const ADMIN_PASSPHRASE = import.meta.env.VITE_ADMIN_PASSPHRASE || 'SHAURYA@GAME999';

// Local storage keys for resilient fallback
const STORAGE_G1 = 'techverse_game1_scores_v2';
const STORAGE_G2 = 'techverse_game2_scores_v2';
const STORAGE_G3 = 'techverse_game3_scores_v2';
const STORAGE_FINAL = 'techverse_final_scores_v2';
const STORAGE_ADMIN_RELOGIN = 'techverse_admin_relogin_v2';

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
    [STORAGE_G1, STORAGE_G2, STORAGE_G3, STORAGE_FINAL, STORAGE_ADMIN_RELOGIN].forEach(key => {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify([]));
      }
    });
  }

  // --- LOCAL STORE HELPERS ---
  _getLocalList(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (_) {
      return [];
    }
  }

  _saveLocalList(key, list) {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(list));
  }

  _getGameStorageKey(roundNumber) {
    if (roundNumber === 1) return STORAGE_G1;
    if (roundNumber === 2) return STORAGE_G2;
    return STORAGE_G3;
  }

  _getGameTableName(roundNumber) {
    return `game${roundNumber}_scores`;
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

  // --- 1. OPERATOR REGISTRATION & SESSION RESTORATION (Table 4: final_scores) ---
  async registerOrGetParticipant(fullName, rawEnrollment) {
    const normalizedName = this.normalizeName(fullName);
    const normalizedEnroll = this.normalizeEnrollment(rawEnrollment);

    if (!normalizedName || normalizedName.length < 2) {
      throw new Error('Full Name must be at least 2 characters.');
    }
    if (!normalizedEnroll || normalizedEnroll.length < 3) {
      throw new Error('Enrollment number must be at least 3 characters.');
    }

    // Check Cloud Supabase final_scores table first
    if (this.isCloudConnected) {
      try {
        const { data: existing, error: selectErr } = await this.client
          .from('final_scores')
          .select('*')
          .eq('enrollment_number', normalizedEnroll)
          .maybeSingle();

        if (!selectErr && existing) {
          const resolvedName = (normalizedName && normalizedName !== 'OPERATOR') ? normalizedName : existing.full_name;

          // If participant provided a real name that differs from stored name (e.g. was previously 'OPERATOR'), heal across all tables
          if (normalizedName && normalizedName !== 'OPERATOR' && existing.full_name !== normalizedName) {
            try {
              await this.client
                .from('final_scores')
                .update({ full_name: normalizedName })
                .eq('enrollment_number', normalizedEnroll);

              await Promise.allSettled([
                this.client.from('game1_scores').update({ full_name: normalizedName }).eq('enrollment_number', normalizedEnroll),
                this.client.from('game2_scores').update({ full_name: normalizedName }).eq('enrollment_number', normalizedEnroll),
                this.client.from('game3_scores').update({ full_name: normalizedName }).eq('enrollment_number', normalizedEnroll)
              ]);
            } catch (healErr) {
              console.warn('[SupabaseService] Cloud auto-heal name warning:', healErr);
            }
          }

          const participant = {
            id: existing.enrollment_number,
            full_name: resolvedName,
            enrollment_number_normalized: existing.enrollment_number
          };
          this._syncLocalParticipantRecord(participant);
          return { participant, isNew: false };
        }

        if (!selectErr && !existing) {
          const newRecord = {
            id: this.generateUUID(),
            enrollment_number: normalizedEnroll,
            full_name: normalizedName,
            game1_score: 0,
            game2_score: 0,
            game3_score: 0,
            total_score: 0,
            average_score: 0.00,
            rounds_completed: 0,
            status: 'REGISTERED',
            created_at: new Date().toISOString()
          };

          const { data: created, error: insertErr } = await this.client
            .from('final_scores')
            .insert(newRecord)
            .select()
            .single();

          if (!insertErr && created) {
            const participant = {
              id: created.enrollment_number,
              full_name: created.full_name,
              enrollment_number_normalized: created.enrollment_number
            };
            this._syncLocalParticipantRecord(participant);
            return { participant, isNew: true };
          }
        }
      } catch (err) {
        console.warn('[SupabaseService] Cloud registration fallback to local:', err);
      }
    }

    // Local mirror fallback
    const localFinals = this._getLocalList(STORAGE_FINAL);
    const existingLocal = localFinals.find(f => f.enrollment_number === normalizedEnroll);

    if (existingLocal) {
      const resolvedName = (normalizedName && normalizedName !== 'OPERATOR') ? normalizedName : existingLocal.full_name;
      if (normalizedName && normalizedName !== 'OPERATOR' && existingLocal.full_name !== normalizedName) {
        existingLocal.full_name = normalizedName;
        this._saveLocalList(STORAGE_FINAL, localFinals);
      }
      const participant = {
        id: existingLocal.enrollment_number,
        full_name: resolvedName,
        enrollment_number_normalized: existingLocal.enrollment_number
      };
      return { participant, isNew: false };
    }

    const newLocalRecord = {
      id: this.generateUUID(),
      enrollment_number: normalizedEnroll,
      full_name: normalizedName,
      game1_score: 0,
      game2_score: 0,
      game3_score: 0,
      total_score: 0,
      average_score: 0.00,
      total_time_ms: 0,
      combined_streak: 0,
      rounds_completed: 0,
      status: 'REGISTERED',
      created_at: new Date().toISOString()
    };
    localFinals.push(newLocalRecord);
    this._saveLocalList(STORAGE_FINAL, localFinals);

    const participant = {
      id: normalizedEnroll,
      full_name: normalizedName,
      enrollment_number_normalized: normalizedEnroll
    };
    return { participant, isNew: true };
  }

  _syncLocalParticipantRecord(participant) {
    const list = this._getLocalList(STORAGE_FINAL);
    const idx = list.findIndex(f => f.enrollment_number === participant.enrollment_number_normalized);
    if (idx >= 0) {
      list[idx].full_name = participant.full_name;
    } else {
      list.push({
        id: this.generateUUID(),
        enrollment_number: participant.enrollment_number_normalized,
        full_name: participant.full_name,
        game1_score: 0,
        game2_score: 0,
        game3_score: 0,
        total_score: 0,
        average_score: 0.00,
        rounds_completed: 0,
        status: 'REGISTERED',
        created_at: new Date().toISOString()
      });
    }
    this._saveLocalList(STORAGE_FINAL, list);
  }

  async updateParticipantName(participantIdOrEnroll, newFullName) {
    const normalizedName = this.normalizeName(newFullName);
    const enroll = this.normalizeEnrollment(participantIdOrEnroll);
    if (!normalizedName || normalizedName.length < 2) {
      throw new Error('Operator Call Sign / Name must be at least 2 characters.');
    }

    if (this.isCloudConnected) {
      try {
        await this.client
          .from('final_scores')
          .update({ full_name: normalizedName })
          .eq('enrollment_number', enroll);

        await Promise.allSettled([
          this.client.from('game1_scores').update({ full_name: normalizedName }).eq('enrollment_number', enroll),
          this.client.from('game2_scores').update({ full_name: normalizedName }).eq('enrollment_number', enroll),
          this.client.from('game3_scores').update({ full_name: normalizedName }).eq('enrollment_number', enroll)
        ]);
      } catch (err) {
        console.warn('[SupabaseService] Cloud name update warning:', err);
      }
    }

    const localFinals = this._getLocalList(STORAGE_FINAL);
    const target = localFinals.find(f => f.enrollment_number === enroll);
    if (target) {
      target.full_name = normalizedName;
      this._saveLocalList(STORAGE_FINAL, localFinals);
    }

    return normalizedName;
  }

  async getParticipantFullName(enroll) {
    if (!enroll) return null;

    // 1. Check active session in browser
    if (typeof sessionStorage !== 'undefined') {
      try {
        const saved = JSON.parse(sessionStorage.getItem('techverse_session_participant') || '{}');
        if (saved && (saved.enrollment_number_normalized === enroll || saved.id === enroll || saved.enrollment === enroll)) {
          if (saved.full_name && saved.full_name !== 'OPERATOR') {
            return this.normalizeName(saved.full_name);
          }
        }
      } catch (_) {}
    }

    // 2. Check local preferred operator callsign
    if (typeof localStorage !== 'undefined') {
      const preferred = localStorage.getItem('techverse_preferred_operator');
      if (preferred && preferred !== 'OPERATOR' && preferred.length >= 2) {
        return this.normalizeName(preferred);
      }
    }

    // 3. Check local final_scores list
    const localFinals = this._getLocalList(STORAGE_FINAL);
    const local = localFinals.find(f => f.enrollment_number === enroll && f.full_name && f.full_name !== 'OPERATOR');
    if (local && local.full_name) return this.normalizeName(local.full_name);

    // 4. Check cloud final_scores table
    if (this.isCloudConnected) {
      try {
        const { data } = await this.client
          .from('final_scores')
          .select('full_name')
          .eq('enrollment_number', enroll)
          .maybeSingle();
        if (data && data.full_name && data.full_name !== 'OPERATOR') {
          return this.normalizeName(data.full_name);
        }
      } catch (_) {}

      // 5. Check game tables for any existing round where full_name was saved
      try {
        for (const t of ['game1_scores', 'game2_scores', 'game3_scores']) {
          const { data } = await this.client
            .from(t)
            .select('full_name')
            .eq('enrollment_number', enroll)
            .neq('full_name', 'OPERATOR')
            .limit(1)
            .maybeSingle();
          if (data && data.full_name && data.full_name !== 'OPERATOR') {
            return this.normalizeName(data.full_name);
          }
        }
      } catch (_) {}
    }

    return null;
  }

  // --- 2. OFFICIAL ROUND SCORES (Tables 1, 2, 3: game1_scores, game2_scores, game3_scores) ---
  async getParticipantOfficialResults(participantIdOrEnroll) {
    const enroll = this.normalizeEnrollment(participantIdOrEnroll);
    if (!enroll) return {};

    const results = {};

    if (this.isCloudConnected) {
      try {
        const [r1Res, r2Res, r3Res] = await Promise.all([
          this.client.from('game1_scores').select('*').eq('enrollment_number', enroll).eq('is_official_attempt', true).maybeSingle(),
          this.client.from('game2_scores').select('*').eq('enrollment_number', enroll).eq('is_official_attempt', true).maybeSingle(),
          this.client.from('game3_scores').select('*').eq('enrollment_number', enroll).eq('is_official_attempt', true).maybeSingle()
        ]);

        if (r1Res.data) results[1] = this._normalizeResultRecord(r1Res.data, 1, 'Server Sniper');
        if (r2Res.data) results[2] = this._normalizeResultRecord(r2Res.data, 2, 'Pipeline Recall');
        if (r3Res.data) results[3] = this._normalizeResultRecord(r3Res.data, 3, 'SwipeOps');

        if (Object.keys(results).length > 0) return results;
      } catch (err) {
        console.warn('[SupabaseService] Cloud score read failed, reading local mirror:', err);
      }
    }

    // Local mirror check
    [1, 2, 3].forEach(roundNum => {
      const list = this._getLocalList(this._getGameStorageKey(roundNum));
      const found = list.find(r => r.enrollment_number === enroll && r.is_official_attempt === true);
      if (found) {
        results[roundNum] = this._normalizeResultRecord(found, roundNum);
      }
    });

    return results;
  }

  _normalizeResultRecord(raw, roundNum, defaultGameName) {
    return {
      id: raw.id,
      participant_id: raw.enrollment_number,
      enrollment_number: raw.enrollment_number,
      round_number: raw.round_number || roundNum,
      game_name: raw.game_name || defaultGameName || (roundNum === 1 ? 'Server Sniper' : roundNum === 2 ? 'Pipeline Recall' : 'SwipeOps'),
      score: raw.score || 0,
      completion_time_ms: raw.completion_time_ms || 0,
      completion_status: raw.completion_status || 'completed',
      streak_count: raw.streak || raw.streak_count || 0,
      best_streak: raw.streak || raw.best_streak || 0,
      accuracy: raw.accuracy || 0,
      attempt_number: raw.attempt_number || 1,
      is_official_attempt: raw.is_official_attempt !== false,
      created_at: raw.created_at || new Date().toISOString()
    };
  }

  // --- 3. ROUND LOCK & ADMIN RE-LOGIN AUDIT (Table 5: admin_relogin) ---
  async checkRoundLocked(participantIdOrEnroll, roundNumber) {
    const enroll = this.normalizeEnrollment(participantIdOrEnroll);
    if (!enroll) return { isLocked: false, officialAttempt: null, hasReplayAuthorization: false };

    // 1) Check if official attempt exists for this round
    const officialResults = await this.getParticipantOfficialResults(enroll);
    const officialAttempt = officialResults[roundNumber] || null;

    if (!officialAttempt) {
      return { isLocked: false, officialAttempt: null, hasReplayAuthorization: false };
    }

    // 2) Check if active pending authorization exists in admin_relogin
    const hasReplayAuth = await this.hasActiveReplayAuthorization(enroll, roundNumber);

    return {
      isLocked: !hasReplayAuth,
      officialAttempt,
      hasReplayAuthorization: hasReplayAuth
    };
  }

  async hasActiveReplayAuthorization(participantIdOrEnroll, roundNumber) {
    const enroll = this.normalizeEnrollment(participantIdOrEnroll);
    if (!enroll) return false;

    if (this.isCloudConnected) {
      try {
        const { data, error } = await this.client
          .from('admin_relogin')
          .select('*')
          .eq('enrollment_number', enroll)
          .or(`round_number.eq.${roundNumber},round_number.is.null`)
          .eq('status', 'pending')
          .limit(1);

        if (!error && Array.isArray(data) && data.length > 0) {
          return true;
        }
      } catch (err) {
        console.warn('[SupabaseService] Cloud admin_relogin check failed:', err);
      }
    }

    const localReplays = this._getLocalList(STORAGE_ADMIN_RELOGIN);
    return localReplays.some(
      r => r.enrollment_number === enroll &&
           (r.round_number === roundNumber || r.round_number === null) &&
           r.status === 'pending'
    );
  }

  // --- 4. SUBMIT GAME RESULT (Into Table 1, 2, or 3, then update Table 4) ---
  async submitGameResult({
    participantId,
    enrollmentNumber,
    fullName,
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
    const enroll = this.normalizeEnrollment(enrollmentNumber || participantId);
    let name = this.normalizeName(fullName);

    if (!enroll) throw new Error('Missing operator enrollment number');
    if (![1, 2, 3].includes(roundNumber)) throw new Error('Invalid round number');

    // If name is missing or 'OPERATOR', actively recover from registration, session, or database
    if (!name || name === 'OPERATOR') {
      const recovered = await this.getParticipantFullName(enroll);
      if (recovered && recovered !== 'OPERATOR') {
        name = recovered;
      } else {
        name = name || 'OPERATOR';
      }
    }

    const streakVal = Math.max(0, streakCount || bestStreak || 0);
    const accuracyVal = totalActions > 0 ? Number(((successfulActions / totalActions) * 100).toFixed(2)) : 100.0;
    const finalScore = Math.max(0, Math.floor(score || 0));
    const finalDuration = Math.max(0, Math.floor(completionTimeMs || 0));

    const gameRecord = {
      id: this.generateUUID(),
      enrollment_number: enroll,
      full_name: name,
      score: finalScore,
      completion_time_ms: finalDuration,
      streak: streakVal,
      accuracy: accuracyVal,
      completion_status: completionStatus,
      is_official_attempt: Boolean(isOfficialAttempt),
      attempt_number: attemptNumber || 1,
      created_at: completedAt
    };

    const tableName = this._getGameTableName(roundNumber);
    const storageKey = this._getGameStorageKey(roundNumber);

    // Consume replay authorization if this was an authorized practice attempt
    if (!isOfficialAttempt) {
      await this.consumeReplayAuthorization(enroll, roundNumber);
    }

    // Cloud submission to corresponding game table
    let cloudSynced = false;
    if (this.isCloudConnected) {
      try {
        const { data, error } = await this.client
          .from(tableName)
          .insert(gameRecord)
          .select()
          .single();

        if (!error && data) {
          cloudSynced = true;
        } else if (error) {
          console.warn(`[SupabaseService] Cloud submission to ${tableName} warning:`, error);
        }
      } catch (err) {
        console.warn(`[SupabaseService] Cloud submission to ${tableName} threw error:`, err);
      }
    }

    // Always mirror to local game storage
    const localGameList = this._getLocalList(storageKey);
    localGameList.push(gameRecord);
    this._saveLocalList(storageKey, localGameList);

    // If official attempt, update Table 4: final_scores
    if (isOfficialAttempt) {
      await this._syncFinalScores(enroll, name);
    }

    const normalizedResult = this._normalizeResultRecord(gameRecord, roundNumber, gameName);
    return { success: true, cloudSynced, record: normalizedResult };
  }

  // Keep Table 4: final_scores updated with total score of 3/3
  async _syncFinalScores(enroll, name) {
    let resolvedName = name;
    if (!resolvedName || resolvedName === 'OPERATOR') {
      const recovered = await this.getParticipantFullName(enroll);
      if (recovered && recovered !== 'OPERATOR') {
        resolvedName = recovered;
      }
    }

    const officialResults = await this.getParticipantOfficialResults(enroll);
    const r1 = officialResults[1];
    const r2 = officialResults[2];
    const r3 = officialResults[3];

    const g1Score = r1 ? r1.score : 0;
    const g2Score = r2 ? r2.score : 0;
    const g3Score = r3 ? r3.score : 0;

    const g1Time = r1 ? r1.completion_time_ms : 0;
    const g2Time = r2 ? r2.completion_time_ms : 0;
    const g3Time = r3 ? r3.completion_time_ms : 0;

    const g1Streak = r1 ? (r1.best_streak || r1.streak_count || 0) : 0;
    const g2Streak = r2 ? (r2.best_streak || r2.streak_count || 0) : 0;
    const g3Streak = r3 ? (r3.best_streak || r3.streak_count || 0) : 0;

    const completedRounds = [r1, r2, r3].filter(Boolean).length;
    const totalScore = g1Score + g2Score + g3Score;
    const averageScore = Number((totalScore / 3.0).toFixed(2));
    const totalTimeMs = g1Time + g2Time + g3Time;
    const combinedStreak = g1Streak + g2Streak + g3Streak;

    let status = 'REGISTERED';
    if (completedRounds === 3) status = 'COMPLETED (3/3)';
    else if (completedRounds > 0) status = `IN PROGRESS (${completedRounds}/3)`;

    const finalRecord = {
      enrollment_number: enroll,
      full_name: resolvedName || 'OPERATOR',
      game1_score: g1Score,
      game2_score: g2Score,
      game3_score: g3Score,
      total_score: totalScore,
      average_score: averageScore,
      game1_time_ms: g1Time,
      game2_time_ms: g2Time,
      game3_time_ms: g3Time,
      total_time_ms: totalTimeMs,
      game1_streak: g1Streak,
      game2_streak: g2Streak,
      game3_streak: g3Streak,
      combined_streak: combinedStreak,
      rounds_completed: completedRounds,
      status: status,
      last_completed_at: new Date().toISOString()
    };

    if (this.isCloudConnected) {
      try {
        // Protect against overwriting existing non-OPERATOR name with 'OPERATOR'
        if (!resolvedName || resolvedName === 'OPERATOR') {
          const { data: existing } = await this.client
            .from('final_scores')
            .select('full_name')
            .eq('enrollment_number', enroll)
            .maybeSingle();
          if (existing && existing.full_name && existing.full_name !== 'OPERATOR') {
            resolvedName = existing.full_name;
            finalRecord.full_name = existing.full_name;
          }
        }

        await this.client
          .from('final_scores')
          .upsert(finalRecord, { onConflict: 'enrollment_number' });
      } catch (err) {
        console.warn('[SupabaseService] Cloud final_scores sync warning:', err);
      }
    }

    // Mirror to local final_scores list
    const localFinals = this._getLocalList(STORAGE_FINAL);
    const existingIdx = localFinals.findIndex(f => f.enrollment_number === enroll);
    if (existingIdx >= 0) {
      localFinals[existingIdx] = { ...localFinals[existingIdx], ...finalRecord };
    } else {
      localFinals.push({ id: this.generateUUID(), ...finalRecord, created_at: new Date().toISOString() });
    }
    this._saveLocalList(STORAGE_FINAL, localFinals);
  }

  // --- 5. ADMIN RE-LOGIN & REPLAY AUTHORIZATION (Table 5: admin_relogin) ---
  async authorizePracticeReplay(participantIdOrEnroll, roundNumber, passphrase, reason = 'Administrator practice grant') {
    if (passphrase !== ADMIN_PASSPHRASE) {
      return { success: false, error: 'Invalid Administrator Key. Access Denied.' };
    }

    const enroll = this.normalizeEnrollment(participantIdOrEnroll);
    const authRecord = {
      id: this.generateUUID(),
      enrollment_number: enroll,
      admin_key: passphrase,
      round_number: roundNumber || null,
      action_type: 'replay',
      status: 'pending',
      reason: reason || 'Authorized Practice Replay',
      authorized_at: new Date().toISOString()
    };

    if (this.isCloudConnected) {
      try {
        const { error } = await this.client
          .from('admin_relogin')
          .insert(authRecord);

        if (!error) {
          const list = this._getLocalList(STORAGE_ADMIN_RELOGIN);
          list.push(authRecord);
          this._saveLocalList(STORAGE_ADMIN_RELOGIN, list);
          return { success: true, cloudSynced: true };
        }
      } catch (err) {
        console.warn('[SupabaseService] Cloud admin_relogin insert error:', err);
      }
    }

    const list = this._getLocalList(STORAGE_ADMIN_RELOGIN);
    list.push(authRecord);
    this._saveLocalList(STORAGE_ADMIN_RELOGIN, list);
    return { success: true, cloudSynced: false };
  }

  async authorizeAdminRelogin(participantIdOrEnroll, passphrase, reason = 'Administrator re-login grant') {
    if (passphrase !== ADMIN_PASSPHRASE) {
      return { success: false, error: 'Invalid Administrator Key. Access Denied.' };
    }

    const enroll = this.normalizeEnrollment(participantIdOrEnroll);
    const record = {
      id: this.generateUUID(),
      enrollment_number: enroll,
      admin_key: passphrase,
      round_number: null,
      action_type: 'relogin',
      status: 'consumed',
      reason: reason || 'Admin re-login authorization',
      authorized_at: new Date().toISOString()
    };

    if (this.isCloudConnected) {
      try {
        await this.client.from('admin_relogin').insert(record);
      } catch (_) {}
    }

    const list = this._getLocalList(STORAGE_ADMIN_RELOGIN);
    list.push(record);
    this._saveLocalList(STORAGE_ADMIN_RELOGIN, list);
    return { success: true };
  }

  async consumeReplayAuthorization(participantIdOrEnroll, roundNumber) {
    const enroll = this.normalizeEnrollment(participantIdOrEnroll);
    if (!enroll) return;

    if (this.isCloudConnected) {
      try {
        await this.client
          .from('admin_relogin')
          .update({
            status: 'consumed',
            consumed_at: new Date().toISOString()
          })
          .eq('enrollment_number', enroll)
          .or(`round_number.eq.${roundNumber},round_number.is.null`)
          .eq('status', 'pending');
      } catch (_) {}
    }

    const list = this._getLocalList(STORAGE_ADMIN_RELOGIN);
    list.forEach(r => {
      if (r.enrollment_number === enroll &&
         (r.round_number === roundNumber || r.round_number === null) &&
         r.status === 'pending') {
        r.status = 'consumed';
        r.consumed_at = new Date().toISOString();
      }
    });
    this._saveLocalList(STORAGE_ADMIN_RELOGIN, list);
  }

  // --- 6. CENTRAL LEADERBOARD (Queried directly from Table 4: final_scores) ---
  async getLeaderboard() {
    let rows = [];

    // Attempt direct read from Table 4: final_scores
    if (this.isCloudConnected) {
      try {
        const { data, error } = await this.client
          .from('final_scores')
          .select('*');

        if (!error && Array.isArray(data) && data.length > 0) {
          rows = data.map(r => this._mapFinalScoreToLeaderboardRow(r));
        }
      } catch (err) {
        console.warn('[SupabaseService] Cloud leaderboard read failed, falling back:', err);
      }
    }

    // Fallback to local storage Table 4 mirror
    if (rows.length === 0) {
      const localFinals = this._getLocalList(STORAGE_FINAL);
      rows = localFinals.map(r => this._mapFinalScoreToLeaderboardRow(r));
    }

    return this._sortLeaderboard(rows);
  }

  _mapFinalScoreToLeaderboardRow(r) {
    const r1 = r.game1_score !== undefined && r.game1_score !== null ? r.game1_score : null;
    const r2 = r.game2_score !== undefined && r.game2_score !== null ? r.game2_score : null;
    const r3 = r.game3_score !== undefined && r.game3_score !== null ? r.game3_score : null;

    const completed = r.rounds_completed || [r1, r2, r3].filter(s => s !== null && s > 0).length;

    return {
      participant_id: r.id || r.enrollment_number,
      full_name: r.full_name,
      round_1_score: r1,
      round_2_score: r2,
      round_3_score: r3,
      total_raw_score: r.total_score || (Number(r1 || 0) + Number(r2 || 0) + Number(r3 || 0)),
      average_score: Number(r.average_score || 0),
      round_1_time_ms: r.game1_time_ms || 0,
      round_2_time_ms: r.game2_time_ms || 0,
      round_3_time_ms: r.game3_time_ms || 0,
      total_completion_time_ms: r.total_time_ms || 0,
      round_1_streak: r.game1_streak || 0,
      round_2_streak: r.game2_streak || 0,
      round_3_streak: r.game3_streak || 0,
      combined_streak: r.combined_streak || 0,
      completed_rounds_count: completed,
      completion_status: r.status || (completed === 3 ? 'COMPLETED (3/3)' : `IN PROGRESS (${completed}/3)`),
      last_completed_at: r.last_completed_at || r.created_at || new Date().toISOString()
    };
  }

  // Sort strictly using Techverse rules:
  // 1. Full completions (3/3) prioritized over in-progress
  // 2. Priority 1: Total Max Score (Sum of all 3 rounds) (descending)
  // 3. Priority 2: Total Duration / Time (ascending - less time is better)
  // 4. Priority 3: Max Streak / Combined Streak for conflict resolution (descending)
  // 5. Priority 4: Earlier verified completion timestamp (ascending)
  _sortLeaderboard(rows) {
    // Exclude participants with 0 rounds played
    const activeRows = rows.filter(r => (r.completed_rounds_count || 0) > 0 || (r.total_raw_score || 0) > 0);

    const sorted = [...activeRows].sort((a, b) => {
      const aDone = a.completed_rounds_count === 3 ? 1 : 0;
      const bDone = b.completed_rounds_count === 3 ? 1 : 0;
      if (aDone !== bDone) return bDone - aDone;

      // Priority 1: Total Max Score (Sum of all 3 rounds) (descending)
      const aTotal = Number(a.total_raw_score !== undefined ? a.total_raw_score : ((a.round_1_score || 0) + (a.round_2_score || 0) + (a.round_3_score || 0)));
      const bTotal = Number(b.total_raw_score !== undefined ? b.total_raw_score : ((b.round_1_score || 0) + (b.round_2_score || 0) + (b.round_3_score || 0)));
      if (aTotal !== bTotal) return bTotal - aTotal;

      // Priority 2: Total Completion Time (ascending - less time is better)
      const aTime = Number(a.total_completion_time_ms || 0);
      const bTime = Number(b.total_completion_time_ms || 0);
      if (aTime !== bTime) return aTime - bTime;

      // Priority 3: Max Streak / Combined Streak for conflict resolution (descending)
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
