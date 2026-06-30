// 用 sessionStorage 記住通過密碼驗證的身份（僅防誤操作，非安全機制）。
const KEY = (role) => `camp2026.auth.${role}`

export function isAuthed(role) {
  return sessionStorage.getItem(KEY(role)) === '1'
}

export function setAuthed(role) {
  sessionStorage.setItem(KEY(role), '1')
}
