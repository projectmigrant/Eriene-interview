// ============================================================
// /api/interview — 面試模擬器的後端 API
// ------------------------------------------------------------
// 前端用 POST 打這支 API，body 裡的 action 決定要做哪件事：
//   action: "questions" → 讀職缺描述，出 N 道面試題
//   action: "evaluate"  → 針對某一題的回答，給分數、建議、示範答案
//
// 要用哪一個 AI，依照以下優先順序決定：
//   1. 請求 header 有帶 x-openai-key → BYOK：用「使用者自己的」OpenAI Key
//      （例外：sk-demo- 開頭的練習用假 Key → 走示範模式）
//   2. 環境變數 DEMO_MODE=true      → 示範模式：用寫好的假資料（不花錢）
//   3. 環境變數有 ANTHROPIC_API_KEY  → 用「網站主人的」Claude 金鑰
//   4. 以上都沒有                    → 回傳錯誤，請使用者去設定頁輸入 Key
//
// 這支 API 負責：
//   1. 檢查前端送來的資料是否合法
//   2. 組好提示詞（prompt）交給 AI
//   3. 把 AI 回傳的結構化 JSON 交回前端
// ============================================================
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import type { z } from "zod";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { zodTextFormat } from "openai/helpers/zod";
import {
  EvaluationSchema,
  InterviewRequestSchema,
  QuestionSetSchema,
} from "@/lib/interview-schema";
import { fakeDelay, mockEvaluate, mockQuestions } from "@/lib/mock-interview";
import { OPENAI_KEY_HEADER, OPENAI_MODEL, looksLikeOpenAIKey } from "@/lib/byok";

// 給 AI 的「人設」：把面試包裝成一場相親，評分時也用這種口吻
const SYSTEM_PROMPT = `你是「Right One 面試相談室」的資深面試官，同時也是一位很會看人的媒人。
你把每一場面試看成一場相親：公司和求職者都在確認「彼此是不是對的人」。
說話風格：溫暖、生活化、偶爾用相親或約會的比喻，但專業內容必須紮實、具體、可執行。
一律使用繁體中文（台灣用語）。`;

// 允許 Vercel 等平台執行較久（AI 思考可能需要幾十秒）
export const maxDuration = 120;

// 讀取環境變數 DEMO_MODE：設成 "true" 時，用假資料（不花錢）
// 環境變數一律是「字串」，所以要和 "true" 比較，而不是布林值 true
const DEMO_MODE = process.env.DEMO_MODE === "true";

// 「問 AI」函式的型別：給它提示詞和 zod 格式，它回傳符合格式的資料
// Claude 和 OpenAI 各有一個實作，出題／評分的程式不用管背後是哪一家
type AskFn = <S extends z.ZodType>(prompt: string, schema: S) => Promise<z.infer<S>>;

export async function POST(request: Request) {
  // 1) 解析並驗證前端送來的 JSON
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "請求格式錯誤，必須是 JSON" }, { status: 400 });
  }

  const parsed = InterviewRequestSchema.safeParse(body);
  if (!parsed.success) {
    // 只回傳第一個錯誤訊息，前端直接顯示給使用者
    return Response.json({ error: parsed.error.issues[0]?.message ?? "資料格式不正確" }, { status: 400 });
  }
  const input = parsed.data;

  // 2) 從 header 讀取使用者自帶的 OpenAI Key（BYOK）
  //    注意：絕對不要用 console.log 印出這把 Key，否則會留在伺服器紀錄裡
  const userKey = request.headers.get(OPENAI_KEY_HEADER)?.trim();

  // 3) 決定要用哪一個 AI
  let ask: AskFn;
  // 練習用的假 Key（sk-demo- 開頭）：不送到 OpenAI，直接當成示範模式，方便上課體驗 BYOK 流程
  const isDemoKey = userKey?.startsWith("sk-demo-") ?? false;
  if (userKey && !isDemoKey) {
    if (!looksLikeOpenAIKey(userKey)) {
      return Response.json({ error: "OpenAI API Key 格式不正確（應該是 sk- 開頭），請到「設定」頁重新輸入" }, { status: 400 });
    }
    ask = createOpenAIAsk(userKey);
  } else if (isDemoKey || DEMO_MODE) {
    // 示範模式：回傳寫好的假資料（格式和真的 AI 一樣，前端不用改）
    await fakeDelay();
    if (input.action === "questions") return Response.json(mockQuestions(input.count));
    return Response.json(mockEvaluate(input.question, input.answer));
  } else if (process.env.ANTHROPIC_API_KEY) {
    ask = askClaude;
  } else {
    return Response.json({ error: "還沒有設定 API Key，請先到「設定」頁輸入你的 OpenAI API Key" }, { status: 401 });
  }

  try {
    // 4) 依照 action 分流
    if (input.action === "questions") {
      return Response.json(await generateQuestions(ask, input.jobDescription, input.count));
    }
    return Response.json(await evaluateAnswer(ask, input.jobDescription, input.question, input.answer));
  } catch (err) {
    return Response.json(...toErrorResponse(err));
  }
}

