// ============================================================
// 網站底部（每一頁都會出現）：像交友網站的頁尾
// ============================================================
import Link from "next/link";
import { Logo } from "./Header";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        {/* 左：品牌與一句話介紹 */}
        <div>
          <div className="flex items-center gap-2">
            <Logo />
            <span className="font-serif text-lg font-bold">Right One 面試配對所</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-soft">
            看起來是交友網站，其實是面試練習場。
            我們相信好的工作就像好的另一半：不是誰挑誰，而是彼此剛好對的人。
          </p>
        </div>

        {/* 中：產品連結 */}
        <div>
          <h4 className="font-serif text-sm font-bold">配對服務</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
            <li><Link href="/interview" className="hover:text-rose">開始配對</Link></li>
            <li><Link href="/#how" className="hover:text-rose">如何配對</Link></li>
            <li><Link href="/settings" className="hover:text-rose">我的鑰匙（BYOK）</Link></li>
          </ul>
        </div>

        {/* 右：安心約會中心 */}
        <div>
          <h4 className="font-serif text-sm font-bold">安心約會中心</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
            <li><Link href="/#safety" className="hover:text-rose">你的鑰匙去了哪裡</Link></li>
            <li>金鑰只存在你的瀏覽器</li>
            <li>伺服器用完即丟、不留存</li>
          </ul>
        </div>
      </div>

      {/* 最底下的版權列 */}
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-ink-soft sm:flex-row sm:px-6">
          {/* 年份直接寫死：開啟 cacheComponents 時，伺服器元件裡用 new Date() 會被視為動態資料 */}
          <span>© 2026 Right One 面試配對所 · 面試，其實就是一場相親</span>
          <span>媒人由 AI 擔任 ♥</span>
        </div>
      </div>
    </footer>
  );
}
