// 任務詳情 modal：顯示完整說明、圖片、分數與完成狀態。
// props:
//   task     - { title, description, detail, images, points }
//   status   - { label, done } 選填，顯示完成狀態徽章
//   onClose()

// 解析圖片路徑：完整網址 / data URI 直接用，否則套上 GitHub Pages 的 base 路徑。
function resolveImg(src) {
  if (/^(https?:|data:)/.test(src)) return src
  return import.meta.env.BASE_URL + src.replace(/^\//, '')
}

export default function TaskDetailModal({ task, status, onClose }) {
  if (!task) return null
  const images = Array.isArray(task.images) ? task.images : task.images ? [task.images] : []

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box modal-box--detail" onClick={(e) => e.stopPropagation()}>
        <h2>{task.title}</h2>

        {status && (
          <div className={`detail-badge ${status.done ? 'detail-badge--done' : ''}`}>
            {status.done ? '✅ ' : '⬜ '}
            {status.label}
          </div>
        )}

        {images.length > 0 && (
          <div className="detail-gallery">
            {images.map((src, i) => (
              <img key={i} src={resolveImg(src)} alt={`${task.title} 圖片 ${i + 1}`} />
            ))}
          </div>
        )}

        <p className="detail-text">{task.detail || task.description}</p>
        <p className="muted">完成可得 {task.points} 分</p>

        <button className="mc-btn mc-btn--lg" onClick={onClose}>
          關閉
        </button>
      </div>
    </div>
  )
}
