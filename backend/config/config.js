// ─────────────────────────────────────────────
// config.js
// Saari app-wide settings ek jagah
// Kuch change karna ho → sirf yahan aao
// ─────────────────────────────────────────────

export const PORT = process.env.PORT || 9000

export const CORS_ORIGIN = process.env.CLIENT_URL || "http://localhost:5173"

// Google ka free STUN server
// Har user ka public IP discover karta hai (NAT traversal)
export const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" }
]

// Kitna wait karein same stream match ke liye (ms)
export const MATCH_WAIT_TIME_MS = 30000

// Available study streams
export const STREAMS = ["DSA", "MERN", "ML", "AI", "DevOps", "Web3", "CP", "System Design"]