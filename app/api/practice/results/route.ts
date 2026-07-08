import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { loadCodePracticeSets } from "@/lib/code-practice/load-sets";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mode, setId, questionId, points, userName, userEmail, userImage } = body;

    if (!mode || !setId || !questionId || points === undefined || !userName) {
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

    try {
      const user = await db.user.upsert({
        where: { email: userEmail.trim() },
        update: { name: userName, image: userImage || null },
        create: { email: userEmail.trim(), name: userName, image: userImage || null },
      });
      userId = user.id;
    } catch (err) {
      console.error("Lỗi khi đồng bộ User trong database:", err);
    }

    // One solved record per user per question — update the existing row instead of
    // accumulating duplicates when a question is re-passed after being edited again.
    const existing = await db.practiceResult.findFirst({
      where: { mode, setId, questionId, userEmail: userEmail.trim() },
    });

    const result = existing
      ? await db.practiceResult.update({
          where: { id: existing.id },
          data: { points: Number(points), userName, userImage: userImage || null, userId },
        })
      : await db.practiceResult.create({
          data: {
            mode,
            setId,
            questionId,
            points: Number(points),
            userId,
            userName,
            userEmail: userEmail || null,
            userImage: userImage || null,
          },
        });

    return NextResponse.json(result, { status: existing ? 200 : 201 });
  } catch (error) {
    console.error("Lỗi khi lưu kết quả thực hành:", error);
    return NextResponse.json(
      { error: "Không thể lưu kết quả thực hành vào database" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Thiếu thông tin email người dùng" }, { status: 400 });
    }

    const results = await db.practiceResult.findMany({
      where: { userEmail: email },
      orderBy: { createdAt: "desc" },
    });

    // Enrich each row with the current question/set title for display.
    const [cssSets, jsSets] = await Promise.all([
      loadCodePracticeSets("css"),
      loadCodePracticeSets("js"),
    ]);
    const allSets = [...cssSets, ...jsSets];

    const enriched = results.map((r) => {
      const set = allSets.find((s) => s.id === r.setId && s.mode === r.mode);
      const question = set?.questions.find((q) => q.id === r.questionId);
      return {
        id: r.id,
        mode: r.mode,
        setId: r.setId,
        setTitle: set?.title ?? r.setId,
        questionId: r.questionId,
        questionTitle: question?.title ?? r.questionId,
        points: r.points,
        createdAt: r.createdAt,
      };
    });

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("Lỗi khi lấy lịch sử thực hành:", error);
    return NextResponse.json({ error: "Không thể lấy lịch sử thực hành" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const email = searchParams.get("email");

    if (id) {
      await db.practiceResult.delete({ where: { id } });
      return NextResponse.json({ success: true, message: "Đã xóa kết quả thực hành thành công" });
    }

    if (email) {
      const { count } = await db.practiceResult.deleteMany({ where: { userEmail: email } });
      return NextResponse.json({ success: true, message: `Đã xóa ${count} kết quả thực hành` });
    }

    return NextResponse.json({ error: "Thiếu mã kết quả (id) hoặc email" }, { status: 400 });
  } catch (error) {
    console.error("Lỗi khi xóa kết quả thực hành:", error);
    return NextResponse.json(
      { error: "Không thể xóa kết quả thực hành trong database" },
      { status: 500 }
    );
  }
}
