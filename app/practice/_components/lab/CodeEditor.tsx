"use client";

import React from "react";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { css } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";

type CodeEditorProps = {
  value: string;
  onChange: (value: string) => void;
  language: "css" | "javascript";
};

export function CodeEditor({ value, onChange, language }: CodeEditorProps) {
  const extensions = React.useMemo(
    () => [
      language === "css" ? css() : javascript(),
      EditorView.theme({ "&": { fontSize: "13px" } }),
    ],
    [language]
  );

  return (
    <div className="h-full w-full overflow-auto rounded-b-2xl border-t border-zinc-200/60 dark:border-zinc-800/60">
      <CodeMirror
        value={value}
        height="100%"
        extensions={extensions}
        onChange={onChange}
        basicSetup={{ lineNumbers: true, foldGutter: true, autocompletion: true }}
      />
    </div>
  );
}
