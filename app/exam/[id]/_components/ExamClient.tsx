"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import mediumZoom from "medium-zoom";
import { useUser } from "@/hooks/use-user";
import { useQuiz } from "@/hooks/use-quiz";
import { useExamHistory } from "@/hooks/use-exam-history";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle, LogIn } from "lucide-react";

import { TimerCard } from "./TimerCard";
import { QuestionsMap } from "./QuestionsMap";
import { QuestionCard } from "./QuestionCard";

type ExamClientProps = {
  examId: string;
};

export function ExamClient({ examId }: ExamClientProps) {
  const router = useRouter();
  const { currentUser, userEmail, userImage, isLoggedIn, isLoading: userLoading } = useUser();
  const { saveScore } = useExamHistory(currentUser, userEmail);

  const {
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
  } = useQuiz(examId, currentUser);

  // Redirect to home if user session is loaded but empty (handled by navbar dialog)
  useEffect(() => {
    if (!userLoading && !currentUser) {
      router.push("/");
    }
  }, [currentUser, userLoading, router]);

  // Automatically submit and redirect when time is up
  useEffect(() => {
    if (timeLeft === 0 && !quizSubmitted && examData) {
      const autoSubmit = async () => {
        const res = await submitQuiz(true);
        if (res) {
          saveScore(examId, examData.title, res.score, res.correctCount, res.total, res.resultId, userEmail, userImage);
          router.push(`/result?id=${res.resultId}&d=${res.encoded}`);
        }
      };
      autoSubmit();
    }
  }, [timeLeft, quizSubmitted, examData, examId, router, saveScore, submitQuiz]);

  // Initialize medium-zoom when currentIndex changes
  useEffect(() => {
    if (loading || !examData) return;
    const zoom = mediumZoom(".zoomable-image", {
      background: "rgba(0, 0, 0, 0.85)",
      margin: 24,
    });
    return () => {
      zoom.detach();
    };
  }, [loading, examData, currentIndex]);

  if (loading || userLoading) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-5xl flex-grow flex flex-col justify-center gap-6">
        <Skeleton className="h-10 w-60 rounded-lg" />
        <div className="grid gap-6 md:grid-cols-4">
          <div className="md:col-span-1 space-y-4">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-60 w-full rounded-2xl" />
          </div>
          <div className="md:col-span-3">
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !examData) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md text-center flex-grow flex flex-col justify-center">
        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6 text-center text-red-600 dark:border-red-950/20 dark:bg-red-950/10 dark:text-red-400">
          <AlertCircle className="mx-auto h-10 w-10 mb-3" />
          <h3 className="font-bold text-base">Lỗi phòng thi</h3>
          <p className="text-xs text-red-500 mt-1.5">{error || "Không thể tải bài kiểm tra."}</p>
          <Button
            onClick={() => router.push("/exam")}
            className="mt-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold"
          >
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const handleQuizSubmit = async () => {
    const res = await submitQuiz();
    if (res) {
      // Save result score history
      saveScore(examId, examData.title, res.score, res.correctCount, res.total, res.resultId, userEmail, userImage);
      // Redirect to result page
      router.push(`/result?id=${res.resultId}&d=${res.encoded}`);
    }
  };

  const currentQuestion = examData.questions[currentIndex];

  return (
    <div className="container mx-auto px-4 max-w-5xl py-8 flex-grow flex flex-col justify-center">
      {/* Title Header */}
      <div className="mb-6 pb-4 border-b border-zinc-200/50 dark:border-zinc-800/40">
        <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-950 dark:text-white truncate" title={examData.title}>
          {examData.title}
        </h1>
        <p className="text-xs text-zinc-500 mt-1 truncate">
          Mã bài thi: {examId} • Tổng số {examData.questions.length} câu hỏi • Thời gian {examData.duration} phút
        </p>
      </div>

      {!isLoggedIn && (
        <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-50/60 dark:bg-amber-950/15 p-3.5">
          <LogIn size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs font-bold leading-relaxed text-amber-700 dark:text-amber-400">
            Bạn đang làm bài với tên khách. Đăng nhập bằng Google để điểm của bạn được ghi nhận trên bảng xếp hạng.
          </p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-4 items-start">
        
        {/* SIDEBAR COL */}
        <aside className="md:col-span-1 space-y-4 md:sticky md:top-20">
          <TimerCard timeLeft={timeLeft} totalTime={totalTime} />
          <QuestionsMap
            questionsCount={examData.questions.length}
            currentIndex={currentIndex}
            userAnswers={userAnswers}
            goToQuestion={goToQuestion}
            answeredCount={answeredCount}
          />
        </aside>

        {/* MAIN PANEL COL */}
        <main className="md:col-span-3 space-y-5">
          <QuestionCard
            question={currentQuestion}
            currentIndex={currentIndex}
            userAnswers={userAnswers}
            selectAnswer={selectAnswer}
            setShortAnswer={setShortAnswer}
          />

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              disabled={currentIndex === 0}
              onClick={prevQuestion}
              className="rounded-xl border-zinc-200 text-zinc-600 dark:border-zinc-800 dark:text-zinc-300 gap-1 text-xs font-bold cursor-pointer"
            >
              <ChevronLeft size={16} />
              Câu trước
            </Button>

            <Button
              onClick={handleQuizSubmit}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-md text-xs font-bold gap-1.5 px-6 py-4 cursor-pointer"
            >
              <CheckCircle size={15} />
              Nộp bài
            </Button>

            <Button
              variant="outline"
              disabled={currentIndex === examData.questions.length - 1}
              onClick={nextQuestion}
              className="rounded-xl border-zinc-200 text-zinc-600 dark:border-zinc-800 dark:text-zinc-300 gap-1 text-xs font-bold cursor-pointer"
            >
              Câu sau
              <ChevronRight size={16} />
            </Button>
          </div>
        </main>

      </div>
    </div>
  );
}
