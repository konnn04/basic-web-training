"use client";

import React from "react";
import { ListOrdered } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type QuestionsMapProps = {
  questionsCount: number;
  currentIndex: number;
  userAnswers: Record<number, any>;
  goToQuestion: (index: number) => void;
  answeredCount: number;
};

export function QuestionsMap({
  questionsCount,
  currentIndex,
  userAnswers,
  goToQuestion,
  answeredCount,
}: QuestionsMapProps) {
  const progressPercent = questionsCount > 0 ? (answeredCount / questionsCount) * 100 : 0;

  return (
    <Card className="border border-zinc-200/80 bg-white dark:bg-zinc-900 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between text-xs font-bold text-zinc-500">
          <h3 className="flex items-center gap-1">
            <ListOrdered size={14} />
            Bản đồ câu hỏi
          </h3>
          <span className="text-orange-600 dark:text-orange-400 font-black">
            {answeredCount}/{questionsCount}
          </span>
        </div>
        <Progress value={progressPercent} className="h-1 bg-zinc-100 dark:bg-zinc-800 mt-2 [&>div]:bg-orange-500" />
      </CardHeader>
      <CardContent className="p-4 pt-1">
        <div className="grid grid-cols-5 gap-1.5">
          {Array.from({ length: questionsCount }).map((_, idx) => {
            const ans = userAnswers[idx];
            const isAnswered = ans !== -1 && ans !== "" && ans !== undefined;
            const isCurrent = idx === currentIndex;

            return (
              <button
                key={idx}
                onClick={() => goToQuestion(idx)}
                className={`h-8 w-8 rounded-lg text-xs font-bold transition-all border flex items-center justify-center cursor-pointer ${
                  isCurrent
                    ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white scale-105 shadow-sm"
                    : isAnswered
                    ? "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/50"
                    : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800"
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
