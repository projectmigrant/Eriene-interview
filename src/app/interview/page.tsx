// ============================================================
// 面試頁面 /interview（外觀是交友 App 的配對＋聊天室）
// ------------------------------------------------------------
// 這頁需要大量互動（輸入、按鈕、狀態切換），所以標記為「客戶端元件」。
//
// 整個流程是一個四階段的「狀態機」：
//   setup   → 建立對方檔案：貼職缺描述、選話題數，按「送出心動」後呼叫 API 出題
//   matched → 「It's a Match!」配對成功畫面
//   chat    → 聊天室：面試官一題一題傳訊息，你回覆後呼叫 API 評分，媒人給悄悄話
//   summary → 約會報告：平均心動指數與配對結果
// ============================================================
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Evaluation, QuestionSet } from "@/lib/interview-schema";
import { MAX_QUESTIONS, MIN_QUESTIONS } from "@/lib/interview-schema";
import { OPENAI_KEY_HEADER, loadOpenAIKey, maskKey } from "@/lib/byok";
import { useOpenAIKey } from "@/lib/use-openai-key";

// 四個階段
type Stage = "setup" | "matched" | "chat" | "summary";

// ------------------------------------------------------------
// 呼叫後端 API 的小工具：統一處理錯誤訊息
// ------------------------------------------------------------
async function callInterviewApi<T>(body: Record<string, unknown>): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  // BYOK：如果使用者在設定頁存過 OpenAI Key，就從 localStorage 拿出來放進 header
  // 沒有 Key 就不帶，後端會改用示範模式
  const userKey = loadOpenAIKey();
  if (userKey) headers[OPENAI_KEY_HEADER] = userKey;

  const res = await fetch("/api/interview", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json();
  // 後端出錯時會回 { error: "..." }，把它變成例外丟出去
  if (!res.ok) throw new Error(data.error ?? "發生錯誤，請再試一次");
  return data as T;
}

// ------------------------------------------------------------
// 依分數決定顏色與「配對結果」文字
// ------------------------------------------------------------
function scoreTone(score: number) {
  if (score >= 80) return { text: "text-sage", bg: "bg-sage-soft", border: "border-sage/30" };
  if (score >= 60) return { text: "text-honey", bg: "bg-[#fbf0dc]", border: "border-honey/30" };
  return { text: "text-rose", bg: "bg-blush", border: "border-rose/30" };
}

function matchResult(avg: number) {
  if (avg >= 90) return { emoji: "💍", title: "天作之合", desc: "你們根本是為彼此而生。帶著這份自信去面試吧！" };
  if (avg >= 75) return { emoji: "☕", title: "值得第二次約會", desc: "對方對你很有好感，再修飾幾個細節就更完美了。" };
  if (avg >= 60) return { emoji: "🤔", title: "再多聊聊看", desc: "有基本的好感，但還不夠讓人心動。看看媒人的建議，再約一次吧。" };
  return { emoji: "🌱", title: "也許還不是時候", desc: "別灰心，這只是練習。把示範回答讀熟，下次一定更好。" };
}

