import { NextRequest, NextResponse } from "next/server";
import { saveSubmission } from "@/lib/session-store";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    const contentType = request.headers.get("content-type") || "";

    let payload: Record<string, any> = {};
    const files: Record<string, { name: string; size: number; type: string }> = {};

    if (
      contentType.includes("multipart/form-data") ||
      contentType.includes("application/x-www-form-urlencoded")
    ) {
      const formData = await request.formData();

      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          if (value.name && value.size > 0) {
            files[key] = {
              name: value.name,
              size: value.size,
              type: value.type,
            };
          }
        } else {
          if (payload[key] !== undefined) {
            if (Array.isArray(payload[key])) {
              payload[key].push(value);
            } else {
              payload[key] = [payload[key], value];
            }
          } else {
            payload[key] = value;
          }
        }
      }
    } else {
      try {
        const json = await request.json();
        payload = json;
      } catch (e) {}
    }

    const formType = type || (payload.formType || "unknown").toString();
    const submissionId = `sub_${Date.now().toString(36)}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;

    saveSubmission(submissionId, {
      formType,
      payload,
      files,
    });

    console.log(
      `[Practice Submit] Form submitted to URL. Type: ${formType}, ID: ${submissionId}`
    );

    const redirectUrl = new URL(`/practice/inspector?id=${submissionId}`, request.url);

    // Return redirect response with CORS headers
    return NextResponse.redirect(redirectUrl, {
      status: 303,
      headers: corsHeaders,
    });
  } catch (error: any) {
    console.error("Error handling form submission:", error);
    return NextResponse.json(
      { error: "Failed to process form submission: " + error.message },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}
