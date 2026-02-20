/**
 * ============================================
 *  データ保存ユーティリティ
 * ============================================
 *  Persistent Storage（クラウド）を使用。
 *  どのPC・ブラウザからでもデータにアクセス可能。
 *
 *  ※ 社内サーバーに移行する場合は、このファイルの
 *  　 get/set/list 関数をAPIコールに差し替えるだけでOK
 * ============================================
 */

const stor = {
  get: async (key, shared = true) => {
    try {
      return await window.storage.get(key, shared);
    } catch (e) {
      return null;
    }
  },

  set: async (key, value, shared = true) => {
    try {
      return await window.storage.set(key, value, shared);
    } catch (e) {
      return null;
    }
  },

  list: async (prefix, shared = true) => {
    try {
      return await window.storage.list(prefix, shared);
    } catch (e) {
      return { keys: [] };
    }
  }
};

export default stor;

/**
 * 日付フォーマット（ISO → 見やすい形式）
 */
export function formatDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  const Y = d.getFullYear();
  const M = String(d.getMonth() + 1).padStart(2, "0");
  const D = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${Y}/${M}/${D} ${h}:${m}`;
}