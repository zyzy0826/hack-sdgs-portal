// 用瀏覽器原生 Web Crypto API 計算 SHA-256，回傳小寫 hex 字串。
// 不需要任何 npm 套件。
export async function sha256Hex(text) {
  const data = new TextEncoder().encode(text)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}
