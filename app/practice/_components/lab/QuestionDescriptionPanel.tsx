"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { CheckCircle2, XCircle, Circle, LogIn } from "lucide-react";
import { questionPoints } from "@/lib/code-practice/types";
import type { CodePracticeQuestion, CheckResult } from "@/lib/code-practice/types";

type QuestionDescriptionPanelProps = {
  question: CodePracticeQuestion;
  result?: { pass: boolean; checks: CheckResult[] };
  isLoggedIn?: boolean;
};

export function QuestionDescriptionPanel({ question, result, isLoggedIn }: QuestionDescriptionPanelProps) {
  const totalPoints = questionPoints(question);
  const earnedPoints = result ? result.checks.filter((c) => c.pass).reduce((s, c) => s + c.points, 0) : 0;

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-lg font-extrabold text-zinc-900 dark:text-white leading-snug">
            {question.title}
          </h1>
          <Badge variant="secondary" className="shrink-0 text-[10px] font-bold rounded-full">
            {result ? `${earnedPoints}/${totalPoints}` : totalPoints} điểm
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

        <div className="space-y-2">
          <h2 className="text-[11px] font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Danh sách yêu cầu
          </h2>
          <div className="space-y-2">
            {question.checks.map((check, idx) => {
              const checkResult = result?.checks[idx];
              const StatusIcon =
                checkResult === undefined ? Circle : checkResult.pass ? CheckCircle2 : XCircle;
              const statusColor =
                checkResult === undefined
                  ? "text-zinc-300 dark:text-zinc-700"
                  : checkResult.pass
                    ? "text-green-500"
                    : "text-red-500";
              const borderColor =
                checkResult === undefined
                  ? "border-zinc-200/70 dark:border-zinc-800/70"
                  : checkResult.pass
                    ? "border-green-500/30 bg-green-50/40 dark:bg-green-950/10"
                    : "border-red-500/30 bg-red-50/40 dark:bg-red-950/10";

              return (
                <div key={idx} className={`flex items-start gap-2.5 rounded-xl border p-3 ${borderColor}`}>
                  <StatusIcon size={15} className={`shrink-0 mt-0.5 ${statusColor}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        {check.label}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-400 shrink-0">
                        {check.points} điểm
                      </span>
                    </div>
                    {checkResult && (
                      <p
                        className={`text-[11px] mt-1 leading-relaxed ${
                          checkResult.pass ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"
                        }`}
                      >
                        {checkResult.message}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
