// ─────────────────────────────────────────────
// useSocket.js
// Socket connection state track karta hai
// socketId, isConnected — poori app mein available
// ─────────────────────────────────────────────

import { useEffect, useState } from "react"
import socket from "../socket"

const useSocket = () => {
  const [socketId, setSocketId]       = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [onlineCount, setOnlineCount] = useState(0)

  useEffect(() => {
    socket.on("connect", () => {
      setSocketId(socket.id)
      setIsConnected(true)
    })

    socket.on("disconnect", () => {
      setIsConnected(false)
    })

    socket.on("online_count", ({ count }) => {
      setOnlineCount(count)
    })

    // Cleanup — component unmount hone pe listeners hataao
    return () => {
      socket.off("connect")
      socket.off("disconnect")
      socket.off("online_count")
    }
  }, [])

  return { socketId, isConnected, onlineCount }
}

export default useSocket