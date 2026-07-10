import React, { Suspense } from "react";
import { LayoutViewerClient } from "./_components/LayoutViewerClient";

export default function LayoutViewerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center text-zinc-400">
            <p className="text-sm font-semibold">Đang tải bộ xem bố cục...</p>
          </div>
        </div>
      }
    >
      <LayoutViewerClient />
    </Suspense>
  );
}
