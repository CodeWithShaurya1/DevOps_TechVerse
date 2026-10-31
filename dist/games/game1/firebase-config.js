/**
 * Firebase Configuration for Server Sniper (Chaos Edition)
 * 
 * Instructions:
 * 1. Go to Firebase Console (https://console.firebase.google.com/)
 * 2. Create a project and create a "Realtime Database" in test mode or with firebase.rules.json
 * 3. Go to Project Settings -> General -> Your Apps -> Add Web App (</>)
 * 4. Copy the firebaseConfig values and paste them below.
 * 
 * If you leave this unconfigured, Server Sniper will seamlessly use
 * localStorage so the game and leaderboard work 100% offline out-of-the-box!
 */
window.FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

