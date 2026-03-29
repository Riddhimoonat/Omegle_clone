// ─────────────────────────────────────────────
// TopicPicker.jsx
// Pehli screen — user apna stream choose karta hai
// Props:
//   onSelect(stream) → App ko batao kya choose kiya
//   isConnected      → server se connected hai?
// ─────────────────────────────────────────────

import { useState } from "react"
import { STREAMS } from "../config"
import "../styles/TopicPicker.css"

const TopicPicker = ({ onSelect, isConnected }) => {
  const [selected, setSelected] = useState(null)
  const [goal, setGoal]         = useState("")

  const handleStart = () => {
    if (!selected) return
    onSelect(selected)  // App.jsx → useMatch → socket.emit("find_match")
  }

  return (
    <div className="topic-picker">

      {/* Header */}
      <div className="picker-header">
        <h1>Study Buddy Roulette</h1>
        <p>Find someone studying the same thing as you</p>
        <span className={`connection-dot ${isConnected ? "green" : "red"}`}>
          {isConnected ? "● Connected" : "● Connecting..."}
        </span>
      </div>

      {/* Stream grid */}
      <div className="stream-grid">
        {STREAMS.map((stream) => (
          <button
            key={stream}
            className={`stream-btn ${selected === stream ? "active" : ""}`}
            onClick={() => setSelected(stream)}
          >
            {stream}
          </button>
        ))}
      </div>

      {/* Today's goal — optional */}
      <input
        className="goal-input"
        type="text"
        placeholder="What are you solving today? (optional)"
        value={goal}
        onChange={e => setGoal(e.target.value)}
        maxLength={80}
      />

      {/* Find button */}
      <button
        className={`find-btn ${selected ? "ready" : "disabled"}`}
        onClick={handleStart}
        disabled={!selected || !isConnected}
      >
        {selected
          ? `Find ${selected} Buddy →`
          : "Select a stream first"}
      </button>

    </div>
  )
}

export default TopicPicker