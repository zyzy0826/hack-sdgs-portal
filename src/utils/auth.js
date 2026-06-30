// 用 Web Storage 記住通過密碼驗證的身份（僅防誤操作，非安全機制）。
//
// 常駐登入（PERSISTENT_ROLES）用 localStorage：關掉瀏覽器仍記得，直到手動登出。
// 其他身份用 sessionStorage：關掉分頁即失效。
const PERSISTENT_ROLES = new Set(['admin'])

const KEY = (role) => `camp2026.auth.${role}`

export function isAuthed(role) {
  return (
    localStorage.getItem(KEY(role)) === '1' ||
    sessionStorage.getItem(KEY(role)) === '1'
  )
}

export function setAuthed(role) {
  const store = PERSISTENT_ROLES.has(role) ? localStorage : sessionStorage
  store.setItem(KEY(role), '1')
}

export function clearAuth(role) {
  localStorage.removeItem(KEY(role))
  sessionStorage.removeItem(KEY(role))
}
