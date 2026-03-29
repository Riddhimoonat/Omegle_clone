// ─────────────────────────────────────────────
// chatHandler.js
// Text messages — room ke andar relay karta hai
// WebRTC DataChannel connect hone ke baad
// directly P2P hoga, yeh sirf fallback hai
// ─────────────────────────────────────────────

const chatHandler = (socket) => {

  socket.on("chat_message", ({ room, message }) => {

    // socket.to(room) = room mein sab ko EXCEPT sender
    socket.to(room).emit("chat_message", {
      message,
      sender: socket.id,
      timestamp: new Date().toISOString()
    })
  })
}

export default chatHandler