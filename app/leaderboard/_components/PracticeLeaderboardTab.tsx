"use client";

import React, { useState, useEffect } from "react";
import { Trophy, CheckCircle2, Search, Check } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

type PracticeRankingEntry = {
  id: string;
  userName: string;
  userEmail: string | null;
  userImage: string | null;
  score: number;
  correctCount: number;
  totalQuestions: number;
  totalPoints: number;
  createdAt: string;
};

export function PracticeLeaderboardTab() {
  const [rankings, setRankings] = useState<PracticeRankingEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/practice/leaderboard");
        if (res.ok) {
          const data = await res.json();
          setRankings(data);
        }
      } catch (err) {
        console.error("Failed to load practice rankings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRankings();
  }, [refreshTrigger]);

  useEffect(() => {
    const handleStorageChange = () => setRefreshTrigger((prev) => prev + 1);
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  const filteredRankings = rankings.filter((entry) =>
    entry.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {!loading && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-100 rounded-2xl px-5 py-3.5 dark:from-emerald-950/15 dark:to-zinc-900 dark:border-emerald-900/30 flex items-center gap-3.5 shadow-sm mb-6 w-fit">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/10 flex-shrink-0">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              CSS Lab &amp; JS Lab
            </div>
            <div className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200">
              {rankings.length} Học viên đã ghi điểm
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center bg-zinc-50/50 border border-zinc-200/60 rounded-2xl p-4 mb-6 dark:bg-zinc-950/20 dark:border-zinc-800/60 select-none">
        <div className="relative w-full sm:max-w-xs">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Tìm học viên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-semibold shadow-sm transition-all"
          />
        </div>
      </div>

      <Card className="border border-zinc-200/80 bg-white/80 dark:bg-zinc-900/80 dark:border-zinc-800/80 backdrop-blur-md rounded-3xl shadow-sm overflow-hidden">
        <CardContent className="p-0 flex flex-col">
          {loading ? (
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
              <h3 className="font-bold text-sm text-zinc-700 dark:text-zinc-300">Chưa có ai ghi điểm thực hành</h3>
              <p className="text-xs text-zinc-500 mt-1.5 max-w-sm mx-auto px-4 leading-relaxed">
                Đăng nhập và giải các câu CSS/JS Lab để ghi tên bạn lên bảng vàng nhé!
              </p>
              <Link href="/practice" className="mt-5 inline-block">
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold gap-1.5 px-5 cursor-pointer shadow-md">
                  Vào Góc Thực Hành
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
                    <th className="py-4 px-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-center w-32">Số bài đã giải</th>
                    <th className="py-4 px-5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-center w-24">Tổng điểm</th>
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
                              <div className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold text-xs flex-shrink-0">
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
                              <span className="text-[9px] text-zinc-400/90 mt-0.5 block">
                                Hoạt động gần nhất: {formatDate(entry.createdAt)}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center align-middle">
                          <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                            {entry.correctCount}/{entry.totalQuestions}
                          </span>
                        </td>

                        <td className="py-3.5 px-5 text-center align-middle">
                          <Badge className="rounded-full px-2.5 py-0.5 font-extrabold text-xs shadow-sm border-none bg-emerald-500 text-white dark:bg-emerald-600">
                            {entry.score}/{entry.totalPoints}
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
