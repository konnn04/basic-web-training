"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { CheckCircle2, XCircle, LogIn } from "lucide-react";
import type { CodePracticeQuestion } from "@/lib/code-practice/types";

type QuestionDescriptionPanelProps = {
  question: CodePracticeQuestion;
  result?: { pass: boolean; message: string };
  isLoggedIn?: boolean;
};

export function QuestionDescriptionPanel({ question, result, isLoggedIn }: QuestionDescriptionPanelProps) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-lg font-extrabold text-zinc-900 dark:text-white leading-snug">
            {question.title}
          </h1>
          <Badge variant="secondary" className="shrink-0 text-[10px] font-bold rounded-full">
            {question.points} điểm
          </Badge>
        </div>

        <div className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <MarkdownRenderer content={question.description} />
        </div>

        {!isLoggedIn && (
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-50/60 dark:bg-amber-950/15 p-3.5">
            <LogIn size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs font-bold leading-relaxed text-amber-700 dark:text-amber-400">
              Đăng nhập bằng Google để điểm của bạn được ghi nhận trên bảng xếp hạng.
            </p>
          </div>
        )}

        {result && (
          <div
            className={`flex items-start gap-2.5 rounded-xl border p-3.5 ${
              result.pass
                ? "border-green-500/30 bg-green-50/60 dark:bg-green-950/15"
                : "border-red-500/30 bg-red-50/60 dark:bg-red-950/15"
            }`}
          >
            {result.pass ? (
              <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
            ) : (
              <XCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
            )}
            <p
              className={`text-xs font-bold leading-relaxed ${
                result.pass ? "text-green-700 dark:text-green-400" : "text-red-600 dark:text-red-400"
              }`}
            >
              {result.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
