// 方格式像素進度條。done / total。
export default function PixelBar({ done, total }) {
  return (
    <div className="pixel-bar" aria-label={`${done} / ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`pixel-cell ${i < done ? 'pixel-cell--done' : ''}`} />
      ))}
    </div>
  )
}
