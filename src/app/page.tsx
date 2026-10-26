// ============================================================
// 首頁（Landing Page）
// ------------------------------------------------------------
// 外觀刻意做成「交友網站」：滑動的檔案卡、心動按鈕、配對流程⋯⋯
// 但仔細一看，檔案卡上的「對象」其實是職缺，約會其實是面試。
// 區塊由上到下：
//   Hero（主視覺＋檔案卡）→ 如何配對 → 為什麼選我們 → 安心約會（BYOK）→ 行動呼籲
// 這頁沒有任何互動狀態，所以是「伺服器元件」，載入最快。
// ============================================================
import Link from "next/link";

// ---------- 區塊資料：把文案抽成陣列，畫面用 map 產生，方便日後修改 ----------

// 如何配對：對應產品的四個步驟
const STEPS = [
  { icon: "📝", title: "建立對方檔案", desc: "貼上職缺描述，就像讀對方的自我介紹。AI 會看出這份工作真正在找什麼樣的人。" },
  { icon: "💞", title: "配對成功", desc: "決定這次約會要聊幾個話題（1～10 個），按下心動，馬上配對。" },
  { icon: "💬", title: "開始約會聊天", desc: "面試官像傳訊息一樣一題一題問你，還會偷偷告訴你「對方其實想知道什麼」。" },
  { icon: "💌", title: "媒人悄悄話", desc: "每題都有心動指數、優缺點和「如果是我會這樣說」的示範回答。" },
];

// 為什麼選我們
const REASONS = [
  { icon: "♥", title: "只為你量身配對", desc: "每一題都根據你貼上的職缺生成，不是網路上抄來的萬用題庫。" },
  { icon: "✎", title: "約會節奏你決定", desc: "想快速暖身就聊 3 題，想認真練習就聊 10 題。" },
  { icon: "★", title: "誠實的心動指數", desc: "0～100 分，60 分及格。媒人不說客套話，只說對你有幫助的話。" },
  { icon: "❝", title: "示範回答", desc: "每題附上一段可以直接開口說的好回答，以及答題心法。" },
];

// 首頁右側的「職缺檔案卡」範例（純展示）
const PROFILE = {
  name: "產品設計師",
  company: "一間喜歡把細節做好的新創",
  distance: "距離你 3 公里 · 混合辦公",
  bio: "希望找到一位重視使用者體驗、願意一起喝咖啡討論 wireframe 的你。",
  tags: ["Figma", "使用者訪談", "團隊溝通", "愛喝咖啡"],
};

