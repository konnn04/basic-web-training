"use client";

import React from "react";
import { Trophy, ArrowLeft, BookOpen, Code } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ExamLeaderboardTab } from "./_components/ExamLeaderboardTab";
import { PracticeLeaderboardTab } from "./_components/PracticeLeaderboardTab";

export default function LeaderboardPage() {
  return (
    <div className="container mx-auto px-4 max-w-5xl py-8 flex-grow flex flex-col justify-start">
      {/* Header */}
      <div className="mb-8 select-none">
        <Link
          href="/exam"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-orange-600 transition-colors mb-3"
        >
          <ArrowLeft size={14} />
          Quay lại danh sách bài thi
        </Link>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
          <Trophy className="text-amber-500 fill-amber-500/20 w-8 h-8 animate-pulse" />
          Bảng Xếp Hạng Học Tập
        </h1>
        <p className="text-zinc-500 text-xs mt-1.5 leading-relaxed">
          Xem thành tích xuất sắc nhất của các học viên. Thử sức làm bài thi hoặc giải bài thực hành để ghi danh trên bảng vàng nhé!
        </p>
      </div>

      <Tabs defaultValue="exam" className="gap-6">
        <TabsList variant="line" className="border-b border-zinc-200/60 dark:border-zinc-800/60 w-fit">
          <TabsTrigger value="exam" className="text-xs font-bold gap-1.5 px-3 py-2">
            <BookOpen size={14} />
            Đề thi
          </TabsTrigger>
          <TabsTrigger value="practice" className="text-xs font-bold gap-1.5 px-3 py-2">
            <Code size={14} />
            Thực hành
          </TabsTrigger>
        </TabsList>

        <TabsContent value="exam">
          <ExamLeaderboardTab />
        </TabsContent>
        <TabsContent value="practice">
          <PracticeLeaderboardTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
