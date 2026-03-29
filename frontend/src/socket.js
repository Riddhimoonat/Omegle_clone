// ─────────────────────────────────────────────
// socket.js — single socket instance
// Poori app mein ek hi connection
// Yahan import karo jahan bhi chahiye
// ─────────────────────────────────────────────

import { io } from "socket.io-client";

console.log("<socket> connecting to http://localhost:9000");
const socket = io("http://localhost:9000", {
  autoConnect: true,
  reconnection: true, // disconnect hone pe retry karo
  reconnectionAttempts: 5, // 5 baar try karo
  reconnectionDelay: 1000, // 1 second baad retry
});

export default socket;
