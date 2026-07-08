"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Play,
  Clock,
  HelpCircle,
  Calculator,
  Droplet,
  Globe2,
  BookOpen,
  Palette,
  Music,
  Cpu,
  Settings,
  AlertCircle,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronDown,
} from "lucide-react";

type ExamListItem = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  date?: string | null;
  duration: number;
  questionCount: number;
};

type SortField = "title" | "date";
type SortDir = "asc" | "desc";

export function ExamListClient() {
  const { currentUser } = useUser();
  const [exams, setExams] = useState<ExamListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const icons = [Calculator, Droplet, Globe2, BookOpen, Palette, Music, Cpu, Settings];

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await fetch("/api/exams");
        if (!res.ok) {
          throw new Error("Không thể tải danh sách bài kiểm tra");
        }
        const data = await res.json();
        setExams(data);
      } catch (err: any) {
        setError(err.message || "Lỗi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(exams.map((e) => e.category || "Khác"))).sort(),
    [exams]
  );

  const visibleExams = useMemo(() => {
    const filtered =
      categoryFilter === "all"
        ? exams
        : exams.filter((e) => (e.category || "Khác") === categoryFilter);

    const sorted = [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortField === "title") {
        cmp = a.title.localeCompare(b.title, "vi");
      } else {
        cmp = (a.date || "").localeCompare(b.date || "");
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return sorted;
  }, [exams, categoryFilter, sortField, sortDir]);

  return (
    <div className="container mx-auto px-4 max-w-5xl py-10 flex-grow flex flex-col justify-center">
      {/* Page Header */}
      <div className="mb-8 select-none">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
          <BookOpen className="text-orange-500" />
          Danh sách bài kiểm tra
        </h1>
        <p className="text-zinc-500 text-sm mt-1.5 leading-relaxed">
          Chọn một bài kiểm tra bên dưới để bắt đầu làm bài. Hãy đọc kỹ câu hỏi và làm bài thật cẩn thận nhé!
        </p>
      </div>

      {!loading && !error && exams.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-zinc-50/50 border border-zinc-200/60 rounded-2xl p-4 mb-6 dark:bg-zinc-950/20 dark:border-zinc-800/60 select-none">
          {/* Category Filter */}
          <div className="relative w-full sm:max-w-xs flex items-center gap-2">
            <Filter size={15} className="text-zinc-400 flex-shrink-0" />
            <div className="relative w-full">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full h-10 pl-4 pr-10 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 text-xs font-extrabold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer appearance-none shadow-sm transition-all text-zinc-800 dark:text-zinc-200"
              >
                <option value="all">Tất cả chuyên mục</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <ArrowUpDown size={15} className="text-zinc-400 flex-shrink-0 hidden xs:block" />
            <div className="relative">
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
                className="h-10 pl-4 pr-10 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 text-xs font-extrabold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer appearance-none shadow-sm transition-all text-zinc-800 dark:text-zinc-200"
              >
                <option value="date">Sắp xếp: Ngày</option>
                <option value="title">Sắp xếp: Tên</option>
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            </div>
            <button
              onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
              title={sortDir === "asc" ? "Tăng dần" : "Giảm dần"}
              className="h-10 w-10 flex items-center justify-center rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:border-orange-500 hover:text-orange-600 shadow-sm transition-all cursor-pointer flex-shrink-0"
            >
              {sortDir === "asc" ? <ArrowUp size={15} /> : <ArrowDown size={15} />}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="flex flex-row items-center gap-4 p-5 border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl">
              <Skeleton className="h-10 w-10 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48 rounded-md" />
                <Skeleton className="h-3 w-72 rounded-md" />
              </div>
              <Skeleton className="h-9 w-28 rounded-xl flex-shrink-0" />
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6 text-center text-red-600 dark:border-red-950/20 dark:bg-red-950/10 dark:text-red-400">
          <AlertCircle className="mx-auto h-8 w-8 mb-2.5" />
          <h3 className="font-bold text-sm">Không thể tải danh sách bài thi</h3>
          <p className="text-xs text-red-500 mt-1">{error}</p>
        </div>
      ) : exams.length === 0 ? (
        <div className="text-center py-16 text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm select-none">
          <HelpCircle size={48} className="mx-auto text-zinc-200 dark:text-zinc-800 mb-3" />
          <h3 className="font-semibold text-sm">Chưa có bài kiểm tra nào</h3>
          <p className="text-xs text-zinc-500 mt-1">Vui lòng quay lại sau nhé!</p>
        </div>
      ) : visibleExams.length === 0 ? (
        <div className="text-center py-16 text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm select-none">
          <Filter size={48} className="mx-auto text-zinc-200 dark:text-zinc-800 mb-3" />
          <h3 className="font-semibold text-sm">Không có bài thi nào trong chuyên mục này</h3>
          <p className="text-xs text-zinc-500 mt-1">Hãy thử chọn chuyên mục khác nhé!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {visibleExams.map((exam, i) => {
            const IconComponent = icons[i % icons.length];
            return (
              <Card
                key={exam.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 border border-zinc-200/85 bg-white dark:bg-zinc-900 dark:border-zinc-800/85 transition-all duration-200 hover:border-orange-500/45 dark:hover:border-orange-500/35 hover:shadow-md rounded-2xl"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400 shadow-sm shrink-0">
                  <IconComponent size={20} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-zinc-855 dark:text-zinc-100 truncate" title={exam.title}>
                      {exam.title}
                    </h3>
                    {exam.category && (
                      <Badge className="bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400 border-none rounded-full px-2 py-0 h-4.5 text-[9px] font-bold shrink-0">
                        {exam.category}
                      </Badge>
                    )}
                    <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 shrink-0">{exam.id}</span>
                  </div>
                  <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5 line-clamp-1 leading-relaxed">
                    {exam.description || "Bài kiểm tra kiến thức về các môn học Web."}
                  </p>
                </div>

                <div className="flex items-center gap-3.5 text-[10px] font-semibold text-zinc-400 select-none shrink-0">
                  <span className="flex items-center gap-1">
                    <HelpCircle size={12} className="text-zinc-400" />
                    {exam.questionCount} câu hỏi
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} className="text-zinc-400" />
                    {exam.duration} phút
                  </span>
                </div>

                <Link href={`/exam/${exam.id}`} className="w-full sm:w-auto shrink-0">
                  <Button className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-md text-xs font-bold gap-1 cursor-pointer px-5">
                    <Play size={12} className="fill-white" />
                    Vào làm bài
                  </Button>
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
