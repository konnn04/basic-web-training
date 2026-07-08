"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Copy, Check } from "lucide-react";
import type { LabMode } from "@/lib/code-practice/types";

type DraftQuestion = {
  id: string;
  title: string;
  description: string;
  points: number;
  html: string;
  css: string;
  js: string;
  starter: string;
  checker: string;
};

function emptyQuestion(index: number): DraftQuestion {
  return {
    id: `q${index}`,
    title: "",
    description: "",
    points: 10,
    html: "",
    css: "",
    js: "",
    starter: "",
    checker: "",
  };
}

export function CreatePracticeTestClient() {
  const [mode, setMode] = useState<LabMode>("css");
  const [setId, setSetId] = useState("my-lab-set");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<DraftQuestion[]>([emptyQuestion(1)]);
  const [copied, setCopied] = useState(false);

  const updateQuestion = (index: number, patch: Partial<DraftQuestion>) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  };

  const addQuestion = () => setQuestions((prev) => [...prev, emptyQuestion(prev.length + 1)]);
  const removeQuestion = (index: number) =>
    setQuestions((prev) => prev.filter((_, i) => i !== index));

  const json = useMemo(() => {
    const set = {
      id: setId,
      mode,
      title,
      description,
      questions: questions.map((q) => ({
        id: q.id,
        title: q.title,
        description: q.description,
        points: q.points,
        files: { html: q.html, css: q.css, js: q.js },
        editable: mode,
        starter: q.starter,
        checker: q.checker,
      })),
    };
    return JSON.stringify(set, null, 2);
  }, [setId, mode, title, description, questions]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 max-w-5xl py-8 flex-grow space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-zinc-950 dark:text-white">
          Công cụ tạo đề code-practice
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Điền thông tin bên dưới rồi copy JSON, dán vào file trong <code>assets/code-practice/</code>.
        </p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-sm font-extrabold">Thông tin bộ đề</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500">Chế độ (mode)</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as LabMode)}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs font-bold"
              >
                <option value="css">css</option>
                <option value="js">js</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500">ID bộ đề (tên file gợi ý)</label>
              <Input value={setId} onChange={(e) => setSetId(e.target.value)} className="text-xs" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500">Tiêu đề</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-xs" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500">Mô tả</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="text-xs" />
          </div>
        </CardContent>
      </Card>

      {questions.map((q, index) => (
        <Card key={index} className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-extrabold">Câu {index + 1}</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeQuestion(index)}
              className="text-zinc-400 hover:text-red-500 cursor-pointer"
            >
              <Trash2 size={14} />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500">ID câu hỏi</label>
                <Input value={q.id} onChange={(e) => updateQuestion(index, { id: e.target.value })} className="text-xs" />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-zinc-500">Tiêu đề câu hỏi</label>
                <Input value={q.title} onChange={(e) => updateQuestion(index, { title: e.target.value })} className="text-xs" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500">Mô tả / yêu cầu (markdown)</label>
              <Textarea value={q.description} onChange={(e) => updateQuestion(index, { description: e.target.value })} rows={3} className="text-xs" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500">Điểm</label>
              <Input
                type="number"
                value={q.points}
                onChange={(e) => updateQuestion(index, { points: Number(e.target.value) || 0 })}
                className="text-xs w-32"
              />
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500">HTML (bắt buộc)</label>
                <Textarea value={q.html} onChange={(e) => updateQuestion(index, { html: e.target.value })} rows={5} className="text-xs font-mono" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500">CSS (nếu có)</label>
                <Textarea value={q.css} onChange={(e) => updateQuestion(index, { css: e.target.value })} rows={5} className="text-xs font-mono" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500">JS (nếu có)</label>
                <Textarea value={q.js} onChange={(e) => updateQuestion(index, { js: e.target.value })} rows={5} className="text-xs font-mono" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500">
                Code khởi tạo (starter) cho phần &quot;{mode}&quot; người học sẽ sửa
              </label>
              <Textarea value={q.starter} onChange={(e) => updateQuestion(index, { starter: e.target.value })} rows={3} className="text-xs font-mono" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500">
                Checker (thân hàm JS, nhận doc, win, code — trả về &#123; pass, message &#125;)
              </label>
              <Textarea value={q.checker} onChange={(e) => updateQuestion(index, { checker: e.target.value })} rows={4} className="text-xs font-mono" />
            </div>
          </CardContent>
        </Card>
      ))}

      <Button onClick={addQuestion} variant="outline" className="rounded-xl text-xs font-bold gap-1.5 cursor-pointer">
        <Plus size={14} />
        Thêm câu hỏi
      </Button>

      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-extrabold">JSON xuất ra</CardTitle>
          <Button onClick={handleCopy} size="sm" className="rounded-xl text-xs font-bold gap-1.5 cursor-pointer">
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? "Đã copy" : "Copy JSON"}
          </Button>
        </CardHeader>
        <CardContent>
          <pre className="bg-zinc-950 text-zinc-200 text-[11px] font-mono p-4 rounded-xl overflow-x-auto max-h-[400px] select-all">
            {json}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
