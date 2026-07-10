import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const practiceDir = path.join(process.cwd(), "assets", "practice");
    const entries = await fs.readdir(practiceDir, { withFileTypes: true });
    
    const checklists: Record<string, any> = {};
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const payloadPath = path.join(practiceDir, entry.name, "payload.json");
        
        try {
          // Check if payload.json exists inside the subdirectory
          await fs.access(payloadPath);
          const fileContent = await fs.readFile(payloadPath, "utf-8");
          const json = JSON.parse(fileContent);
          
          // Merge checklist definitions
          Object.assign(checklists, json);
        } catch (e) {
          // payload.json doesn't exist or is invalid, skip this directory
        }
      }
    }
    
    return NextResponse.json(checklists);
  } catch (error: any) {
    console.error("Failed to load checklists:", error);
    return NextResponse.json(
      { error: "Failed to load checklists database: " + error.message },
      { status: 500 }
    );
  }
}
