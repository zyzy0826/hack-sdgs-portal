import { ref, get, set, update } from 'firebase/database'
import { db, CAMP_ROOT } from '../firebase'
import tasksConfig from '../config/tasks.json'
import teamsConfig from '../config/teams.json'
import boardGames from '../config/boardGames.json'

const TEAM_IDS = ['team_1', 'team_2', 'team_3', 'team_4', 'team_5', 'team_6']

// 產生某小隊的空白任務狀態。
function blankTeamTasks() {
  const basicTasks = {}
  for (const t of tasksConfig.basicTasks) {
    basicTasks[t.id] = { completed: false, pose: false }
  }
  const specialTasks = {}
  for (const t of tasksConfig.specialTasks) {
    specialTasks[t.id] = { completed: false }
  }
  return { basicTasks, specialTasks }
}

// 首次載入時呼叫：若 config/tasks 不存在，就把 JSON 設定與空白狀態寫入。
// 只在缺資料時寫入，不會覆寫既有進度。
export async function ensureInitialized() {
  try {
    // 任務內容以 JSON 設定為準：每次初始化都覆寫 tasks / specialTasks / poses，
    // 確保舊資料被最新內容取代。boardGames 僅在缺少時補上，避免動到既有資料。
    const configSnap = await get(ref(db, `${CAMP_ROOT}/config`))
    const configUpdates = {
      tasks: tasksConfig.basicTasks,
      specialTasks: tasksConfig.specialTasks,
      poses: tasksConfig.bonusPoses,
    }
    if (!configSnap.child('boardGames').exists()) {
      configUpdates.boardGames = boardGames
    }
    await update(ref(db, `${CAMP_ROOT}/config`), configUpdates)

    const teamsSnap = await get(ref(db, `${CAMP_ROOT}/teams`))
    if (!teamsSnap.exists()) {
      await set(ref(db, `${CAMP_ROOT}/teams`), teamsConfig)
    }

    // 為每個尚未初始化的小隊建立空白任務狀態。
    const gongguanSnap = await get(ref(db, `${CAMP_ROOT}/gongguan`))
    const existing = gongguanSnap.val() || {}
    const updates = {}
    for (const id of TEAM_IDS) {
      if (!existing[id]) {
        updates[id] = blankTeamTasks()
      }
    }
    if (Object.keys(updates).length > 0) {
      await update(ref(db, `${CAMP_ROOT}/gongguan`), updates)
    }
    return { ok: true }
  } catch (err) {
    // 連線失敗（例如尚未填入真實 Firebase 設定）不應讓整個 app 崩潰。
    console.warn('[init] Firebase 初始化略過：', err?.message || err)
    return { ok: false, error: err }
  }
}
