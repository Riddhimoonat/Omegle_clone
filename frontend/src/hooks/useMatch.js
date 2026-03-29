// ─────────────────────────────────────────────
// useMatch.js
// Matching logic — stream select, find buddy,
// waiting state, matched state — sab yahan
// ─────────────────────────────────────────────

import { useEffect, useState, useCallback } from "react"
import socket from "../socket"

const useMatch = () => {
  const [status, setStatus]           = useState("idle")
  // idle | waiting | matched

  const [room, setRoom]               = useState(null)
  const [partnerId, setPartnerId]     = useState(null)
  const [partnerStream, setPartnerStream] = useState(null)
  const [isInitiator, setIsInitiator] = useState(false)
  const [myStream, setMyStream]       = useState(null)

  // Find buddy button click
  const findMatch = useCallback((stream) => {
    setMyStream(stream)
    setStatus("waiting")
    socket.emit("find_match", { stream })
  }, [])

  // Next button click
  const findNext = useCallback(() => {
    if (room) {
      socket.emit("next", { room, stream: myStream })
      setStatus("waiting")
      setRoom(null)
      setPartnerId(null)
      setPartnerStream(null)
    }
  }, [room, myStream])

  useEffect(() => {
    // Server ne match diya!
    socket.on("matched", ({ room, partnerId, partnerStream, initiator }) => {
      setRoom(room)
      setPartnerId(partnerId)
      setPartnerStream(partnerStream)
      setIsInitiator(initiator)
      setStatus("matched")
      console.log(`🎯 Matched! Room: ${room}, initiator: ${initiator}`)
    })

    // Abhi bhi wait kar rahe hain
    socket.on("waiting", ({ stream }) => {
      setStatus("waiting")
    })

    // Partner ne Next click kiya
    socket.on("partner_left", () => {
      setStatus("idle")
      setRoom(null)
      setPartnerId(null)
      setPartnerStream(null)
      console.log("👋 Partner left")
    })

    return () => {
      socket.off("matched")
      socket.off("waiting")
      socket.off("partner_left")
    }
  }, [])

  return {
    status,        // idle | waiting | matched
    room,          // current room name
    partnerId,     // partner ka socket id
    partnerStream, // partner kya padh raha hai
    isInitiator,   // WebRTC offer banayein?
    myStream,      // apna selected stream
    findMatch,     // function: match dhundo
    findNext       // function: next stranger
  }
}

export default useMatch