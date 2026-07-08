"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle2, XCircle, HelpCircle as InfoIcon, ZoomIn } from "lucide-react";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { ExamData } from "@/hooks/use-quiz";

type QuestionReviewListProps = {
  examData: ExamData;
  userAnswers: Record<number, any>;
  processedDetails: Array<{
    index: number;
    question: any;
    userAnswerIndex: any;
    isCorrect: boolean;
  }>;
};

export function QuestionReviewList({
  examData,
  userAnswers,
  processedDetails,
}: QuestionReviewListProps) {
  const alphabet = ["A", "B", "C", "D", "E", "F"];

  const cleanImagePath = (imgSrc: string) => {
    if (!imgSrc) return "";
    return imgSrc.replace(/^\.\/public\//, "/");
  };

  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-sm font-extrabold text-zinc-500 tracking-wider uppercase flex items-center gap-1.5 select-none">
        Chi tiết bài làm
      </h3>

      {processedDetails.map((detail, idx) => {
        const q = detail.question;
        const qType = q.type || "multiple_choice";
        const qContent = typeof q.question === "object" ? q.question.content : q.question;
        const qImages = typeof q.question === "object" && q.question.images ? q.question.images : [];
        const isCorrect = detail.isCorrect;
        const ua = detail.userAnswerIndex;

        return (
          <Card 
            key={idx} 
            className={`border rounded-2xl overflow-hidden shadow-sm ${
              isCorrect 
                ? "border-green-200 dark:border-green-950/45" 
                : "border-red-200 dark:border-red-950/45"
            }`}
          >
            {/* Question Item Header */}
            <div 
              className={`flex items-start gap-3 p-4 border-b ${
                isCorrect 
                  ? "bg-green-50/30 dark:bg-green-950/10 border-green-100 dark:border-green-900/20" 
                  : "bg-red-50/30 dark:bg-red-950/10 border-red-100 dark:border-red-900/20"
              }`}
            >
              <div 
                className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-extrabold flex-shrink-0 shadow-sm ${
                  isCorrect 
                    ? "bg-green-500 text-white" 
                    : "bg-red-500 text-white"
                }`}
              >
                {idx + 1}
              </div>
              <div className="flex-1 font-bold text-zinc-900 dark:text-zinc-100 text-sm leading-relaxed pt-0.5 select-text">
                <MarkdownRenderer content={qContent} />
              </div>
              <div className="flex-shrink-0 pt-0.5">
                {isCorrect ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-500" />
                )}
              </div>
            </div>

            {/* Question Item Content */}
            <CardContent className="p-4 space-y-4">
              {/* Images if any */}
              {qImages.length > 0 && (
                <div className="flex flex-wrap gap-4 py-3 bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/60 rounded-xl p-3">
                  {qImages.map((imgSrc: string, imgIdx: number) => {
                    const cleanSrc = cleanImagePath(imgSrc);
                    return (
                      <div key={imgIdx} className="relative group overflow-hidden border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm max-w-full md:max-w-md bg-white transition-all hover:border-orange-500 select-none p-1">
                        <img
                          src={cleanSrc}
                          alt={`Ảnh minh họa`}
                          className="zoomable-image cursor-zoom-in object-contain max-h-[200px] w-full rounded-lg"
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Answers Match details */}
              <div className="text-xs space-y-2.5 font-medium">
                {qType === "short_answer" ? (
                  /* Short Answer details */
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400">Bạn trả lời:</span>
                      <span className={`px-2 py-0.5 rounded-md font-semibold ${isCorrect ? "bg-green-100 text-green-700 dark:bg-green-950/40" : "bg-red-100 text-red-700 dark:bg-red-950/40"}`}>
                        {ua === -1 || ua === "" || ua === undefined ? "(chưa trả lời)" : ua}
                      </span>
                    </div>
                    {!isCorrect && (
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-400">Đáp án đúng:</span>
                        <span className="px-2 py-0.5 rounded-md bg-green-100 text-green-700 dark:bg-green-950/40 font-semibold">
                          {(q.answer || []).join(" / ")}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Choice options match check */
                  <div className="space-y-1.5">
                    <div className="flex items-start gap-2">
                      <span className="text-zinc-400 flex-shrink-0 pt-0.5">Bạn chọn:</span>
                      {ua >= 0 && q.options && q.options[ua] ? (
                        <span className={`flex items-start gap-1 px-2 py-0.5 rounded-md font-semibold ${isCorrect ? "bg-green-100 text-green-700 dark:bg-green-950/40" : "bg-red-100 text-red-700 dark:bg-red-950/40"}`}>
                          <span className="flex-shrink-0">{alphabet[ua]}.</span>
                          <MarkdownRenderer
                            className="[&_p]:m-0"
                            content={typeof q.options[ua] === "object" ? (q.options[ua] as any).content : q.options[ua]}
                          />
                        </span>
                      ) : (
                        <span className="text-zinc-400 italic pt-0.5">(chưa trả lời)</span>
                      )}
                    </div>

                    {!isCorrect && (
                      <div className="flex items-start gap-1">
                        <span className="text-zinc-400 flex-shrink-0 pt-0.5">Đáp án đúng:</span>
                        <div className="flex flex-col gap-1 ml-1.5">
                          {(q.options || []).map((opt: any, optIdx: number) => {
                            const optContent = typeof opt === "object" ? opt.content : opt;
                            const isOptCorrect = (q.answer || []).includes(typeof opt === "object" ? opt.id : String(optIdx));
                            if (!isOptCorrect) return null;
                            return (
                              <span key={optIdx} className="flex items-start gap-1 px-2 py-0.5 rounded-md bg-green-100 text-green-700 dark:bg-green-950/40 font-semibold max-w-max">
                                <span className="flex-shrink-0">{alphabet[optIdx]}.</span>
                                <MarkdownRenderer className="[&_p]:m-0" content={optContent} />
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Explanation if any */}
                {q.explanation && (
                  <div className="mt-3 flex items-start gap-1.5 text-zinc-500 text-[11px] leading-relaxed bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800/60 font-normal select-text">
                    <InfoIcon size={12} className="text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="font-bold text-zinc-600 dark:text-zinc-400">Giải thích: </strong>
                      <MarkdownRenderer className="inline [&_p]:inline [&_p]:m-0" content={q.explanation} />
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
