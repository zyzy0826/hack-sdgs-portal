import { useEffect, useState } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '../firebase'

// 監聽 Firebase 內建的 .info/connected 節點以取得連線狀態。
export function useConnection() {
  const [connected, setConnected] = useState(true)

  useEffect(() => {
    const connRef = ref(db, '.info/connected')
    const unsub = onValue(connRef, (snap) => {
      setConnected(snap.val() === true)
    })
    return () => unsub()
  }, [])

  return connected
}
