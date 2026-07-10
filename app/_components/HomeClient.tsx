"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Layers, Code, ArrowRight, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function HomeClient() {
  const cards = [
    {
      title: "Luyện thi trắc nghiệm",
      description: "Hệ thống các bài trắc nghiệm kiến thức tổng quan Web, HTML/CSS cơ bản, HTTP/HTTPS và các thành phần giao diện.",
      icon: BookOpen,
      href: "/exam",
      badge: "Lý thuyết & Nhận diện",
      color: "from-orange-500 to-amber-500",
      shadow: "shadow-orange-500/10 hover:shadow-orange-500/25",
    },
    {
      title: "Khám phá Bố cục Web",
      description: "Thư viện các mẫu giao diện thực tế (Blog, E-Commerce, Spotify, Landing Page) hỗ trợ rê chuột (hover) để nhận diện các thành phần layout.",
      icon: Layers,
      href: "/example-layout",
      badge: "Phân tích cấu trúc",
      color: "from-blue-500 to-indigo-500",
      shadow: "shadow-blue-500/10 hover:shadow-blue-500/25",
    },
    {
      title: "Góc Thực Hành & API",
      description: "Trải nghiệm viết mã HTML/CSS/JS trực quan với Live Preview, chấm điểm tự động và giả lập gọi API để hiểu giao tiếp Client-Server.",
      icon: Code,
      href: "/practice",
      badge: "Viết code & Gọi API",
      color: "from-emerald-500 to-teal-500",
      shadow: "shadow-emerald-500/10 hover:shadow-emerald-500/25",
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-zinc-50/50 dark:bg-zinc-950/40">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-20 text-center border-b border-zinc-200/50 bg-gradient-to-b from-orange-50/40 to-transparent dark:from-orange-950/10 dark:border-zinc-800/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-100/80 px-3 py-1 text-[11px] font-bold text-orange-600 dark:bg-orange-950/40 dark:text-orange-400 mb-6 uppercase tracking-wider">
            <span>Training Web MPClub 2026</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
            Học lý thuyết,{" "}
            <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
              rèn kỹ năng thực chiến
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Nền tảng ôn luyện Web dành cho học viên MPClub: trắc nghiệm kiến thức, phân tích bố cục giao diện thực tế
            và thực hành viết code có chấm điểm tự động.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/exam">
              <Button className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-6 h-11 shadow-md shadow-orange-500/20 cursor-pointer">
                Bắt đầu ôn luyện
                <ArrowRight size={16} className="ml-1.5" />
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button
                variant="outline"
                className="rounded-xl border-zinc-200 dark:border-zinc-800 font-bold text-sm px-6 h-11 gap-1.5 cursor-pointer"
              >
                <Trophy size={15} className="text-amber-500" />
                Xem bảng xếp hạng
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Cards Section */}
      <div className="container mx-auto px-4 max-w-5xl py-12 sm:py-16 flex-grow">
        <div className="mb-8 text-center sm:text-left">
          <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Các phân mục ôn luyện
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1.5">
            Chọn một trong các phân mục bên dưới để bắt đầu.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full">
          {cards.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card
                key={index}
                className={`relative flex flex-col overflow-hidden border border-zinc-200/80 bg-white dark:bg-zinc-900 dark:border-zinc-800/80 transition-all duration-300 hover:-translate-y-1.5 shadow-md ${item.shadow} rounded-2xl`}
              >
                {/* Visual Top Bar Indicator */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${item.color}`} />

                <CardHeader className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} text-white shadow-md shadow-zinc-500/10`}>
                      <Icon size={20} />
                    </div>
                    <Badge variant="secondary" className="rounded-full text-[10px] font-bold px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                      {item.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-bold text-zinc-800 dark:text-zinc-100 mt-4">
                    {item.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 pb-6">
                  <CardDescription className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed">
                    {item.description}
                  </CardDescription>
                </CardContent>

                <CardFooter className="pt-0 pb-6">
                  <Link href={item.href} className="w-full">
                    <Button
                      variant="outline"
                      className="w-full group/btn rounded-xl border-zinc-200 hover:border-orange-500 hover:bg-orange-50/50 hover:text-orange-600 dark:border-zinc-800 dark:hover:bg-orange-950/20 text-xs font-bold"
                    >
                      Bắt đầu khám phá
                      <ArrowRight size={14} className="ml-1.5 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
