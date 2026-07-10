import { NextRequest, NextResponse } from "next/server";
import { getSubmission } from "@/lib/session-store";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Thiếu mã ID kết quả nộp (id)" },
        { status: 400, headers: corsHeaders }
      );
    }

    const submission = getSubmission(id);

    if (!submission) {
      return NextResponse.json(
        { error: "Không tìm thấy kết quả nộp, hoặc kết quả đã hết hạn sau 10 phút." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(submission, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error: any) {
    console.error("Lỗi khi đọc dữ liệu nộp:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống: " + error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
