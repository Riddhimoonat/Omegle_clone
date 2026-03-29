// ─────────────────────────────────────────────
// App.jsx — sirf components jodta hai
// Koi logic nahi, koi socket nahi
// Sab hooks mein hai
// ─────────────────────────────────────────────

import useSocket from "./hooks/useSocket";
import useMatch from "./hooks/useMatch";
import useWebRTC from "./hooks/useWebRTC";
import useChat from "./hooks/useChat";

import TopicPicker from "./components/TopicPicker";
import MatchStatus from "./components/MatchStatus";
import VideoSection from "./components/VideoSection";
import ChatSection from "./components/ChatSection";
import ControlBar from "./components/ControlBar";
import TimerBar from "./components/TimerBar";

import "./styles/App.css";

function App() {
  const { socketId, isConnected, onlineCount } = useSocket();

  const {
    status,
    room,
    partnerId,
    partnerStream,
    isInitiator,
    myStream,
    findMatch,
    findNext,
  } = useMatch();

  const {
    localVideoRef,
    remoteVideoRef,
    dataChannel,
    callStatus,
    isMuted,
    isCamOff,
    toggleMute,
    toggleCamera,
  } = useWebRTC({
    room,
    partnerId,
    isInitiator,
    isMatched: status === "matched",
  });

  const { messages, sendMessage } = useChat({
    room,
    socketId,
    dataChannel,
  });

  // ── UI: Kaunsa screen dikhana hai ─────────────
  // 1. Idle     → TopicPicker (stream choose karo)
  // 2. Waiting  → MatchStatus (dhund raha hai...)
  // 3. Matched  → Full app   (video + chat)

  return (
    <div className="app">
      {/* Online count — hamesha dikhta hai */}
      <div className="online-badge">🟢 {onlineCount} online</div>

      {/* Screen 1: Stream choose karo */}
      {status === "idle" && (
        <TopicPicker onSelect={findMatch} isConnected={isConnected} />
      )}

      {/* Screen 2: Match dhund raha hai */}
      {status === "waiting" && <MatchStatus stream={myStream} />}

      {/* Screen 3: Connected! */}
      {status === "matched" && (
        <div className="session">
          <VideoSection
            localVideoRef={localVideoRef}
            remoteVideoRef={remoteVideoRef}
            partnerStream={partnerStream}
            callStatus={callStatus}
          />

          <div className="right-panel">
            <TimerBar room={room} /> {/* ← add karo sabse upar */}
            <ChatSection
              messages={messages}
              onSend={sendMessage}
              socketId={socketId}
            />
            <ControlBar
              isMuted={isMuted}
              isCamOff={isCamOff}
              onToggleMute={toggleMute}
              onToggleCamera={toggleCamera}
              onNext={findNext}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
