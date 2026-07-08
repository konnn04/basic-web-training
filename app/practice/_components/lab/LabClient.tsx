"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { CodeEditor } from "./CodeEditor";
import { PreviewFrame } from "./PreviewFrame";
import { QuestionListPanel } from "./QuestionListPanel";
import { buildPreviewDocument } from "@/lib/code-practice/build-doc";
import { runChecker } from "@/lib/code-practice/run-checker";
import type { CodePracticeSet, LabMode, CodePracticeQuestion } from "@/lib/code-practice/types";

type LabClientProps = {
  mode: LabMode;
  sets: CodePracticeSet[];
  pageTitle: string;
};

type ProgressEntry = { code: string; pass: boolean; message: string };

function progressKey(mode: LabMode, setId: string, questionId: string) {
  return `practice:${mode}:${setId}:${questionId}`;
}

function previewKey(mode: LabMode, setId: string, questionId: string) {
  return `practice-preview:${mode}:${setId}:${questionId}`;
}

function findQuestion(
  sets: CodePracticeSet[],
  setId: string,
  questionId: string
): CodePracticeQuestion | undefined {
  return sets.find((s) => s.id === setId)?.questions.find((q) => q.id === questionId);
}

export function LabClient({ mode, sets, pageTitle }: LabClientProps) {
  const firstSet = sets[0];
  const firstQuestion = firstSet?.questions[0];

  const [activeSetId, setActiveSetId] = useState(firstSet?.id ?? "");
  const [activeQuestionId, setActiveQuestionId] = useState(firstQuestion?.id ?? "");
  const [code, setCode] = useState(firstQuestion?.starter ?? "");
  const [srcDoc, setSrcDoc] = useState("");
  const [results, setResults] = useState<Record<string, ProgressEntry>>({});

  const activeQuestion = useMemo(
    () => findQuestion(sets, activeSetId, activeQuestionId),
    [sets, activeSetId, activeQuestionId]
  );

  // Load code + progress for the active question (from localStorage, falling back to starter)
  useEffect(() => {
    if (!activeQuestion) return;
    const key = progressKey(mode, activeSetId, activeQuestionId);
    const saved = typeof window !== "undefined" ? window.localStorage.getItem(key) : null;

    if (saved) {
      try {
        const parsed: ProgressEntry = JSON.parse(saved);
        setCode(parsed.code);
        setResults((prev) => ({ ...prev, [activeQuestionId]: parsed }));
        return;
      } catch {
        // fall through to starter
      }
    }
    setCode(activeQuestion.starter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSetId, activeQuestionId]);

  // Debounced build + check
  useEffect(() => {
    if (!activeQuestion) return;
    const timer = setTimeout(() => {
      const doc = buildPreviewDocument(activeQuestion.files, activeQuestion.editable, code);
      setSrcDoc(doc);
    }, 500);
    return () => clearTimeout(timer);
  }, [code, activeQuestion]);

  const handleLoadResult = useCallback(
    (doc: Document, win: Window) => {
      if (!activeQuestion) return;
      const result = runChecker(activeQuestion.checker, doc, win, code);
      const entry: ProgressEntry = { code, pass: result.pass, message: result.message };
      setResults((prev) => ({ ...prev, [activeQuestion.id]: entry }));
      if (typeof window !== "undefined") {
        window.localStorage.setItem(progressKey(mode, activeSetId, activeQuestion.id), JSON.stringify(entry));
      }
    },
    [activeQuestion, code, mode, activeSetId]
  );

  const handleSelect = (setId: string, questionId: string) => {
    setActiveSetId(setId);
    setActiveQuestionId(questionId);
  };

  const handleOpenNewTab = () => {
    if (!activeQuestion || typeof window === "undefined") return;
    const key = previewKey(mode, activeSetId, activeQuestion.id);
    window.localStorage.setItem(key, srcDoc);
    window.open(`/practice/preview?key=${encodeURIComponent(key)}`, "_blank");
  };

  if (!activeQuestion) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md text-center flex-grow flex flex-col justify-center">
        <p className="text-sm text-zinc-500">Chưa có bộ đề nào trong assets/code-practice cho mục này.</p>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col h-[calc(100vh-var(--navbar-height,64px))]">
      <div className="px-4 py-3 border-b border-zinc-200/50 dark:border-zinc-800/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/practice" className="text-zinc-500 hover:text-orange-500 transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <Terminal className="text-orange-500 h-4.5 w-4.5" />
          <h1 className="text-sm font-extrabold text-zinc-900 dark:text-white">{pageTitle}</h1>
        </div>
        <Button
          onClick={handleOpenNewTab}
          variant="outline"
          size="sm"
          className="rounded-xl text-xs font-bold gap-1.5 cursor-pointer"
        >
          <ExternalLink size={13} />
          Mở tab mới xem to hơn
        </Button>
      </div>

      <ResizablePanelGroup orientation="horizontal" className="flex-1">
        <ResizablePanel defaultSize={60} minSize={35}>
          <ResizablePanelGroup orientation="vertical">
            <ResizablePanel defaultSize={55} minSize={20}>
              <PreviewFrame srcDoc={srcDoc} onLoadResult={handleLoadResult} title="Xem trước" />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={45} minSize={20}>
              <CodeEditor
                value={code}
                onChange={setCode}
                language={mode === "css" ? "css" : "javascript"}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={40} minSize={25}>
          <QuestionListPanel
            sets={sets}
            activeQuestionId={activeQuestionId}
            results={results}
            onSelect={handleSelect}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
