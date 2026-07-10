"use client";

import React from "react";
import { BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type ProgressCardProps = {
  answeredCount: number;
  totalQuestions: number;
};

export function ProgressCard({ answeredCount, totalQuestions }: ProgressCardProps) {
  const progressPercent = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  return (
    <Card className="border border-zinc-200/80 bg-white dark:bg-zinc-900 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm">
      <CardContent className="p-4 space-y-3.5">
        <div className="flex items-center justify-between text-xs font-semibold text-zinc-500">
          <span className="flex items-center gap-1">
            <BarChart3 size={14} />
            Tiến độ làm bài
          </span>
          <span className="text-orange-600 font-bold dark:text-orange-400">
            {answeredCount}/{totalQuestions}
          </span>
        </div>
        <Progress value={progressPercent} className="h-1.5 [&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:to-amber-500" />
      </CardContent>
    </Card>
  );
}
