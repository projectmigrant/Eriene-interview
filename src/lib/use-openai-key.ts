// ============================================================
// React Hook：在元件中讀取 / 儲存 / 清除使用者的 OpenAI Key
// ------------------------------------------------------------
// 為什麼用 useSyncExternalStore？
//   localStorage 是 React 以外的「外部資料」，而且伺服器端渲染時根本沒有 localStorage。
//   useSyncExternalStore 可以：
//     - 伺服器端先回傳空字串（getServerSnapshot），避免畫面對不上（hydration 錯誤）
//     - 瀏覽器端再讀取真正的值，而且 Key 改變時自動更新所有用到它的元件
// ============================================================
"use client";

import { useSyncExternalStore } from "react";
import { OPENAI_KEY_STORAGE, clearOpenAIKey, loadOpenAIKey, saveOpenAIKey } from "./byok";

// 同一個分頁裡修改 localStorage 不會觸發 storage 事件，所以自己發一個事件通知
const CHANGE_EVENT = "openai-key-change";

function subscribe(onChange: () => void) {
  // storage 事件：其他分頁修改時觸發；CHANGE_EVENT：本分頁修改時觸發
  const onStorage = (e: StorageEvent) => {
    if (e.key === OPENAI_KEY_STORAGE) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

export function useOpenAIKey() {
  const key = useSyncExternalStore(subscribe, loadOpenAIKey, () => "");

  return {
    key,
    save(newKey: string) {
      saveOpenAIKey(newKey);
      window.dispatchEvent(new Event(CHANGE_EVENT));
    },
    clear() {
      clearOpenAIKey();
      window.dispatchEvent(new Event(CHANGE_EVENT));
    },
  };
}
