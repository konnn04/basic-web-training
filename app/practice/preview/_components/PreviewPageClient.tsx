"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { idbGet } from "@/lib/idb-store";

export function PreviewPageClient() {
  const searchParams = useSearchParams();
  const key = searchParams.get("key");
  const [srcDoc, setSrcDoc] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!key) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNotFound(true);
      return;
    }
    let cancelled = false;
    idbGet<string>(key).then((stored) => {
      if (cancelled) return;
      if (!stored) {
        setNotFound(true);
        return;
      }
      setSrcDoc(stored);
    });
    return () => {
      cancelled = true;
    };
  }, [key]);

  if (notFound) {
    return (
      <div className="h-screen w-screen flex items-center justify-center text-center px-4">
        <p className="text-sm text-zinc-500">
          Không tìm thấy dữ liệu xem trước. Hãy quay lại trang thực hành và bấm &quot;Mở tab mới xem to hơn&quot; lại.
        </p>
      </div>
    );
  }

  if (!srcDoc) return null;

  return (
    <iframe
      title="Xem trước toàn màn hình"
      srcDoc={srcDoc}
      sandbox="allow-scripts allow-same-origin"
      className="h-screen w-screen border-0"
    />
  );
}
