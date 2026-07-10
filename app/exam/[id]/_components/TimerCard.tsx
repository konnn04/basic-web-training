"use client";

import React from "react";
import { Hourglass } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type TimerCardProps = {
  timeLeft: number;
  totalTime: number;
};

export function TimerCard({ timeLeft, totalTime }: TimerCardProps) {
  const isWarningTime = timeLeft < totalTime * 0.3;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const radius = 40;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius; // ~251.32
  const strokeDashoffset = circumference - (timeLeft / totalTime) * circumference;

  return (
    <Card className="border border-zinc-200/80 bg-white dark:bg-zinc-900 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm select-none">
      <CardContent className="p-4 flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center h-28 w-28">
          <svg className="transform -rotate-90 w-full h-full">
            {/* Background circle */}
            <circle
              cx="56"
              cy="56"
              r={radius}
              className="stroke-zinc-100 dark:stroke-zinc-800"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Foreground progress circle */}
            <circle
              cx="56"
              cy="56"
              r={radius}
              className={`transition-all duration-1000 ${
                isWarningTime ? "stroke-red-500" : "stroke-orange-500"
              }`}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          {/* Absolute centered timer text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={`text-xl font-extrabold font-mono tracking-tight transition-colors ${
                isWarningTime ? "text-red-500 animate-pulse" : "text-zinc-800 dark:text-zinc-100"
              }`}
            >
              {formatTime(timeLeft)}
            </span>
            <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">Thời gian</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
