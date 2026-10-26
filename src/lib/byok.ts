// ============================================================
// BYOK（Bring Your Own Key，使用者自帶金鑰）的共用設定與工具
// ------------------------------------------------------------
// 流程：
//   1. 使用者在 /settings 頁輸入自己的 OpenAI API Key
//   2. 存進「瀏覽器的 localStorage」——只存在使用者自己的電腦上
//   3. 前端呼叫 /api/interview 時，把 Key 放在 HTTP header 一起送出
//   4. 後端用這把 Key 呼叫 OpenAI，用完即丟，不儲存、不記錄
// 這樣網站主人（我們）不用付 AI 的錢，費用由使用者自己的帳號支付。
// ============================================================

// localStorage 裡的欄位名稱
export const OPENAI_KEY_STORAGE = "right-one:openai-api-key";

// 前端送 Key 給後端時使用的 HTTP header 名稱（前後端要一致）
export const OPENAI_KEY_HEADER = "x-openai-key";

// 使用的 OpenAI 模型（mini 版本便宜又快，適合練習用）
export const OPENAI_MODEL = "gpt-5.4-mini";

// ---------- 以下函式只能在瀏覽器（客戶端元件）裡呼叫 ----------
// localStorage 可能因為無痕模式、瀏覽器設定而無法使用，所以都包在 try/catch 裡

// 讀取 Key；沒有就回傳空字串
export function loadOpenAIKey(): string {
  try {
    return localStorage.getItem(OPENAI_KEY_STORAGE) ?? "";
  } catch {
    return "";
  }
}

// 儲存 Key（前後空白會先去掉，避免複製貼上時多帶空格）
export function saveOpenAIKey(key: string) {
  try {
    localStorage.setItem(OPENAI_KEY_STORAGE, key.trim());
  } catch {
    // 無法儲存時就忽略，畫面上會顯示「尚未設定」
  }
}

// 清除 Key
export function clearOpenAIKey() {
  try {
    localStorage.removeItem(OPENAI_KEY_STORAGE);
  } catch {}
}

// 遮罩顯示：sk-proj-abc...wxyz → 只露出頭尾，避免旁人偷看
export function maskKey(key: string) {
  if (key.length <= 12) return "•".repeat(key.length);
  return `${key.slice(0, 7)}••••••••${key.slice(-4)}`;
}

// 簡單的格式檢查：OpenAI 的 Key 都是 sk- 開頭
export function looksLikeOpenAIKey(key: string) {
  return /^sk-[A-Za-z0-9_-]{20,}$/.test(key.trim());
}
