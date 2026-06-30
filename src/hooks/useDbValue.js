import { useEffect, useState } from 'react'
import { ref, onValue } from 'firebase/database'
import { db, CAMP_ROOT } from '../firebase'

// 訂閱 camp2026 底下的某個路徑，回傳 { data, loading }。
// path 為相對於 CAMP_ROOT 的路徑，例如 'gongguan/team_1'。
export function useDbValue(path) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!path) return
    setLoading(true)
    const node = ref(db, `${CAMP_ROOT}/${path}`)
    const unsub = onValue(node, (snap) => {
      setData(snap.val())
      setLoading(false)
    }, () => setLoading(false))
    return () => unsub()
  }, [path])

  return { data, loading }
}
