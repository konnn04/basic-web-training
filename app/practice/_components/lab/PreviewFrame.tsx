"use client";

import React, { useRef } from "react";

type PreviewFrameProps = {
  srcDoc: string;
  onLoadResult: (doc: Document, win: Window) => void;
  title: string;
  className?: string;
};

export function PreviewFrame({ srcDoc, onLoadResult, title, className = "" }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleLoad = () => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument || !iframe.contentWindow) return;
    onLoadResult(iframe.contentDocument, iframe.contentWindow);
  };

  return (
    <iframe
      ref={iframeRef}
      title={title}
      srcDoc={srcDoc}
      onLoad={handleLoad}
      sandbox="allow-scripts allow-same-origin"
      className={`h-full w-full bg-white ${className}`}
    />
  );
}
