import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { ConfirmProvider } from "@/hooks/use-confirm";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Training Web MPClub 2026",
  description: "Hệ thống luyện tập và khám phá cấu trúc Web trực quan cho sinh viên",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50 font-sans transition-colors">
        <TooltipProvider>
          <ConfirmProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
          </ConfirmProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
