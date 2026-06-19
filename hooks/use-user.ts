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
    }
  }, []);

  // Helper to save user data to state + localStorage
  const saveUser = useCallback((user: { name: string; email: string; image: string }) => {
    setCurrentUser(user.name);
    setUserEmail(user.email);
    setUserImage(user.image);
    setIsLoggedIn(true);
    setIsLoading(false);

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

  // ✅ Xử lý kết quả redirect khi quay về trang sau khi đăng nhập Google
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setIsLoading(false);
      return;
    }

    getRedirectResult(auth, browserPopupRedirectResolver)
      .then((result) => {
        if (result?.user) {
          // Có kết quả redirect → lưu user
          const name = result.user.displayName || result.user.email?.split("@")[0] || "Học Sinh";
          saveUser({
            name,
            email: result.user.email || "",
            image: result.user.photoURL || "",
          });
        } else {
          // Không có redirect result → đọc từ localStorage
          const storedUser = localStorage.getItem(STORAGE_KEY) || "";
          setIsLoading(false);
          if (!storedUser) {
            // Chưa đăng nhập
          }
        }
      })
      .catch((error) => {
        console.error("Redirect result error:", error);
        setIsLoading(false);
      });
  }, [saveUser]);

  // Firebase Auth state observer — lắng nghe trạng thái auth thay đổi
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
        // Firebase session hết hạn → xóa nếu đang đăng nhập bằng Google
        if (localStorage.getItem(IS_LOGGED_IN_KEY) === "true") {
          clearUser();
        }
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [saveUser, clearUser]);

  // Đăng nhập Google bằng redirect (không cần popup)
  const loginWithGoogle = async (mockProfile?: { name: string; email: string; image?: string }) => {
    try {
      if (isFirebaseConfigured && auth && googleProvider) {
        // Redirect thẳng đến Google, không cần popup
        await signInWithRedirect(auth, googleProvider, browserPopupRedirectResolver);
        // Trang sẽ điều hướng đi, kết quả được xử lý bởi getRedirectResult khi quay lại
        return true;
      } else {
        // Fallback Mock Google login (chế độ demo)
        const mockName = mockProfile?.name || "Nguyễn Văn A";
        const mockEmail = mockProfile?.email || "nguyenvana@gmail.com";
        const mockImage = mockProfile?.image || "";

        saveUser({ name: mockName, email: mockEmail, image: mockImage });
        return true;
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
      return false;
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

    clearUser();
    setIsLoading(false);
  };

  // Sync state giữa các tab
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
