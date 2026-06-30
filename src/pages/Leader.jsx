import { useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import PixelBar from '../components/PixelBar'
import RequireRole from '../components/RequireRole'
import { useToast } from '../components/Toast'
import { useDbValue } from '../hooks/useDbValue'
import {
  BASIC_TASKS,
  SPECIAL_TASKS,
  computeGongguanScore,
  isSpecialUnlocked,
} from '../utils/scoring'
import {
  setBasicTaskCompleted,
  setBasicTaskPose,
  setSpecialTaskCompleted,
} from '../utils/db'

function LeaderInner() {
  const { teamId } = useParams()
  const toast = useToast()
  const { data, loading } = useDbValue(`gongguan/team_${teamId}`)

  const score = computeGongguanScore(data)
  const basicState = data?.basicTasks || {}
  const specialState = data?.specialTasks || {}

  async function run(promise, okMsg) {
    try {
      await promise
      if (okMsg) toast(okMsg, 'success')
    } catch (err) {
      toast('寫入失敗：' + (err?.message || '請檢查連線'), 'error')
    }
  }

  return (
    <Layout title={`第 ${teamId} 隊 · 隊輔`}>
      {loading ? (
        <p className="loading">載入中…</p>
      ) : (
        <>
          <h2 className="section-head">基本任務 · 已完成 {score.basicDone} / 10</h2>
          <PixelBar done={score.basicDone} total={BASIC_TASKS.length} />
          {BASIC_TASKS.map((t) => {
            const done = !!basicState[t.id]?.completed
            const pose = !!basicState[t.id]?.pose
            return (
              <div key={t.id} className={`task-item ${done ? 'task-item--done' : ''}`}>
                <div className="task-row">
                  <div style={{ flex: 1 }}>
                    <div className="task-title">{t.title}</div>
                    <div className="task-desc">{t.description}</div>
                  </div>
                  <button
                    className={`mc-btn ${done ? 'mc-btn--danger' : ''}`}
                    onClick={() =>
                      run(
                        setBasicTaskCompleted(teamId, t.id, !done),
                        done ? '已取消完成' : '已標記完成'
                      )
                    }
                  >
                    {done ? '取消' : '完成'}
                  </button>
                </div>
                <label
                  className={`pose-toggle ${!done ? 'pose-toggle--disabled' : ''}`}
                >
                  <input
                    type="checkbox"
                    disabled={!done}
                    checked={pose}
                    onChange={(e) => run(setBasicTaskPose(teamId, t.id, e.target.checked))}
                  />
                  加分 Pose ✨
                </label>
              </div>
            )
          })}

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
              <div key={t.id} className={`task-item ${done ? 'task-item--done' : ''}`}>
                <div className="task-row">
                  <div style={{ flex: 1 }}>
                    <div className="task-title">⭐ {t.title}</div>
                    <div className="task-desc">{t.description}</div>
                  </div>
                  <button
                    className={`mc-btn ${done ? 'mc-btn--danger' : 'mc-btn--diamond'}`}
                    onClick={() =>
                      run(
                        setSpecialTaskCompleted(teamId, t.id, !done),
                        done ? '已取消完成' : '已標記完成'
                      )
                    }
                  >
                    {done ? '取消' : '完成'}
                  </button>
                </div>
              </div>
            )
          })}

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

export default function Leader() {
  return (
    <RequireRole role="leader" title="隊輔密碼">
      <LeaderInner />
    </RequireRole>
  )
}
