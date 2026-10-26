// ============================================================
// 首頁（Landing Page）
// ------------------------------------------------------------
// 像 SaaS 產品官網一樣，由上到下分成幾個區塊：
//   Hero（主視覺）→ 相親三部曲（怎麼運作）→ 特色 → 使用心得 → 行動呼籲
// 這頁沒有任何互動狀態，所以是「伺服器元件」，載入最快。
// ============================================================
import Link from "next/link";

// ---------- 區塊資料：把文案抽成陣列，畫面用 map 產生，方便日後修改 ----------

// 相親三部曲：對應產品的三個步驟
const STEPS = [
  {
    no: "01",
    title: "先看看對方的條件",
    desc: "貼上職缺描述，就像先讀過相親對象的自我介紹。AI 會讀懂這份工作真正在找什麼樣的人。",
    tag: "貼上職缺",
  },
  {
    no: "02",
    title: "第一次約會",
    desc: "自己決定要聊幾題。面試官會一題一題地問，你可以慢慢想、好好回答，不用緊張。",
    tag: "自訂題數",
  },
  {
    no: "03",
    title: "媒人的真心話",
    desc: "每題都會拿到分數、做得好的地方、可以改進的地方，還有一份「如果是我會這樣說」的示範回答。",
    tag: "評分＋示範答案",
  },
];

// 特色
const FEATURES = [
  { icon: "♡", title: "量身訂做的題目", desc: "不是網路上抄來的萬用題庫，每一題都根據你貼上的職缺生成。" },
  { icon: "✎", title: "題數由你決定", desc: "想快速暖身就問 3 題，想認真演練就問 10 題，節奏你自己掌握。" },
  { icon: "★", title: "誠實的評分", desc: "0～100 分，60 分及格。不客套、不打高空，只說對你有幫助的話。" },
  { icon: "❝", title: "更好的回答示範", desc: "每題附上一段可以直接開口說的示範答案，以及答題框架與心法。" },
  { icon: "☕", title: "像聊天一樣自在", desc: "介面設計成約會對話，降低壓力，讓練習變成一件輕鬆的事。" },
  { icon: "⚖", title: "雙向的視角", desc: "面試不只是被挑選，題目背後的意圖會告訴你：對方真正在意什麼。" },
];

// 使用心得（情境式文案，增加生活感）
const STORIES = [
  {
    quote: "以前面試像被審問，這次把它想成相親，突然就知道要「展現自己」而不是「背答案」了。",
    who: "小芸",
    role: "行銷企劃，轉職第 2 年",
  },
  {
    quote: "示範答案超實用，我照著 STAR 的架構改寫了自己的經驗，真正面試時講得很順。",
    who: "阿哲",
    role: "後端工程師",
  },
  {
    quote: "分數很誠實，第一次只拿 58 分有點受傷，但練到第三次終於 85，感覺終於「對上眼」了。",
    who: "Mia",
    role: "產品經理新鮮人",
  },
];

