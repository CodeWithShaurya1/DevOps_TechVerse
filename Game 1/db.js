/**
 * Database & Leaderboard Abstraction Layer
 * Handles Firebase Realtime Database with graceful offline fallback to localStorage.
 */
(function(window) {
  'use strict';

  const STORAGE_KEY = 'server_sniper_highscores';
  let firebaseInitialized = false;
  let rtdb = null;
  let scoresRef = null;

  // Check if Firebase is properly configured
  function isFirebaseConfigured() {
    if (!window.FIREBASE_CONFIG) return false;
    const cfg = window.FIREBASE_CONFIG;
    if (!cfg.apiKey || cfg.apiKey.includes('YOUR_') || !cfg.databaseURL || cfg.databaseURL.includes('YOUR_')) {
      return false;
    }
    return true;
  }

  // Attempt to initialize Firebase
  function initFirebase() {
    if (firebaseInitialized) return true;
    if (!isFirebaseConfigured()) return false;

    try {
      if (typeof firebase !== 'undefined' && firebase.initializeApp) {
        if (!firebase.apps || firebase.apps.length === 0) {
          firebase.initializeApp(window.FIREBASE_CONFIG);
        }
        rtdb = firebase.database();
        scoresRef = rtdb.ref('scores');
        firebaseInitialized = true;
        console.log('[DB] Firebase Realtime Database connected successfully.');
        return true;
      }
    } catch (e) {
      console.warn('[DB] Firebase initialization failed, falling back to localStorage:', e);
    }
    return false;
  }

  // Local Storage Helpers
  function getLocalLeaderboard() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(list)) return [];
      return list.sort((a, b) => b.score - a.score || a.timestamp - b.timestamp).slice(0, 10);
    } catch (e) {
      console.error('[DB] Failed to read localStorage:', e);
      return [];
    }
  }

  function saveLocalScore(entry) {
    const list = getLocalLeaderboard();
    list.push(entry);
    list.sort((a, b) => b.score - a.score || a.timestamp - b.timestamp);
    const top10 = list.slice(0, 10);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(top10));
      // Dispatch a custom event for same-window listeners
      window.dispatchEvent(new CustomEvent('local-score-updated', { detail: top10 }));
    } catch (e) {
      console.error('[DB] Failed to save to localStorage:', e);
    }
    return top10;
  }

  /**
   * Submit a player score.
   * Will write to Firebase RTDB if available, and always caches in localStorage.
   */
  async function submitScore(entry) {
    const cleanedEntry = {
      handle: (entry.handle || 'ANONYMOUS').trim().slice(0, 12).toUpperCase(),
      score: Math.max(0, Math.min(30000, Math.floor(entry.score || 0))),
      podsSaved: entry.podsSaved || 0,
      mttr: entry.mttr || '0.0s',
      maxCombo: entry.maxCombo || 0,
      timestamp: entry.timestamp || Date.now()
    };

    // Always record locally as fallback & instant responsiveness
    const localTop = saveLocalScore(cleanedEntry);

    const hasFirebase = initFirebase();
    if (hasFirebase && scoresRef) {
      try {
        const newRef = scoresRef.push();
        await newRef.set(cleanedEntry);
        return {
          success: true,
          synced: true,
          message: 'Synced to Firebase Cloud Leaderboard!',
          leaderboard: localTop
        };
      } catch (err) {
        console.warn('[DB] Failed to push to Firebase, fallback used:', err);
        return {
          success: true,
          synced: false,
          message: 'Saved locally (Firebase push error: ' + (err.message || 'network') + ')',
          leaderboard: localTop
        };
      }
    }

    return {
      success: true,
      synced: false,
      message: 'Saved to Local Storage (Firebase not configured)',
      leaderboard: localTop
    };
  }

  /**
   * Watch leaderboard changes in real-time.
   * Triggers callback with (top10Array, isFirebaseLive).
   */
  function watchLeaderboard(callback) {
    let active = true;

    // First deliver immediate local state
    callback(getLocalLeaderboard(), false);

    const hasFirebase = initFirebase();
    if (hasFirebase && scoresRef) {
      try {
        scoresRef.orderByChild('score').limitToLast(10).on('value', (snapshot) => {
          if (!active) return;
          const scores = [];
          snapshot.forEach((child) => {
            scores.push({ id: child.key, ...child.val() });
          });
          // RTDB orders ascending, so reverse for leaderboard
          scores.reverse();
          callback(scores, true);
        }, (error) => {
          console.warn('[DB] Firebase listen error, using local fallback:', error);
          callback(getLocalLeaderboard(), false);
        });
      } catch (err) {
        console.warn('[DB] Error setting up Firebase listener:', err);
      }
    }

    // Also listen to localStorage sync across tabs/windows
    function onStorageChange(e) {
      if (e.key === STORAGE_KEY || e.type === 'local-score-updated') {
        if (!hasFirebase) {
          callback(getLocalLeaderboard(), false);
        }
      }
    }

    window.addEventListener('storage', onStorageChange);
    window.addEventListener('local-score-updated', onStorageChange);

    return function unsubscribe() {
      active = false;
      window.removeEventListener('storage', onStorageChange);
      window.removeEventListener('local-score-updated', onStorageChange);
      if (scoresRef) {
        scoresRef.off();
      }
    };
  }

  function clearLocalLeaderboard() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('local-score-updated', { detail: [] }));
      return true;
    } catch (e) {
      return false;
    }
  }

  // Export to window
  window.ServerSniperDB = {
    submitScore,
    watchLeaderboard,
    getLocalLeaderboard,
    clearLocalLeaderboard,
    isFirebaseConfigured
  };

})(window);

