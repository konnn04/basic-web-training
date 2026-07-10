"use client";

import { useState, useEffect, useCallback } from "react";

export type PracticeHistoryRecord = {
  id: string;
  mode: string;
  setId: string;
  setTitle: string;
  questionId: string;
  questionTitle: string;
  points: number;
  createdAt: string;
};

export function usePracticeHistory(userEmail?: string) {
  const [history, setHistory] = useState<PracticeHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadHistory = useCallback(async () => {
    if (!userEmail || userEmail.trim() === "") {
      setHistory([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`/api/practice/results?email=${encodeURIComponent(userEmail)}`);
      if (res.ok) {
        const records: PracticeHistoryRecord[] = await res.json();
        setHistory(records);
      } else {
        setHistory([]);
      }
    } catch (e) {
      console.error("Failed to load practice history", e);
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadHistory();
  }, [loadHistory]);

  const deleteEntry = useCallback(
    async (id: string) => {
      try {
        await fetch(`/api/practice/results?id=${id}`, { method: "DELETE" });
      } catch (err) {
        console.error("Lỗi khi xóa kết quả thực hành:", err);
      }
      loadHistory();
    },
    [loadHistory]
  );

  const deleteAll = useCallback(async () => {
    if (!userEmail) return;
    try {
      await fetch(`/api/practice/results?email=${encodeURIComponent(userEmail)}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Lỗi khi xóa toàn bộ lịch sử thực hành:", err);
    }
    loadHistory();
  }, [userEmail, loadHistory]);

  return {
    history,
    isLoading,
    deleteEntry,
    deleteAll,
    reloadHistory: loadHistory,
  };
}
