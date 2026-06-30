import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import PasswordModal from '../components/PasswordModal'
import { PASSWORDS } from '../config/passwords'
import { setAuthed } from '../utils/auth'

const TEAMS = [1, 2, 3, 4, 5, 6]
const GROUPS = ['A', 'B', 'C', 'D', 'E']

export default function Home() {
  const navigate = useNavigate()
  // view: 'roles' | 'team-student' | 'team-leader' | 'group-gm'
  const [view, setView] = useState('roles')
  // 等待密碼的角色：null | 'leader' | 'gamemaster' | 'admin'
  const [pwRole, setPwRole] = useState(null)

  function onPwSuccess() {
    const role = pwRole
    setAuthed(role)
    setPwRole(null)
    if (role === 'leader') setView('team-leader')
    else if (role === 'gamemaster') setView('group-gm')
    else if (role === 'admin') navigate('/staff')
  }

  return (
    <Layout title="資工營 2026" showBack={view !== 'roles'}>
      <div className="home-hero">
        <h1>CAMP 2026</h1>
        <p>資工營活動系統 · 公館商圈 &amp; 桌遊之夜</p>
      </div>

      {view === 'roles' && (
        <div className="role-grid">
          <button className="mc-btn role-card" onClick={() => setView('team-student')}>
            <span className="emoji">🧑‍🎓</span> 學員
          </button>
          <button
            className="mc-btn mc-btn--dirt role-card"
            onClick={() => setPwRole('leader')}
          >
            <span className="emoji">🧑‍🏫</span> 隊輔
          </button>
          <button
            className="mc-btn mc-btn--diamond role-card"
            onClick={() => setPwRole('gamemaster')}
          >
            <span className="emoji">🎲</span> 關主
          </button>
          <button
            className="mc-btn mc-btn--ghost role-card"
            onClick={() => setPwRole('admin')}
          >
            <span className="emoji">🛠️</span> 工作人員
          </button>
        </div>
      )}

      {(view === 'team-student' || view === 'team-leader') && (
        <>
          <h2 className="section-head">
            {view === 'team-student' ? '選擇你的小隊' : '選擇要管理的小隊'}
          </h2>
          <div className="choice-grid">
            {TEAMS.map((t) => (
              <button
                key={t}
                className="mc-btn mc-btn--lg"
                onClick={() =>
                  navigate(view === 'team-student' ? `/student/${t}` : `/leader/${t}`)
                }
              >
                第 {t} 隊
              </button>
            ))}
          </div>
        </>
      )}

      {view === 'group-gm' && (
        <>
          <h2 className="section-head">選擇要管理的大組</h2>
          <div className="choice-grid">
            {GROUPS.map((g) => (
              <button
                key={g}
                className="mc-btn mc-btn--lg mc-btn--diamond"
                onClick={() => navigate(`/gamemaster/${g}`)}
              >
                大組 {g}
              </button>
            ))}
          </div>
        </>
      )}

      {pwRole && (
        <PasswordModal
          title={
            pwRole === 'leader' ? '隊輔密碼' : pwRole === 'gamemaster' ? '關主密碼' : '工作人員密碼'
          }
          expected={PASSWORDS[pwRole]}
          onSuccess={onPwSuccess}
          onCancel={() => setPwRole(null)}
        />
      )}
    </Layout>
  )
}
