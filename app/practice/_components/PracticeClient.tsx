"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Terminal,
  Code2,
  Dices,
  BookOpen,
  Copy,
  Check,
  RefreshCw,
  Plus,
  Trash2,
  Edit,
  FileText,
  Play,
  CheckCircle,
  HelpCircle,
  Eye,
  Settings,
  Database,
  Search,
  XCircle,
  ArrowLeft
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

import { ApiDocs } from "./ApiDocs";

// Define TypeScript structures
type DbField = {
  name: string;
  label: string;
  type: "text" | "number" | "image" | "textarea";
  required: boolean;
  placeholder?: string;
};

type DbConfig = {
  collection: string;
  title: string;
  endpoint: string;
  fields: DbField[];
};

type Exercise = {
  id: string;
  title: string;
  content: string;
  dbConfig?: DbConfig;
};

type PracticeClientProps = {
  exercises: Exercise[];
};

type ActiveTab = string;

// Custom Markdown to JSX Parser for lightweight styled rendering
function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null;
  const lines = content.split("\n");

  let inTable = false;
  let tableHeader: string[] = [];
  let tableRows: string[][] = [];

  let inCodeBlock = false;
  let codeLines: string[] = [];

  const elements: React.ReactNode[] = [];

  const parseInlineCodeAndBold = (text: string) => {
    let parts: React.ReactNode[] = [];
    const backtickParts = text.split("`");
    backtickParts.forEach((part, idx) => {
      if (idx % 2 === 1) {
        parts.push(
          <code key={`code-${idx}`} className="text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20 px-1.5 py-0.5 rounded font-mono text-[11px] font-bold">
            {part}
          </code>
        );
      } else {
        const boldParts = part.split("**");
        boldParts.forEach((bPart, bIdx) => {
          if (bIdx % 2 === 1) {
            parts.push(<strong key={`bold-${idx}-${bIdx}`} className="font-extrabold text-zinc-950 dark:text-white">{bPart}</strong>);
          } else {
            parts.push(bPart);
          }
        });
      }
    });
    return parts.length > 0 ? parts : text;
  };

  const flushTable = (key: number) => {
    if (tableHeader.length === 0 && tableRows.length === 0) return null;
    const tableEl = (
      <div key={`table-${key}`} className="my-4 border border-zinc-200/60 dark:border-zinc-800/80 rounded-xl overflow-hidden bg-white dark:bg-zinc-950 text-xs shadow-sm max-w-full overflow-x-auto select-text">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200/80 dark:border-zinc-800 font-bold text-zinc-500">
              {tableHeader.map((h, i) => (
                <th key={i} className="p-3 text-[10px] uppercase tracking-wider">{h.trim()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, rIdx) => (
              <tr key={rIdx} className="border-b border-zinc-100 dark:border-zinc-900 last:border-b-0">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="p-3 text-zinc-700 dark:text-zinc-300 font-medium">
                    {parseInlineCodeAndBold(cell.trim())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableHeader = [];
    tableRows = [];
    return tableEl;
  };

  const flushCodeBlock = (key: number) => {
    const codeEl = (
      <pre key={`codeblock-${key}`} className="bg-zinc-950 text-zinc-200 text-xs font-mono p-4 rounded-xl overflow-x-auto leading-relaxed my-4 border border-zinc-850 shadow-inner select-all">
        <code>{codeLines.join("\n")}</code>
      </pre>
    );
    codeLines = [];
    inCodeBlock = false;
    return codeEl;
  };

  let elementKey = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        elements.push(flushCodeBlock(elementKey++));
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    if (line.trim().startsWith("|")) {
      inTable = true;
      const cells = line.split("|").slice(1, -1);
      if (cells.every(c => c.trim().startsWith("-"))) {
        continue;
      }
      if (tableHeader.length === 0) {
        tableHeader = cells;
      } else {
        tableRows.push(cells);
      }
      continue;
    } else if (inTable) {
      elements.push(flushTable(elementKey++));
      inTable = false;
    }

    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={elementKey++} className="text-base sm:text-lg font-black text-zinc-900 dark:text-white mt-6 mb-3 border-b border-zinc-200/50 dark:border-zinc-800/40 pb-1.5 flex items-center gap-1.5 select-text">
          {parseInlineCodeAndBold(line.replace("## ", "").trim())}
        </h2>
      );
      continue;
    }
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={elementKey++} className="text-sm sm:text-base font-bold text-zinc-800 dark:text-zinc-200 mt-5 mb-2 select-text">
          {parseInlineCodeAndBold(line.replace("### ", "").trim())}
        </h3>
      );
      continue;
    }

    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      const cleanLine = line.trim().replace(/^[-*]\s+/, "");
      elements.push(
        <ul key={elementKey++} className="list-disc pl-5 my-1.5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
          <li className="leading-relaxed select-text">{parseInlineCodeAndBold(cleanLine)}</li>
        </ul>
      );
      continue;
    }

    if (line.trim() === "---") {
      elements.push(<hr key={elementKey++} className="my-6 border-zinc-200/60 dark:border-zinc-800/80" />);
      continue;
    }

    if (line.trim()) {
      elements.push(
        <p key={elementKey++} className="text-xs sm:text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed my-2 select-text">
          {parseInlineCodeAndBold(line.trim())}
        </p>
      );
    }
  }

  if (inTable) elements.push(flushTable(elementKey++));
  if (inCodeBlock) elements.push(flushCodeBlock(elementKey++));

  return <div className="space-y-1">{elements}</div>;
}

