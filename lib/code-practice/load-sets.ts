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
