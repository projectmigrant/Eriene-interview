// ============================================================
// 面試頁面 /interview
// ------------------------------------------------------------
// 這頁需要大量互動（輸入、按鈕、狀態切換），所以標記為「客戶端元件」。
//
// 整個流程是一個三階段的「狀態機」：
//   setup     → 填職缺描述、選題數，按「開始」後呼叫 API 出題
//   interview → 一題一題回答；每送出一題就呼叫 API 評分，顯示評語
//   summary   → 全部答完，顯示總分與「配對結果」
// ============================================================
"use client";

import Link from "next/link";
import { useState } from "react";
import type { Evaluation, QuestionSet } from "@/lib/interview-schema";
import { MAX_QUESTIONS, MIN_QUESTIONS } from "@/lib/interview-schema";

// 三個階段
type Stage = "setup" | "interview" | "summary";

// ------------------------------------------------------------
// 呼叫後端 API 的小工具：統一處理錯誤訊息
// ------------------------------------------------------------
async function callInterviewApi<T>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch("/api/interview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  // 後端出錯時會回 { error: "..." }，把它變成例外丟出去
  if (!res.ok) throw new Error(data.error ?? "發生錯誤，請再試一次");
  return data as T;
}

// ------------------------------------------------------------
// 依分數決定顏色與「相親結果」文字
// ------------------------------------------------------------
function scoreTone(score: number) {
  if (score >= 80) return { text: "text-sage", bg: "bg-sage-soft", border: "border-sage/30", bar: "bg-sage" };
  if (score >= 60) return { text: "text-honey", bg: "bg-[#f7ecd5]", border: "border-honey/30", bar: "bg-honey" };
  return { text: "text-rose", bg: "bg-blush", border: "border-rose/30", bar: "bg-rose" };
}

function matchResult(avg: number) {
  if (avg >= 90) return { title: "天作之合", desc: "你們根本是為彼此而生。帶著這份自信去面試吧！" };
  if (avg >= 75) return { title: "值得第二次約會", desc: "對方對你很有好感，再修飾幾個細節就更完美了。" };
  if (avg >= 60) return { title: "再多聊聊看", desc: "有基本的好感，但還不夠讓人心動。看看建議，再練一次吧。" };
  return { title: "也許還不是時候", desc: "別灰心，這只是練習。把示範答案讀熟，下次一定更好。" };
}

