// ============================================================
// 示範模式（Demo Mode）用的假資料
// ------------------------------------------------------------
// 當環境變數 DEMO_MODE=true 時，API 不會真的去呼叫 Claude，
// 而是用這裡寫好的題目和簡單的評分規則回傳結果。
// 用途：沒有真的 API 金鑰時，也能把整個流程完整跑一遍（交作業、展示用）。
// 回傳的資料格式和真的 AI 完全一樣，所以前端不用改任何程式。
// ============================================================
import type { Evaluation, Question, QuestionSet } from "./interview-schema";

// 題庫：每題附上示範回答與心法，評分時會用到
type MockQuestion = Question & { modelAnswer: string; tip: string };

const QUESTION_BANK: MockQuestion[] = [
  {
    question: "先用一分鐘介紹一下你自己，以及為什麼對這個職缺有興趣？",
    intent: "第一印象：你能不能有條理地說出自己的亮點，以及動機是否真誠",
    category: "自我介紹",
    modelAnswer:
      "我是一個喜歡把事情做到「剛剛好」的人。過去兩年我在新創負責產品的前端開發，從零打造了會員系統，讓註冊轉換率提升了 30%。看到貴公司的職缺描述特別強調使用者體驗，這正是我最在意、也最想深耕的方向，所以很希望有機會加入。",
    tip: "用「現在 → 過去 → 未來」三段式：我現在是誰、我做過什麼成果、為什麼想來這裡。控制在一分鐘內。",
  },
  {
    question: "這份工作最需要的專業能力中，你覺得自己最強的是哪一項？請舉一個實際例子。",
    intent: "你的專業能力是否真的對得上職缺需求，而不只是說說而已",
    category: "專業技能",
    modelAnswer:
      "我最有把握的是把模糊的需求變成可以執行的規格。上一份工作中，業務只丟了一句「客戶覺得報表很難用」，我先訪談了 5 位客戶，整理出 3 個最常見的痛點，再和設計師一起做原型測試，最後改版後客服詢問量少了將近一半。",
    tip: "能力要配上「具體事件＋可量化的成果」，面試官才會相信。",
  },
  {
    question: "請分享一次你和同事意見不合的經驗，你是怎麼處理的？",
    intent: "你的溝通方式和情緒成熟度，是不是一個好合作的夥伴",
    category: "行為情境",
    modelAnswer:
      "有一次我和設計師對首頁改版方向意見不同（情境）。我們都很堅持，但時程只剩一週（任務）。我提議先不爭對錯，各做一個簡單版本，拿去給 10 位使用者測試（行動）。結果數據支持了設計師的方案，我們很快達成共識，也如期上線，之後合作反而更有默契（結果）。",
    tip: "用 STAR 法則：情境（Situation）、任務（Task）、行動（Action）、結果（Result）。重點放在「你做了什麼」。",
  },
  {
    question: "說一個你失敗或犯錯的經驗，你從中學到了什麼？",
    intent: "你是否能誠實面對錯誤，並且真的有成長",
    category: "行為情境",
    modelAnswer:
      "我曾經因為太有自信，沒有在上線前做完整測試，導致結帳頁面出錯了兩個小時。我第一時間通報主管並回滾版本，事後主動整理了檢討報告，並建立了上線前的檢查清單。從那之後，團隊再也沒有發生過類似的事故。",
    tip: "錯誤要選「真實但不致命」的，篇幅重點放在你如何補救和之後的改變。",
  },
  {
    question: "五年後，你希望自己成為什麼樣的人？",
    intent: "你的職涯方向和公司能給的發展是不是合拍，會不會待得久",
    category: "動機與價值觀",
    modelAnswer:
      "我希望五年後能成為一個能獨當一面、也能帶領小團隊的人。前兩年我想把專業基礎打得更扎實，之後希望能多參與產品決策。我看到貴公司有導師制度和內部轉調機會，覺得這裡很適合我一步步往這個方向前進。",
    tip: "把個人目標和公司能提供的舞台連在一起，展現「我們是彼此對的人」。",
  },
  {
    question: "你在什麼樣的團隊或工作環境中，表現會最好？",
    intent: "確認你和團隊文化是否契合，就像相親時確認生活習慣合不合",
    category: "動機與價值觀",
    modelAnswer:
      "我在「目標清楚、但做法有彈性」的團隊中表現最好。我喜歡知道我們為什麼要做這件事，然後被信任去找出最好的方法。我也很重視即時的回饋，所以很習慣主動找主管和同事對齊進度。",
    tip: "誠實描述，但先研究這間公司的文化，挑出彼此重疊的部分來講。",
  },
  {
    question: "如果接手一個時程很趕、需求又一直改的專案，你會怎麼做？",
    intent: "你在壓力下的優先順序判斷和應變能力",
    category: "行為情境",
    modelAnswer:
      "我會先和相關的人把「一定要有」和「有了更好」的需求分清楚，確定最小可行的範圍。接著把工作拆小、每兩三天對一次進度，讓變更能及早被發現。如果真的做不完，我會帶著具體的取捨方案去和主管討論，而不是默默加班到最後一刻。",
    tip: "展現「先釐清、再拆解、主動溝通」的思路，比說「我很能扛壓力」更有說服力。",
  },
  {
    question: "你最近學了什麼新東西？是怎麼學的？",
    intent: "你的學習動力和自學方法，能不能跟上變化",
    category: "專業技能",
    modelAnswer:
      "我最近在學怎麼把 AI 應用到產品中。我先看官方文件把基本概念弄懂，接著做了一個 AI 面試模擬器的小專案來練習，過程中學會了怎麼安全地管理 API 金鑰，也體會到提示詞設計對結果的影響很大。",
    tip: "最好是「學了 → 做出東西 → 有收穫」的完整故事，而不只是「我有上課」。",
  },
  {
    question: "為什麼我們應該選擇你，而不是其他候選人？",
    intent: "你能不能清楚說出自己的獨特價值，就像相親時說出「我適合你的理由」",
    category: "動機與價值觀",
    modelAnswer:
      "我認為我能帶來的是「技術能力加上同理心」的組合。我有實際做出成果的經驗，也很習慣站在使用者的角度思考。更重要的是，我對貴公司正在解決的問題是真心有興趣的，這會讓我願意長期投入。",
    tip: "回扣職缺需求，整理成 2～3 個重點，不要貶低其他人。",
  },
  {
    question: "最後，你有什麼問題想問我們嗎？",
    intent: "你是否認真做過功課，以及你在意的是什麼",
    category: "反問與延伸",
    modelAnswer:
      "有的，我想請問：這個職位進來後的前三個月，您最希望看到什麼樣的成果？另外，團隊目前遇到最大的挑戰是什麼？我很想知道自己可以在哪裡最快幫上忙。",
    tip: "面試是雙向的相親，問「工作內容與團隊」的問題，避免一開始就只問薪水和假期。",
  },
];

