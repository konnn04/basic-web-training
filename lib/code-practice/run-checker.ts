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
