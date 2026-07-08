# CSS Lab & JS Lab (code-practice) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build two new practice pages — `/practice/css-lab` and `/practice/js-lab` — where users edit CSS/JS in a code editor, see a live iframe preview, and get realtime pass/fail checking (debounced 500ms) against JSON-defined exercises loaded from `assets/code-practice/`. Also build `/mod/create-practice-test`, an unlinked page to hand-author exercise JSON.

**Architecture:** Server components (`app/practice/css-lab/page.tsx`, `app/practice/js-lab/page.tsx`) read and parse JSON exercise sets from `assets/code-practice/*.json` at request time (same `fs/promises` pattern as the existing `app/practice/page.tsx`) and pass them to a shared client component tree (`app/practice/_components/lab/`). The client tree assembles an HTML document per question (fixed HTML/CSS/JS context + the user's live-edited code for whichever part is `editable`), renders it into a sandboxed iframe, and runs a per-question JS "checker" function against the iframe's `document`/`window` after each debounced edit. Progress and preview snapshots persist in `localStorage` only — no backend/API changes.

**Tech Stack:** Next.js App Router (existing), React 19, `@uiw/react-codemirror` + CodeMirror language packages (new), `react-resizable-panels` (existing, via `components/ui/resizable.tsx`), `react-markdown` (existing, via `components/ui/markdown-renderer.tsx`), Tailwind v4 (existing). No test framework exists in this repo; verification is via `tsc --noEmit` and manual browser checks (per the `verify` skill pattern already used in this project).

## Global Constraints

- Package manager is `pnpm` (lockfile: `pnpm-lock.yaml`) — always use `pnpm add` / `pnpm exec`.
- Path alias `@/*` maps to project root (`tsconfig.json`).
- `strict: true` in `tsconfig.json` — all new code must typecheck cleanly under strict mode.
- Do not touch the existing `/practice`, `/practice/[id]`, `/practice/inspector` routes or `assets/practice/` data — this is a fully separate feature living under `assets/code-practice/`.
- No new backend/API routes: all data loading is via `fs/promises` in server components (matching `app/practice/page.tsx`); all scoring/progress state is client-side (`localStorage`) only.
- `/mod/create-practice-test` must not be linked from any navbar/menu component, and must never write files to disk — it only renders JSON for the user to copy.
- Vietnamese UI copy throughout, matching the tone/style of existing `app/practice` components (see `app/practice/_components/PracticeClient.tsx` for reference — extra-bold headings, `zinc`/`orange` color scheme, `rounded-2xl`/`rounded-xl` cards).

---

## File Structure

```
assets/code-practice/
  css-lab-demo.json          # new — demo problem set, mode "css", 3 questions
  js-lab-demo.json           # new — demo problem set, mode "js", 3 questions

lib/code-practice/
  types.ts                   # new — shared TS types
  build-doc.ts                # new — assembles the iframe HTML document
  run-checker.ts               # new — sandboxed checker execution
  load-sets.ts                 # new — server-only fs loader

app/practice/_components/lab/
  CodeEditor.tsx               # new — CodeMirror wrapper (css | javascript)
  PreviewFrame.tsx             # new — sandboxed iframe + onLoad hook
  QuestionListPanel.tsx        # new — right-hand question/set list + markdown
  LabClient.tsx                 # new — orchestrates state, debounce, localStorage

app/practice/css-lab/page.tsx  # new — server page, mode "css"
app/practice/js-lab/page.tsx   # new — server page, mode "js"

app/practice/preview/page.tsx  # new — full-screen "open in new tab" viewer
app/practice/preview/_components/PreviewPageClient.tsx # new — client logic (Suspense boundary needed for useSearchParams)

app/mod/create-practice-test/page.tsx # new — server wrapper
app/mod/create-practice-test/_components/CreatePracticeTestClient.tsx # new — builder form + JSON export
```

---

### Task 1: Add CodeMirror dependencies

**Status:** Already done during plan authoring/verification — `@uiw/react-codemirror`, `@codemirror/lang-css`, `@codemirror/lang-javascript` are installed in `package.json`/`pnpm-lock.yaml`. (`@codemirror/lang-html` was briefly added then removed — nothing in this plan needs it; `CodeEditor.tsx` only ever renders `css` or `javascript` mode.) The executor should just verify, not re-install.

**Files:**
- Already modified: `package.json`, `pnpm-lock.yaml`

**Interfaces:**
- Produces: `@uiw/react-codemirror` default export `CodeMirror` + named export `EditorView`, `@codemirror/lang-css` export `css()`, `@codemirror/lang-javascript` export `javascript()` — consumed by Task 8 (`CodeEditor.tsx`).

- [ ] **Step 1: Verify install**

Run: `node -e "console.log(require('@uiw/react-codemirror/package.json').version); console.log(require('@codemirror/lang-css/package.json').version); console.log(require('@codemirror/lang-javascript/package.json').version)"`
Expected: prints three version numbers with no error. Do NOT import `@codemirror/view` directly anywhere — it is a transitive dependency only (pnpm will not resolve a direct `require`/`import` of it); use `EditorView` re-exported from `@uiw/react-codemirror` instead (see Task 8).

- [ ] **Step 2: Commit (only if `git status` shows these as uncommitted)**

```bash
git status --short package.json pnpm-lock.yaml
# if changes are shown:
git add package.json pnpm-lock.yaml
git commit -m "chore: add CodeMirror dependencies for code-practice labs"
```

---

### Task 2: Shared types

**Files:**
- Create: `lib/code-practice/types.ts`

**Interfaces:**
- Produces: `LabMode`, `CodePracticeFiles`, `CodePracticeQuestion`, `CodePracticeSet`, `CheckerResult` — consumed by every later task (loader, build-doc, run-checker, all lab components, mod page).

- [ ] **Step 1: Write the types file**

```ts
// lib/code-practice/types.ts

export type LabMode = "css" | "js";

export type CodePracticeFiles = {
  html: string;
  css: string;
  js: string;
};

export type CodePracticeQuestion = {
  id: string;
  title: string;
  description: string;
  points: number;
  files: CodePracticeFiles;
  editable: LabMode;
  starter: string;
  checker: string;
};

export type CodePracticeSet = {
  id: string;
  mode: LabMode;
  title: string;
  description: string;
  questions: CodePracticeQuestion[];
};

export type CheckerResult = {
  pass: boolean;
  message: string;
};
```

- [ ] **Step 2: Verify it typechecks**

Run: `pnpm exec tsc --noEmit`
Expected: no errors referencing `lib/code-practice/types.ts` (other pre-existing errors, if any, are unrelated — confirm by checking the file path in output).

- [ ] **Step 3: Commit**

```bash
git add lib/code-practice/types.ts
git commit -m "feat: add shared types for code-practice labs"
```

---

### Task 3: Document builder (`buildPreviewDocument`)

**Files:**
- Create: `lib/code-practice/build-doc.ts`

**Interfaces:**
- Consumes: `CodePracticeFiles`, `LabMode` from `lib/code-practice/types.ts` (Task 2).
- Produces: `buildPreviewDocument(files: CodePracticeFiles, editable: LabMode, code: string): string` — consumed by `LabClient.tsx` (Task 8) and `CreatePracticeTestClient.tsx` (Task 11, for its own live preview... not required there, only Lab uses it) and `PreviewPageClient.tsx` is NOT needed since preview page stores the already-built string.

- [ ] **Step 1: Write `build-doc.ts`**

```ts
// lib/code-practice/build-doc.ts
import type { CodePracticeFiles, LabMode } from "./types";

export function buildPreviewDocument(
  files: CodePracticeFiles,
  editable: LabMode,
  code: string
): string {
  const cssContent = editable === "css" ? code : files.css;
  const jsContent = editable === "js" ? code : files.js;

  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8" />
<style>
body { font-family: system-ui, sans-serif; margin: 16px; color: #18181b; }
${cssContent}
</style>
</head>
<body>
${files.html}
<script>
${jsContent}
</script>
</body>
</html>`;
}
```

- [ ] **Step 2: Manual verification**

Run:
```bash
node -e "
const { execSync } = require('child_process');
" 2>/dev/null
pnpm exec tsc --noEmit
```
Then confirm in a scratch node/ts-node REPL is unnecessary — instead verify by reasoning: with `files={html:'<p>hi</p>',css:'p{color:red}',js:''}`, `editable='css'`, `code='p{color:blue}'`, the output must contain `p{color:blue}` inside `<style>` and NOT contain `p{color:red}`. This will be exercised end-to-end in Task 8's manual browser check.

Expected: `tsc --noEmit` reports no errors in this file.

- [ ] **Step 3: Commit**

```bash
git add lib/code-practice/build-doc.ts
git commit -m "feat: add iframe document builder for code-practice labs"
```

---

### Task 4: Checker runner (`runChecker`)

**Files:**
- Create: `lib/code-practice/run-checker.ts`

**Interfaces:**
- Consumes: `CheckerResult` from `lib/code-practice/types.ts` (Task 2).
- Produces: `runChecker(checkerBody: string, doc: Document, win: Window, code: string): CheckerResult` — consumed by `PreviewFrame.tsx` / `LabClient.tsx` (Task 8).

- [ ] **Step 1: Write `run-checker.ts`**

```ts
// lib/code-practice/run-checker.ts
import type { CheckerResult } from "./types";

