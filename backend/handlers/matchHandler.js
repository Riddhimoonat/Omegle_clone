// ─────────────────────────────────────────────
// matchHandler.js
// Smart matching queue — sabse important file
//
// Queue mein har entry aise hai:
// { socket, stream: "DSA", joinedAt: timestamp }
//
// Priority:
// 1. Same stream → turant match
// 2. 30s wait → koi bhi le lo
// ─────────────────────────────────────────────

import { MATCH_WAIT_TIME_MS } from "../config/config.js"

// In-memory queue (single server ke liye theek hai)
// Scale karna ho → Redis use karo
const queue = []

// ── Helper: Do users ko match karo ──────────────
const matchUsers = (socketA, socketB, streamA, streamB, io) => {
  const room = `room_${socketA.id}_${socketB.id}`

  socketA.join(room)
  socketB.join(room)

  // initiator = true  → WebRTC offer banayega
  // initiator = false → WebRTC answer dega
  socketA.emit("matched", {
    room,
    partnerId: socketB.id,
    partnerStream: streamB,
    initiator: true
  })

  socketB.emit("matched", {
    room,
    partnerId: socketA.id,
    partnerStream: streamA,
    initiator: false
  })

  console.log(`✅ Matched: [${streamA}]${socketA.id} ↔ [${streamB}]${socketB.id}`)
}

// ── Helper: Queue se remove karo ────────────────
const removeFromQueue = (socketId) => {
  const index = queue.findIndex(u => u.socket.id === socketId)
  if (index !== -1) queue.splice(index, 1)
}

// ── Helper: Queue mein hai? ──────────────────────
const isInQueue = (socketId) => {
  return queue.some(u => u.socket.id === socketId)
}

// ── Main handler ─────────────────────────────────
const matchHandler = (socket, io) => {

  socket.on("find_match", ({ stream }) => {
    console.log(`🔍 ${socket.id} finding match → [${stream}]`)

    // Step 1: Same stream ka koi wait kar raha hai?
    const sameStreamIdx = queue.findIndex(
      u => u.stream === stream && u.socket.id !== socket.id
    )

    if (sameStreamIdx !== -1) {
      // ✅ Perfect match mila!
      const partner = queue[sameStreamIdx]
      queue.splice(sameStreamIdx, 1) // queue se hataao

      matchUsers(socket, partner.socket, stream, partner.stream, io)
      return
    }

    // Step 2: Queue mein daalo, wait karo
    queue.push({ socket, stream, joinedAt: Date.now() })
    socket.emit("waiting", { stream })
    console.log(`⏳ Queue: ${socket.id} [${stream}] — total waiting: ${queue.length}`)

    // Step 3: 30s baad fallback — koi bhi le lo
    setTimeout(() => {

      // Abhi bhi queue mein hai?
      if (!isInQueue(socket.id)) return

      // Koi aur bhi wait kar raha hai?
      const anyoneIdx = queue.findIndex(
        u => u.socket.id !== socket.id
      )

      if (anyoneIdx !== -1) {
        const partner = queue[anyoneIdx]

        // Dono ko queue se hataao
        queue.splice(anyoneIdx, 1)
        removeFromQueue(socket.id)

        matchUsers(socket, partner.socket, stream, partner.stream, io)
        console.log(`🔀 Fallback match: ${socket.id} ↔ ${partner.socket.id}`)
      }

    }, MATCH_WAIT_TIME_MS)
  })

  // "Next" button — current partner chhodo, naya dhundo
  socket.on("next", ({ room, stream }) => {
    socket.to(room).emit("partner_left") // partner ko batao
    socket.leave(room)

    // Apne aap wapas queue mein
    socket.emit("find_match", { stream })
    console.log(`⏭️  Next: ${socket.id}`)
  })

  // Tab band — queue se hataao
  socket.on("disconnect", () => {
    removeFromQueue(socket.id)
  })
}

export default matchHandler