// 模擬 AI 思考的等待時間，讓示範時的體驗比較真實
export function fakeDelay(ms = 900) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------- 假的出題 ----------
export function mockQuestions(count: number): QuestionSet {
  return {
    opening: "嗨，很高興見到你！別緊張，就當作是第一次喝咖啡聊聊天吧。（示範模式）",
    // 從題庫依序取出使用者要的題數，只回傳前端需要的欄位
    questions: QUESTION_BANK.slice(0, count).map(({ question, intent, category }) => ({ question, intent, category })),
  };
}

// ---------- 假的評分 ----------
// 規則很簡單：依回答長度、是否有數字（具體成果）、是否有完整的故事結構來加分
export function mockEvaluate(question: string, answer: string): Evaluation {
  const text = answer.trim();
  const hasNumber = /\d/.test(text);
  const hasStory = /(因為|所以|結果|後來|最後|學到)/.test(text);

  let score = 45;
  score += Math.min(25, Math.floor(text.length / 8)); // 長度最多加 25 分
  if (hasNumber) score += 15;
  if (hasStory) score += 10;
  score = Math.min(95, score);

  const strengths: string[] = [];
  if (text.length >= 80) strengths.push("回答有一定的篇幅，讓人感受到你的誠意");
  if (hasNumber) strengths.push("有用數字描述成果，很有說服力");
  if (hasStory) strengths.push("有前因後果，聽起來像一個完整的故事");

  const improvements: string[] = [];
  if (text.length < 80) improvements.push("內容有點短，可以多補充一個具體的經驗或例子");
  if (!hasNumber) improvements.push("試著加入可量化的成果，例如百分比、人數、時間");
  if (!hasStory) improvements.push("用「情境 → 行動 → 結果」的順序來說，會更有條理");
  improvements.push("最後一句話可以回扣到這份職缺，讓對方知道你為什麼適合");

  const verdict =
    score >= 80 ? "聊得很開心，讓人想約第二次！" : score >= 60 ? "有好感，但還差一點讓人心動的火花" : "還有點拘謹，多分享一些真實的你吧";

  // 找到對應題目的示範答案；找不到就用通用版本
  const bank = QUESTION_BANK.find((q) => q.question === question);

  return {
    score,
    verdict,
    strengths,
    improvements,
    modelAnswer: bank?.modelAnswer ?? "先給出結論，再用一個具體的經驗佐證，最後連結到這份工作的需求。",
    tip: bank?.tip ?? "結論先行，再用 STAR 法則補充細節。",
  };
}
