// ============================================================
// 網站底部（每一頁都會出現）：產品介紹 + 連結
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
            <span className="font-serif text-lg font-bold">Right One 面試相談室</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-soft">
            面試不是考試，是一場雙向的相親。我們用 AI 陪你先練習幾次約會，
            讓你在真正見面時，能自在地展現最好的自己。
          </p>
        </div>

        {/* 中：產品連結 */}
        <div>
          <h4 className="font-serif text-sm font-bold">產品</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
            <li><Link href="/interview" className="hover:text-rose">開始模擬面試</Link></li>
            <li><Link href="/#how" className="hover:text-rose">運作方式</Link></li>
            <li><Link href="/#features" className="hover:text-rose">功能特色</Link></li>
          </ul>
        </div>

        {/* 右：一段小語，延續相親主題 */}
        <div>
          <h4 className="font-serif text-sm font-bold">媒人小語</h4>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            「好的關係，從誠實的第一句話開始。」
            <br />
            準備好了，就去赴約吧。
          </p>
        </div>
      </div>

      {/* 最底下的版權列 */}
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-ink-soft sm:flex-row sm:px-6">
          {/* 年份直接寫死：開啟 cacheComponents 時，伺服器元件裡用 new Date() 會被視為動態資料 */}
          <span>© 2026 Right One 面試相談室</span>
          <span>由 Claude AI 擔任你的面試官</span>
        </div>
      </div>
    </footer>
  );
}
