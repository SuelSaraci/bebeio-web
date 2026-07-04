import { useCallback, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth } from "../lib/firebase";

export interface AuthUser {
  email: string;
  name: string;
  uid: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        setUser({
          email: fbUser.email || "",
          name:
            fbUser.displayName ||
            fbUser.email?.split("@")[0] ||
            "Parent",
          uid: fbUser.uid,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      return { success: true as const, user: cred.user };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to sign in.";
      return { success: false as const, error: message };
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      return { success: true as const, user: cred.user };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to create account.";
      return { success: false as const, error: message };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const cred = await signInWithPopup(auth, new GoogleAuthProvider());
      return { success: true as const, user: cred.user };
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to sign in with Google.";
      return { success: false as const, error: message };
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return { user, firebaseUser, loading, login, signup, loginWithGoogle, logout };
}