export function PracticeClient({ exercise }: { exercise: Exercise }) {
  const activeExercise = exercise;
  const [origin, setOrigin] = useState("http://localhost:3000");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopyUrl = (url: string, key: string) => {
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Dynamic DB CRUD local states
  const [dbRecords, setDbRecords] = useState<Record<string, any>[]>([]);
  const [sessionIp, setSessionIp] = useState("127.0.0.1");
  const [dbLoading, setDbLoading] = useState(false);
  const [apiSearch, setApiSearch] = useState("");
  const [apiCategory, setApiCategory] = useState("");

  // Dialog state for create/edit record
  const [showMangaDialog, setShowMangaDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record<string, any> | null>(null);
  const [dialogError, setDialogError] = useState("");

  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  // Fetch IP dynamic database collection
  const fetchDbRecords = async () => {
    if (!activeExercise?.dbConfig) return;
    try {
      setDbLoading(true);
      let queryUrl = activeExercise.dbConfig.endpoint;
      const params: string[] = [];
      if (apiSearch) params.push(`q=${encodeURIComponent(apiSearch)}`);
      if (apiCategory) params.push(`category=${encodeURIComponent(apiCategory)}`);
      if (params.length > 0) {
        queryUrl += "?" + params.join("&");
      }

      const res = await fetch(queryUrl);
      if (res.ok) {
        const data = await res.json();
        setDbRecords(data);
        const ipHeader = res.headers.get("X-Session-IP");
        if (ipHeader) setSessionIp(ipHeader);
      }
    } catch (e) {
      console.error("Failed to load database records:", e);
    } finally {
      setDbLoading(false);
    }
  };

  useEffect(() => {
    if (activeExercise?.dbConfig) {
      fetchDbRecords();
    }
  }, [apiSearch, apiCategory, activeExercise]);

  // Create or Update Record Submit handler
  const handleSaveManga = async (e: React.FormEvent) => {
    e.preventDefault();
    setDialogError("");

    if (!activeExercise?.dbConfig) return;

    // Validate the fields dynamically
    const payload: Record<string, any> = {};
    for (const field of activeExercise.dbConfig.fields) {
      const val = formData[field.name]?.trim() ?? "";
      if (field.required && !val) {
        setDialogError(`Vui lòng điền đầy đủ thông tin: ${field.label}`);
        return;
      }
      if (field.type === "number" && val) {
        const num = parseFloat(val);
        if (isNaN(num) || num < 0) {
          setDialogError(`Trường ${field.label} phải là số dương hợp lệ.`);
          return;
        }
        payload[field.name] = num;
      } else {
        payload[field.name] = val || undefined;
      }
    }

    try {
      let res;
      if (editingRecord) {
        // Edit mode (PUT)
        res = await fetch(`${activeExercise.dbConfig.endpoint}/${editingRecord.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // Create mode (POST)
        res = await fetch(activeExercise.dbConfig.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setShowMangaDialog(false);
        fetchDbRecords();
        setFormData({});
      } else {
        const errData = await res.json();
        setDialogError(errData.error || "Gửi yêu cầu API thất bại.");
      }
    } catch (error: any) {
      setDialogError(error.message || "Lỗi giao tiếp máy chủ.");
    }
  };

  const handleDeleteManga = async (id: string) => {
    if (!activeExercise?.dbConfig) return;
    if (!confirm(`Bạn có chắc muốn xóa bản ghi này khỏi bộ nhớ RAM?`)) return;
    try {
      const res = await fetch(`${activeExercise.dbConfig.endpoint}/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchDbRecords();
      }
    } catch (e) {
      console.error("Delete failed:", e);
    }
  };

  const openEditDialog = (record: Record<string, any>) => {
    setEditingRecord(record);
    const initialFormData: Record<string, string> = {};
    if (activeExercise?.dbConfig) {
      for (const field of activeExercise.dbConfig.fields) {
        initialFormData[field.name] = record[field.name] !== undefined ? String(record[field.name]) : "";
      }
    }
    setFormData(initialFormData);
    setDialogError("");
    setShowMangaDialog(true);
  };

  const openCreateDialog = () => {
    setEditingRecord(null);
    const initialFormData: Record<string, string> = {};
    if (activeExercise?.dbConfig) {
      for (const field of activeExercise.dbConfig.fields) {
        initialFormData[field.name] = "";
      }
    }
    setFormData(initialFormData);
    setDialogError("");
    setShowMangaDialog(true);
  };

  const categoriesList = Array.from(
    new Set(dbRecords.map((r) => r.category).filter(Boolean))
  ) as string[];

  return (
    <div className="container mx-auto px-4 max-w-5xl py-8 flex-grow flex flex-col justify-center animate-in fade-in duration-300">
      {/* Back Button */}
      <div className="mb-4 select-none">
        <Link
          href="/practice"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-orange-500 transition-colors"
        >
          <ArrowLeft size={13} />
          Quay lại danh sách bài thực hành
        </Link>
      </div>

      {/* Page Header */}
      <div className="mb-6 pb-4 border-b border-zinc-200/50 dark:border-zinc-800/40">
        <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-950 dark:text-white flex items-center gap-2">
          <Terminal className="text-orange-500" />
          {activeExercise.title}
        </h1>
        <p className="text-xs text-zinc-500 mt-1 select-none">
          Môi trường thực hành, kiểm thử dữ liệu trực tiếp và đặc tả API của bài tập.
        </p>
      </div>

      {/* MAIN PANEL CONTENT DISPLAY */}
      <main className="w-full space-y-6">
        <div className="space-y-6">

          {/* Render dynamic markdown instructions */}
          <Card className="border border-zinc-200/80 bg-white dark:bg-zinc-900 dark:border-zinc-800/80 rounded-2xl shadow-sm p-6">
            <MarkdownRenderer content={activeExercise.content} />
          </Card>

          {/* Form submit target notification card for forms */}
          {activeExercise.id === "1-forms" && (
            <Card className="border border-orange-250 bg-orange-50/20 dark:border-orange-950/20 dark:bg-orange-950/5 rounded-2xl overflow-hidden shadow-sm">
              <CardHeader className="p-4 bg-orange-100/30 dark:bg-orange-950/10 border-b border-orange-200/40 dark:border-orange-900/10 flex flex-row items-center gap-2.5 select-none">
                <Play className="h-4.5 w-4.5 text-orange-600 dark:text-orange-500 animate-pulse fill-orange-600" />
                <span className="text-xs font-black text-orange-800 dark:text-orange-400 uppercase tracking-wide">
                  Đường dẫn Endpoint nộp bài tập Form HTML
                </span>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <p className="text-xs text-zinc-650 dark:text-zinc-350 font-bold leading-relaxed">
                  Thiết lập thuộc tính <code className="text-orange-600 bg-orange-50 px-1 py-0.5 rounded">action</code> trên form HTML của bạn gửi về địa chỉ tương ứng:
                </p>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { type: "login", label: "Form Đăng Nhập", url: `${origin}/api/practice/submit/login` },
                    { type: "register", label: "Form Đăng Ký", url: `${origin}/api/practice/submit/register` },
                    { type: "settings", label: "Form Cài Đặt (Profile)", url: `${origin}/api/practice/submit/settings` }
                  ].map((item) => (
                    <div key={item.type} className="border border-zinc-150 dark:border-zinc-800 bg-white dark:bg-zinc-950/50 p-3 rounded-xl flex flex-col justify-between gap-2.5 shadow-sm">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">
                          {item.label}
                        </span>
                        <code className="block text-[11px] font-mono text-orange-600 dark:text-orange-400 bg-zinc-50 dark:bg-zinc-900/60 p-1.5 rounded border border-zinc-100 dark:border-zinc-850 select-all overflow-x-auto whitespace-nowrap">
                          {item.url}
                        </code>
                      </div>
                      <Button
                        onClick={() => handleCopyUrl(item.url, item.type)}
                        variant="outline"
                        className="w-full rounded-lg text-[10px] font-extrabold gap-1 border-zinc-200 text-zinc-600 hover:text-orange-600 dark:border-zinc-800 dark:text-zinc-350 cursor-pointer h-7 flex-shrink-0"
                      >
                        {copiedKey === item.type ? <Check size={11} className="text-green-600" /> : <Copy size={11} />}
                        {copiedKey === item.type ? "Đã copy" : "Copy URL"}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* DISPLAY DYNAMIC DATABASE WORKSHOP */}
          {activeExercise.dbConfig && (
            <>
              {/* Dynamic API Specs section */}
              <Card className="border border-zinc-200/80 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-extrabold text-zinc-850 dark:text-white flex items-center gap-1.5 select-none">
                    <Terminal size={15} className="text-orange-500" />
                    Tài liệu đặc tả {activeExercise.dbConfig.title} API
                  </h3>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    Các cổng API hỗ trợ tương tác và lưu dữ liệu tạm thời theo từng IP riêng biệt. Tự động reset database sau 30 phút không hoạt động.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* GET spec */}
                  <div className="border border-zinc-150 dark:border-zinc-800 rounded-xl overflow-hidden bg-zinc-50/20">
                    <div className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-150 dark:border-zinc-800 px-4 py-2 flex items-center justify-between font-bold">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-600 text-white font-bold text-[9px]">GET</Badge>
                        <code className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">
                          {activeExercise.dbConfig.endpoint}
                        </code>
                      </div>
                      <span className="text-[10px] text-zinc-400">Danh sách {activeExercise.dbConfig.title}</span>
                    </div>
                    <div className="p-4 space-y-3 text-xs leading-relaxed">
                      <p className="text-zinc-505">
                        Lấy danh sách dữ liệu của IP hiện tại. Hỗ trợ tìm kiếm và lọc qua tham số URL.
                      </p>
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wide">
                          Tham số URL (Query Params):
                        </span>
                        <ul className="list-disc pl-5 space-y-0.5 text-zinc-550 text-[11px]">
                          <li><code>q</code> (string, optional): Tìm kiếm toàn văn trên các trường dạng chuỗi.</li>
                          {activeExercise.dbConfig.fields.some(f => f.name === "category") && (
                            <li><code>category</code> (string, optional): Lọc theo danh mục/thể loại.</li>
                          )}
                          {activeExercise.dbConfig.fields.some(f => f.name === "price") && (
                            <>
                              <li><code>priceMin</code> (number, optional): Lọc các bản ghi có giá trị &ge; giá trị tối thiểu.</li>
                              <li><code>priceMax</code> (number, optional): Lọc các bản ghi có giá trị &le; giá trị tối đa.</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* POST spec */}
                  <div className="border border-zinc-150 dark:border-zinc-800 rounded-xl overflow-hidden bg-zinc-50/20">
                    <div className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-150 dark:border-zinc-800 px-4 py-2 flex items-center justify-between font-bold">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-600 text-white font-bold text-[9px]">POST</Badge>
                        <code className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">
                          {activeExercise.dbConfig.endpoint}
                        </code>
                      </div>
                      <span className="text-[10px] text-zinc-400">Thêm bản ghi mới</span>
                    </div>
                    <div className="p-4 space-y-3 text-xs leading-relaxed">
                      <p className="text-zinc-550">Tạo bản ghi mới trong phiên IP hiện tại. Yêu cầu body định dạng JSON.</p>
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wide">
                          JSON Body schema:
                        </span>
                        <pre className="bg-zinc-950 text-green-400 text-[10px] font-mono p-3 rounded-lg overflow-x-auto select-all">
                          {JSON.stringify(
                            activeExercise.dbConfig.fields.reduce((acc, field) => {
                              acc[field.name] = `${field.label}${field.required ? " [Bắt buộc]" : " [Tùy chọn]"} (${field.type})`;
                              return acc;
                            }, {} as Record<string, string>),
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    </div>
                  </div>

                  {/* PUT spec */}
                  <div className="border border-zinc-150 dark:border-zinc-800 rounded-xl overflow-hidden bg-zinc-50/20">
                    <div className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-150 dark:border-zinc-800 px-4 py-2 flex items-center justify-between font-bold">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-amber-500 text-white font-bold text-[9px]">PUT</Badge>
                        <code className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">
                          {activeExercise.dbConfig.endpoint}/[id]
                        </code>
                      </div>
                      <span className="text-[10px] text-zinc-400">Cập nhật thông tin</span>
                    </div>
                    <div className="p-4 space-y-3 text-xs leading-relaxed">
                      <p className="text-zinc-550">
                        Cập nhật thông tin theo mã <code>[id]</code> tương ứng. Hỗ trợ cả phương thức <code>PATCH</code>. Gửi lên body dạng JSON chứa các thuộc tính cần sửa.
                      </p>
                    </div>
                  </div>

                  {/* DELETE spec */}
                  <div className="border border-zinc-150 dark:border-zinc-800 rounded-xl overflow-hidden bg-zinc-50/20">
                    <div className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-150 dark:border-zinc-800 px-4 py-2 flex items-center justify-between font-bold">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-red-600 text-white font-bold text-[9px]">DELETE</Badge>
                        <code className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">
                          {activeExercise.dbConfig.endpoint}/[id]
                        </code>
                      </div>
                      <span className="text-[10px] text-zinc-400">Xóa dữ liệu</span>
                    </div>
                    <div className="p-4 space-y-3 text-xs leading-relaxed">
                      <p className="text-zinc-550">
                        Xóa vĩnh viễn bản ghi theo mã <code>[id]</code> tương ứng ra khỏi bộ nhớ RAM session của IP hiện tại.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
              {/* Database info card */}
              <Card className="border border-zinc-200/80 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm overflow-hidden">
                <CardHeader className="bg-zinc-50/50 dark:bg-zinc-950 px-5 py-4 border-b border-zinc-200/60 dark:border-zinc-850 flex flex-row items-center justify-between flex-wrap gap-3 select-none">
                  <div className="flex items-center gap-2">
                    <Database size={18} className="text-orange-500" />
                    <div>
                      <CardTitle className="text-sm font-extrabold text-zinc-850 dark:text-white">
                        Trình kiểm thử Live Database ({activeExercise.dbConfig.title} CRUD)
                      </CardTitle>
                      <CardDescription className="text-[10px] text-zinc-400 mt-0.5 font-semibold">
                        IP phiên làm việc: <span className="text-orange-500 font-mono">{sessionIp}</span> (Tự động xóa sau 30 phút rảnh)
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={fetchDbRecords}
                      variant="ghost"
                      size="sm"
                      disabled={dbLoading}
                      className="h-8 rounded-lg text-xs font-bold gap-1 text-zinc-505 hover:text-orange-505 cursor-pointer"
                    >
                      <RefreshCw size={12} className={dbLoading ? "animate-spin" : ""} />
                      Tải lại
                    </Button>
                    <Button
                      onClick={openCreateDialog}
                      size="sm"
                      className="h-8 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold gap-1 cursor-pointer"
                    >
                      <Plus size={12} />
                      Thêm {activeExercise.dbConfig.title}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-4">

                  {/* Local filters in Live DB Tester */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                      <Input
                        placeholder="Tìm kiếm..."
                        value={apiSearch}
                        onChange={(e) => setApiSearch(e.target.value)}
                        className="pl-9 rounded-xl border-zinc-200 text-xs font-medium focus-visible:ring-orange-500"
                      />
                    </div>

                    {categoriesList.length > 0 && (
                      <select
                        value={apiCategory}
                        onChange={(e) => setApiCategory(e.target.value)}
                        className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs font-bold text-zinc-650 dark:text-zinc-450 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      >
                        <option value="">— Tất cả danh mục —</option>
                        {categoriesList.map((cat, idx) => (
                          <option key={idx} value={cat}>{cat}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Records List Grid / Table */}
                  {dbLoading && dbRecords.length === 0 ? (
                    <div className="space-y-2 py-8">
                      <Skeleton className="h-10 w-full rounded-xl" />
                      <Skeleton className="h-10 w-full rounded-xl" />
                      <Skeleton className="h-10 w-full rounded-xl" />
                    </div>
                  ) : dbRecords.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/20 text-zinc-400 select-none">
                      <BookOpen className="mx-auto h-8 w-8 mb-2 opacity-50" />
                      <p className="text-xs font-semibold">Chưa có bản ghi {activeExercise.dbConfig.title} nào trong phiên RAM của bạn.</p>
                      <p className="text-[10px] text-zinc-400 mt-1">Hãy ấn nút "Thêm {activeExercise.dbConfig.title}" để tạo mới dữ liệu kiểm thử!</p>
                    </div>
                  ) : (
                    <div className="border border-zinc-150 dark:border-zinc-850 rounded-xl overflow-hidden text-xs">
                      <table className="w-full text-left border-collapse select-text">
                        <thead>
                          <tr className="bg-zinc-50/50 dark:bg-zinc-900 border-b border-zinc-150 dark:border-zinc-800 font-bold text-zinc-500">
                            <th className="p-3 text-[10px] uppercase">ID</th>
                            {activeExercise.dbConfig.fields.map((field) => (
                              <th
                                key={field.name}
                                className={`p-3 text-[10px] uppercase ${field.type === "number" ? "text-right" : ""
                                  }`}
                              >
                                {field.label}
                              </th>
                            ))}
                            <th className="p-3 text-[10px] uppercase text-center select-none">Hành động</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dbRecords.map((item) => (
                            <tr key={item.id} className="border-b border-zinc-100 dark:border-zinc-900 last:border-b-0 hover:bg-zinc-50/40 dark:hover:bg-zinc-850/20 font-medium">
                              <td className="p-3 font-mono font-bold text-zinc-400">{item.id}</td>
                              {activeExercise.dbConfig!.fields.map((field) => {
                                const val = item[field.name];
                                if (field.type === "image") {
                                  return (
                                    <td key={field.name} className="p-3">
                                      {val ? (
                                        <img src={val} alt="" className="w-10 h-14 object-cover rounded-md border border-zinc-200 dark:border-zinc-800 shadow-sm flex-shrink-0" />
                                      ) : (
                                        <span className="text-zinc-300 dark:text-zinc-700">—</span>
                                      )}
                                    </td>
                                  );
                                }
                                if (field.name === "category") {
                                  return (
                                    <td key={field.name} className="p-3">
                                      <Badge variant="secondary" className="rounded-full text-[9px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-350 px-2">
                                        {val}
                                      </Badge>
                                    </td>
                                  );
                                }
                                if (field.type === "number") {
                                  return (
                                    <td key={field.name} className="p-3 text-right font-bold text-orange-600 dark:text-orange-400">
                                      {typeof val === "number" ? val.toLocaleString("vi-VN") : val} đ
                                    </td>
                                  );
                                }
                                return (
                                  <td key={field.name} className="p-3 text-zinc-600 dark:text-zinc-450 max-w-xs truncate" title={String(val || "")}>
                                    {val !== undefined && val !== null ? String(val) : "—"}
                                  </td>
                                );
                              })}
                              <td className="p-3 text-center select-none space-x-1.5 whitespace-nowrap">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditDialog(item)}
                                  className="h-7 w-7 text-zinc-505 hover:text-orange-505 hover:bg-orange-50 dark:hover:bg-orange-950/20 rounded-md cursor-pointer"
                                  title="Sửa"
                                >
                                  <Edit size={12} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteManga(item.id)}
                                  className="h-7 w-7 text-zinc-505 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md cursor-pointer"
                                  title="Xóa"
                                >
                                  <Trash2 size={12} />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                </CardContent>
              </Card>


            </>
          )}

          {/* DISPLAY EXERCISE 3: EXAMS API */}
          {activeExercise.id.includes("exams") && (
            <Card className="border border-zinc-200/80 bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm">
              <ApiDocs />
            </Card>
          )}

        </div>
      </main>

      {/* MODAL DIALOG FOR CREATE/EDIT DATABASE RECORD */}
      <Dialog open={showMangaDialog} onOpenChange={setShowMangaDialog}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-zinc-900 dark:text-zinc-100 font-extrabold flex items-center gap-2 select-none">
              <Database className="text-orange-500 h-5 w-5" />
              {activeExercise?.dbConfig && (
                <span>{editingRecord ? `Sửa thông tin ${activeExercise.dbConfig.title}` : `Thêm ${activeExercise.dbConfig.title} mới vào RAM`}</span>
              )}
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs font-medium mt-1">
              {editingRecord ? `Cập nhật dữ liệu cho mã bản ghi: ${editingRecord.id}` : "Tạo dữ liệu kiểm thử mới cho IP phiên này."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveManga} className="space-y-4 text-xs font-semibold">
            {dialogError && (
              <div className="bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-900/35 p-3 rounded-xl flex items-center gap-2">
                <XCircle size={15} />
                <span>{dialogError}</span>
              </div>
            )}

            {activeExercise?.dbConfig?.fields.map((field) => (
              <div key={field.name} className="space-y-1.5">
                <span className="text-zinc-400 block">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </span>
                {field.type === "textarea" ? (
                  <Textarea
                    placeholder={field.placeholder}
                    value={formData[field.name] || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, [field.name]: e.target.value }))
                    }
                    rows={3}
                    className="rounded-xl border-zinc-200 text-xs font-medium focus-visible:ring-orange-500"
                    required={field.required}
                  />
                ) : (
                  <Input
                    type={field.type === "number" ? "number" : "text"}
                    placeholder={field.placeholder}
                    value={formData[field.name] || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, [field.name]: e.target.value }))
                    }
                    className="rounded-xl border-zinc-200 text-xs font-medium focus-visible:ring-orange-500"
                    required={field.required}
                  />
                )}
              </div>
            ))}

            <DialogFooter className="sm:justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowMangaDialog(false)}
                className="rounded-xl text-xs font-bold border-zinc-200 text-zinc-650 dark:border-zinc-850 dark:text-zinc-350 cursor-pointer"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold cursor-pointer px-5"
              >
                Lưu lại
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
