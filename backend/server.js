const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const app = express();
app.use(cors());
const PORT = 9000;

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

let waitingUser = null;

io.on("connection", (socket) => {
  console.log("a clint connected", socket.id);
  //random matching logic
  if (waitingUser) {
    socket.partner = waitingUser;
    waitingUser.partner = socket;
    socket.emit("matched", { id: waitingUser.id });
    waitingUser.emit("matched", { id: socket.id });
    waitingUser = null;
  } else {
    waitingUser = socket;
  }
  //forward webRTC signals
  socket.on("offer", (data) => {
    socket.partner?.emit("offer", {
      offer: data.offer,
      senter: socket.id,
    });
  });

  socket.on("answer", (data) => {
    socket.partner?.emit("answer", {
      answer: data.answer,
    });
  });

  socket.on("ice-candidate", (data) => {
    socket.partner?.emit("ice-candidate", {
      candidate: data.candidate,
    });
  });

  socket.on("disconnect", () => {
    console.log("disconnected", socket.id);

    if (socket.partner) {
      socket.partner.emit("partner-disconected");
      socket.partner.partner = null;
    }
    if (waitingUser === socket) waitingUser = null;
  });
});

httpServer.listen(PORT, () => {
  console.log("server started ", PORT);
});
