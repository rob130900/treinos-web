export default function VideoModal({ videoId, title, onClose }) {
  if (!videoId) return null;
  const src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&rel=0&modestbranding=1&playsinline=1`;
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="video-modal" onClick={(e) => e.stopPropagation()}>
        <div className="video-head">
          <div className="row" style={{ gap: 8 }}>
            <span className="vicon">▶</span>
            <strong style={{ fontSize: 15 }}>{title || 'Execução'}</strong>
          </div>
          <button className="close-x" onClick={onClose}>✕</button>
        </div>
        <div className="video-frame">
          <iframe
            src={src}
            title={title || 'video'}
            frameBorder="0"
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture; accelerometer; gyroscope"
            allowFullScreen
          />
        </div>
        <div className="video-foot">
          <span className="dim" style={{ fontSize: 12 }}>Toque no ⛶ do player para tela cheia</span>
          <a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noreferrer" className="btn-ghost" style={{ fontSize: 12 }}>Abrir no YouTube</a>
        </div>
      </div>
    </div>
  );
}
