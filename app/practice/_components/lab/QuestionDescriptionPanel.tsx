"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { CheckCircle2, XCircle, Circle, LogIn, Lightbulb } from "lucide-react";
import { questionPoints } from "@/lib/code-practice/types";
import type { CodePracticeQuestion, CheckResult } from "@/lib/code-practice/types";

const HINT_DELAY = 30;

function splitHint(description: string): { main: string; hint: string | null } {
  const idx = description.indexOf("\n\nGợi ý:");
  if (idx !== -1) {
    return { main: description.slice(0, idx), hint: description.slice(idx + 2) };
  }
  return { main: description, hint: null };
}

type QuestionDescriptionPanelProps = {
  question: CodePracticeQuestion;
  result?: { pass: boolean; checks: CheckResult[] };
  isLoggedIn?: boolean;
};

export function QuestionDescriptionPanel({ question, result, isLoggedIn }: QuestionDescriptionPanelProps) {
  const totalPoints = questionPoints(question);
  const earnedPoints = result ? result.checks.filter((c) => c.pass).reduce((s, c) => s + c.points, 0) : 0;

  const [secondsLeft, setSecondsLeft] = useState(HINT_DELAY);
  const [hintUnlocked, setHintUnlocked] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);

  useEffect(() => {
    setSecondsLeft(HINT_DELAY);
    setHintUnlocked(false);
    setHintVisible(false);

    let count = HINT_DELAY;
    const interval = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(interval);
        setSecondsLeft(0);
        setHintUnlocked(true);
      } else {
        setSecondsLeft(count);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [question.id]);

  const { main, hint } = splitHint(question.description);

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
          <MarkdownRenderer content={main} />
        </div>

        {hint && (
          <div>
            {!hintUnlocked ? (
              <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500 select-none">
                <Lightbulb size={13} className="shrink-0" />
                <span>
                  Gợi ý sẽ mở khóa sau{" "}
                  <span className="font-bold tabular-nums">{secondsLeft}s</span>
                </span>
              </div>
            ) : !hintVisible ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHintVisible(true)}
                className="w-full text-xs font-bold gap-1.5 border-amber-400/50 text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/20 cursor-pointer"
              >
                <Lightbulb size={13} />
                Xem gợi ý
              </Button>
            ) : (
              <div className="rounded-xl border border-amber-500/30 bg-amber-50/60 dark:bg-amber-950/15 p-3.5">
                <div className="flex items-center gap-1.5 mb-2">
                  <Lightbulb size={13} className="text-amber-500" />
                  <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    Gợi ý
                  </span>
                </div>
                <div className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">
                  <MarkdownRenderer content={hint} />
                </div>
              </div>
            )}
          </div>
        )}

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
