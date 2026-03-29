// ─────────────────────────────────────────────
// TimerBar.jsx
// Pomodoro timer — 25 min study, 5 min break
// Dono users ke liye synced (Socket.io se)
// ─────────────────────────────────────────────

import { useState, useEffect, useRef } from "react"
import socket from "../socket"
import "../styles/TimerBar.css"

const STUDY_TIME  = 25 * 60  // 25 minutes seconds mein
const BREAK_TIME  = 5  * 60  // 5 minutes

const TimerBar = ({ room }) => {
  const [timeLeft, setTimeLeft]   = useState(STUDY_TIME)
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak]     = useState(false)
  const intervalRef               = useRef(null)

  // Timer tick
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Time up — break/study switch karo
            const nextIsBreak = !isBreak
            setIsBreak(nextIsBreak)
            return nextIsBreak ? BREAK_TIME : STUDY_TIME
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => clearInterval(intervalRef.current)
  }, [isRunning, isBreak])

  // Start/pause — dono users ke liye sync
  const toggleTimer = () => {
    const nextState = !isRunning
    setIsRunning(nextState)

    // Partner ko bhi batao
    socket.emit("timer_sync", {
      room,
      isRunning: nextState,
      timeLeft,
      isBreak
    })
  }

  // Partner ne timer change kiya
  useEffect(() => {
    socket.on("timer_sync", ({ isRunning, timeLeft, isBreak }) => {
      setIsRunning(isRunning)
      setTimeLeft(timeLeft)
      setIsBreak(isBreak)
    })

    return () => socket.off("timer_sync")
  }, [])

  // mm:ss format
  const format = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0")
    const s = (secs % 60).toString().padStart(2, "0")
    return `${m}:${s}`
  }

  return (
    <div className={`timer-bar ${isBreak ? "break" : "study"}`}>

      <span className="timer-label">
        {isBreak ? "☕ Break" : "📚 Study"}
      </span>

      <span className="timer-display">
        {format(timeLeft)}
      </span>

      <button className="timer-btn" onClick={toggleTimer}>
        {isRunning ? "⏸ Pause" : "▶ Start"}
      </button>

    </div>
  )
}

export default TimerBar