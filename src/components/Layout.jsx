import { useNavigate } from 'react-router-dom'
import { useConnection } from '../hooks/useConnection'

// 共用佈局：頂部標題 + 連線狀態指示器 + 離線橫幅。
// props:
//   title       - 頁面標題
//   showBack    - 是否顯示返回首頁按鈕（預設 true）
//   fullscreen  - 全螢幕模式（排名頁），不套用 app-main padding
export default function Layout({ title, showBack = true, fullscreen = false, children }) {
  const connected = useConnection()
  const navigate = useNavigate()

  if (fullscreen) {
    return (
      <>
        {!connected && (
          <div className="offline-banner">⚠ 目前離線，資料將在恢復連線後同步</div>
        )}
        {children}
      </>
    )
  }

  return (
    <>
      <header className="app-header">
        {showBack ? (
          <button className="back-link" onClick={() => navigate('/')}>
            ← 首頁
          </button>
        ) : (
          <span />
        )}
        <h1>{title}</h1>
        <span title={connected ? '已連線' : '離線'}>
          <span className={`conn-dot ${connected ? 'conn-dot--on' : 'conn-dot--off'}`} />
        </span>
      </header>
      {!connected && (
        <div className="offline-banner">⚠ 目前離線，資料將在恢復連線後同步</div>
      )}
      <main className="app-main">{children}</main>
    </>
  )
}
