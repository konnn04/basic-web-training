"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Check, Terminal, ExternalLink, Globe } from "lucide-react";

type ApiEndpoint = {
  method: "GET" | "POST";
  path: string;
  description: string;
  parameters?: Array<{ name: string; type: string; required: boolean; desc: string }>;
  responseSample: string;
};

export function ApiDocs() {
  const [origin, setOrigin] = useState<string>("http://localhost:3000");
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const endpoints: ApiEndpoint[] = [
    {
      method: "GET",
      path: "/api/exams",
      description: "Lấy danh sách cấu hình tất cả các đề thi trắc nghiệm tĩnh đang có trên hệ thống.",
      responseSample: `[
  {
    "id": "test-1.1",
    "title": "Bài kiểm tra số 1 - Tổng quan Web",
    "description": "Web, Website, URL, HTTP, HTTPS, Browser, Responsive",
    "duration": 30,
    "questionCount": 30
  },
  {
    "id": "test-1.2",
    "title": "Bài kiểm tra số 2 - HTML nhập môn",
    "description": "HTML, Frontend, GitHub Pages",
    "duration": 30,
    "questionCount": 30
  }
]`,
    },
    {
      method: "GET",
      path: "/api/exams/[id]",
      description: "Lấy chi tiết danh sách các câu hỏi, các phương án lựa chọn và đáp án đúng của bài thi có mã [id] tương ứng.",
      parameters: [
        {
          name: "id",
          type: "string",
          required: true,
          desc: "Mã đề thi (Ví dụ: test-1.1, test-1.2, test-1.3)",
        },
      ],
      responseSample: `{
  "title": "Bài kiểm tra số 1 - Tổng quan Web",
  "description": "Web, Website, URL, HTTP, HTTPS, Browser, Responsive",
  "duration": 30,
  "random": true,
  "questions": [
    {
      "type": "multiple_choice",
      "question": {
        "content": "Web là gì?",
        "images": []
      },
      "options": [
        { "id": "1", "content": "Một website" },
        { "id": "2", "content": "Hệ thống tài nguyên được liên kết qua Internet" }
      ],
      "answer": ["2"],
      "explanation": "Web là hệ thống các tài nguyên được liên kết qua Internet."
    }
  ]
}`,
    },
  ];

  const handleCopy = (fullPath: string, pathKey: string) => {
    navigator.clipboard.writeText(fullPath);
    setCopiedPath(pathKey);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
          Tài liệu Hướng dẫn gọi API (API Documentation)
        </h2>
        <p className="text-[10px] text-zinc-400 mt-0.5">
          Học sinh có thể sử dụng trực tiếp các endpoint API dưới đây bằng các thư viện AJAX (fetch, axios, jQuery ajax) để thực hành thiết kế, lập trình giao diện Frontend riêng.
        </p>
      </div>

      <div className="space-y-6">
        {endpoints.map((ep, i) => {
          const fullUrl = `${origin}${ep.path.replace("[id]", "test-1.1")}`;
          const displayUrl = `${origin}${ep.path}`;

          return (
            <Card key={i} className="border border-zinc-200/80 dark:border-zinc-850 shadow-sm overflow-hidden rounded-2xl">
              <div className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-green-600 text-white font-black text-[10px] px-2 py-0.5 rounded-md shadow-sm">
                    {ep.method}
                  </span>
                  <code className="text-xs font-bold font-mono text-zinc-850 dark:text-zinc-100 truncate">
                    {ep.path}
                  </code>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(`${origin}${ep.path}`, ep.path)}
                    className="h-8 rounded-lg px-2 text-[10px] font-bold gap-1 text-zinc-500 hover:text-orange-500 cursor-pointer"
                  >
                    {copiedPath === ep.path ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                    {copiedPath === ep.path ? "Đã copy" : "Copy URL"}
                  </Button>
                  
                  <a href={fullUrl} target="_blank" className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-500 hover:text-orange-500">
                    Test thử
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              <CardContent className="p-4 space-y-4">
                <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                  {ep.description}
                </p>

                {/* Parameters list if any */}
                {ep.parameters && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
                      Tham số đầu vào (Parameters)
                    </span>
                    <div className="border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden bg-zinc-50/50 dark:bg-zinc-950/20 text-xs">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-zinc-100/50 dark:bg-zinc-900/50 border-b border-zinc-150 dark:border-zinc-800 text-[10px] font-bold text-zinc-500">
                            <th className="p-2.5">Tên</th>
                            <th className="p-2.5">Kiểu</th>
                            <th className="p-2.5">Bắt buộc</th>
                            <th className="p-2.5">Mô tả</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ep.parameters.map((param, pIdx) => (
                            <tr key={pIdx} className="border-b border-zinc-100 dark:border-zinc-800 last:border-b-0">
                              <td className="p-2.5 font-bold font-mono text-zinc-800 dark:text-zinc-200">{param.name}</td>
                              <td className="p-2.5 text-zinc-500">{param.type}</td>
                              <td className="p-2.5 font-bold text-red-500">{param.required ? "Có" : "Không"}</td>
                              <td className="p-2.5 text-zinc-500">{param.desc}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Example Response JSON Display */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide flex items-center gap-1 select-none">
                    <Terminal size={12} />
                    Dữ liệu mẫu trả về (JSON Response)
                  </span>
                  <pre className="bg-zinc-950 text-green-400 text-[10px] font-mono p-4 rounded-xl whitespace-pre overflow-x-auto leading-relaxed max-h-60 select-text">
                    {ep.responseSample}
                  </pre>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