export function runChecker(
  checkerBody: string,
  doc: Document,
  win: Window,
  code: string
): CheckerResult {
  try {
    const fn = new Function("doc", "win", "code", checkerBody) as (
      doc: Document,
      win: Window,
      code: string
    ) => Partial<CheckerResult> | undefined;

    const result = fn(doc, win, code);

    if (!result || typeof result.pass !== "boolean") {
      return {
        pass: false,
        message: "Checker không trả về kết quả hợp lệ ({pass, message}).",
      };
    }

    return {
      pass: result.pass,
      message: result.message ?? (result.pass ? "Chính xác!" : "Chưa đạt yêu cầu."),
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { pass: false, message: `Checker lỗi: ${msg}` };
  }
}
```

- [ ] **Step 2: Verify it typechecks**

Run: `pnpm exec tsc --noEmit`
Expected: no errors in `lib/code-practice/run-checker.ts`.

- [ ] **Step 3: Commit**

```bash
git add lib/code-practice/run-checker.ts
git commit -m "feat: add sandboxed checker runner for code-practice labs"
```

---

### Task 5: Server-side loader (`loadCodePracticeSets`)

**Files:**
- Create: `lib/code-practice/load-sets.ts`

**Interfaces:**
- Consumes: `CodePracticeSet`, `LabMode` from `lib/code-practice/types.ts` (Task 2).
- Produces: `loadCodePracticeSets(mode: LabMode): Promise<CodePracticeSet[]>` — consumed by `app/practice/css-lab/page.tsx` and `app/practice/js-lab/page.tsx` (Task 9).

- [ ] **Step 1: Write `load-sets.ts`**

```ts
// lib/code-practice/load-sets.ts
import fs from "fs/promises";
import path from "path";
import type { CodePracticeSet, LabMode } from "./types";

export async function loadCodePracticeSets(mode: LabMode): Promise<CodePracticeSet[]> {
  const dir = path.join(process.cwd(), "assets", "code-practice");
  const sets: CodePracticeSet[] = [];

  let entries: string[];
  try {
    entries = (await fs.readdir(dir)).filter((f) => f.endsWith(".json"));
  } catch (error) {
    console.error("Không đọc được thư mục assets/code-practice:", error);
    return [];
  }

  for (const fileName of entries) {
    const filePath = path.join(dir, fileName);
    try {
      const raw = await fs.readFile(filePath, "utf-8");
      const parsed = JSON.parse(raw) as CodePracticeSet;

      if (parsed.mode !== mode) continue;

      const validQuestions = parsed.questions.filter((q) => {
        if (q.editable !== mode) {
          console.warn(
            `[code-practice] Bỏ qua câu "${q.id}" trong "${fileName}": editable="${q.editable}" không khớp mode="${mode}"`
          );
          return false;
        }
        if (!q.files || typeof q.files.html !== "string") {
          console.warn(`[code-practice] Bỏ qua câu "${q.id}" trong "${fileName}": thiếu files.html`);
          return false;
        }
        return true;
      });

      sets.push({ ...parsed, questions: validQuestions });
    } catch (error) {
      console.error(`Lỗi đọc/parse file ${fileName}:`, error);
    }
  }

  sets.sort((a, b) => a.id.localeCompare(b.id));
  return sets;
}
```

- [ ] **Step 2: Verify it typechecks**

Run: `pnpm exec tsc --noEmit`
Expected: no errors in `lib/code-practice/load-sets.ts`.

- [ ] **Step 3: Commit**

```bash
git add lib/code-practice/load-sets.ts
git commit -m "feat: add server-side loader for code-practice JSON sets"
```

---

### Task 6: Demo data — CSS lab

**Files:**
- Create: `assets/code-practice/css-lab-demo.json`

**Interfaces:**
- Produces: a `CodePracticeSet` JSON file conforming to Task 2's types, consumed by `loadCodePracticeSets("css")` (Task 5) at runtime.

- [ ] **Step 1: Write the JSON file**

```json
{
  "id": "css-lab-demo",
  "mode": "css",
  "title": "Thực hành CSS cơ bản",
  "description": "Bộ 3 bài luyện chọn selector, thuộc tính màu sắc và layout Flexbox.",
  "questions": [
    {
      "id": "q1-color-selector",
      "title": "Đổi màu chữ tiêu đề",
      "description": "Viết một CSS selector nhắm vào thẻ có `id=\"title\"` và đổi màu chữ (`color`) của nó thành đỏ thuần (`#ff0000` / `red`).",
      "points": 10,
      "files": {
        "html": "<h1 id=\"title\">Xin chào Web!</h1>",
        "css": "",
        "js": ""
      },
      "editable": "css",
      "starter": "/* Viết CSS của bạn ở đây */\n#title {\n\n}\n",
      "checker": "const el = doc.getElementById('title'); if (!el) return { pass: false, message: 'Không tìm thấy phần tử #title.' }; const color = win.getComputedStyle(el).color; if (color === 'rgb(255, 0, 0)') return { pass: true, message: 'Chính xác! Màu chữ đã là đỏ.' }; return { pass: false, message: 'Màu chữ hiện tại là ' + color + ', cần là rgb(255, 0, 0).' };"
    },
    {
      "id": "q2-highlight-class",
      "title": "Tô nền cho ghi chú",
      "description": "Đoạn văn có sẵn class `note`. Hãy viết CSS để đặt màu nền (`background-color`) của nó thành vàng thuần (`#ffff00` / `yellow`).",
      "points": 10,
      "files": {
        "html": "<p class=\"note\">Đây là một ghi chú quan trọng cần được chú ý.</p>",
        "css": "",
        "js": ""
      },
      "editable": "css",
      "starter": "/* Viết CSS của bạn ở đây */\n.note {\n\n}\n",
      "checker": "const el = doc.querySelector('.note'); if (!el) return { pass: false, message: 'Không tìm thấy phần tử .note.' }; const bg = win.getComputedStyle(el).backgroundColor; if (bg === 'rgb(255, 255, 0)') return { pass: true, message: 'Chính xác! Nền đã là màu vàng.' }; return { pass: false, message: 'Màu nền hiện tại là ' + bg + ', cần là rgb(255, 255, 0).' };"
    },
    {
      "id": "q3-flexbox-center",
      "title": "Căn giữa bằng Flexbox",
      "description": "Bên trong `.container` có 3 phần tử `.item`. Hãy dùng Flexbox để căn giữa chúng theo cả chiều ngang và chiều dọc bên trong `.container`.",
      "points": 15,
      "files": {
        "html": "<div class=\"container\" style=\"height:200px;border:1px solid #ccc;\">\n  <div class=\"item\">1</div>\n  <div class=\"item\">2</div>\n  <div class=\"item\">3</div>\n</div>",
        "css": ".item { padding: 8px 14px; margin: 0 4px; background: #eee; }",
        "js": ""
      },
      "editable": "css",
      "starter": "/* Viết CSS của bạn ở đây */\n.container {\n\n}\n",
      "checker": "const el = doc.querySelector('.container'); if (!el) return { pass: false, message: 'Không tìm thấy phần tử .container.' }; const style = win.getComputedStyle(el); if (style.display !== 'flex') return { pass: false, message: 'container cần có display: flex (hiện tại: ' + style.display + ').' }; if (style.justifyContent !== 'center') return { pass: false, message: 'justify-content cần là center (hiện tại: ' + style.justifyContent + ').' }; if (style.alignItems !== 'center') return { pass: false, message: 'align-items cần là center (hiện tại: ' + style.alignItems + ').' }; return { pass: true, message: 'Chính xác! Đã căn giữa bằng Flexbox.' };"
    }
  ]
}
```

- [ ] **Step 2: Verify JSON is valid**

Run: `node -e "JSON.parse(require('fs').readFileSync('assets/code-practice/css-lab-demo.json','utf-8')); console.log('valid')"`
Expected: prints `valid`.

- [ ] **Step 3: Commit**

```bash
git add assets/code-practice/css-lab-demo.json
git commit -m "feat: add CSS lab demo exercise set (3 questions)"
```

---

### Task 7: Demo data — JS lab

**Files:**
- Create: `assets/code-practice/js-lab-demo.json`

**Interfaces:**
- Produces: a `CodePracticeSet` JSON file conforming to Task 2's types, consumed by `loadCodePracticeSets("js")` (Task 5) at runtime.

- [ ] **Step 1: Write the JSON file**

```json
{
  "id": "js-lab-demo",
  "mode": "js",
  "title": "Thực hành JavaScript cơ bản",
  "description": "Bộ 3 bài luyện thao tác DOM, sự kiện và mảng dữ liệu.",
  "questions": [
    {
      "id": "q1-set-text",
      "title": "Hiển thị lời chào",
      "description": "Viết JavaScript để đặt nội dung chữ (`textContent`) của thẻ có `id=\"greeting\"` thành chính xác: `Xin chào, Web!`",
      "points": 10,
      "files": {
        "html": "<h2 id=\"greeting\"></h2>",
        "css": "",
        "js": ""
      },
      "editable": "js",
      "starter": "// Viết JavaScript của bạn ở đây\n",
      "checker": "const el = doc.getElementById('greeting'); if (!el) return { pass: false, message: 'Không tìm thấy phần tử #greeting.' }; if (el.textContent === 'Xin chào, Web!') return { pass: true, message: 'Chính xác!' }; return { pass: false, message: 'Nội dung hiện tại: \"' + el.textContent + '\", cần đúng: \"Xin chào, Web!\"' };"
    },
    {
      "id": "q2-click-counter",
      "title": "Bộ đếm khi bấm nút",
      "description": "Có nút `#incBtn` và ô hiển thị `#count` (đang là `0`). Viết JavaScript để mỗi lần bấm nút, số hiển thị trong `#count` tăng thêm 1.",
      "points": 15,
      "files": {
        "html": "<button id=\"incBtn\">Tăng</button>\n<span id=\"count\">0</span>",
        "css": "",
        "js": ""
      },
      "editable": "js",
      "starter": "// Viết JavaScript của bạn ở đây\n// Gợi ý: document.getElementById('incBtn').addEventListener('click', ...)\n",
      "checker": "const btn = doc.getElementById('incBtn'); const span = doc.getElementById('count'); if (!btn || !span) return { pass: false, message: 'Không tìm thấy #incBtn hoặc #count.' }; btn.click(); btn.click(); btn.click(); if (span.textContent.trim() === '3') return { pass: true, message: 'Chính xác! Bộ đếm hoạt động đúng.' }; return { pass: false, message: 'Sau 3 lần bấm, #count đang là \"' + span.textContent + '\", cần là \"3\".' };"
    },
    {
      "id": "q3-filter-render",
      "title": "Lọc và hiển thị danh sách",
      "description": "Biến toàn cục `window.fruits` chứa mảng tên trái cây. Hãy lọc ra các tên có độ dài lớn hơn 2 ký tự, rồi render mỗi tên còn lại thành một thẻ `<li class=\"list-item\">` bên trong phần tử `#list`.",
      "points": 20,
      "files": {
        "html": "<script>window.fruits = ['áo', 'táo', 'chuối', 'cam', 'dưa hấu'];</script>\n<ul id=\"list\"></ul>",
        "css": "",
        "js": ""
      },
      "editable": "js",
      "starter": "// Viết JavaScript của bạn ở đây\n// window.fruits có sẵn danh sách trái cây\n",
      "checker": "const list = doc.getElementById('list'); if (!list) return { pass: false, message: 'Không tìm thấy phần tử #list.' }; const items = Array.from(list.querySelectorAll('.list-item')).map(li => li.textContent.trim()); const expected = ['táo', 'chuối', 'cam', 'dưa hấu']; const sameLength = items.length === expected.length; const sameSet = sameLength && expected.every(name => items.includes(name)); if (sameSet) return { pass: true, message: 'Chính xác! Danh sách đã được lọc và hiển thị đúng.' }; return { pass: false, message: 'Danh sách hiển thị: [' + items.join(', ') + '], cần chứa đúng: [' + expected.join(', ') + '].' };"
    }
  ]
}
```

- [ ] **Step 2: Verify JSON is valid**

Run: `node -e "JSON.parse(require('fs').readFileSync('assets/code-practice/js-lab-demo.json','utf-8')); console.log('valid')"`
Expected: prints `valid`.

- [ ] **Step 3: Commit**

```bash
git add assets/code-practice/js-lab-demo.json
git commit -m "feat: add JS lab demo exercise set (3 questions)"
```

---

### Task 8: `CodeEditor` component

**Files:**
- Create: `app/practice/_components/lab/CodeEditor.tsx`

**Interfaces:**
- Consumes: `@uiw/react-codemirror`, `@codemirror/lang-css`, `@codemirror/lang-javascript` (Task 1).
- Produces: `CodeEditor` React component with props `{ value: string; onChange: (value: string) => void; language: "css" | "javascript" }` — consumed by `LabClient.tsx` (Task 10) and `CreatePracticeTestClient.tsx` (Task 13, for checker/starter textarea — actually plain textarea there, not required to reuse).

- [ ] **Step 1: Write `CodeEditor.tsx`**

```tsx
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
```

- [ ] **Step 2: Verify it typechecks**

Run: `pnpm exec tsc --noEmit`
Expected: no errors in `app/practice/_components/lab/CodeEditor.tsx`.

- [ ] **Step 3: Commit**

```bash
git add app/practice/_components/lab/CodeEditor.tsx
git commit -m "feat: add CodeMirror-based CodeEditor component"
```

---

### Task 9: `PreviewFrame` component

**Files:**
- Create: `app/practice/_components/lab/PreviewFrame.tsx`

**Interfaces:**
- Produces: `PreviewFrame` React component with props `{ srcDoc: string; onLoadResult: (doc: Document, win: Window) => void; title: string; className?: string }` — consumed by `LabClient.tsx` (Task 10).

- [ ] **Step 1: Write `PreviewFrame.tsx`**

```tsx
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
```

- [ ] **Step 2: Verify it typechecks**

Run: `pnpm exec tsc --noEmit`
Expected: no errors in `app/practice/_components/lab/PreviewFrame.tsx`.

- [ ] **Step 3: Commit**

```bash
git add app/practice/_components/lab/PreviewFrame.tsx
git commit -m "feat: add sandboxed PreviewFrame component"
```

---

### Task 10: `QuestionListPanel` component

**Files:**
- Create: `app/practice/_components/lab/QuestionListPanel.tsx`

**Interfaces:**
- Consumes: `CodePracticeSet`, `CodePracticeQuestion` from `lib/code-practice/types.ts` (Task 2); `MarkdownRenderer` from `components/ui/markdown-renderer.tsx` (existing); `Badge` from `components/ui/badge.tsx` (existing).
- Produces: `QuestionListPanel` component with props `{ sets: CodePracticeSet[]; activeQuestionId: string; results: Record<string, { pass: boolean; message: string }>; onSelect: (setId: string, questionId: string) => void }` — consumed by `LabClient.tsx` (Task 11).

- [ ] **Step 1: Write `QuestionListPanel.tsx`**

```tsx
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
```

- [ ] **Step 2: Verify it typechecks**

Run: `pnpm exec tsc --noEmit`
Expected: no errors in `app/practice/_components/lab/QuestionListPanel.tsx`. If `components/ui/markdown-renderer.tsx` does not export `MarkdownRenderer` as a named export, adjust the import to match its actual export (check with `grep -n "^export" components/ui/markdown-renderer.tsx` before writing this step).

- [ ] **Step 3: Commit**

```bash
git add app/practice/_components/lab/QuestionListPanel.tsx
git commit -m "feat: add QuestionListPanel component for code-practice labs"
```

---

### Task 11: `LabClient` orchestrator component

**Files:**
- Create: `app/practice/_components/lab/LabClient.tsx`

**Interfaces:**
- Consumes: `CodePracticeSet`, `LabMode` (Task 2); `buildPreviewDocument` (Task 3); `runChecker` (Task 4); `CodeEditor` (Task 8); `PreviewFrame` (Task 9); `QuestionListPanel` (Task 10); `ResizablePanelGroup`/`ResizablePanel`/`ResizableHandle` from `components/ui/resizable.tsx` (existing).
- Produces: `LabClient` component with props `{ mode: LabMode; sets: CodePracticeSet[]; pageTitle: string }` — consumed by `app/practice/css-lab/page.tsx` and `app/practice/js-lab/page.tsx` (Task 12).

- [ ] **Step 1: Write `LabClient.tsx`**

```tsx
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
```

- [ ] **Step 2: Verify it typechecks**

Run: `pnpm exec tsc --noEmit`
Expected: no errors in `app/practice/_components/lab/LabClient.tsx`. Confirmed against the installed package: `ResizablePanelGroup` takes an `orientation: "horizontal" | "vertical"` prop (not `direction`) — the code above already uses `orientation`.

- [ ] **Step 3: Commit**

```bash
git add app/practice/_components/lab/LabClient.tsx
git commit -m "feat: add LabClient orchestrator for code-practice labs"
```

---

### Task 12: `css-lab` and `js-lab` pages

**Files:**
- Create: `app/practice/css-lab/page.tsx`
- Create: `app/practice/js-lab/page.tsx`

**Interfaces:**
- Consumes: `loadCodePracticeSets` (Task 5), `LabClient` (Task 11).

- [ ] **Step 1: Write `app/practice/css-lab/page.tsx`**

```tsx
import React from "react";
import { loadCodePracticeSets } from "@/lib/code-practice/load-sets";
import { LabClient } from "../_components/lab/LabClient";

export default async function CssLabPage() {
  const sets = await loadCodePracticeSets("css");
  return <LabClient mode="css" sets={sets} pageTitle="Thực hành CSS" />;
}
```

- [ ] **Step 2: Write `app/practice/js-lab/page.tsx`**

```tsx
import React from "react";
import { loadCodePracticeSets } from "@/lib/code-practice/load-sets";
import { LabClient } from "../_components/lab/LabClient";

export default async function JsLabPage() {
  const sets = await loadCodePracticeSets("js");
  return <LabClient mode="js" sets={sets} pageTitle="Thực hành JavaScript" />;
}
```

- [ ] **Step 3: Manual browser verification**

Run: `pnpm dev` (leave running), then open `http://localhost:3000/practice/css-lab` in a browser.

Expected:
- Page loads with 3 questions listed on the right, first question ("Đổi màu chữ tiêu đề") selected.
- Left-top shows preview iframe rendering "Xin chào Web!"; left-bottom shows CodeMirror editor with starter CSS.
- Typing `color: red;` inside the `#title {}` block in the editor causes (after ~500ms) the badge next to the question to turn into a green checkmark, and clicking the question shows message "Chính xác! Màu chữ đã là đỏ." in Vietnamese.
- Repeat check on `http://localhost:3000/practice/js-lab`: typing a `document.getElementById('greeting').textContent = 'Xin chào, Web!';` in question 1 flips its badge to green.
- Confirm panels are resizable by dragging the handles.

Then stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add app/practice/css-lab/page.tsx app/practice/js-lab/page.tsx
git commit -m "feat: add /practice/css-lab and /practice/js-lab pages"
```

---

### Task 13: Full-screen preview page (`/practice/preview`)

**Files:**
- Create: `app/practice/preview/page.tsx`
- Create: `app/practice/preview/_components/PreviewPageClient.tsx`

**Interfaces:**
- Consumes: nothing new — reads `localStorage` directly using the `key` query param written by `LabClient.tsx`'s `handleOpenNewTab` (Task 11).

- [ ] **Step 1: Write `app/practice/preview/_components/PreviewPageClient.tsx`**

```tsx
"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export function PreviewPageClient() {
  const searchParams = useSearchParams();
  const key = searchParams.get("key");
  const [srcDoc, setSrcDoc] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!key) {
      setNotFound(true);
      return;
    }
    const stored = window.localStorage.getItem(key);
    if (!stored) {
      setNotFound(true);
      return;
    }
    setSrcDoc(stored);
  }, [key]);

  if (notFound) {
    return (
      <div className="h-screen w-screen flex items-center justify-center text-center px-4">
        <p className="text-sm text-zinc-500">
          Không tìm thấy dữ liệu xem trước. Hãy quay lại trang thực hành và bấm "Mở tab mới xem to hơn" lại.
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
```

- [ ] **Step 2: Write `app/practice/preview/page.tsx`**

```tsx
import React, { Suspense } from "react";
import { PreviewPageClient } from "./_components/PreviewPageClient";

export default function PreviewPage() {
  return (
    <Suspense fallback={null}>
      <PreviewPageClient />
    </Suspense>
  );
}
```

- [ ] **Step 3: Manual browser verification**

Run: `pnpm dev`, open `/practice/css-lab`, click "Mở tab mới xem to hơn".

Expected: a new tab opens at `/practice/preview?key=practice-preview:css:css-lab-demo:q1-color-selector` showing the same rendered preview full-screen, no navbar/chrome around it.

Then stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add app/practice/preview/page.tsx app/practice/preview/_components/PreviewPageClient.tsx
git commit -m "feat: add full-screen preview page for code-practice labs"
```

---

### Task 14: `/mod/create-practice-test` builder page

**Files:**
- Create: `app/mod/create-practice-test/page.tsx`
- Create: `app/mod/create-practice-test/_components/CreatePracticeTestClient.tsx`

**Interfaces:**
- Consumes: `CodePracticeSet`, `CodePracticeQuestion`, `LabMode` from `lib/code-practice/types.ts` (Task 2); `Button`, `Input`, `Textarea`, `Card`/`CardContent`/`CardHeader`/`CardTitle` from existing `components/ui/*`.
- Produces: a standalone builder UI. Not consumed by any other task (leaf feature) — reachable only by typing the URL directly (no nav link is added anywhere).

- [ ] **Step 1: Write `app/mod/create-practice-test/_components/CreatePracticeTestClient.tsx`**

```tsx
"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Copy, Check } from "lucide-react";
import type { LabMode } from "@/lib/code-practice/types";

type DraftQuestion = {
  id: string;
  title: string;
  description: string;
  points: number;
  html: string;
  css: string;
  js: string;
  starter: string;
  checker: string;
};

function emptyQuestion(index: number): DraftQuestion {
  return {
    id: `q${index}`,
    title: "",
    description: "",
    points: 10,
    html: "",
    css: "",
    js: "",
    starter: "",
    checker: "",
  };
}

export function CreatePracticeTestClient() {
  const [mode, setMode] = useState<LabMode>("css");
  const [setId, setSetId] = useState("my-lab-set");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<DraftQuestion[]>([emptyQuestion(1)]);
  const [copied, setCopied] = useState(false);

  const updateQuestion = (index: number, patch: Partial<DraftQuestion>) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  };

  const addQuestion = () => setQuestions((prev) => [...prev, emptyQuestion(prev.length + 1)]);
  const removeQuestion = (index: number) =>
    setQuestions((prev) => prev.filter((_, i) => i !== index));

  const json = useMemo(() => {
    const set = {
      id: setId,
      mode,
      title,
      description,
      questions: questions.map((q) => ({
        id: q.id,
        title: q.title,
        description: q.description,
        points: q.points,
        files: { html: q.html, css: q.css, js: q.js },
        editable: mode,
        starter: q.starter,
        checker: q.checker,
      })),
    };
    return JSON.stringify(set, null, 2);
  }, [setId, mode, title, description, questions]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 max-w-5xl py-8 flex-grow space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-zinc-950 dark:text-white">
          Công cụ tạo đề code-practice
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Điền thông tin bên dưới rồi copy JSON, dán vào file trong <code>assets/code-practice/</code>.
        </p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-sm font-extrabold">Thông tin bộ đề</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500">Chế độ (mode)</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as LabMode)}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs font-bold"
              >
                <option value="css">css</option>
                <option value="js">js</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500">ID bộ đề (tên file gợi ý)</label>
              <Input value={setId} onChange={(e) => setSetId(e.target.value)} className="text-xs" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500">Tiêu đề</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-xs" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500">Mô tả</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="text-xs" />
          </div>
        </CardContent>
      </Card>

      {questions.map((q, index) => (
        <Card key={index} className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-extrabold">Câu {index + 1}</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeQuestion(index)}
              className="text-zinc-400 hover:text-red-500 cursor-pointer"
            >
              <Trash2 size={14} />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500">ID câu hỏi</label>
                <Input value={q.id} onChange={(e) => updateQuestion(index, { id: e.target.value })} className="text-xs" />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-zinc-500">Tiêu đề câu hỏi</label>
                <Input value={q.title} onChange={(e) => updateQuestion(index, { title: e.target.value })} className="text-xs" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500">Mô tả / yêu cầu (markdown)</label>
              <Textarea value={q.description} onChange={(e) => updateQuestion(index, { description: e.target.value })} rows={3} className="text-xs" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500">Điểm</label>
              <Input
                type="number"
                value={q.points}
                onChange={(e) => updateQuestion(index, { points: Number(e.target.value) || 0 })}
                className="text-xs w-32"
              />
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500">HTML (bắt buộc)</label>
                <Textarea value={q.html} onChange={(e) => updateQuestion(index, { html: e.target.value })} rows={5} className="text-xs font-mono" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500">CSS (nếu có)</label>
                <Textarea value={q.css} onChange={(e) => updateQuestion(index, { css: e.target.value })} rows={5} className="text-xs font-mono" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500">JS (nếu có)</label>
                <Textarea value={q.js} onChange={(e) => updateQuestion(index, { js: e.target.value })} rows={5} className="text-xs font-mono" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500">
                Code khởi tạo (starter) cho phần "{mode}" người học sẽ sửa
              </label>
              <Textarea value={q.starter} onChange={(e) => updateQuestion(index, { starter: e.target.value })} rows={3} className="text-xs font-mono" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500">
                Checker (thân hàm JS, nhận doc, win, code — trả về &#123; pass, message &#125;)
              </label>
              <Textarea value={q.checker} onChange={(e) => updateQuestion(index, { checker: e.target.value })} rows={4} className="text-xs font-mono" />
            </div>
          </CardContent>
        </Card>
      ))}

      <Button onClick={addQuestion} variant="outline" className="rounded-xl text-xs font-bold gap-1.5 cursor-pointer">
        <Plus size={14} />
        Thêm câu hỏi
      </Button>

      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-extrabold">JSON xuất ra</CardTitle>
          <Button onClick={handleCopy} size="sm" className="rounded-xl text-xs font-bold gap-1.5 cursor-pointer">
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? "Đã copy" : "Copy JSON"}
          </Button>
        </CardHeader>
        <CardContent>
          <pre className="bg-zinc-950 text-zinc-200 text-[11px] font-mono p-4 rounded-xl overflow-x-auto max-h-[400px] select-all">
            {json}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Write `app/mod/create-practice-test/page.tsx`**

```tsx
import React from "react";
import { CreatePracticeTestClient } from "./_components/CreatePracticeTestClient";

export default function CreatePracticeTestPage() {
  return <CreatePracticeTestClient />;
}
```

- [ ] **Step 3: Manual browser verification**

Run: `pnpm dev`, open `http://localhost:3000/mod/create-practice-test`.

Expected:
- Form renders with mode selector, set metadata fields, and one question block.
- Filling in fields updates the JSON preview at the bottom live.
- "Thêm câu hỏi" adds a second question block with `id: "q2"`.
- "Copy JSON" copies valid JSON to clipboard (paste into a text editor to confirm it parses, e.g. via browser devtools `JSON.parse(await navigator.clipboard.readText())`).
- Confirm `grep -rn "create-practice-test" components/navbar.tsx` returns nothing (page is not linked anywhere).

Then stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add app/mod/create-practice-test/page.tsx app/mod/create-practice-test/_components/CreatePracticeTestClient.tsx
git commit -m "feat: add /mod/create-practice-test exercise builder page"
```

---

### Task 15: Final integration pass

**Files:**
- None created — verification only. May produce small fixups to any file above if issues are found.

- [ ] **Step 1: Full project typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no errors anywhere under `lib/code-practice/`, `app/practice/css-lab/`, `app/practice/js-lab/`, `app/practice/preview/`, `app/practice/_components/lab/`, `app/mod/`.

- [ ] **Step 2: Full project lint**

Run: `pnpm lint`
Expected: no new lint errors in the files created by this plan.

- [ ] **Step 3: Full production build**

Run: `pnpm build`
Expected: build succeeds; `/practice/css-lab`, `/practice/js-lab`, `/practice/preview`, `/mod/create-practice-test` all appear in the route list Next.js prints.

- [ ] **Step 4: End-to-end manual walkthrough**

Run: `pnpm dev`. In the browser:
1. `/practice/css-lab` → solve all 3 questions (see checker logic in Task 6) → confirm all 3 badges turn green and reload the page to confirm progress persists (localStorage).
2. `/practice/js-lab` → solve all 3 questions (see checker logic in Task 7) → confirm all 3 badges turn green and persist after reload.
3. Confirm the existing `/practice`, `/practice/1-forms` (or any existing id under `assets/practice`), and `/practice/inspector` pages still work unmodified.
4. `/mod/create-practice-test` → build a throwaway question, copy JSON, confirm it round-trips through `JSON.parse`.

Then stop the dev server.

- [ ] **Step 5: Commit (only if fixups were needed)**

```bash
git add -A
git commit -m "fix: address integration issues found in final code-practice labs pass"
```
