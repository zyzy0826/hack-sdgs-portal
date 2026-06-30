import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import RequireRole from '../components/RequireRole'
import PixelBar from '../components/PixelBar'
import { useDbValue } from '../hooks/useDbValue'
import { clearAuth } from '../utils/auth'
import teamsConfig from '../config/teams.json'
import {
  BASIC_TASKS,
  SPECIAL_TASKS,
  computeGongguanScore,
  aggregateBoardGameScoresByTeam,
} from '../utils/scoring'

const TEAM_IDS = ['team_1', 'team_2', 'team_3', 'team_4', 'team_5', 'team_6']

function teamName(teams, id) {
  return teams?.[id]?.name || teamsConfig[id]?.name || id
}

function GongguanTab() {
  const { data: gongguan, loading } = useDbValue('gongguan')
  const { data: teams } = useDbValue('teams')

  if (loading) return <p className="loading">載入中…</p>

  const cards = TEAM_IDS.map((id) => {
    const score = computeGongguanScore(gongguan?.[id])
    return { id, name: teamName(teams, id), score }
  }).sort((a, b) => b.score.total - a.score.total)

  return (
    <div className="dash-grid">
      {cards.map((c, idx) => (
        <div key={c.id} className="dash-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="rank-badge">#{idx + 1}</span>
            <span className="big-score">{c.score.total}</span>
          </div>
          <div className="team-name">{c.name}</div>
          <div className="meta">基本任務 {c.score.basicDone} / {BASIC_TASKS.length}</div>
          <PixelBar done={c.score.basicDone} total={BASIC_TASKS.length} />
          <div className="meta">
            特殊 {c.score.specialDone} / {SPECIAL_TASKS.length} · Pose {c.score.poseCount}
          </div>
        </div>
      ))}
    </div>
  )
}

function BoardGameTab() {
  const { data: groups, loading } = useDbValue('boardGameNight/groups')
  const { data: teams } = useDbValue('teams')

  if (loading) return <p className="loading">載入中…</p>

  const teamScores = aggregateBoardGameScoresByTeam(groups)
  const rows = TEAM_IDS.map((id) => ({
    id,
    name: teamName(teams, id),
    score: teamScores[id] || 0,
  })).sort((a, b) => b.score - a.score)

  const max = Math.max(1, ...rows.map((r) => r.score))

  return (
    <div className="mc-panel mc-panel--dark">
      {rows.map((r, idx) => (
        <div key={r.id} className="bar-row">
          <div className="bar-label">
            <span>
              <span className="rank-badge">#{idx + 1}</span> {r.name}
            </span>
            <span className="pixel-font" style={{ color: 'var(--gold)' }}>{r.score}</span>
          </div>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${(r.score / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function DashboardInner() {
  const [tab, setTab] = useState('gongguan')
  const navigate = useNavigate()

  return (
    <Layout title="工作人員 Dashboard">
      <div className="dash-mode">
        <div className="tabs">
          <button
            className={`tab-btn ${tab === 'gongguan' ? 'tab-btn--active' : ''}`}
            onClick={() => setTab('gongguan')}
          >
            公館商圈
          </button>
          <button
            className={`tab-btn ${tab === 'boardgame' ? 'tab-btn--active' : ''}`}
            onClick={() => setTab('boardgame')}
          >
            桌遊之夜
          </button>
        </div>

        {tab === 'gongguan' ? <GongguanTab /> : <BoardGameTab />}

        <div className="choice-grid" style={{ marginTop: 24 }}>
          <button className="mc-btn mc-btn--dirt" onClick={() => navigate('/admin/groups')}>
            🛠️ 大組分組設定
          </button>
          <button className="mc-btn mc-btn--gold" onClick={() => navigate('/staff/ranking')}>
            🏆 閉幕排名
          </button>
        </div>

        <button
          className="mc-btn mc-btn--danger"
          style={{ width: '100%', marginTop: 12 }}
          onClick={() => {
            clearAuth('admin')
            navigate('/')
          }}
        >
          🔒 登出
        </button>
      </div>
    </Layout>
  )
}

export default function StaffDashboard() {
  return (
    <RequireRole role="admin" title="工作人員密碼">
      <DashboardInner />
    </RequireRole>
  )
}
