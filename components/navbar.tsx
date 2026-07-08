"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { useExamHistory } from "@/hooks/use-exam-history";
import { usePracticeHistory } from "@/hooks/use-practice-history";
import { useConfirm } from "@/hooks/use-confirm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { isFirebaseConfigured } from "@/lib/firebase";
import { idbClearAll } from "@/lib/idb-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BookOpen,
  Trophy,
  User,
  LogOut,
  Layers,
  Code,
  Menu,
  X,
  Edit2,
  ExternalLink,
  ShieldAlert,
  Trash2,
  Eraser,
} from "lucide-react";
import Image from "next/image";

export function Navbar() {
  const pathname = usePathname();
  const {
    currentUser,
    userEmail,
    userImage,
    isLoggedIn,
    isLoading,
    loginWithGoogle,
    saveName,
    logout,
  } = useUser();
  const { history, reloadHistory, deleteScore } = useExamHistory(currentUser, userEmail);
  const {
    history: practiceHistory,
    deleteEntry: deletePracticeEntry,
    deleteAll: deleteAllPractice,
  } = usePracticeHistory(userEmail);
  const confirm = useConfirm();

  const handleDeleteHistoryRecord = async (resultId: string, examId: string) => {
    const isConfirmed = await confirm({
      title: "Xóa kết quả thi",
      message: "Bạn có chắc chắn muốn xóa kết quả thi này? Hành động này cũng sẽ gỡ điểm số của bạn khỏi Bảng xếp hạng.",
      confirmText: "Xóa",
      cancelText: "Hủy",
      variant: "destructive",
    });

    if (isConfirmed) {
      await deleteScore(resultId, examId);
      window.dispatchEvent(new Event("storage"));
    }
  };

  const handleDeletePracticeRecord = async (id: string) => {
    const isConfirmed = await confirm({
      title: "Xóa kết quả thực hành",
      message: "Bạn có chắc chắn muốn xóa kết quả câu thực hành này? Hành động này cũng sẽ gỡ điểm số của bạn khỏi Bảng xếp hạng.",
      confirmText: "Xóa",
      cancelText: "Hủy",
      variant: "destructive",
    });

    if (isConfirmed) {
      await deletePracticeEntry(id);
      window.dispatchEvent(new Event("storage"));
    }
  };

  const handleClearAllLearningData = async () => {
    const isConfirmed = await confirm({
      title: "Xóa toàn bộ dữ liệu học tập",
      message:
        "Thao tác này sẽ xóa vĩnh viễn toàn bộ lịch sử bài thi, lịch sử thực hành" +
        (isLoggedIn ? " trên máy chủ" : "") +
        " và toàn bộ code đang lưu trong trình duyệt này (IndexedDB). Không thể hoàn tác.",
      confirmText: "Xóa tất cả",
      cancelText: "Hủy",
      variant: "destructive",
    });

    if (!isConfirmed) return;

    // Always clear the browser-local IndexedDB cache (practice code + preview data).
    await idbClearAll();

    if (isLoggedIn && userEmail) {
      await Promise.all([
        fetch(`/api/exams/results?email=${encodeURIComponent(userEmail)}`, { method: "DELETE" }),
        deleteAllPractice(),
      ]);
    } else if (currentUser) {
      localStorage.removeItem(`exam_scores_${currentUser}`);
    }

    reloadHistory();
    window.dispatchEvent(new Event("storage"));
  };

  const [nameInput, setNameInput] = useState("");
  const [showNameModal, setShowNameModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Force student to enter name/login if empty
  useEffect(() => {
    if (!isLoading && !currentUser) {
      setNameInput("");
      setShowNameModal(true);
    } else {
      setShowNameModal(false);
    }
  }, [currentUser, isLoading]);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      saveName(nameInput);
      setShowNameModal(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      let success = false;
      if (isFirebaseConfigured) {
        success = await loginWithGoogle();
      } else {
        // Fallback mock profile in demo mode
        success = await loginWithGoogle({
          name: "Nguyễn Văn A (Demo)",
          email: "nguyenvana.demo@gmail.com",
          image: "",
        });
      }
      if (success) {
        setShowNameModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenChangeName = () => {
    setNameInput(currentUser);
    setShowNameModal(true);
  };

  const handleOpenHistory = () => {
    reloadHistory();
    setShowHistoryModal(true);
  };

  const handleLogout = async () => {
    const isConfirmed = await confirm({
      title: "Đăng xuất / Đổi tài khoản",
      message: "Bạn có chắc muốn đổi tài khoản? Lịch sử điểm của bạn vẫn được lưu lại.",
      confirmText: "Đồng ý",
      cancelText: "Hủy",
      variant: "destructive",
    });
    if (isConfirmed) {
      logout();
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { href: "/exam", label: "Trắc nghiệm", icon: BookOpen },
    { href: "/leaderboard", label: "Xếp hạng", icon: Trophy },
    { href: "/example-layout", label: "Cấu trúc Web", icon: Layers },
    { href: "/practice", label: "Góc Thực Hành", icon: Code },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/85 dark:bg-zinc-950/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br  transition-transform">
              <Image src="/logo.png" alt="MPClub Web Training" width={32} height={32} className="rounded-md" />
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
              MPClub Web Training
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 text-sm font-semibold transition-colors hover:text-orange-500 ${
                    isActive ? "text-orange-600 animate-pulse" : "text-zinc-600 dark:text-zinc-300"
                  }`}
                >
                  <Icon size={16} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* User Section / Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            {!isLoading && currentUser && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-9 rounded-full border-zinc-200 px-3 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 flex items-center gap-2 shadow-sm text-xs font-semibold cursor-pointer"
                  >
                    {userImage ? (
                      <img
                        src={userImage}
                        alt={currentUser}
                        className="h-5 w-5 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400 font-bold text-[10px]">
                        {currentUser[0]?.toUpperCase() || "H"}
                      </div>
                    )}
                    <span className="max-w-[100px] truncate">{currentUser}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60 rounded-xl p-1 shadow-lg">
                  <div className="flex items-center gap-2.5 p-2.5">
                    {userImage ? (
                      <img
                        src={userImage}
                        alt={currentUser}
                        className="h-8 w-8 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white font-semibold flex-shrink-0">
                        {currentUser[0]?.toUpperCase() || "H"}
                      </div>
                    )}
                    <div className="flex flex-col truncate">
                      <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                        {isLoggedIn ? "Đã xác thực Google" : "Tài khoản khách"}
                      </span>
                      <span className="text-sm font-semibold truncate text-zinc-800 dark:text-zinc-200">{currentUser}</span>
                      {userEmail && (
                        <span className="text-[10px] text-zinc-400 truncate max-w-[170px]">{userEmail}</span>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleOpenChangeName} className="rounded-lg gap-2 cursor-pointer py-2 text-xs">
                    <Edit2 size={14} className="text-zinc-400" />
                    Đổi tên hiển thị
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleOpenHistory} className="rounded-lg gap-2 cursor-pointer py-2 text-xs">
                    <Trophy size={14} className="text-amber-500" />
                    Lịch sử điểm số
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="rounded-lg gap-2 cursor-pointer py-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs"
                  >
                    <LogOut size={14} />
                    Đăng xuất / Đổi tài khoản
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9 text-zinc-500 dark:text-zinc-400 cursor-pointer"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 space-y-2.5 animate-in slide-in-from-top-4 duration-200">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-orange-50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400"
                      : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  }`}
                >
                  <Icon size={16} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Name Input / Google Auth Dialog */}
      <Dialog open={showNameModal} onOpenChange={(open) => currentUser && setShowNameModal(open)}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6" onPointerDownOutside={(e) => !currentUser && e.preventDefault()}>
          <DialogHeader className="text-center sm:text-left select-none">
            <DialogTitle className="flex items-center justify-center sm:justify-start gap-2 text-xl font-extrabold text-orange-600 dark:text-orange-400">
              <User size={22} />
              Xin chào bạn học!
            </DialogTitle>
            <DialogDescription className="text-zinc-500 text-xs mt-1.5 leading-relaxed">
              Vui lòng đăng nhập bằng Google hoặc điền tên khách để lưu trữ tiến trình thực hành và lưu điểm xếp hạng.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-3">
            {/* Google Authentication Option */}
            <div className="space-y-2 select-none">
              <Button
                type="button"
                onClick={handleGoogleLogin}
                variant="outline"
                className="w-full h-11 border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 rounded-xl shadow-sm text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
              >
                <svg className="h-4.5 w-4.5 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-1.14 2.78-2.4 3.63v3.01h3.88c2.27-2.08 3.57-5.15 3.57-8.82z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.01c-1.08.72-2.45 1.16-4.05 1.16-3.11 0-5.74-2.11-6.68-4.96H1.21v3.11C3.18 21.88 7.31 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.32 14.28a7.16 7.16 0 0 1 0-4.56V6.61H1.21a11.94 11.94 0 0 0 0 10.78l4.11-3.11z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.93 1.19 15.24 0 12 0 7.31 0 3.18 2.12 1.21 5.79l4.11 3.11c.94-2.85 3.57-4.96 6.68-4.96z"
                  />
                </svg>
                Xác thực bằng Google
              </Button>

              {!isFirebaseConfigured && (
                <div className="flex items-start gap-1.5 text-[10px] text-amber-600 bg-amber-50/70 border border-amber-100 rounded-lg p-2.5 dark:bg-amber-950/20 dark:border-amber-950/30">
                  <ShieldAlert size={14} className="flex-shrink-0 mt-0.5" />
                  <span>
                    Chế độ Demo (Firebase chưa được cài đặt API Key). Nhấp vào nút Google ở trên sẽ tạo tài khoản demo <strong>Nguyễn Văn A</strong>.
                  </span>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="relative flex py-1 items-center select-none">
              <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
              <span className="flex-shrink mx-3 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">hoặc</span>
              <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
            </div>

            {/* Guest Login Option */}
            <form onSubmit={handleSaveName} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider select-none">
                  Sử dụng tên khách
                </label>
                <Input
                  id="userName"
                  placeholder="Nhập họ và tên của bạn..."
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  maxLength={30}
                  required
                  className="rounded-xl border-zinc-200 focus-visible:ring-orange-500 text-xs h-10"
                  autoComplete="off"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-10 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl shadow-md font-bold text-xs cursor-pointer"
              >
                Vào học chế độ Khách
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Scores History Dialog */}
      <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
        <DialogContent className="sm:max-w-lg rounded-2xl max-h-[85vh] flex flex-col p-6">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2 text-amber-500">
              <Trophy size={18} />
              Lịch sử bài làm của bạn
            </DialogTitle>
            <DialogDescription>
              Xem lại danh sách các bài thi và bài thực hành bạn đã hoàn thành.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="exam" className="flex-1 min-h-0 flex flex-col mt-2 gap-3">
            <TabsList variant="line" className="border-b border-zinc-200/60 dark:border-zinc-800/60 w-fit shrink-0">
              <TabsTrigger value="exam" className="text-xs font-bold gap-1.5 px-3 py-2">
                <BookOpen size={14} />
                Đề thi
              </TabsTrigger>
              <TabsTrigger value="practice" className="text-xs font-bold gap-1.5 px-3 py-2">
                <Code size={14} />
                Thực hành
              </TabsTrigger>
            </TabsList>

            <TabsContent value="exam" className="flex-1 overflow-y-auto pr-1">
              {history.length === 0 ? (
                <div className="text-center py-10 text-zinc-400">
                  <Trophy size={36} className="mx-auto text-zinc-200 mb-2.5" />
                  <p className="text-sm">Chưa có kết quả thi nào được ghi nhận.</p>
                  <p className="text-xs mt-1 text-zinc-500">Hãy bắt đầu thử sức với một bài kiểm tra nhé!</p>
                </div>
              ) : (
                <div className="border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
                      <TableRow>
                        <TableHead className="font-semibold text-xs py-3">Bài kiểm tra</TableHead>
                        <TableHead className="font-semibold text-xs text-center py-3">Điểm</TableHead>
                        <TableHead className="font-semibold text-xs text-right py-3">Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.map((record: any) => {
                        const isPassed = record.score >= 70;
                        return (
                          <TableRow key={record.resultId} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-900/10">
                            <TableCell className="py-3">
                              <div className="font-semibold text-xs truncate max-w-[200px] text-zinc-800 dark:text-zinc-200">
                                {record.title}
                              </div>
                              <div className="text-[10px] text-zinc-400 mt-0.5">{record.date}</div>
                            </TableCell>
                            <TableCell className="text-center py-3">
                              <Badge
                                className={`rounded-full px-2 py-0.5 font-bold text-[10px] border-none ${
                                  isPassed
                                    ? "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400"
                                    : "bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400"
                                }`}
                              >
                                {record.score}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right py-3">
                              <div className="flex items-center justify-end gap-3">
                                <Link
                                  href={`/result?id=${record.resultId}`}
                                  onClick={() => setShowHistoryModal(false)}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                                >
                                  Chi tiết
                                  <ExternalLink size={10} />
                                </Link>
                                <button
                                  onClick={() => handleDeleteHistoryRecord(record.resultId, record.examId)}
                                  className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 cursor-pointer p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                                  title="Xóa kết quả này"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="practice" className="flex-1 overflow-y-auto pr-1">
              {!isLoggedIn ? (
                <div className="text-center py-10 text-zinc-400">
                  <Code size={36} className="mx-auto text-zinc-200 mb-2.5" />
                  <p className="text-sm">Đăng nhập bằng Google để lưu và xem lịch sử thực hành.</p>
                </div>
              ) : practiceHistory.length === 0 ? (
                <div className="text-center py-10 text-zinc-400">
                  <Code size={36} className="mx-auto text-zinc-200 mb-2.5" />
                  <p className="text-sm">Chưa có câu thực hành nào được giải.</p>
                  <p className="text-xs mt-1 text-zinc-500">Hãy thử sức với CSS Lab hoặc JS Lab nhé!</p>
                </div>
              ) : (
                <div className="border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
                      <TableRow>
                        <TableHead className="font-semibold text-xs py-3">Câu thực hành</TableHead>
                        <TableHead className="font-semibold text-xs text-center py-3">Điểm</TableHead>
                        <TableHead className="font-semibold text-xs text-right py-3">Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {practiceHistory.map((record) => (
                        <TableRow key={record.id} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-900/10">
                          <TableCell className="py-3">
                            <div className="font-semibold text-xs truncate max-w-[200px] text-zinc-800 dark:text-zinc-200">
                              {record.questionTitle}
                            </div>
                            <div className="text-[10px] text-zinc-400 mt-0.5">
                              {record.setTitle} • {new Date(record.createdAt).toLocaleString("vi-VN")}
                            </div>
                          </TableCell>
                          <TableCell className="text-center py-3">
                            <Badge className="rounded-full px-2 py-0.5 font-bold text-[10px] border-none bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                              {record.points}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right py-3">
                            <button
                              onClick={() => handleDeletePracticeRecord(record.id)}
                              className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 cursor-pointer p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                              title="Xóa kết quả này"
                            >
                              <Trash2 size={13} />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex-shrink-0 pt-3 mt-1 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              onClick={handleClearAllLearningData}
              variant="outline"
              className="w-full rounded-xl text-xs font-bold gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-950/40 dark:text-red-400 dark:hover:bg-red-950/20 cursor-pointer"
            >
              <Eraser size={14} />
              Xóa tất cả dữ liệu học tập
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
