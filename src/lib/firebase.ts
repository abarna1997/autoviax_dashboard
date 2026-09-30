import { getApp, getApps, initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth, type Auth } from "firebase/auth";

/**
 * Firebase web configuration.
 * Provided by user for autoviax1.
 */
const FIREBASE_API_KEY =
  (import.meta.env["VITE_FIREBASE_API_KEY"] as string | undefined)?.trim() ||
  "AIzaSyC0uTzX6d7dvGD1mq1tPUZUPeFT-8SrbuY";

export const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: "autoviax1.firebaseapp.com",
  projectId: "autoviax1",
  storageBucket: "autoviax1.firebasestorage.app",
  messagingSenderId: "735604607508",
  appId: "1:735604607508:web:96f4f35e2cbfcc6f15f501",
  measurementId: "G-X2DFJRM00W",
};

/** True once a real API key is present */
export const isFirebaseConfigured = FIREBASE_API_KEY.length > 0;

export function getFirebaseApp() {
  if (typeof window === "undefined") return null;
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export function getFirebaseAuth(): Auth | null {
  if (typeof window === "undefined") return null;
  const app = getFirebaseApp();
  return app ? getAuth(app) : null;
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
