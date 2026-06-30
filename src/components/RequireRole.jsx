import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PasswordModal from './PasswordModal'
import { PASSWORDS } from '../config/passwords'
import { isAuthed, setAuthed } from '../utils/auth'

// 包住需要密碼的頁面。若 sessionStorage 已驗證過該身份就直接放行，
// 否則顯示密碼 modal（取消則回首頁）。
// role: 'leader' | 'gamemaster' | 'admin'
export default function RequireRole({ role, title, children }) {
  const navigate = useNavigate()
  const [ok, setOk] = useState(() => isAuthed(role))

  if (ok) return children

  return (
    <PasswordModal
      title={title}
      expectedHash={PASSWORDS[role]}
      onSuccess={() => {
        setAuthed(role)
        setOk(true)
      }}
      onCancel={() => navigate('/')}
    />
  )
}
