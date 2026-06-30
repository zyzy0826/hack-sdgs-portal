import { ref, set, update, remove } from 'firebase/database'
import { db, CAMP_ROOT } from '../firebase'

const node = (path) => ref(db, `${CAMP_ROOT}/${path}`)

export function setBasicTaskCompleted(teamId, taskId, completed) {
  return set(node(`gongguan/team_${teamId}/basicTasks/${taskId}/completed`), completed)
}

export function setBasicTaskPose(teamId, taskId, pose) {
  return set(node(`gongguan/team_${teamId}/basicTasks/${taskId}/pose`), pose)
}

export function setSpecialTaskCompleted(teamId, specialId, completed) {
  return set(node(`gongguan/team_${teamId}/specialTasks/${specialId}/completed`), completed)
}

// 桌遊之夜：寫入大組成員（覆寫整個 members）。
export function saveGroupMembers(groupKey, members) {
  return set(node(`boardGameNight/groups/${groupKey}/members`), members)
}

// 寫入一局結果。roundKey 例如 'round_1'。
export function saveRound(groupKey, roundKey, roundData) {
  return set(node(`boardGameNight/groups/${groupKey}/rounds/${roundKey}`), roundData)
}

export function deleteRound(groupKey, roundKey) {
  return remove(node(`boardGameNight/groups/${groupKey}/rounds/${roundKey}`))
}
