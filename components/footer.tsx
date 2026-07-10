"use client";

import React from "react";

export function Footer() {
  return (
    <footer className="bg-zinc-900 border-t border-zinc-800 text-zinc-400 py-6 text-center text-sm mt-auto">
      <div className="container mx-auto px-4">
        <p className="font-medium">
          © 2026 Training Web MPClub — Hệ thống hỗ trợ giảng dạy & thực hành Web.
        </p>
        <p className="text-xs text-zinc-500 mt-1.5 flex items-center justify-center gap-1">
          <span>Phát triển bằng Next.js, Tailwind v4 và Shadcn UI.</span>
          <span className="hidden sm:inline">•</span>
          <span className="italic">Có sử dụng AI, khỏi hỏi :v</span>
        </p>
      </div>
    </footer>
  );
}
