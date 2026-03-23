import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDRzaul1v-QCEfCOlJuMiJjh9284T7WMis",
  authDomain: "cleverly-dashboard.firebaseapp.com",
  projectId: "cleverly-dashboard",
  storageBucket: "cleverly-dashboard.firebasestorage.app",
  messagingSenderId: "70772217709",
  appId: "1:70772217709:web:0803fa81065c28fc5eac64",
  measurementId: "G-N66TJC9T1M"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize Analytics conditionally (Client side only)
const analytics = typeof window !== 'undefined' ? isSupported().then(yes => yes ? getAnalytics(app) : null) : null;

export { app, auth, analytics };
