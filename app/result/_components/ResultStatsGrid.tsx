"use client";

import React from "react";

type ResultStatsGridProps = {
  correctCount: number;
  totalQuestions: number;
  timeUsed?: number;
};

export function ResultStatsGrid({
  correctCount,
  totalQuestions,
  timeUsed,
}: ResultStatsGridProps) {
  const timeMin = timeUsed ? Math.floor(timeUsed / 60) : 0;
  const timeSec = timeUsed ? timeUsed % 60 : 0;

  return (
    <div className="grid grid-cols-4 gap-3 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-xl p-3.5 border border-zinc-100 dark:border-zinc-800 text-center">
      <div>
        <div className="text-sm font-bold text-green-600">{correctCount}</div>
        <div className="text-[9px] font-bold text-zinc-400">Đúng</div>
      </div>
      <div>
        <div className="text-sm font-bold text-red-500">{totalQuestions - correctCount}</div>
        <div className="text-[9px] font-bold text-zinc-400">Sai / Bỏ qua</div>
      </div>
      <div>
        <div className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{totalQuestions}</div>
        <div className="text-[9px] font-bold text-zinc-400">Tổng câu</div>
      </div>
      <div>
        <div className="text-sm font-bold text-orange-600">
          {timeMin}:{String(timeSec).padStart(2, "0")}
        </div>
        <div className="text-[9px] font-bold text-zinc-400">Thời gian</div>
      </div>
    </div>
  );
}
