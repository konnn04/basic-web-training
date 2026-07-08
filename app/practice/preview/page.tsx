import React, { Suspense } from "react";
import { PreviewPageClient } from "./_components/PreviewPageClient";

export default function PreviewPage() {
  return (
    <Suspense fallback={null}>
      <PreviewPageClient />
    </Suspense>
  );
}
