import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:9000");

function App() {
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const pc = useRef(null);

  useEffect(() => {
    startCamera();

    socket.on("matched", async ({ id }) => {
      console.log("Matched with", id);

      pc.current = createPeer();

      const offer = await pc.current.createOffer();
      await pc.current.setLocalDescription(offer);

      socket.emit("offer", { offer });
    });

    socket.on("offer", async ({ offer }) => {
      pc.current = createPeer();

      await pc.current.setRemoteDescription(offer);

      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);

      socket.emit("answer", { answer });
    });

    socket.on("answer", async ({ answer }) => {
      await pc.current.setRemoteDescription(answer);
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      await pc.current.addIceCandidate(candidate);
    });

  }, []);

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    localVideo.current.srcObject = stream;
    window.localStream = stream;
  };

  const createPeer = () => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    window.localStream.getTracks().forEach(track => {
      peer.addTrack(track, window.localStream);
    });

    peer.ontrack = (e) => {
      remoteVideo.current.srcObject = e.streams[0];
    };

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice-candidate", {
          candidate: e.candidate
        });
      }
    };

    return peer;
  };

  return (
    <div>
      <h1>Omegle Clone</h1>

      <video ref={localVideo} autoPlay muted width="300" />
      <video ref={remoteVideo} autoPlay width="300" />
    </div>
  );
}

export default App;