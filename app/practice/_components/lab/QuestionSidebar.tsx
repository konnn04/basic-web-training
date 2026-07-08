"use client";

import React, { useState } from "react";
import { CheckCircle2, XCircle, Circle, PanelLeftClose, PanelLeft, ChevronDown } from "lucide-react";
import type { CodePracticeSet } from "@/lib/code-practice/types";

type QuestionSidebarProps = {
  sets: CodePracticeSet[];
  activeSetId: string;
  activeQuestionId: string;
  results: Record<string, { pass: boolean; message: string }>;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onSelect: (setId: string, questionId: string) => void;
};

export function QuestionSidebar({
  sets,
  activeSetId,
  activeQuestionId,
  results,
  collapsed,
  onToggleCollapsed,
  onSelect,
}: QuestionSidebarProps) {
  // Explicit user overrides for which sets are expanded/collapsed. Sets the user hasn't
  // touched default to "open only if it contains the active question" — computed at
  // render time so switching questions auto-opens the right set with no effect needed.
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  const isSetOpen = (setId: string) => overrides[setId] ?? setId === activeSetId;

  const toggleSet = (setId: string) => {
    setOverrides((prev) => ({ ...prev, [setId]: !isSetOpen(setId) }));
  };
  return (
    <div className="h-full min-h-0 flex flex-col bg-zinc-50/40 dark:bg-zinc-900/20">
      <div className={`flex items-center px-3 py-2.5 border-b border-zinc-200/60 dark:border-zinc-800/60 ${collapsed ? "justify-center" : "justify-between"}`}>
        {!collapsed && (
          <span className="text-xs font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Danh sách đề
          </span>
        )}
        <button
          onClick={onToggleCollapsed}
          className="text-zinc-400 hover:text-orange-500 transition-colors cursor-pointer"
          title={collapsed ? "Mở rộng" : "Thu gọn"}
        >
          {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-3">
        {sets.map((set) => {
          const solvedCount = set.questions.filter((q) => results[q.id]?.pass).length;
          const isOpen = collapsed || isSetOpen(set.id);

          return (
            <div key={set.id} className="space-y-1.5">
              {!collapsed && (
                <button
                  onClick={() => toggleSet(set.id)}
                  className="w-full flex items-center justify-between gap-2 px-2 py-1 rounded-lg hover:bg-white dark:hover:bg-zinc-900/50 transition-colors cursor-pointer"
                >
                  <h2 className="text-[11px] font-extrabold text-zinc-700 dark:text-zinc-300 truncate">
                    {set.title}
                  </h2>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500">
                      {solvedCount}/{set.questions.length}
                    </span>
                    <ChevronDown
                      size={13}
                      className={`text-zinc-400 transition-transform ${isOpen ? "" : "-rotate-90"}`}
                    />
                  </div>
                </button>
              )}
              {isOpen && (
                <div className="space-y-1">
                  {set.questions.map((q) => {
                    const result = results[q.id];
                    const isActive = q.id === activeQuestionId;
                    const StatusIcon =
                      result === undefined ? Circle : result.pass ? CheckCircle2 : XCircle;
                    const statusColor =
                      result === undefined
                        ? "text-zinc-300 dark:text-zinc-700"
                        : result.pass
                          ? "text-green-500"
                          : "text-red-500";

                    return (
                      <button
                        key={q.id}
                        onClick={() => onSelect(set.id, q.id)}
                        title={q.title}
                        className={`w-full flex items-center gap-2 rounded-lg border px-2 py-2 text-left transition-colors cursor-pointer ${
                          isActive
                            ? "border-orange-500/60 bg-orange-50/50 dark:bg-orange-950/15"
                            : "border-transparent hover:border-zinc-200/70 dark:hover:border-zinc-800/70 hover:bg-white dark:hover:bg-zinc-900/50"
                        } ${collapsed ? "justify-center" : ""}`}
                      >
                        <StatusIcon size={14} className={`shrink-0 ${statusColor}`} />
                        {!collapsed && (
                          <span
                            className={`flex-1 truncate text-xs font-bold ${
                              isActive ? "text-orange-600 dark:text-orange-400" : "text-zinc-700 dark:text-zinc-300"
                            }`}
                          >
                            {q.title}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
