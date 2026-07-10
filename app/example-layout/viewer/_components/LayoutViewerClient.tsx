"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Monitor, 
  Tablet, 
  Smartphone,
  ExternalLink,
  Info,
  Maximize2
} from "lucide-react";

type ViewMode = "desktop" | "tablet" | "mobile";

export function LayoutViewerClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const path = searchParams.get("path");
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [iframeSrc, setIframeSrc] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!path) {
      router.push("/example-layout");
      return;
    }
    // Set standard path pointing to public/example-layout/...
    setIframeSrc(`/example-layout/${path}`);
  }, [path, router]);

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (iframeRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
        setIsFullscreen(false);
      } else {
        iframeRef.current.requestFullscreen().then(() => {
          setIsFullscreen(true);
        }).catch((err) => {
          console.error("Error attempting to enable fullscreen:", err);
        });
      }
    }
  };

  // Sync state on document fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // View mode specs
  const getWidthClass = () => {
    switch (viewMode) {
      case "mobile":
        return "w-[375px] border-x border-zinc-300 dark:border-zinc-800 shadow-xl";
      case "tablet":
        return "w-[768px] border-x border-zinc-300 dark:border-zinc-800 shadow-xl";
      case "desktop":
      default:
        return "w-full";
    }
  };

  const getPageTitle = () => {
    if (!path) return "Layout Viewer";
    // Beautify title from path "ecommerce/product-detail.html" -> "Ecommerce - Product Detail"
    const cleaned = path.replace(".html", "").replace("-", " ");
    return cleaned
      .split("/")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" — ");
  };

  return (
    <div className="flex-grow flex flex-col h-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
      
      {/* Viewer Toolbar */}
      <div className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-850 px-4 py-3 flex items-center justify-between gap-4 flex-shrink-0 shadow-sm relative z-25">
        
        {/* Back and Title */}
        <div className="flex items-center gap-3 truncate">
          <Link href="/example-layout">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-zinc-500 hover:text-zinc-800 cursor-pointer">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <div className="truncate">
            <h2 className="text-sm font-bold text-zinc-850 dark:text-zinc-100 truncate">
              {getPageTitle()}
            </h2>
            <span className="text-[10px] text-zinc-400 font-semibold truncate hidden sm:block">
              Đường dẫn tĩnh: /public/example-layout/{path}
            </span>
          </div>
        </div>

        {/* View mode toggle triggers & Fullscreen */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800/80 select-none">
            <Button
              variant={viewMode === "desktop" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("desktop")}
              className="h-8 w-8 rounded-lg text-zinc-600 hover:text-orange-500 transition-colors cursor-pointer"
              title="Màn hình lớn (Desktop 100%)"
            >
              <Monitor size={15} />
            </Button>
            <Button
              variant={viewMode === "tablet" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("tablet")}
              className="h-8 w-8 rounded-lg text-zinc-600 hover:text-orange-500 transition-colors cursor-pointer"
              title="Máy tính bảng (Tablet 768px)"
            >
              <Tablet size={15} />
            </Button>
            <Button
              variant={viewMode === "mobile" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("mobile")}
              className="h-8 w-8 rounded-lg text-zinc-600 hover:text-orange-500 transition-colors cursor-pointer"
              title="Điện thoại (Mobile 375px)"
            >
              <Smartphone size={15} />
            </Button>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={toggleFullscreen}
            className="h-9 w-9 rounded-xl border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-orange-500 transition-colors cursor-pointer"
            title="Toàn màn hình Iframe (Fullscreen)"
          >
            <Maximize2 size={15} />
          </Button>
        </div>

        {/* View raw file button */}
        <div className="flex-shrink-0">
          <Link href={iframeSrc} target="_blank">
            <Button variant="outline" size="sm" className="rounded-xl border-zinc-200 text-xs font-bold gap-1 shadow-sm hidden md:flex cursor-pointer">
              Xem file thô
              <ExternalLink size={11} />
            </Button>
          </Link>
        </div>

      </div>

      {/* Info Tip Bar (collapsible/slight) */}
      <div className="bg-orange-50 dark:bg-orange-950/20 border-b border-orange-100 dark:border-orange-900/30 px-4 py-1.5 flex items-center gap-2 text-[10px] text-orange-700 dark:text-orange-400 flex-shrink-0 select-none">
        <Info size={12} className="text-orange-500 flex-shrink-0" />
        <span>Di chuột (hover) vào các vùng màu hoặc thẻ để xem chú thích cấu trúc phần tử HTML/CSS tương ứng.</span>
      </div>

      {/* Frame Container */}
      <div className="flex-grow overflow-hidden flex justify-center p-4 min-h-0">
        {iframeSrc && (
          <iframe
            ref={iframeRef}
            src={iframeSrc}
            title={getPageTitle()}
            className={`h-full bg-white dark:bg-zinc-950 transition-all duration-300 rounded-2xl ${getWidthClass()}`}
          />
        )}
      </div>

    </div>
  );
}
