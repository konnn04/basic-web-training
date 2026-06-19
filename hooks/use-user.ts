"use client";

import { useState, useEffect, useCallback } from "react";
import {
  auth,
  isFirebaseConfigured,
  googleProvider,
  signInWithRedirect,
  getRedirectResult,
  browserPopupRedirectResolver,
} from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const STORAGE_KEY = "exam_user_name";
const EMAIL_KEY = "exam_user_email";
const IMAGE_KEY = "exam_user_image";
const IS_LOGGED_IN_KEY = "exam_user_logged_in";

export function useUser() {
  const [currentUser, setCurrentUser] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userImage, setUserImage] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem(STORAGE_KEY) || "";
      const storedEmail = localStorage.getItem(EMAIL_KEY) || "";
      const storedImage = localStorage.getItem(IMAGE_KEY) || "";
      const storedLoggedIn = localStorage.getItem(IS_LOGGED_IN_KEY) === "true";

      setCurrentUser(storedUser);
      setUserEmail(storedEmail);
      setUserImage(storedImage);
      setIsLoggedIn(storedLoggedIn);
      setIsLoading(false);
    }
  }, []);

  // Helper to save user data to state + localStorage
  const saveUser = useCallback((user: { name: string; email: string; image: string }) => {
    setCurrentUser(user.name);
    setUserEmail(user.email);
    setUserImage(user.image);
    setIsLoggedIn(true);

    localStorage.setItem(STORAGE_KEY, user.name);
    localStorage.setItem(EMAIL_KEY, user.email);
    localStorage.setItem(IMAGE_KEY, user.image);
    localStorage.setItem(IS_LOGGED_IN_KEY, "true");
    window.dispatchEvent(new Event("storage"));
  }, []);

  // Helper to clear user data from state + localStorage
  const clearUser = useCallback(() => {
    setCurrentUser("");
    setUserEmail("");
    setUserImage("");
    setIsLoggedIn(false);

    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(EMAIL_KEY);
    localStorage.removeItem(IMAGE_KEY);
    localStorage.removeItem(IS_LOGGED_IN_KEY);
    window.dispatchEvent(new Event("storage"));
  }, []);

  // Handle redirect result (when returning from Google sign-in via redirect)
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;

    getRedirectResult(auth, browserPopupRedirectResolver)
      .then((result) => {
        if (result?.user) {
          const name = result.user.displayName || result.user.email?.split("@")[0] || "Học Sinh";
          saveUser({
            name,
            email: result.user.email || "",
            image: result.user.photoURL || "",
          });
        }
      })
      .catch((error) => {
        console.error("Redirect sign-in error:", error);
      });
  }, [saveUser]);

  // Firebase Auth state observer (only active if Firebase is configured)
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const name = user.displayName || user.email?.split("@")[0] || "Học Sinh";
        saveUser({
          name,
          email: user.email || "",
          image: user.photoURL || "",
        });
      } else {
        // Only clear if was previously logged in with Google
        if (localStorage.getItem(IS_LOGGED_IN_KEY) === "true") {
          clearUser();
        }
      }
    });

    return () => unsubscribe();
  }, [saveUser, clearUser]);

  const loginWithGoogle = async (mockProfile?: { name: string; email: string; image?: string }) => {
    setIsLoading(true);
    try {
      if (isFirebaseConfigured && auth && googleProvider) {
        // Use redirect sign-in directly — more reliable in production
        // (popup is blocked by modern browsers' third-party cookie restrictions)
        await signInWithRedirect(auth, googleProvider, browserPopupRedirectResolver);
        // Page will navigate away; result is handled by getRedirectResult on return
        return true;
      } else {
        // Fallback Mock Google login
        const mockName = mockProfile?.name || "Nguyễn Văn A";
        const mockEmail = mockProfile?.email || "nguyenvana@gmail.com";
        const mockImage = mockProfile?.image || "";

        setCurrentUser(mockName);
        setUserEmail(mockEmail);
        setUserImage(mockImage);
        setIsLoggedIn(true);

        localStorage.setItem(STORAGE_KEY, mockName);
        localStorage.setItem(EMAIL_KEY, mockEmail);
        localStorage.setItem(IMAGE_KEY, mockImage);
        localStorage.setItem(IS_LOGGED_IN_KEY, "true");
        window.dispatchEvent(new Event("storage"));
        return true;
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const saveName = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return false;

    setCurrentUser(trimmed);
    setUserEmail("");
    setUserImage("");
    setIsLoggedIn(false);

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, trimmed);
      localStorage.removeItem(EMAIL_KEY);
      localStorage.removeItem(IMAGE_KEY);
      localStorage.setItem(IS_LOGGED_IN_KEY, "false");
      window.dispatchEvent(new Event("storage"));
    }
    return true;
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        await signOut(auth);
      }
    } catch (error) {
      console.error("Error signing out from Firebase:", error);
    }

    // Always clear local state
    setCurrentUser("");
    setUserEmail("");
    setUserImage("");
    setIsLoggedIn(false);

    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(EMAIL_KEY);
      localStorage.removeItem(IMAGE_KEY);
      localStorage.removeItem(IS_LOGGED_IN_KEY);
      window.dispatchEvent(new Event("storage"));
    }
    setIsLoading(false);
  };

  // Sync state between tabs
  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem(STORAGE_KEY) || "";
      const storedEmail = localStorage.getItem(EMAIL_KEY) || "";
      const storedImage = localStorage.getItem(IMAGE_KEY) || "";
      const storedLoggedIn = localStorage.getItem(IS_LOGGED_IN_KEY) === "true";

      setCurrentUser(storedUser);
      setUserEmail(storedEmail);
      setUserImage(storedImage);
      setIsLoggedIn(storedLoggedIn);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return {
    currentUser,
    userEmail,
    userImage,
    isLoggedIn,
    isLoading,
    loginWithGoogle,
    saveName,
    logout,
  };
}
