import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import RequireRole from '../components/RequireRole'
import { useToast } from '../components/Toast'
import { useDbValue } from '../hooks/useDbValue'
import { saveGroupMembers } from '../utils/db'
import { normalizeMembers } from '../utils/scoring'
import teamsConfig from '../config/teams.json'

const GROUPS = ['A', 'B', 'C', 'D', 'E']
const TEAM_IDS = ['team_1', 'team_2', 'team_3', 'team_4', 'team_5', 'team_6']

function AdminInner() {
  const toast = useToast()
  const { data: teamsData } = useDbValue('teams')
  const { data: groups } = useDbValue('boardGameNight/groups')

  const teams = teamsData || teamsConfig
  const [editing, setEditing] = useState('A')
  // 目前編輯中大組所選的學員名字集合
  const [selected, setSelected] = useState(() => new Set())

  // 切換編輯的大組時，載入該組已存的成員作為初始勾選。
  useEffect(() => {
    const members = normalizeMembers(groups?.[`group_${editing}`]?.members)
    setSelected(new Set(members.map((m) => m.name)))
  }, [editing, groups])

  // 建立「學員名字 → 已分配到哪個大組」的對照（排除目前編輯中的組）。
  const assignedElsewhere = {}
  for (const g of GROUPS) {
    if (g === editing) continue
    const members = normalizeMembers(groups?.[`group_${g}`]?.members)
    for (const m of members) assignedElsewhere[m.name] = g
  }

  function toggle(name) {
    if (assignedElsewhere[name]) return
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  async function save() {
    const members = []
    for (const teamId of TEAM_IDS) {
      const list = teams[teamId]?.members || []
      for (const name of list) {
        if (selected.has(name)) members.push({ name, fromTeam: teamId })
      }
    }
    try {
      await saveGroupMembers(`group_${editing}`, members)
      toast(`已儲存大組 ${editing}（${members.length} 人）`, 'success')
    } catch (err) {
      toast('儲存失敗：' + (err?.message || '請檢查連線'), 'error')
    }
  }

  return (
    <Layout title="大組分組設定">
      <h2 className="section-head">選擇要編輯的大組</h2>
      <div className="choice-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {GROUPS.map((g) => (
          <button
            key={g}
            className={`mc-btn ${editing === g ? 'mc-btn--diamond' : 'mc-btn--ghost'}`}
            onClick={() => setEditing(g)}
          >
            {g}
          </button>
        ))}
      </div>

      <h2 className="section-head">學員清單 · 編輯大組 {editing}</h2>
      {TEAM_IDS.map((teamId) => (
        <div key={teamId} className="member-group">
          <div className="grp-title">{teams[teamId]?.name || teamId}</div>
          {(teams[teamId]?.members || []).map((name) => {
            const taken = assignedElsewhere[name]
            return (
              <label key={name} className={`member-pick ${taken ? 'member-pick--taken' : ''}`}>
                <input
                  type="checkbox"
                  disabled={!!taken}
                  checked={selected.has(name)}
                  onChange={() => toggle(name)}
                />
                <span>{name}</span>
                {taken && <span className="taken-tag">已在大組 {taken}</span>}
              </label>
            )
          })}
        </div>
      ))}

      <div className="score-panel">
        <button className="mc-btn mc-btn--lg" onClick={save}>
          💾 儲存大組 {editing}（已選 {selected.size} 人）
        </button>
      </div>
    </Layout>
  )
}

export default function AdminGroups() {
  return (
    <RequireRole role="admin" title="管理員密碼">
      <AdminInner />
    </RequireRole>
  )
}
