// ─────────────────────────────────────────────
// connectionHandler.js
// Connect/disconnect ke general events
// Kitne log online hain — yeh track karta hai
// ─────────────────────────────────────────────

const connectionHandler = (socket, io) => {

  // Naye user ko uski ID confirm karo
  socket.emit("connected", {
    socketId: socket.id
  })

  // Sabko updated online count bhejo
  const emitOnlineCount = () => {
    io.emit("online_count", {
      count: io.engine.clientsCount
    })
  }

  emitOnlineCount() // jab connect ho

  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.id)
    emitOnlineCount() // jab disconnect ho
  })
}

export default connectionHandler