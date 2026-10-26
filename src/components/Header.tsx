// ============================================================
// 網站頂部導覽列（每一頁都會出現）
// 外觀像交友網站：愛心 Logo、「開始配對」按鈕
// ============================================================
import Link from "next/link";

// 導覽連結：# 開頭的是首頁內的區塊錨點，會平滑捲動過去
const NAV_LINKS = [
  { href: "/#how", label: "如何配對" },
  { href: "/#why", label: "為什麼選我們" },
  { href: "/#safety", label: "安心約會" },
];

export default function Header() {
  return (
    // sticky + backdrop-blur：往下捲時固定在上方，背景呈現毛玻璃
    <header className="sticky top-0 z-40 border-b border-line/70 bg-cream/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo：點了回首頁 */}
        <Link href="/" className="flex items-center gap-2">
          <Logo />
          <span className="font-serif text-lg font-bold tracking-wide">
            Right One<span className="ml-1.5 hidden text-sm font-medium text-ink-soft sm:inline">面試配對所</span>
          </span>
        </Link>

        {/* 中間的導覽（手機版隱藏，避免擠在一起） */}
        <nav className="hidden items-center gap-8 text-sm text-ink-soft md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-rose">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* 右側：約會錢包（輸入自己的 API Key）＋ 主要按鈕 */}
        <div className="flex items-center gap-3">
          <Link href="/settings" className="text-sm text-ink-soft transition-colors hover:text-rose">
            🔑 鑰匙
          </Link>
          <Link
            href="/interview"
            className="bg-love rounded-full px-4 py-2 text-sm font-bold text-white shadow-md shadow-rose/25 transition hover:-translate-y-0.5"
          >
            開始配對 ♥
          </Link>
        </div>
      </div>
    </header>
  );
}

// Logo：一顆漸層愛心，中間留一個公事包的小提把——「愛情」其實是「工作」
export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="logo-love" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--color-rose)" />
          <stop offset="1" stopColor="var(--color-peach)" />
        </linearGradient>
      </defs>
      <path
        d="M16 28s-11-6.6-11-14.2C5 9.4 8.2 6.5 11.7 6.5c2 0 3.4 1 4.3 2.4.9-1.4 2.3-2.4 4.3-2.4 3.5 0 6.7 2.9 6.7 7.3C27 21.4 16 28 16 28z"
        fill="url(#logo-love)"
      />
      {/* 公事包提把 */}
      <path d="M13 15.5v-1.6c0-.8.6-1.4 1.4-1.4h3.2c.8 0 1.4.6 1.4 1.4v1.6" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="10.5" y="15.5" width="11" height="6.5" rx="1.6" fill="#fff" />
    </svg>
  );
}
