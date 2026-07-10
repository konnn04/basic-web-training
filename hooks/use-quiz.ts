"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useConfirm } from "@/hooks/use-confirm";

export type QuestionOption = {
  id: string;
  content: string;
  images?: string[];
};

export type QuestionData = {
  type?: "multiple_choice" | "true_false" | "short_answer";
  question: {
    content: string;
    images?: string[];
  } | string;
  options?: QuestionOption[] | string[];
  answer?: string[];
  explanation?: string;
};

export type ExamData = {
  title: string;
  description?: string;
  duration: number;
  random?: boolean;
  questions: QuestionData[];
};

// Seeded PRNG mulberry32 to match backup/exam/assets/exam.app.js
function seededRandom(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
  }
  let state = h >>> 0;
  return function () {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Fisher-Yates shuffle with seed
function shuffleWithSeed<T>(arr: T[], seedStr: string): T[] {
  const rand = seededRandom(seedStr);
  const result = arr.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

export function useQuiz(examId: string, username: string) {
  const confirm = useConfirm();
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, any>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [totalTime, setTotalTime] = useState<number>(0);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [seed, setSeed] = useState<string>("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch exam data
  useEffect(() => {
    if (!examId) return;

    const fetchExam = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/exams/${examId}`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error(`Không tìm thấy đề thi "${examId}"`);
          }
          throw new Error("Lỗi tải đề thi");
        }
        const data: ExamData = await res.json();
        
        let processedQuestions = [...data.questions];
        let calculatedSeed = "";

        if (data.random) {
          calculatedSeed =
            Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
          processedQuestions = shuffleWithSeed(processedQuestions, calculatedSeed);
        }

        setExamData({
          ...data,
          questions: processedQuestions,
        });
        setSeed(calculatedSeed);
        
        // Initialize answers
        const initialAnswers: Record<number, any> = {};
        processedQuestions.forEach((_, idx) => {
          initialAnswers[idx] = -1; // -1 means unanswered for multiple choice/true_false
        });
        setUserAnswers(initialAnswers);

        // Timer
        const durationSecs = (data.duration || 10) * 60;
        setTimeLeft(durationSecs);
        setTotalTime(durationSecs);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Lỗi tải đề thi");
        setLoading(false);
      }
    };

    fetchExam();
  }, [examId]);

  // Tick countdown timer
  useEffect(() => {
    if (loading || error || quizSubmitted || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, error, quizSubmitted, timeLeft]);

  // Answer handlers
  const selectAnswer = (questionIndex: number, optionIndex: number) => {
    if (quizSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const setShortAnswer = (questionIndex: number, val: string) => {
    if (quizSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: val.trim() !== "" ? val : -1,
    }));
  };

  // Navigations
  const nextQuestion = () => {
    if (examData && currentIndex < examData.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const goToQuestion = (index: number) => {
    if (examData && index >= 0 && index < examData.questions.length) {
      setCurrentIndex(index);
    }
  };

  // Encode result for URL sharing (base64)
  const encodeResultData = (obj: any) => {
    const json = JSON.stringify(obj);
    let b64 = btoa(unescape(encodeURIComponent(json)));
    b64 = b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    return b64;
  };

  const submitQuiz = useCallback(async (isTimeUp = false) => {
    if (quizSubmitted || !examData) return null;

    if (!isTimeUp) {
      const unansweredCount = examData.questions.reduce((acc, _, idx) => {
        const ans = userAnswers[idx];
        return ans === -1 || ans === "" ? acc + 1 : acc;
      }, 0);

      const confirmMsg =
        unansweredCount > 0
          ? `Bạn còn ${unansweredCount} câu chưa trả lời. Bạn có chắc chắn muốn nộp bài?`
          : "Bạn có chắc chắn muốn nộp bài?";

      const isConfirmed = await confirm({
        title: "Nộp bài kiểm tra",
        message: confirmMsg,
        confirmText: "Nộp bài",
        cancelText: "Hủy",
        variant: "orange",
      });

      if (!isConfirmed) {
        return null;
      }
    }

    setQuizSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);

    // Calculate score
    let correctCount = 0;
    const total = examData.questions.length;

    examData.questions.forEach((q, i) => {
      const qType = q.type || "multiple_choice";
      let isCorrect = false;
      const ua = userAnswers[i];

      if (qType === "short_answer") {
        const userAns = (ua === -1 || ua === undefined ? "" : ua).toString().toLowerCase().trim();
        const correctAnswers = (q.answer || []).map((a) =>
          a.toString().toLowerCase().trim()
        );
        isCorrect = correctAnswers.includes(userAns);
      } else {
        const optIndex = ua;
        if (optIndex >= 0 && q.options && q.options[optIndex]) {
          const chosenOption = q.options[optIndex];
          const chosenId = typeof chosenOption === "object" ? chosenOption.id : String(optIndex);
          isCorrect = (q.answer || []).includes(chosenId);
        }
      }

      if (isCorrect) correctCount++;
    });

    const score = Math.round((correctCount / total) * 100);
    const resultId = `r_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 10)}`;
    const timeUsed = totalTime - timeLeft;

    const resultPayload = {
      resultId,
      userName: username || "Học Sinh",
      examId,
      score,
      correctCount,
      total,
      date: new Date().toISOString(),
      timeUsed,
      duration: examData.duration || 10,
      seed,
      userAnswers,
    };

    // Save detailed result to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(`exam_result_${resultId}`, JSON.stringify(resultPayload));
    }

    // Return URL string encoded data
    const shareData = {
      examId,
      userName: username || "Học Sinh",
      seed,
      userAnswers,
    };
    const encoded = encodeResultData(shareData);

    return {
      resultId,
      encoded,
      score,
      correctCount,
      total,
    };
  }, [quizSubmitted, examData, userAnswers, totalTime, timeLeft, username, examId, seed, confirm]);

  // Answered count calculation
  const answeredCount = examData
    ? examData.questions.reduce((acc, _, idx) => {
        const ans = userAnswers[idx];
        return ans !== -1 && ans !== "" && ans !== undefined ? acc + 1 : acc;
      }, 0)
    : 0;

  return {
    examData,
    loading,
    error,
    currentIndex,
    userAnswers,
    timeLeft,
    totalTime,
    quizSubmitted,
    answeredCount,
    selectAnswer,
    setShortAnswer,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    submitQuiz,
  };
}
