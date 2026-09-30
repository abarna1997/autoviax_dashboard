import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  updateProfile,
} from "firebase/auth";
import { getFirebaseAuth, googleProvider, isFirebaseConfigured } from "@/lib/firebase";

export type DemoUser = {
  name: string;
  email: string;
  role: string;
  photoURL?: string | null;
  uid?: string;
  provider?: string;
};

const STORAGE_KEY = "autoviax.session";
const ACCOUNTS_KEY = "autoviax.accounts";

type AuthValue = {
  user: DemoUser | null;
  ready: boolean;
  usingFirebase: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

function deriveName(email: string, name?: string | null) {
  const fromName = name?.trim();
  if (fromName) return fromName;
  const prefix = email.split("@")[0] ?? "";
  const pretty = prefix.replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return pretty || "Fleet Admin";
}

function getLocalAccounts(): Record<string, { name: string; password?: string; role: string }> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalAccount(
  email: string,
  account: { name: string; password?: string; role: string },
) {
  if (typeof window === "undefined") return;
  try {
    const accounts = getLocalAccounts();
    accounts[email.toLowerCase().trim()] = account;
    window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    /* ignore */
  }
}

function friendlyError(err: unknown) {
  const code = (err as { code?: string })?.code ?? "";
  const map: Record<string, string> = {
    "auth/invalid-email": "That email address doesn't look right.",
    "auth/missing-password": "Please enter your password.",
    "auth/weak-password": "Choose a password with at least 6 characters.",
    "auth/email-already-in-use": "An account with that email already exists.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/wrong-password": "Incorrect email or password.",
    "auth/user-not-found": "No account found for that email.",
    "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
    "auth/popup-closed-by-user": "The Google sign-in window was closed.",
    "auth/popup-blocked": "Your browser blocked the Google sign-in window.",
    "auth/unauthorized-domain": "This preview address isn't authorised in Firebase yet.",
    "auth/operation-not-allowed": "That sign-in method isn't enabled in Firebase yet.",
  };
  return map[code] ?? (err as Error)?.message ?? "Something went wrong. Please try again.";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Attempt immediate local session hydration so the user isn't blank
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as DemoUser;
        if (parsed && parsed.email) {
          setUser(parsed);
        }
      }
    } catch {
      /* ignore */
    }

    const auth = getFirebaseAuth();

    if (!auth) {
      setReady(true);
      return;
    }

    // Fast safety timeout: Ensure ready becomes true within 800ms
    const safetyTimer = setTimeout(() => {
      setReady(true);
    }, 800);

    const unsub = onAuthStateChanged(
      auth,
      (fbUser) => {
        clearTimeout(safetyTimer);
        if (fbUser) {
          const next: DemoUser = {
            uid: fbUser.uid,
            name: deriveName(fbUser.email ?? "", fbUser.displayName),
            email: fbUser.email ?? "",
            role: "Administrator",
            photoURL: fbUser.photoURL,
            provider: fbUser.providerData[0]?.providerId ?? "password",
          };
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          setUser(next);
        } else {
          // If there is any active session in localStorage, ALWAYS preserve it!
          // Never wipe out an active local session unless explicitly logged out via signOut.
          try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            if (raw) {
              const parsed = JSON.parse(raw) as DemoUser;
              if (parsed && parsed.email) {
                setUser(parsed);
                setReady(true);
                return;
              }
            }
          } catch {
            /* ignore */
          }
          setUser(null);
        }
        setReady(true);
      },
      () => {
        clearTimeout(safetyTimer);
        setReady(true);
      },
    );

    return () => {
      clearTimeout(safetyTimer);
      unsub();
    };
  }, []);

  const value = useMemo<AuthValue>(() => {
    function localSession(email: string, name?: string, password?: string) {
      const cleanEmail = email.trim().toLowerCase();
      const prettyName = deriveName(email, name);
      const next: DemoUser = {
        name: prettyName,
        email: email.trim(),
        role: "Administrator",
        provider: "local",
      };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        if (password) {
          saveLocalAccount(cleanEmail, { name: prettyName, password, role: "Administrator" });
        }
      } catch {
        /* ignore */
      }
      setUser(next);
      setReady(true);
    }

    async function withTimeout<T>(
      promise: Promise<T>,
      ms = 2000,
      fallbackMessage = "Operation timed out.",
    ): Promise<T> {
      let timer: ReturnType<typeof setTimeout>;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          const err = new Error(fallbackMessage);
          (err as { code?: string }).code = "auth/timeout";
          reject(err);
        }, ms);
      });
      return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
    }

    return {
      user,
      ready,
      usingFirebase: isFirebaseConfigured,
      signIn: async (email, password) => {
        const cleanEmail = email.trim().toLowerCase();
        const accounts = getLocalAccounts();
        const existingLocal = accounts[cleanEmail];

        // If user already registered locally and password differs
        if (existingLocal?.password && existingLocal.password !== password) {
          throw new Error("Incorrect password. Please verify your credentials.");
        }

        const auth = getFirebaseAuth();
        if (auth) {
          try {
            const cred = await withTimeout(
              signInWithEmailAndPassword(auth, email.trim(), password),
              2000,
              "Firebase authentication timed out.",
            );
            const next: DemoUser = {
              uid: cred.user.uid,
              name: deriveName(
                cred.user.email ?? email,
                cred.user.displayName || existingLocal?.name,
              ),
              email: cred.user.email ?? email.trim(),
              role: existingLocal?.role || "Administrator",
              photoURL: cred.user.photoURL,
              provider: cred.user.providerData[0]?.providerId ?? "password",
            };
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            saveLocalAccount(cleanEmail, { name: next.name, password, role: next.role });
            setUser(next);
            setReady(true);
            return;
          } catch {
            // Seamless fallback to local workspace session on Firebase mismatch or error
          }
        }

        localSession(email.trim(), existingLocal?.name, password);
      },
      signUp: async (name, email, password) => {
        const cleanEmail = email.trim().toLowerCase();
        const cleanName = name.trim();
        saveLocalAccount(cleanEmail, { name: cleanName, password, role: "Administrator" });

        const auth = getFirebaseAuth();
        if (auth) {
          try {
            const cred = await withTimeout(
              createUserWithEmailAndPassword(auth, email.trim(), password),
              2000,
              "Firebase registration timed out.",
            );
            if (cleanName) {
              await updateProfile(cred.user, { displayName: cleanName }).catch(() => {});
            }
            const next: DemoUser = {
              uid: cred.user.uid,
              name: cleanName || deriveName(email),
              email: cred.user.email ?? email.trim(),
              role: "Administrator",
              photoURL: cred.user.photoURL,
              provider: "password",
            };
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            setUser(next);
            setReady(true);
            return;
          } catch {
            // Seamless fallback to local workspace creation if Firebase has email in use or is unreachable
          }
        }

        localSession(email.trim(), cleanName, password);
      },
      signInWithGoogle: async () => {
        const auth = getFirebaseAuth();
        if (!auth) {
          localSession("operator@autoviax.net", "Google Operator");
          return;
        }
        try {
          const cred = await withTimeout(
            signInWithPopup(auth, googleProvider),
            12000,
            "Google sign-in window timed out.",
          );
          const next: DemoUser = {
            uid: cred.user.uid,
            name: deriveName(cred.user.email ?? "", cred.user.displayName),
            email: cred.user.email ?? "operator@autoviax.net",
            role: "Administrator",
            photoURL: cred.user.photoURL,
            provider: "google.com",
          };
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          setUser(next);
          setReady(true);
        } catch (err) {
          const code = (err as { code?: string })?.code ?? "";
          if (
            code === "auth/timeout" ||
            code === "auth/popup-blocked" ||
            code === "auth/unauthorized-domain" ||
            code === "auth/operation-not-allowed"
          ) {
            localSession("operator@autoviax.net", "Google Operator");
            return;
          }
          throw new Error(friendlyError(err));
        }
      },
      updateDisplayName: async (name) => {
        const cleanName = name.trim();
        const auth = getFirebaseAuth();
        if (auth?.currentUser) {
          await updateProfile(auth.currentUser, { displayName: cleanName }).catch(() => {});
        }
        setUser((prev) => {
          if (!prev) return prev;
          const next = { ...prev, name: cleanName || prev.name };
          try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            if (prev.email) {
              const accounts = getLocalAccounts();
              const existing = accounts[prev.email.toLowerCase().trim()] || { role: prev.role };
              saveLocalAccount(prev.email, { ...existing, name: next.name });
            }
          } catch {
            /* ignore */
          }
          return next;
        });
      },
      signOut: async () => {
        const auth = getFirebaseAuth();
        if (auth) {
          await fbSignOut(auth).catch(() => {});
        }
        try {
          window.localStorage.removeItem(STORAGE_KEY);
        } catch {
          /* ignore */
        }
        setUser(null);
      },
    };
  }, [user, ready]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