// ------------------------------------------------------------
// 錯誤處理：把各家 SDK 的錯誤轉成使用者看得懂的中文訊息
// 由最具體的錯誤類型往下判斷
// ------------------------------------------------------------
function toErrorResponse(err: unknown): [{ error: string }, { status: number }] {
  // OpenAI（使用者自己的 Key）
  if (err instanceof OpenAI.AuthenticationError) {
    return [{ error: "你的 OpenAI API Key 無效或已被撤銷，請到「設定」頁重新輸入" }, { status: 401 }];
  }
  if (err instanceof OpenAI.RateLimitError) {
    // 429 也包含「額度用完（insufficient_quota）」的情況
    return [{ error: "OpenAI 回報請求太頻繁或額度不足，請稍後再試，或確認你的帳號還有餘額" }, { status: 429 }];
  }
  if (err instanceof OpenAI.APIError) {
    return [{ error: `OpenAI 服務暫時出錯（${err.status}），請再試一次` }, { status: 502 }];
  }
  // Claude（網站主人的金鑰）
  if (err instanceof Anthropic.AuthenticationError) {
    return [{ error: "伺服器的 ANTHROPIC_API_KEY 無效，請檢查環境變數" }, { status: 500 }];
  }
  if (err instanceof Anthropic.RateLimitError) {
    return [{ error: "目前使用的人太多了，請稍等幾秒再試一次" }, { status: 429 }];
  }
  if (err instanceof Anthropic.APIError) {
    return [{ error: `AI 服務暫時出錯（${err.status}），請再試一次` }, { status: 502 }];
  }
  // 我們自己丟出的錯誤（例如 AI 拒答、格式解析失敗）
  return [{ error: err instanceof Error ? err.message : "發生未知錯誤" }, { status: 500 }];
}

// ------------------------------------------------------------
// AI 實作一：OpenAI（BYOK，使用者自己的 Key）
// ------------------------------------------------------------
// 每個請求都用使用者的 Key 建立一個新的用戶端，請求結束就丟掉，不會保存
function createOpenAIAsk(apiKey: string): AskFn {
  const openai = new OpenAI({ apiKey });
  return async (prompt, schema) => {
    // Responses API + 結構化輸出：強制回傳的 JSON 符合 zod 格式
    const response = await openai.responses.parse({
      model: OPENAI_MODEL,
      instructions: SYSTEM_PROMPT,
      input: prompt,
      text: { format: zodTextFormat(schema, "result") },
    });
    if (!response.output_parsed) {
      throw new Error("AI 這次沒有給出完整的回應，請再試一次");
    }
    // OpenAI SDK 推導出的型別和 zod 的 z.infer 寫法不同，但實際內容一樣，這裡明確標註
    return response.output_parsed as z.infer<typeof schema>;
  };
}

// ------------------------------------------------------------
// AI 實作二：Claude（網站主人的金鑰，讀取環境變數 ANTHROPIC_API_KEY）
// ------------------------------------------------------------
const askClaude: AskFn = async (prompt, schema) => {
  const client = new Anthropic(); // 會自動讀取 ANTHROPIC_API_KEY
  const response = await client.beta.messages.parse({
    model: "claude-opus-5-5",
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
    output_config: {
      // effort 控制 AI 思考的深度；medium 在品質和速度之間取得平衡
      effort: "medium",
      // 結構化輸出：強制 AI 回傳的 JSON 一定符合我們定義的 schema
      format: betaZodOutputFormat(schema),
    },
    // 萬一主要模型因安全機制拒答，讓伺服器自動改用備援模型重試
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
  });

  // AI 拒絕回答時，content 不會有我們要的資料，要先擋下來
  if (response.stop_reason === "refusal") {
    throw new Error("AI 這次婉拒回答，請調整一下內容再試一次");
  }
  if (!response.parsed_output) {
    throw new Error("AI 回傳的格式不完整，請再試一次");
  }
  return response.parsed_output;
};

// ------------------------------------------------------------
// 功能一：根據職缺描述出題（ask 決定背後用哪一家 AI）
// ------------------------------------------------------------
async function generateQuestions(ask: AskFn, jobDescription: string, count: number) {
  const prompt = `以下是一份職缺描述（就像相親對象的自我介紹）：
<job_description>
${jobDescription}
</job_description>

請以這間公司面試官的身分，出「剛好 ${count} 題」面試題目。要求：
- 題目要緊扣這份職缺真正需要的能力，不要出放諸四海皆準的空泛題
- 題型要有變化（自我介紹、專業技能、行為情境、動機與價值觀、反問與延伸），由淺入深排列
- intent 用一句話說明「對方問這題，其實是想知道你的什麼」
- opening 寫一句面試官的開場白，像第一次約會見面時的招呼，輕鬆自然`;

  const result = await ask(prompt, QuestionSetSchema);

  // 保險起見：就算 AI 多出了題，也只取使用者要的題數
  return { ...result, questions: result.questions.slice(0, count) };
}

// ------------------------------------------------------------
// 功能二：評分使用者的回答，並給示範答案
// ------------------------------------------------------------
async function evaluateAnswer(ask: AskFn, jobDescription: string, question: string, answer: string) {
  const prompt = `職缺描述：
<job_description>
${jobDescription}
</job_description>

面試題目：
<question>${question}</question>

求職者的回答：
<answer>${answer}</answer>

請以面試官的角度評分這個回答，並給出：
- score：0～100 的整數分數（60 分是及格，請誠實評分，不要客套）
- verdict：一句話總評，用相親的比喻（例如「聊得來，但還沒讓人想約第二次」）
- strengths：回答中做得好的地方（1～3 點，沒有就給空陣列）
- improvements：具體可執行的改進建議（2～4 點）
- modelAnswer：這題比較好的示範回答，用第一人稱寫成可以直接開口說的完整段落，並貼合這份職缺
- tip：這類題目的答題心法或框架（例如 STAR 法則），一到兩句話`;

  return ask(prompt, EvaluationSchema);
}