export default function InterviewPage() {
  // ---------------- 狀態（State） ----------------
  const [stage, setStage] = useState<Stage>("setup");
  const [jobDescription, setJobDescription] = useState("");
  const [count, setCount] = useState(5); // 預設聊 5 個話題，使用者可調整

  const [questionSet, setQuestionSet] = useState<QuestionSet | null>(null);
  const [current, setCurrent] = useState(0); // 目前聊到第幾個話題（從 0 開始）
  const [answers, setAnswers] = useState<string[]>([]); // 每一題的回答
  const [evaluations, setEvaluations] = useState<(Evaluation | null)[]>([]); // 每一題的評分

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---------------- 動作 1：送出心動（出題） ----------------
  async function handleStart() {
    setError(null);
    setLoading(true);
    try {
      const data = await callInterviewApi<QuestionSet>({ action: "questions", jobDescription, count });
      setQuestionSet(data);
      // 依題數準備好空白的回答與評分欄位
      setAnswers(Array(data.questions.length).fill(""));
      setEvaluations(Array(data.questions.length).fill(null));
      setCurrent(0);
      setStage("matched"); // 先顯示「配對成功」畫面
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  // ---------------- 動作 2：送出目前這題的回覆（評分） ----------------
  async function handleSubmitAnswer() {
    if (!questionSet) return;
    setError(null);
    setLoading(true);
    try {
      const evaluation = await callInterviewApi<Evaluation>({
        action: "evaluate",
        jobDescription,
        question: questionSet.questions[current].question,
        answer: answers[current],
      });
      // 用「複製一份再修改」的方式更新陣列，React 才會偵測到變化
      setEvaluations((prev) => prev.map((ev, i) => (i === current ? evaluation : ev)));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  // ---------------- 動作 3：下一個話題 / 看約會報告 ----------------
  function handleNext() {
    if (!questionSet) return;
    if (current < questionSet.questions.length - 1) {
      setCurrent(current + 1);
    } else {
      setStage("summary");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  // ---------------- 動作 4：重新開始 ----------------
  function handleRestart() {
    setStage("setup");
    setQuestionSet(null);
    setAnswers([]);
    setEvaluations([]);
    setCurrent(0);
    setError(null);
  }

  // ============================================================
  // 畫面：依照 stage 顯示不同區塊
  // ============================================================
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      {stage === "setup" && (
        <SetupView
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
          count={count}
          setCount={setCount}
          loading={loading}
          onStart={handleStart}
        />
      )}

      {stage === "matched" && questionSet && (
        <MatchedView opening={questionSet.opening} count={questionSet.questions.length} onContinue={() => setStage("chat")} />
      )}

      {stage === "chat" && questionSet && (
        <ChatView
          questionSet={questionSet}
          current={current}
          answers={answers}
          setAnswer={(value) => setAnswers((prev) => prev.map((a, i) => (i === current ? value : a)))}
          evaluations={evaluations}
          loading={loading}
          onSubmit={handleSubmitAnswer}
          onNext={handleNext}
        />
      )}

      {stage === "summary" && questionSet && (
        <SummaryView questionSet={questionSet} answers={answers} evaluations={evaluations} onRestart={handleRestart} />
      )}

      {/* 錯誤訊息：任何階段都可能出現 */}
      {error && (
        <p role="alert" className="mt-6 rounded-2xl border border-rose/30 bg-blush px-4 py-3 text-sm text-rose-deep">
          {error}
        </p>
      )}
    </div>
  );
}

// ============================================================
// 階段一：建立對方檔案（職缺描述 + 話題數）
// ============================================================
function SetupView(props: {
  jobDescription: string;
  setJobDescription: (v: string) => void;
  count: number;
  setCount: (v: number) => void;
  loading: boolean;
  onStart: () => void;
}) {
  const { jobDescription, setJobDescription, count, setCount, loading, onStart } = props;
  const tooShort = jobDescription.trim().length < 20; // 跟後端的驗證規則一致

  return (
    <div className="animate-rise">
      <span className="text-xs font-bold tracking-[0.2em] text-rose uppercase">Step 1 · 建立對方檔案</span>
      <h1 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">你心儀的對象是誰？</h1>
      <p className="mt-3 text-ink-soft">把職缺描述貼上來，就像先讀過對方的交友檔案。</p>

      <KeyStatus />

      {/* 交友檔案卡造型的表單 */}
      <div className="mt-6 overflow-hidden rounded-[2rem] border border-line bg-paper shadow-xl shadow-rose/10">
        <div className="bg-love flex items-center gap-4 px-6 py-5 text-white">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/25 text-3xl">💼</span>
          <div>
            <p className="font-serif text-xl font-bold">對方的交友檔案</p>
            <p className="text-sm text-white/85">寫得越詳細，配對越精準</p>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {/* 職缺描述 */}
          <label htmlFor="jd" className="text-sm font-bold">💬 對方的自我介紹（職缺描述）</label>
          <textarea
            id="jd"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={8}
            placeholder={"例如：\n【前端工程師】\n・熟悉 React、TypeScript\n・有與設計師、PM 協作的經驗\n・重視使用者體驗，喜歡把細節做好⋯⋯"}
            className="mt-3 w-full resize-y rounded-2xl border border-line bg-cream px-4 py-3 text-sm leading-relaxed outline-none placeholder:text-ink-soft/50 focus:border-rose focus:ring-2 focus:ring-rose/15"
          />
          <p className="mt-2 text-right text-xs text-ink-soft">{jobDescription.trim().length} 字</p>

          {/* 話題數選擇：按鈕 +/- 調整，不寫死 */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
            <div>
              <p className="text-sm font-bold">☕ 這次約會想聊幾個話題？</p>
              <p className="mt-1 text-xs text-ink-soft">{MIN_QUESTIONS}～{MAX_QUESTIONS} 題，暖身建議 3 題，認真練習建議 8 題以上</p>
            </div>
            <div className="flex items-center gap-3">
              <StepButton label="減少題數" onClick={() => setCount(Math.max(MIN_QUESTIONS, count - 1))} disabled={count <= MIN_QUESTIONS}>−</StepButton>
              <span className="w-14 text-center font-serif text-3xl font-bold">{count}</span>
              <StepButton label="增加題數" onClick={() => setCount(Math.min(MAX_QUESTIONS, count + 1))} disabled={count >= MAX_QUESTIONS}>+</StepButton>
            </div>
          </div>

          <button
            onClick={onStart}
            disabled={tooShort || loading}
            className="bg-love mt-8 w-full rounded-full py-4 font-bold text-white shadow-lg shadow-rose/25 transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-none disabled:bg-ink-soft/30 disabled:shadow-none"
          >
            {loading ? <TypingDots label="正在幫你配對" /> : tooShort ? "對方的自我介紹至少要 20 字" : `送出心動 ♥ 開始 ${count} 個話題`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 階段二：配對成功 It's a Match!
// ============================================================
function MatchedView({ opening, count, onContinue }: { opening: string; count: number; onContinue: () => void }) {
  return (
    <div className="bg-love relative overflow-hidden rounded-[2.5rem] px-6 py-14 text-center text-white shadow-2xl shadow-rose/30">
      {/* 背景飄浮的小愛心 */}
      <span className="absolute top-6 left-8 text-4xl opacity-30" aria-hidden="true">♥</span>
      <span className="absolute right-10 bottom-10 text-6xl opacity-20" aria-hidden="true">♥</span>
      <span className="absolute top-16 right-16 text-2xl opacity-30" aria-hidden="true">♥</span>

      <p className="animate-pop font-serif text-5xl font-bold italic sm:text-6xl">It&apos;s a Match!</p>
      <p className="mt-3 text-white/90">你和這份工作互相心動了</p>

      {/* 兩個頭像中間一顆愛心 */}
      <div className="mt-10 flex items-center justify-center">
        <span className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-white/20 text-5xl">🙋</span>
        <span className="animate-pop z-10 -mx-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl text-rose shadow-lg [animation-delay:200ms]">♥</span>
        <span className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-white/20 text-5xl">💼</span>
      </div>

      {/* 面試官的開場白，像對方傳來的第一則訊息 */}
      <p className="mx-auto mt-10 max-w-md rounded-3xl bg-white/15 px-6 py-4 font-serif leading-relaxed backdrop-blur">「{opening}」</p>

      <button
        onClick={onContinue}
        className="mt-10 rounded-full bg-white px-10 py-4 font-bold text-rose-deep shadow-lg transition hover:-translate-y-0.5"
      >
        開始聊天 💬（{count} 個話題）
      </button>
    </div>
  );
}

// ============================================================
// 階段三：聊天室（一次一題，對話會一直往下累積）
// ============================================================
function ChatView(props: {
  questionSet: QuestionSet;
  current: number;
  answers: string[];
  setAnswer: (v: string) => void;
  evaluations: (Evaluation | null)[];
  loading: boolean;
  onSubmit: () => void;
  onNext: () => void;
}) {
  const { questionSet, current, answers, setAnswer, evaluations, loading, onSubmit, onNext } = props;
  const total = questionSet.questions.length;
  const currentEval = evaluations[current];
  const isLast = current === total - 1;

  // 有新訊息時，自動捲到最下面（像聊天 App 一樣）
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [current, loading, currentEval]);

  return (
    // 注意：這裡不能加 overflow-hidden，否則標題列的 sticky（捲動時固定）會失效
    <div className="rounded-[2rem] border border-line bg-paper shadow-xl shadow-rose/10">
      {/* 聊天室標題列：往下捲時固定在導覽列下方 */}
      <div className="sticky top-16 z-10 flex items-center gap-3 rounded-t-[2rem] border-b border-line bg-paper/95 px-5 py-4 backdrop-blur">
        <span className="bg-love flex h-11 w-11 items-center justify-center rounded-full text-xl text-white">💼</span>
        <div className="flex-1">
          <p className="text-sm font-bold">面試官</p>
          <p className="text-xs text-sage">● 線上 · 正在認識你</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-ink-soft">話題 {current + 1} / {total}</p>
          {/* 進度用一排小愛心表示 */}
          <p className="mt-0.5 text-xs tracking-widest">
            {questionSet.questions.map((_, i) => (
              <span key={i} className={i <= current ? "text-rose" : "text-line"}>♥</span>
            ))}
          </p>
        </div>
      </div>

      {/* 對話內容 */}
      <div className="space-y-4 bg-cream/60 px-4 py-6 sm:px-6">
        <p className="text-center text-xs text-ink-soft">— 你們已經配對成功，開始聊天吧 —</p>

        {questionSet.questions.slice(0, current + 1).map((q, i) => {
          const ev = evaluations[i];
          // 已經評分過，或是「這題正在送出中」，就顯示自己的回覆泡泡
          const showMine = ev !== null || (i === current && loading);
          return (
            <div key={i} className="space-y-4">
              {/* 面試官的訊息 */}
              <div className="animate-rise flex gap-2.5">
                <span className="bg-love flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm text-white">💼</span>
                <div className="max-w-[85%]">
                  <span className="rounded-full bg-sage-soft px-2 py-0.5 text-[11px] text-sage">{q.category}</span>
                  <div className="mt-1.5 rounded-3xl rounded-tl-md border border-line bg-paper px-4 py-3 shadow-sm">
                    <p className="leading-relaxed font-medium">{q.question}</p>
                  </div>
                  <p className="mt-1.5 px-2 text-xs text-ink-soft">💭 對方其實想知道：{q.intent}</p>
                </div>
              </div>

              {/* 你的回覆 */}
              {showMine && (
                <div className="animate-rise flex justify-end">
                  <div className="bg-love max-w-[85%] rounded-3xl rounded-tr-md px-4 py-3 text-sm leading-relaxed whitespace-pre-line text-white shadow-sm">
                    {answers[i]}
                  </div>
                </div>
              )}

              {/* 等待評分中：對方正在輸入⋯ */}
              {i === current && loading && (
                <div className="flex items-center gap-2 text-xs text-ink-soft">
                  <span className="rounded-full bg-paper px-3 py-2 shadow-sm"><TypingDots label="媒人正在寫悄悄話" /></span>
                </div>
              )}

              {/* 媒人悄悄話（評分） */}
              {ev && <MatchmakerNote evaluation={ev} />}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* 底部：輸入框（還沒回覆時）或「下一個話題」按鈕（評分完成後） */}
      <div className="rounded-b-[2rem] border-t border-line bg-paper p-4">
        {currentEval ? (
          <button onClick={onNext} className="bg-love w-full rounded-full py-3.5 font-bold text-white shadow-lg shadow-rose/25 transition hover:-translate-y-0.5">
            {isLast ? "看看我們的約會報告 💌" : "聊下一個話題 →"}
          </button>
        ) : (
          <div className="flex items-end gap-2">
            <textarea
              value={answers[current]}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={loading}
              rows={3}
              placeholder="像傳訊息一樣，說說你的想法和經驗⋯⋯"
              className="min-w-0 flex-1 resize-none rounded-3xl border border-line bg-cream px-4 py-3 text-sm leading-relaxed outline-none placeholder:text-ink-soft/50 focus:border-rose focus:ring-2 focus:ring-rose/15 disabled:text-ink-soft"
            />
            <button
              onClick={onSubmit}
              disabled={!answers[current].trim() || loading}
              aria-label="送出回覆"
              className="bg-love flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg text-white shadow-md transition hover:scale-105 disabled:cursor-not-allowed disabled:bg-none disabled:bg-ink-soft/30 disabled:shadow-none"
            >
              ➤
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// 媒人悄悄話：心動指數、評語、優點、建議、示範回答
// ============================================================
function MatchmakerNote({ evaluation }: { evaluation: Evaluation }) {
  const tone = scoreTone(evaluation.score);
  const score = Math.round(evaluation.score);
  return (
    <div className="animate-rise mx-auto max-w-[95%] overflow-hidden rounded-3xl border border-line bg-paper shadow-md">
      {/* 心動指數與一句話總評 */}
      <div className={`flex items-center gap-4 border-b ${tone.border} ${tone.bg} px-5 py-4`}>
        <div className="text-center">
          <p className={`font-serif text-4xl leading-none font-bold whitespace-nowrap ${tone.text}`}>
            {score}<span className="text-base">%</span>
          </p>
          <p className="mt-1 text-[11px] text-ink-soft">心動指數</p>
        </div>
        <div>
          <p className="text-xs font-bold text-ink-soft">💌 媒人悄悄話</p>
          <p className="mt-1 font-serif font-bold">「{evaluation.verdict}」</p>
          <Hearts score={score} />
        </div>
      </div>

      <div className="grid gap-5 px-5 py-5 sm:grid-cols-2">
        <FeedbackList title="讓人心動的地方" items={evaluation.strengths} empty="這次還沒找到亮點，別擔心，看看右邊的建議。" mark="♥" color="text-rose" />
        <FeedbackList title="下次約會可以更好" items={evaluation.improvements} empty="幾乎無可挑剔！" mark="→" color="text-sage" />
      </div>

      {/* 示範回答：這題「比較好的回答方式」 */}
      <div className="border-t border-line bg-blush/40 px-5 py-5">
        <p className="text-xs font-bold tracking-wider text-rose">示範回答 · 如果是我，會這樣說</p>
        <p className="mt-2 text-sm leading-loose whitespace-pre-line">{evaluation.modelAnswer}</p>
        <p className="mt-3 rounded-2xl bg-sage-soft px-4 py-3 text-xs leading-relaxed text-sage">
          <span className="font-bold">約會心法　</span>
          {evaluation.tip}
        </p>
      </div>
    </div>
  );
}

function FeedbackList({ title, items, empty, mark, color }: { title: string; items: string[]; empty: string; mark: string; color: string }) {
  return (
    <div>
      <p className="text-sm font-bold">{title}</p>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-ink-soft">{empty}</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm leading-relaxed text-ink-soft">
              <span className={`shrink-0 ${color}`}>{mark}</span>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ============================================================
// 階段四：約會報告（總結）
// ============================================================
function SummaryView(props: {
  questionSet: QuestionSet;
  answers: string[];
  evaluations: (Evaluation | null)[];
  onRestart: () => void;
}) {
  const { questionSet, answers, evaluations, onRestart } = props;
  // 平均心動指數：只計算有評分的題目
  const scores = evaluations.filter((e): e is Evaluation => e !== null).map((e) => e.score);
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const result = matchResult(avg);

  return (
    <div className="animate-rise">
      {/* 約會報告大卡片 */}
      <div className="bg-love relative overflow-hidden rounded-[2.5rem] px-6 py-12 text-center text-white shadow-2xl shadow-rose/30">
        <span className="absolute -right-6 -bottom-12 text-[10rem] leading-none opacity-15" aria-hidden="true">♥</span>
        <span className="text-xs font-bold tracking-[0.2em] uppercase opacity-85">約會報告</span>
        <p className="mt-4 text-5xl">{result.emoji}</p>
        <p className="mt-3 font-serif text-7xl font-bold">
          {avg}<span className="text-2xl">%</span>
        </p>
        <p className="text-sm opacity-85">平均心動指數</p>
        <h1 className="mt-5 font-serif text-3xl font-bold">{result.title}</h1>
        <p className="mx-auto mt-3 max-w-sm text-white/90">{result.desc}</p>
      </div>

      {/* 每題回顧：可以展開看細節 */}
      <h2 className="mt-12 font-serif text-xl font-bold">這次約會聊了什麼</h2>
      <div className="mt-4 space-y-3">
        {questionSet.questions.map((q, i) => {
          const ev = evaluations[i];
          const t = scoreTone(ev?.score ?? 0);
          return (
            // <details> 是原生的折疊元件，不用寫任何 JS
            <details key={i} className="group rounded-2xl border border-line bg-paper px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <span className="text-sm font-medium">
                  <span className="mr-2 text-rose">♥{i + 1}</span>
                  {q.question}
                </span>
                <span className={`shrink-0 font-serif text-lg font-bold ${t.text}`}>{ev ? `${Math.round(ev.score)}%` : "—"}</span>
              </summary>
              {ev && (
                <div className="mt-4 space-y-3 border-t border-line pt-4 text-sm leading-relaxed">
                  <p><span className="font-bold">你的回覆：</span><span className="text-ink-soft">{answers[i]}</span></p>
                  <p><span className="font-bold">媒人說：</span>{ev.verdict}</p>
                  <p className="whitespace-pre-line"><span className="font-bold text-rose">示範回答：</span>{ev.modelAnswer}</p>
                </div>
              )}
            </details>
          );
        })}
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <button onClick={onRestart} className="bg-love flex-1 rounded-full py-3.5 font-bold text-white shadow-lg shadow-rose/25 transition hover:-translate-y-0.5">
          再約一次（換個對象）♥
        </button>
        <Link href="/" className="flex-1 rounded-full border border-line bg-paper py-3.5 text-center font-medium transition hover:border-rose">
          回到首頁
        </Link>
      </div>
    </div>
  );
}

// ============================================================
// 小元件
// ============================================================

// 顯示目前用的是「你的 OpenAI Key」還是「示範模式」
function KeyStatus() {
  const { key } = useOpenAIKey();
  return (
    <div className={`mt-8 flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm ${key ? "border-sage/30 bg-sage-soft" : "border-honey/30 bg-[#fbf0dc]"}`}>
      {key ? (
        <span className="text-sage">🔑 帶著你的 OpenAI Key 赴約 <span className="font-mono">{maskKey(key)}</span></span>
      ) : (
        <span className="text-ink-soft">🔑 還沒帶鑰匙，目前是<b>示範模式</b>（固定話題）</span>
      )}
      <Link href="/settings" className="shrink-0 font-bold text-rose underline-offset-2 hover:underline">
        {key ? "管理" : "去設定 →"}
      </Link>
    </div>
  );
}

// 五顆愛心：心動指數每 20 分一顆
function Hearts({ score }: { score: number }) {
  const filled = Math.round(score / 20);
  return (
    <p className="mt-1 text-sm tracking-wider" aria-label={`${filled} 顆心`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className={i < filled ? "text-rose" : "text-line"}>♥</span>
      ))}
    </p>
  );
}

// 圓形的 +/- 按鈕
function StepButton({ children, onClick, disabled, label }: { children: React.ReactNode; onClick: () => void; disabled: boolean; label: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-cream text-lg transition hover:border-rose hover:text-rose disabled:opacity-30"
    >
      {children}
    </button>
  );
}

// 「對方正在輸入中⋯」的載入動畫
function TypingDots({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      {label}
      <span className="inline-flex gap-1">
        {[0, 1, 2].map((i) => (
          <span key={i} className="typing-dot h-1.5 w-1.5 rounded-full bg-current" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </span>
    </span>
  );
}
