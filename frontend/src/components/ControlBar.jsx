// ─────────────────────────────────────────────
// ControlBar.jsx
// Session controls — mute, camera, next
// Props:
//   isMuted        → mic band hai?
//   isCamOff       → camera band hai?
//   onToggleMute   → mic toggle
//   onToggleCamera → camera toggle
//   onNext         → next buddy dhundo
// ─────────────────────────────────────────────

import "../styles/ControlBar.css"

const ControlBar = ({
  isMuted,
  isCamOff,
  onToggleMute,
  onToggleCamera,
  onNext
}) => {
  return (
    <div className="control-bar">

      {/* Mic toggle */}
      <button
        className={`ctrl-btn ${isMuted ? "off" : "on"}`}
        onClick={onToggleMute}
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? "🔇" : "🎙️"}
      </button>

      {/* Camera toggle */}
      <button
        className={`ctrl-btn ${isCamOff ? "off" : "on"}`}
        onClick={onToggleCamera}
        title={isCamOff ? "Turn camera on" : "Turn camera off"}
      >
        {isCamOff ? "📵" : "📹"}
      </button>

      {/* Next buddy */}
      <button
        className="ctrl-btn next-btn"
        onClick={onNext}
        title="Find next buddy"
      >
        Next →
      </button>

    </div>
  )
}

export default ControlBar