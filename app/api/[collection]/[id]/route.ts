import { NextRequest, NextResponse } from "next/server";
import { getDbDataForIp, saveDbDataForIp, getClientIp } from "@/lib/session-store";
import fs from "fs/promises";
import path from "path";

type RouteParams = {
  params: Promise<{ collection: string; id: string }>;
};

// Helper to load db-config for a specific collection
async function getDbConfig(collection: string): Promise<any> {
  try {
    const practiceDir = path.join(process.cwd(), "assets", "practice");
    const entries = await fs.readdir(practiceDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const configPath = path.join(practiceDir, entry.name, "db-config.json");
        try {
          await fs.access(configPath);
          const configContent = await fs.readFile(configPath, "utf-8");
          const config = JSON.parse(configContent);
          if (config.collection === collection) {
            return config;
          }
        } catch (e) {
          // Ignore and continue
        }
      }
    }
  } catch (e) {
    // Ignore and continue
  }
  return null;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { collection, id } = await params;
    const ip = getClientIp(request.headers);
    const dataList = await getDbDataForIp(ip, collection);

    const index = dataList.findIndex((item) => item.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: `Không tìm thấy bản ghi với ID: ${id} trong bộ sưu tập ${collection}` },
        { status: 404 }
      );
    }

    let body: any;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { error: "Yêu cầu phải có body dạng JSON hợp lệ" },
        { status: 400 }
      );
    }

    const config = await getDbConfig(collection);
    const record = dataList[index];

    // Validate body properties based on db-config configuration if available
    if (config && config.fields) {
      for (const field of config.fields) {
        const val = body[field.name];
        if (val !== undefined) {
          if (field.required && (val === null || String(val).trim() === "")) {
            return NextResponse.json(
              { error: `Trường bắt buộc không được để trống: ${field.label || field.name}` },
              { status: 400 }
            );
          }
          if (field.type === "number" && val !== null) {
            const parsed = parseFloat(val);
            if (isNaN(parsed) || parsed < 0) {
              return NextResponse.json(
                { error: `Trường ${field.label || field.name} phải là số dương hợp lệ` },
                { status: 400 }
              );
            }
          }
        }
      }
    }

    // Dynamic field updating
    if (config && config.fields) {
      for (const field of config.fields) {
        const val = body[field.name];
        if (val !== undefined) {
          if (val === null) {
            delete record[field.name];
          } else if (field.type === "number") {
            record[field.name] = parseFloat(val);
          } else {
            record[field.name] = val.toString().trim();
          }
        }
      }
    } else {
      // Fallback: merge directly if no configuration exists
      Object.assign(record, body);
    }

    await saveDbDataForIp(ip, collection, dataList);

    console.log(`[Dynamic DB API] Updated record. IP: ${ip}, Collection: ${collection}, ID: ${id}`);

    const response = NextResponse.json(record);
    response.headers.set("X-Session-IP", ip);
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Support PATCH as well (delegates directly to PUT)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return PUT(request, { params });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { collection, id } = await params;
    const ip = getClientIp(request.headers);
    const dataList = await getDbDataForIp(ip, collection);

    const index = dataList.findIndex((item) => item.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: `Không tìm thấy bản ghi với ID: ${id} trong bộ sưu tập ${collection}` },
        { status: 404 }
      );
    }

    const [deletedRecord] = dataList.splice(index, 1);
    await saveDbDataForIp(ip, collection, dataList);

    console.log(`[Dynamic DB API] Deleted record. IP: ${ip}, Collection: ${collection}, ID: ${id}`);

    const response = NextResponse.json({
      message: "Xóa bản ghi thành công",
      record: deletedRecord,
    });
    response.headers.set("X-Session-IP", ip);
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