export default function InterviewPage() {
  // ---------------- 狀態（State） ----------------
  const [stage, setStage] = useState<Stage>("setup");
  const [jobDescription, setJobDescription] = useState("");
  const [count, setCount] = useState(5); // 預設 5 題，使用者可調整

  const [questionSet, setQuestionSet] = useState<QuestionSet | null>(null);
  const [current, setCurrent] = useState(0); // 目前在第幾題（從 0 開始）
  const [answers, setAnswers] = useState<string[]>([]); // 每一題的回答
  const [evaluations, setEvaluations] = useState<(Evaluation | null)[]>([]); // 每一題的評分

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---------------- 動作 1：開始面試（出題） ----------------
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
      setStage("interview");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  // ---------------- 動作 2：送出目前這題的回答（評分） ----------------
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

  // ---------------- 動作 3：下一題 / 看結果 ----------------
  function handleNext() {
    if (!questionSet) return;
    if (current < questionSet.questions.length - 1) {
      setCurrent(current + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setStage("summary");
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
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
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

      {stage === "interview" && questionSet && (
        <InterviewView
          questionSet={questionSet}
          current={current}
          answer={answers[current]}
          setAnswer={(value) => setAnswers((prev) => prev.map((a, i) => (i === current ? value : a)))}
          evaluation={evaluations[current]}
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
// 階段一：設定（職缺描述 + 題數）
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
      <span className="text-xs font-medium tracking-[0.2em] text-rose uppercase">Step 1 · 認識對方</span>
      <h1 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">先讓我看看對方的條件</h1>
      <p className="mt-3 text-ink-soft">把職缺描述貼上來，就像相親前先讀對方的自我介紹。</p>

      <div className="mt-10 rounded-3xl border border-line bg-paper p-6 shadow-sm sm:p-8">
        {/* 職缺描述 */}
        <label htmlFor="jd" className="text-sm font-bold">職缺描述</label>
        <textarea
          id="jd"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={9}
          placeholder={"例如：\n【前端工程師】\n・熟悉 React、TypeScript\n・有與設計師、PM 協作的經驗\n・重視使用者體驗，喜歡把細節做好⋯⋯"}
          className="mt-3 w-full resize-y rounded-2xl border border-line bg-cream px-4 py-3 text-sm leading-relaxed outline-none placeholder:text-ink-soft/50 focus:border-rose focus:ring-2 focus:ring-rose/15"
        />
        <p className="mt-2 text-right text-xs text-ink-soft">{jobDescription.trim().length} 字</p>

        {/* 題數選擇：按鈕 +/- 調整，不寫死 */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
          <div>
            <p className="text-sm font-bold">這次想聊幾題？</p>
            <p className="mt-1 text-xs text-ink-soft">{MIN_QUESTIONS}～{MAX_QUESTIONS} 題，暖身建議 3 題，認真演練建議 8 題以上</p>
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
          className="mt-8 w-full rounded-full bg-rose py-3.5 font-medium text-white shadow-lg shadow-rose/20 transition hover:bg-rose-deep disabled:cursor-not-allowed disabled:bg-ink-soft/30 disabled:shadow-none"
        >
          {loading ? <TypingDots label="面試官正在準備題目" /> : tooShort ? "職缺描述至少 20 字" : `赴約去！開始 ${count} 題面試`}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// 階段二：面試中（一次一題）
// ============================================================
function InterviewView(props: {
  questionSet: QuestionSet;
  current: number;
  answer: string;
  setAnswer: (v: string) => void;
  evaluation: Evaluation | null;
  loading: boolean;
  onSubmit: () => void;
  onNext: () => void;
}) {
  const { questionSet, current, answer, setAnswer, evaluation, loading, onSubmit, onNext } = props;
  const total = questionSet.questions.length;
  const q = questionSet.questions[current];
  const isLast = current === total - 1;

  return (
    <div>
      {/* 進度條 */}
      <div className="flex items-center justify-between text-xs text-ink-soft">
        <span>第 {current + 1} / {total} 題</span>
        <span className="rounded-full bg-sage-soft px-2.5 py-0.5 text-sage">{q.category}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-rose transition-all duration-500" style={{ width: `${((current + 1) / total) * 100}%` }} />
      </div>

      {/* 第一題時顯示面試官的開場白 */}
      {current === 0 && (
        <p className="animate-rise mt-8 text-center font-serif text-ink-soft italic">「{questionSet.opening}」</p>
      )}

      {/* 面試官的提問（對話泡泡） */}
      <div key={current} className="animate-rise mt-8 flex gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink font-serif text-cream">面</span>
        <div className="rounded-3xl rounded-tl-sm border border-line bg-paper px-5 py-4 shadow-sm">
          <p className="font-serif text-lg leading-relaxed font-bold">{q.question}</p>
          <p className="mt-2 text-xs text-ink-soft">💭 對方其實想知道：{q.intent}</p>
        </div>
      </div>

      {/* 回答區：已評分後鎖定，避免改了答案卻對不上評語 */}
      <div className="mt-6">
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={!!evaluation || loading}
          rows={7}
          placeholder="像跟對方聊天一樣，說說你的想法和經驗⋯⋯"
          className="w-full resize-y rounded-3xl border border-line bg-paper px-5 py-4 text-sm leading-relaxed outline-none placeholder:text-ink-soft/50 focus:border-rose focus:ring-2 focus:ring-rose/15 disabled:bg-cream disabled:text-ink-soft"
        />
        {!evaluation && (
          <button
            onClick={onSubmit}
            disabled={!answer.trim() || loading}
            className="mt-3 w-full rounded-full bg-ink py-3.5 font-medium text-cream transition hover:bg-rose disabled:cursor-not-allowed disabled:bg-ink-soft/30"
          >
            {loading ? <TypingDots label="面試官正在思考你的回答" /> : "送出回答，聽聽媒人怎麼說"}
          </button>
        )}
      </div>

      {/* 評分結果 */}
      {evaluation && (
        <>
          <EvaluationCard evaluation={evaluation} />
          <button
            onClick={onNext}
            className="mt-6 w-full rounded-full bg-rose py-3.5 font-medium text-white shadow-lg shadow-rose/20 transition hover:bg-rose-deep"
          >
            {isLast ? "看看我們合不合拍 →" : "下一題 →"}
          </button>
        </>
      )}
    </div>
  );
}

// ============================================================
// 單題評分卡：分數、總評、優點、建議、示範答案
// ============================================================
function EvaluationCard({ evaluation }: { evaluation: Evaluation }) {
  const tone = scoreTone(evaluation.score);
  return (
    <div className="animate-rise mt-8 overflow-hidden rounded-3xl border border-line bg-paper shadow-sm">
      {/* 分數與一句話總評 */}
      <div className={`flex items-center gap-5 border-b ${tone.border} ${tone.bg} px-6 py-5`}>
        <div className={`font-serif text-5xl font-bold ${tone.text}`}>
          {Math.round(evaluation.score)}
          <span className="text-base">分</span>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-soft">媒人的評語</p>
          <p className="mt-1 font-serif text-lg font-bold">「{evaluation.verdict}」</p>
        </div>
      </div>

      <div className="grid gap-6 px-6 py-6 sm:grid-cols-2">
        <FeedbackList title="讓人心動的地方" items={evaluation.strengths} empty="這次還沒找到亮點，別擔心，看看下面的建議。" mark="♡" color="text-sage" />
        <FeedbackList title="可以更好的地方" items={evaluation.improvements} empty="幾乎無可挑剔！" mark="→" color="text-rose" />
      </div>

      {/* 示範答案：這題「比較好的回答方式」 */}
      <div className="border-t border-line bg-cream px-6 py-6">
        <p className="text-xs font-medium tracking-wider text-rose">示範回答 · 如果是我，會這樣說</p>
        <p className="mt-3 text-sm leading-loose whitespace-pre-line">{evaluation.modelAnswer}</p>
        <p className="mt-4 rounded-2xl bg-sage-soft px-4 py-3 text-xs leading-relaxed text-sage">
          <span className="font-bold">答題心法　</span>
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
        <p className="mt-3 text-sm text-ink-soft">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-2.5">
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
// 階段三：總結（配對結果）
// ============================================================
function SummaryView(props: {
  questionSet: QuestionSet;
  answers: string[];
  evaluations: (Evaluation | null)[];
  onRestart: () => void;
}) {
  const { questionSet, answers, evaluations, onRestart } = props;
  // 平均分數：只計算有評分的題目
  const scores = evaluations.filter((e): e is Evaluation => e !== null).map((e) => e.score);
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const result = matchResult(avg);
  const tone = scoreTone(avg);

  return (
    <div className="animate-rise">
      {/* 配對結果大卡片 */}
      <div className="rounded-[2rem] border border-line bg-paper px-6 py-12 text-center shadow-sm">
        <span className="text-xs font-medium tracking-[0.2em] text-rose uppercase">配對結果</span>
        <div className={`mt-4 font-serif text-7xl font-bold ${tone.text}`}>
          {avg}
          <span className="text-2xl">分</span>
        </div>
        <h1 className="mt-4 font-serif text-3xl font-bold">{result.title}</h1>
        <p className="mx-auto mt-3 max-w-sm text-ink-soft">{result.desc}</p>
      </div>

      {/* 每題回顧：可以展開看細節 */}
      <h2 className="mt-12 font-serif text-xl font-bold">這次約會的回顧</h2>
      <div className="mt-4 space-y-3">
        {questionSet.questions.map((q, i) => {
          const ev = evaluations[i];
          const t = scoreTone(ev?.score ?? 0);
          return (
            // <details> 是原生的折疊元件，不用寫任何 JS
            <details key={i} className="group rounded-2xl border border-line bg-paper px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <span className="text-sm font-medium">
                  <span className="mr-2 text-ink-soft">Q{i + 1}</span>
                  {q.question}
                </span>
                <span className={`shrink-0 font-serif text-xl font-bold ${t.text}`}>{ev ? Math.round(ev.score) : "—"}</span>
              </summary>
              {ev && (
                <div className="mt-4 space-y-3 border-t border-line pt-4 text-sm leading-relaxed">
                  <p><span className="font-bold">你的回答：</span><span className="text-ink-soft">{answers[i]}</span></p>
                  <p><span className="font-bold">評語：</span>{ev.verdict}</p>
                  <p className="whitespace-pre-line"><span className="font-bold text-rose">示範回答：</span>{ev.modelAnswer}</p>
                </div>
              )}
            </details>
          );
        })}
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <button onClick={onRestart} className="flex-1 rounded-full bg-rose py-3.5 font-medium text-white transition hover:bg-rose-deep">
          再約一次（換個職缺）
        </button>
        <Link href="/" className="flex-1 rounded-full border border-line bg-paper py-3.5 text-center font-medium transition hover:border-ink">
          回到首頁
        </Link>
      </div>
    </div>
  );
}

// ============================================================
// 小元件
// ============================================================

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
