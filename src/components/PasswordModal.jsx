import { useState } from 'react'
import { sha256Hex } from '../utils/hashPassword'

// 可重用的密碼驗證 modal。
// props:
//   title        - 標題
//   expectedHash - 正確密碼的 SHA-256 hash（hex）
//   onSuccess()  - 驗證通過
//   onCancel()   - 取消關閉
export default function PasswordModal({ title, expectedHash, onSuccess, onCancel }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setChecking(true)
    try {
      const hash = await sha256Hex(value)
      if (hash === expectedHash) {
        setError('')
        onSuccess()
      } else {
        setError('密碼錯誤，請再試一次')
        setValue('')
      }
    } catch {
      setError('驗證失敗，請再試一次')
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <form className="modal-box" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2>{title}</h2>
        <input
          className="mc-input"
          type="password"
          inputMode="numeric"
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="輸入密碼"
        />
        <p className="error-text">{error}</p>
        <div className="choice-grid">
          <button type="button" className="mc-btn mc-btn--ghost" onClick={onCancel}>
            取消
          </button>
          <button type="submit" className="mc-btn mc-btn--diamond" disabled={checking}>
            {checking ? '驗證中…' : '確認'}
          </button>
        </div>
      </form>
    </div>
  )
}
