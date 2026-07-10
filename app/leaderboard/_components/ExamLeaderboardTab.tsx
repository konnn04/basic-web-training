"use client";

import React, { useState, useEffect } from "react";
import { Trophy, Clock, Target, Filter, Search, Check, ChevronDown } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

type LeaderboardEntry = {
  id: string;
  examId: string;
  examTitle: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  timeUsed: number;
  duration: number;
  userName: string;
  userEmail: string | null;
  userImage: string | null;
  createdAt: string;
};

type ExamFilterOption = {
  id: string;
  title: string;
};

export function ExamLeaderboardTab() {
  const [rankings, setRankings] = useState<LeaderboardEntry[]>([]);
  const [exams, setExams] = useState<ExamFilterOption[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>("all");
  const [loadingRankings, setLoadingRankings] = useState<boolean>(true);
  const [loadingExams, setLoadingExams] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Fetch all exams list for filtering
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await fetch("/api/exams");
        if (res.ok) {
          const data = await res.json();
          setExams(data);
        }
      } catch (err) {
        console.error("Failed to load exams", err);
      } finally {
        setLoadingExams(false);
      }
    };
    fetchExams();
  }, []);

  // Fetch rankings based on selected exam
  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setLoadingRankings(true);
        const url = selectedExamId === "all"
          ? "/api/exams/leaderboard"
          : `/api/exams/leaderboard?examId=${selectedExamId}`;

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setRankings(data);
        }
      } catch (err) {
        console.error("Failed to load rankings", err);
      } finally {
        setLoadingRankings(false);
      }
    };
    fetchRankings();
  }, [selectedExamId, refreshTrigger]);

  // Sync and reload if scores are deleted/updated via other modals
  useEffect(() => {
    const handleStorageChange = () => {
      setRefreshTrigger((prev) => prev + 1);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const formatTime = (secs: number) => {
    if (!secs) return "--";
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    if (mins === 0) return `${remaining} giây`;
    return `${mins} phút ${remaining} giây`;
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  const filteredRankings = rankings.filter(
    (entry) =>
      entry.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.examTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Dynamic Status Display */}
      {!loadingRankings && (
        <div className="bg-gradient-to-br from-orange-50 to-amber-50/50 border border-orange-100 rounded-2xl px-5 py-3.5 dark:from-orange-950/15 dark:to-zinc-900 dark:border-orange-900/30 flex items-center gap-3.5 shadow-sm mb-6 w-fit">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white shadow-md shadow-orange-500/10 flex-shrink-0">
            <Trophy size={18} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
              {selectedExamId === "all" ? "Tất cả đề thi" : "Lọc bài thi"}
            </div>
            <div className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200">
              {rankings.length} Lượt nộp điểm
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar Container */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-zinc-50/50 border border-zinc-200/60 rounded-2xl p-4 mb-6 dark:bg-zinc-950/20 dark:border-zinc-800/60 select-none">
        <div className="relative w-full sm:max-w-xs">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Tìm học viên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs font-semibold shadow-sm transition-all"
          />
        </div>

        <div className="relative w-full sm:max-w-sm flex items-center gap-2">
          <Filter size={15} className="text-zinc-400 flex-shrink-0 hidden xs:block" />
          <div className="relative w-full">
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full h-10 pl-4 pr-10 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 text-xs font-extrabold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer appearance-none shadow-sm transition-all text-zinc-800 dark:text-zinc-200"
            >
              <option value="all">🏆 Tất cả đề thi (Tổng điểm)</option>
              {!loadingExams &&
                exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    📝 {exam.title}
                  </option>
                ))}
            </select>
            <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Rankings Leaderboard Grid */}
      <Card className="border border-zinc-200/80 bg-white/80 dark:bg-zinc-900/80 dark:border-zinc-800/80 backdrop-blur-md rounded-3xl shadow-sm overflow-hidden">
        <CardContent className="p-0 flex flex-col">
          {loadingRankings ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="flex items-center gap-4 py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-none">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40 rounded" />
                    <Skeleton className="h-3 w-60 rounded" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </div>
          ) : filteredRankings.length === 0 ? (
            <div className="text-center py-20 text-zinc-400 select-none">
              <Trophy size={48} className="mx-auto text-zinc-200 dark:text-zinc-800 mb-4" />
              <h3 className="font-bold text-sm text-zinc-700 dark:text-zinc-300">Không có kết quả xếp hạng nào</h3>
              <p className="text-xs text-zinc-500 mt-1.5 max-w-sm mx-auto px-4 leading-relaxed">
                Hãy là người đầu tiên làm bài thi này và ghi tên của bạn lên bảng vàng xếp hạng nhé!
              </p>
              <Link href="/exam" className="mt-5 inline-block">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold gap-1.5 px-5 cursor-pointer shadow-md">
                  Làm bài thi ngay
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50/70 border-b border-zinc-100 dark:bg-zinc-900/50 dark:border-zinc-800/80 select-none">
                    <th className="py-4 px-5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider w-16 text-center">Hạng</th>
                    <th className="py-4 px-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Học viên</th>
                    {selectedExamId === "all" ? (
                      <th className="py-4 px-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider hidden sm:table-cell">Tiến độ bài thi</th>
                    ) : (
                      <th className="py-4 px-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider hidden sm:table-cell">Bài kiểm tra</th>
                    )}
                    <th className="py-4 px-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-center w-28">Tổng thời gian</th>
                    <th className="py-4 px-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-center w-28">Tỷ lệ đúng</th>
                    <th className="py-4 px-5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-center w-24">
                      {selectedExamId === "all" ? "Tổng điểm" : "Điểm số"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100/80 dark:divide-zinc-800/40">
                  {filteredRankings.map((entry, idx) => {
                    const rank = idx + 1;

                    let rankDisplay: React.ReactNode = rank;
                    let rowBg = "hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10";

                    if (rank === 1) {
                      rankDisplay = (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-400 font-extrabold text-sm border border-amber-300 dark:border-amber-900/50 shadow-sm mx-auto animate-bounce">
                          🥇
                        </div>
                      );
                      rowBg = "bg-amber-50/10 hover:bg-amber-50/20 dark:bg-amber-950/5 dark:hover:bg-amber-950/10";
                    } else if (rank === 2) {
                      rankDisplay = (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-700 dark:bg-slate-900/80 dark:text-slate-400 font-extrabold text-sm border border-slate-300 dark:border-slate-800 mx-auto">
                          🥈
                        </div>
                      );
                      rowBg = "bg-slate-50/10 hover:bg-slate-50/20 dark:bg-zinc-900/5 dark:hover:bg-zinc-900/10";
                    } else if (rank === 3) {
                      rankDisplay = (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400 font-extrabold text-sm border border-orange-200 dark:border-orange-900/30 mx-auto">
                          🥉
                        </div>
                      );
                      rowBg = "bg-orange-50/5 hover:bg-orange-50/10 dark:bg-orange-950/5 dark:hover:bg-orange-950/10";
                    } else {
                      rankDisplay = <span className="font-bold text-zinc-500 text-xs block text-center">{rank}</span>;
                    }

                    return (
                      <tr key={entry.id} className={`transition-all duration-150 ${rowBg}`}>
                        <td className="py-3.5 px-2 text-center align-middle">{rankDisplay}</td>

                        <td className="py-3.5 px-4 align-middle">
                          <div className="flex items-center gap-3">
                            {entry.userImage ? (
                              <img
                                src={entry.userImage}
                                alt={entry.userName}
                                className="h-8.5 w-8.5 rounded-full border border-zinc-200/80 dark:border-zinc-800 object-cover flex-shrink-0"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400 font-bold text-xs flex-shrink-0">
                                {entry.userName[0]?.toUpperCase() || "H"}
                              </div>
                            )}
                            <div className="flex flex-col truncate">
                              <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                                {entry.userName}
                                {entry.userEmail && (
                                  <Badge className="bg-blue-50 text-blue-600 border-none rounded px-1.5 py-0 h-4 dark:bg-blue-950/30 dark:text-blue-400 font-semibold text-[8px] flex items-center gap-0.5 select-none">
                                    <Check size={8} className="stroke-[3]" />
                                    Google
                                  </Badge>
                                )}
                              </span>
                              <span className="text-[10px] text-zinc-400 sm:hidden block mt-0.5 truncate max-w-[200px]">
                                {entry.examTitle}
                              </span>
                              <span className="text-[9px] text-zinc-400/90 hidden sm:block mt-0.5">
                                Hoạt động gần nhất: {formatDate(entry.createdAt)}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 align-middle hidden sm:table-cell">
                          {selectedExamId === "all" ? (
                            <Badge className="bg-orange-50/70 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400 border border-orange-100/50 dark:border-orange-950/40 font-bold text-[10px] rounded-lg">
                              {entry.examTitle}
                            </Badge>
                          ) : (
                            <>
                              <span className="font-semibold text-xs text-zinc-700 dark:text-zinc-300 line-clamp-1 max-w-[280px]" title={entry.examTitle}>
                                {entry.examTitle}
                              </span>
                              <span className="text-[9px] text-zinc-400/90 mt-0.5 block">Mã đề: {entry.examId}</span>
                            </>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center align-middle">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                            <Clock size={11} className="text-zinc-400" />
                            {formatTime(entry.timeUsed)}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center align-middle">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                            <Target size={11} className="text-zinc-400" />
                            {entry.correctCount}/{entry.totalQuestions}
                          </span>
                        </td>

                        <td className="py-3.5 px-5 text-center align-middle">
                          <Badge
                            className={`rounded-full px-2.5 py-0.5 font-extrabold text-xs shadow-sm border-none ${
                              selectedExamId === "all"
                                ? "bg-orange-500 text-white dark:bg-orange-600"
                                : entry.score >= 70
                                ? "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-400"
                                : "bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400"
                            }`}
                          >
                            {entry.score}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
