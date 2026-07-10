# Code Lab Layout Redesign

Date: 2026-07-08

## Context

`/practice/css-lab` and `/practice/js-lab` share `LabClient.tsx`. Current layout:
left 60% = Preview (top) / CodeEditor (bottom, fit-content height, no tabs),
right 40% = `QuestionListPanel` (list of question sets + inline description +
result, expands on select).

Problems raised by the user:
- Preview/code should not dominate the left side — the problem statement
  ("đề") deserves its own clear space.
- The code editor has no way to see the sibling files (e.g. the fixed HTML
  markup when editing CSS) for context.
- The editor's height collapses to fit-content instead of filling available
  space.
- The question list UI is plain; it should read as a sidebar of available
  exercises, separate from the description of the currently selected one.

## Layout

Three columns, left to right:

1. **Sidebar (collapsible, ~240px expanded / icon-rail collapsed)** — list of
   sets and questions only: title, points badge, pass/fail/unattempted icon.
   No inline description. Collapse state toggled by a button, persisted in
   `localStorage` (key: `practice:sidebar-collapsed`).
2. **Description column** — shows the markdown description of the active
   question and the last check result (pass/fail + message), styled as a
   clear card, not embedded in the sidebar.
3. **Code column** — split horizontally:
   - **Editor (left half)**: 3 fixed tabs, HTML / CSS / JS. Only the tab
     matching the question's `editable` mode is editable; the other two are
     read-only CodeMirror instances showing `question.files.{html,css,js}`
     verbatim, with a lock icon and slightly muted styling. Editor fills the
     full height of its panel (no fit-content collapse).
   - **Preview (right half)**: iframe, same behavior as today (`onLoadResult`
     triggers the checker).

All three columns are resizable via `ResizablePanelGroup` except the sidebar,
which only resizes between its two fixed states (expanded/collapsed), not
freely draggable.

## Components

- `LabClient.tsx` — updated to orchestrate 3-column `ResizablePanelGroup`,
  own `sidebarCollapsed` state (init from localStorage, effect to persist),
  and pass active tab state down.
- `QuestionListPanel.tsx` → split into:
  - `QuestionSidebar.tsx` — set/question list only, collapsible.
  - `QuestionDescriptionPanel.tsx` — markdown description + result card for
    the active question.
- `CodeEditor.tsx` — add `readOnly?: boolean` prop; when true, configure
  CodeMirror as non-editable (`EditorView.editable.of(false)` +
  `basicSetup.highlightActiveLine: false` optional) and apply muted
  styling. Wrap with a new `CodeEditorTabs.tsx` that renders the 3 tab
  buttons (HTML/CSS/JS), tracks `activeTab` local state (default = the
  editable language), and picks source content: the live `code` state for
  the editable tab, `question.files[lang]` for the other two.
- `PreviewFrame.tsx` — unchanged.

## Data flow

No changes to `lib/code-practice/types.ts` or `build-doc.ts` — `files` on
`CodePracticeQuestion` already carries all three languages, which is exactly
what the read-only tabs need.

## Styling

Reuse the existing design system: `rounded-2xl`, `border-zinc-200/60
dark:border-zinc-800/60`, orange accent for active/selected states, `Badge`
for points, `lucide-react` icons (`Lock` for read-only tabs, `PanelLeftClose`
/ `PanelLeft` for the sidebar toggle). No new color tokens or dependencies.

## Out of scope

- No changes to the checker logic, `build-doc.ts`, or scoring persistence.
- No changes to `/practice/[id]` (the non-lab exercises) or
  `/practice/preview` (full-screen preview tab).
- Mobile/responsive collapse behavior below the 3-column breakpoint is not
  specifically redesigned beyond what `ResizablePanelGroup` already handles;
  can be revisited later if needed.
