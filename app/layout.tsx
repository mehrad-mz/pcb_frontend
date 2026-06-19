import type { Metadata } from "next";
import { Vazirmatn, Montserrat } from "next/font/google";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "گلوبال PCB — ساخت دقیق مدار چاپی",
  description: "سفارش PCB با کیفیت، استعلام فوری، نمونه‌سازی سریع و مونتاژ صنعتی.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} ${montserrat.variable}`}>
      <body>{children}</body>
    </html>
  );
}
