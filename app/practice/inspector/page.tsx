import React, { Suspense } from "react";
import { InspectorClient } from "./_components/InspectorClient";
import { Skeleton } from "@/components/ui/skeleton";

export default function InspectorPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-10 max-w-3xl flex-grow flex flex-col justify-center gap-6">
          <Skeleton className="h-12 w-60 rounded-xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      }
    >
      <InspectorClient />
    </Suspense>
  );
}
