import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import { useDbValue } from '../hooks/useDbValue'
import teamsConfig from '../config/teams.json'
import {
  computeGongguanScore,
  aggregateBoardGameScoresByTeam,
} from '../utils/scoring'

const TEAM_IDS = ['team_1', 'team_2', 'team_3', 'team_4', 'team_5', 'team_6']
const REVEAL_INTERVAL = 2500

const SOURCES = [
  { key: 'gongguan', label: '僅公館商圈' },
  { key: 'boardgame', label: '僅桌遊之夜' },
  { key: 'both', label: '兩者合計' },
]

export default function Ranking() {
  const { data: gongguan } = useDbValue('gongguan')
  const { data: groups } = useDbValue('boardGameNight/groups')
  const { data: teams } = useDbValue('teams')

  // stage: 'choose' | 'ready' | 'revealing'
  const [stage, setStage] = useState('choose')
  const [source, setSource] = useState(null)
  const [shown, setShown] = useState(0)

  // 依來源計算每隊總分，並排序（高 → 低）。
  const ranking = useMemo(() => {
    const bgScores = aggregateBoardGameScoresByTeam(groups)
    return TEAM_IDS.map((id) => {
      const gg = computeGongguanScore(gongguan?.[id]).total
      const bg = bgScores[id] || 0
      let total = 0
      if (source === 'gongguan') total = gg
      else if (source === 'boardgame') total = bg
      else total = gg + bg
      return {
        id,
        name: teams?.[id]?.name || teamsConfig[id]?.name || id,
        total,
      }
    }).sort((a, b) => b.total - a.total)
  }, [gongguan, groups, teams, source])

  const N = ranking.length

  // 開始揭曉後，每隔一段時間多揭曉一名（從最後一名往上）。
  useEffect(() => {
    if (stage !== 'revealing') return
    if (shown >= N) return
    const t = setTimeout(() => setShown((s) => s + 1), shown === 0 ? 300 : REVEAL_INTERVAL)
    return () => clearTimeout(t)
  }, [stage, shown, N])

  function choose(key) {
    setSource(key)
    setStage('ready')
    setShown(0)
  }
  function start() {
    setShown(0)
    setStage('revealing')
  }
  function replay() {
    setShown(0)
    setStage('revealing')
  }

  // 已揭曉的名次（從第 N 名往上補）。ranking.slice(N - shown) 取最後 shown 個。
  const revealed = ranking.slice(N - shown)

  return (
    <Layout title="閉幕排名" fullscreen>
      <div className="dash-mode ranking-stage">
        {stage === 'choose' && (
          <div className="center-col">
            <h1>🏆 閉幕排名</h1>
            <p className="muted">選擇分數來源</p>
            {SOURCES.map((s) => (
              <button
                key={s.key}
                className="mc-btn mc-btn--lg"
                style={{ maxWidth: 360 }}
                onClick={() => choose(s.key)}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        {stage === 'ready' && (
          <div className="center-col" onClick={start} style={{ cursor: 'pointer' }}>
            <h1>即將揭曉排名…</h1>
            <p className="muted">（{SOURCES.find((s) => s.key === source)?.label}）</p>
            <button className="mc-btn mc-btn--lg mc-btn--gold" style={{ maxWidth: 360 }}>
              點擊開始
            </button>
          </div>
        )}

        {stage === 'revealing' && (
          <>
            <div className="rank-reveal-list">
              {revealed.map((r, i) => {
                // revealed[0] 是目前最高的已揭曉名次。
                const rank = N - shown + i + 1
                const isFirst = rank === 1
                return (
                  <div
                    key={r.id}
                    className={`rank-reveal ${isFirst ? 'rank-reveal--first' : ''}`}
                  >
                    <span className="place">{isFirst ? '👑' : `#${rank}`}</span>
                    <span className="r-team">{r.name}</span>
                    <span className="r-score">{r.total} 分</span>
                    {isFirst && (
                      <span className="particles">
                        {Array.from({ length: 6 }).map((_, k) => (
                          <span
                            key={k}
                            style={{
                              left: `${k * 16}px`,
                              top: 0,
                              '--px': `${(k - 3) * 22}px`,
                              '--py': `${-30 - k * 6}px`,
                            }}
                          />
                        ))}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
            {shown >= N && (
              <button
                className="mc-btn mc-btn--lg mc-btn--diamond"
                style={{ maxWidth: 360, marginTop: 24 }}
                onClick={replay}
              >
                🔁 重播動畫
              </button>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
