"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Copy, Check } from "lucide-react";
import type { LabMode } from "@/lib/code-practice/types";

type DraftCheck = {
  label: string;
  points: number;
  checker: string;
};

type DraftQuestion = {
  id: string;
  title: string;
  description: string;
  html: string;
  css: string;
  js: string;
  starter: string;
  checks: DraftCheck[];
};

function emptyCheck(): DraftCheck {
  return { label: "", points: 10, checker: "" };
}

function emptyQuestion(index: number): DraftQuestion {
  return {
    id: `q${index}`,
    title: "",
    description: "",
    html: "",
    css: "",
    js: "",
    starter: "",
    checks: [emptyCheck()],
  };
}

export function CreatePracticeTestClient() {
  const [mode, setMode] = useState<LabMode>("css");
  const [group, setGroup] = useState<"EASY" | "MEDIUM" | "HARD">("EASY");
  const [groupTitle, setGroupTitle] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [questions, setQuestions] = useState<DraftQuestion[]>([emptyQuestion(1)]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const updateQuestion = (index: number, patch: Partial<DraftQuestion>) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  };

  const addQuestion = () => setQuestions((prev) => [...prev, emptyQuestion(prev.length + 1)]);
  const removeQuestion = (index: number) =>
    setQuestions((prev) => prev.filter((_, i) => i !== index));

  const updateCheck = (qIndex: number, cIndex: number, patch: Partial<DraftCheck>) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? { ...q, checks: q.checks.map((c, j) => (j === cIndex ? { ...c, ...patch } : c)) }
          : q
      )
    );
  };

  const addCheck = (qIndex: number) =>
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIndex ? { ...q, checks: [...q.checks, emptyCheck()] } : q))
    );

  const removeCheck = (qIndex: number, cIndex: number) =>
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex ? { ...q, checks: q.checks.filter((_, j) => j !== cIndex) } : q
      )
    );

  const groupJson = useMemo(() => {
    return JSON.stringify(
      { id: `${mode}-${group.toLowerCase()}`, title: groupTitle, description: groupDescription },
      null,
      2
    );
  }, [mode, group, groupTitle, groupDescription]);

  const questionFiles = useMemo(
    () =>
      questions.map((q) => ({
        filename: `${q.id || "q"}.json`,
        content: JSON.stringify(
          {
            id: q.id,
            title: q.title,
            description: q.description,
            files: { html: q.html, css: q.css, js: q.js },
            editable: mode,
            starter: q.starter,
            checks: q.checks,
          },
          null,
          2
        ),
      })),
    [questions, mode]
  );

  const handleCopy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 2000);
  };

  return (
    <div className="container mx-auto px-4 max-w-5xl py-8 flex-grow space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-zinc-950 dark:text-white">
          Công cụ tạo đề code-practice
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Điền thông tin bên dưới rồi copy từng JSON. Đặt file <code>_group.json</code> và các file câu hỏi vào{" "}
          <code>assets/code-practice/{"{mode}"}/{"{EASY|MEDIUM|HARD}"}/</code>.
        </p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-sm font-extrabold">Thông tin bộ đề (_group.json)</CardTitle>
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
              <label className="text-xs font-bold text-zinc-500">Độ khó (tên thư mục)</label>
              <select
                value={group}
                onChange={(e) => setGroup(e.target.value as "EASY" | "MEDIUM" | "HARD")}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs font-bold"
              >
                <option value="EASY">EASY</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HARD">HARD</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500">Tiêu đề bộ đề</label>
            <Input value={groupTitle} onChange={(e) => setGroupTitle(e.target.value)} className="text-xs" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500">Mô tả bộ đề</label>
            <Textarea value={groupDescription} onChange={(e) => setGroupDescription(e.target.value)} rows={2} className="text-xs" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-500">
                assets/code-practice/{mode}/{group}/_group.json
              </label>
              <Button onClick={() => handleCopy("group", groupJson)} size="sm" variant="outline" className="rounded-xl text-xs font-bold gap-1.5 cursor-pointer">
                {copiedKey === "group" ? <Check size={12} /> : <Copy size={12} />}
                {copiedKey === "group" ? "Đã copy" : "Copy"}
              </Button>
            </div>
            <pre className="bg-zinc-950 text-zinc-200 text-[11px] font-mono p-3 rounded-xl overflow-x-auto max-h-[160px] select-all">
              {groupJson}
            </pre>
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
                <label className="text-xs font-bold text-zinc-500">ID câu hỏi (= tên file)</label>
                <Input value={q.id} onChange={(e) => updateQuestion(index, { id: e.target.value })} className="text-xs" />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-zinc-500">Tiêu đề câu hỏi</label>
                <Input value={q.title} onChange={(e) => updateQuestion(index, { title: e.target.value })} className="text-xs" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500">
                Mô tả / yêu cầu (markdown — mô tả mục tiêu, gợi ý tên thuộc tính/API ở dòng &quot;Gợi ý:&quot; cuối cùng)
              </label>
              <Textarea value={q.description} onChange={(e) => updateQuestion(index, { description: e.target.value })} rows={3} className="text-xs" />
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

            <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Yêu cầu chấm điểm (checks) — mỗi yêu cầu độc lập là 1 dòng checklist học viên nhìn thấy
                </label>
                <Button onClick={() => addCheck(index)} size="sm" variant="outline" className="rounded-xl text-[11px] font-bold gap-1 cursor-pointer">
                  <Plus size={12} />
                  Thêm yêu cầu
                </Button>
              </div>

              {q.checks.map((c, cIndex) => (
                <div key={cIndex} className="rounded-xl border border-zinc-200/70 dark:border-zinc-800/70 p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Yêu cầu {cIndex + 1}
                    </span>
                    {q.checks.length > 1 && (
                      <button
                        onClick={() => removeCheck(index, cIndex)}
                        className="text-zinc-400 hover:text-red-500 cursor-pointer"
                        title="Xóa yêu cầu này"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-4 gap-3">
                    <div className="space-y-1 sm:col-span-3">
                      <label className="text-xs font-bold text-zinc-500">Mô tả ngắn (label, hiện trong checklist)</label>
                      <Input value={c.label} onChange={(e) => updateCheck(index, cIndex, { label: e.target.value })} className="text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500">Điểm</label>
                      <Input
                        type="number"
                        value={c.points}
                        onChange={(e) => updateCheck(index, cIndex, { points: Number(e.target.value) || 0 })}
                        className="text-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500">
                      Checker (thân hàm JS, nhận doc, win, code — trả về &#123; pass, message &#125;)
                    </label>
                    <Textarea
                      value={c.checker}
                      onChange={(e) => updateCheck(index, cIndex, { checker: e.target.value })}
                      rows={4}
                      className="text-xs font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Button onClick={addQuestion} variant="outline" className="rounded-xl text-xs font-bold gap-1.5 cursor-pointer">
        <Plus size={14} />
        Thêm câu hỏi
      </Button>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-sm font-extrabold">JSON xuất ra (mỗi câu hỏi 1 file)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {questionFiles.map((f, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-500">
                  assets/code-practice/{mode}/{group}/{f.filename}
                </label>
                <Button
                  onClick={() => handleCopy(`q${i}`, f.content)}
                  size="sm"
                  variant="outline"
                  className="rounded-xl text-xs font-bold gap-1.5 cursor-pointer"
                >
                  {copiedKey === `q${i}` ? <Check size={13} /> : <Copy size={13} />}
                  {copiedKey === `q${i}` ? "Đã copy" : "Copy JSON"}
                </Button>
              </div>
              <pre className="bg-zinc-950 text-zinc-200 text-[11px] font-mono p-4 rounded-xl overflow-x-auto max-h-[400px] select-all">
                {f.content}
              </pre>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
