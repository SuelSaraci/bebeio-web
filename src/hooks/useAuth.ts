import { useCallback, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  type AuthError,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth } from "../lib/firebase";

function mapAuthError(error: unknown, fallback: string): string {
  const code = (error as AuthError)?.code;
  if (code === "auth/unauthorized-domain") {
    return "This website domain is not authorized in Firebase. Add it under Authentication → Settings → Authorized domains.";
  }
  if (code === "auth/internal-error") {
    return "Firebase sign-in failed. Add this site URL to Firebase Authorized domains and Google OAuth origins, then try again.";
  }
  if (code === "auth/popup-blocked") {
    return "Sign-in popup was blocked. Allow popups for this site and try again.";
  }
  if (code === "auth/popup-closed-by-user") {
    return "Sign-in was cancelled.";
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

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
      return { success: false as const, error: mapAuthError(error, "Failed to sign in.") };
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      return { success: true as const, user: cred.user };
    } catch (error: unknown) {
      return {
        success: false as const,
        error: mapAuthError(error, "Failed to create account."),
      };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const cred = await signInWithPopup(auth, new GoogleAuthProvider());
      return { success: true as const, user: cred.user };
    } catch (error: unknown) {
      return {
        success: false as const,
        error: mapAuthError(error, "Failed to sign in with Google."),
      };
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return { user, firebaseUser, loading, login, signup, loginWithGoogle, logout };
}
