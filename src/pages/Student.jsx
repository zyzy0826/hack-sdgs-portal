import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import PixelBar from '../components/PixelBar'
import { useDbValue } from '../hooks/useDbValue'
import {
  BASIC_TASKS,
  SPECIAL_TASKS,
  BONUS_POSES,
  computeGongguanScore,
  isSpecialUnlocked,
} from '../utils/scoring'

export default function Student() {
  const { teamId } = useParams()
  const { data, loading } = useDbValue(`gongguan/team_${teamId}`)

  const score = computeGongguanScore(data)
  const basicState = data?.basicTasks || {}
  const specialState = data?.specialTasks || {}

  // 偵測特殊任務由鎖定 → 解鎖，觸發解鎖動畫。
  const prevUnlocked = useRef({})
  const [unlocking, setUnlocking] = useState({})
  useEffect(() => {
    const next = {}
    for (const t of SPECIAL_TASKS) {
      const nowUnlocked = isSpecialUnlocked(t, score.basicDone)
      next[t.id] = nowUnlocked
      const was = prevUnlocked.current[t.id]
      if (was === false && nowUnlocked) {
        setUnlocking((u) => ({ ...u, [t.id]: true }))
        setTimeout(() => setUnlocking((u) => ({ ...u, [t.id]: false })), 1000)
      }
    }
    prevUnlocked.current = next
  }, [score.basicDone])

  return (
    <Layout title={`第 ${teamId} 隊 · 學員`}>
      {loading ? (
        <p className="loading">載入中…</p>
      ) : (
        <>
          {/* 區塊一：基本任務 */}
          <h2 className="section-head">基本任務 · 已完成 {score.basicDone} / 10</h2>
          <PixelBar done={score.basicDone} total={BASIC_TASKS.length} />
          {BASIC_TASKS.map((t) => {
            const done = !!basicState[t.id]?.completed
            const pose = !!basicState[t.id]?.pose
            return (
              <div key={t.id} className={`task-item ${done ? 'task-item--done' : ''}`}>
                <div className="task-row">
                  <div>
                    <div className="task-title">{t.title}</div>
                    <div className="task-desc">{t.description}</div>
                    {pose && <div className="task-desc">✨ 已標記加分 Pose</div>}
                  </div>
                  <div className="task-status-icon">{done ? '✅' : '⬜'}</div>
                </div>
              </div>
            )
          })}

          {/* 區塊二：特殊任務 */}
          <h2 className="section-head">特殊任務 · {score.specialDone} / 3</h2>
          {SPECIAL_TASKS.map((t) => {
            const unlocked = isSpecialUnlocked(t, score.basicDone)
            const done = !!specialState[t.id]?.completed
            if (!unlocked) {
              return (
                <div key={t.id} className="task-item task-item--locked">
                  🔒 完成 {t.unlockCondition} 個基本任務後解鎖
                </div>
              )
            }
            return (
              <div
                key={t.id}
                className={`task-item ${done ? 'task-item--done' : ''} ${
                  unlocking[t.id] ? 'task-unlocking' : ''
                }`}
              >
                <div className="task-row">
                  <div>
                    <div className="task-title">⭐ {t.title}</div>
                    <div className="task-desc">{t.description}</div>
                    <div className="task-desc">完成可得 {t.points} 分</div>
                  </div>
                  <div className="task-status-icon">{done ? '✅' : '⬜'}</div>
                </div>
              </div>
            )
          })}

          {/* 區塊三：加分 Pose */}
          <h2 className="section-head">加分 Pose</h2>
          {BONUS_POSES.map((p) => (
            <div key={p.id} className="task-item">
              <div className="task-title">✨ {p.name}</div>
              <div className="task-desc">{p.description}</div>
            </div>
          ))}

          <div className="score-panel">
            <div className="total">總分 {score.total} 分</div>
            <div className="breakdown">
              基本 {score.basicPts} + 特殊 {score.specialPts} + Pose {score.posePts}
            </div>
          </div>
        </>
      )}
    </Layout>
  )
}
