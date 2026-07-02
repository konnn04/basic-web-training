import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const examsDir = path.join(process.cwd(), "assets", "exams");
    const files = await fs.readdir(examsDir);

    const examFiles = files
      .filter((file) => file.startsWith("test-") && file.endsWith(".json"))
      .sort();

    const exams = await Promise.all(
      examFiles.map(async (file) => {
        const filePath = path.join(examsDir, file);
        const content = await fs.readFile(filePath, "utf-8");
        const data = JSON.parse(content);
        const id = file.replace(".json", "");
        return {
          id,
          title: data.title,
          description: data.description,
          duration: data.duration,
          questionCount: data.questions?.length ?? 0,
        };
      })
    );

    return NextResponse.json(exams);
  } catch (error) {
    console.error("Error reading exams data:", error);
    return NextResponse.json(
      { error: "Failed to load exams list" },
      { status: 500 }
    );
  }
}
