// ============================================================
// 設定頁 /settings — 讓使用者輸入自己的 OpenAI API Key（BYOK）
// ------------------------------------------------------------
// Key 只會存在「使用者自己的瀏覽器」（localStorage），
// 每次面試時由前端放在 header 送到我們的 API，我們的伺服器不會保存它。
// ============================================================
"use client";

import Link from "next/link";
import { useState } from "react";
import { OPENAI_MODEL, looksLikeOpenAIKey, maskKey } from "@/lib/byok";
import { useOpenAIKey } from "@/lib/use-openai-key";

export default function SettingsPage() {
  const { key, save, clear } = useOpenAIKey(); // 目前已儲存的 Key
  const [input, setInput] = useState(""); // 輸入框裡的內容
  const [show, setShow] = useState(false); // 是否顯示明碼
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  // 儲存：先檢查格式，再寫入 localStorage
  function handleSave() {
    if (!looksLikeOpenAIKey(input)) {
      setMessage({ type: "error", text: "格式看起來不對喔，OpenAI 的 Key 是 sk- 開頭的一長串文字" });
      return;
    }
    save(input);
    setInput(""); // 存好後清空輸入框，避免 Key 一直顯示在畫面上
    setMessage({ type: "ok", text: "已儲存在這台電腦的瀏覽器中，可以開始面試了！" });
  }

  // 清除：從 localStorage 移除
  function handleClear() {
    clear();
    setMessage({ type: "ok", text: "已從這個瀏覽器移除你的 Key" });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <span className="text-xs font-bold tracking-[0.2em] text-rose uppercase">Settings · BYOK</span>
      <h1 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">🔑 約會前，帶上你的鑰匙</h1>
      <p className="mt-3 text-ink-soft">
        輸入你的 OpenAI API Key，面試官就會用你的帳號來出題和評分。就像約會時錢包一直在你身上——費用由你的 OpenAI 帳號支付，我們不經手、也不保存。
      </p>

      {/* 目前狀態 */}
      <div className={`mt-10 flex items-center justify-between gap-4 rounded-2xl border px-5 py-4 ${key ? "border-sage/30 bg-sage-soft" : "border-line bg-paper"}`}>
        <div>
          <p className="text-xs font-medium text-ink-soft">目前狀態</p>
          {key ? (
            <p className="mt-1 font-mono text-sm text-sage">✓ 已設定　{maskKey(key)}</p>
          ) : (
            <p className="mt-1 text-sm">尚未設定（目前會使用示範模式）</p>
          )}
        </div>
        {key && (
          <button onClick={handleClear} className="shrink-0 rounded-full border border-line bg-paper px-4 py-2 text-sm transition hover:border-rose hover:text-rose">
            清除 Key
          </button>
        )}
      </div>

      {/* 輸入區 */}
      <div className="mt-6 rounded-3xl border border-line bg-paper p-6 shadow-sm sm:p-8">
        <label htmlFor="openai-key" className="text-sm font-bold">
          {key ? "更換 OpenAI API Key" : "OpenAI API Key"}
        </label>
        <div className="mt-3 flex gap-2">
          <input
            id="openai-key"
            // password 類型：輸入時顯示成圓點，避免旁人偷看
            type={show ? "text" : "password"}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setMessage(null);
            }}
            placeholder="sk-proj-..."
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 rounded-2xl border border-line bg-cream px-4 py-3 font-mono text-sm outline-none placeholder:text-ink-soft/50 focus:border-rose focus:ring-2 focus:ring-rose/15"
          />
          <button
            onClick={() => setShow(!show)}
            className="shrink-0 rounded-2xl border border-line bg-cream px-4 text-sm text-ink-soft transition hover:text-ink"
          >
            {show ? "隱藏" : "顯示"}
          </button>
        </div>
        <p className="mt-2 text-xs text-ink-soft">
          還沒有 Key？到{" "}
          <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-rose underline-offset-2 hover:underline">
            OpenAI 後台
          </a>{" "}
          建立一把。使用模型：<span className="font-mono">{OPENAI_MODEL}</span>
        </p>

        <button
          onClick={handleSave}
          disabled={!input.trim()}
          className="mt-6 w-full rounded-full bg-ink py-3.5 font-medium text-cream transition hover:bg-rose disabled:cursor-not-allowed disabled:bg-ink-soft/30"
        >
          儲存在這個瀏覽器
        </button>

        {message && (
          <p className={`mt-4 rounded-2xl px-4 py-3 text-sm ${message.type === "ok" ? "bg-sage-soft text-sage" : "bg-blush text-rose-deep"}`}>
            {message.text}
          </p>
        )}
      </div>

      {/* 說明：你的 Key 去了哪裡 */}
      <div className="mt-10">
        <h2 className="font-serif text-lg font-bold">你的 Key 去了哪裡？</h2>
        <ol className="mt-4 space-y-3 text-sm leading-relaxed text-ink-soft">
          <li><span className="font-bold text-ink">1. 存在你的瀏覽器：</span>放在 localStorage，只有這台電腦、這個瀏覽器讀得到，換電腦就要重新輸入。</li>
          <li><span className="font-bold text-ink">2. 面試時才送出：</span>透過加密的 HTTPS 連線，放在請求的 header 裡傳給我們的 API。</li>
          <li><span className="font-bold text-ink">3. 用完即丟：</span>伺服器只用它呼叫 OpenAI 一次，不寫進資料庫、不記錄在紀錄檔。</li>
        </ol>
        <p className="mt-4 rounded-2xl bg-blush/60 px-4 py-3 text-xs leading-relaxed text-ink-soft">
          ⚠️ 提醒：請只在自己的電腦上儲存 Key；用公用電腦時，離開前記得按「清除 Key」。也建議到 OpenAI 後台設定每月的使用上限。
        </p>
      </div>

      <Link href="/interview" className="bg-love mt-10 block rounded-full py-3.5 text-center font-bold text-white shadow-lg shadow-rose/25 transition hover:-translate-y-0.5">
        帶著鑰匙去配對 ♥
      </Link>
    </div>
  );
}
