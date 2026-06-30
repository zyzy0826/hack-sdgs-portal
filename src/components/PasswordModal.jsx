import { useState } from 'react'

// 可重用的密碼驗證 modal。
// props:
//   title       - 標題
//   expected    - 正確密碼
//   onSuccess() - 驗證通過
//   onCancel()  - 取消關閉
export default function PasswordModal({ title, expected, onSuccess, onCancel }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  function submit(e) {
    e.preventDefault()
    if (value === expected) {
      setError('')
      onSuccess()
    } else {
      setError('密碼錯誤，請再試一次')
      setValue('')
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
          <button type="submit" className="mc-btn mc-btn--diamond">
            確認
          </button>
        </div>
      </form>
    </div>
  )
}
