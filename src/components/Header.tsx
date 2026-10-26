// ============================================================
// 網站頂部導覽列（每一頁都會出現）
// ============================================================
import Link from "next/link";

// 導覽連結：# 開頭的是首頁內的區塊錨點，會平滑捲動過去
const NAV_LINKS = [
  { href: "/#how", label: "怎麼運作" },
  { href: "/#features", label: "特色" },
  { href: "/#stories", label: "使用心得" },
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
            Right One<span className="ml-1.5 text-sm font-medium text-ink-soft">面試相談室</span>
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

        {/* 右側：設定（輸入自己的 API Key）＋ 主要按鈕 */}
        <div className="flex items-center gap-3">
          <Link href="/settings" className="text-sm text-ink-soft transition-colors hover:text-rose">
            設定
          </Link>
          <Link
            href="/interview"
            className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-cream transition-colors hover:bg-rose"
          >
            開始相親面試
          </Link>
        </div>
      </div>
    </header>
  );
}

// 小 Logo：兩個交疊的圓，象徵「你」和「公司」彼此對上
export function Logo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <circle cx="12" cy="16" r="8.5" fill="none" stroke="var(--color-ink)" strokeWidth="2" />
      <circle cx="20" cy="16" r="8.5" fill="var(--color-rose)" fillOpacity="0.85" />
    </svg>
  );
}
