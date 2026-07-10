"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Layers, 
  FileText, 
  ShoppingCart, 
  Music, 
  Rocket, 
  ArrowRight,
  Sparkles,
  Info
} from "lucide-react";

export function LayoutExplorerHubClient() {
  const categories = [
    {
      title: "Blog / Tin Tức",
      icon: FileText,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/20",
      items: [
        {
          name: "Trang chủ Blog",
          desc: "Bố cục gồm Hero, danh sách bài viết grid, và Sidebar tin tức bên phải.",
          path: "blog/home.html",
          badge: "37 tooltips",
          icon: "🏠",
          badgeColor: "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400"
        },
        {
          name: "Tìm kiếm Blog",
          desc: "Bố cục lọc kết quả, danh sách bài viết tìm thấy, và thanh phân trang.",
          path: "blog/search.html",
          badge: "24 tooltips",
          icon: "🔍",
          badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400"
        },
        {
          name: "Chi tiết bài viết",
          desc: "Nội dung bài viết, khung bình luận, và Table of Contents (TOC) cố định.",
          path: "blog/detail.html",
          badge: "31 tooltips",
          icon: "📄",
          badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
        }
      ]
    },
    {
      title: "Thương Mại Điện Tử",
      icon: ShoppingCart,
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-950/20",
      items: [
        {
          name: "Trang chủ Shop",
          desc: "Slider quảng cáo, Flash Sale đếm ngược, danh sách sản phẩm theo tab.",
          path: "ecommerce/home.html",
          badge: "50 tooltips",
          icon: "🛍️",
          badgeColor: "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400"
        },
        {
          name: "Tìm kiếm SP",
          desc: "Thanh lọc thông số (Sidebar Filter), bộ sắp xếp giá, và lưới sản phẩm.",
          path: "ecommerce/search.html",
          badge: "16 tooltips",
          icon: "🔎",
          badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400"
        },
        {
          name: "Chi tiết SP",
          desc: "Trang chi tiết sản phẩm: Gallery ảnh, giá cả, tabs thông số kỹ thuật.",
          path: "ecommerce/product-detail.html",
          badge: "14 tooltips",
          icon: "📦",
          badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
        },
        {
          name: "Giỏ hàng",
          desc: "Bảng danh sách sản phẩm đã chọn, số lượng và tổng tiền thanh toán.",
          path: "ecommerce/cart.html",
          badge: "9 tooltips",
          icon: "🛒",
          badgeColor: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
        },
        {
          name: "Thanh toán",
          desc: "Biểu mẫu nhập địa chỉ, chọn đơn vị vận chuyển và phương thức thanh toán.",
          path: "ecommerce/checkout.html",
          badge: "7 tooltips",
          icon: "💳",
          badgeColor: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
        },
        {
          name: "Đăng nhập / Đăng ký",
          desc: "Form đăng nhập 2 cột kết hợp hình ảnh đồ họa và đăng nhập mạng xã hội.",
          path: "ecommerce/login.html",
          badge: "11 tooltips",
          icon: "🔐",
          badgeColor: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
        },
        {
          name: "Hồ sơ cá nhân",
          desc: "Quản lý thông tin tài khoản, danh sách đơn hàng đã mua.",
          path: "ecommerce/profile.html",
          badge: "7 tooltips",
          icon: "👤",
          badgeColor: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
        },
        {
          name: "Admin Dashboard",
          desc: "Bảng điều khiển cho quản trị viên: Thống kê tổng quan, biểu đồ doanh thu.",
          path: "ecommerce/admin-dashboard.html",
          badge: "Admin",
          icon: "📊",
          badgeColor: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
        },
        {
          name: "Admin Quản lý SP",
          desc: "Bảng quản lý danh sách sản phẩm, các nút hành động thêm/sửa/xóa.",
          path: "ecommerce/admin-products.html",
          badge: "Admin",
          icon: "📋",
          badgeColor: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
        }
      ]
    },
    {
      title: "Ứng Dụng Web (Web App)",
      icon: Music,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/20",
      items: [
        {
          name: "Music App (Spotify)",
          desc: "Giao diện nghe nhạc dạng Dashboard: Sidebar cố định, thanh điều khiển nhạc dưới cùng.",
          path: "music-app/index.html",
          badge: "19 tooltips",
          icon: "🎵",
          badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400"
        }
      ]
    },
    {
      title: "Marketing / Cá Nhân",
      icon: Rocket,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-950/20",
      items: [
        {
          name: "Landing Page",
          desc: "Trang giới thiệu sản phẩm: Hero Section lớn, danh sách tính năng, và đánh giá khách hàng.",
          path: "landing/index.html",
          badge: "17 tooltips",
          icon: "🚀",
          badgeColor: "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400"
        },
        {
          name: "Trang cá nhân (Portfolio)",
          desc: "Bố cục tự giới thiệu bản thân, kỹ năng lập trình, dự án đã làm, và form liên hệ.",
          path: "portfolio/index.html",
          badge: "20 tooltips",
          icon: "💼",
          badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400"
        }
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 max-w-5xl py-10 flex-grow flex flex-col justify-center">
      {/* Page Header */}
      <div className="mb-8 relative overflow-hidden bg-gradient-to-r from-zinc-800 to-zinc-900 dark:from-zinc-900 dark:to-black text-white p-6 sm:p-8 rounded-3xl border border-zinc-700/30 shadow-md">
        <div className="absolute right-4 bottom-0 opacity-10 text-white select-none pointer-events-none hidden md:block">
          <Layers size={200} />
        </div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-700/80 px-3 py-1 text-xs font-bold text-orange-400 mb-4">
            <Sparkles size={12} className="animate-pulse" />
            <span>Môi trường Khám Phá Layout Explorer</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
            Khám Phá Bố Cục Web
          </h1>
          <p className="mt-2.5 text-zinc-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Lựa chọn các mẫu giao diện phổ biến bên dưới để phân tích cấu trúc. 
            Khi xem chi tiết, hãy <strong>di chuột (hover)</strong> vào các thành phần để xem thuật ngữ HTML/CSS và mô tả chuyên môn tương ứng.
          </p>
        </div>
      </div>

      {/* Info Tip */}
      <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/30 rounded-2xl p-4 flex gap-3 text-xs text-amber-800 dark:text-amber-400 mb-8 leading-relaxed select-none">
        <Info size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Mẹo học tập:</strong> Các bài giảng Layout Explorer này hiển thị file HTML/CSS thô nguyên bản của dự án tĩnh. Bạn có thể nhấn chuột phải chọn <code className="px-1.5 py-0.5 rounded bg-amber-100/50 dark:bg-amber-900/30 font-mono font-semibold">Inspect / Kiểm tra</code> để trực tiếp xem cấu trúc mã nguồn HTML thô của chúng trên trình duyệt mà không bị lộn xộn bởi JSX hay React!
        </div>
      </div>

      {/* Categories Content List */}
      <div className="space-y-12">
        {categories.map((cat, idx) => {
          const CatIcon = cat.icon;
          return (
            <div key={idx} className="space-y-4">
              <h2 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-white flex items-center gap-2 border-b border-zinc-200/60 dark:border-zinc-800/80 pb-2 select-none">
                <div className={`p-1.5 rounded-lg ${cat.bg}`}>
                  <CatIcon size={16} className={cat.color} />
                </div>
                {cat.title}
              </h2>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {cat.items.map((item, itemIdx) => (
                  <Card 
                    key={itemIdx}
                    className="flex flex-col border border-zinc-200/85 bg-white dark:bg-zinc-900 dark:border-zinc-800/85 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg rounded-2xl overflow-hidden"
                  >
                    <CardHeader className="flex flex-row items-center justify-between pb-3 pt-5">
                      <span className="text-2xl select-none">{item.icon}</span>
                      <Badge className={`rounded-full px-2 py-0.5 font-bold text-[9px] border-none select-none ${item.badgeColor}`}>
                        {item.badge}
                      </Badge>
                    </CardHeader>

                    <CardContent className="flex-1 pb-4">
                      <CardTitle className="text-sm font-bold text-zinc-850 dark:text-zinc-100">
                        {item.name}
                      </CardTitle>
                      <CardDescription className="text-zinc-500 dark:text-zinc-400 text-xs mt-1.5 leading-relaxed line-clamp-3">
                        {item.desc}
                      </CardDescription>
                    </CardContent>

                    <CardFooter className="pt-0 pb-5">
                      <Link href={`/example-layout/viewer?path=${item.path}`} className="w-full">
                        <Button variant="outline" className="w-full group/btn rounded-xl border-zinc-200 hover:border-orange-500 hover:bg-orange-50/50 hover:text-orange-600 dark:border-zinc-800 dark:hover:bg-orange-950/20 text-xs font-bold cursor-pointer">
                          Khám phá bố cục
                          <ArrowRight size={12} className="ml-1.5 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