export default function Home() {
  return (
    <>
      {/* ==================== Hero 主視覺 ==================== */}
      <section className="mx-auto grid max-w-6xl items-center gap-14 px-4 pt-16 pb-20 sm:px-6 md:grid-cols-[1.1fr_1fr] md:pt-24">
        {/* 左：標語與按鈕 */}
        <div className="animate-rise">
          <span className="inline-flex items-center gap-2 rounded-full border border-rose/30 bg-blush px-3 py-1 text-xs font-medium text-rose-deep">
            <span className="h-1.5 w-1.5 rounded-full bg-rose" />
            AI 面試模擬器
          </span>
          <h1 className="mt-6 font-serif text-4xl leading-tight font-bold sm:text-5xl md:text-6xl">
            面試，
            <br />
            其實就是一場<span className="relative whitespace-nowrap text-rose">
              相親
              {/* 手繪感底線 */}
              <svg viewBox="0 0 120 12" className="absolute -bottom-2 left-0 w-full" aria-hidden="true">
                <path d="M2 8 Q 30 2, 60 7 T 118 5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
            。
          </h1>
          <p className="mt-8 max-w-md text-lg leading-relaxed text-ink-soft">
            你在看公司，公司也在看你。到底是不是彼此對的人？
            先和 AI 面試官約會幾次，練習怎麼好好介紹自己。
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/interview"
              className="rounded-full bg-rose px-7 py-3.5 font-medium text-white shadow-lg shadow-rose/25 transition hover:-translate-y-0.5 hover:bg-rose-deep"
            >
              開始我的第一次約會 →
            </Link>
            <a href="#how" className="text-sm font-medium text-ink-soft underline-offset-4 hover:text-ink hover:underline">
              先了解怎麼運作
            </a>
          </div>
        </div>

        {/* 右：模擬「約會對話」的預覽卡片 */}
        <HeroPreview />
      </section>

      {/* ==================== 相親三部曲 ==================== */}
      <section id="how" className="scroll-mt-20 border-y border-line bg-paper">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <SectionTitle eyebrow="How it works" title="相親三部曲" desc="三個步驟，從陌生到「對上眼」。" />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.no} className="relative rounded-3xl border border-line bg-cream p-8">
                <span className="font-serif text-5xl font-bold text-rose/20">{step.no}</span>
                <h3 className="mt-4 font-serif text-xl font-bold">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{step.desc}</p>
                <span className="mt-6 inline-block rounded-full bg-sage-soft px-3 py-1 text-xs font-medium text-sage">
                  {step.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 特色 ==================== */}
      <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6">
        <SectionTitle eyebrow="Features" title="為什麼選擇在這裡練習" desc="把緊張留在練習，把自信帶去赴約。" />
        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-paper p-8 transition-colors hover:bg-blush/40">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blush text-lg text-rose">{f.icon}</span>
              <h3 className="mt-5 font-serif text-lg font-bold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== 使用心得 ==================== */}
      <section id="stories" className="scroll-mt-20 bg-ink text-cream">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <SectionTitle eyebrow="Stories" title="他們都找到了對的人" desc="來自練習過的求職者們。" dark />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {STORIES.map((s) => (
              <figure key={s.who} className="rounded-3xl border border-cream/10 bg-cream/5 p-8">
                <span className="font-serif text-5xl leading-none text-rose">“</span>
                <blockquote className="mt-2 leading-relaxed text-cream/90">{s.quote}</blockquote>
                <figcaption className="mt-6 text-sm">
                  <span className="font-bold">{s.who}</span>
                  <span className="text-cream/50"> · {s.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 行動呼籲 CTA ==================== */}
      <section className="mx-auto max-w-6xl px-4 pt-24 sm:px-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-blush px-8 py-16 text-center sm:px-16">
          {/* 背景裝飾的兩個大圓 */}
          <div className="absolute -top-16 -left-16 h-56 w-56 rounded-full border-2 border-rose/20" aria-hidden="true" />
          <div className="absolute -right-10 -bottom-20 h-64 w-64 rounded-full bg-rose/10" aria-hidden="true" />
          <h2 className="relative font-serif text-3xl font-bold sm:text-4xl">準備好赴約了嗎？</h2>
          <p className="relative mx-auto mt-4 max-w-md text-ink-soft">
            貼上你心儀的職缺，選好題數，五分鐘後就能知道：你們合不合拍。
          </p>
          <Link
            href="/interview"
            className="relative mt-8 inline-block rounded-full bg-ink px-8 py-3.5 font-medium text-cream transition hover:-translate-y-0.5 hover:bg-rose"
          >
            免費開始模擬面試
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
      <span className="text-xs font-medium tracking-[0.2em] text-rose uppercase">{eyebrow}</span>
      <h2 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">{title}</h2>
      <p className={`mt-3 ${dark ? "text-cream/60" : "text-ink-soft"}`}>{desc}</p>
    </div>
  );
}

// ---------- 小元件：Hero 右側的對話預覽 ----------
// 純展示用，模擬面試官和你的一段「約會對話」
function HeroPreview() {
  return (
    <div className="animate-rise relative [animation-delay:150ms]">
      {/* 背景的柔和色塊 */}
      <div className="absolute inset-0 -rotate-3 rounded-[2rem] bg-blush" aria-hidden="true" />
      <div className="relative rounded-[2rem] border border-line bg-paper p-6 shadow-xl shadow-ink/5 sm:p-8">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink font-serif text-cream">面</span>
            <div>
              <p className="text-sm font-bold">AI 面試官</p>
              <p className="text-xs text-sage">● 正在認識你</p>
            </div>
          </div>
          <span className="text-xs text-ink-soft">第 2 / 5 題</span>
        </div>

        {/* 面試官的問題 */}
        <div className="mt-5 max-w-[85%] rounded-2xl rounded-tl-sm bg-cream px-4 py-3 text-sm leading-relaxed">
          如果要你說一個「讓專案起死回生」的經驗，你會說哪一個？
        </div>
        {/* 你的回答 */}
        <div className="mt-3 ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-ink px-4 py-3 text-sm leading-relaxed text-cream">
          去年我們的 App 留存率掉到 18%，我先訪談了 20 位流失用戶⋯⋯
        </div>

        {/* 評分卡 */}
        <div className="mt-5 rounded-2xl border border-sage/30 bg-sage-soft p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-medium text-sage">媒人的評語</span>
            <span className="font-serif text-2xl font-bold text-sage">86<span className="text-sm">分</span></span>
          </div>
          <p className="mt-1 text-sm">「有數據、有行動，讓人想約第二次。」</p>
        </div>
      </div>
    </div>
  );
}
