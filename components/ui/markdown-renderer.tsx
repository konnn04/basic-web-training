"use client";

import React, { useEffect, useId } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { useTheme } from "next-themes";

type MarkdownRendererProps = {
  content: string;
  className?: string;
};

const LIGHT_HREF =
  "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/github.min.css";
const DARK_HREF =
  "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/github-dark.min.css";

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const { resolvedTheme } = useTheme();
  const id = useId();

  useEffect(() => {
    const isDark = resolvedTheme === "dark";
    const href = isDark ? DARK_HREF : LIGHT_HREF;
    const linkId = `hljs-theme-${id}`;

    // Remove existing theme link for this instance
    const existing = document.getElementById(linkId);
    if (existing) {
      existing.remove();
    }

    // Add the correct theme
    const link = document.createElement("link");
    link.id = linkId;
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);

    return () => {
      const el = document.getElementById(linkId);
      if (el) el.remove();
    };
  }, [resolvedTheme, id]);

  return (
    <div className={`markdown-body ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          code({ className, children, ...props }) {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="inline-code" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          a({ href, children, ...props }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
