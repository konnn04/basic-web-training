import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const examId = searchParams.get("examId");

    // If query is for a specific exam
    if (examId && examId !== "all") {
      const rawResults = await db.examResult.findMany({
        where: { examId },
        orderBy: [
          { score: "desc" },
          { timeUsed: "asc" },
          { createdAt: "asc" },
        ],
      });

      const uniqueRankings: typeof rawResults = [];
      const seenUsers = new Set<string>();

      for (const record of rawResults) {
        const userKey = record.userEmail
          ? `email:${record.userEmail.toLowerCase().trim()}`
          : `guest:${record.userName.toLowerCase().trim()}`;

        if (!seenUsers.has(userKey)) {
          seenUsers.add(userKey);
          uniqueRankings.push(record);
        }

        if (uniqueRankings.length >= 50) {
          break;
        }
      }

      return NextResponse.json(uniqueRankings);
    }

    // Default: Composite Total Score (Sum of the best score for each distinct exam for each user)
    const rawResults = await db.examResult.findMany({
      orderBy: { createdAt: "asc" }, // Read in chronological order
    });

    // Map to track user composite statistics:
    // userKey -> { userName, userEmail, userImage, bestScoresByExamId: { examId: { score, correctCount, totalQuestions, timeUsed, createdAt } } }
    const userMap = new Map<string, {
      userName: string;
      userEmail: string | null;
      userImage: string | null;
      bestScores: Map<string, {
        score: number;
        correctCount: number;
        totalQuestions: number;
        timeUsed: number;
        createdAt: Date;
      }>;
    }>();

    for (const record of rawResults) {
      const userKey = record.userEmail
        ? `email:${record.userEmail.toLowerCase().trim()}`
        : `guest:${record.userName.toLowerCase().trim()}`;

      if (!userMap.has(userKey)) {
        userMap.set(userKey, {
          userName: record.userName,
          userEmail: record.userEmail,
          userImage: record.userImage,
          bestScores: new Map(),
        });
      }

      const user = userMap.get(userKey)!;
      const currentBest = user.bestScores.get(record.examId);

      // We replace if this score is strictly better, OR if it's the same score but achieved in less time
      const isBetter = !currentBest || 
        record.score > currentBest.score || 
        (record.score === currentBest.score && record.timeUsed < currentBest.timeUsed);

      if (isBetter) {
        user.bestScores.set(record.examId, {
          score: record.score,
          correctCount: record.correctCount,
          totalQuestions: record.totalQuestions,
          timeUsed: record.timeUsed,
          createdAt: record.createdAt,
        });
      }
    }

    // Convert map to sorted array list
    const compositeRankings = Array.from(userMap.entries()).map(([userKey, data]) => {
      let totalScore = 0;
      let totalCorrect = 0;
      let totalQuestions = 0;
      let totalTimeUsed = 0;
      let latestCreatedAt = new Date(0);

      data.bestScores.forEach((best) => {
        totalScore += best.score;
        totalCorrect += best.correctCount;
        totalQuestions += best.totalQuestions;
        totalTimeUsed += best.timeUsed;
        if (best.createdAt.getTime() > latestCreatedAt.getTime()) {
          latestCreatedAt = best.createdAt;
        }
      });

      return {
        id: userKey,
        userName: data.userName,
        userEmail: data.userEmail,
        userImage: data.userImage,
        score: totalScore, // Accumulated sum of best scores
        correctCount: totalCorrect,
        totalQuestions,
        timeUsed: totalTimeUsed,
        examTitle: `Tổng hợp (${data.bestScores.size} bài thi)`,
        examId: "all",
        createdAt: latestCreatedAt.getTime() > 0 ? latestCreatedAt.toISOString() : new Date().toISOString(),
      };
    });

    // Sort composite rankings by score descending, then timeUsed ascending
    compositeRankings.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.timeUsed - b.timeUsed;
    });

    return NextResponse.json(compositeRankings.slice(0, 50));
  } catch (error) {
    console.error("Lỗi khi tải bảng xếp hạng tổng hợp:", error);
    return NextResponse.json(
      { error: "Không thể lấy danh sách bảng xếp hạng" },
      { status: 500 }
    );
  }
}
