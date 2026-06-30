import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import RequireRole from '../components/RequireRole'
import { useToast } from '../components/Toast'
import { useDbValue } from '../hooks/useDbValue'
import { saveRound, deleteRound } from '../utils/db'
import { normalizeMembers } from '../utils/scoring'
import boardGames from '../config/boardGames.json'
import teamsConfig from '../config/teams.json'

const SCORE_OPTIONS = [
  { key: 'win', label: '🏆 贏家', points: 3, cls: 'sel-win' },
  { key: 'play', label: '✅ 參與', points: 2, cls: 'sel-play' },
  { key: 'last', label: '📉 最後', points: 1, cls: 'sel-last' },
]
const OTHER = '__other__'

function teamLabel(teams, id) {
  return teams?.[id]?.name || teamsConfig[id]?.name || id
}

// 把字串型局數鍵（round_1, round_2 ...）依數字排序。
function roundNumber(key) {
  const n = parseInt(String(key).replace('round_', ''), 10)
  return Number.isNaN(n) ? 0 : n
}

function GameMasterInner() {
  const { groupId } = useParams()
  const groupKey = `group_${groupId}`
  const toast = useToast()
  const { data: group, loading } = useDbValue(`boardGameNight/groups/${groupKey}`)
  const { data: teams } = useDbValue('teams')

  const members = useMemo(() => normalizeMembers(group?.members), [group])

  // 依 fromTeam 分群（依小隊編號排序）。
  const grouped = useMemo(() => {
    const map = {}
    for (const m of members) {
      ;(map[m.fromTeam] = map[m.fromTeam] || []).push(m)
    }
    return Object.keys(map)
      .sort()
      .map((teamId) => ({ teamId, list: map[teamId] }))
  }, [members])

  const [gameSelect, setGameSelect] = useState(boardGames[0] || '')
  const [customGame, setCustomGame] = useState('')
  // 每位學員的選擇，預設 'play'
  const [picks, setPicks] = useState({})
  const [confirming, setConfirming] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const gameName = gameSelect === OTHER ? customGame.trim() : gameSelect

  function pickOf(name) {
    return picks[name] || 'play'
  }
  function setPick(name, key) {
    setPicks((prev) => ({ ...prev, [name]: key }))
  }

  function resetForm() {
    setPicks({})
    setGameSelect(boardGames[0] || '')
    setCustomGame('')
  }

  const rounds = group?.rounds || {}
  const roundKeys = Object.keys(rounds).sort((a, b) => roundNumber(a) - roundNumber(b))
  const nextRoundNum = roundKeys.length
    ? roundNumber(roundKeys[roundKeys.length - 1]) + 1
    : 1
  const lastRoundKey = roundKeys[roundKeys.length - 1]

  async function submit() {
    if (!gameName) {
      toast('請選擇或輸入桌遊名稱', 'error')
      setConfirming(false)
      return
    }
    const results = {}
    for (const m of members) {
      const opt = SCORE_OPTIONS.find((o) => o.key === pickOf(m.name))
      results[m.name] = opt.points
    }
    setSubmitting(true)
    try {
      await saveRound(groupKey, `round_${nextRoundNum}`, {
        game: gameName,
        timestamp: Date.now(),
        results,
      })
      toast(`第 ${nextRoundNum} 局已送出`, 'success')
      resetForm()
    } catch (err) {
      toast('送出失敗：' + (err?.message || '請檢查連線'), 'error')
    } finally {
      setSubmitting(false)
      setConfirming(false)
    }
  }

  async function undo(key) {
    try {
      await deleteRound(groupKey, key)
      toast('已撤銷該局', 'info')
    } catch (err) {
      toast('撤銷失敗：' + (err?.message || '請檢查連線'), 'error')
    }
  }

  return (
    <Layout title={`大組 ${groupId} · 關主`}>
      {loading ? (
        <p className="loading">載入中…</p>
      ) : members.length === 0 ? (
        <div className="mc-panel">
          這個大組還沒有成員，請先到「大組分組設定」分配學員。
        </div>
      ) : (
        <>
          <h2 className="section-head">第 {nextRoundNum} 局 · 選擇桌遊</h2>
          <select
            className="mc-input"
            value={gameSelect}
            onChange={(e) => setGameSelect(e.target.value)}
          >
            {boardGames.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
            <option value={OTHER}>其他（手動輸入）</option>
          </select>
          {gameSelect === OTHER && (
            <input
              className="mc-input"
              style={{ marginTop: 8 }}
              placeholder="輸入桌遊名稱"
              value={customGame}
              onChange={(e) => setCustomGame(e.target.value)}
            />
          )}

          <h2 className="section-head">學員計分</h2>
          {grouped.map(({ teamId, list }) => (
            <div key={teamId} className="member-group">
              <div className="grp-title">{teamLabel(teams, teamId)}</div>
              {list.map((m) => (
                <div key={m.name} className="member-row">
                  <span className="m-name">{m.name}</span>
                  <div className="score-radios">
                    {SCORE_OPTIONS.map((o) => {
                      const sel = pickOf(m.name) === o.key
                      return (
                        <label key={o.key} className={sel ? o.cls : ''}>
                          <input
                            type="radio"
                            name={`pick-${m.name}`}
                            checked={sel}
                            onChange={() => setPick(m.name, o.key)}
                          />
                          {o.label} +{o.points}
                        </label>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}

          <button
            className="mc-btn mc-btn--lg mc-btn--diamond"
            onClick={() => setConfirming(true)}
          >
            送出本局分數
          </button>

          {roundKeys.length > 0 && (
            <>
              <h2 className="section-head">歷史紀錄（{roundKeys.length} 局）</h2>
              {roundKeys
                .slice()
                .reverse()
                .map((key) => {
                  const r = rounds[key]
                  const isLast = key === lastRoundKey
                  return (
                    <div key={key} className="round-log">
                      <div className="r-head">
                        <span>
                          第 {roundNumber(key)} 局 · {r.game}
                        </span>
                        {isLast && (
                          <button
                            className="mc-btn mc-btn--danger"
                            style={{ minHeight: 36, fontSize: 14, padding: '6px 10px' }}
                            onClick={() => undo(key)}
                          >
                            撤銷
                          </button>
                        )}
                      </div>
                      <div className="task-desc">
                        {Object.entries(r.results || {})
                          .map(([name, pts]) => `${name} +${pts}`)
                          .join('、')}
                      </div>
                    </div>
                  )
                })}
            </>
          )}

          {confirming && (
            <div className="modal-backdrop" onClick={() => setConfirming(false)}>
              <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <h2>確定送出第 {nextRoundNum} 局？</h2>
                <p>桌遊：{gameName || '（未選擇）'}</p>
                <div className="choice-grid">
                  <button
                    className="mc-btn mc-btn--ghost"
                    onClick={() => setConfirming(false)}
                  >
                    取消
                  </button>
                  <button
                    className="mc-btn mc-btn--diamond"
                    disabled={submitting}
                    onClick={submit}
                  >
                    {submitting ? '送出中…' : '確定送出'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  )
}

export default function GameMaster() {
  return (
    <RequireRole role="gamemaster" title="關主密碼">
      <GameMasterInner />
    </RequireRole>
  )
}
