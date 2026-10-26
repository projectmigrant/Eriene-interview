// ============================================================
// 面試資料的「格式定義」（前後端共用）
// ------------------------------------------------------------
// 我們用 zod 來描述資料長什麼樣子，好處有兩個：
// 1. 後端可以把這份格式交給 Claude，強制 AI 回傳「完全符合格式」的 JSON
// 2. 透過 z.infer 自動產生 TypeScript 型別，前端拿來用就不會打錯欄位
// ============================================================
import { z } from "zod";

// 題數限制：使用者可以自己選，但我們限制在合理範圍內
export const MIN_QUESTIONS = 1;
export const MAX_QUESTIONS = 10;

// ---------- 1. 出題 ----------

// 單一題目的格式
export const QuestionSchema = z.object({
  // 題目本身，例如「請分享一次你處理衝突的經驗」
  question: z.string(),
  // 這題想考什麼（給使用者看，像是「對方想知道你的⋯⋯」）
  intent: z.string(),
  // 題目類型，方便前端顯示小標籤
  category: z.enum(["自我介紹", "專業技能", "行為情境", "動機與價值觀", "反問與延伸"]),
});

// AI 出題時要回傳的整包資料：一個題目陣列
export const QuestionSetSchema = z.object({
  // 面試官（相親對象）的一句開場白，增加生活感
  opening: z.string(),
  questions: z.array(QuestionSchema),
});

// ---------- 2. 評分 ----------

// AI 評分一題時要回傳的資料
export const EvaluationSchema = z.object({
  // 0～100 分
  score: z.number(),
  // 一句話總評，用相親的口吻，例如「有心動，但還差一點火花」
  verdict: z.string(),
  // 你答得好的地方
  strengths: z.array(z.string()),
  // 可以改進的地方（具體建議）
  improvements: z.array(z.string()),
  // 示範答案：這題「比較好的回答方式」，直接寫成一段可以照著講的回答
  modelAnswer: z.string(),
  // 這題的答題框架或心法，例如 STAR 法則
  tip: z.string(),
});

// ---------- 3. 前端送給 API 的請求格式 ----------

// 用 discriminatedUnion：依照 action 欄位決定要做「出題」還是「評分」
export const InterviewRequestSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("questions"),
    jobDescription: z.string().trim().min(20, "職缺描述至少要 20 個字，AI 才看得懂喔"),
    count: z.number().int().min(MIN_QUESTIONS).max(MAX_QUESTIONS),
  }),
  z.object({
    action: z.literal("evaluate"),
    jobDescription: z.string().trim().min(1),
    question: z.string().min(1),
    answer: z.string().trim().min(1, "先寫點什麼再送出吧"),
  }),
]);

// ---------- 自動產生的 TypeScript 型別 ----------
export type Question = z.infer<typeof QuestionSchema>;
export type QuestionSet = z.infer<typeof QuestionSetSchema>;
export type Evaluation = z.infer<typeof EvaluationSchema>;
export type InterviewRequest = z.infer<typeof InterviewRequestSchema>;
