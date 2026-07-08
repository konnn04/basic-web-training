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
