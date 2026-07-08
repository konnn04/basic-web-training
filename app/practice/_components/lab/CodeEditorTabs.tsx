"use client";

import React, { useState } from "react";
import { Lock } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeEditor } from "./CodeEditor";
import type { CodePracticeQuestion, LabMode } from "@/lib/code-practice/types";

type FileTab = "html" | "css" | "js";

const TAB_ORDER: FileTab[] = ["html", "css", "js"];
const TAB_LABELS: Record<FileTab, string> = { html: "HTML", css: "CSS", js: "JS" };
const TAB_LANGUAGE: Record<FileTab, "html" | "css" | "javascript"> = {
  html: "html",
  css: "css",
  js: "javascript",
};

type CodeEditorTabsProps = {
  question: CodePracticeQuestion;
  code: string;
  onChange: (value: string) => void;
};

function tabForMode(mode: LabMode): FileTab {
  return mode === "css" ? "css" : "js";
}

export function CodeEditorTabs({ question, code, onChange }: CodeEditorTabsProps) {
  const editableTab = tabForMode(question.editable);
  const [activeTab, setActiveTab] = useState<FileTab>(editableTab);

  const value = activeTab === editableTab ? code : question.files[activeTab];

  return (
    <div className="h-full flex flex-col">
      <div className="px-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FileTab)}>
          <TabsList variant="line">
            {TAB_ORDER.map((tab) => {
              const isEditable = tab === editableTab;
              return (
                <TabsTrigger key={tab} value={tab} className="text-xs font-bold gap-1">
                  {TAB_LABELS[tab]}
                  {!isEditable && <Lock size={11} className="text-zinc-400 dark:text-zinc-600" />}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>
      <div className="flex-1 min-h-0">
        <CodeEditor
          key={activeTab}
          value={value}
          onChange={activeTab === editableTab ? onChange : undefined}
          language={TAB_LANGUAGE[activeTab]}
          readOnly={activeTab !== editableTab}
        />
      </div>
    </div>
  );
}
