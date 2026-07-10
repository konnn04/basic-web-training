"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QrCode, Copy, Check, Home, RotateCcw } from "lucide-react";
import { ExamData } from "@/hooks/use-quiz";

type ResultSummaryCardProps = {
  userName: string;
  examId: string;
  examTitle: string;
  score: number;
  isPassed: boolean;
  copied: boolean;
  qrUrl: string;
  copyShareLink: () => void;
};

export function ResultSummaryCard({
  userName,
  examId,
  examTitle,
  score,
  isPassed,
  copied,
  qrUrl,
  copyShareLink,
}: ResultSummaryCardProps) {
  const qrCodeImageSrc = `https://quickchart.io/qr?text=${encodeURIComponent(qrUrl)}&size=200&dark=ea580c`;

  return (
    <div className="border border-zinc-200/80 bg-white dark:bg-zinc-900 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-md p-6 text-center space-y-4">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-800 shadow-inner">
        {isPassed ? <span className="text-4xl">🎉</span> : <span className="text-4xl">😢</span>}
      </div>

      <div>
        <h1 className="text-lg font-bold text-zinc-900 dark:text-white">{userName}</h1>
        <p className="text-xs text-zinc-400 font-semibold mt-0.5">{examTitle}</p>
      </div>

      {/* Big Score Display */}
      <div className="py-2">
        <div className={`text-6xl font-black font-sans leading-none ${isPassed ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
          {score}
        </div>
        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1.5">
          Điểm số đạt được
        </div>
      </div>

      <Badge 
        variant="outline" 
        className={`rounded-full px-3 py-1 font-bold text-xs border-none ${
          isPassed 
            ? "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400" 
            : "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
        }`}
      >
        {isPassed ? "ĐẠT (Qua môn)" : "CHƯA ĐẠT"}
      </Badge>

      <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Share QR */}
        <div className="flex items-center gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-xl border-zinc-200 text-xs font-bold gap-1.5 shadow-sm cursor-pointer">
                <QrCode size={14} />
                Mã QR chia sẻ
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xs text-center rounded-2xl p-6">
              <DialogTitle className="text-sm font-bold text-zinc-800 dark:text-zinc-100 flex items-center justify-center gap-1.5">
                <QrCode size={16} className="text-orange-600" />
                Quét để xem kết quả
              </DialogTitle>
              <DialogDescription className="text-xs mt-1">
                Quét bằng Camera điện thoại để xem trực tiếp bài làm này.
              </DialogDescription>
              <div className="flex justify-center border border-zinc-100 dark:border-zinc-800 rounded-xl p-2 bg-white mt-4 max-w-[200px] mx-auto">
                <img 
                  src={qrCodeImageSrc} 
                  alt="QR Link kết quả" 
                  className="w-44 h-44 object-contain"
                />
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            size="sm"
            onClick={copyShareLink}
            className="rounded-xl border-zinc-200 text-xs font-bold gap-1.5 shadow-sm cursor-pointer"
          >
            {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
            {copied ? "Đã copy link" : "Copy link kết quả"}
          </Button>
        </div>

        {/* Quick navigations */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link href="/" className="flex-1 sm:flex-none">
            <Button variant="outline" size="sm" className="w-full rounded-xl border-zinc-200 text-xs font-bold gap-1 cursor-pointer">
              <Home size={13} />
              Trang chủ
            </Button>
          </Link>
          <Link href={`/exam/${examId}`} className="flex-1 sm:flex-none">
            <Button size="sm" className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold gap-1 cursor-pointer">
              <RotateCcw size={13} />
              Làm lại
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
