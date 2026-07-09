import type { CodePracticeCheck, CheckResult } from "./types";

export function runChecks(
  checks: CodePracticeCheck[],
  doc: Document,
  win: Window,
  code: string
): CheckResult[] {
  return checks.map((check) => {
    try {
      const fn = new Function("doc", "win", "code", check.checker) as (
        doc: Document,
        win: Window,
        code: string
      ) => boolean | Partial<{ pass: boolean; message: string }> | undefined;

      const raw = fn(doc, win, code);
      const pass = typeof raw === "boolean" ? raw : Boolean(raw && raw.pass);
      const message =
        typeof raw === "object" && raw && raw.message
          ? raw.message
          : pass
            ? "Đạt yêu cầu."
            : "Chưa đạt yêu cầu.";

      return { label: check.label, points: check.points, pass, message };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return { label: check.label, points: check.points, pass: false, message: `Lỗi: ${msg}` };
    }
  });
}
