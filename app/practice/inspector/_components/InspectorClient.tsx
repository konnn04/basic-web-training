"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowLeft, 
  FileCode, 
  Info, 
  FileUp, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Search,
  ExternalLink
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

type SubmissionData = {
  formType: string;
  payload: Record<string, any>;
  files: Record<string, { name: string; size: number; type: string }>;
  timestamp: number;
};

type ChecklistField = {
  name: string;
  label: string;
  type: string;
  required: boolean;
  expectedValue?: string;
  notes?: string;
};

export function InspectorClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<SubmissionData | null>(null);
  const [checklists, setChecklists] = useState<Record<string, { title: string; fields: ChecklistField[] }>>({});
  const [showJson, setShowJson] = useState(false);

  useEffect(() => {
    if (!id) {
      setError("Thiếu tham số Submission ID. Hãy nộp form từ file HTML của bạn để tạo kết quả.");
      setLoading(false);
      return;
    }

    const fetchPayloadAndChecklists = async () => {
      try {
        setLoading(true);
        
        // Fetch dynamic checklists configuration
        const clRes = await fetch("/api/practice/checklists");
        let activeChecklists = {};
        if (clRes.ok) {
          activeChecklists = await clRes.json();
          setChecklists(activeChecklists);
        }

        // Fetch submission data
        const res = await fetch(`/api/practice/submit?id=${id}`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Không tải được dữ liệu nộp.");
        }
        const subData: SubmissionData = await res.json();
        setData(subData);
      } catch (err: any) {
        setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    fetchPayloadAndChecklists();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-3xl flex-grow flex flex-col justify-center gap-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-80 rounded-xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md text-center flex-grow flex flex-col justify-center">
        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6 text-center text-red-600 dark:border-red-950/20 dark:bg-red-950/10 dark:text-red-400">
          <XCircle className="mx-auto h-12 w-12 mb-3 text-red-500" />
          <h3 className="font-extrabold text-base">Lỗi đọc kết quả nộp</h3>
          <p className="text-xs text-red-500 mt-2 leading-relaxed">{error}</p>
          <Button
            onClick={() => router.push("/practice")}
            className="mt-6 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Về Trang Thực Hành
          </Button>
        </div>
      </div>
    );
  }

  const { formType, payload, files } = data;
  const isKnownForm = formType in checklists;
  const checklist = isKnownForm ? checklists[formType] : null;

  // Evaluation logic
  const evaluation = checklist
    ? checklist.fields.map((field) => {
        const isFile = field.type === "file";
        const isPresent = isFile ? (field.name in files) : (field.name in payload);
        const value = isFile ? files[field.name] : payload[field.name];

        let status: "ok" | "missing" | "optional_missing" | "invalid_value" = "ok";
        let detail = "";

        if (!isPresent) {
          status = field.required ? "missing" : "optional_missing";
        } else if (field.expectedValue !== undefined) {
          // Verify strict values (like formType or checkbox value)
          const strVal = typeof value === "object" ? JSON.stringify(value) : String(value);
          if (strVal !== field.expectedValue) {
            status = "invalid_value";
            detail = `Gửi lên: "${strVal}" • Mong đợi: "${field.expectedValue}"`;
          }
        }

        return {
          ...field,
          status,
          isPresent,
          value,
          detail,
        };
      })
    : [];

  const passedCount = evaluation.filter((e) => e.status === "ok").length;
  const missingCount = evaluation.filter((e) => e.status === "missing").length;
  const invalidCount = evaluation.filter((e) => e.status === "invalid_value").length;
  const totalExpected = evaluation.length;

  // Extra fields that were sent but not in the checklist
  const expectedFieldNames = new Set(checklist ? checklist.fields.map((f) => f.name) : []);
  const extraFields: Array<{ name: string; value: any; isFile: boolean }> = [];

  for (const [key, value] of Object.entries(payload)) {
    if (!expectedFieldNames.has(key)) {
      extraFields.push({ name: key, value, isFile: false });
    }
  }
  for (const [key, value] of Object.entries(files)) {
    if (!expectedFieldNames.has(key)) {
      extraFields.push({ name: key, value, isFile: true });
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="container mx-auto px-4 max-w-3xl py-10 flex-grow flex flex-col justify-center gap-6">
      
      {/* Header back button */}
      <div className="flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/40 pb-4">
        <div className="flex items-center gap-2">
          <Link href="/practice">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-zinc-500 hover:text-zinc-850 cursor-pointer">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-extrabold text-zinc-950 dark:text-white flex items-center gap-1.5">
              <Sparkles className="text-orange-500 h-4.5 w-4.5" />
              Payload Inspector
            </h1>
            <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">
              Mã giao dịch: {id} • Gửi lúc: {new Date(data.timestamp).toLocaleTimeString("vi-VN")}
            </p>
          </div>
        </div>
        
        <Link href="/practice">
          <Button variant="outline" className="rounded-xl text-xs font-bold border-zinc-200 text-zinc-600 dark:border-zinc-800 dark:text-zinc-350 cursor-pointer">
            Làm bài khác
          </Button>
        </Link>
      </div>

      {/* Evaluation Result Summary */}
      <Card className="border-zinc-250/60 shadow-md rounded-2xl overflow-hidden bg-white dark:bg-zinc-900">
        <CardHeader className="bg-gradient-to-r from-orange-50/40 to-amber-50/40 dark:from-orange-950/10 dark:to-transparent border-b border-zinc-100 dark:border-zinc-800/50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm sm:text-base font-extrabold text-zinc-850 dark:text-white">
                {checklist ? checklist.title : `Payload không xác định (${formType})`}
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500 mt-1 font-medium">
                Phân tích cấu trúc form và tên thuộc tính `name` gửi lên
              </CardDescription>
            </div>
            {isKnownForm && (
              <Badge className={`rounded-full px-3 py-1 font-extrabold text-xs shadow-sm ${
                missingCount === 0 && invalidCount === 0
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-amber-500 text-white hover:bg-amber-600"
              }`}>
                {missingCount === 0 && invalidCount === 0 ? "HOÀN HẢO" : "CẦN SỬA"}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-5">
          {isKnownForm ? (
            <div className="grid grid-cols-3 gap-4 text-center divide-x divide-zinc-100 dark:divide-zinc-800">
              <div>
                <span className="block text-2xl font-black text-green-600 dark:text-green-500">{passedCount}</span>
                <span className="text-[10px] text-zinc-400 font-bold tracking-wider uppercase">Đạt yêu cầu</span>
              </div>
              <div>
                <span className={`block text-2xl font-black ${missingCount > 0 ? "text-red-500" : "text-zinc-300"}`}>
                  {missingCount}
                </span>
                <span className="text-[10px] text-zinc-400 font-bold tracking-wider uppercase">Thiếu trường</span>
              </div>
              <div>
                <span className={`block text-2xl font-black ${invalidCount > 0 ? "text-amber-500" : "text-zinc-300"}`}>
                  {invalidCount}
                </span>
                <span className="text-[10px] text-zinc-400 font-bold tracking-wider uppercase">Sai giá trị</span>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 p-3.5 rounded-xl text-amber-700 dark:text-amber-400 text-xs">
              <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Cảnh báo:</strong> Giao dịch gửi lên thiếu thuộc tính ẩn <code>name="formType"</code> hoặc gửi sai loại. Hệ thống không thể chọn bộ checklist tương thích để so khớp tự động.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Checklist results */}
      {isKnownForm && (
        <Card className="border border-zinc-200/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-zinc-50/60 dark:bg-zinc-900/50 border-b border-zinc-200/50 dark:border-zinc-800/50 px-5 py-3 flex items-center justify-between">
            <span className="text-xs font-black text-zinc-500 uppercase tracking-wider">So khớp các trường (Checklist)</span>
            <span className="text-[10px] text-zinc-400 font-bold">Tổng số {totalExpected} trường yêu cầu</span>
          </div>
          <CardContent className="p-0">
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
              {evaluation.map((field, idx) => {
                return (
                  <div key={idx} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    
                    {/* Field info */}
                    <div className="md:w-1/3 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <code className="text-orange-600 dark:text-orange-400 font-bold bg-orange-50 dark:bg-orange-950/30 px-1.5 py-0.5 rounded text-[11px]">
                          {field.name}
                        </code>
                        {field.required && (
                          <Badge variant="destructive" className="text-[9px] font-black px-1.5 py-0 rounded-md">
                            Bắt buộc
                          </Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-400">
                        {field.label} ({field.type})
                      </p>
                    </div>

                    {/* Sent Value */}
                    <div className="md:w-5/12">
                      {field.isPresent ? (
                        field.type === "file" ? (
                          <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                            <FileUp size={13} className="text-zinc-400" />
                            <span className="font-semibold underline truncate max-w-[180px]">
                              {(field.value as any).name}
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              ({formatFileSize((field.value as any).size)})
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="font-semibold text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-150/60 dark:border-zinc-800 px-2 py-1 rounded-lg max-w-full overflow-x-auto select-all">
                              {String(field.value)}
                            </div>
                            {field.status === "invalid_value" && (
                              <p className="text-[10px] text-amber-600 dark:text-amber-500 font-bold flex items-center gap-1">
                                <AlertTriangle size={11} />
                                {field.detail}
                              </p>
                            )}
                          </div>
                        )
                      ) : (
                        <span className="text-zinc-400 italic font-normal">
                          {field.status === "optional_missing" ? "(không gửi lên)" : "(thiếu thuộc tính)"}
                        </span>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="md:w-2/12 flex md:justify-end">
                      {field.status === "ok" && (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-950/40 dark:text-green-400 font-extrabold flex items-center gap-1 border-0 py-0.5 rounded-full">
                          <CheckCircle2 size={11} />
                          Đạt chuẩn
                        </Badge>
                      )}
                      {field.status === "missing" && (
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 font-extrabold flex items-center gap-1 border-0 py-0.5 rounded-full">
                          <XCircle size={11} />
                          Thiếu
                        </Badge>
                      )}
                      {field.status === "optional_missing" && (
                        <Badge className="bg-zinc-100 text-zinc-400 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-500 font-extrabold border-0 py-0.5 rounded-full">
                          Tùy chọn
                        </Badge>
                      )}
                      {field.status === "invalid_value" && (
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400 font-extrabold flex items-center gap-1 border-0 py-0.5 rounded-full">
                          <AlertTriangle size={11} />
                          Sai giá trị
                        </Badge>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Extra submitted fields (unexpected) */}
      {extraFields.length > 0 && (
        <Card className="border border-amber-200/70 bg-amber-50/10 dark:border-amber-950/20 dark:bg-amber-950/5 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-amber-100/40 dark:bg-amber-950/20 border-b border-amber-200/50 dark:border-amber-900/10 px-5 py-3 flex items-center justify-between">
            <span className="text-xs font-black text-amber-800 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Info size={13} />
              Thông tin ngoài yêu cầu (Mục khác)
            </span>
            <span className="text-[10px] text-amber-600 dark:text-amber-500 font-bold">Thừa {extraFields.length} trường</span>
          </div>
          <CardContent className="p-0 text-xs">
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/40 font-medium">
              {extraFields.map((field, idx) => (
                <div key={idx} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="md:w-1/3">
                    <code className="text-zinc-600 dark:text-zinc-400 font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[11px]">
                      {field.name}
                    </code>
                  </div>
                  <div className="md:w-2/3 md:text-right">
                    {field.isFile ? (
                      <span className="text-zinc-500">
                        File: {(field.value as any).name} ({formatFileSize((field.value as any).size)})
                      </span>
                    ) : (
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300 break-all select-all">
                        {String(field.value)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Raw JSON payload viewer */}
      <Card className="border border-zinc-200/80 rounded-2xl overflow-hidden shadow-sm">
        <button
          onClick={() => setShowJson(!showJson)}
          className="w-full bg-zinc-50/60 dark:bg-zinc-900/50 px-5 py-3.5 border-b border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-between cursor-pointer focus:outline-none"
        >
          <span className="text-xs font-black text-zinc-500 uppercase tracking-wider flex items-center gap-1.5 select-none">
            <FileCode size={14} className="text-orange-500" />
            Payload thô đã nhận (Raw JSON)
          </span>
          {showJson ? <ChevronUp size={16} className="text-zinc-400" /> : <ChevronDown size={16} className="text-zinc-400" />}
        </button>
        {showJson && (
          <CardContent className="p-4 bg-zinc-950 font-mono text-zinc-200 text-xs overflow-x-auto leading-relaxed max-h-[350px]">
            <pre className="select-all">{JSON.stringify(data, null, 2)}</pre>
          </CardContent>
        )}
      </Card>

    </div>
  );
}
