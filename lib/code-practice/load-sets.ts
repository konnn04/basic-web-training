import fs from "fs/promises";
import path from "path";
import type { CodePracticeQuestion, CodePracticeSet, LabMode } from "./types";

const GROUP_ORDER = ["EASY", "MEDIUM", "HARD"];

type GroupMeta = {
  id?: string;
  title?: string;
  description?: string;
};

export async function loadCodePracticeSets(mode: LabMode): Promise<CodePracticeSet[]> {
  const modeDir = path.join(process.cwd(), "assets", "code-practice", mode);

  let groupNames: string[];
  try {
    groupNames = (await fs.readdir(modeDir, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  } catch (error) {
    console.error(`Không đọc được thư mục assets/code-practice/${mode}:`, error);
    return [];
  }

  const groups: Array<{ groupName: string; set: CodePracticeSet }> = [];

  for (const groupName of groupNames) {
    const groupDir = path.join(modeDir, groupName);

    let meta: GroupMeta = {};
    try {
      const metaRaw = await fs.readFile(path.join(groupDir, "_group.json"), "utf-8");
      meta = JSON.parse(metaRaw);
    } catch {
      console.warn(`[code-practice] Thiếu hoặc lỗi _group.json trong ${groupDir}, dùng giá trị mặc định.`);
    }

    let files: string[];
    try {
      files = (await fs.readdir(groupDir)).filter((f) => f.endsWith(".json") && f !== "_group.json");
    } catch (error) {
      console.error(`Lỗi đọc thư mục ${groupDir}:`, error);
      continue;
    }

    const questions: CodePracticeQuestion[] = [];

    for (const file of files) {
      const filePath = path.join(groupDir, file);
      try {
        const raw = await fs.readFile(filePath, "utf-8");
        const q = JSON.parse(raw) as CodePracticeQuestion;

        if (q.editable !== mode) {
          console.warn(
            `[code-practice] Bỏ qua câu "${q.id}" trong "${groupName}/${file}": editable="${q.editable}" không khớp mode="${mode}"`
          );
          continue;
        }
        if (!q.files || typeof q.files.html !== "string") {
          console.warn(`[code-practice] Bỏ qua câu "${q.id}" trong "${groupName}/${file}": thiếu files.html`);
          continue;
        }
        if (!Array.isArray(q.checks) || q.checks.length === 0) {
          console.warn(`[code-practice] Bỏ qua câu "${q.id}" trong "${groupName}/${file}": thiếu checks[]`);
          continue;
        }

        questions.push(q);
      } catch (error) {
        console.error(`Lỗi đọc/parse file ${groupDir}/${file}:`, error);
      }
    }

    questions.sort((a, b) => a.id.localeCompare(b.id));

    groups.push({
      groupName,
      set: {
        id: meta.id ?? `${mode}-${groupName.toLowerCase()}`,
        mode,
        title: meta.title ?? groupName,
        description: meta.description ?? "",
        questions,
      },
    });
  }

  groups.sort((a, b) => {
    const ai = GROUP_ORDER.indexOf(a.groupName.toUpperCase());
    const bi = GROUP_ORDER.indexOf(b.groupName.toUpperCase());
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.groupName.localeCompare(b.groupName);
  });

  return groups.map((g) => g.set);
}
