// ─────────────────────────────────────────────
// ChatSection.jsx
// Text chat — messages dikhana + send karna
// Props:
//   messages  → array of { text, isOwn, timestamp }
//   onSend    → function(text) message bhejo
//   socketId  → apni ID (own messages identify karne ke liye)
// ─────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import "../styles/ChatSection.css";

const ChatSection = ({ messages, onSend, socketId }) => {
  const [input, setInput] = useState("");
  const bottomRef = useRef(null); // auto scroll

  // Naya message aaye → neeche scroll karo
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    console.log("<ChatSection> sending:", input);
    onSend(input); // useChat → DataChannel ya Socket.io
    setInput("");
  };

  return (
    <div className="chat-section">
      {/* Messages list */}
      <div className="messages">
        {messages.length === 0 && (
          <p className="empty-chat">Say hi to your study buddy! 👋</p>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`bubble ${msg.isOwn ? "own" : "other"}`}>
            <p className="bubble-text">{msg.text}</p>
            <span className="bubble-time">
              {new Date(msg.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        ))}

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default ChatSection;
