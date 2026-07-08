"use client";

import { useState, useEffect, useCallback } from "react";

export type ScoreRecord = {
  examId: string;
  title: string;
  score: number;
  correct: number;
  total: number;
  date: string;
  resultId: string;
};

export type ScoreHistory = Record<string, Omit<ScoreRecord, "examId">>;

export function useExamHistory(username: string, userEmail?: string) {
  const [history, setHistory] = useState<ScoreRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getStorageKey = useCallback((user: string) => {
    return `exam_scores_${user || "Unknown"}`;
  }, []);

  const loadHistory = useCallback(async () => {
    if (typeof window === "undefined") {
      setHistory([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // If user is authenticated with email, fetch synced history from DB
      if (userEmail && userEmail.trim() !== "") {
        const res = await fetch(`/api/exams/results?email=${encodeURIComponent(userEmail)}`);
        if (res.ok) {
          const dbResults = await res.json();
          const records: ScoreRecord[] = dbResults.map((r: any) => ({
            examId: r.examId,
            title: r.examTitle,
            score: r.score,
            correct: r.correctCount,
            total: r.totalQuestions,
            date: new Date(r.createdAt).toLocaleString("vi-VN"),
            resultId: r.id,
          }));
          setHistory(records);
          setIsLoading(false);
          return;
        }
      }

      // Fallback/Guest: Load from local storage
      if (!username) {
        setHistory([]);
        setIsLoading(false);
        return;
      }

      const key = getStorageKey(username);
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed: ScoreHistory = JSON.parse(raw);
        const records = Object.entries(parsed).map(([examId, value]) => ({
          examId,
          ...value,
        }));
        
        // Sort descending by date
        records.sort((a, b) => {
          const parseDate = (dStr: string) => {
            const parts = dStr.match(/(\d+)\/(\d+)\/(\d+)\s+(\d+):(\d+)/);
            if (parts) {
              return new Date(
                Number(parts[3]),
                Number(parts[2]) - 1,
                Number(parts[1]),
                Number(parts[4]),
                Number(parts[5])
              ).getTime();
            }
            return new Date(dStr).getTime();
          };
          return parseDate(b.date) - parseDate(a.date);
        });
        setHistory(records);
      } else {
        setHistory([]);
      }
    } catch (e) {
      console.error("Failed to parse history", e);
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, [username, userEmail, getStorageKey]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadHistory();
  }, [loadHistory]);

  const saveScore = useCallback(
    async (
      examId: string,
      examTitle: string,
      score: number,
      correct: number,
      total: number,
      resultId: string,
      emailOverride?: string,
      imageOverride?: string
    ) => {
      if (typeof window === "undefined") return;

      const activeEmail = emailOverride || userEmail;

      if (username) {
        try {
          const key = getStorageKey(username);
          const raw = localStorage.getItem(key) || "{}";
          const allScores: ScoreHistory = JSON.parse(raw);

          const now = new Date();
          const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} ${String(
            now.getHours()
          ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

          allScores[examId] = {
            title: examTitle,
            score,
            correct,
            total,
            date: dateStr,
            resultId,
          };

          localStorage.setItem(key, JSON.stringify(allScores));
        } catch (e) {
          console.error("Lỗi khi lưu điểm vào localStorage:", e);
        }
      }

      if (activeEmail) {
        try {
          let timeUsed = 0;
          let duration = 10;
          const detailedRaw = localStorage.getItem(`exam_result_${resultId}`);
          if (detailedRaw) {
            try {
              const detailed = JSON.parse(detailedRaw);
              timeUsed = detailed.timeUsed || 0;
              duration = detailed.duration || 10;
            } catch (e) {}
          }

          await fetch("/api/exams/results", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              examId,
              examTitle,
              score,
              correctCount: correct,
              totalQuestions: total,
              timeUsed,
              duration,
              userName: username || "Khách",
              userEmail: activeEmail,
              userImage: imageOverride || null,
            }),
          });
        } catch (dbErr) {
          console.error("Lỗi khi gửi kết quả thi lên server:", dbErr);
        }
      }

      // Reload state list
      loadHistory();
    },
    [username, userEmail, getStorageKey, loadHistory]
  );

  const deleteScore = useCallback(
    async (resultId: string, examId?: string) => {
      if (typeof window === "undefined") return;

      // 1. Delete from local storage
      if (username) {
        try {
          const key = getStorageKey(username);
          const raw = localStorage.getItem(key) || "{}";
          const allScores: ScoreHistory = JSON.parse(raw);

          let targetExamId = examId;
          if (!targetExamId) {
            targetExamId = Object.entries(allScores).find(
              ([_, v]) => v.resultId === resultId
            )?.[0];
          }

          if (targetExamId && allScores[targetExamId]) {
            delete allScores[targetExamId];
            localStorage.setItem(key, JSON.stringify(allScores));
          }
        } catch (e) {
          console.error("Lỗi khi xóa điểm khỏi localStorage:", e);
        }
      }

      // Remove detailed result payload cache
      localStorage.removeItem(`exam_result_${resultId}`);

      // 2. Delete from DB via API route
      try {
        await fetch(`/api/exams/results?id=${resultId}`, {
          method: "DELETE",
        });
      } catch (dbErr) {
        console.error("Lỗi khi xóa kết quả khỏi database:", dbErr);
      }

      // Refresh list
      loadHistory();
    },
    [username, getStorageKey, loadHistory]
  );

  return {
    history,
    isLoading,
    saveScore,
    deleteScore,
    reloadHistory: loadHistory,
  };
}
