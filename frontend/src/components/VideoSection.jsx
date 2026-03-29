// ─────────────────────────────────────────────
// VideoSection.jsx
// Video area — remote (full) + local (corner)
// Props:
//   localVideoRef  → apna camera element ref
//   remoteVideoRef → partner ka video ref
//   partnerStream  → partner kya padh raha hai
//   callStatus     → "connected" | "connecting" etc
// ─────────────────────────────────────────────

import "../styles/VideoSection.css"

const VideoSection = ({
  localVideoRef,
  remoteVideoRef,
  partnerStream,
  callStatus
}) => {
  return (
    <div className="video-section">

      {/* Partner ka video — full area */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="remote-video"
      />

      {/* Jab tak video nahi aaya — placeholder */}
      {callStatus !== "connected" && (
        <div className="video-placeholder">
          <div className="spinner-small" />
          <p>Connecting to your {partnerStream} buddy...</p>
        </div>
      )}

      {/* Partner ka stream badge */}
      {partnerStream && (
        <div className="partner-badge">
          📚 {partnerStream}
        </div>
      )}

      {/* Apna video — corner mein */}
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted        // apni awaaz khud nahi sunni
        className="local-video"
      />

    </div>
  )
}

export default VideoSection