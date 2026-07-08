import React from "react";
import fs from "fs/promises";
import path from "path";
import { PracticeListClient } from "./_components/PracticeListClient";

export default async function PracticePage() {
  const practiceDir = path.join(process.cwd(), "assets", "practice");
  const exercises: Array<{ id: string; title: string; content: string; description?: string; dbConfig?: unknown }> = [];

  try {
    const entries = await fs.readdir(practiceDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith("_")) {
        const contentPath = path.join(practiceDir, entry.name, "content.md");
        const configPath = path.join(practiceDir, entry.name, "db-config.json");

        try {
          await fs.access(contentPath);
          const content = await fs.readFile(contentPath, "utf-8");

          const firstHeading = content.split("\n").find(line => line.trim().startsWith("# "));
          const title = firstHeading ? firstHeading.replace(/^#\s+/, "").trim() : entry.name;

          const description = content
            .split("\n")
            .map(line => line.trim())
            .find(
              (line) =>
                line.length > 0 &&
                !line.startsWith("#") &&
                !line.startsWith("-") &&
                !line.startsWith("*") &&
                !line.startsWith("|") &&
                line !== "---"
            ) || "";

          let dbConfig = undefined;
          try {
            await fs.access(configPath);
            const configContent = await fs.readFile(configPath, "utf-8");
            dbConfig = JSON.parse(configContent);
          } catch (configErr) {
            // No configuration file, ignore
          }

          exercises.push({
            id: entry.name,
            title,
            content,
            description,
            dbConfig,
          });
        } catch (e) {
          // content.md not found in folder, skip
        }
      }
    }

    exercises.sort((a, b) => a.id.localeCompare(b.id));
  } catch (error) {
    console.error("Error loading exercises:", error);
  }

  return (
    <PracticeListClient exercises={exercises} />
  );
}
