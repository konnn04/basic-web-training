"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp } from "lucide-react";
import { Navbar } from "./navbar";
import { Footer } from "./footer";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isViewer = pathname.startsWith("/example-layout/viewer");
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (isViewer) {
    return (
      <main key={pathname} className="flex-grow flex flex-col h-screen overflow-hidden animate-page-enter">
        {children}
      </main>
    );
  }

  return (
    <>
      <Navbar />
      <main key={pathname} className="flex-grow flex flex-col animate-page-enter">
        {children}
      </main>
      <Footer />

      {/* Floating Back to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-2.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 transition-all hover:scale-105 active:scale-95 z-50 cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-300"
          title="Cuộn lên đầu trang"
        >
          <ArrowUp size={18} />
        </button>
      )}
    </>
  );
}
