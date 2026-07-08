"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { CheckCircle2, XCircle, Circle } from "lucide-react";
import type { CodePracticeSet } from "@/lib/code-practice/types";

type QuestionListPanelProps = {
  sets: CodePracticeSet[];
  activeQuestionId: string;
  results: Record<string, { pass: boolean; message: string }>;
  onSelect: (setId: string, questionId: string) => void;
};

export function QuestionListPanel({ sets, activeQuestionId, results, onSelect }: QuestionListPanelProps) {
  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      {sets.map((set) => (
        <div key={set.id} className="space-y-3">
          <div>
            <h2 className="text-sm font-extrabold text-zinc-900 dark:text-white">{set.title}</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{set.description}</p>
          </div>

          <div className="space-y-2">
            {set.questions.map((q) => {
              const result = results[q.id];
              const isActive = q.id === activeQuestionId;

              return (
                <button
                  key={q.id}
                  onClick={() => onSelect(set.id, q.id)}
                  className={`w-full text-left rounded-xl border p-3 transition-colors cursor-pointer ${
                    isActive
                      ? "border-orange-500/60 bg-orange-50/40 dark:bg-orange-950/10"
                      : "border-zinc-200/60 dark:border-zinc-800/60 hover:border-orange-300/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{q.title}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant="secondary" className="text-[9px] font-bold rounded-full">
                        {q.points} điểm
                      </Badge>
                      {result === undefined ? (
                        <Circle size={14} className="text-zinc-300 dark:text-zinc-700" />
                      ) : result.pass ? (
                        <CheckCircle2 size={14} className="text-green-500" />
                      ) : (
                        <XCircle size={14} className="text-red-500" />
                      )}
                    </div>
                  </div>

                  {isActive && (
                    <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                      <MarkdownRenderer content={q.description} />
                      {result && (
                        <p className={`mt-2 text-[11px] font-bold ${result.pass ? "text-green-600" : "text-red-500"}`}>
                          {result.message}
                        </p>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
