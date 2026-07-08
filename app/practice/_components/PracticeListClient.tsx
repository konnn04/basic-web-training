"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Code, Database, FileText, ArrowRight, Sparkles, Terminal, Palette, Braces } from "lucide-react";

const CODE_LABS = [
  {
    id: "css-lab",
    href: "/practice/css-lab",
    title: "Thực hành CSS trực tiếp",
    description: "Sửa CSS, xem preview và được chấm điểm ngay khi gõ (realtime, có debounce).",
    icon: Palette,
    badgeText: "Live CSS Lab",
    badgeColor: "bg-pink-50 text-pink-700 dark:bg-pink-950/30 dark:text-pink-400 border border-pink-200/20",
  },
  {
    id: "js-lab",
    href: "/practice/js-lab",
    title: "Thực hành JavaScript trực tiếp",
    description: "Sửa JavaScript, xem preview và được chấm điểm ngay khi gõ (realtime, có debounce).",
    icon: Braces,
    badgeText: "Live JS Lab",
    badgeColor: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400 border border-yellow-200/20",
  },
];

type DbConfig = {
  collection: string;
  title: string;
  endpoint: string;
  fields: any[];
};

type Exercise = {
  id: string;
  title: string;
  content: string;
  dbConfig?: DbConfig;
  description?: string;
};

type PracticeListClientProps = {
  exercises: Exercise[];
};

export function PracticeListClient({ exercises }: PracticeListClientProps) {
  return (
    <div className="container mx-auto px-4 max-w-5xl py-8 flex-grow flex flex-col justify-center animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="mb-8 pb-5 border-b border-zinc-200/50 dark:border-zinc-800/40 text-center sm:text-left select-none">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/20 border border-orange-200/30 dark:border-orange-900/35 mb-3.5">
          <Sparkles className="h-3.5 w-3.5 text-orange-500 animate-pulse" />
          <span className="text-[10px] font-black text-orange-700 dark:text-orange-400 uppercase tracking-wider">
            Học thông qua thực hành
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight flex items-center justify-center sm:justify-start gap-2.5">
          <Code className="text-orange-500 h-7 w-7" />
          Góc Thực Hành & Bài Tập
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-2xl leading-relaxed">
          Nơi thử nghiệm trực tiếp các bài thực hành HTML, CSS, JavaScript và kết nối API. Chọn bài tập bên dưới để bắt đầu làm bài và kiểm thử trên môi trường thực tế.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 items-stretch mb-6">
        {CODE_LABS.map((lab) => (
          <Card
            key={lab.id}
            className="group relative border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-zinc-900/40 shadow-sm hover:shadow-md hover:border-orange-500/45 dark:hover:border-orange-500/35 transition-all duration-300 flex flex-col justify-between overflow-hidden"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-950/30 text-orange-500 group-hover:scale-105 transition-transform duration-300">
                  <lab.icon className="h-5 w-5" />
                </div>
                <Badge className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${lab.badgeColor}`}>
                  {lab.badgeText}
                </Badge>
              </div>
              <div className="space-y-1.5">
                <h3 className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-white leading-snug group-hover:text-orange-500 transition-colors">
                  {lab.title}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-3">
                  {lab.description}
                </p>
              </div>
            </div>
            <div className="p-6 pt-0 border-t border-zinc-100/50 dark:border-zinc-800/20 mt-auto">
              <Link href={lab.href} passHref>
                <Button className="w-full bg-zinc-50 dark:bg-zinc-800 hover:bg-orange-500 dark:hover:bg-orange-600 hover:text-white dark:text-zinc-200 font-extrabold text-xs rounded-xl shadow-none group-hover:bg-orange-500 group-hover:text-white transition-all cursor-pointer h-9 px-4 flex items-center justify-center gap-1.5">
                  Bắt đầu làm bài
                  <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {exercises.length === 0 ? (
        <Card className="border border-dashed border-zinc-200 dark:border-zinc-850 p-12 text-center select-none rounded-2xl bg-zinc-50/20">
          <Terminal className="mx-auto h-10 w-10 text-zinc-350 dark:text-zinc-600 mb-3" />
          <CardTitle className="text-sm font-bold text-zinc-700 dark:text-zinc-400">Không có bài thực hành nào</CardTitle>
          <CardDescription className="text-xs text-zinc-400 mt-1">Các bài thực hành đang được cập nhật, vui lòng quay lại sau.</CardDescription>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 items-stretch">
          {exercises.map((ex, index) => {
            const hasDb = !!ex.dbConfig;
            let badgeText = "HTML & CSS Form";
            let badgeColor = "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200/20";
            let Icon = FileText;

            if (hasDb) {
              badgeText = "RESTful API / Database";
              badgeColor = "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400 border border-orange-200/20";
              Icon = Database;
            } else if (ex.id.includes("exam")) {
              badgeText = "Đề thi thực hành";
              badgeColor = "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 border border-purple-200/20";
              Icon = Terminal;
            }

            return (
              <Card 
                key={ex.id} 
                className="group relative border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-zinc-900/40 shadow-sm hover:shadow-md hover:border-orange-500/45 dark:hover:border-orange-500/35 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                <div className="p-6 space-y-4">
                  {/* Card Header Section */}
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-950/30 text-orange-500 group-hover:scale-105 transition-transform duration-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${badgeColor}`}>
                      {badgeText}
                    </Badge>
                  </div>

                  {/* Card Info */}
                  <div className="space-y-1.5">
                    <h3 className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-white leading-snug group-hover:text-orange-500 transition-colors">
                      {ex.title}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-3">
                      {ex.description || "Thực hành xây dựng giao diện ứng dụng và kết nối kiểm thử payload hoặc gọi API tự động để làm bài."}
                    </p>
                  </div>
                </div>

                {/* Card Footer Button */}
                <div className="p-6 pt-0 border-t border-zinc-100/50 dark:border-zinc-800/20 mt-auto">
                  <Link href={`/practice/${ex.id}`} passHref>
                    <Button 
                      className="w-full bg-zinc-50 dark:bg-zinc-800 hover:bg-orange-500 dark:hover:bg-orange-600 hover:text-white dark:text-zinc-200 font-extrabold text-xs rounded-xl shadow-none group-hover:bg-orange-500 group-hover:text-white transition-all cursor-pointer h-9 px-4 flex items-center justify-center gap-1.5"
                    >
                      Bắt đầu làm bài
                      <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
