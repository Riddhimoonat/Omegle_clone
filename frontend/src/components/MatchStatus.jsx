// ─────────────────────────────────────────────
// MatchStatus.jsx
// Waiting screen — match dhund raha hai
// Props:
//   stream → kaunsa stream select kiya
// ─────────────────────────────────────────────

import "../styles/MatchStatus.css"

const MatchStatus = ({ stream }) => {
  return (
    <div className="match-status">

      {/* Animated spinner */}
      <div className="spinner" />

      <h2>Finding your {stream} buddy...</h2>
      <p className="sub">
        Looking for someone studying {stream}
      </p>
      <p className="fallback-note">
        No match in 30s? We'll connect you with anyone waiting.
      </p>

    </div>
  )
}

export default MatchStatus