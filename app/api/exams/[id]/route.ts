import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    // Sanitize input to prevent directory traversal
    if (!id || !/^[a-zA-Z0-9.-]+$/.test(id)) {
      return NextResponse.json({ error: "Invalid exam ID" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), "assets", "exams", `${id}.json`);
    
    try {
      const fileContent = await fs.readFile(filePath, "utf-8");
      const data = JSON.parse(fileContent);
      return NextResponse.json(data);
    } catch (err) {
      return NextResponse.json(
        { error: `Exam "${id}" not found` },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error fetching single exam:", error);
    return NextResponse.json(
      { error: "Failed to load exam data" },
      { status: 500 }
    );
  }
}