export default function Home() {
  return (
    <>
      {/* ==================== Hero 主視覺 ==================== */}
      <section className="relative overflow-hidden">
        {/* 背景的柔和光暈 */}
        <div className="bg-love absolute -top-40 -right-40 h-[32rem] w-[32rem] rounded-full opacity-15 blur-3xl" aria-hidden="true" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pt-14 pb-20 sm:px-6 md:grid-cols-[1.1fr_1fr] md:pt-20">
          {/* 左：標語與按鈕 */}
          <div className="animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-rose/30 bg-blush px-3 py-1 text-xs font-bold text-rose-deep">
              <span className="animate-heartbeat inline-block">♥</span>
              看起來是交友網站，其實是 AI 面試模擬器
            </span>
            <h1 className="mt-6 font-serif text-4xl leading-tight font-bold sm:text-5xl md:text-6xl">
              面試，
              <br />
              其實就是一場<span className="text-love">相親</span>。
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
              你在看公司，公司也在看你。到底是不是彼此對的人？
              先和 AI 面試官約會幾次，練習怎麼好好介紹自己。
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/interview"
                className="bg-love rounded-full px-8 py-4 font-bold text-white shadow-xl shadow-rose/30 transition hover:-translate-y-0.5"
              >
                立即免費配對 ♥
              </Link>
              <a href="#how" className="text-sm font-medium text-ink-soft underline-offset-4 hover:text-ink hover:underline">
                看看怎麼配對
              </a>
            </div>
            {/* 小小的信任標章，交友網站常見的設計 */}
            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-xs text-ink-soft">
              <li>✓ 題數自己選</li>
              <li>✓ 每題都有示範回答</li>
              <li>✓ 金鑰只存在你的瀏覽器</li>
            </ul>
          </div>

          {/* 右：交友 App 風格的「職缺檔案卡」 */}
          <ProfileStack />
        </div>
      </section>

      {/* ==================== 如何配對 ==================== */}
      <section id="how" className="scroll-mt-20 border-y border-line bg-paper">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <SectionTitle eyebrow="How it works" title="四步驟，找到對的人" desc="從陌生到心動，只需要一杯咖啡的時間。" />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative rounded-3xl border border-line bg-cream p-7">
                <span className="absolute top-6 right-6 font-serif text-sm font-bold text-rose/40">0{i + 1}</span>
                <span className="text-3xl">{step.icon}</span>
                <h3 className="mt-4 font-serif text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 為什麼選我們 ==================== */}
      <section id="why" className="mx-auto grid max-w-6xl scroll-mt-20 items-center gap-14 px-4 py-24 sm:px-6 md:grid-cols-2">
        <div>
          <SectionTitle eyebrow="Why Right One" title="比交友軟體更認真的約會" desc="把緊張留在練習，把自信帶去赴約。" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {REASONS.map((r) => (
              <div key={r.title}>
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blush text-rose">{r.icon}</span>
                <h3 className="mt-3 font-bold">{r.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
        {/* 右：聊天畫面預覽 */}
        <ChatPreview />
      </section>

      {/* ==================== 安心約會（BYOK 說明） ==================== */}
      <section id="safety" className="scroll-mt-20 bg-ink text-cream">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <SectionTitle eyebrow="Safe dating" title="安心約會：你的鑰匙自己保管" desc="約會時，錢包從頭到尾都在你身上。" dark />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              { no: "1", title: "存在你的瀏覽器", desc: "OpenAI API Key 存在你的 localStorage，只有這台電腦、這個瀏覽器讀得到。" },
              { no: "2", title: "約會時才交出", desc: "開始面試時，才透過加密的 HTTPS 連線，放在請求 header 交給我們的 API。" },
              { no: "3", title: "用完立刻還你", desc: "伺服器只用它呼叫 AI 一次，不寫進資料庫、不記錄，也不會上傳到 GitHub。" },
            ].map((s) => (
              <div key={s.no} className="rounded-3xl border border-cream/10 bg-cream/5 p-8">
                <span className="bg-love flex h-10 w-10 items-center justify-center rounded-full font-bold text-white">{s.no}</span>
                <h3 className="mt-5 font-serif text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/70">{s.desc}</p>
              </div>
            ))}
          </div>
          <Link href="/settings" className="mt-10 inline-block text-sm font-bold text-peach underline-offset-4 hover:underline">
            設定我的鑰匙 →
          </Link>
        </div>
      </section>

      {/* ==================== 行動呼籲 CTA ==================== */}
      <section className="mx-auto max-w-6xl px-4 pt-24 sm:px-6">
        <div className="bg-love relative overflow-hidden rounded-[2rem] px-8 py-16 text-center text-white sm:px-16">
          {/* 背景裝飾的大愛心 */}
          <span className="absolute -top-10 -left-6 text-[10rem] leading-none opacity-15" aria-hidden="true">♥</span>
          <span className="absolute -right-6 -bottom-16 text-[13rem] leading-none opacity-15" aria-hidden="true">♥</span>
          <h2 className="relative font-serif text-3xl font-bold sm:text-4xl">你的 Right One，正在等你</h2>
          <p className="relative mx-auto mt-4 max-w-md text-white/85">貼上心儀的職缺，五分鐘後就知道：你們合不合拍。</p>
          <Link
            href="/interview"
            className="relative mt-8 inline-block rounded-full bg-white px-8 py-3.5 font-bold text-rose-deep shadow-lg transition hover:-translate-y-0.5"
          >
            開始我的第一次約會 ♥
          </Link>
        </div>
      </section>
    </>
  );
}

// ---------- 小元件：區塊標題（重複使用） ----------
function SectionTitle({ eyebrow, title, desc, dark = false }: { eyebrow: string; title: string; desc: string; dark?: boolean }) {
  return (
    <div className="max-w-xl">
      <span className={`text-xs font-bold tracking-[0.2em] uppercase ${dark ? "text-peach" : "text-rose"}`}>{eyebrow}</span>
      <h2 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">{title}</h2>
      <p className={`mt-3 ${dark ? "text-cream/60" : "text-ink-soft"}`}>{desc}</p>
    </div>
  );
}

// ---------- 小元件：交友 App 風格的職缺檔案卡（疊在一起的卡片） ----------
function ProfileStack() {
  return (
    <div className="animate-rise relative mx-auto w-full max-w-sm [animation-delay:150ms]">
      {/* 後面兩張卡：營造「還有很多對象可以滑」的感覺 */}
      <div className="absolute inset-x-6 top-6 h-full rotate-6 rounded-[2rem] bg-blush" aria-hidden="true" />
      <div className="absolute inset-x-3 top-3 h-full -rotate-3 rounded-[2rem] border border-line bg-paper" aria-hidden="true" />

      {/* 最上面的檔案卡 */}
      <div className="relative overflow-hidden rounded-[2rem] border border-line bg-paper shadow-2xl shadow-rose/15">
        {/* 「大頭照」區：用漸層＋公事包代替照片 */}
        <div className="bg-love relative flex h-56 items-end p-6 text-white">
          <span className="absolute top-5 right-5 rounded-full bg-white/25 px-3 py-1 text-xs font-bold backdrop-blur">
            契合度 92%
          </span>
          <span className="absolute top-8 left-1/2 -translate-x-1/2 text-7xl drop-shadow-lg" aria-hidden="true">💼</span>
          <div>
            <p className="font-serif text-3xl font-bold">{PROFILE.name}</p>
            <p className="mt-1 text-sm text-white/90">{PROFILE.company}</p>
          </div>
        </div>
        <div className="p-6">
          <p className="text-xs text-ink-soft">📍 {PROFILE.distance}</p>
          <p className="mt-3 text-sm leading-relaxed">「{PROFILE.bio}」</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {PROFILE.tags.map((t) => (
              <span key={t} className="rounded-full bg-blush px-3 py-1 text-xs font-medium text-rose-deep">{t}</span>
            ))}
          </div>
          {/* 滑動按鈕：✕ 略過、★ 收藏、♥ 心動 */}
          <div className="mt-6 flex items-center justify-center gap-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-line text-lg text-ink-soft shadow-sm">✕</span>
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-honey shadow-sm">★</span>
            <Link
              href="/interview"
              aria-label="心動，開始面試"
              className="bg-love flex h-14 w-14 items-center justify-center rounded-full text-2xl text-white shadow-lg shadow-rose/30 transition hover:scale-110"
            >
              ♥
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- 小元件：聊天畫面預覽（純展示） ----------
function ChatPreview() {
  return (
    <div className="relative mx-auto w-full max-w-sm rounded-[2.5rem] border-8 border-ink bg-cream p-5 shadow-2xl shadow-ink/20">
      {/* 聊天室標題列 */}
      <div className="flex items-center gap-3 border-b border-line pb-4">
        <span className="bg-love flex h-10 w-10 items-center justify-center rounded-full text-lg text-white">💼</span>
        <div>
          <p className="text-sm font-bold">產品設計師 · 面試官</p>
          <p className="text-xs text-sage">● 線上 · 正在認識你</p>
        </div>
      </div>
      <div className="mt-4 max-w-[85%] rounded-2xl rounded-tl-sm bg-paper px-4 py-3 text-sm leading-relaxed shadow-sm">
        如果要你分享一個「讓專案起死回生」的經驗，你會說哪一個？
      </div>
      <div className="bg-love mt-3 ml-auto max-w-[85%] rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed text-white">
        去年我們的 App 留存率掉到 18%，我先訪談了 20 位流失用戶⋯⋯
      </div>
      {/* 媒人悄悄話 */}
      <div className="mt-4 rounded-2xl border border-sage/30 bg-sage-soft p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-sage">💌 媒人悄悄話</span>
          <span className="font-serif text-xl font-bold text-sage">心動 86%</span>
        </div>
        <p className="mt-1 text-sm">「有數據、有行動，讓人想約第二次。」</p>
      </div>
    </div>
  );
}
