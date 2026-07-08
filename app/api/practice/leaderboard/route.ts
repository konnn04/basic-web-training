import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { loadCodePracticeSets } from "@/lib/code-practice/load-sets";

export async function GET() {
  try {
    const [cssSets, jsSets] = await Promise.all([
      loadCodePracticeSets("css"),
      loadCodePracticeSets("js"),
    ]);

    const totalQuestions = [...cssSets, ...jsSets].reduce(
      (sum, set) => sum + set.questions.length,
      0
    );
    const totalPoints = [...cssSets, ...jsSets].reduce(
      (sum, set) => sum + set.questions.reduce((s, q) => s + q.points, 0),
      0
    );

    const rawResults = await db.practiceResult.findMany({
      orderBy: { createdAt: "asc" },
    });

    const userMap = new Map<
      string,
      {
        userName: string;
        userEmail: string | null;
        userImage: string | null;
        solvedQuestions: Set<string>;
        score: number;
        latestCreatedAt: Date;
      }
    >();

    for (const record of rawResults) {
      const userKey = record.userEmail
        ? `email:${record.userEmail.toLowerCase().trim()}`
        : `guest:${record.userName.toLowerCase().trim()}`;

      if (!userMap.has(userKey)) {
        userMap.set(userKey, {
          userName: record.userName,
          userEmail: record.userEmail,
          userImage: record.userImage,
          solvedQuestions: new Set(),
          score: 0,
          latestCreatedAt: record.createdAt,
        });
      }

      const user = userMap.get(userKey)!;
      const questionKey = `${record.mode}:${record.setId}:${record.questionId}`;

      if (!user.solvedQuestions.has(questionKey)) {
        user.solvedQuestions.add(questionKey);
        user.score += record.points;
      }
      if (record.createdAt.getTime() > user.latestCreatedAt.getTime()) {
        user.latestCreatedAt = record.createdAt;
      }
    }

    const rankings = Array.from(userMap.entries())
      .map(([userKey, data]) => ({
        id: userKey,
        userName: data.userName,
        userEmail: data.userEmail,
        userImage: data.userImage,
        score: data.score,
        correctCount: data.solvedQuestions.size,
        totalQuestions,
        totalPoints,
        createdAt: data.latestCreatedAt.toISOString(),
      }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.createdAt.localeCompare(b.createdAt);
      })
      .slice(0, 50);

    return NextResponse.json(rankings);
  } catch (error) {
    console.error("Lỗi khi tải bảng xếp hạng thực hành:", error);
    return NextResponse.json(
      { error: "Không thể lấy danh sách bảng xếp hạng thực hành" },
      { status: 500 }
    );
  }
}
