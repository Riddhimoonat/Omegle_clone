// ─────────────────────────────────────────────
// useChat.js
// Chat messages — send/receive
// DataChannel open ho → P2P
// Nahi ho → Socket.io fallback
// ─────────────────────────────────────────────

import { useEffect, useState, useCallback } from "react";
import socket from "../socket";

const useChat = ({ room, socketId, dataChannel }) => {
  const [messages, setMessages] = useState([]);

  // Message send karo
  const sendMessage = useCallback(
    (text) => {
      if (!text.trim()) return;

      const msg = {
        text,
        sender: socketId,
        isOwn: true,
        timestamp: new Date().toISOString(),
      };

      // Apne screen pe turant dikhao
      setMessages((prev) => [...prev, msg]);

      // P2P available hai? → DataChannel use karo
      if (dataChannel?.current?.readyState === "open") {
        dataChannel.current.send(JSON.stringify(msg));
      } else {
        // Fallback → Socket.io
        socket.emit("chat_message", { room, message: text });
      }
    },
    [room, socketId, dataChannel],
  );

  useEffect(() => {
    // Socket.io se message aaya (fallback)
    const socketHandler = ({ message, sender, timestamp }) => {
      console.log("<useChat> socket message received:", message, sender);
      setMessages((prev) => [
        ...prev,
        {
          text: message,
          sender,
          isOwn: false,
          timestamp,
        },
      ]);
    };

    socket.on("chat_message", socketHandler);

    // DataChannel se message aaya (P2P)
    // NOTE: dataChannel is a ref; watch dataChannel.current so we re-run
    // this effect when the underlying channel becomes available.
    if (dataChannel?.current) {
      const channel = dataChannel.current;
      channel.onmessage = (event) => {
        try {
          const received = JSON.parse(event.data);
          console.log("<useChat> datachannel message:", received);
          setMessages((prev) => [...prev, { ...received, isOwn: false }]);
        } catch (err) {
          console.error("<useChat> invalid datachannel message", err);
        }
      };
    }

    return () => {
      socket.off("chat_message", socketHandler);
      try {
        if (dataChannel?.current) dataChannel.current.onmessage = null;
      } catch (e) {
        /* ignore */
      }
    };
  }, [room, dataChannel?.current]);

  // Naya match hone pe messages clear karo
  useEffect(() => {
    setMessages([]);
  }, [room]);

  return { messages, sendMessage };
};

export default useChat;
