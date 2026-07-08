"use client";

import React from "react";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { css } from "@codemirror/lang-css";
import { javascript, javascriptLanguage, scopeCompletionSource } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";

type CodeEditorProps = {
  value: string;
  onChange?: (value: string) => void;
  language: "css" | "javascript" | "html";
  readOnly?: boolean;
};

const LANGUAGE_EXTENSIONS = { css, javascript, html };

export function CodeEditor({ value, onChange, language, readOnly = false }: CodeEditorProps) {
  const extensions = React.useMemo(() => {
    const list = [
      LANGUAGE_EXTENSIONS[language](),
      EditorView.theme({ "&": { fontSize: "13px" } }),
      EditorView.editable.of(!readOnly),
    ];
    // Suggest real DOM/BOM globals (document, window, console, fetch, localStorage, ...)
    // and their members, instead of just bare JS keyword completions.
    if (language === "javascript" && typeof window !== "undefined") {
      list.push(javascriptLanguage.data.of({ autocomplete: scopeCompletionSource(window) }));
    }
    return list;
  }, [language, readOnly]);

  return (
    <div
      className={`h-full w-full overflow-auto rounded-b-2xl border-t border-zinc-200/60 dark:border-zinc-800/60 ${
        readOnly ? "bg-zinc-50/60 dark:bg-zinc-900/40" : ""
      }`}
    >
      <CodeMirror
        value={value}
        height="100%"
        extensions={extensions}
        onChange={onChange}
        readOnly={readOnly}
        basicSetup={{ lineNumbers: true, foldGutter: true, autocompletion: !readOnly }}
      />
    </div>
  );
}
