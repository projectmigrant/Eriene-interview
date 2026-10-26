// ============================================================
// 根版面（Root Layout）
// ------------------------------------------------------------
// App Router 中，layout.tsx 會包住底下「所有頁面」。
// 所以 Header 和 Footer 放在這裡，首頁與面試頁都會自動擁有。
// ============================================================
import type { Metadata } from "next";
import { Noto_Sans_TC, Noto_Serif_TC } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

// 內文字體：思源黑體（Noto Sans TC）
// next/font 會在建置時下載字體並自行託管，不用連 Google，也不會畫面閃爍
const notoSans = Noto_Sans_TC({
  variable: "--font-noto-sans", // 對應 globals.css 裡的 --font-sans
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

// 標題字體：思源宋體（Noto Serif TC），營造雜誌、書信的質感
const notoSerif = Noto_Serif_TC({
  variable: "--font-noto-serif",
  weight: ["500", "700"],
  subsets: ["latin"],
  display: "swap",
});

// 網頁的 <title> 與描述（SEO、分享預覽會用到）
export const metadata: Metadata = {
  title: "Right One 面試配對所｜AI 面試模擬器",
  description: "看起來是交友網站，其實是面試練習。貼上職缺、和 AI 面試官約會聊天，拿到心動指數和示範回答。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-Hant-TW" className={`${notoSans.variable} ${notoSerif.variable} h-full antialiased`}>
      <body className="paper-texture flex min-h-full flex-col">
        <Header />
        {/* flex-1 讓主內容撐滿剩餘高度，Footer 永遠貼在底部 */}
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
