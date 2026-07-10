import { NextRequest, NextResponse } from "next/server";
import { getDbDataForIp, saveDbDataForIp, getClientIp } from "@/lib/session-store";
import fs from "fs/promises";
import path from "path";

type RouteParams = {
  params: Promise<{ collection: string }>;
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

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { collection } = await params;
    const ip = getClientIp(request.headers);
    const dataList = await getDbDataForIp(ip, collection);

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.toLowerCase();
    const priceMin = parseFloat(searchParams.get("priceMin") || "");
    const priceMax = parseFloat(searchParams.get("priceMax") || "");
    
    // Pagination parameters
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    
    const page = parseInt(pageParam || "1", 10);
    const limit = parseInt(limitParam || "20", 10);
    
    const validPage = isNaN(page) || page < 1 ? 1 : page;
    const validLimit = isNaN(limit) || limit < 1 ? 20 : limit;

    let filtered = [...dataList];

    // Generic search: searches across all string fields of the record
    if (q) {
      filtered = filtered.filter((item) =>
        Object.entries(item).some(
          ([key, value]) =>
            key !== "id" &&
            key !== "cover" &&
            typeof value === "string" &&
            value.toLowerCase().includes(q)
        )
      );
    }

    // Generic filtering: matches exact fields from query parameters (excluding q, priceMin, priceMax, page, limit)
    for (const [key, val] of searchParams.entries()) {
      if (key === "q" || key === "priceMin" || key === "priceMax" || key === "page" || key === "limit") continue;
      filtered = filtered.filter((item) => {
        const itemVal = item[key];
        return (
          itemVal !== undefined &&
          itemVal !== null &&
          String(itemVal).toLowerCase() === val.toLowerCase()
        );
      });
    }

    // Price range filters (common across database exercises like manga or books)
    if (!isNaN(priceMin)) {
      filtered = filtered.filter((item) => {
        const p = parseFloat(item.price);
        return !isNaN(p) && p >= priceMin;
      });
    }

    if (!isNaN(priceMax)) {
      filtered = filtered.filter((item) => {
        const p = parseFloat(item.price);
        return !isNaN(p) && p <= priceMax;
      });
    }

    // Apply pagination slice
    const startIndex = (validPage - 1) * validLimit;
    const endIndex = validPage * validLimit;
    const paginated = filtered.slice(startIndex, endIndex);

    const response = NextResponse.json(paginated);
    response.headers.set("X-Session-IP", ip);
    response.headers.set("X-Total-Count", String(filtered.length));
    response.headers.set("X-Page", String(validPage));
    response.headers.set("X-Limit", String(validLimit));
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { collection } = await params;
    const ip = getClientIp(request.headers);

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

    // Validate body properties based on db-config configuration
    if (config && config.fields) {
      for (const field of config.fields) {
        const val = body[field.name];
        if (
          field.required &&
          (val === undefined || val === null || String(val).trim() === "")
        ) {
          return NextResponse.json(
            { error: `Trường bắt buộc không được để trống: ${field.label || field.name}` },
            { status: 400 }
          );
        }
        if (field.type === "number" && val !== undefined && val !== null) {
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

    const dataList = await getDbDataForIp(ip, collection);

    // Construct the new record dynamically
    const newRecord: any = {
      id: `${collection}-${Date.now().toString(36)}_${Math.random()
        .toString(36)
        .substring(2, 6)}`,
    };

    if (config && config.fields) {
      for (const field of config.fields) {
        let val = body[field.name];
        if (val !== undefined && val !== null) {
          if (field.type === "number") {
            newRecord[field.name] = parseFloat(val);
          } else {
            newRecord[field.name] = val.toString().trim();
          }
        }
      }
    } else {
      // Fallback: merge body directly if no config found
      Object.assign(newRecord, body);
    }

    dataList.push(newRecord);
    await saveDbDataForIp(ip, collection, dataList);

    console.log(`[Dynamic DB API] Created record for IP: ${ip}, collection: ${collection}, ID: ${newRecord.id}`);

    const response = NextResponse.json(newRecord, { status: 201 });
    response.headers.set("X-Session-IP", ip);
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
