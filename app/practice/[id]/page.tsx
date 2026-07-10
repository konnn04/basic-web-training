import React from "react";
import fs from "fs/promises";
import path from "path";
import { notFound } from "next/navigation";
import { PracticeClient } from "../_components/PracticeClient";

type PageParams = {
  params: Promise<{ id: string }>;
};

export default async function PracticeDetailPage({ params }: PageParams) {
  const { id } = await params;

  // Prevent accessing hidden folders starting with underscore
  if (id.startsWith("_")) {
    notFound();
  }

  const practiceDir = path.join(process.cwd(), "assets", "practice");
  const exerciseDir = path.join(practiceDir, id);
  const contentPath = path.join(exerciseDir, "content.md");
  const configPath = path.join(exerciseDir, "db-config.json");

  try {
    await fs.access(contentPath);
    const content = await fs.readFile(contentPath, "utf-8");

    // Try to extract title from the first markdown heading (# Title)
    const firstHeading = content.split("\n").find((line) => line.trim().startsWith("# "));
    const title = firstHeading ? firstHeading.replace(/^#\s+/, "").trim() : id;

    let dbConfig = undefined;
    try {
      await fs.access(configPath);
      const configContent = await fs.readFile(configPath, "utf-8");
      dbConfig = JSON.parse(configContent);
    } catch (e) {
      // No db-config file, ignore
    }

    const exercise = {
      id,
      title,
      content,
      dbConfig,
    };

    return <PracticeClient exercise={exercise} />;
  } catch (error) {
    notFound();
  }
}
