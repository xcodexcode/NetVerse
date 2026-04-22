"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile
} from "firebase/auth";

import { getFirebaseClientAuth, isFirebaseConfigured } from "@/lib/firebase/client";
import { ensureUserProfile } from "@/lib/firebase/firestore";
import { removeLocalStorage, writeLocalStorage, readLocalStorage } from "@/lib/utils/local-storage";
import type { AuthUser } from "@/types/auth";

const LOCAL_SESSION_KEY = "netverse.local.session";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isDemoMode: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (displayName: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function toLocalUid(email: string) {
  return `local-${email.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function makeLocalUser(email: string, displayName?: string): AuthUser {
  return {
    uid: toLocalUid(email),
    email,
    displayName: displayName ?? email.split("@")[0] ?? "Engineer",
    provider: "local"
  };
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      const session = readLocalStorage<AuthUser | null>(LOCAL_SESSION_KEY, null);
      setUser(session);
      setIsLoading(false);
      return;
    }

    const auth = getFirebaseClientAuth();
    if (!auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser || !firebaseUser.email) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const nextUser: AuthUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName ?? firebaseUser.email.split("@")[0] ?? "Engineer",
        provider: "firebase"
      };

      setUser(nextUser);
      await ensureUserProfile(nextUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isDemoMode: !isFirebaseConfigured,
      signIn: async (email, password) => {
        if (!isFirebaseConfigured) {
          const nextUser = makeLocalUser(email);
          setUser(nextUser);
          writeLocalStorage(LOCAL_SESSION_KEY, nextUser);
          await ensureUserProfile(nextUser);
          return;
        }

        const auth = getFirebaseClientAuth();
        if (!auth) {
          throw new Error("Firebase authentication is not configured.");
        }

        const result = await signInWithEmailAndPassword(auth, email, password);
        const displayName = result.user.displayName ?? result.user.email?.split("@")[0] ?? "Engineer";
        const nextUser: AuthUser = {
          uid: result.user.uid,
          email: result.user.email ?? email,
          displayName,
          provider: "firebase"
        };
        setUser(nextUser);
        await ensureUserProfile(nextUser);
      },
      signUp: async (displayName, email, password) => {
        if (!isFirebaseConfigured) {
          const nextUser = makeLocalUser(email, displayName);
          setUser(nextUser);
          writeLocalStorage(LOCAL_SESSION_KEY, nextUser);
          await ensureUserProfile(nextUser);
          return;
        }

        const auth = getFirebaseClientAuth();
        if (!auth) {
          throw new Error("Firebase authentication is not configured.");
        }

        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName });

        const nextUser: AuthUser = {
          uid: result.user.uid,
          email: result.user.email ?? email,
          displayName,
          provider: "firebase"
        };
        setUser(nextUser);
        await ensureUserProfile(nextUser);
      },
      signOut: async () => {
        if (!isFirebaseConfigured) {
          setUser(null);
          removeLocalStorage(LOCAL_SESSION_KEY);
          return;
        }

        const auth = getFirebaseClientAuth();
        if (!auth) {
          return;
        }

        await firebaseSignOut(auth);
        setUser(null);
      },
      getIdToken: async () => {
        if (!isFirebaseConfigured) {
          return null;
        }

        const auth = getFirebaseClientAuth();
        const currentUser = auth?.currentUser;
        return currentUser ? currentUser.getIdToken() : null;
      }
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider.");
  }

  return context;
}
