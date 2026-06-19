"use client";

import { useState, useEffect } from "react";
import {
  auth,
  isFirebaseConfigured,
  googleProvider,
  signInWithPopup,
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

  // Handle redirect result (when returning from Google sign-in via redirect)
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;

    getRedirectResult(auth, browserPopupRedirectResolver)
      .then((result) => {
        if (result) {
          // User signed in via redirect - onAuthStateChanged will update state
          console.log("Redirect sign-in successful:", result.user.displayName);
        }
      })
      .catch((error) => {
        console.error("Redirect sign-in error:", error);
      });
  }, []);

  // Firebase Auth state observer (only active if Firebase is configured)
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const name = user.displayName || user.email?.split("@")[0] || "Học Sinh";
        const email = user.email || "";
        const image = user.photoURL || "";

        setCurrentUser(name);
        setUserEmail(email);
        setUserImage(image);
        setIsLoggedIn(true);

        localStorage.setItem(STORAGE_KEY, name);
        localStorage.setItem(EMAIL_KEY, email);
        localStorage.setItem(IMAGE_KEY, image);
        localStorage.setItem(IS_LOGGED_IN_KEY, "true");
        window.dispatchEvent(new Event("storage"));
      } else {
        // If logged out from Firebase, clear local state if was logged in with Google
        if (localStorage.getItem(IS_LOGGED_IN_KEY) === "true") {
          setCurrentUser("");
          setUserEmail("");
          setUserImage("");
          setIsLoggedIn(false);

          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(EMAIL_KEY);
          localStorage.removeItem(IMAGE_KEY);
          localStorage.removeItem(IS_LOGGED_IN_KEY);
          window.dispatchEvent(new Event("storage"));
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async (mockProfile?: { name: string; email: string; image?: string }) => {
    setIsLoading(true);
    try {
      if (isFirebaseConfigured && auth && googleProvider) {
        // Try signInWithPopup first (preserves user gesture context for browser)
        // If the browser allows the popup, user signs in directly on this page
        try {
          await signInWithPopup(auth, googleProvider, browserPopupRedirectResolver);
          return true;
        } catch (popupError: any) {
          // If popup is blocked, fall back to redirect sign-in
          if (popupError.code === "auth/popup-blocked") {
            console.warn("Popup blocked, falling back to redirect sign-in");
            await signInWithRedirect(auth, googleProvider, browserPopupRedirectResolver);
            // Page will redirect, so we don't return here
            return true;
          }
          // Re-throw other popup errors
          throw popupError;
        }
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
