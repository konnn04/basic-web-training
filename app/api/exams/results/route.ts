import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      examId,
      examTitle,
      score,
      correctCount,
      totalQuestions,
      timeUsed,
      duration,
      userName,
      userEmail,
      userImage,
    } = body;

    if (!examId || !examTitle || score === undefined || userName === undefined) {
      return NextResponse.json(
        { error: "Thừa hoặc thiếu trường dữ liệu bắt buộc" },
        { status: 400 }
      );
    }

    if (!userEmail || typeof userEmail !== "string" || userEmail.trim() === "") {
      return NextResponse.json(
        { error: "Bạn cần đăng nhập bằng Google để lưu điểm lên bảng xếp hạng" },
        { status: 401 }
      );
    }

    let userId: string | null = null;

    if (userEmail && typeof userEmail === "string" && userEmail.trim() !== "") {
      try {
        const user = await db.user.upsert({
          where: { email: userEmail.trim() },
          update: {
            name: userName,
            image: userImage || null,
          },
          create: {
            email: userEmail.trim(),
            name: userName,
            image: userImage || null,
          },
        });
        userId = user.id;
      } catch (err) {
        console.error("Lỗi khi đồng bộ User trong database:", err);
      }
    }

    // Save exam result to DB
    const newResult = await db.examResult.create({
      data: {
        examId,
        examTitle,
        score: Number(score),
        correctCount: Number(correctCount),
        totalQuestions: Number(totalQuestions),
        timeUsed: Number(timeUsed),
        duration: Number(duration),
        userId,
        userName,
        userEmail: userEmail || null,
        userImage: userImage || null,
      },
    });

    return NextResponse.json(newResult, { status: 201 });
  } catch (error) {
    console.error("Lỗi khi lưu kết quả bài thi:", error);
    return NextResponse.json(
      { error: "Không thể lưu kết quả bài thi vào database" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Thiếu thông tin email người dùng" },
        { status: 400 }
      );
    }

    const results = await db.examResult.findMany({
      where: {
        userEmail: email,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Lỗi khi lấy lịch sử bài thi:", error);
    return NextResponse.json(
      { error: "Không thể lấy lịch sử bài thi" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const email = searchParams.get("email");

    if (id) {
      await db.examResult.delete({ where: { id } });
      return NextResponse.json({ success: true, message: "Đã xóa kết quả bài thi thành công" });
    }

    if (email) {
      const { count } = await db.examResult.deleteMany({ where: { userEmail: email } });
      return NextResponse.json({ success: true, message: `Đã xóa ${count} kết quả bài thi` });
    }

    return NextResponse.json(
      { error: "Thiếu mã kết quả bài thi (id) hoặc email" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Lỗi khi xóa kết quả bài thi:", error);
    return NextResponse.json(
      { error: "Không thể xóa kết quả bài thi trong database" },
      { status: 500 }
    );
  }
}
