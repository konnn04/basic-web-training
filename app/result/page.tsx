import React, { Suspense } from "react";
import { ResultClient } from "./_components/ResultClient";
import { Skeleton } from "@/components/ui/skeleton";

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-10 max-w-3xl flex-grow flex flex-col justify-center gap-6">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-60 w-full rounded-2xl" />
        </div>
      }
    >
      <ResultClient />
    </Suspense>
  );
}
