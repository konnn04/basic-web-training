"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { CodeEditorTabs } from "./CodeEditorTabs";
import { PreviewFrame } from "./PreviewFrame";
import { QuestionSidebar } from "./QuestionSidebar";
import { QuestionDescriptionPanel } from "./QuestionDescriptionPanel";
import { buildPreviewDocument } from "@/lib/code-practice/build-doc";
import { runChecker } from "@/lib/code-practice/run-checker";
import { useUser } from "@/hooks/use-user";
import { idbGet, idbSet } from "@/lib/idb-store";
import type { CodePracticeSet, LabMode, CodePracticeQuestion } from "@/lib/code-practice/types";

const SIDEBAR_COLLAPSED_KEY = "practice:sidebar-collapsed";

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
  const { currentUser, userEmail, userImage, isLoggedIn } = useUser();
  const firstSet = sets[0];
  const firstQuestion = firstSet?.questions[0];

  const [activeSetId, setActiveSetId] = useState(firstSet?.id ?? "");
  const [activeQuestionId, setActiveQuestionId] = useState(firstQuestion?.id ?? "");
  const [code, setCode] = useState(firstQuestion?.starter ?? "");
  const [srcDoc, setSrcDoc] = useState("");
  const [results, setResults] = useState<Record<string, ProgressEntry>>({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => typeof window !== "undefined" && window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1"
  );

  const toggleSidebarCollapsed = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0");
      return next;
    });
  }, []);

  const activeQuestion = useMemo(
    () => findQuestion(sets, activeSetId, activeQuestionId),
    [sets, activeSetId, activeQuestionId]
  );

  // Preload pass/fail status for every question in every set up front, so the sidebar
  // shows overall progress immediately instead of only after visiting each question.
  useEffect(() => {
    let cancelled = false;

    Promise.all(
      sets.flatMap((set) =>
        set.questions.map(async (q) => {
          const saved = await idbGet<ProgressEntry>(progressKey(mode, set.id, q.id));
          return saved ? ([q.id, saved] as const) : null;
        })
      )
    ).then((entries) => {
      if (cancelled) return;
      const loaded = entries.filter((e): e is readonly [string, ProgressEntry] => e !== null);
      if (loaded.length === 0) return;
      setResults((prev) => ({ ...Object.fromEntries(loaded), ...prev }));
    });

    return () => {
      cancelled = true;
    };
  }, [sets, mode]);

  // Load code + progress for the active question (from IndexedDB, falling back to starter)
  useEffect(() => {
    if (!activeQuestion) return;
    let cancelled = false;
    const key = progressKey(mode, activeSetId, activeQuestionId);

    idbGet<ProgressEntry>(key).then((saved) => {
      if (cancelled) return;
      if (saved) {
        setCode(saved.code);
        setResults((prev) => ({ ...prev, [activeQuestionId]: saved }));
      } else {
        setCode(activeQuestion.starter);
      }
    });

    return () => {
      cancelled = true;
    };
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
      const wasPassing = results[activeQuestion.id]?.pass === true;
      setResults((prev) => ({ ...prev, [activeQuestion.id]: entry }));
      idbSet(progressKey(mode, activeSetId, activeQuestion.id), entry).catch((err) =>
        console.error("Không thể lưu tiến độ vào IndexedDB:", err)
      );

      // Record the pass on the server for the leaderboard — requires a real Google login
      // (userEmail), once per question per pass transition.
      if (result.pass && !wasPassing && isLoggedIn && userEmail) {
        fetch("/api/practice/results", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode,
            setId: activeSetId,
            questionId: activeQuestion.id,
            points: activeQuestion.points,
            userName: currentUser,
            userEmail,
            userImage: userImage || undefined,
          }),
        }).catch((err) => console.error("Không thể gửi kết quả thực hành:", err));
      }
    },
    [activeQuestion, code, mode, activeSetId, results, currentUser, userEmail, userImage, isLoggedIn]
  );

  const handleSelect = (setId: string, questionId: string) => {
    setActiveSetId(setId);
    setActiveQuestionId(questionId);
  };

  const handleOpenNewTab = async () => {
    if (!activeQuestion || typeof window === "undefined") return;
    const newTab = window.open("", "_blank");
    const key = previewKey(mode, activeSetId, activeQuestion.id);
    await idbSet(key, srcDoc);
    if (newTab) {
      newTab.location.href = `/practice/preview?key=${encodeURIComponent(key)}`;
    }
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

      <div className="flex-1 flex min-h-0">
        <div
          className={`shrink-0 min-h-0 border-r border-zinc-200/60 dark:border-zinc-800/60 transition-[width] duration-200 ${
            sidebarCollapsed ? "w-14" : "w-64"
          }`}
        >
          <QuestionSidebar
            sets={sets}
            activeSetId={activeSetId}
            activeQuestionId={activeQuestionId}
            results={results}
            collapsed={sidebarCollapsed}
            onToggleCollapsed={toggleSidebarCollapsed}
            onSelect={handleSelect}
          />
        </div>

        <ResizablePanelGroup orientation="horizontal" className="flex-1">
          <ResizablePanel defaultSize={30} minSize={20}>
            <QuestionDescriptionPanel
              question={activeQuestion}
              result={results[activeQuestion.id]}
              isLoggedIn={isLoggedIn}
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={70} minSize={40}>
            <ResizablePanelGroup orientation="horizontal">
              <ResizablePanel defaultSize={55} minSize={30}>
                <CodeEditorTabs
                  key={activeQuestion.id}
                  question={activeQuestion}
                  code={code}
                  onChange={setCode}
                />
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={45} minSize={20}>
                <PreviewFrame srcDoc={srcDoc} onLoadResult={handleLoadResult} title="Xem trước" />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
