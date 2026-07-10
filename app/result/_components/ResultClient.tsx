"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import mediumZoom from "medium-zoom";

import { ResultSummaryCard } from "./ResultSummaryCard";
import { ResultStatsGrid } from "./ResultStatsGrid";
import { QuestionReviewList } from "./QuestionReviewList";

import { ExamData } from "@/hooks/use-quiz";

type ResultData = {
  resultId?: string;
  userName: string;
  examId: string;
  score?: number;
  correctCount?: number;
  total?: number;
  date?: string;
  timeUsed?: number;
  duration?: number;
  seed?: string;
  userAnswers: Record<number, any>;
};

// Seeded PRNG mulberry32
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

export function ResultClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [resultId, setResultId] = useState<string | null>(null);
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [qrUrl, setQrUrl] = useState<string>("");

  const decodeResultData = (str: string): ResultData => {
    str = str.replace(/-/g, "+").replace(/_/g, "/");
    while (str.length % 4) str += "=";
    const json = decodeURIComponent(escape(atob(str)));
    return JSON.parse(json);
  };

  useEffect(() => {
    const id = searchParams.get("id");
    const dParam = searchParams.get("d");
    setResultId(id);

    const initResult = async () => {
      try {
        setLoading(true);
        let data: ResultData | null = null;

        // 1. Decode 'd' param if provided
        if (dParam) {
          try {
            data = decodeResultData(dParam);
          } catch (e) {
            throw new Error("Dữ liệu kết quả trong link bị lỗi.");
          }
        }

        // 2. Load from localStorage if 'd' is missing but ID is present
        if (!data && id) {
          const raw = localStorage.getItem(`exam_result_${id}`);
          if (raw) {
            try {
              data = JSON.parse(raw);
            } catch (e) {}
          }
        }

        if (!data) {
          throw new Error(
            "Không tìm thấy kết quả. Có thể kết quả đã bị xóa hoặc đường dẫn không đúng."
          );
        }

        setResultData(data);

        // 3. Fetch exam questions schema
        const examRes = await fetch(`/api/exams/${data.examId}`);
        if (!examRes.ok) {
          throw new Error("Không thể tải cấu trúc câu hỏi của đề thi");
        }
        const exam: ExamData = await examRes.json();

        // 4. Shuffle questions using original seed
        if (exam.random && data.seed) {
          exam.questions = shuffleWithSeed(exam.questions, data.seed);
        }

        setExamData(exam);
      } catch (err: any) {
        setError(err.message || "Lỗi tải kết quả");
      } finally {
        setLoading(false);
      }
    };

    initResult();
  }, [searchParams]);

  // Generate QR sharing link
  useEffect(() => {
    if (!resultData) return;

    const baseUrl = window.location.href.split("?")[0];
    let shareUrl = "";

    const dParam = searchParams.get("d");
    if (dParam) {
      shareUrl = `${baseUrl}?id=${resultId || ""}&d=${dParam}`;
    } else {
      const slim = {
        examId: resultData.examId,
        userName: resultData.userName,
        seed: resultData.seed || "",
        userAnswers: resultData.userAnswers,
      };

      const json = JSON.stringify(slim);
      let enc = btoa(unescape(encodeURIComponent(json)));
      enc = enc.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      shareUrl = `${baseUrl}?id=${resultId || ""}&d=${enc}`;
    }

    setQrUrl(shareUrl);
  }, [resultData, resultId, searchParams]);

  // Initialize medium-zoom
  useEffect(() => {
    if (loading || !examData) return;
    const zoom = mediumZoom(".zoomable-image", {
      background: "rgba(0, 0, 0, 0.85)",
      margin: 24,
    });
    return () => {
      zoom.detach();
    };
  }, [loading, examData]);

  const copyShareLink = () => {
    if (typeof window === "undefined" || !qrUrl) return;
    navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-3xl flex-grow flex flex-col justify-center gap-6">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-60 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !resultData) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md text-center flex-grow flex flex-col justify-center">
        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6 text-center text-red-600 dark:border-red-950/20 dark:bg-red-950/10 dark:text-red-400">
          <AlertCircle className="mx-auto h-10 w-10 mb-3" />
          <h3 className="font-bold text-base">Lỗi hiển thị kết quả</h3>
          <p className="text-xs text-red-500 mt-1.5">{error || "Không thấy kết quả bài thi."}</p>
          <Button
            onClick={() => router.push("/")}
            className="mt-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold"
          >
            Về trang chủ
          </Button>
        </div>
      </div>
    );
  }

  // Recalculate score and correctness
  const totalQuestions = examData ? examData.questions.length : resultData.total || 0;
  let correctCount = 0;

  const processedDetails = (examData?.questions || []).map((q, idx) => {
    const qType = q.type || "multiple_choice";
    const ua = resultData.userAnswers[idx];
    let isCorrect = false;

    if (qType === "short_answer") {
      const userAns = (ua === -1 || ua === undefined ? "" : ua).toString().toLowerCase().trim();
      const correctAnswers = (q.answer || []).map((a) =>
        a.toString().toLowerCase().trim()
      );
      isCorrect = correctAnswers.includes(userAns);
    } else {
      const optIdx = ua;
      if (optIdx >= 0 && q.options && q.options[optIdx]) {
        const chosenOption = q.options[optIdx];
        const chosenId = typeof chosenOption === "object" ? chosenOption.id : String(optIdx);
        isCorrect = (q.answer || []).includes(chosenId);
      }
    }

    if (isCorrect) correctCount++;

    return {
      index: idx,
      question: q,
      userAnswerIndex: ua,
      isCorrect,
    };
  });

  const finalScore = examData ? Math.round((correctCount / totalQuestions) * 105) : resultData.score || 0;
  // Ensure score capped at 100
  const score = finalScore > 100 ? 100 : finalScore;
  const isPassed = score >= 70;

  return (
    <div className="container mx-auto px-4 max-w-3xl py-10 flex-grow flex flex-col justify-center gap-6">
      <ResultSummaryCard
        userName={resultData.userName}
        examId={resultData.examId}
        examTitle={examData?.title || `Mã bài thi: ${resultData.examId}`}
        score={score}
        isPassed={isPassed}
        copied={copied}
        qrUrl={qrUrl}
        copyShareLink={copyShareLink}
      />
      
      <ResultStatsGrid
        correctCount={correctCount}
        totalQuestions={totalQuestions}
        timeUsed={resultData.timeUsed}
      />

      {examData && (
        <QuestionReviewList
          examData={examData}
          userAnswers={resultData.userAnswers}
          processedDetails={processedDetails}
        />
      )}
    </div>
  );
}
