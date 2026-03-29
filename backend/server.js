// ─────────────────────────────────────────────
// server.js — entry point
// Sirf setup karta hai
// Koi logic nahi — sab handlers mein hai
// ─────────────────────────────────────────────

import express from "express"
import http from "http"
import { Server } from "socket.io"
import { PORT, CORS_ORIGIN } from "./config/config.js"
import connectionHandler from "./handlers/connectionHandler.js"
import matchHandler      from "./handlers/matchHandler.js"
import webrtcHandler     from "./handlers/webrtcHandler.js"
import chatHandler       from "./handlers/chatHandler.js"

const app    = express()
const server = http.createServer(app)
const io     = new Server(server, {
  cors: { origin: CORS_ORIGIN }
})

app.get("/health", (_, res) => res.json({ status: "ok" }))

io.on("connection", (socket) => {
  console.log("✅ Connected:", socket.id)

  // Har handler apna kaam karta hai
  // server.js sirf delegate karta hai
  connectionHandler(socket, io)
  matchHandler(socket, io)
  webrtcHandler(socket)
  chatHandler(socket)
})

server.listen(PORT, () => {
  console.log(`🚀 Server on port http://localhost:${PORT}`)
})