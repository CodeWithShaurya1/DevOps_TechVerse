# Server Sniper (Chaos Edition)

> **High-octane Kubernetes incident response simulator built for "Club Battle: Techverse".**  
> Test your micro-reaction speeds, operational triage under pressure, and SRE principles.

---

## 🚀 Quick Start (Play in Browser)

1. **Option A (Zero-install):**  
   Simply double-click or open `index.html` in modern web browsers (Chrome, Edge, Firefox, Brave, Safari).
   
2. **Option B (Local Web Server):**  
   Run in this directory:
   ```bash
   python3 -m http.server 8000
   ```
   or (if python on Windows is `python`):
   ```bash
   python -m http.server 8000
   ```
   Then open `http://localhost:8000` in your browser.

3. **Audience Monitor / Secondary Display:**  
   Open `leaderboard.html` on a second monitor, projector, or audience tablet/laptop. It subscribes in real-time to high scores.

---

## 🕹️ Controls & Operations Reference

| Incident / Target | Visual State | Action Protocol | Reward / Impact |
| :--- | :--- | :--- | :--- |
| **High Memory / CPU Spike** | ⚠️ Flashing Yellow Pod | **Hover + Press `S`** OR **Drag Load Balancer** onto pod | **+200 pts** |
| **CrashLoopBackOff (Crash Loop)** | 🔄 Spinning Amber/Orange Pod | **Hover + Press `S`** OR **Drag Load Balancer** (Hotfix replica) | **+200 pts** |
| **Deadlocked / Crashed** | 🔥 Pulsing Red Pod | **Hold Click for 1.5s** (SVG ring fills) | **+500 pts** |
| **Emergency Crash** | 🔥 Pulsing Red Pod | **Double-Click**, type `kill` or `fix` + `Enter` in mini-terminal | **+500 pts** |
| **Autoscaler Power-Up** | ⚡ Button in Action Panel | **Press `A`** or click **Autoscaler** (20s cooldown) | **Clears all yellow pods instantly!** |
| **Ghost Pod (False Alarm)** | 👻 Cyan Dashed Pod | **DO NOT TOUCH** (auto-expires in ~2.5s) | **-150 pts penalty** if clicked / scaled |
| **Wrong-Action Misfire** | Any Pod | Pressing `S` or dropping Load Balancer on non-yellow pod | **-25 pts penalty** (stops key mashing) |
| **Pause / Resume** | Keyboard Shortcut | Press `P` or `Escape` | Pauses/Resumes simulation |

---

## ⏱️ Rules & Chaos Events

- **Round Duration:** Exactly 60 seconds.
- **Cluster Health:** Starts at 100%.
  - Every active Red pod drains **5% system health per second** (calculated on a 100ms tick interval).
  - Reaching **0% health** triggers an instant Infrastructure Collapse (Game Over).
- **T-45s ("Traffic Spike"):** 6 random healthy pods instantly transition to Warning (Yellow).
- **T-20s ("Chaos Monkey"):** 8 random pods abruptly crash directly to Critical (Red)! Screen shake animation activates and audio alarm sirens play.

---

## 🏆 Scoring Formula

$$\text{Total Score} = \text{Action Points} + \text{Uptime Bonus} - \text{Health Penalty}$$

- **Warning Pod Remediated:** `+200` points
- **Critical Pod Rebooted:** `+500` points
- **2x Combo Multiplier:** Remediating 3 pods in under 2.0 seconds unlocks a **2x Multiplier for 5.0 seconds** (with custom fanfare audio & glowing banner).
- **SLA Uptime Bonus:** `+50` points per second while System Health remains $\ge 80\%$.
- **Downtime Penalty:** `-100` points deducted per second while System Health stays $< 30\%$.

---

## 🔥 Firebase Realtime Database Setup

Server Sniper is designed to run completely offline out-of-the-box (using automatic `localStorage` synchronization across tabs and sessions). To connect a live, multi-device cloud database:

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a project.
2. In the left menu, select **Build** → **Realtime Database** → **Create Database**.
3. Select your preferred database location and click **Next**.
4. Go to the **Rules** tab, paste the contents of `firebase.rules.json`:
   ```json
   {
     "rules": {
       "scores": {
         ".read": true,
         ".indexOn": ["score"],
         "$score_id": {
           ".write": "!data.exists() && newData.exists()",
           ".validate": "newData.hasChildren(['handle', 'score', 'timestamp']) &&
                         newData.child('handle').isString() &&
                         newData.child('handle').val().length >= 2 &&
                         newData.child('handle').val().length <= 12 &&
                         newData.child('score').isNumber() &&
                         newData.child('score').val() >= 0 &&
                         newData.child('score').val() <= 30000 &&
                         newData.child('timestamp').isNumber()"
         }
       }
     }
   }
   ```
5. Click **Publish**.
6. Go to **Project Settings** (gear icon) → **General** → **Your apps** → Click Web (`</>`) to register your web app.
7. Copy the `firebaseConfig` keys into `firebase-config.js`:
   ```javascript
   window.FIREBASE_CONFIG = {
     apiKey: "AIzaSy...",
     authDomain: "your-project.firebaseapp.com",
     databaseURL: "https://your-project-default-rtdb.firebaseio.com",
     projectId: "your-project",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```
8. Reload `index.html` and `leaderboard.html`. The leaderboard status beacon will turn **FIREBASE CLOUD LIVE**!

---

## 📁 Project Architecture

- **`index.html`**: Primary Player Display (Kubernetes 6x6 arena, health HUD, action panel, mini-terminal modal, event log, result report).
- **`style.css`**: Cyberpunk dark terminal aesthetic, responsive CSS Grid layout, animations (shake, pulses, progress rings).
- **`game.js`**: Core game engine (100ms tick loop, Web Audio synthesizer, event scheduler, combo engine, input pipeline).
- **`db.js`**: Universal score & leaderboard database abstraction with Firebase Realtime Database and offline `localStorage` fallback.
- **`firebase-config.js`**: User configuration file for cloud database credentials.
- **`firebase.rules.json`**: Production security rules restricting unauthorized mutations.
- **`leaderboard.html`**: Secondary full-screen spectator/audience display with live real-time score feeds.

