import type { Metadata } from "next";
import { yekanBakh } from "@/lib/fonts/yekan-bakh";
import "./globals.css";

export const metadata: Metadata = {
  title: "گلوبال PCB — ساخت دقیق مدار چاپی",
  description: "سفارش PCB با کیفیت، استعلام فوری، نمونه‌سازی سریع و مونتاژ صنعتی.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" className={yekanBakh.variable}>
      <body className={yekanBakh.className}>{children}</body>
    </html>
  );
}
