// ─────────────────────────────────────────────
// useWebRTC.js
// Poora WebRTC lifecycle yahan hai:
// camera → peer connection → offer/answer →
// ICE exchange → video call connected
// ─────────────────────────────────────────────

import { useEffect, useRef, useState, useCallback } from "react"
import socket from "../socket"
import { ICE_SERVERS } from "../config"

const useWebRTC = ({ room, partnerId, isInitiator, isMatched }) => {

  const localVideoRef  = useRef(null)  // apna video element
  const remoteVideoRef = useRef(null)  // partner ka video element
  const localStream    = useRef(null)  // apna camera stream
  const peerConn       = useRef(null)  // RTCPeerConnection object
  const dataChannel    = useRef(null)  // P2P text channel

  const [isMuted, setIsMuted]         = useState(false)
  const [isCamOff, setIsCamOff]       = useState(false)
  const [callStatus, setCallStatus]   = useState("idle")

  // ── Camera start karo ─────────────────────────
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      localStream.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
      console.log("📷 Camera started")
    } catch (err) {
      console.error("Camera error:", err)
    }
  }, [])

  // ── Peer connection banao ─────────────────────
  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })

    // Apni tracks partner ko bhejo
    localStream.current?.getTracks().forEach(track => {
      pc.addTrack(track, localStream.current)
    })

    // Partner ki video aaye → element mein lagao
    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0]
      }
    }

    // ICE candidate mila → server ke through partner ko bhejo
    pc.onicecandidate = (event) => {
      if (event.candidate && partnerId) {
        socket.emit("ice-candidate", {
          targetId: partnerId,
          candidate: event.candidate
        })
      }
    }

    // Connection state track karo
    pc.onconnectionstatechange = () => {
      setCallStatus(pc.connectionState)
      console.log("🔗 WebRTC state:", pc.connectionState)
    }

    peerConn.current = pc
    return pc
  }, [partnerId])

  // ── DataChannel setup ─────────────────────────
  const setupDataChannel = useCallback((channel) => {
    channel.onopen    = () => console.log("✅ DataChannel open")
    channel.onclose   = () => console.log("DataChannel closed")
    dataChannel.current = channel
  }, [])

  // ── Match hone pe call start karo ─────────────
  useEffect(() => {
    if (!isMatched || !room) return

    const init = async () => {
      await startCamera()
      const pc = createPeerConnection()

      if (isInitiator) {
        // Caller: DataChannel banao + offer bhejo
        const channel = pc.createDataChannel("chat")
        setupDataChannel(channel)

        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)

        socket.emit("offer", { targetId: partnerId, offer })
        console.log("📤 Offer sent")

      } else {
        // Callee: DataChannel receive karo
        pc.ondatachannel = (event) => {
          setupDataChannel(event.channel)
        }
      }
    }

    init()
  }, [isMatched, room, isInitiator])

  // ── Socket events — offer/answer/ice ──────────
  useEffect(() => {
    socket.on("offer", async ({ offer, sender }) => {
      if (!peerConn.current) return
      await peerConn.current.setRemoteDescription(offer)
      const answer = await peerConn.current.createAnswer()
      await peerConn.current.setLocalDescription(answer)
      socket.emit("answer", { targetId: sender, answer })
      console.log("📥 Offer received, answer sent")
    })

    socket.on("answer", async ({ answer }) => {
      if (!peerConn.current) return
      await peerConn.current.setRemoteDescription(answer)
      console.log("📥 Answer received")
    })

    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        await peerConn.current?.addIceCandidate(candidate)
      } catch (err) {
        console.error("ICE error:", err)
      }
    })

    // Partner chala gaya → cleanup
    socket.on("partner_left", () => {
      peerConn.current?.close()
      peerConn.current = null
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null
      }
      setCallStatus("idle")
    })

    return () => {
      socket.off("offer")
      socket.off("answer")
      socket.off("ice-candidate")
      socket.off("partner_left")
    }
  }, [])

  // ── Controls ──────────────────────────────────
  const toggleMute = () => {
    localStream.current?.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled
    })
    setIsMuted(prev => !prev)
  }

  const toggleCamera = () => {
    localStream.current?.getVideoTracks().forEach(track => {
      track.enabled = !track.enabled
    })
    setIsCamOff(prev => !prev)
  }

  // ── Cleanup ───────────────────────────────────
  useEffect(() => {
    return () => {
      localStream.current?.getTracks().forEach(t => t.stop())
      peerConn.current?.close()
    }
  }, [])

  return {
    localVideoRef,
    remoteVideoRef,
    dataChannel,
    callStatus,
    isMuted,
    isCamOff,
    toggleMute,
    toggleCamera
  }
}

export default useWebRTC