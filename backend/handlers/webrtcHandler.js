// ─────────────────────────────────────────────
// webrtcHandler.js
// WebRTC signaling — sirf forward karta hai
// Server ko content nahi samajhna, bas relay karna hai
//
// Flow:
// Caller  → offer       → server → Callee
// Callee  → answer      → server → Caller
// Both    → ice-candidate→ server → partner
// ─────────────────────────────────────────────

const webrtcHandler = (socket) => {

  // Offer: Caller → Server → Callee
  socket.on("offer", ({ targetId, offer }) => {
    socket.to(targetId).emit("offer", {
      offer,
      sender: socket.id
    })
    console.log(`📤 Offer relayed: ${socket.id} → ${targetId}`)
  })

  // Answer: Callee → Server → Caller
  socket.on("answer", ({ targetId, answer }) => {
    socket.to(targetId).emit("answer", {
      answer,
      sender: socket.id
    })
    console.log(`📥 Answer relayed: ${socket.id} → ${targetId}`)
  })

  // ICE: Both directions — network path info
  // Multiple baar aata hai — best path dhundta hai
  socket.on("ice-candidate", ({ targetId, candidate }) => {
    socket.to(targetId).emit("ice-candidate", {
      candidate,
      sender: socket.id
    })
  })
}

export default webrtcHandler