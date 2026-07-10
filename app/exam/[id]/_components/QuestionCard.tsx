"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { QuestionData } from "@/hooks/use-quiz";

type QuestionCardProps = {
  question: QuestionData;
  currentIndex: number;
  userAnswers: Record<number, any>;
  selectAnswer: (questionIndex: number, optionIndex: number) => void;
  setShortAnswer: (questionIndex: number, value: string) => void;
};

export function QuestionCard({
  question,
  currentIndex,
  userAnswers,
  selectAnswer,
  setShortAnswer,
}: QuestionCardProps) {
  const qContent =
    typeof question.question === "object"
      ? question.question.content
      : question.question;

  const qImages =
    typeof question.question === "object" && question.question.images
      ? question.question.images
      : [];

  const cleanImagePath = (imgSrc: string) => {
    if (!imgSrc) return "";
    return imgSrc.replace(/^\.\/public\//, "/");
  };

  const alphabet = ["A", "B", "C", "D", "E", "F"];

  return (
    <Card className="border border-zinc-200/80 bg-white dark:bg-zinc-900 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-md">
      {/* Question Header */}
      <div className="bg-gradient-to-r from-orange-50/50 to-amber-50/50 dark:from-orange-950/10 dark:to-transparent border-b border-zinc-200/60 dark:border-zinc-800/60 p-5 flex items-start gap-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-white font-extrabold text-sm shadow-md shadow-orange-500/10 flex-shrink-0">
          {currentIndex + 1}
        </div>
        <div className="pt-1.5 select-text">
          <MarkdownRenderer
            content={qContent}
            className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 leading-relaxed"
          />
        </div>
      </div>

      {/* Question Body */}
      <CardContent className="p-5 space-y-6">
        {/* Render Images if any */}
        {qImages.length > 0 && (
          <div className="flex flex-wrap gap-4 justify-center py-4 bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/60 rounded-xl p-4">
            {qImages.map((imgSrc, idx) => {
              const cleanSrc = cleanImagePath(imgSrc);
              return (
                <div key={idx} className="relative group overflow-hidden border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-md max-w-full md:max-w-2xl bg-white transition-all hover:border-orange-500 select-none p-1">
                  <img
                    src={cleanSrc}
                    alt={`Ảnh câu hỏi ${currentIndex + 1}`}
                    className="zoomable-image cursor-zoom-in object-contain max-h-[320px] w-full rounded-lg"
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Answers Area */}
        <div className="space-y-3.5">
          {question.type === "short_answer" ? (
            /* Short Answer input */
            <div className="space-y-2">
              <span className="text-xs font-bold text-zinc-400">Nhập câu trả lời của bạn:</span>
              <Textarea
                placeholder="Gõ đáp án ngắn của bạn tại đây (không phân biệt hoa thường)..."
                value={userAnswers[currentIndex] === -1 ? "" : userAnswers[currentIndex] || ""}
                onChange={(e) => setShortAnswer(currentIndex, e.target.value)}
                rows={3}
                className="rounded-xl border-zinc-200 focus-visible:ring-orange-500 font-medium text-sm"
              />
            </div>
          ) : (
            /* Choice Options selection */
            <div className="flex flex-col gap-3">
              {(question.options || []).map((opt: any, optIdx: number) => {
                const isSelected = userAnswers[currentIndex] === optIdx;
                const optContent = typeof opt === "object" ? opt.content : opt;

                return (
                  <button
                    key={optIdx}
                    onClick={() => selectAnswer(currentIndex, optIdx)}
                    className={`w-full flex items-center gap-3.5 p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? "bg-orange-50/80 border-orange-400 text-orange-950 font-semibold dark:bg-orange-950/20 dark:border-orange-800 dark:text-orange-300"
                        : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50/50 hover:border-zinc-300 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800/50"
                    }`}
                  >
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-extrabold transition-all flex-shrink-0 ${
                        isSelected
                          ? "bg-orange-500 border-orange-500 text-white"
                          : "border-zinc-350 text-zinc-500 dark:border-zinc-700"
                      }`}
                    >
                      {alphabet[optIdx]}
                    </div>
                    <span className="text-xs sm:text-sm select-text leading-relaxed">
                      <MarkdownRenderer content={optContent} />
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
