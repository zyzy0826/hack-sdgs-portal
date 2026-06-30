import tasksConfig from '../config/tasks.json'

export const BASIC_TASKS = tasksConfig.basicTasks
export const SPECIAL_TASKS = tasksConfig.specialTasks
export const BONUS_POSES = tasksConfig.bonusPoses

export const POINTS = { basic: 1, special: 2, pose: 1 }

// 計算某小隊在公館商圈的完成數量與分數。
// teamData 形如 { basicTasks: { task_01: {completed, pose}, ... }, specialTasks: { special_01: {completed} } }
export function computeGongguanScore(teamData) {
  const basic = teamData?.basicTasks || {}
  const special = teamData?.specialTasks || {}

  let basicDone = 0
  let poseCount = 0
  for (const t of BASIC_TASKS) {
    const s = basic[t.id]
    if (s?.completed) basicDone += 1
    if (s?.pose) poseCount += 1
  }

  let specialDone = 0
  for (const t of SPECIAL_TASKS) {
    if (isSpecialUnlocked(t, basicDone) && special[t.id]?.completed) {
      specialDone += 1
    }
  }

  const basicPts = basicDone * POINTS.basic
  const specialPts = specialDone * POINTS.special
  const posePts = poseCount * POINTS.pose

  return {
    basicDone,
    specialDone,
    poseCount,
    basicPts,
    specialPts,
    posePts,
    total: basicPts + specialPts + posePts,
  }
}

// 特殊任務是否依「已完成的基本任務數量」即時解鎖。
export function isSpecialUnlocked(specialTask, basicDoneCount) {
  return basicDoneCount >= specialTask.unlockCondition
}

// 桌遊之夜：把各大組的 round 分數歸隊聚合。
export function aggregateBoardGameScoresByTeam(groups) {
  const teamScores = {}
  for (const group of Object.values(groups || {})) {
    const members = normalizeMembers(group.members)
    for (const round of Object.values(group.rounds || {})) {
      for (const member of members) {
        const score = round.results?.[member.name] || 0
        teamScores[member.fromTeam] = (teamScores[member.fromTeam] || 0) + score
      }
    }
  }
  return teamScores
}

// members 在 Firebase 可能存成陣列或物件，統一成陣列。
export function normalizeMembers(members) {
  if (!members) return []
  if (Array.isArray(members)) return members.filter(Boolean)
  return Object.values(members)
}
